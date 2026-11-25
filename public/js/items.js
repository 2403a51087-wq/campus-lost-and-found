/**
 * Campus Lost & Found Portal - Items Rendering, Filtering & Details Logic
 */
(function (window) {
  const Storage = window.CampusStorage;
  const Auth = window.CampusAuth;

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getStatusBadgeHTML(item) {
    const status = (item.status || 'Active').toLowerCase();
    let cls = 'badge-active-lost';
    if (status === 'resolved' || status === 'claimed') {
      cls = 'badge-resolved';
    } else if (status === 'pending') {
      cls = 'badge-pending';
    } else if (item.type === 'found') {
      cls = 'badge-active-found';
    }
    return (
      '<span class="badge ' +
      cls +
      '"><span class="badge-dot"></span>' +
      escapeHTML(item.status) +
      '</span>'
    );
  }

  function renderItemCard(item, options) {
    const opts = options || {};
    const detailsUrl = Storage.resolveUrl('pages/item-details.html') + '?id=' + encodeURIComponent(item.id);
    const imgUrl = Storage.resolveUrl(item.image || 'public/assets/images/placeholder-item.svg');
    const typeLabel = item.type === 'lost' ? 'Lost' : 'Found';
    const showClaimBtn =
      opts.showClaimButton && item.type === 'found' && item.status !== 'Claimed' && item.status !== 'Resolved';
    const showFoundBtn =
      opts.showFoundButton && item.type === 'lost' && item.status !== 'Resolved' && item.status !== 'Claimed';

    let secondBtn = '';
    if (showClaimBtn) {
      secondBtn =
        '<button type="button" class="btn btn-primary btn-sm js-claim-btn" data-id="' +
        escapeHTML(item.id) +
        '">Claim Item</button>';
    } else if (showFoundBtn) {
      secondBtn =
        '<button type="button" class="btn btn-secondary btn-sm js-found-match-btn" data-id="' +
        escapeHTML(item.id) +
        '">I Found This</button>';
    }

    return (
      '<article class="item-card">' +
      '<div class="item-card-media">' +
      '<img src="' +
      escapeHTML(imgUrl) +
      '" alt="' +
      escapeHTML(item.name) +
      '" loading="lazy">' +
      '<span class="item-card-type">' +
      typeLabel +
      '</span>' +
      '<div class="item-card-status">' +
      getStatusBadgeHTML(item) +
      '</div>' +
      '</div>' +
      '<div class="item-card-body">' +
      '<h3 class="item-card-title">' +
      escapeHTML(item.name) +
      '</h3>' +
      '<div class="item-meta">' +
      '<span class="item-meta-item"><span class="material-symbols-outlined" style="font-size:15px;">category</span> ' +
      escapeHTML(item.category) +
      '</span>' +
      '<span class="item-meta-item"><span class="material-symbols-outlined" style="font-size:15px;">location_on</span> ' +
      escapeHTML(item.location) +
      '</span>' +
      '<span class="item-meta-item tabular-nums"><span class="material-symbols-outlined" style="font-size:15px;">calendar_today</span> ' +
      escapeHTML(item.date) +
      '</span>' +
      '</div>' +
      '<p class="item-desc">' +
      escapeHTML(item.description) +
      '</p>' +
      '<div class="item-card-footer">' +
      '<a href="' +
      detailsUrl +
      '" class="btn btn-outline btn-sm">View Details</a>' +
      secondBtn +
      '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function populateSelectOptions(selectEl, values, defaultLabel) {
    if (!selectEl) return;
    const current = selectEl.value;
    selectEl.innerHTML = '<option value="all">' + defaultLabel + '</option>';
    values.forEach(function (val) {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      selectEl.appendChild(opt);
    });
    if (current) selectEl.value = current;
  }

  function matchesDateFilter(itemDateStr, filterVal) {
    if (!filterVal || filterVal === 'all') return true;
    const itemDate = new Date(itemDateStr + 'T00:00:00');
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((todayStart - itemDate) / (1000 * 60 * 60 * 24));
    if (filterVal === 'today') return diffDays <= 0;
    if (filterVal === 'week') return diffDays <= 7;
    if (filterVal === 'month') return diffDays <= 30;
    return itemDateStr === filterVal;
  }

  function initHomePage() {
    const items = Storage.getItems();
    const lostItems = items.filter(function (i) { return i.type === 'lost'; });
    const foundItems = items.filter(function (i) { return i.type === 'found'; });
    const resolvedItems = items.filter(function (i) {
      return i.status === 'Resolved' || i.status === 'Claimed';
    });
    const pendingItems = items.filter(function (i) { return i.status === 'Pending'; });

    const setStat = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };

    setStat('stat-lost-count', lostItems.length);
    setStat('stat-found-count', foundItems.length);
    setStat('stat-resolved-count', resolvedItems.length);
    setStat('stat-pending-count', pendingItems.length);

    const recentLostEl = document.getElementById('recent-lost-grid');
    if (recentLostEl) {
      recentLostEl.innerHTML = lostItems
        .slice(0, 3)
        .map(function (item) {
          return renderItemCard(item, { showFoundButton: true });
        })
        .join('');
    }

    const recentFoundEl = document.getElementById('recent-found-grid');
    if (recentFoundEl) {
      recentFoundEl.innerHTML = foundItems
        .slice(0, 3)
        .map(function (item) {
          return renderItemCard(item, { showClaimButton: true });
        })
        .join('');
    }

    const heroSearchForm = document.getElementById('hero-search-form');
    const heroSearchInput = document.getElementById('hero-search-input');
    const heroSearchType = document.getElementById('hero-search-type');
    if (heroSearchForm && heroSearchInput) {
      heroSearchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const q = heroSearchInput.value.trim();
        const target = Storage.resolveUrl(
          heroSearchType && heroSearchType.value === 'found'
            ? 'pages/found-items.html'
            : 'pages/lost-items.html'
        );
        window.location.href = q ? target + '?q=' + encodeURIComponent(q) : target;
      });
    }

    attachActionDelegation(document);
  }

  function initDirectoryPage(itemType) {
    const searchInput = document.getElementById('filter-search');
    const categorySelect = document.getElementById('filter-category');
    const locationSelect = document.getElementById('filter-location');
    const dateSelect = document.getElementById('filter-date');
    const sortSelect = document.getElementById('filter-sort');
    const gridEl = document.getElementById('items-grid');
    const countEl = document.getElementById('results-count');
    const resetBtn = document.getElementById('reset-filters-btn');

    populateSelectOptions(categorySelect, Storage.CATEGORIES, 'All Categories');
    populateSelectOptions(locationSelect, Storage.LOCATIONS, 'All Locations');

    const params = new URLSearchParams(window.location.search);
    if (params.get('q') && searchInput) {
      searchInput.value = params.get('q');
    }

    function applyFilters() {
      const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      const cat = categorySelect ? categorySelect.value : 'all';
      const loc = locationSelect ? locationSelect.value : 'all';
      const dt = dateSelect ? dateSelect.value : 'all';
      const sort = sortSelect ? sortSelect.value : 'newest';

      let list = Storage.getItems().filter(function (item) {
        return item.type === itemType;
      });

      list = list.filter(function (item) {
        const matchQ =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q);
        const matchCat = cat === 'all' || item.category === cat;
        const matchLoc = loc === 'all' || item.location === loc;
        const matchDate = matchesDateFilter(item.date, dt);
        return matchQ && matchCat && matchLoc && matchDate;
      });

      list.sort(function (a, b) {
        if (sort === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
        if (sort === 'name') return a.name.localeCompare(b.name);
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      if (countEl) {
        countEl.textContent =
          'Showing ' + list.length + ' ' + itemType + ' item' + (list.length === 1 ? '' : 's');
      }

      if (!list.length) {
        gridEl.innerHTML =
          '<div class="empty-state" style="grid-column: 1 / -1;">' +
          '<span class="material-symbols-outlined" style="font-size:40px;">search_off</span>' +
          '<h3>No matching items found</h3>' +
          '<p>Try clearing your filters or search with another keyword.</p>' +
          '</div>';
        return;
      }

      gridEl.innerHTML = list
        .map(function (item) {
          return renderItemCard(item, {
            showClaimButton: itemType === 'found',
            showFoundButton: itemType === 'lost'
          });
        })
        .join('');
    }

    [searchInput, categorySelect, locationSelect, dateSelect, sortSelect].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        if (categorySelect) categorySelect.value = 'all';
        if (locationSelect) locationSelect.value = 'all';
        if (dateSelect) dateSelect.value = 'all';
        if (sortSelect) sortSelect.value = 'newest';
        applyFilters();
      });
    }

    applyFilters();
    attachActionDelegation(gridEl);
  }

  function initItemDetailsPage() {
    const container = document.getElementById('item-details-container');
    const similarGrid = document.getElementById('similar-items-grid');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const items = Storage.getItems();
    const item = items.find(function (i) { return i.id === id; });

    if (!item) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<span class="material-symbols-outlined" style="font-size:44px;">inventory_2</span>' +
        '<h3>Item Report Not Found</h3>' +
        '<p>The requested item ID could not be located. It may have been deleted.</p>' +
        '<a href="' +
        Storage.resolveUrl('index.html') +
        '" class="btn btn-primary">Return to Homepage</a>' +
        '</div>';
      if (similarGrid) similarGrid.innerHTML = '';
      return;
    }

    const typeTitle = item.type === 'lost' ? 'Lost Item Report' : 'Found Item Report';
    const dateLabel = item.type === 'lost' ? 'Lost Date' : 'Found Date';
    const locLabel = item.type === 'lost' ? 'Lost Location' : 'Found Location';
    const isResolved = item.status === 'Resolved' || item.status === 'Claimed';
    const imgUrl = Storage.resolveUrl(item.image || 'public/assets/images/placeholder-item.svg');

    let actionButtonHtml = '';
    if (!isResolved) {
      if (item.type === 'found') {
        actionButtonHtml =
          '<button type="button" class="btn btn-primary btn-lg js-claim-btn" data-id="' +
          escapeHTML(item.id) +
          '"><span class="material-symbols-outlined">verified_user</span> Claim This Item</button>';
      } else {
        actionButtonHtml =
          '<button type="button" class="btn btn-primary btn-lg js-found-match-btn" data-id="' +
          escapeHTML(item.id) +
          '"><span class="material-symbols-outlined">check_circle</span> I Found This Item</button>';
      }
    }

    const storageRow = item.storageLocation
      ? '<div class="spec-box"><div class="spec-label">Current Storage Location</div><div class="spec-value">' +
        escapeHTML(item.storageLocation) +
        '</div></div>'
      : '';

    const spotRow = item.spotDetails
      ? '<div class="spec-box"><div class="spec-label">Specific Area</div><div class="spec-value">' +
        escapeHTML(item.spotDetails) +
        '</div></div>'
      : '';

    const backUrl = Storage.resolveUrl(
      item.type === 'lost' ? 'pages/lost-items.html' : 'pages/found-items.html'
    );

    container.innerHTML =
      '<div class="details-layout">' +
      '<div class="details-image-wrap">' +
      '<img src="' +
      escapeHTML(imgUrl) +
      '" alt="' +
      escapeHTML(item.name) +
      '">' +
      '</div>' +
      '<div class="card">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.75rem;">' +
      '<span class="badge badge-neutral tabular-nums">Ref #' +
      escapeHTML(item.id) +
      ' • ' +
      typeTitle +
      '</span>' +
      getStatusBadgeHTML(item) +
      '</div>' +
      '<h1 class="page-title" style="margin-bottom:0.6rem;">' +
      escapeHTML(item.name) +
      '</h1>' +
      '<p style="margin:0;color:var(--on-surface-variant);">' +
      escapeHTML(item.description) +
      '</p>' +
      '<div class="details-specs">' +
      '<div class="spec-box"><div class="spec-label">Category</div><div class="spec-value">' +
      escapeHTML(item.category) +
      '</div></div>' +
      '<div class="spec-box"><div class="spec-label">' +
      dateLabel +
      '</div><div class="spec-value tabular-nums">' +
      escapeHTML(item.date) +
      '</div></div>' +
      '<div class="spec-box"><div class="spec-label">' +
      locLabel +
      '</div><div class="spec-value">' +
      escapeHTML(item.location) +
      '</div></div>' +
      '<div class="spec-box"><div class="spec-label">Contact Preference</div><div class="spec-value">' +
      escapeHTML(item.contactPreference || 'Campus Email') +
      '</div></div>' +
      spotRow +
      storageRow +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center;">' +
      actionButtonHtml +
      '<a href="' +
      backUrl +
      '" class="btn btn-outline btn-lg">Back to Directory</a>' +
      '</div>' +
      '</div>' +
      '</div>';

    attachActionDelegation(container);

    if (similarGrid) {
      const similar = items
        .filter(function (other) {
          return (
            other.id !== item.id &&
            (other.category === item.category || other.location === item.location)
          );
        })
        .slice(0, 3);

      if (!similar.length) {
        similarGrid.innerHTML =
          '<p style="color:var(--text-muted);">No similar reports found at the moment.</p>';
      } else {
        similarGrid.innerHTML = similar
          .map(function (sim) {
            return renderItemCard(sim, {
              showClaimButton: sim.type === 'found',
              showFoundButton: sim.type === 'lost'
            });
          })
          .join('');
        attachActionDelegation(similarGrid);
      }
    }
  }

  function ensureActionModal() {
    let modal = document.getElementById('item-action-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'item-action-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML =
      '<div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="action-modal-title">' +
      '<div class="modal-header">' +
      '<h2 class="modal-title" id="action-modal-title">Submit Claim</h2>' +
      '<button type="button" class="icon-btn" id="close-action-modal" aria-label="Close modal">' +
      '<span class="material-symbols-outlined">close</span>' +
      '</button>' +
      '</div>' +
      '<form id="action-modal-form">' +
      '<input type="hidden" id="action-modal-item-id">' +
      '<input type="hidden" id="action-modal-mode">' +
      '<p id="action-modal-desc" style="margin:0 0 1rem;color:var(--on-surface-variant);font-size:0.9rem;"></p>' +
      '<div class="form-group" style="margin-bottom:1rem;">' +
      '<label class="form-label" for="action-modal-proof" id="action-modal-label">Verification Details <span class="required-mark">*</span></label>' +
      '<textarea id="action-modal-proof" class="form-control" required placeholder="Describe unique marks, contents, serial number, or handoff details..."></textarea>' +
      '</div>' +
      '<div style="display:flex;justify-content:flex-end;gap:0.65rem;">' +
      '<button type="button" class="btn btn-outline" id="cancel-action-modal">Cancel</button>' +
      '<button type="submit" class="btn btn-primary" id="submit-action-modal">Submit</button>' +
      '</div>' +
      '</form>' +
      '</div>';

    document.body.appendChild(modal);

    const closeModal = function () {
      modal.classList.remove('open');
    };
    modal.querySelector('#close-action-modal').addEventListener('click', closeModal);
    modal.querySelector('#cancel-action-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    modal.querySelector('#action-modal-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const user = Auth.getCurrentUser();
      if (!user) {
        const next = encodeURIComponent(window.location.href);
        window.location.href = Storage.resolveUrl('pages/login.html') + '?next=' + next;
        return;
      }

      const itemId = modal.querySelector('#action-modal-item-id').value;
      const mode = modal.querySelector('#action-modal-mode').value;
      const proof = modal.querySelector('#action-modal-proof').value.trim();
      const item = Storage.getItems().find(function (i) { return i.id === itemId; });
      if (!item || !proof) return;

      if (mode === 'claim') {
        Storage.addClaim({
          itemId: item.id,
          itemName: item.name,
          itemOwnerId: item.ownerId,
          claimantId: user.id,
          claimantName: user.name,
          claimantEmail: user.email,
          proofDetails: proof
        });
        Storage.updateItem(item.id, { status: 'Pending' });
        Storage.addNotification({
          userId: item.ownerId || user.id,
          type: 'claim_request',
          title: 'New Claim Request',
          message: user.name + ' requested to claim "' + item.name + '".',
          link: 'pages/claims.html'
        });
        if (item.ownerId !== user.id) {
          Storage.addNotification({
            userId: user.id,
            type: 'status_change',
            title: 'Claim Submitted',
            message: 'Your claim for "' + item.name + '" is pending review.',
            link: 'pages/claims.html'
          });
        }
        window.CampusApp.showToast('Claim submitted successfully!', 'success');
      } else {
        Storage.updateItem(item.id, { status: 'Pending' });
        Storage.addNotification({
          userId: item.ownerId || user.id,
          type: 'match',
          title: 'Possible Match Reported',
          message: user.name + ' reported finding "' + item.name + '": ' + proof,
          link: 'pages/item-details.html?id=' + encodeURIComponent(item.id)
        });
        if (item.ownerId !== user.id) {
          Storage.addNotification({
            userId: user.id,
            type: 'status_change',
            title: 'Found Tip Sent',
            message: 'Thank you! The owner of "' + item.name + '" has been notified.',
            link: 'pages/item-details.html?id=' + encodeURIComponent(item.id)
          });
        }
        window.CampusApp.showToast('Owner notified! Thank you for helping.', 'success');
      }

      closeModal();
      window.CampusApp.updateNavBadge();
      setTimeout(function () {
        window.location.reload();
      }, 650);
    });

    return modal;
  }

  function openActionModal(itemId, mode) {
    const user = Auth.getCurrentUser();
    if (!user) {
      window.CampusApp.showToast('Please sign in to submit a claim or match.', 'error');
      setTimeout(function () {
        const next = encodeURIComponent(window.location.href);
        window.location.href = Storage.resolveUrl('pages/login.html') + '?next=' + next;
      }, 700);
      return;
    }

    const item = Storage.getItems().find(function (i) { return i.id === itemId; });
    if (!item) return;

    const modal = ensureActionModal();
    modal.querySelector('#action-modal-item-id').value = itemId;
    modal.querySelector('#action-modal-mode').value = mode;
    modal.querySelector('#action-modal-proof').value = '';

    if (mode === 'claim') {
      modal.querySelector('#action-modal-title').textContent = 'Claim Found Item: ' + item.name;
      modal.querySelector('#action-modal-desc').textContent =
        'Provide identifying proof (serial number, stickers, contents, or distinguishing marks) to verify ownership.';
      modal.querySelector('#action-modal-label').innerHTML =
        'Ownership Proof Details <span class="required-mark">*</span>';
      modal.querySelector('#submit-action-modal').textContent = 'Submit Claim';
    } else {
      modal.querySelector('#action-modal-title').textContent = 'I Found: ' + item.name;
      modal.querySelector('#action-modal-desc').textContent =
        'Let the owner know where you found this item and which campus desk or location currently holds it.';
      modal.querySelector('#action-modal-label').innerHTML =
        'Handoff / Current Location Note <span class="required-mark">*</span>';
      modal.querySelector('#submit-action-modal').textContent = 'Notify Owner';
    }

    modal.classList.add('open');
  }

  function attachActionDelegation(root) {
    if (!root || root.dataset.delegatedActions === 'true') return;
    root.dataset.delegatedActions = 'true';
    root.addEventListener('click', function (e) {
      const claimBtn = e.target.closest('.js-claim-btn');
      if (claimBtn) {
        openActionModal(claimBtn.getAttribute('data-id'), 'claim');
        return;
      }
      const foundBtn = e.target.closest('.js-found-match-btn');
      if (foundBtn) {
        openActionModal(foundBtn.getAttribute('data-id'), 'found');
      }
    });
  }

  window.CampusItems = {
    escapeHTML: escapeHTML,
    getStatusBadgeHTML: getStatusBadgeHTML,
    renderItemCard: renderItemCard,
    populateSelectOptions: populateSelectOptions,
    initHomePage: initHomePage,
    initDirectoryPage: initDirectoryPage,
    initItemDetailsPage: initItemDetailsPage
  };
})(window);

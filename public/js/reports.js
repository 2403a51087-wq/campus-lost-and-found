/**
 * Campus Lost & Found Portal - Reports, Claims, Notifications & Profile Logic
 */
(function (window) {
  const Storage = window.CampusStorage;
  const Auth = window.CampusAuth;
  const Items = window.CampusItems;

  function readImageAsDataURL(fileInput, previewEl, callback) {
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) {
      callback('');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (evt) {
      const dataUrl = evt.target.result;
      if (previewEl) {
        previewEl.innerHTML =
          '<div class="upload-preview"><img src="' +
          dataUrl +
          '" alt="Uploaded preview"><div><strong style="font-size:0.85rem;">' +
          Items.escapeHTML(file.name) +
          '</strong><div class="form-hint">Ready to attach</div></div></div>';
      }
      callback(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function getDefaultImageForCategory(category) {
    const map = {
      'Electronics': 'assets/images/earbuds.svg',
      'ID & Cards': 'assets/images/student-id.svg',
      'Wallets & Bags': 'assets/images/backpack.svg',
      'Books & Stationery': 'assets/images/notebook.svg',
      'Accessories': 'assets/images/water-bottle.svg',
      'Keys & Other': 'assets/images/keys.svg'
    };
    return map[category] || 'assets/images/placeholder-item.svg';
  }

  function initReportForm(type) {
    const form = document.getElementById('report-item-form');
    if (!form) return;

    const catSelect = document.getElementById('item-category');
    const locSelect = document.getElementById('item-location');
    const dateInput = document.getElementById('item-date');
    const fileInput = document.getElementById('item-image');
    const previewEl = document.getElementById('image-preview-wrap');
    const uploadBox = document.getElementById('upload-dropzone');
    const alertBox = document.getElementById('form-alert-box');

    Items.populateSelectOptions(catSelect, Storage.CATEGORIES, 'Select category...');
    Items.populateSelectOptions(locSelect, Storage.LOCATIONS, 'Select campus location...');

    if (catSelect && catSelect.options[0]) catSelect.options[0].value = '';
    if (locSelect && locSelect.options[0]) locSelect.options[0].value = '';

    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    let uploadedImageData = '';
    if (uploadBox && fileInput) {
      uploadBox.addEventListener('click', function () {
        fileInput.click();
      });
      fileInput.addEventListener('change', function () {
        readImageAsDataURL(fileInput, previewEl, function (dataUrl) {
          uploadedImageData = dataUrl;
        });
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (alertBox) alertBox.innerHTML = '';

      const name = document.getElementById('item-name').value.trim();
      const category = catSelect.value;
      const date = dateInput.value;
      const location = locSelect.value;
      const spotDetails = (document.getElementById('item-spot') || {}).value || '';
      const description = document.getElementById('item-description').value.trim();
      const storageEl = document.getElementById('item-storage');
      const storageLocation = storageEl ? storageEl.value.trim() : '';
      const contactEl = form.querySelector('input[name="contactPreference"]:checked');
      const contactPreference = contactEl ? contactEl.value : 'Campus Email';

      if (!name || !category || !date || !location || !description) {
        if (alertBox) {
          alertBox.innerHTML =
            '<div class="alert alert-error">Please fill in all required fields before submitting.</div>';
        }
        return;
      }

      if (type === 'found' && !storageLocation) {
        if (alertBox) {
          alertBox.innerHTML =
            '<div class="alert alert-error">Please specify the current storage location for the found item.</div>';
        }
        return;
      }

      const currentUser = Auth.getCurrentUser();
      const owner = currentUser || {
        id: 'USR-101',
        name: 'Aarav Sharma',
        email: 'student@college.edu'
      };

      const created = Storage.addItem({
        type: type,
        name: name,
        category: category,
        date: date,
        location: location,
        spotDetails: spotDetails.trim(),
        description: description,
        storageLocation: storageLocation,
        contactPreference: contactPreference,
        image: uploadedImageData || getDefaultImageForCategory(category),
        status: 'Active',
        ownerId: owner.id,
        ownerName: owner.name,
        ownerEmail: owner.email
      });

      Storage.addNotification({
        userId: owner.id,
        type: 'status_change',
        title: (type === 'lost' ? 'Lost' : 'Found') + ' Report Published',
        message: 'Your report "' + created.name + '" (#' + created.id + ') is now live.',
        link: 'pages/item-details.html?id=' + encodeURIComponent(created.id)
      });

      if (alertBox) {
        alertBox.innerHTML =
          '<div class="alert alert-success">Report saved successfully! Redirecting to My Reports...</div>';
      }
      window.CampusApp.showToast('Report submitted successfully!', 'success');

      setTimeout(function () {
        window.location.href = Storage.resolveUrl('pages/my-reports.html');
      }, 900);
    });
  }

  function initMyReportsPage() {
    if (!Auth.requireAuth()) return;
    const user = Auth.getCurrentUser();
    const listEl = document.getElementById('my-reports-list');
    const tabsEl = document.getElementById('reports-filter-tabs');
    const editModal = document.getElementById('edit-report-modal');
    const editForm = document.getElementById('edit-report-form');

    Items.populateSelectOptions(
      document.getElementById('edit-category'),
      Storage.CATEGORIES,
      'Select category'
    );
    Items.populateSelectOptions(
      document.getElementById('edit-location'),
      Storage.LOCATIONS,
      'Select location'
    );

    let activeFilter = 'all';

    function renderReports() {
      const allMine = Storage.getItems().filter(function (i) {
        return i.ownerId === user.id;
      });

      const filtered = allMine.filter(function (i) {
        if (activeFilter === 'lost') return i.type === 'lost';
        if (activeFilter === 'found') return i.type === 'found';
        if (activeFilter === 'active') return i.status === 'Active' || i.status === 'Pending';
        if (activeFilter === 'resolved') return i.status === 'Resolved' || i.status === 'Claimed';
        return true;
      });

      if (!filtered.length) {
        listEl.innerHTML =
          '<div class="empty-state">' +
          '<span class="material-symbols-outlined" style="font-size:42px;">assignment</span>' +
          '<h3>No reports in this view</h3>' +
          '<p>Submit a lost or found item report and manage it here.</p>' +
          '<div style="display:flex;justify-content:center;gap:0.75rem;margin-top:0.75rem;">' +
          '<a href="' + Storage.resolveUrl('pages/report-lost.html') + '" class="btn btn-primary btn-sm">Report Lost Item</a>' +
          '<a href="' + Storage.resolveUrl('pages/report-found.html') + '" class="btn btn-secondary btn-sm">Report Found Item</a>' +
          '</div>' +
          '</div>';
        return;
      }

      listEl.innerHTML = filtered
        .map(function (item) {
          const isResolved = item.status === 'Resolved' || item.status === 'Claimed';
          const thumbUrl = Storage.resolveUrl(item.image || 'assets/images/placeholder-item.svg');
          const detailUrl = Storage.resolveUrl('pages/item-details.html') + '?id=' + encodeURIComponent(item.id);

          return (
            '<div class="row-card">' +
            '<div class="row-card-main">' +
            '<img class="row-thumb" src="' +
            Items.escapeHTML(thumbUrl) +
            '" alt="' +
            Items.escapeHTML(item.name) +
            '">' +
            '<div>' +
            '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.25rem;">' +
            '<span class="badge badge-neutral">' +
            (item.type === 'lost' ? 'Lost Report' : 'Found Report') +
            '</span>' +
            Items.getStatusBadgeHTML(item) +
            '<span class="form-hint tabular-nums">#' +
            Items.escapeHTML(item.id) +
            ' • ' +
            Items.escapeHTML(item.date) +
            '</span>' +
            '</div>' +
            '<h3 style="margin:0 0 0.2rem;font-size:1.05rem;">' +
            Items.escapeHTML(item.name) +
            '</h3>' +
            '<div class="form-hint">' +
            Items.escapeHTML(item.category) +
            ' • ' +
            Items.escapeHTML(item.location) +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="row-actions">' +
            '<a href="' +
            detailUrl +
            '" class="btn btn-outline btn-sm">View Details</a>' +
            '<button type="button" class="btn btn-secondary btn-sm js-edit-report" data-id="' +
            Items.escapeHTML(item.id) +
            '">Edit Report</button>' +
            (!isResolved
              ? '<button type="button" class="btn btn-success btn-sm js-resolve-report" data-id="' +
                Items.escapeHTML(item.id) +
                '">Mark as Resolved</button>'
              : '') +
            '<button type="button" class="btn btn-danger btn-sm js-delete-report" data-id="' +
            Items.escapeHTML(item.id) +
            '">Delete</button>' +
            '</div>' +
            '</div>'
          );
        })
        .join('');
    }

    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        tabsEl.querySelectorAll('.tab-btn').forEach(function (t) {
          t.classList.remove('active');
        });
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderReports();
      });
    }

    listEl.addEventListener('click', function (e) {
      const editBtn = e.target.closest('.js-edit-report');
      if (editBtn) {
        const item = Storage.getItems().find(function (i) {
          return i.id === editBtn.getAttribute('data-id');
        });
        if (!item || !editModal) return;
        document.getElementById('edit-id').value = item.id;
        document.getElementById('edit-name').value = item.name;
        document.getElementById('edit-category').value = item.category;
        document.getElementById('edit-location').value = item.location;
        document.getElementById('edit-date').value = item.date;
        document.getElementById('edit-status').value = item.status;
        document.getElementById('edit-description').value = item.description;
        editModal.classList.add('open');
        return;
      }

      const resolveBtn = e.target.closest('.js-resolve-report');
      if (resolveBtn) {
        const id = resolveBtn.getAttribute('data-id');
        const updated = Storage.updateItem(id, { status: 'Resolved' });
        if (updated) {
          Storage.addNotification({
            userId: user.id,
            type: 'status_change',
            title: 'Report Marked Resolved',
            message: '"' + updated.name + '" has been marked as Resolved.',
            link: 'pages/my-reports.html'
          });
          window.CampusApp.showToast('Report marked as Resolved.', 'success');
          window.CampusApp.updateNavBadge();
          renderReports();
        }
        return;
      }

      const deleteBtn = e.target.closest('.js-delete-report');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (window.confirm('Are you sure you want to delete this report?')) {
          Storage.deleteItem(id);
          window.CampusApp.showToast('Report deleted.', 'success');
          renderReports();
        }
      }
    });

    if (editModal && editForm) {
      const closeEdit = function () {
        editModal.classList.remove('open');
      };
      document.getElementById('close-edit-modal').addEventListener('click', closeEdit);
      document.getElementById('cancel-edit-modal').addEventListener('click', closeEdit);
      editForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        Storage.updateItem(id, {
          name: document.getElementById('edit-name').value.trim(),
          category: document.getElementById('edit-category').value,
          location: document.getElementById('edit-location').value,
          date: document.getElementById('edit-date').value,
          status: document.getElementById('edit-status').value,
          description: document.getElementById('edit-description').value.trim()
        });
        closeEdit();
        window.CampusApp.showToast('Report updated successfully.', 'success');
        renderReports();
      });
    }

    renderReports();
  }

  function initClaimsPage() {
    if (!Auth.requireAuth()) return;
    const user = Auth.getCurrentUser();
    const listEl = document.getElementById('claims-list');
    const tabsEl = document.getElementById('claims-tabs');
    const detailsModal = document.getElementById('claim-details-modal');
    let currentTab = 'all';

    function getStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'badge-approved';
      if (s === 'rejected' || s === 'cancelled') return 'badge-rejected';
      return 'badge-pending';
    }

    function renderClaims() {
      const claims = Storage.getClaims().filter(function (c) {
        const isMine = c.claimantId === user.id || c.itemOwnerId === user.id;
        if (!isMine) return false;
        if (currentTab === 'incoming') return c.itemOwnerId === user.id;
        if (currentTab === 'submitted') return c.claimantId === user.id;
        return true;
      });

      if (!claims.length) {
        listEl.innerHTML =
          '<div class="empty-state">' +
          '<span class="material-symbols-outlined" style="font-size:42px;">fact_check</span>' +
          '<h3>No claim requests found</h3>' +
          '<p>Browse found items to submit a claim, or review incoming claims for items you reported.</p>' +
          '<a href="' + Storage.resolveUrl('pages/found-items.html') + '" class="btn btn-primary btn-sm">Browse Found Items</a>' +
          '</div>';
        return;
      }

      listEl.innerHTML = claims
        .map(function (c) {
          const isOwner = c.itemOwnerId === user.id;
          const isClaimant = c.claimantId === user.id;
          const isPending = c.status === 'Pending';
          const itemUrl = Storage.resolveUrl('pages/item-details.html') + '?id=' + encodeURIComponent(c.itemId);

          return (
            '<div class="row-card">' +
            '<div style="flex:1;min-width:240px;">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.3rem;">' +
            '<span class="badge ' +
            getStatusClass(c.status) +
            '"><span class="badge-dot"></span>' +
            Items.escapeHTML(c.status) +
            '</span>' +
            '<span class="badge badge-neutral">' +
            (isOwner ? 'Incoming Review' : 'My Claim') +
            '</span>' +
            '<span class="form-hint tabular-nums">#' +
            Items.escapeHTML(c.id) +
            ' • ' +
            Items.escapeHTML(c.date) +
            '</span>' +
            '</div>' +
            '<h3 style="margin:0 0 0.25rem;font-size:1.05rem;">' +
            '<a href="' +
            itemUrl +
            '" style="color:var(--primary);">' +
            Items.escapeHTML(c.itemName) +
            '</a>' +
            '</h3>' +
            '<div class="form-hint">Claimant: ' +
            Items.escapeHTML(c.claimantName) +
            ' (' +
            Items.escapeHTML(c.claimantEmail) +
            ')</div>' +
            '</div>' +
            '<div class="row-actions">' +
            '<button type="button" class="btn btn-outline btn-sm js-view-claim" data-id="' +
            Items.escapeHTML(c.id) +
            '">View Claim Details</button>' +
            (isOwner && isPending
              ? '<button type="button" class="btn btn-success btn-sm js-approve-claim" data-id="' +
                Items.escapeHTML(c.id) +
                '">Approve</button>' +
                '<button type="button" class="btn btn-danger btn-sm js-reject-claim" data-id="' +
                Items.escapeHTML(c.id) +
                '">Reject</button>'
              : '') +
            (isClaimant && isPending
              ? '<button type="button" class="btn btn-danger btn-sm js-cancel-claim" data-id="' +
                Items.escapeHTML(c.id) +
                '">Cancel Claim</button>'
              : '') +
            '</div>' +
            '</div>'
          );
        })
        .join('');
    }

    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        tabsEl.querySelectorAll('.tab-btn').forEach(function (t) {
          t.classList.remove('active');
        });
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-tab');
        renderClaims();
      });
    }

    listEl.addEventListener('click', function (e) {
      const viewBtn = e.target.closest('.js-view-claim');
      if (viewBtn && detailsModal) {
        const claim = Storage.getClaims().find(function (c) {
          return c.id === viewBtn.getAttribute('data-id');
        });
        if (!claim) return;
        document.getElementById('claim-detail-body').innerHTML =
          '<div class="spec-box" style="margin-bottom:0.75rem;"><div class="spec-label">Item</div><div class="spec-value">' +
          Items.escapeHTML(claim.itemName) +
          ' (#' +
          Items.escapeHTML(claim.itemId) +
          ')</div></div>' +
          '<div class="spec-box" style="margin-bottom:0.75rem;"><div class="spec-label">Claimant</div><div class="spec-value">' +
          Items.escapeHTML(claim.claimantName) +
          ' • ' +
          Items.escapeHTML(claim.claimantEmail) +
          '</div></div>' +
          '<div class="spec-box" style="margin-bottom:0.75rem;"><div class="spec-label">Claim Date & Status</div><div class="spec-value">' +
          Items.escapeHTML(claim.date) +
          ' • ' +
          Items.escapeHTML(claim.status) +
          '</div></div>' +
          '<div class="spec-box"><div class="spec-label">Submitted Ownership Proof</div><div class="spec-value" style="font-weight:400;">' +
          Items.escapeHTML(claim.proofDetails) +
          '</div></div>';
        detailsModal.classList.add('open');
        return;
      }

      const approveBtn = e.target.closest('.js-approve-claim');
      if (approveBtn) {
        const claim = Storage.updateClaim(approveBtn.getAttribute('data-id'), { status: 'Approved' });
        if (claim) {
          Storage.updateItem(claim.itemId, { status: 'Claimed' });
          Storage.addNotification({
            userId: claim.claimantId,
            type: 'claim_approved',
            title: 'Claim Approved',
            message: 'Your claim for "' + claim.itemName + '" was approved! Please collect it with your Student ID.',
            link: 'pages/claims.html'
          });
          window.CampusApp.showToast('Claim approved & item marked Claimed.', 'success');
          window.CampusApp.updateNavBadge();
          renderClaims();
        }
        return;
      }

      const rejectBtn = e.target.closest('.js-reject-claim');
      if (rejectBtn) {
        const claim = Storage.updateClaim(rejectBtn.getAttribute('data-id'), { status: 'Rejected' });
        if (claim) {
          Storage.updateItem(claim.itemId, { status: 'Active' });
          Storage.addNotification({
            userId: claim.claimantId,
            type: 'claim_rejected',
            title: 'Claim Rejected',
            message: 'Your claim for "' + claim.itemName + '" could not be verified and was rejected.',
            link: 'pages/claims.html'
          });
          window.CampusApp.showToast('Claim rejected.', 'error');
          window.CampusApp.updateNavBadge();
          renderClaims();
        }
        return;
      }

      const cancelBtn = e.target.closest('.js-cancel-claim');
      if (cancelBtn) {
        const claim = Storage.updateClaim(cancelBtn.getAttribute('data-id'), { status: 'Cancelled' });
        if (claim) {
          Storage.updateItem(claim.itemId, { status: 'Active' });
          window.CampusApp.showToast('Claim cancelled.', 'success');
          renderClaims();
        }
      }
    });

    if (detailsModal) {
      const closeFn = function () { detailsModal.classList.remove('open'); };
      document.getElementById('close-claim-modal').addEventListener('click', closeFn);
      document.getElementById('done-claim-modal').addEventListener('click', closeFn);
    }

    renderClaims();
  }

  function initNotificationsPage() {
    if (!Auth.requireAuth()) return;
    const user = Auth.getCurrentUser();
    const listEl = document.getElementById('notifications-list');
    const markAllBtn = document.getElementById('mark-all-read-btn');
    const clearAllBtn = document.getElementById('clear-all-notifs-btn');

    function getIconForType(type) {
      if (type === 'claim_approved') return 'check_circle';
      if (type === 'claim_rejected') return 'cancel';
      if (type === 'claim_request') return 'assignment_ind';
      if (type === 'match') return 'auto_awesome';
      return 'notifications';
    }

    function renderNotifications() {
      const list = Storage.getNotifications(user.id);
      if (!list.length) {
        listEl.innerHTML =
          '<div class="empty-state">' +
          '<span class="material-symbols-outlined" style="font-size:42px;">notifications_off</span>' +
          '<h3>All caught up!</h3>' +
          '<p>You have no notifications right now.</p>' +
          '</div>';
        return;
      }

      listEl.innerHTML = list
        .map(function (n) {
          const openUrl = n.link ? Storage.resolveUrl(n.link) : '';
          return (
            '<div class="row-card notif-card ' +
            (n.read ? '' : 'unread') +
            '">' +
            '<div class="row-card-main">' +
            '<div class="stat-icon found" style="border-radius:9999px;"><span class="material-symbols-outlined">' +
            getIconForType(n.type) +
            '</span></div>' +
            '<div>' +
            '<div style="display:flex;align-items:center;gap:0.5rem;">' +
            '<h3 style="margin:0;font-size:1rem;">' +
            Items.escapeHTML(n.title) +
            '</h3>' +
            (!n.read ? '<span class="badge badge-active-found">New</span>' : '') +
            '</div>' +
            '<p style="margin:0.2rem 0;font-size:0.9rem;color:var(--on-surface-variant);">' +
            Items.escapeHTML(n.message) +
            '</p>' +
            '<span class="form-hint tabular-nums">' +
            Items.escapeHTML(n.date) +
            '</span>' +
            '</div>' +
            '</div>' +
            '<div class="row-actions">' +
            (openUrl
              ? '<a href="' + Items.escapeHTML(openUrl) + '" class="btn btn-outline btn-sm">Open</a>'
              : '') +
            (!n.read
              ? '<button type="button" class="btn btn-secondary btn-sm js-mark-read" data-id="' +
                Items.escapeHTML(n.id) +
                '">Mark as Read</button>'
              : '') +
            '</div>' +
            '</div>'
          );
        })
        .join('');
    }

    listEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.js-mark-read');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const all = Storage.getNotifications();
      const updated = all.map(function (n) {
        return n.id === id ? Object.assign({}, n, { read: true }) : n;
      });
      Storage.saveNotifications(updated);
      window.CampusApp.updateNavBadge();
      renderNotifications();
    });

    if (markAllBtn) {
      markAllBtn.addEventListener('click', function () {
        const all = Storage.getNotifications().map(function (n) {
          return n.userId === user.id ? Object.assign({}, n, { read: true }) : n;
        });
        Storage.saveNotifications(all);
        window.CampusApp.updateNavBadge();
        window.CampusApp.showToast('All notifications marked as read.', 'success');
        renderNotifications();
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function () {
        const remaining = Storage.getNotifications().filter(function (n) {
          return n.userId !== user.id;
        });
        Storage.saveNotifications(remaining);
        window.CampusApp.updateNavBadge();
        window.CampusApp.showToast('Notifications cleared.', 'success');
        renderNotifications();
      });
    }

    renderNotifications();
  }

  function initProfilePage() {
    if (!Auth.requireAuth()) return;

    function refreshProfileView() {
      const user = Auth.getCurrentUser();
      if (!user) return;
      document.getElementById('profile-avatar-img').src = Storage.resolveUrl(
        user.avatar || 'assets/images/avatar-student.svg'
      );
      document.getElementById('profile-name-display').textContent = user.name;
      document.getElementById('profile-email-display').textContent = user.email;
      document.getElementById('profile-id-display').textContent = user.studentId;
      document.getElementById('profile-dept-display').textContent = user.department;

      document.getElementById('edit-profile-name').value = user.name;
      document.getElementById('edit-profile-student-id').value = user.studentId;
      document.getElementById('edit-profile-dept').value = user.department;
      document.getElementById('edit-profile-phone').value = user.phone || '';

      const myReports = Storage.getItems().filter(function (i) { return i.ownerId === user.id; });
      const previewEl = document.getElementById('profile-reports-preview');
      if (previewEl) {
        if (!myReports.length) {
          previewEl.innerHTML = '<p class="form-hint">You have not submitted any reports yet.</p>';
        } else {
          previewEl.innerHTML = myReports
            .slice(0, 4)
            .map(function (r) {
              const detailUrl = Storage.resolveUrl('pages/item-details.html') + '?id=' + encodeURIComponent(r.id);
              return (
                '<div class="row-card" style="padding:0.8rem 1rem;">' +
                '<div><strong>' +
                Items.escapeHTML(r.name) +
                '</strong> <span class="form-hint">(' +
                (r.type === 'lost' ? 'Lost' : 'Found') +
                ' • ' +
                Items.escapeHTML(r.date) +
                ')</span></div>' +
                '<div style="display:flex;align-items:center;gap:0.5rem;">' +
                Items.getStatusBadgeHTML(r) +
                '<a href="' +
                detailUrl +
                '" class="btn btn-outline btn-sm">View</a>' +
                '</div>' +
                '</div>'
              );
            })
            .join('');
        }
      }
    }

    const avatarInput = document.getElementById('profile-photo-input');
    if (avatarInput) {
      avatarInput.addEventListener('change', function () {
        readImageAsDataURL(avatarInput, null, function (dataUrl) {
          if (dataUrl) {
            Auth.updateProfile({ avatar: dataUrl });
            window.CampusApp.showToast('Profile photo updated.', 'success');
            window.CampusApp.renderHeaderAndFooter();
            refreshProfileView();
          }
        });
      });
    }

    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
      editProfileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const res = Auth.updateProfile({
          name: document.getElementById('edit-profile-name').value.trim(),
          studentId: document.getElementById('edit-profile-student-id').value.trim().toUpperCase(),
          department: document.getElementById('edit-profile-dept').value.trim(),
          phone: document.getElementById('edit-profile-phone').value.trim()
        });
        if (res.ok) {
          window.CampusApp.showToast('Profile updated successfully.', 'success');
          window.CampusApp.renderHeaderAndFooter();
          refreshProfileView();
        }
      });
    }

    const pwdForm = document.getElementById('change-password-form');
    const pwdAlert = document.getElementById('password-alert-box');
    if (pwdForm) {
      pwdForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (pwdAlert) pwdAlert.innerHTML = '';
        const curr = document.getElementById('current-password').value;
        const next = document.getElementById('new-password').value;
        const conf = document.getElementById('confirm-new-password').value;

        if (next !== conf) {
          if (pwdAlert) {
            pwdAlert.innerHTML = '<div class="alert alert-error">New passwords do not match.</div>';
          }
          return;
        }
        const res = Auth.changePassword(curr, next);
        if (!res.ok) {
          if (pwdAlert) {
            pwdAlert.innerHTML = '<div class="alert alert-error">' + Items.escapeHTML(res.error) + '</div>';
          }
          return;
        }
        pwdForm.reset();
        if (pwdAlert) {
          pwdAlert.innerHTML = '<div class="alert alert-success">Password updated successfully.</div>';
        }
        window.CampusApp.showToast('Password changed.', 'success');
      });
    }

    const logoutBtn = document.getElementById('profile-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        Auth.logout();
      });
    }

    refreshProfileView();
  }

  window.CampusReports = {
    initReportForm: initReportForm,
    initMyReportsPage: initMyReportsPage,
    initClaimsPage: initClaimsPage,
    initNotificationsPage: initNotificationsPage,
    initProfilePage: initProfilePage
  };
})(window);

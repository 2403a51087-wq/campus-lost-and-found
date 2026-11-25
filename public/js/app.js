/**
 * Campus Lost & Found Portal - Shared Layout, Navigation, Toast & Page Bootstrap
 */
(function (window) {
  const Storage = window.CampusStorage;
  const Auth = window.CampusAuth;
  const Items = window.CampusItems;

  function showToast(message, type) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'success');
    toast.innerHTML =
      '<span class="material-symbols-outlined" style="font-size:18px;">' +
      (type === 'error' ? 'error' : 'check_circle') +
      '</span><span>' +
      Items.escapeHTML(message) +
      '</span>';
    container.appendChild(toast);
    setTimeout(function () {
      toast.remove();
    }, 3200);
  }

  function updateNavBadge() {
    const user = Auth.getCurrentUser();
    const badges = document.querySelectorAll('.js-nav-notif-badge');
    if (!user) {
      badges.forEach(function (b) { b.style.display = 'none'; });
      return;
    }
    const unread = Storage.getNotifications(user.id).filter(function (n) { return !n.read; }).length;
    badges.forEach(function (b) {
      if (unread > 0) {
        b.style.display = 'inline-flex';
        b.textContent = unread > 9 ? '9+' : String(unread);
      } else {
        b.style.display = 'none';
      }
    });
  }

  function renderHeaderAndFooter() {
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    const path = (window.location.pathname || '').replace(/\\/g, '/');
    const user = Auth.getCurrentUser();

    const isActive = function (target) {
      if (target === 'index.html') {
        return path === '/' || path.endsWith('/index.html') || (!path.includes('/pages/') && !path.endsWith('.html'));
      }
      return path.endsWith('/' + target);
    };

    const navItems = [
      { target: 'index.html', label: 'Home' },
      { target: 'pages/lost-items.html', label: 'Lost Items' },
      { target: 'pages/found-items.html', label: 'Found Items' },
      { target: 'pages/report-lost.html', label: 'Report Lost' },
      { target: 'pages/report-found.html', label: 'Report Found' },
      { target: 'pages/my-reports.html', label: 'My Reports' },
      { target: 'pages/claims.html', label: 'Claims' }
    ];

    if (header) {
      const linksHtml = navItems
        .map(function (item) {
          return (
            '<li><a href="' +
            Storage.resolveUrl(item.target) +
            '" class="nav-link ' +
            (isActive(item.target) ? 'active' : '') +
            '">' +
            item.label +
            '</a></li>'
          );
        })
        .join('');

      const authArea = user
        ? '<a href="' +
          Storage.resolveUrl('pages/notifications.html') +
          '" class="icon-btn" aria-label="Notifications" title="Notifications">' +
          '<span class="material-symbols-outlined">notifications</span>' +
          '<span class="notif-badge js-nav-notif-badge" style="display:none;">0</span>' +
          '</a>' +
          '<a href="' +
          Storage.resolveUrl('pages/profile.html') +
          '" class="user-pill" title="Student Profile">' +
          '<img src="' +
          Items.escapeHTML(Storage.resolveUrl(user.avatar || 'public/assets/images/avatar-student.svg')) +
          '" alt="' +
          Items.escapeHTML(user.name) +
          '">' +
          '<span class="user-pill-name">' +
          Items.escapeHTML(user.name.split(' ')[0]) +
          '</span>' +
          '</a>' +
          '<button type="button" class="btn btn-outline btn-sm js-logout-btn">Logout</button>'
        : '<a href="' +
          Storage.resolveUrl('pages/login.html') +
          '" class="btn btn-outline btn-sm">Login</a>' +
          '<a href="' +
          Storage.resolveUrl('pages/register.html') +
          '" class="btn btn-primary btn-sm">Register</a>';

      header.className = 'site-header';
      header.innerHTML =
        '<div class="container">' +
        '<nav class="navbar" aria-label="Main navigation">' +
        '<a href="' +
        Storage.resolveUrl('index.html') +
        '" class="brand">' +
        '<img src="' +
        Storage.resolveUrl('public/assets/images/logo.svg') +
        '" alt="Campus Lost & Found Logo" class="brand-logo">' +
        '<div class="brand-text">' +
        '<span class="brand-title">Campus Lost &amp; Found</span>' +
        '<span class="brand-sub">University Recovery Portal</span>' +
        '</div>' +
        '</a>' +
        '<ul class="nav-links">' +
        linksHtml +
        '</ul>' +
        '<div class="nav-actions">' +
        authArea +
        '<button type="button" class="nav-toggle" id="mobile-nav-toggle" aria-label="Toggle menu">' +
        '<span class="material-symbols-outlined">menu</span>' +
        '</button>' +
        '</div>' +
        '</nav>' +
        '</div>' +
        '<div class="mobile-menu" id="mobile-menu">' +
        '<ul class="mobile-menu-list">' +
        linksHtml +
        '<li><a href="' +
        Storage.resolveUrl('pages/notifications.html') +
        '" class="nav-link">Notifications</a></li>' +
        '<li><a href="' +
        Storage.resolveUrl('pages/profile.html') +
        '" class="nav-link">Profile</a></li>' +
        '</ul>' +
        '</div>';

      const toggleBtn = document.getElementById('mobile-nav-toggle');
      const mobileMenu = document.getElementById('mobile-menu');
      if (toggleBtn && mobileMenu) {
        toggleBtn.addEventListener('click', function () {
          mobileMenu.classList.toggle('open');
        });
      }

      header.querySelectorAll('.js-logout-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          Auth.logout();
        });
      });
    }

    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML =
        '<div class="container">' +
        '<div class="footer-grid">' +
        '<div>' +
        '<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.75rem;">' +
        '<img src="' +
        Storage.resolveUrl('public/assets/images/logo.svg') +
        '" alt="Campus Lost & Found" style="width:32px;height:32px;border-radius:8px;">' +
        '<strong style="font-size:1.05rem;">Campus Lost &amp; Found Portal</strong>' +
        '</div>' +
        '<p style="margin:0;font-size:0.86rem;color:rgba(234,241,255,0.78);max-width:360px;">' +
        'Official student-centric recovery portal connecting campus desks, security offices, and students to reunite lost belongings safely.' +
        '</p>' +
        '</div>' +
        '<div>' +
        '<h3 class="footer-heading">Quick Links</h3>' +
        '<ul class="footer-links">' +
        '<li><a href="' + Storage.resolveUrl('pages/lost-items.html') + '">Browse Lost Items</a></li>' +
        '<li><a href="' + Storage.resolveUrl('pages/found-items.html') + '">Browse Found Items</a></li>' +
        '<li><a href="' + Storage.resolveUrl('pages/report-lost.html') + '">Report a Lost Item</a></li>' +
        '<li><a href="' + Storage.resolveUrl('pages/report-found.html') + '">Report a Found Item</a></li>' +
        '</ul>' +
        '</div>' +
        '<div>' +
        '<h3 class="footer-heading">Central Security Desk</h3>' +
        '<ul class="footer-links">' +
        '<li>Main Block, Ground Floor Room 104</li>' +
        '<li>Open Daily: 8:00 AM – 9:00 PM</li>' +
        '<li>Helpdesk: +91 1800-120-4455</li>' +
        '<li>Email: lostandfound@college.edu</li>' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
        '<span>&copy; ' +
        new Date().getFullYear() +
        ' Campus Lost &amp; Found Management Portal.</span>' +
        '<span>B.Tech Software Engineering Project • Demo Mode</span>' +
        '</div>' +
        '</div>';
    }

    updateNavBadge();
  }

  function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;

    const emailInput = document.getElementById('login-email');
    const pwdInput = document.getElementById('login-password');
    const rememberInput = document.getElementById('remember-me');
    const toggleBtn = document.getElementById('toggle-login-pwd');
    const fillDemoBtn = document.getElementById('fill-demo-btn');
    const alertBox = document.getElementById('login-alert');

    if (toggleBtn && pwdInput) {
      toggleBtn.addEventListener('click', function () {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
        toggleBtn.querySelector('.material-symbols-outlined').textContent = isPwd
          ? 'visibility_off'
          : 'visibility';
      });
    }

    if (fillDemoBtn) {
      fillDemoBtn.addEventListener('click', function () {
        emailInput.value = 'student@college.edu';
        pwdInput.value = 'student123';
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alertBox.innerHTML = '';
      const res = Auth.login(emailInput.value, pwdInput.value, rememberInput.checked);
      if (!res.ok) {
        alertBox.innerHTML = '<div class="alert alert-error">' + Items.escapeHTML(res.error) + '</div>';
        return;
      }
      showToast('Welcome back, ' + res.user.name + '!', 'success');
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      setTimeout(function () {
        window.location.href = next || Storage.resolveUrl('index.html');
      }, 450);
    });
  }

  function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;

    const pwdInput = document.getElementById('reg-password');
    const confInput = document.getElementById('reg-confirm-password');
    const matchText = document.getElementById('reg-match-hint');
    const alertBox = document.getElementById('register-alert');

    function checkMatch() {
      if (!confInput.value) {
        matchText.textContent = '';
        return;
      }
      if (pwdInput.value === confInput.value) {
        matchText.textContent = 'Passwords match';
        matchText.style.color = 'var(--success-text)';
      } else {
        matchText.textContent = 'Passwords do not match';
        matchText.style.color = 'var(--danger-text)';
      }
    }

    pwdInput.addEventListener('input', checkMatch);
    confInput.addEventListener('input', checkMatch);

    document.querySelectorAll('.js-toggle-pwd').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (!target) return;
        const isPwd = target.type === 'password';
        target.type = isPwd ? 'text' : 'password';
        btn.querySelector('.material-symbols-outlined').textContent = isPwd
          ? 'visibility_off'
          : 'visibility';
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alertBox.innerHTML = '';

      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const studentId = document.getElementById('reg-student-id').value.trim();
      const department = document.getElementById('reg-department').value;
      const password = pwdInput.value;
      const confirm = confInput.value;

      if (!name || !email || !studentId || !department || !password || !confirm) {
        alertBox.innerHTML = '<div class="alert alert-error">Please fill in all required fields.</div>';
        return;
      }

      if (password.length < 6) {
        alertBox.innerHTML =
          '<div class="alert alert-error">Password must be at least 6 characters long.</div>';
        return;
      }

      if (password !== confirm) {
        alertBox.innerHTML =
          '<div class="alert alert-error">Password and confirmation do not match.</div>';
        return;
      }

      const res = Auth.register({
        name: name,
        email: email,
        studentId: studentId,
        department: department,
        password: password
      });

      if (!res.ok) {
        alertBox.innerHTML = '<div class="alert alert-error">' + Items.escapeHTML(res.error) + '</div>';
        return;
      }

      showToast('Account created! Redirecting to homepage...', 'success');
      setTimeout(function () {
        window.location.href = Storage.resolveUrl('index.html');
      }, 600);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHeaderAndFooter();

    const page = document.body.getAttribute('data-page');
    if (page === 'home') Items.initHomePage();
    if (page === 'lost-items') Items.initDirectoryPage('lost');
    if (page === 'found-items') Items.initDirectoryPage('found');
    if (page === 'item-details') Items.initItemDetailsPage();
    if (page === 'report-lost') window.CampusReports.initReportForm('lost');
    if (page === 'report-found') window.CampusReports.initReportForm('found');
    if (page === 'my-reports') window.CampusReports.initMyReportsPage();
    if (page === 'claims') window.CampusReports.initClaimsPage();
    if (page === 'notifications') window.CampusReports.initNotificationsPage();
    if (page === 'profile') window.CampusReports.initProfilePage();
    if (page === 'login') initLoginPage();
    if (page === 'register') initRegisterPage();
  });

  window.CampusApp = {
    showToast: showToast,
    updateNavBadge: updateNavBadge,
    renderHeaderAndFooter: renderHeaderAndFooter
  };
})(window);

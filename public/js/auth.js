/**
 * Campus Lost & Found Portal - Demo Authentication & Profile Management
 * Clearly documented frontend demo authentication using LocalStorage / SessionStorage.
 */
(function (window) {
  const Storage = window.CampusStorage;

  function getSessionRecord() {
    try {
      const local = localStorage.getItem(Storage.KEYS.SESSION);
      if (local) return JSON.parse(local);
      const sess = sessionStorage.getItem(Storage.KEYS.SESSION);
      if (sess) return JSON.parse(sess);
    } catch (err) {
      return null;
    }
    return null;
  }

  function saveSession(user, remember) {
    const payload = JSON.stringify({
      userId: user.id,
      email: user.email,
      loggedInAt: Date.now(),
      remember: !!remember
    });
    if (remember) {
      localStorage.setItem(Storage.KEYS.SESSION, payload);
      sessionStorage.removeItem(Storage.KEYS.SESSION);
    } else {
      sessionStorage.setItem(Storage.KEYS.SESSION, payload);
      localStorage.removeItem(Storage.KEYS.SESSION);
    }
  }

  function getCurrentUser() {
    const session = getSessionRecord();
    if (!session || !session.userId) return null;
    const users = Storage.getUsers();
    return users.find(function (u) { return u.id === session.userId; }) || null;
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  function login(email, password, remember) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = Storage.getUsers();
    const user = users.find(function (u) {
      return u.email.toLowerCase() === cleanEmail && u.password === password;
    });
    if (!user) {
      return { ok: false, error: 'Invalid college email or password.' };
    }
    saveSession(user, remember);
    return { ok: true, user: user };
  }

  function register(details) {
    const cleanEmail = (details.email || '').trim().toLowerCase();
    const users = Storage.getUsers();
    const exists = users.some(function (u) {
      return u.email.toLowerCase() === cleanEmail;
    });
    if (exists) {
      return { ok: false, error: 'An account with this college email already exists.' };
    }

    const newUser = {
      id: 'USR-' + Math.floor(200 + Math.random() * 799),
      name: details.name.trim(),
      email: cleanEmail,
      studentId: details.studentId.trim().toUpperCase(),
      department: details.department.trim(),
      phone: details.phone ? details.phone.trim() : '',
      password: details.password, // Demo only
      avatar: 'assets/images/avatar-student.svg',
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    Storage.saveUsers(users);
    saveSession(newUser, true);

    Storage.addNotification({
      userId: newUser.id,
      type: 'status_change',
      title: 'Welcome to Campus Lost & Found',
      message: 'Your student account is active. You can now submit reports and claim items.',
      link: 'pages/my-reports.html'
    });

    return { ok: true, user: newUser };
  }

  function logout() {
    localStorage.removeItem(Storage.KEYS.SESSION);
    sessionStorage.removeItem(Storage.KEYS.SESSION);
    window.location.href = Storage.resolveUrl('index.html');
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      const next = encodeURIComponent(window.location.href);
      window.location.href = Storage.resolveUrl('pages/login.html') + '?next=' + next;
      return false;
    }
    return true;
  }

  function updateProfile(patch) {
    const current = getCurrentUser();
    if (!current) return { ok: false, error: 'Not authenticated.' };
    const users = Storage.getUsers();
    const idx = users.findIndex(function (u) { return u.id === current.id; });
    if (idx === -1) return { ok: false, error: 'User not found.' };

    users[idx] = Object.assign({}, users[idx], patch);
    Storage.saveUsers(users);
    return { ok: true, user: users[idx] };
  }

  function changePassword(currentPassword, newPassword) {
    const current = getCurrentUser();
    if (!current) return { ok: false, error: 'Not authenticated.' };
    if (current.password !== currentPassword) {
      return { ok: false, error: 'Current password is incorrect.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { ok: false, error: 'New password must be at least 6 characters.' };
    }
    return updateProfile({ password: newPassword });
  }

  window.CampusAuth = {
    getCurrentUser: getCurrentUser,
    isLoggedIn: isLoggedIn,
    login: login,
    register: register,
    logout: logout,
    requireAuth: requireAuth,
    updateProfile: updateProfile,
    changePassword: changePassword
  };
})(window);

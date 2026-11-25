/**
 * Campus Lost & Found Portal - LocalStorage Data & Seed Layer
 * Note: This demo project stores data in browser LocalStorage for easy college evaluation.
 */
(function (window) {
  const KEYS = {
    INITIALIZED: 'clf_initialized_v2',
    USERS: 'clf_users',
    SESSION: 'clf_session',
    ITEMS: 'clf_items',
    CLAIMS: 'clf_claims',
    NOTIFICATIONS: 'clf_notifications'
  };

  const CATEGORIES = [
    'Electronics',
    'ID & Cards',
    'Wallets & Bags',
    'Books & Stationery',
    'Accessories',
    'Keys & Other'
  ];

  const LOCATIONS = [
    'Library',
    'Canteen',
    'Main Block',
    'Electrical Department',
    'Computer Lab',
    'Sports Ground',
    'Auditorium',
    'Parking Area'
  ];

  function isSubPage() {
    const p = (window.location && window.location.pathname) || '';
    return /\/pages\/[^/]+$/i.test(p.replace(/\\/g, '/'));
  }

  function resolveUrl(relPath) {
    if (!relPath) return '';
    if (/^(https?:|data:|blob:|mailto:|tel:|#)/i.test(relPath)) {
      return relPath;
    }
    const clean = relPath.replace(/^\/+/, '');
    const prefix = isSubPage() ? '../' : './';
    return prefix + clean;
  }

  function isoDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  function createSeedUsers() {
    return [
      {
        id: 'USR-101',
        name: 'Aarav Sharma',
        email: 'student@college.edu',
        studentId: 'BT2024CS041',
        department: 'Computer Science & Engineering',
        phone: '+91 98765 43210',
        password: 'student123', // Demo only: never store plain-text passwords in production
        avatar: 'assets/images/avatar-student.svg',
        createdAt: isoDaysAgo(45)
      },
      {
        id: 'USR-102',
        name: 'Priya Nair',
        email: 'priya.nair@college.edu',
        studentId: 'BT2024EE019',
        department: 'Electrical Engineering',
        phone: '+91 98220 11456',
        password: 'password123',
        avatar: 'assets/images/avatar-student.svg',
        createdAt: isoDaysAgo(30)
      }
    ];
  }

  function createSeedItems() {
    return [
      {
        id: 'ITM-1001',
        type: 'lost',
        name: 'Black Wallet',
        category: 'Wallets & Bags',
        location: 'Canteen',
        spotDetails: 'Near the beverage counter table #6',
        date: isoDaysAgo(0),
        status: 'Active',
        description: 'Black leather bifold wallet containing metro card, library slip, and hostel room key.',
        image: 'assets/images/wallet.svg',
        contactPreference: 'Campus Email',
        storageLocation: '',
        ownerId: 'USR-101',
        ownerName: 'Aarav Sharma',
        ownerEmail: 'student@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 3
      },
      {
        id: 'ITM-1002',
        type: 'lost',
        name: 'Wireless Earbuds',
        category: 'Electronics',
        location: 'Library',
        spotDetails: '2nd Floor Quiet Reading Zone, Desk 18',
        date: isoDaysAgo(1),
        status: 'Active',
        description: 'White wireless earbuds in charging case with a small blue university sticker on the back.',
        image: 'assets/images/earbuds.svg',
        contactPreference: 'In-App Notification',
        storageLocation: '',
        ownerId: 'USR-101',
        ownerName: 'Aarav Sharma',
        ownerEmail: 'student@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 22
      },
      {
        id: 'ITM-1003',
        type: 'lost',
        name: 'Laptop Charger (65W USB-C)',
        category: 'Electronics',
        location: 'Auditorium',
        spotDetails: 'Row F, near right aisle power socket',
        date: isoDaysAgo(2),
        status: 'Pending',
        description: 'Space grey 65W Type-C laptop adapter with yellow tape wrapped near the plug connector.',
        image: 'assets/images/laptop-charger.svg',
        contactPreference: 'Phone / SMS',
        storageLocation: '',
        ownerId: 'USR-102',
        ownerName: 'Priya Nair',
        ownerEmail: 'priya.nair@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 44
      },
      {
        id: 'ITM-1004',
        type: 'lost',
        name: 'Backpack (Navy Blue)',
        category: 'Wallets & Bags',
        location: 'Sports Ground',
        spotDetails: 'East side bleachers near basketball court',
        date: isoDaysAgo(3),
        status: 'Active',
        description: 'Navy blue college backpack with two zip compartments, contains lab manual and water flask.',
        image: 'assets/images/backpack.svg',
        contactPreference: 'Campus Email',
        storageLocation: '',
        ownerId: 'USR-102',
        ownerName: 'Priya Nair',
        ownerEmail: 'priya.nair@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 70
      },
      {
        id: 'ITM-1005',
        type: 'lost',
        name: 'Student ID Card',
        category: 'ID & Cards',
        location: 'Computer Lab',
        spotDetails: 'CS Lab 2, Workstation #14',
        date: isoDaysAgo(5),
        status: 'Resolved',
        description: 'B.Tech Computer Science student ID card on a royal blue university lanyard.',
        image: 'assets/images/student-id.svg',
        contactPreference: 'Campus Email',
        storageLocation: '',
        ownerId: 'USR-101',
        ownerName: 'Aarav Sharma',
        ownerEmail: 'student@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 115
      },
      {
        id: 'ITM-1006',
        type: 'lost',
        name: 'Hostel & Bike Keychain',
        category: 'Keys & Other',
        location: 'Parking Area',
        spotDetails: 'Two-wheeler shed lane B',
        date: isoDaysAgo(4),
        status: 'Active',
        description: 'Set of two silver keys with a black campus tag and metal carabiner.',
        image: 'assets/images/keys.svg',
        contactPreference: 'Phone / SMS',
        storageLocation: '',
        ownerId: 'USR-102',
        ownerName: 'Priya Nair',
        ownerEmail: 'priya.nair@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 92
      },
      {
        id: 'ITM-1007',
        type: 'found',
        name: 'Blue Water Bottle (32oz)',
        category: 'Accessories',
        location: 'Canteen',
        spotDetails: 'Main dining table near entrance',
        date: isoDaysAgo(0),
        status: 'Pending',
        description: 'Matte blue insulated stainless steel bottle with minor dent near the bottom rim.',
        image: 'assets/images/water-bottle.svg',
        contactPreference: 'In-App Notification',
        storageLocation: 'Student Union Info Desk (Locker #12)',
        ownerId: 'USR-101',
        ownerName: 'Aarav Sharma',
        ownerEmail: 'student@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 5
      },
      {
        id: 'ITM-1008',
        type: 'found',
        name: 'Scientific Calculator (TI-84)',
        category: 'Electronics',
        location: 'Electrical Department',
        spotDetails: 'Room EE-204 lecture bench',
        date: isoDaysAgo(1),
        status: 'Pending',
        description: 'Black graphing calculator with protective slide cover. Owner initials written inside battery lid.',
        image: 'assets/images/calculator.svg',
        contactPreference: 'Campus Email',
        storageLocation: 'Electrical Dept. Office Desk',
        ownerId: 'USR-102',
        ownerName: 'Priya Nair',
        ownerEmail: 'priya.nair@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 26
      },
      {
        id: 'ITM-1009',
        type: 'found',
        name: 'Smartwatch (Black Strap)',
        category: 'Electronics',
        location: 'Sports Ground',
        spotDetails: 'Gymnasium locker bench #4',
        date: isoDaysAgo(2),
        status: 'Active',
        description: 'Digital fitness smartwatch with matte black silicone band left after evening practice.',
        image: 'assets/images/smartwatch.svg',
        contactPreference: 'In-App Notification',
        storageLocation: 'Central Security Office (Room 104)',
        ownerId: 'USR-101',
        ownerName: 'Aarav Sharma',
        ownerEmail: 'student@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 50
      },
      {
        id: 'ITM-1010',
        type: 'found',
        name: 'Spiral Engineering Notebook',
        category: 'Books & Stationery',
        location: 'Electrical Department',
        spotDetails: 'Circuit Analysis Lab Bench #3',
        date: isoDaysAgo(3),
        status: 'Active',
        description: 'Blue hardcover spiral notebook with handwritten Signals & Systems notes and sticky tabs.',
        image: 'assets/images/notebook.svg',
        contactPreference: 'Campus Email',
        storageLocation: 'Library Help Desk (Level 1)',
        ownerId: 'USR-102',
        ownerName: 'Priya Nair',
        ownerEmail: 'priya.nair@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 75
      },
      {
        id: 'ITM-1011',
        type: 'found',
        name: 'Compact Navy Umbrella',
        category: 'Accessories',
        location: 'Main Block',
        spotDetails: 'Ground floor reception corridor',
        date: isoDaysAgo(4),
        status: 'Active',
        description: 'Foldable dark navy umbrella with curved grey handle left near notice board.',
        image: 'assets/images/umbrella.svg',
        contactPreference: 'In-App Notification',
        storageLocation: 'Main Block Security Desk',
        ownerId: 'USR-102',
        ownerName: 'Priya Nair',
        ownerEmail: 'priya.nair@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 96
      },
      {
        id: 'ITM-1012',
        type: 'found',
        name: 'Student ID Card (ECE Dept)',
        category: 'ID & Cards',
        location: 'Library',
        spotDetails: '1st Floor Photocopier Counter',
        date: isoDaysAgo(6),
        status: 'Claimed',
        description: 'Laminated student badge handed over to library reception.',
        image: 'assets/images/student-id.svg',
        contactPreference: 'Campus Email',
        storageLocation: 'Library Circulation Desk',
        ownerId: 'USR-101',
        ownerName: 'Aarav Sharma',
        ownerEmail: 'student@college.edu',
        createdAt: Date.now() - 1000 * 60 * 60 * 140
      }
    ];
  }

  function createSeedClaims() {
    return [
      {
        id: 'CLM-501',
        itemId: 'ITM-1008',
        itemName: 'Scientific Calculator (TI-84)',
        itemOwnerId: 'USR-102',
        claimantId: 'USR-101',
        claimantName: 'Aarav Sharma',
        claimantEmail: 'student@college.edu',
        proofDetails: 'My initials "A.S." are written in blue marker inside the battery cover and there is a small scratch on the back.',
        date: isoDaysAgo(1),
        status: 'Pending',
        createdAt: Date.now() - 1000 * 60 * 60 * 14
      },
      {
        id: 'CLM-502',
        itemId: 'ITM-1007',
        itemName: 'Blue Water Bottle (32oz)',
        itemOwnerId: 'USR-101',
        claimantId: 'USR-102',
        claimantName: 'Priya Nair',
        claimantEmail: 'priya.nair@college.edu',
        proofDetails: 'It has a white mountain sticker near the bottom and a black carabiner loop attached to the cap.',
        date: isoDaysAgo(0),
        status: 'Pending',
        createdAt: Date.now() - 1000 * 60 * 60 * 4
      },
      {
        id: 'CLM-503',
        itemId: 'ITM-1012',
        itemName: 'Student ID Card (ECE Dept)',
        itemOwnerId: 'USR-101',
        claimantId: 'USR-102',
        claimantName: 'Priya Nair',
        claimantEmail: 'priya.nair@college.edu',
        proofDetails: 'Verified Student ID card number at Library Circulation Desk.',
        date: isoDaysAgo(5),
        status: 'Approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 120
      }
    ];
  }

  function createSeedNotifications() {
    return [
      {
        id: 'NTF-901',
        userId: 'USR-101',
        type: 'claim_request',
        title: 'New Claim Request Received',
        message: 'Priya Nair submitted a claim for "Blue Water Bottle (32oz)" you reported found.',
        link: 'pages/claims.html',
        date: isoDaysAgo(0),
        read: false,
        createdAt: Date.now() - 1000 * 60 * 60 * 4
      },
      {
        id: 'NTF-902',
        userId: 'USR-101',
        type: 'match',
        title: 'Potential Matching Item Found',
        message: 'A recently found item near Library matches your "Wireless Earbuds" report.',
        link: 'pages/found-items.html',
        date: isoDaysAgo(1),
        read: false,
        createdAt: Date.now() - 1000 * 60 * 60 * 18
      },
      {
        id: 'NTF-903',
        userId: 'USR-101',
        type: 'claim_approved',
        title: 'Claim Approved',
        message: 'Claim #CLM-503 for "Student ID Card (ECE Dept)" was approved and marked Claimed.',
        link: 'pages/claims.html',
        date: isoDaysAgo(2),
        read: true,
        createdAt: Date.now() - 1000 * 60 * 60 * 48
      },
      {
        id: 'NTF-904',
        userId: 'USR-101',
        type: 'status_change',
        title: 'Report Status Updated',
        message: 'Your lost report "Student ID Card" (#ITM-1005) was marked as Resolved.',
        link: 'pages/my-reports.html',
        date: isoDaysAgo(4),
        read: true,
        createdAt: Date.now() - 1000 * 60 * 60 * 96
      }
    ];
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function initStorage() {
    if (!localStorage.getItem(KEYS.INITIALIZED)) {
      writeJSON(KEYS.USERS, createSeedUsers());
      writeJSON(KEYS.ITEMS, createSeedItems());
      writeJSON(KEYS.CLAIMS, createSeedClaims());
      writeJSON(KEYS.NOTIFICATIONS, createSeedNotifications());
      localStorage.setItem(KEYS.INITIALIZED, 'true');
    }
  }

  function generateId(prefix) {
    return prefix + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  initStorage();

  window.CampusStorage = {
    KEYS: KEYS,
    CATEGORIES: CATEGORIES,
    LOCATIONS: LOCATIONS,
    isSubPage: isSubPage,
    resolveUrl: resolveUrl,
    init: initStorage,
    getUsers: function () {
      return readJSON(KEYS.USERS, []);
    },
    saveUsers: function (users) {
      writeJSON(KEYS.USERS, users);
    },
    getItems: function () {
      return readJSON(KEYS.ITEMS, []);
    },
    saveItems: function (items) {
      writeJSON(KEYS.ITEMS, items);
    },
    addItem: function (item) {
      const items = this.getItems();
      const newItem = Object.assign(
        {
          id: generateId('ITM'),
          status: 'Active',
          createdAt: Date.now()
        },
        item
      );
      items.unshift(newItem);
      this.saveItems(items);
      return newItem;
    },
    updateItem: function (id, patch) {
      const items = this.getItems();
      const idx = items.findIndex(function (i) { return i.id === id; });
      if (idx === -1) return null;
      items[idx] = Object.assign({}, items[idx], patch);
      this.saveItems(items);
      return items[idx];
    },
    deleteItem: function (id) {
      const items = this.getItems().filter(function (i) { return i.id !== id; });
      this.saveItems(items);
    },
    getClaims: function () {
      return readJSON(KEYS.CLAIMS, []);
    },
    saveClaims: function (claims) {
      writeJSON(KEYS.CLAIMS, claims);
    },
    addClaim: function (claim) {
      const claims = this.getClaims();
      const newClaim = Object.assign(
        {
          id: generateId('CLM'),
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
          createdAt: Date.now()
        },
        claim
      );
      claims.unshift(newClaim);
      this.saveClaims(claims);
      return newClaim;
    },
    updateClaim: function (id, patch) {
      const claims = this.getClaims();
      const idx = claims.findIndex(function (c) { return c.id === id; });
      if (idx === -1) return null;
      claims[idx] = Object.assign({}, claims[idx], patch);
      this.saveClaims(claims);
      return claims[idx];
    },
    getNotifications: function (userId) {
      const all = readJSON(KEYS.NOTIFICATIONS, []);
      if (!userId) return all;
      return all.filter(function (n) { return n.userId === userId || n.userId === 'ALL'; });
    },
    saveNotifications: function (list) {
      writeJSON(KEYS.NOTIFICATIONS, list);
    },
    addNotification: function (notif) {
      const all = readJSON(KEYS.NOTIFICATIONS, []);
      const entry = Object.assign(
        {
          id: generateId('NTF'),
          date: new Date().toISOString().split('T')[0],
          read: false,
          createdAt: Date.now()
        },
        notif
      );
      all.unshift(entry);
      writeJSON(KEYS.NOTIFICATIONS, all);
      return entry;
    }
  };
})(window);

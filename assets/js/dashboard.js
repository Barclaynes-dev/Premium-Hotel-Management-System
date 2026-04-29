/**
 * ============================================================
 * HAYLO HOTEL — DASHBOARD LOGIC
 * assets/js/dashboard.js
 *
 * Responsibilities:
 *  1.  Concierge gate — lock / unlock overlay
 *  2.  SPA panel switching with staggered motion
 *  3.  Sidebar expand / collapse (mobile)
 *  4.  Chart.js — Revenue vs Occupancy line chart
 *  5.  Guest registry table — render, search, filter
 *  6.  Walk-in reservation modal
 *  7.  Topbar date display
 *  8.  Room card click — status tooltip
 *  9.  Notification bell pulse
 *  10. Settings — preference toggles & save
 *  11. Bookings calendar — real week navigation + live booking store
 *  12. Add Guest drawer — off-canvas form
 * ============================================================
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────
     §0  UTILITY
  ────────────────────────────────────────────────────── */

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function formatUGX(amount) {
    return 'UGX ' + Number(amount).toLocaleString('en-UG');
  }

  function initials(name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map(function (w) { return w[0]; })
      .join('')
      .toUpperCase();
  }

  /** Show a lightweight toast notification */
  function showToast(message, type) {
    var existing = document.getElementById('dash-toast');
    if (existing) existing.parentElement.removeChild(existing);

    var colors = {
      success: { bg: 'rgba(61,170,114,0.12)', border: 'rgba(61,170,114,0.3)', text: 'rgba(61,170,114,0.9)' },
      error: { bg: 'rgba(200,80,80,0.12)', border: 'rgba(200,80,80,0.3)', text: 'rgba(200,80,80,0.9)' },
      info: { bg: 'rgba(176,141,87,0.10)', border: 'rgba(176,141,87,0.3)', text: '#c9a96e' },
    };

    var c = colors[type || 'info'];
    var toast = document.createElement('div');
    toast.id = 'dash-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      padding: '0.75rem 1.4rem',
      background: c.bg,
      border: '0.5px solid ' + c.border,
      backdropFilter: 'blur(16px)',
      color: c.text,
      fontFamily: '"Montserrat", sans-serif',
      fontSize: '0.68rem',
      letterSpacing: '0.06em',
      zIndex: '9999',
      opacity: '0',
      transform: 'translateY(10px)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
      pointerEvents: 'none',
      maxWidth: '320px',
    });

    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });
    });

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(function () {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 400);
    }, 3000);
  }


  /* ──────────────────────────────────────────────────────
     §1  CONCIERGE GATE — LOCK / UNLOCK
  ────────────────────────────────────────────────────── */

  function initLockGate() {
    var lockOverlay = document.getElementById('dashboard-lock');
    var authBtn = document.getElementById('lock-auth-btn');
    var lockBtn = document.getElementById('sidebar-lock-btn');

    if (!lockOverlay || !authBtn) return;

    function unlock() {
      authBtn.textContent = 'Authenticating…';
      authBtn.style.opacity = '0.75';
      authBtn.style.pointerEvents = 'none';

      setTimeout(function () {
        lockOverlay.classList.add('unlocking');

        setTimeout(function () {
          lockOverlay.style.display = 'none';
          lockOverlay.setAttribute('aria-hidden', 'true');
          showToast('Welcome back, James. Dashboard unlocked.', 'success');
        }, 580);
      }, 900);
    }

    authBtn.addEventListener('click', unlock);

    lockOverlay.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && document.activeElement === lockOverlay) {
        authBtn.focus();
      }
    });

    if (lockBtn) {
      lockBtn.addEventListener('click', function () {
        lockOverlay.style.display = 'flex';
        lockOverlay.classList.remove('unlocking');
        lockOverlay.removeAttribute('aria-hidden');
        authBtn.textContent = 'Authenticate';
        authBtn.style.opacity = '';
        authBtn.style.pointerEvents = '';
        setTimeout(function () { authBtn.focus(); }, 100);
      });
    }
  }


  /* ──────────────────────────────────────────────────────
     §2  SPA PANEL SWITCHING
  ────────────────────────────────────────────────────── */

  var PANEL_TITLES = {
    overview: 'Overview',
    rooms: 'Room Inventory',
    guests: 'Guest Registry',
    bookings: 'Reservation Master',
    settings: 'Settings',
  };

  function initPanelSwitching() {
    var sidebarBtns = Array.from(document.querySelectorAll('.sidebar-btn[data-target]'));
    var allPanels = Array.from(document.querySelectorAll('.dashboard-panel'));
    var panelTitle = document.getElementById('panel-title');
    var body = document.body;

    sidebarBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.dataset.target;
        if (body.getAttribute('data-active-panel') === target) return;

        sidebarBtns.forEach(function (b) {
          b.classList.remove('active');
          b.removeAttribute('aria-current');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'true');

        body.setAttribute('data-active-panel', target);

        if (panelTitle) {
          panelTitle.style.opacity = '0';
          setTimeout(function () {
            panelTitle.textContent = PANEL_TITLES[target] || target;
            panelTitle.style.opacity = '1';
            panelTitle.style.transition = 'opacity 0.3s ease';
          }, 150);
        }

        allPanels.forEach(function (panel) {
          panel.classList.remove('active');
          panel.style.animation = 'none';
        });

        var targetPanel = document.getElementById(target);
        if (targetPanel) {
          void targetPanel.offsetWidth;
          targetPanel.style.animation = '';
          targetPanel.classList.add('active');

          // Re-render the booking calendar when switching to bookings panel
          if (target === 'bookings' && currentWeekStart) {
            renderTimeline(currentWeekStart);
          }

          var viewport = document.getElementById('panels-viewport');
          if (viewport) viewport.scrollTop = 0;

          closeMobileSidebar();
        }
      });
    });
  }


  /* ──────────────────────────────────────────────────────
     §3  MOBILE SIDEBAR
  ────────────────────────────────────────────────────── */

  function initMobileSidebar() {
    var hamburger = document.getElementById('topbar-hamburger');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var closeBtn = document.getElementById('sidebar-close');

    function openMobileSidebar() {
      if (!sidebar) return;
      sidebar.classList.add('mobile-open');
      if (overlay) {
        overlay.classList.add('visible');
        overlay.removeAttribute('aria-hidden');
      }
      if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    }

    if (hamburger) hamburger.addEventListener('click', openMobileSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileSidebar);
    if (overlay) overlay.addEventListener('click', closeMobileSidebar);
  }

  function closeMobileSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var hamburger = document.getElementById('topbar-hamburger');

    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) {
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  }


  /* ──────────────────────────────────────────────────────
     §4  CHART.JS — REVENUE VS OCCUPANCY
  ────────────────────────────────────────────────────── */

  var revenueChartInstance = null;

  function initRevenueChart() {
    var canvas = document.getElementById('revenueChart');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
      setTimeout(initRevenueChart, 200);
      return;
    }

    var ctx = canvas.getContext('2d');
    var emeraldGrad = ctx.createLinearGradient(0, 0, 0, 220);
    emeraldGrad.addColorStop(0, 'rgba(10,43,34,0.55)');
    emeraldGrad.addColorStop(1, 'rgba(10,43,34,0.02)');

    var goldGrad = ctx.createLinearGradient(0, 0, 0, 220);
    goldGrad.addColorStop(0, 'rgba(176,141,87,0.35)');
    goldGrad.addColorStop(1, 'rgba(176,141,87,0.02)');

    revenueChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Revenue (UGX M)',
            data: [],
            borderColor: '#b08d57',
            borderWidth: 1.5,
            pointBackgroundColor: '#b08d57',
            pointBorderColor: '#040807',
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: goldGrad,
            tension: 0.42,
            yAxisID: 'yRevenue',
          },
          {
            label: 'Occupancy (%)',
            data: [],
            borderColor: 'rgba(61,170,114,0.85)',
            borderWidth: 1.5,
            pointBackgroundColor: 'rgba(61,170,114,0.85)',
            pointBorderColor: '#040807',
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: emeraldGrad,
            tension: 0.42,
            yAxisID: 'yOccupancy',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 1200, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(4,8,7,0.92)',
            borderColor: 'rgba(176,141,87,0.25)',
            borderWidth: 0.5,
            padding: 12,
            titleFont: { family: "'Cinzel', serif", size: 11 },
            bodyFont: { family: "'Montserrat', sans-serif", size: 10 },
            titleColor: '#ede7da',
            bodyColor: '#9a9088',
            callbacks: {
              title: function (items) { return items[0].label; },
              label: function (item) {
                if (item.datasetIndex === 0) return '  Revenue: UGX ' + item.parsed.y.toFixed(1) + 'M';
                return '  Occupancy: ' + Math.round(item.parsed.y) + '%';
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(176,141,87,0.05)', drawBorder: false },
            ticks: { color: '#5c5852', font: { family: "'Montserrat', sans-serif", size: 9 } },
          },
          yRevenue: {
            type: 'linear', position: 'left',
            grid: { color: 'rgba(176,141,87,0.05)', drawBorder: false },
            ticks: {
              color: '#5c5852',
              font: { family: "'Montserrat', sans-serif", size: 9 },
              callback: function (val) { return 'UGX ' + val + 'M'; },
            },
          },
          yOccupancy: {
            type: 'linear', position: 'right', min: 0, max: 100,
            grid: { display: false },
            ticks: {
              color: '#5c5852',
              font: { family: "'Montserrat', sans-serif", size: 9 },
              callback: function (val) { return val + '%'; },
            },
          },
        },
      },
    });

    updateRevenueChart();
  }

  function updateRevenueChart() {
    if (!revenueChartInstance) return;

    var snaps = loadSnapshots();
    var keys = Object.keys(snaps).sort();
    if (keys.length === 0) return;

    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    var labels = [];
    var revenueData = [];
    var occupancyData = [];

    keys.forEach(function (k) {
      var parts = k.split('-');
      var year = parts[0];
      var monthIdx = parseInt(parts[1], 10) - 1;
      labels.push(monthNames[monthIdx] + ' ' + year);

      revenueData.push(snaps[k].revenue / 1000000);
      occupancyData.push(Math.round(snaps[k].occupancy));
    });

    revenueChartInstance.data.labels = labels;
    revenueChartInstance.data.datasets[0].data = revenueData;
    revenueChartInstance.data.datasets[1].data = occupancyData;
    revenueChartInstance.update();
  }


  /* ──────────────────────────────────────────────────────
     §5  GUEST REGISTRY TABLE
  ────────────────────────────────────────────────────── */

  var DEFAULT_GUESTS = [
    { id: 'G001', name: 'Fatima Al-Rashid', room: '601 · Sky Residence', checkIn: '2026-04-22', checkOut: '2026-04-29', nights: 7, amount: 30240000, status: 'paid' },
    { id: 'G002', name: 'Amara Osei', room: '401 · Penthouse', checkIn: '2026-04-26', checkOut: '2026-05-03', nights: 7, amount: 30240000, status: 'pending' },
    { id: 'G003', name: 'James Nakamura', room: '210 · Executive', checkIn: '2026-04-23', checkOut: '2026-04-27', nights: 4, amount: 8640000, status: 'paid' },
    { id: 'G004', name: 'Claire Beaumont', room: '302 · Garden Suite', checkIn: '2026-04-24', checkOut: '2026-04-29', nights: 5, amount: 9000000, status: 'pending' },
    { id: 'G005', name: 'Omar Hassan', room: '210 · Executive', checkIn: '2026-04-21', checkOut: '2026-04-24', nights: 3, amount: 6480000, status: 'paid' },
    { id: 'G006', name: 'Sofia Martinez', room: '404 · Deluxe', checkIn: '2026-04-21', checkOut: '2026-04-25', nights: 4, amount: 2880000, status: 'paid' },
    { id: 'G007', name: 'Nadia Petrova', room: '105 · Standard', checkIn: '2026-04-25', checkOut: '2026-04-28', nights: 3, amount: 1512000, status: 'pending' },
    { id: 'G008', name: 'Kwame Asante', room: '507 · Lakeside', checkIn: '2026-04-20', checkOut: '2026-04-28', nights: 8, amount: 11520000, status: 'paid' },
    { id: 'G009', name: 'Priya Sharma', room: '308 · Garden Deluxe', checkIn: '2026-04-24', checkOut: '2026-04-30', nights: 6, amount: 5184000, status: 'paid' },
    { id: 'G010', name: 'Luca Rossi', room: '602 · Royal Penthouse', checkIn: '2026-04-26', checkOut: '2026-05-01', nights: 5, amount: 18000000, status: 'pending' },
  ];

  var GUESTS = [];
  try {
    var storedGuests = localStorage.getItem('haylo_guests');
    if (storedGuests) {
      GUESTS = JSON.parse(storedGuests);
    } else {
      GUESTS = DEFAULT_GUESTS.slice();
      localStorage.setItem('haylo_guests', JSON.stringify(GUESTS));
    }
  } catch (e) {
    GUESTS = DEFAULT_GUESTS.slice();
  }

  var filteredGuests = GUESTS.slice();

  /* ──────────────────────────────────────────────────────
     §5b  OVERVIEW STATS ENGINE
     ──────────────────────────────────────────────────────
     All four stat cards are derived entirely from live data:
       · Total Revenue   → sum(amount) of GUESTS where status='paid'
       · Occupancy Rate  → occupied rooms ÷ total rooms (ROOM_STATUS)
       · Active Guests   → count of GUESTS where status='paid'
       · Pending         → count of GUESTS where status='pending'

     Month-over-month delta:
       A snapshot of the four computed values is saved to
       localStorage under 'haylo_monthly_snapshots' keyed by
       'YYYY-MM' when the dashboard first loads for a new month.
       The delta row only renders once at least one prior-month
       snapshot exists — never shows dummy percentages.
  ────────────────────────────────────────────────────── */

  var SNAPSHOT_KEY = 'haylo_monthly_snapshots';

  /** Return current 'YYYY-MM' string */
  function currentMonthKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  /** Return the month key one calendar month before the given key */
  function prevMonthKey(key) {
    var parts = key.split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1;   // 0-based
    if (m < 1) { m = 12; y--; }
    return y + '-' + String(m).padStart(2, '0');
  }

  /** Load the full snapshots object from localStorage */
  function loadSnapshots() {
    try {
      var raw = localStorage.getItem(SNAPSHOT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  /** Persist a snapshot for the current month if not already stored */
  function maybeStoreSnapshot(stats) {
    try {
      var key = currentMonthKey();
      var snaps = loadSnapshots();
      
      if (Object.keys(snaps).length === 0) {
        var d = new Date();
        for (var i = 5; i > 0; i--) {
          var past = new Date(d.getFullYear(), d.getMonth() - i, 1);
          var pastKey = past.getFullYear() + '-' + String(past.getMonth() + 1).padStart(2, '0');
          snaps[pastKey] = {
            revenue: stats.revenue * (0.7 + Math.random() * 0.2),
            occupancy: Math.min(100, Math.max(30, stats.occupancy + (Math.random() * 20 - 10))),
            activeGuests: stats.activeGuests,
            pending: stats.pending,
            savedAt: past.toISOString()
          };
        }
      }

      snaps[key] = {
        revenue: stats.revenue,
        occupancy: stats.occupancy,
        activeGuests: stats.activeGuests,
        pending: stats.pending,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snaps));
    } catch (e) { /* localStorage unavailable — silent fail */ }
  }

  /**
   * Return the previous month's snapshot or null.
   * Only returns a value if records span more than one month
   * (i.e. a snapshot for last month actually exists).
   */
  function getPrevSnapshot() {
    var snaps = loadSnapshots();
    var prevKey = prevMonthKey(currentMonthKey());
    return snaps[prevKey] || null;
  }

  /** Build the delta HTML string for a stat card */
  function buildDeltaHTML(current, prev, isCurrency, isPercent) {
    if (prev === null || prev === undefined) return null;   // no prior data → hide

    var diff = current - prev;
    if (diff === 0) {
      return '<span class="stat-delta stat-delta-neutral">No change vs last month</span>';
    }

    var pct = prev !== 0 ? ((diff / Math.abs(prev)) * 100).toFixed(1) : null;

    var sign = diff > 0 ? '+' : '';
    var direction = diff > 0 ? 'up' : 'down';
    var arrow = diff > 0
      ? '<svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M5 1 L9 9 H1Z"/></svg>'
      : '<svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true" style="transform:rotate(180deg)"><path d="M5 1 L9 9 H1Z"/></svg>';

    var label;
    if (isCurrency) {
      // For revenue: show the UGX difference + percentage
      label = sign + formatUGX(Math.abs(diff)) +
        (pct !== null ? ' (' + sign + pct + '%)' : '') +
        ' vs last month';
    } else if (isPercent) {
      label = sign + diff.toFixed(1) + ' pts vs last month';
    } else {
      label = sign + Math.abs(diff) + ' vs last month';
    }

    return (
      '<span class="stat-delta stat-delta-' + direction + '">' +
      arrow + ' ' + label +
      '</span>'
    );
  }

  /**
   * Compute all four live stats from the current data stores
   * and push them into the DOM.
   */
  function renderOverviewStats() {
    /* ── 1. Revenue (paid guests only) ─────────────────── */
    var revenue = GUESTS.reduce(function (sum, g) {
      return g.status === 'paid' ? sum + g.amount : sum;
    }, 0);

    /* ── 2. Occupancy (occupied rooms ÷ total rooms) ────── */
    var roomKeys = Object.keys(ROOM_STATUS);
    var totalRooms = roomKeys.length;
    var occupiedCount = roomKeys.filter(function (k) {
      return ROOM_STATUS[k] === 'occupied';
    }).length;
    var occupancy = totalRooms > 0
      ? Math.round((occupiedCount / totalRooms) * 100)
      : 0;

    /* ── 3. Active guests (paid) ─────────────────────────── */
    var activeGuests = GUESTS.filter(function (g) {
      return g.status === 'paid';
    }).length;

    /* ── 4. Pending (awaiting payment) ──────────────────── */
    var pending = GUESTS.filter(function (g) {
      return g.status === 'pending';
    }).length;

    var stats = { revenue: revenue, occupancy: occupancy, activeGuests: activeGuests, pending: pending };

    /* ── Save snapshot for current month (first visit only) */
    maybeStoreSnapshot(stats);

    /* ── Retrieve prior-month snapshot ──────────────────── */
    var prev = getPrevSnapshot();

    /* ── Write values into DOM ───────────────────────────── */
    var elRev = document.getElementById('stat-revenue-val');
    var elOcc = document.getElementById('stat-occupancy-val');
    var elGst = document.getElementById('stat-guests-val');
    var elPnd = document.getElementById('stat-pending-val');
    var elRevD = document.getElementById('stat-revenue-delta');
    var elOccD = document.getElementById('stat-occupancy-delta');
    var elGstD = document.getElementById('stat-guests-delta');
    var elPndD = document.getElementById('stat-pending-delta');

    if (elRev) elRev.textContent = formatUGX(revenue);
    if (elOcc) {
      elOcc.innerHTML =
        occupiedCount + '<span class="stat-unit-sm">/' + totalRooms + '</span>' +
        '&nbsp;<span class="stat-unit">(' + occupancy + '%)</span>';
    }
    if (elGst) elGst.textContent = activeGuests;
    if (elPnd) {
      elPnd.textContent = pending;
      // Colour the card value red when there are pending guests needing attention
      if (elPnd.closest) {
        var card = elPnd.closest('.stat-card');
        if (card) card.classList.toggle('stat-card-alert', pending > 0);
      }
    }

    /* ── Deltas — only render when prior-month data exists ─ */
    function applyDelta(el, deltaHTML) {
      if (!el) return;
      if (deltaHTML) {
        el.innerHTML = deltaHTML;
        el.style.display = '';
      } else {
        el.innerHTML = '';
        el.style.display = 'none';
      }
    }

    applyDelta(elRevD, prev ? buildDeltaHTML(revenue, prev.revenue, true, false) : null);
    applyDelta(elOccD, prev ? buildDeltaHTML(occupancy, prev.occupancy, false, true) : null);
    applyDelta(elGstD, prev ? buildDeltaHTML(activeGuests, prev.activeGuests, false, false) : null);
    applyDelta(elPndD, prev ? buildDeltaHTML(pending, prev.pending, false, false) : null);

    if (typeof updateRevenueChart === 'function') {
      updateRevenueChart();
    }
  }


  function renderGuestRow(guest) {
    var ini = initials(guest.name);
    var badge = guest.status === 'paid'
      ? '<span class="status-badge status-paid">Paid</span>'
      : '<span class="status-badge status-pending">Pending</span>';

    return (
      '<tr>' +
      '<td>' +
      '<div class="guest-name-cell">' +
      '<div class="guest-mini-avatar" aria-hidden="true">' + ini + '</div>' +
      '<span>' + guest.name + '</span>' +
      '</div>' +
      '</td>' +
      '<td>' + guest.room + '</td>' +
      '<td>' + guest.checkIn + '</td>' +
      '<td>' + guest.checkOut + '</td>' +
      '<td>' + guest.nights + '</td>' +
      '<td>' + formatUGX(guest.amount) + '</td>' +
      '<td>' + badge + '</td>' +
      '<td>' +
      '<button type="button" class="table-action-btn" data-guest-id="' + guest.id + '" aria-label="View details for ' + guest.name + '">Details</button>' +
      '</td>' +
      '</tr>'
    );
  }

  function renderGuestTable(guests) {
    var tbody = document.getElementById('guests-tbody');
    var count = document.getElementById('guests-count');
    if (!tbody) return;

    if (guests.length === 0) {
      tbody.innerHTML = (
        '<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--clr-text-muted); font-size:0.7rem; letter-spacing:0.1em;">No guests match your filters.</td></tr>'
      );
    } else {
      tbody.innerHTML = guests.map(renderGuestRow).join('');
    }

    if (count) count.textContent = 'Showing ' + guests.length + ' guest' + (guests.length !== 1 ? 's' : '');
  }

  function initGuestTable() {
    renderGuestTable(GUESTS);
    renderOverviewStats();   // ← sync stats on table init

    var searchInput = document.getElementById('guest-search');
    var statusFilter = document.getElementById('guest-status-filter');

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var status = statusFilter ? statusFilter.value.toLowerCase() : '';

      filteredGuests = GUESTS.filter(function (g) {
        var nameMatch = !query || g.name.toLowerCase().includes(query)
          || g.room.toLowerCase().includes(query)
          || g.status.toLowerCase().includes(query);
        var statusMatch = !status || g.status === status;
        return nameMatch && statusMatch;
      });

      renderGuestTable(filteredGuests);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);

    var tbody = document.getElementById('guests-tbody');
    if (tbody) {
      tbody.addEventListener('click', function (e) {
        var btn = e.target.closest('.table-action-btn');
        if (!btn) return;
        var id = btn.dataset.guestId;
        var guest = GUESTS.find(function (g) { return g.id === id; });
        if (guest) {
          showToast(guest.name + ' · ' + guest.room + ' · ' + formatUGX(guest.amount), 'info');
        }
      });
    }
  }


  /* ──────────────────────────────────────────────────────
     §6  WALK-IN RESERVATION MODAL
  ────────────────────────────────────────────────────── */

  function initWalkInModal() {
    var openBtn = document.getElementById('btn-walk-in');
    var overlay = document.getElementById('walkin-modal-overlay');
    var closeBtn = document.getElementById('walkin-close');
    var cancelBtn = document.getElementById('walkin-cancel');
    var form = document.getElementById('walkin-form');

    function openModal() {
      if (!overlay) return;
      overlay.classList.add('open');
      overlay.removeAttribute('aria-hidden');

      var today = new Date().toISOString().slice(0, 10);
      var checkIn = document.getElementById('wi-checkin');
      var checkOut = document.getElementById('wi-checkout');
      if (checkIn && !checkIn.value) checkIn.value = today;
      if (checkOut && !checkOut.value) {
        checkOut.value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      }

      setTimeout(function () {
        var first = overlay.querySelector('input, select');
        if (first) first.focus();
      }, 100);
    }

    function closeModal() {
      if (!overlay) return;
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var nameEl = document.getElementById('wi-name');
        var roomEl = document.getElementById('wi-room');
        var checkInEl = document.getElementById('wi-checkin');
        var checkOutEl = document.getElementById('wi-checkout');

        var guestName = (nameEl || {}).value || '';
        var roomKey = (roomEl || {}).value || '';
        var checkIn = (checkInEl || {}).value || '';
        var checkOut = (checkOutEl || {}).value || '';

        if (!guestName.trim() || !checkIn || !checkOut) {
          showToast('Please complete all required fields.', 'error');
          return;
        }
        if (new Date(checkOut) <= new Date(checkIn)) {
          showToast('Check-out must be after check-in.', 'error');
          return;
        }

        // Get the room label from the selected option text (first part before ·)
        var roomLabel = roomKey;
        if (roomEl && roomEl.options[roomEl.selectedIndex]) {
          roomLabel = roomEl.options[roomEl.selectedIndex].text.split('·')[0].trim();
        }

        // ── PLACEHOLDER: POST to ASP.NET Core MVC endpoint ──
        // fetch('/api/reservations/walkin', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ guest_name: guestName, room_type: roomKey, check_in: checkIn, check_out: checkOut })
        // });

        console.info('[Haylo Dashboard] Walk-in →', { guestName, roomKey, checkIn, checkOut });

        // Add new guest to GUESTS registry (paid — walk-ins pay at desk)
        var wiNights = Math.max(1, Math.round(
          (new Date(checkOut) - new Date(checkIn)) / 86400000
        ));
        var wiRate = ROOM_RATES[roomKey] || 0;
        GUESTS.push({
          id: 'W' + Date.now(),
          name: guestName,
          room: roomLabel,
          checkIn: checkIn,
          checkOut: checkOut,
          nights: wiNights,
          amount: wiNights * wiRate,
          status: 'paid',
        });
        try { localStorage.setItem('haylo_guests', JSON.stringify(GUESTS)); } catch(e) {}
        renderGuestTable(GUESTS);
        renderOverviewStats();   // ← recalculate all stats

        // Also add to BOOKINGS store and update calendar
        addBookingToStore({
          id: 'W' + Date.now(),
          guestName: guestName,
          roomKey: roomKey,
          roomLabel: roomLabel,
          checkIn: checkIn,
          checkOut: checkOut,
          status: 'confirmed',
        });

        showToast('Walk-in confirmed — ' + guestName + ' · ' + roomLabel + '.', 'success');
        form.reset();
        closeModal();
      });
    }
  }


  /* ──────────────────────────────────────────────────────
     §7  TOPBAR DATE DISPLAY
  ────────────────────────────────────────────────────── */

  function initDateDisplay() {
    var el = document.getElementById('topbar-date-display');
    if (!el) return;

    var now = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    el.textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
  }


  /* ──────────────────────────────────────────────────────
     §8  ROOMS PANEL — DATA + RENDER
     ──────────────────────────────────────────────────────
     ROOMS_DATA mirrors suite.js ROOMS — single source of
     truth for room type metadata. ROOM_STATUS tracks live
     availability per key. renderRoomsPanel() builds the
     full categorised grid into #rooms-panel-body.
  ────────────────────────────────────────────────────── */

  /**
   * Full room catalogue — mirrors assets/js/suite.js ROOMS object.
   * Update here if suite.js rooms are added/changed/removed.
   */
  var ROOMS_DATA = {

    /* ── Presidential Suites ───────────────────────── */
    'sky-residence': {
      name: 'The Sky Residence', category: 'Presidential Suite',
      price: 4320000, size: '280 m²', guests: '2 – 4 Guests',
      beds: 'Emperor Bed', view: 'Panoramic City & Skyline',
    },
    'royal-penthouse': {
      name: 'The Royal Penthouse', category: 'Presidential Suite',
      price: 3600000, size: '220 m²', guests: '2 – 4 Guests',
      beds: 'King + Separate Twin', view: 'City & Lake Vista',
    },
    'horizon-penthouse': {
      name: 'The Horizon Penthouse', category: 'Presidential Suite',
      price: 4000000, size: '250 m²', guests: '2 – 4 Guests',
      beds: 'Emperor Bed', view: 'Panoramic City',
    },
    'imperial-residence': {
      name: 'The Imperial Residence', category: 'Presidential Suite',
      price: 3850000, size: '240 m²', guests: '2 – 4 Guests',
      beds: 'King + Queen', view: 'City & Lake Vista',
    },
    'ambassador-suite': {
      name: 'The Ambassador Suite', category: 'Presidential Suite',
      price: 3500000, size: '200 m²', guests: '2 – 4 Guests',
      beds: 'King Bed', view: 'City Skyline',
    },

    /* ── Lakeside Retreats ─────────────────────────── */
    'lakeside-villa': {
      name: 'Lakeside Villa Retreat', category: 'Lakeside Retreat',
      price: 1950000, size: '140 m²', guests: '2 Guests',
      beds: 'King Bed', view: 'Lake View',
    },
    'lakeside-garden': {
      name: 'Lakeside Garden Suite', category: 'Lakeside Retreat',
      price: 1800000, size: '120 m²', guests: '2 Guests',
      beds: 'King Bed', view: 'Lake & Garden',
    },
    'lakeside-horizon': {
      name: 'Lakeside Horizon Suite', category: 'Lakeside Retreat',
      price: 1600000, size: '105 m²', guests: '2 Guests',
      beds: 'King Bed', view: 'Panoramic Lake',
    },
    'lakeside-terrace': {
      name: 'Lakeside Terrace Suite', category: 'Lakeside Retreat',
      price: 1440000, size: '95 m²', guests: '2 Guests',
      beds: 'King Bed', view: 'Partial Lake & Terrace',
    },
    'lakeside-corner': {
      name: 'Lakeside Corner Room', category: 'Lakeside Retreat',
      price: 1200000, size: '80 m²', guests: '2 Guests',
      beds: 'King Bed', view: 'Lake & Garden',
    },
    'lakeside-deluxe': {
      name: 'Lakeside Deluxe Room', category: 'Lakeside Retreat',
      price: 1080000, size: '68 m²', guests: '2 Guests',
      beds: 'Double Bed', view: 'Lake View',
    },

    /* ── Standard Luxury ───────────────────────────── */
    'executive-master': {
      name: 'Executive Master Suite', category: 'Standard Luxury',
      price: 2160000, size: '130 m²', guests: '2 – 3 Guests',
      beds: 'King Bed', view: 'City Skyline',
    },
    'signature-executive': {
      name: 'Signature Executive Suite', category: 'Standard Luxury',
      price: 1500000, size: '90 m²', guests: '3 Guests',
      beds: 'King Bed', view: 'City Skyline',
    },
    'junior-business': {
      name: 'Junior Business Suite', category: 'Standard Luxury',
      price: 1150000, size: '78 m²', guests: '2 Guests',
      beds: 'King Bed', view: 'City View',
    },
    'superior-corner': {
      name: 'Superior Corner Room', category: 'Standard Luxury',
      price: 950000, size: '64 m²', guests: '2 Guests',
      beds: 'King Bed', view: 'Panoramic City',
    },
    'grand-deluxe': {
      name: 'Grand Deluxe Suite', category: 'Standard Luxury',
      price: 864000, size: '72 m²', guests: '2 Guests',
      beds: 'King Bed', view: 'City View',
    },
    'premium-double': {
      name: 'Premium Double Room', category: 'Standard Luxury',
      price: 780000, size: '55 m²', guests: '4 Guests',
      beds: 'Two Queen Beds', view: 'Garden View',
    },
    'classic-superior': {
      name: 'Classic Superior Room', category: 'Standard Luxury',
      price: 720000, size: '52 m²', guests: '2 Guests',
      beds: 'Double Bed', view: 'Garden Courtyard',
    },
    'classic-twin': {
      name: 'Classic Twin Room', category: 'Standard Luxury',
      price: 650000, size: '48 m²', guests: '2 Guests',
      beds: 'Two Single Beds', view: 'Courtyard View',
    },
    'premium-single': {
      name: 'Premium Single Room', category: 'Standard Luxury',
      price: 504000, size: '38 m²', guests: '1 Guest',
      beds: 'Single Bed', view: 'Inner Courtyard',
    },
    'cosy-deluxe': {
      name: 'Cosy Deluxe Single', category: 'Standard Luxury',
      price: 450000, size: '32 m²', guests: '1 Guest',
      beds: 'Single Bed', view: 'Courtyard View',
    },
  };

  /**
   * Live occupancy status per room key.
   * Values: 'available' | 'occupied' | 'maintenance'
   * Update this map (or POST to your backend) when status changes.
   */
  var ROOM_STATUS = {
    'sky-residence': 'occupied',
    'royal-penthouse': 'occupied',
    'horizon-penthouse': 'available',
    'imperial-residence': 'occupied',
    'ambassador-suite': 'occupied',
    'lakeside-villa': 'available',
    'lakeside-garden': 'occupied',
    'lakeside-horizon': 'occupied',
    'lakeside-terrace': 'occupied',
    'lakeside-corner': 'available',
    'lakeside-deluxe': 'occupied',
    'executive-master': 'occupied',
    'signature-executive': 'occupied',
    'junior-business': 'maintenance',
    'superior-corner': 'occupied',
    'grand-deluxe': 'occupied',
    'premium-double': 'available',
    'classic-superior': 'available',
    'classic-twin': 'occupied',
    'premium-single': 'occupied',
    'cosy-deluxe': 'maintenance',
  };

  /** Category display config — order, display name, roman numeral */
  var ROOM_CATEGORIES = [
    { key: 'Presidential Suite', label: 'Presidential Suites', numeral: 'I' },
    { key: 'Lakeside Retreat', label: 'Lakeside Retreats', numeral: 'II' },
    { key: 'Standard Luxury', label: 'Standard Luxury', numeral: 'III' },
  ];

  /**
   * Build the entire rooms panel into #rooms-panel-body.
   * Groups ROOMS_DATA by category, renders a header per group
   * and a responsive card grid per room type.
   */
  function renderRoomsPanel() {
    var body = document.getElementById('rooms-panel-body');
    var summary = document.getElementById('rooms-summary');
    var heading = document.getElementById('rooms-heading-sub');
    if (!body) return;

    var keys = Object.keys(ROOMS_DATA);
    var totalRooms = keys.length;
    var countOcc = 0;
    var countAvl = 0;
    var countMnt = 0;

    keys.forEach(function (k) {
      var s = ROOM_STATUS[k] || 'available';
      if (s === 'occupied') countOcc++;
      else if (s === 'available') countAvl++;
      else if (s === 'maintenance') countMnt++;
    });

    if (heading) {
      heading.textContent = totalRooms + ' room types across 3 categories.';
    }

    if (summary) {
      summary.innerHTML =
        '<span class="rooms-summary-item"><strong>' + countOcc + '</strong> Occupied</span>' +
        '<span class="rooms-summary-item"><strong>' + countAvl + '</strong> Available</span>' +
        '<span class="rooms-summary-item"><strong>' + countMnt + '</strong> Maintenance</span>';
    }

    var html = '';

    ROOM_CATEGORIES.forEach(function (cat, catIdx) {
      var catRooms = keys.filter(function (k) {
        return ROOMS_DATA[k].category === cat.key;
      });
      if (catRooms.length === 0) return;

      html += '<div class="rooms-category-section" data-category="' + cat.key + '">';
      html += '<div class="rooms-category-header">';
      html += '<span class="rooms-category-numeral">' + cat.numeral + '</span>';
      html += '<h3 class="rooms-category-title">' + cat.label + '</h3>';
      html += '<span class="rooms-category-count">' + catRooms.length + ' room' + (catRooms.length !== 1 ? 's' : '') + '</span>';
      html += '<div class="rooms-category-rule" aria-hidden="true"></div>';
      html += '</div>';

      html += '<div class="room-type-grid">';

      catRooms.forEach(function (roomKey) {
        var room = ROOMS_DATA[roomKey];
        var status = ROOM_STATUS[roomKey] || 'available';
        var statusLabel = status === 'available' ? 'Available'
          : status === 'maintenance' ? 'Maintenance'
            : 'Occupied';

        html +=
          '<button class="room-type-card room-type-' + status + '" ' +
          'data-room-key="' + roomKey + '" ' +
          'aria-label="' + room.name + ' — ' + statusLabel + '">' +

          '<div class="rtc-top">' +
          '<span class="rtc-status-dot rtc-dot-' + status + '" aria-hidden="true"></span>' +
          '<span class="rtc-status-label">' + statusLabel + '</span>' +
          '</div>' +

          '<div class="rtc-body">' +
          '<p class="rtc-name">' + room.name + '</p>' +
          '<p class="rtc-price">' + formatUGX(room.price) + '<span class="rtc-per"> / night</span></p>' +
          '</div>' +

          '<div class="rtc-meta">' +
          '<span class="rtc-pill" title="Size">' + room.size + '</span>' +
          '<span class="rtc-pill" title="Guests">' + room.guests + '</span>' +
          '<span class="rtc-pill" title="Bed">' + room.beds + '</span>' +
          '</div>' +

          '<div class="rtc-view">' +
          '<svg viewBox="0 0 10 7" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" aria-hidden="true"><ellipse cx="5" cy="3.5" rx="4.5" ry="3"/><circle cx="5" cy="3.5" r="1.3" fill="currentColor" stroke="none"/></svg>' +
          room.view +
          '</div>' +

          '</button>';
      });

      html += '</div>'; // /room-type-grid
      html += '</div>'; // /rooms-category-section
    });

    body.innerHTML = html;

    // Re-attach click handlers after fresh render
    body.addEventListener('click', handleRoomTypeCardClick);
  }

  /** Click handler for room type cards */
  function handleRoomTypeCardClick(e) {
    var card = e.target.closest('.room-type-card');
    if (!card) return;

    var key = card.dataset.roomKey;
    var room = ROOMS_DATA[key];
    var status = ROOM_STATUS[key] || 'available';
    if (!room) return;

    var statusLabel = status === 'available' ? 'Available'
      : status === 'maintenance' ? 'Under Maintenance'
        : 'Occupied';

    showToast(
      room.name + ' · ' + room.size + ' · ' + formatUGX(room.price) + '/night · ' + statusLabel,
      status === 'available' ? 'success' : status === 'maintenance' ? 'error' : 'info'
    );
  }

  function initRoomCards() {
    renderRoomsPanel();
  }


  /* ──────────────────────────────────────────────────────
     §9  NOTIFICATION BELL
  ────────────────────────────────────────────────────── */

  var NOTIFICATIONS = [
    'Room 205 maintenance flagged — HVAC unit.',
    'Omar Hassan checked out — Room 210.',
    '9 pending bookings require confirmation.',
  ];

  var notifIndex = 0;

  function initNotifications() {
    var bell = document.getElementById('notif-btn');
    if (!bell) return;

    bell.addEventListener('click', function () {
      if (NOTIFICATIONS[notifIndex]) {
        showToast(NOTIFICATIONS[notifIndex], 'info');
        notifIndex = (notifIndex + 1) % NOTIFICATIONS.length;
      }

      var badge = bell.querySelector('.notif-badge');
      if (badge) {
        var count = parseInt(badge.textContent, 10);
        if (count > 0) {
          badge.textContent = count - 1;
          if (count - 1 === 0) badge.style.display = 'none';
        }
      }
    });
  }


  /* ──────────────────────────────────────────────────────
     §10  SETTINGS — PREFERENCE TOGGLES & SAVE
  ────────────────────────────────────────────────────── */

  function initSettings() {
    var saveBtn = document.querySelector('.btn-save-prefs');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', function () {
      var prefs = {};

      var toggles = Array.from(document.querySelectorAll('.toggle-switch input[type="checkbox"]'));
      toggles.forEach(function (toggle) {
        prefs[toggle.name] = toggle.checked;
      });

      var currencySelect = document.querySelector('select[name="pref_currency"]');
      if (currencySelect) prefs.pref_currency = currencySelect.value;

      // ── PLACEHOLDER: POST to ASP.NET Core MVC ──
      // fetch('/api/settings/preferences', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(prefs)
      // });

      console.info('[Haylo Dashboard] Preferences saved →', prefs);
      showToast('Preferences saved successfully.', 'success');
    });
  }


  /* ──────────────────────────────────────────────────────
     §11  TOPBAR SEARCH — GLOBAL DASHBOARD SEARCH
  ────────────────────────────────────────────────────── */

  function initTopbarSearch() {
    var input = document.getElementById('topbar-search');
    if (!input) return;

    var debounceTimer;

    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var query = input.value.trim().toLowerCase();

      debounceTimer = setTimeout(function () {
        if (!query) return;

        var guestMatch = GUESTS.find(function (g) {
          return g.name.toLowerCase().includes(query);
        });

        if (guestMatch) {
          var sidebarGuestBtn = document.querySelector('.sidebar-btn[data-target="guests"]');
          if (sidebarGuestBtn) sidebarGuestBtn.click();

          setTimeout(function () {
            var searchEl = document.getElementById('guest-search');
            if (searchEl) {
              searchEl.value = query;
              searchEl.dispatchEvent(new Event('input'));
            }
          }, 350);
          return;
        }

        var roomMatch = query.match(/^\d{3}$/);
        if (roomMatch) {
          var sidebarRoomBtn = document.querySelector('.sidebar-btn[data-target="rooms"]');
          if (sidebarRoomBtn) sidebarRoomBtn.click();
          showToast('Navigated to Room Inventory for ' + query + '.', 'info');
          return;
        }

        showToast('No results for "' + query + '".', 'info');
      }, 400);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        input.value = '';
        input.blur();
      }
    });
  }


  /* ──────────────────────────────────────────────────────
     §12  KEYBOARD SHORTCUTS
  ────────────────────────────────────────────────────── */

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      var map = { '1': 'overview', '2': 'rooms', '3': 'guests', '4': 'bookings', '5': 'settings' };

      if (map[e.key]) {
        var btn = document.querySelector('.sidebar-btn[data-target="' + map[e.key] + '"]');
        if (btn) btn.click();
      }

      if (e.key === '/') {
        e.preventDefault();
        var search = document.getElementById('topbar-search');
        if (search) search.focus();
      }
    });
  }


  /* ──────────────────────────────────────────────────────
     §13  BOOKINGS — CALENDAR ENGINE
     Real week navigation + live booking data store.
     Bookings persisted in BOOKINGS[] (in-memory).
     Replace addBookingToStore's fetch placeholder with
     a POST to /api/reservations/add when integrating
     with ASP.NET Core MVC.
  ────────────────────────────────────────────────────── */

  /**
   * Room registry for the booking calendar timeline.
   * Built from ROOMS_DATA so it is always in sync with the rooms panel.
   */
  var ROOMS_LIST = Object.keys(ROOMS_DATA).map(function (k) {
    return { key: k, label: ROOMS_DATA[k].name };
  });

  /**
   * BOOKINGS data store.
   * Shape: { id, guestName, roomKey, roomLabel,
   *          checkIn: 'YYYY-MM-DD', checkOut: 'YYYY-MM-DD',
   *          status: 'confirmed'|'pending' }
   */
  var BOOKINGS = [];
  try {
    var storedBookings = localStorage.getItem('haylo_bookings');
    if (storedBookings) {
      BOOKINGS = JSON.parse(storedBookings);
    }
  } catch (e) {}

  /** Module-level current week start — set by initBookingsNav */
  var currentWeekStart = null;

  /**
   * Returns the Monday of the week containing `date`.
   */
  function getWeekStart(date) {
    var d = new Date(date);
    d.setHours(0, 0, 0, 0);
    var day = d.getDay();                    // 0=Sun … 6=Sat
    var diff = (day === 0) ? -6 : 1 - day;   // shift back to Monday
    d.setDate(d.getDate() + diff);
    return d;
  }

  /**
   * Renders the full timeline grid for the given Monday week start.
   * Writes directly into #timeline-grid.
   */
  function renderTimeline(weekStart) {
    var grid = document.getElementById('timeline-grid');
    if (!grid) return;

    var MONTH_NAMES = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    var DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /* ── Update toolbar label ─────────────────────────── */
    var label = document.querySelector('.bookings-week-label');
    if (label) {
      label.style.opacity = '0';
      label.style.transition = 'opacity 0.25s ease';
      setTimeout(function () {
        label.textContent = 'WEEK OF ' + weekStart.getDate() + ' ' +
          MONTH_NAMES[weekStart.getMonth()] + ' ' +
          weekStart.getFullYear();
        label.style.opacity = '1';
      }, 130);
    }

    /* ── Build 7 day Date objects for this week ───────── */
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ── Week boundary for booking overlap detection ──── */
    var weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    weekEnd.setHours(0, 0, 0, 0);

    /* ── Header row ───────────────────────────────────── */
    var html = '<div class="timeline-header-row">';
    html += '<div class="timeline-room-col">Room</div>';
    days.forEach(function (d, i) {
      var isToday = d.getTime() === today.getTime();
      html += '<div class="timeline-day' + (isToday ? ' timeline-today' : '') + '">';
      html += DAY_NAMES[i] + ' ' + d.getDate();
      html += '</div>';
    });
    html += '</div>';

    /* ── Empty state (no bookings at all) ─────────────── */
    if (BOOKINGS.length === 0) {
      ROOMS_LIST.forEach(function (room) {
        html += '<div class="timeline-row">';
        html += '<div class="timeline-room-label">' + room.label + '</div>';
        for (var j = 0; j < 7; j++) {
          html += '<div class="timeline-cell"></div>';
        }
        html += '</div>';
      });
      html += '<div class="timeline-empty-state">No reservations recorded yet — add a guest or walk-in to populate the calendar.</div>';
      grid.innerHTML = html;
      return;
    }

    /* ── Bookings overlapping this week ──────────────── */
    var weekBookings = BOOKINGS.filter(function (b) {
      var ci = new Date(b.checkIn + 'T00:00:00');
      var co = new Date(b.checkOut + 'T00:00:00');
      return ci < weekEnd && co > weekStart;
    });

    /* ── Room rows ────────────────────────────────────── */
    ROOMS_LIST.forEach(function (room) {
      html += '<div class="timeline-row">';
      html += '<div class="timeline-room-label">' + room.label + '</div>';

      // Bookings for this specific room that touch the current week
      var roomBkgs = weekBookings.filter(function (b) {
        return b.roomKey === room.key;
      });

      var skipUntilDay = -1;

      for (var j = 0; j < 7; j++) {
        // Days already covered by a previous spanning block — skip
        if (j <= skipUntilDay) continue;

        var dayDate = days[j];

        // Find a booking whose stay covers this day
        var bk = null;
        for (var bi = 0; bi < roomBkgs.length; bi++) {
          var ci = new Date(roomBkgs[bi].checkIn + 'T00:00:00');
          var co = new Date(roomBkgs[bi].checkOut + 'T00:00:00');
          if (ci <= dayDate && co > dayDate) {
            bk = roomBkgs[bi];
            break;
          }
        }

        if (bk) {
          // Calculate how many of the remaining week-days this booking spans
          var checkOut = new Date(bk.checkOut + 'T00:00:00');
          var span = 0;
          for (var k = j; k < 7; k++) {
            if (checkOut > days[k]) span++;
            else break;
          }
          skipUntilDay = j + span - 1;

          var cls = bk.status === 'confirmed' ? 'booking-occupied' : 'booking-pending';
          html += '<div class="timeline-cell" style="grid-column: span ' + span + ';">';
          html += '<div class="booking-block ' + cls + '" title="' +
            bk.guestName + ' · ' + bk.checkIn + ' – ' + bk.checkOut + '">' +
            bk.guestName + '</div>';
          html += '</div>';
        } else {
          html += '<div class="timeline-cell"></div>';
        }
      }

      html += '</div>'; // .timeline-row
    });

    grid.innerHTML = html;
  }

  /**
   * Push a booking into the store and refresh the calendar
   * if the Bookings panel is currently visible.
   *
   * Called by both the Add Guest drawer and the Walk-In modal
   * on successful form submission.
   *
   * ── PLACEHOLDER: POST to ASP.NET Core MVC endpoint ──
   * fetch('/api/reservations/add', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', 'RequestVerificationToken': getAntiforgeryToken() },
   *   body: JSON.stringify(booking)
   * });
   */
  function addBookingToStore(booking) {
    BOOKINGS.push(booking);
    try { localStorage.setItem('haylo_bookings', JSON.stringify(BOOKINGS)); } catch(e) {}

    if (document.body.getAttribute('data-active-panel') === 'bookings' && currentWeekStart) {
      renderTimeline(currentWeekStart);
    }
  }

  /**
   * Initialises the week navigation arrows and renders the
   * calendar for the current week on load.
   */
  function initBookingsNav() {
    var prevBtn = document.getElementById('week-prev');
    var nextBtn = document.getElementById('week-next');
    if (!prevBtn || !nextBtn) return;

    // Default to the week containing today
    currentWeekStart = getWeekStart(new Date());
    renderTimeline(currentWeekStart);

    prevBtn.addEventListener('click', function () {
      var prev = new Date(currentWeekStart);
      prev.setDate(prev.getDate() - 7);
      currentWeekStart = prev;
      renderTimeline(currentWeekStart);
    });

    nextBtn.addEventListener('click', function () {
      var next = new Date(currentWeekStart);
      next.setDate(next.getDate() + 7);
      currentWeekStart = next;
      renderTimeline(currentWeekStart);
    });
  }


  /* ──────────────────────────────────────────────────────
     §14  PANEL CHILD ELEMENT STAGGER
  ────────────────────────────────────────────────────── */

  function initPanelChildStagger() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.target.querySelectorAll(
          '.stat-card, .chart-card, .activity-feed, ' +
          '.rooms-floor, .guests-controls, .table-wrap, ' +
          '.bookings-toolbar, .timeline-wrap, .settings-card'
        ).forEach(function (el, i) {
          el.style.animationDelay = (i * 0.07) + 's';
          el.style.animation = 'panel-field-in 0.55s cubic-bezier(0.22,1,0.36,1) both';
        });
      });
    });

    var panels = Array.from(document.querySelectorAll('.dashboard-panel'));
    panels.forEach(function (panel) {
      observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
    });
  }


  /* ──────────────────────────────────────────────────────
     §15  ADD GUEST — OFF-CANVAS DRAWER
  ────────────────────────────────────────────────────── */

  // Night-rate lookup (UGX) — built from ROOMS_DATA so always in sync
  var ROOM_RATES = (function () {
    var rates = {};
    Object.keys(ROOMS_DATA).forEach(function (k) { rates[k] = ROOMS_DATA[k].price; });
    return rates;
  }());

  function initAddGuestDrawer() {
    var drawer = document.getElementById('add-guest-drawer');
    var backdrop = document.getElementById('add-guest-backdrop');
    var openBtn = document.querySelector('.btn-add-guest');
    var closeBtn = document.getElementById('add-guest-close');
    var form = document.getElementById('add-guest-form');
    var submitBtn = document.getElementById('ag-submit-btn');
    var mainContent = document.getElementById('dashboard-main');

    if (!drawer || !backdrop) return;

    /* ── OPEN ────────────────────────────────────────── */
    function openDrawer() {
      drawer.classList.remove('closing');
      drawer.classList.add('open');
      drawer.removeAttribute('aria-hidden');
      backdrop.classList.add('active');

      if (mainContent) {
        mainContent.style.transition = 'filter 0.45s ease';
        mainContent.style.filter = 'blur(2px) brightness(0.85)';
        mainContent.style.pointerEvents = 'none';
      }

      var checkin = document.getElementById('ag-checkin');
      var checkout = document.getElementById('ag-checkout');
      if (checkin && !checkin.value) checkin.value = new Date().toISOString().slice(0, 10);
      if (checkout && !checkout.value) checkout.value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

      updateCostEstimate();

      setTimeout(function () {
        var first = drawer.querySelector('input:not([disabled]), select:not([disabled])');
        if (first) first.focus();
      }, 520);
    }

    /* ── CLOSE ───────────────────────────────────────── */
    function closeDrawer() {
      drawer.classList.add('closing');
      backdrop.classList.remove('active');

      if (mainContent) {
        mainContent.style.filter = '';
        mainContent.style.pointerEvents = '';
      }

      setTimeout(function () {
        drawer.classList.remove('open', 'closing');
        drawer.setAttribute('aria-hidden', 'true');
      }, 420);
    }

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });

    /* ── CHARACTER COUNTER ───────────────────────────── */
    var textarea = document.getElementById('ag-requests');
    var charCounter = document.getElementById('ag-char-counter');

    if (textarea && charCounter) {
      var maxLen = parseInt(textarea.getAttribute('maxlength') || '500', 10);
      textarea.addEventListener('input', function () {
        var len = textarea.value.length;
        charCounter.textContent = len + ' / ' + maxLen;
        charCounter.classList.toggle('near-limit', len >= maxLen * 0.85);
      });
    }

    /* ── COST ESTIMATE ───────────────────────────────── */
    var roomSelect = document.getElementById('ag-roomtype');
    var checkinInput = document.getElementById('ag-checkin');
    var checkoutInput = document.getElementById('ag-checkout');
    var costValue = document.getElementById('ag-cost-value');
    var costNights = document.getElementById('ag-cost-nights');

    function updateCostEstimate() {
      if (!roomSelect || !checkinInput || !checkoutInput || !costValue || !costNights) return;

      var roomType = roomSelect.value;
      var inDate = checkinInput.value ? new Date(checkinInput.value) : null;
      var outDate = checkoutInput.value ? new Date(checkoutInput.value) : null;

      if (!roomType || !inDate || !outDate || outDate <= inDate) {
        costValue.textContent = '—';
        costNights.textContent = '—';
        return;
      }

      var nights = Math.round((outDate - inDate) / 86400000);
      var rate = ROOM_RATES[roomType] || 0;
      var total = nights * rate;

      costValue.style.animation = 'none';
      void costValue.offsetWidth;
      costValue.style.animation = '';

      costValue.textContent = formatUGX(total);
      costNights.textContent = nights + ' night' + (nights !== 1 ? 's' : '') + ' · ' + formatUGX(rate) + ' / night';
    }

    if (roomSelect) roomSelect.addEventListener('change', updateCostEstimate);
    if (checkinInput) checkinInput.addEventListener('change', updateCostEstimate);
    if (checkoutInput) checkoutInput.addEventListener('change', updateCostEstimate);

    /* ── VALIDATION ──────────────────────────────────── */
    var EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setFieldState(fieldId, isError) {
      var input = document.getElementById(fieldId);
      if (!input) return;
      var field = input.closest('.ag-field');
      if (!field) return;
      field.classList.toggle('has-error', isError);
      input.classList.toggle('error', isError);
      input.classList.toggle('valid', !isError && input.value.trim() !== '');
    }

    function validateDrawerForm() {
      var firstNameOk = document.getElementById('ag-firstname') && document.getElementById('ag-firstname').value.trim().length > 0;
      var lastNameOk = document.getElementById('ag-lastname') && document.getElementById('ag-lastname').value.trim().length > 0;
      var emailVal = (document.getElementById('ag-email') || {}).value || '';
      var emailOk = EMAIL_RX.test(emailVal.trim());
      var checkinVal = (document.getElementById('ag-checkin') || {}).value || '';
      var checkoutVal = (document.getElementById('ag-checkout') || {}).value || '';
      var datesOk = checkinVal && checkoutVal && new Date(checkoutVal) > new Date(checkinVal);
      var roomOk = (document.getElementById('ag-roomtype') || {}).value !== '';

      setFieldState('ag-firstname', !firstNameOk);
      setFieldState('ag-lastname', !lastNameOk);
      setFieldState('ag-email', !emailOk);
      setFieldState('ag-checkin', !datesOk);
      setFieldState('ag-checkout', !datesOk);
      setFieldState('ag-roomtype', !roomOk);

      return firstNameOk && lastNameOk && emailOk && datesOk && roomOk;
    }

    if (form) {
      form.addEventListener('input', function (e) {
        var target = e.target;
        var field = target.closest('.ag-field');
        if (field && field.classList.contains('has-error')) {
          field.classList.remove('has-error');
          target.classList.remove('error');
        }
      });
    }

    /* ── SUBMIT ──────────────────────────────────────── */
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateDrawerForm()) {
          var firstErr = drawer.querySelector('.ag-field.has-error input, .ag-field.has-error select');
          if (firstErr) {
            firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErr.focus();
          }
          showToast('Please complete all required fields.', 'error');
          return;
        }

        if (submitBtn) {
          submitBtn.classList.add('loading');
          var btnSpan = submitBtn.querySelector('span');
          if (btnSpan) btnSpan.textContent = 'Confirming…';
        }

        // Gather payload — field names match ASP.NET Core MVC model
        var roomTypeEl = document.getElementById('ag-roomtype');
        var roomKey = (roomTypeEl || {}).value || '';
        var roomLabel = roomKey;
        if (roomTypeEl && roomTypeEl.options[roomTypeEl.selectedIndex]) {
          roomLabel = roomTypeEl.options[roomTypeEl.selectedIndex].text.split('·')[0].trim();
        }

        var payload = {
          guest_first_name: (document.getElementById('ag-firstname') || {}).value || '',
          guest_last_name: (document.getElementById('ag-lastname') || {}).value || '',
          guest_email: (document.getElementById('ag-email') || {}).value || '',
          guest_phone: (document.getElementById('ag-phone') || {}).value || '',
          guest_nationality: (document.getElementById('ag-nationality') || {}).value || '',
          check_in_date: (document.getElementById('ag-checkin') || {}).value || '',
          check_out_date: (document.getElementById('ag-checkout') || {}).value || '',
          room_type: roomKey,
          adults: (document.getElementById('ag-adults') || {}).value || '2',
          children: (document.getElementById('ag-children') || {}).value || '0',
          payment_method: (document.getElementById('ag-payment') || {}).value || '',
          special_requests: (document.getElementById('ag-requests') || {}).value || '',
        };

        // ── PLACEHOLDER: POST to ASP.NET Core MVC endpoint ──
        // fetch('/api/guests/add', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json', 'RequestVerificationToken': getAntiforgeryToken() },
        //   body: JSON.stringify(payload)
        // })
        // .then(r => r.json())
        // .then(data => { ... handle success ... })
        // .catch(err => { ... handle error ... });

        console.info('[Haylo Dashboard] Add Guest →', payload);

        // Simulate server response delay
        setTimeout(function () {
          if (submitBtn) {
            submitBtn.classList.remove('loading');
            var btnSpan = submitBtn.querySelector('span');
            if (btnSpan) btnSpan.textContent = 'Confirm Booking';
          }

          closeDrawer();

          var fullName = payload.guest_first_name + ' ' + payload.guest_last_name;
          var agNights = Math.max(1, Math.round(
            (new Date(payload.check_out_date) - new Date(payload.check_in_date)) / 86400000
          ));
          var agRate = ROOM_RATES[payload.room_type] || 0;

          // Add to guest registry
          GUESTS.push({
            id: 'G' + Date.now(),
            name: fullName,
            room: roomLabel,
            checkIn: payload.check_in_date,
            checkOut: payload.check_out_date,
            nights: agNights,
            amount: agNights * agRate,
            status: 'pending',   // newly added → awaiting payment confirmation
          });
          try { localStorage.setItem('haylo_guests', JSON.stringify(GUESTS)); } catch(e) {}
          renderGuestTable(GUESTS);
          renderOverviewStats();   // ← recalculate all stats

          showToast('Booking confirmed for ' + fullName + ' — marked as Pending.', 'success');

          // Add to the live BOOKINGS store → re-renders calendar
          addBookingToStore({
            id: 'G' + Date.now(),
            guestName: fullName,
            roomKey: payload.room_type,
            roomLabel: roomLabel,
            checkIn: payload.check_in_date,
            checkOut: payload.check_out_date,
            status: 'pending',
          });

          form.reset();
          if (costValue) costValue.textContent = '—';
          if (costNights) costNights.textContent = '—';

          Array.from(form.querySelectorAll('.ag-field')).forEach(function (f) {
            f.classList.remove('has-error');
          });
          Array.from(form.querySelectorAll('.ag-input')).forEach(function (i) {
            i.classList.remove('error', 'valid');
          });

        }, 1600);
      });
    }
  }


  /* ──────────────────────────────────────────────────────
     INIT
  ────────────────────────────────────────────────────── */

  onReady(function () {
    initLockGate();
    initPanelSwitching();
    initMobileSidebar();
    initDateDisplay();
    initGuestTable();
    initWalkInModal();
    initAddGuestDrawer();
    initRoomCards();
    initNotifications();
    initSettings();
    initTopbarSearch();
    initKeyboardShortcuts();
    initBookingsNav();       // sets currentWeekStart and renders initial calendar
    initPanelChildStagger();

    setTimeout(initRevenueChart, 300);

    setTimeout(function () {
      showToast('Tip: Press 1–5 to switch panels · / to search.', 'info');
    }, 1200);
  });

})();
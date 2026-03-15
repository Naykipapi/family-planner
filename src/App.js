import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// CONFIG
// ============================================
const CONFIG = {
  CLIENT_ID: '1018765120682-qka33op2s5qvs95uks63otmr9jiljgq7.apps.googleusercontent.com',
  API_KEY: 'AIzaSyBQlk6Ea_nl05ucjNFb2eMS4WDhIJc7Cs8',
  SPREADSHEET_ID: '1XebU3JkjbabjvVU_4ABmmrIPKNjrFTa9O5XKMqti2xc',
  CALENDAR_ID: '46706267f7316987a9408df500be5b14f9f0da5315547ad35ddde7773eefa330@group.calendar.google.com',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar',
  BUDGET_PER_PERSON: 1200,
  USERS: ['Telman', 'Lena'],
  EXPENSE_CATEGORIES: ['Food & Drink', 'Shopping', 'Activities & Entertainment', 'Travel', 'Health & Wellness'],
  EVENT_CATEGORIES: ['Social', 'Travel', 'Kids', 'Work'],
  ACCOUNTS: ['ING', 'DB'],
};

// ============================================
// STYLES
// ============================================
const styles = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #fafaf8;
    --bg-card: #ffffff;
    --bg-hover: #f5f4f2;
    --bg-input: #f5f4f2;
    --border: #e8e6e3;
    --border-focus: #1a1a1a;
    --text-primary: #1a1a1a;
    --text-secondary: #6b6963;
    --text-tertiary: #9b978f;
    --accent: #1a1a1a;
    --green: #2d8a4e;
    --green-bg: #e8f5e9;
    --amber: #c17f24;
    --amber-bg: #fff3e0;
    --red: #c62828;
    --red-bg: #ffebee;
    --font-heading: 'DM Serif Display', serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 10px;
    --radius-sm: 6px;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-lg: 0 4px 12px rgba(0,0,0,0.08);
  }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .app {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    padding-bottom: 72px;
  }

  /* Header */
  .header {
    padding: 16px 20px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header h1 {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 400;
    letter-spacing: -0.3px;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .user-pill {
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--bg-input);
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 500;
  }
  .sign-out-btn {
    font-size: 12px;
    color: var(--text-tertiary);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    font-family: var(--font-body);
  }

  /* Tab Bar (bottom, iOS-style) */
  .tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-card);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: center;
    gap: 0;
    padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
    z-index: 100;
  }
  .tab-btn {
    flex: 1;
    max-width: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 0;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 10px;
    font-weight: 500;
    color: var(--text-tertiary);
    transition: color 0.15s;
  }
  .tab-btn.active { color: var(--text-primary); }
  .tab-btn svg { width: 22px; height: 22px; }

  /* Budget Card */
  .budget-card {
    margin: 0 16px 16px;
    padding: 20px;
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }
  .budget-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 14px;
  }
  .budget-label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }
  .budget-amount {
    font-family: var(--font-heading);
    font-size: 28px;
    letter-spacing: -0.5px;
  }
  .budget-bar-track {
    height: 6px;
    background: var(--bg-input);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .budget-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease, background 0.3s ease;
  }
  .budget-bar-fill.green { background: var(--green); }
  .budget-bar-fill.amber { background: var(--amber); }
  .budget-bar-fill.red { background: var(--red); }
  .budget-sub {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  /* View Toggle */
  .view-toggle {
    display: flex;
    margin: 0 16px 16px;
    background: var(--bg-input);
    border-radius: var(--radius-sm);
    padding: 3px;
    gap: 2px;
  }
  .view-toggle button {
    flex: 1;
    padding: 7px 0;
    border: none;
    background: transparent;
    border-radius: 5px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
  }
  .view-toggle button.active {
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: var(--shadow);
  }

  /* Section */
  .section {
    margin: 0 16px 20px;
  }
  .section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-tertiary);
    font-weight: 600;
    margin-bottom: 10px;
    padding: 0 4px;
  }

  /* Category Breakdown */
  .cat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    margin-bottom: -1px;
    font-size: 14px;
  }
  .cat-row:first-child { border-radius: var(--radius) var(--radius) 0 0; }
  .cat-row:last-child { border-radius: 0 0 var(--radius) var(--radius); margin-bottom: 0; }
  .cat-row:only-child { border-radius: var(--radius); }
  .cat-name { color: var(--text-secondary); }
  .cat-amount { font-weight: 600; font-variant-numeric: tabular-nums; }

  /* Expense List */
  .expense-item {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    margin-bottom: -1px;
    gap: 12px;
  }
  .expense-item:first-child { border-radius: var(--radius) var(--radius) 0 0; }
  .expense-item:last-child { border-radius: 0 0 var(--radius) var(--radius); margin-bottom: 0; }
  .expense-item:only-child { border-radius: var(--radius); }
  .expense-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--bg-input);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .expense-details { flex: 1; min-width: 0; }
  .expense-merchant {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .expense-meta {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 1px;
  }
  .expense-amount {
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  /* Add Form */
  .add-form-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 10px;
    margin-bottom: 12px;
    background: var(--bg-card);
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.15s;
  }
  .add-form-toggle:hover {
    border-color: var(--text-tertiary);
    color: var(--text-primary);
  }
  .add-form {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
  }
  .form-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }
  .form-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .form-field label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .form-field input, .form-field select {
    padding: 9px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 14px;
    background: var(--bg-input);
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
  }
  .form-field input:focus, .form-field select:focus {
    border-color: var(--border-focus);
  }
  .form-actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }
  .btn-primary {
    flex: 1;
    padding: 10px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .btn-primary:hover { opacity: 0.85; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-secondary {
    padding: 10px 16px;
    background: var(--bg-input);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  /* Calendar */
  .cal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 16px 12px;
  }
  .cal-header h2 {
    font-family: var(--font-heading);
    font-size: 18px;
    font-weight: 400;
  }
  .cal-nav {
    display: flex;
    gap: 4px;
  }
  .cal-nav button {
    width: 32px;
    height: 32px;
    border: 1px solid var(--border);
    background: var(--bg-card);
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--text-secondary);
    transition: all 0.15s;
  }
  .cal-nav button:hover { border-color: var(--text-tertiary); }

  .cal-view-toggle {
    display: flex;
    margin: 0 16px 12px;
    background: var(--bg-input);
    border-radius: var(--radius-sm);
    padding: 3px;
  }
  .cal-view-toggle button {
    flex: 1;
    padding: 6px 0;
    border: none;
    background: transparent;
    border-radius: 5px;
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
  }
  .cal-view-toggle button.active {
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: var(--shadow);
  }

  /* Month Grid */
  .month-grid {
    margin: 0 16px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .month-grid-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid var(--border);
  }
  .month-grid-header span {
    padding: 8px 0;
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .month-grid-body {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .month-day {
    min-height: 64px;
    padding: 4px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    font-size: 11px;
  }
  .month-day:nth-child(7n) { border-right: none; }
  .month-day.other-month { opacity: 0.3; }
  .month-day.today .day-number {
    background: var(--accent);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .day-number {
    font-weight: 600;
    font-size: 11px;
    margin-bottom: 2px;
    color: var(--text-secondary);
  }
  .day-event {
    font-size: 9px;
    padding: 1px 3px;
    border-radius: 2px;
    margin-bottom: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }
  .day-event.social { background: #e3f2fd; color: #1565c0; }
  .day-event.travel { background: #fce4ec; color: #c62828; }
  .day-event.kids { background: #fff3e0; color: #e65100; }
  .day-event.work { background: #f3e5f5; color: #7b1fa2; }
  .day-event.default { background: var(--bg-input); color: var(--text-secondary); }

  /* Week View */
  .week-view {
    margin: 0 16px 16px;
  }
  .week-day-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    margin-bottom: -1px;
    padding: 12px 14px;
  }
  .week-day-card:first-child { border-radius: var(--radius) var(--radius) 0 0; }
  .week-day-card:last-child { border-radius: 0 0 var(--radius) var(--radius); }
  .week-day-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-tertiary);
    margin-bottom: 6px;
  }
  .week-day-label.today { color: var(--accent); }
  .week-event {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;
  }
  .week-event-title { font-weight: 500; }
  .week-event-time { color: var(--text-tertiary); font-size: 12px; }
  .week-no-events {
    font-size: 12px;
    color: var(--text-tertiary);
    font-style: italic;
  }

  /* Event List */
  .event-item {
    display: flex;
    align-items: flex-start;
    padding: 12px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    margin-bottom: -1px;
    gap: 12px;
  }
  .event-item:first-child { border-radius: var(--radius) var(--radius) 0 0; }
  .event-item:last-child { border-radius: 0 0 var(--radius) var(--radius); margin-bottom: 0; }
  .event-item:only-child { border-radius: var(--radius); }
  .event-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }
  .event-dot.social { background: #1565c0; }
  .event-dot.travel { background: #c62828; }
  .event-dot.kids { background: #e65100; }
  .event-dot.work { background: #7b1fa2; }
  .event-dot.default { background: var(--text-tertiary); }
  .event-details { flex: 1; }
  .event-title { font-size: 14px; font-weight: 500; }
  .event-meta { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

  /* Sign In */
  .sign-in-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    min-height: 100dvh;
    padding: 40px 20px;
    text-align: center;
  }
  .sign-in-screen h1 {
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: 400;
    margin-bottom: 8px;
  }
  .sign-in-screen p {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 32px;
  }
  .google-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: var(--shadow);
    transition: box-shadow 0.15s;
  }
  .google-btn:hover { box-shadow: var(--shadow-lg); }
  .google-btn svg { width: 20px; height: 20px; }

  /* Loading */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: var(--text-tertiary);
    font-size: 14px;
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 32px 16px;
    color: var(--text-tertiary);
    font-size: 13px;
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 84px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    z-index: 200;
    animation: toastIn 0.2s ease, toastOut 0.2s ease 2s forwards;
    white-space: nowrap;
  }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }

  /* Month History */
  .month-history-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    margin-bottom: -1px;
    font-size: 14px;
  }
  .month-history-row:first-child { border-radius: var(--radius) var(--radius) 0 0; }
  .month-history-row:last-child { border-radius: 0 0 var(--radius) var(--radius); }
  .month-history-label { color: var(--text-secondary); }
  .month-history-amount { font-weight: 600; font-variant-numeric: tabular-nums; }
`;

// ============================================
// CATEGORY ICONS
// ============================================
const CATEGORY_ICONS = {
  'Food & Drink': '🍽',
  'Shopping': '🛍',
  'Activities & Entertainment': '🎭',
  'Travel': '✈️',
  'Health & Wellness': '💊',
};

// ============================================
// HELPERS
// ============================================
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const dayNamesFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatCurrency(n) {
  return '€' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(d) {
  const date = new Date(d);
  return date.getDate() + ' ' + monthNames[date.getMonth()].slice(0, 3);
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function getEventCategory(event) {
  const desc = (event.description || '').toLowerCase();
  if (desc.includes('category: travel')) return 'travel';
  if (desc.includes('category: social')) return 'social';
  if (desc.includes('category: kids')) return 'kids';
  if (desc.includes('category: work')) return 'work';
  return 'default';
}

function getEventWho(event) {
  const title = event.summary || '';
  const match = title.match(/^\[(\w+)\]/);
  return match ? match[1] : 'Family';
}

function cleanEventTitle(event) {
  return (event.summary || '').replace(/^\[\w+\]\s*/, '');
}

// ============================================
// GOOGLE AUTH HOOK
// ============================================
function useGoogleAuth() {
  const [user, setUser] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const [gapiReady, setGapiReady] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);

  useEffect(() => {
    // Load GAPI
    const loadGapi = () => {
      if (window.gapi) {
        window.gapi.load('client', async () => {
          await window.gapi.client.init({ apiKey: CONFIG.API_KEY });
          await window.gapi.client.load('sheets', 'v4');
          await window.gapi.client.load('calendar', 'v3');
          setGapiReady(true);
        });
      } else {
        setTimeout(loadGapi, 100);
      }
    };

    // Load GSI
    const loadGsi = () => {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CONFIG.CLIENT_ID,
          scope: CONFIG.SCOPES,
          callback: (resp) => {
            if (resp.access_token) {
              // Decode user info from the access token
              fetchUserInfo(resp.access_token);
            }
          },
        });
        setTokenClient(client);
        setGsiReady(true);
      } else {
        setTimeout(loadGsi, 100);
      }
    };

    loadGapi();
    loadGsi();
  }, []);

  const fetchUserInfo = async (accessToken) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const info = await res.json();
      const firstName = (info.given_name || info.name || '').split(' ')[0];
      const matchedUser = CONFIG.USERS.find(u => u.toLowerCase() === firstName.toLowerCase());
      setUser({
        name: matchedUser || firstName,
        email: info.email,
        picture: info.picture,
      });
    } catch (err) {
      console.error('Failed to get user info', err);
    }
  };

  const signIn = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    }
  };

  const signOut = () => {
    const token = window.gapi?.client?.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken(null);
    }
    setUser(null);
  };

  return { user, signIn, signOut, ready: gapiReady && gsiReady };
}

// ============================================
// GOOGLE SHEETS HOOK
// ============================================
function useSheets() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: 'Expenses!A2:H1000',
      });
      const rows = response.result.values || [];
      const mapped = rows.map((r, i) => ({
        id: i,
        merchant: r[0] || '',
        amount: parseFloat(r[1]) || 0,
        date: r[2] || '',
        category: r[3] || '',
        who: r[4] || '',
        tag: r[5] || '',
        notes: r[6] || '',
        account: r[7] || '',
      }));
      setExpenses(mapped);
    } catch (err) {
      console.error('Sheets fetch error:', err);
    }
    setLoading(false);
  }, []);

  const addExpense = useCallback(async (expense) => {
    try {
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: 'Expenses!A:H',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            expense.merchant,
            expense.amount,
            expense.date,
            expense.category,
            expense.who,
            expense.tag || '',
            expense.notes || '',
            expense.account || '',
          ]],
        },
      });
      await fetchExpenses();
      return true;
    } catch (err) {
      console.error('Sheets append error:', err);
      return false;
    }
  }, [fetchExpenses]);

  return { expenses, loading, fetchExpenses, addExpense };
}

// ============================================
// GOOGLE CALENDAR HOOK
// ============================================
function useCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async (timeMin, timeMax) => {
    setLoading(true);
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: CONFIG.CALENDAR_ID,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 200,
      });
      setEvents(response.result.items || []);
    } catch (err) {
      console.error('Calendar fetch error:', err);
    }
    setLoading(false);
  }, []);

  const addEvent = useCallback(async (event) => {
    try {
      const who = event.who || 'Family';
      const title = `[${who}] ${event.title}`;
      const description = `Category: ${event.category || 'Social'}`;

      const resource = { summary: title, description };
      if (event.location) resource.location = event.location;

      if (event.allDay) {
        resource.start = { date: event.startDate };
        resource.end = { date: event.endDate || event.startDate };
      } else {
        resource.start = { dateTime: event.startDateTime, timeZone: 'Europe/Berlin' };
        resource.end = { dateTime: event.endDateTime, timeZone: 'Europe/Berlin' };
      }

      await window.gapi.client.calendar.events.insert({
        calendarId: CONFIG.CALENDAR_ID,
        resource,
      });
      return true;
    } catch (err) {
      console.error('Calendar insert error:', err);
      return false;
    }
  }, []);

  return { events, loading, fetchEvents, addEvent };
}

// ============================================
// SVG ICONS
// ============================================
const Icons = {
  finances: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  left: '‹',
  right: '›',
};

// ============================================
// ADD EXPENSE FORM
// ============================================
function AddExpenseForm({ user, onAdd, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    merchant: '', amount: '', date: today, category: CONFIG.EXPENSE_CATEGORIES[0],
    who: user?.name || 'Telman', tag: '', notes: '', account: CONFIG.ACCOUNTS[0],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.merchant || !form.amount) return;
    setSaving(true);
    const success = await onAdd({ ...form, amount: parseFloat(form.amount) });
    setSaving(false);
    if (success) onCancel();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="add-form">
      <div className="form-row">
        <div className="form-field" style={{ flex: 2 }}>
          <label>Merchant</label>
          <input value={form.merchant} onChange={e => set('merchant', e.target.value)} placeholder="e.g. Rewe" />
        </div>
        <div className="form-field" style={{ flex: 1 }}>
          <label>Amount €</label>
          <input type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {CONFIG.EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Who</label>
          <select value={form.who} onChange={e => set('who', e.target.value)}>
            {CONFIG.USERS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Account</label>
          <select value={form.account} onChange={e => set('account', e.target.value)}>
            {CONFIG.ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Tag (optional)</label>
          <input value={form.tag} onChange={e => set('tag', e.target.value)} placeholder="e.g. Rome trip" />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={!form.merchant || !form.amount || saving}>
          {saving ? 'Saving...' : 'Add Expense'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// ADD EVENT FORM
// ============================================
function AddEventForm({ user, onAdd, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '', startDate: today, startTime: '09:00', endDate: today, endTime: '10:00',
    allDay: false, location: '', who: user?.name || 'Telman', category: CONFIG.EVENT_CATEGORIES[0],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title) return;
    setSaving(true);
    const eventData = {
      title: form.title,
      who: form.who,
      category: form.category,
      location: form.location,
      allDay: form.allDay,
    };
    if (form.allDay) {
      eventData.startDate = form.startDate;
      eventData.endDate = form.endDate;
    } else {
      eventData.startDateTime = `${form.startDate}T${form.startTime}:00`;
      eventData.endDateTime = `${form.endDate}T${form.endTime}:00`;
    }
    const success = await onAdd(eventData);
    setSaving(false);
    if (success) onCancel();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="add-form">
      <div className="form-row">
        <div className="form-field">
          <label>Title</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Dinner with friends" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Who</label>
          <select value={form.who} onChange={e => set('who', e.target.value)}>
            {[...CONFIG.USERS, 'Family'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {CONFIG.EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field" style={{ flex: 'none' }}>
          <label>All Day</label>
          <input type="checkbox" checked={form.allDay} onChange={e => set('allDay', e.target.checked)} style={{ width: 18, height: 18, marginTop: 4 }} />
        </div>
        <div className="form-field">
          <label>Start Date</label>
          <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        </div>
        {!form.allDay && (
          <div className="form-field">
            <label>Start Time</label>
            <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>End Date</label>
          <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
        </div>
        {!form.allDay && (
          <div className="form-field">
            <label>End Time</label>
            <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Location (optional)</label>
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Restaurant Zum Löwen" />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={!form.title || saving}>
          {saving ? 'Saving...' : 'Add Event'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// FINANCES TAB
// ============================================
function FinancesTab({ user, expenses, loading, onAddExpense, onRefresh }) {
  const [viewMode, setViewMode] = useState('individual'); // individual | combined
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { onRefresh(); }, [onRefresh]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter for current month
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Filter by view
  const filtered = viewMode === 'individual'
    ? monthExpenses.filter(e => e.who === user.name)
    : monthExpenses;

  const totalSpent = filtered.reduce((s, e) => s + e.amount, 0);
  const budget = viewMode === 'individual' ? CONFIG.BUDGET_PER_PERSON : CONFIG.BUDGET_PER_PERSON * 2;
  const remaining = budget - totalSpent;
  const pct = Math.min((totalSpent / budget) * 100, 100);
  const barColor = pct < 60 ? 'green' : pct < 85 ? 'amber' : 'red';

  // Category breakdown
  const byCategory = {};
  filtered.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  const categoryList = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  // Month history (last 6 months)
  const monthHistory = [];
  for (let i = 0; i < 6; i++) {
    const m = new Date(currentYear, currentMonth - i, 1);
    const mExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() &&
        (viewMode === 'combined' || e.who === user.name);
    });
    const total = mExpenses.reduce((s, e) => s + e.amount, 0);
    if (i > 0 || total > 0 || mExpenses.length > 0) {
      monthHistory.push({ label: monthNames[m.getMonth()] + ' ' + m.getFullYear(), total });
    }
  }

  // Recent expenses (latest first)
  const recent = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleAdd = async (expense) => {
    const success = await onAddExpense(expense);
    return success;
  };

  return (
    <>
      {/* View Toggle */}
      <div className="view-toggle">
        <button className={viewMode === 'individual' ? 'active' : ''} onClick={() => setViewMode('individual')}>
          {user.name}
        </button>
        <button className={viewMode === 'combined' ? 'active' : ''} onClick={() => setViewMode('combined')}>
          Combined
        </button>
      </div>

      {/* Budget Card */}
      <div className="budget-card">
        <div className="budget-header">
          <span className="budget-label">{monthNames[currentMonth]} Budget</span>
          <span className="budget-amount">{formatCurrency(remaining)}</span>
        </div>
        <div className="budget-bar-track">
          <div className={`budget-bar-fill ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="budget-sub">
          {formatCurrency(totalSpent)} of {formatCurrency(budget)} spent
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryList.length > 0 && (
        <div className="section">
          <div className="section-title">By Category</div>
          {categoryList.map(([cat, amount]) => (
            <div className="cat-row" key={cat}>
              <span className="cat-name">{CATEGORY_ICONS[cat] || '•'} {cat}</span>
              <span className="cat-amount">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense */}
      <div className="section">
        <div className="section-title">Expenses</div>
        {showForm ? (
          <AddExpenseForm user={user} onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        ) : (
          <button className="add-form-toggle" onClick={() => setShowForm(true)}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Expense
          </button>
        )}
        {loading ? (
          <div className="loading">Loading expenses...</div>
        ) : recent.length === 0 ? (
          <div className="empty-state">No expenses this month yet.</div>
        ) : (
          recent.map((e, i) => (
            <div className="expense-item" key={i}>
              <div className="expense-icon">{CATEGORY_ICONS[e.category] || '•'}</div>
              <div className="expense-details">
                <div className="expense-merchant">{e.merchant}</div>
                <div className="expense-meta">{formatDate(e.date)} · {e.category}{e.account ? ` · ${e.account}` : ''}</div>
              </div>
              <div className="expense-amount">{formatCurrency(e.amount)}</div>
            </div>
          ))
        )}
      </div>

      {/* Month History */}
      {monthHistory.length > 1 && (
        <div className="section">
          <div className="section-title">Monthly History</div>
          {monthHistory.map((m, i) => (
            <div className="month-history-row" key={i}>
              <span className="month-history-label">{m.label}</span>
              <span className="month-history-amount">{formatCurrency(m.total)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ============================================
// CALENDAR TAB
// ============================================
function CalendarTab({ user, events: calEvents, loading, onFetchEvents, onAddEvent }) {
  const [calView, setCalView] = useState('month'); // month | week
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch events whenever month/view changes
  useEffect(() => {
    if (calView === 'month') {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      onFetchEvents(start, end);
    } else {
      const day = currentDate.getDay();
      const start = new Date(currentDate);
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59);
      onFetchEvents(start, end);
    }
  }, [calView, year, month, currentDate, onFetchEvents]);

  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (calView === 'month') {
      d.setMonth(d.getMonth() + dir);
    } else {
      d.setDate(d.getDate() + (dir * 7));
    }
    setCurrentDate(d);
  };

  const handleAdd = async (event) => {
    const success = await onAddEvent(event);
    if (success) {
      // Re-fetch
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      onFetchEvents(start, end);
    }
    return success;
  };

  // Build month grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells = [];
  // Previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, otherMonth: true, date: new Date(year, month - 1, daysInPrev - i) });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, otherMonth: false, date: new Date(year, month, i), isToday: isSameDay(new Date(year, month, i), today) });
  }
  // Next month
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, otherMonth: true, date: new Date(year, month + 1, i) });
  }

  // Map events to dates
  const getEventsForDate = (date) => {
    return calEvents.filter(ev => {
      const start = new Date(ev.start?.dateTime || ev.start?.date);
      const end = new Date(ev.end?.dateTime || ev.end?.date);
      // For all-day events, end date is exclusive
      if (ev.start?.date) {
        const endAdjusted = new Date(end);
        endAdjusted.setDate(endAdjusted.getDate() - 1);
        return date >= start && date <= endAdjusted;
      }
      return isSameDay(start, date);
    });
  };

  // Week view data
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  return (
    <>
      {/* Calendar View Toggle */}
      <div className="cal-view-toggle">
        <button className={calView === 'month' ? 'active' : ''} onClick={() => setCalView('month')}>Month</button>
        <button className={calView === 'week' ? 'active' : ''} onClick={() => setCalView('week')}>Week</button>
      </div>

      {/* Calendar Header */}
      <div className="cal-header">
        <h2>{calView === 'month' ? `${monthNames[month]} ${year}` : `Week of ${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`}</h2>
        <div className="cal-nav">
          <button onClick={() => navigate(-1)}>{Icons.left}</button>
          <button onClick={() => navigate(1)}>{Icons.right}</button>
        </div>
      </div>

      {/* Add Event */}
      <div className="section">
        {showForm ? (
          <AddEventForm user={user} onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        ) : (
          <button className="add-form-toggle" onClick={() => setShowForm(true)}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Event
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading events...</div>}

      {/* Month View */}
      {calView === 'month' && !loading && (
        <div className="month-grid">
          <div className="month-grid-header">
            {dayNames.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="month-grid-body">
            {cells.map((cell, i) => {
              const dayEvents = getEventsForDate(cell.date);
              return (
                <div key={i} className={`month-day ${cell.otherMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}`}>
                  <div className="day-number">{cell.day}</div>
                  {dayEvents.slice(0, 3).map((ev, j) => (
                    <div key={j} className={`day-event ${getEventCategory(ev)}`}>
                      {cleanEventTitle(ev)}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div className="day-event default">+{dayEvents.length - 3} more</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {calView === 'week' && !loading && (
        <div className="week-view">
          {weekDays.map((day, i) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, today);
            return (
              <div className="week-day-card" key={i}>
                <div className={`week-day-label ${isToday ? 'today' : ''}`}>
                  {dayNamesFull[day.getDay()]} {day.getDate()} {monthNames[day.getMonth()].slice(0, 3)}
                </div>
                {dayEvents.length === 0 ? (
                  <div className="week-no-events">No events</div>
                ) : (
                  dayEvents.map((ev, j) => {
                    const start = ev.start?.dateTime ? new Date(ev.start.dateTime) : null;
                    const timeStr = start ? start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'All day';
                    return (
                      <div className="week-event" key={j}>
                        <span className="week-event-title">{cleanEventTitle(ev)}</span>
                        <span className="week-event-time">{timeStr}</span>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming Events List */}
      <div className="section">
        <div className="section-title">Upcoming</div>
        {calEvents.length === 0 && !loading ? (
          <div className="empty-state">No events this period.</div>
        ) : (
          calEvents.slice(0, 10).map((ev, i) => {
            const cat = getEventCategory(ev);
            const start = ev.start?.dateTime ? new Date(ev.start.dateTime) : new Date(ev.start?.date);
            const timeStr = ev.start?.dateTime
              ? start.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + ' · ' + start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
              : start.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + ' · All day';
            return (
              <div className="event-item" key={i}>
                <div className={`event-dot ${cat}`} />
                <div className="event-details">
                  <div className="event-title">{cleanEventTitle(ev)}</div>
                  <div className="event-meta">{getEventWho(ev)} · {timeStr}{ev.location ? ` · ${ev.location}` : ''}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ============================================
// SIGN IN SCREEN
// ============================================
function SignInScreen({ onSignIn, ready }) {
  return (
    <div className="sign-in-screen">
      <h1>Family Planner</h1>
      <p>Sign in with Google to get started</p>
      <button className="google-btn" onClick={onSignIn} disabled={!ready}>
        <svg viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const { user, signIn, signOut, ready } = useGoogleAuth();
  const { expenses, loading: expLoading, fetchExpenses, addExpense } = useSheets();
  const { events, loading: calLoading, fetchEvents, addEvent } = useCalendar();
  const [tab, setTab] = useState('finances');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleAddExpense = async (expense) => {
    const success = await addExpense(expense);
    if (success) showToast('Expense added');
    return success;
  };

  const handleAddEvent = async (event) => {
    const success = await addEvent(event);
    if (success) showToast('Event created');
    return success;
  };

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <SignInScreen onSignIn={signIn} ready={ready} />
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <h1>Family Planner</h1>
          <div className="header-right">
            <span className="user-pill">{user.name}</span>
            <button className="sign-out-btn" onClick={signOut}>Sign out</button>
          </div>
        </div>

        {/* Tab Content */}
        {tab === 'finances' && (
          <FinancesTab
            user={user}
            expenses={expenses}
            loading={expLoading}
            onAddExpense={handleAddExpense}
            onRefresh={fetchExpenses}
          />
        )}
        {tab === 'calendar' && (
          <CalendarTab
            user={user}
            events={events}
            loading={calLoading}
            onFetchEvents={fetchEvents}
            onAddEvent={handleAddEvent}
          />
        )}

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}

        {/* Tab Bar */}
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'finances' ? 'active' : ''}`} onClick={() => setTab('finances')}>
            {Icons.finances}
            <span>Finances</span>
          </button>
          <button className={`tab-btn ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')}>
            {Icons.calendar}
            <span>Calendar</span>
          </button>
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect, useCallback } from 'react';

// ============================================
// CONFIG
// ============================================
const CONFIG = {
  CLIENT_ID: '1018765120682-qka33op2s5qvs95uks63otmr9jiljgq7.apps.googleusercontent.com',
  API_KEY: 'AIzaSyBQlk6Ea_nl05ucjNFb2eMS4WDhIJc7Cs8',
  SPREADSHEET_ID: '1XebU3JkjbabjvVU_4ABmmrIPKNjrFTa9O5XKMqti2xc',
  CALENDAR_ID: '46706267f7316987a9408df500be5b14f9f0da5315547ad35ddde7773eefa330@group.calendar.google.com',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  BUDGET_PER_PERSON: 1200,
  USERS: ['Telman', 'Lena'],
  EXPENSE_CATEGORIES: ['Food & Drink', 'Shopping', 'Activities & Entertainment', 'Travel', 'Sports & Wellness', 'Health & Medical'],
  EVENT_CATEGORIES: ['Social', 'Travel', 'Kids', 'Work'],
  ACCOUNTS: ['ING', 'DB'],
  DEFAULT_CYCLE_DAY: 24,
};

// ============================================
// STYLES
// ============================================
const styles = `
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#fafaf8;--bg-card:#ffffff;--bg-hover:#f5f4f2;--bg-input:#f5f4f2;
    --border:#e8e6e3;--border-focus:#1a1a1a;
    --text-primary:#1a1a1a;--text-secondary:#6b6963;--text-tertiary:#9b978f;
    --accent:#1a1a1a;
    --green:#2d8a4e;--green-bg:#e8f5e9;--amber:#c17f24;--amber-bg:#fff3e0;--red:#c62828;--red-bg:#ffebee;
    --font-heading:'DM Serif Display',serif;--font-body:'DM Sans',sans-serif;
    --radius:10px;--radius-sm:6px;
    --shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);--shadow-lg:0 4px 12px rgba(0,0,0,0.08);
    --color-telman:#1565c0;--color-telman-bg:#e3f2fd;
    --color-lena:#2e7d32;--color-lena-bg:#e8f5e9;
    --color-family:#c62828;--color-family-bg:#ffebee;
  }
  body{font-family:var(--font-body);background:var(--bg);color:var(--text-primary);-webkit-font-smoothing:antialiased}
  .app{max-width:480px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column;padding-bottom:72px}
  .header{padding:16px 20px 12px;display:flex;align-items:center;justify-content:space-between}
  .header h1{font-family:var(--font-heading);font-size:22px;font-weight:400;letter-spacing:-0.3px}
  .header-right{display:flex;align-items:center;gap:12px}
  .user-pill{font-size:12px;color:var(--text-secondary);background:var(--bg-input);padding:4px 10px;border-radius:20px;font-weight:500}
  .sign-out-btn{font-size:12px;color:var(--text-tertiary);background:none;border:none;cursor:pointer;text-decoration:underline;font-family:var(--font-body)}
  .tab-bar{position:fixed;bottom:0;left:0;right:0;background:var(--bg-card);border-top:1px solid var(--border);display:flex;justify-content:center;padding:6px 0 calc(6px + env(safe-area-inset-bottom));z-index:100}
  .tab-btn{flex:1;max-width:160px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;background:none;border:none;cursor:pointer;font-family:var(--font-body);font-size:10px;font-weight:500;color:var(--text-tertiary);transition:color 0.15s}
  .tab-btn.active{color:var(--text-primary)}
  .tab-btn svg{width:22px;height:22px}
  .budget-card{margin:0 16px 16px;padding:20px;background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border)}
  .budget-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px}
  .budget-label{font-size:13px;color:var(--text-secondary);font-weight:500}
  .budget-settings-btn{background:none;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:11px;color:var(--text-tertiary);padding:3px 8px;font-family:var(--font-body);font-weight:500;margin-left:8px;transition:all 0.15s}
  .budget-settings-btn:hover{border-color:var(--text-tertiary);color:var(--text-primary)}
  .budget-amount{font-family:var(--font-heading);font-size:28px;letter-spacing:-0.5px}
  .budget-bar-track{height:6px;background:var(--bg-input);border-radius:3px;overflow:hidden;margin-bottom:8px}
  .budget-bar-fill{height:100%;border-radius:3px;transition:width 0.4s ease,background 0.3s ease}
  .budget-bar-fill.green{background:var(--green)}.budget-bar-fill.amber{background:var(--amber)}.budget-bar-fill.red{background:var(--red)}
  .budget-sub{font-size:12px;color:var(--text-tertiary)}
  .budget-period{font-size:11px;color:var(--text-tertiary);margin-top:4px}
  .view-toggle,.cal-view-toggle,.todo-filter{display:flex;margin:0 16px 16px;background:var(--bg-input);border-radius:var(--radius-sm);padding:3px;gap:2px}
  .view-toggle button,.cal-view-toggle button,.todo-filter button{flex:1;padding:7px 0;border:none;background:transparent;border-radius:5px;font-family:var(--font-body);font-size:13px;font-weight:500;color:var(--text-secondary);cursor:pointer;transition:all 0.15s}
  .view-toggle button.active,.cal-view-toggle button.active,.todo-filter button.active{background:var(--bg-card);color:var(--text-primary);box-shadow:var(--shadow)}
  .cal-view-toggle{margin-bottom:12px}.cal-view-toggle button{font-size:12px;padding:6px 0}
  .section{margin:0 16px 20px}
  .section-title{font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-tertiary);font-weight:600;margin-bottom:10px;padding:0 4px}
  .cat-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;font-size:14px;cursor:pointer;transition:background 0.15s}
  .cat-row:hover{background:var(--bg-hover)}.cat-row:first-child{border-radius:var(--radius) var(--radius) 0 0}.cat-row:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.cat-row:only-child{border-radius:var(--radius)}.cat-row.active{background:var(--bg-hover);border-color:var(--text-tertiary)}
  .cat-name{color:var(--text-secondary)}.cat-amount{font-weight:600;font-variant-numeric:tabular-nums}
  .filter-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;margin-bottom:10px;background:var(--accent);color:white;border-radius:20px;font-size:12px;font-weight:500}
  .filter-pill button{background:none;border:none;color:white;font-size:14px;cursor:pointer;line-height:1;padding:0;margin-left:2px}
  .expense-item{display:flex;align-items:center;padding:12px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;gap:12px;cursor:pointer;transition:background 0.15s}
  .expense-item:hover{background:var(--bg-hover)}.expense-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.expense-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.expense-item:only-child{border-radius:var(--radius)}
  .expense-icon{width:36px;height:36px;border-radius:8px;background:var(--bg-input);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
  .expense-details{flex:1;min-width:0}.expense-merchant{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .expense-meta{font-size:12px;color:var(--text-tertiary);margin-top:1px}.expense-amount{font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;flex-shrink:0}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:300;display:flex;align-items:flex-end;justify-content:center}
  .modal-content{background:var(--bg-card);border-radius:16px 16px 0 0;width:100%;max-width:480px;padding:20px 16px calc(20px + env(safe-area-inset-bottom));max-height:85vh;overflow-y:auto}
  .modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
  .modal-header h3{font-family:var(--font-heading);font-size:18px;font-weight:400}
  .modal-close{background:none;border:none;font-size:20px;color:var(--text-tertiary);cursor:pointer;padding:4px}
  .btn-delete{width:100%;padding:10px;background:var(--red-bg);color:var(--red);border:1px solid #ffcdd2;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;margin-top:8px}
  .btn-delete:hover{background:#ffcdd2}
  .add-form-toggle{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;margin-bottom:12px;background:var(--bg-card);border:1px dashed var(--border);border-radius:var(--radius);cursor:pointer;font-family:var(--font-body);font-size:13px;font-weight:500;color:var(--text-secondary);transition:all 0.15s}
  .add-form-toggle:hover{border-color:var(--text-tertiary);color:var(--text-primary)}
  .add-form{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
  .form-row{display:flex;gap:8px;margin-bottom:8px}
  .form-field{flex:1;display:flex;flex-direction:column;gap:4px}
  .form-field label{font-size:11px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px}
  .form-field input,.form-field select,.form-field textarea{padding:9px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;background:var(--bg-input);color:var(--text-primary);outline:none;transition:border-color 0.15s;width:100%}
  .form-field textarea{resize:vertical;min-height:60px}
  .form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:var(--border-focus)}
  .form-actions{display:flex;gap:8px;margin-top:4px}
  .btn-primary{flex:1;padding:10px;background:var(--accent);color:white;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;transition:opacity 0.15s}
  .btn-primary:hover{opacity:0.85}.btn-primary:disabled{opacity:0.4;cursor:not-allowed}
  .btn-secondary{padding:10px 16px;background:var(--bg-input);color:var(--text-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;font-weight:500;cursor:pointer}
  .cal-header{display:flex;justify-content:space-between;align-items:center;margin:0 16px 12px}
  .cal-header h2{font-family:var(--font-heading);font-size:18px;font-weight:400}
  .cal-nav{display:flex;gap:4px}
  .cal-nav button{width:32px;height:32px;border:1px solid var(--border);background:var(--bg-card);border-radius:var(--radius-sm);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--text-secondary);transition:all 0.15s}
  .cal-nav button:hover{border-color:var(--text-tertiary)}
  .month-grid{margin:0 16px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
  .month-grid-header{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--border)}
  .month-grid-header span{padding:8px 0;text-align:center;font-size:11px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px}
  .month-grid-body{display:grid;grid-template-columns:repeat(7,1fr)}
  .month-day{min-height:64px;padding:4px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);font-size:11px;overflow:hidden}
  .month-day:nth-child(7n){border-right:none}.month-day.other-month{opacity:0.3}
  .month-day.today .day-number{background:var(--accent);color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center}
  .day-number{font-weight:600;font-size:11px;margin-bottom:2px;color:var(--text-secondary)}
  .day-event{font-size:9px;padding:1px 3px;border-radius:2px;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;max-width:100%;display:block;cursor:pointer}
  .day-event.who-telman{background:var(--color-telman-bg);color:var(--color-telman)}.day-event.who-lena{background:var(--color-lena-bg);color:var(--color-lena)}.day-event.who-family{background:var(--color-family-bg);color:var(--color-family)}.day-event.who-default{background:var(--bg-input);color:var(--text-secondary)}
  .week-view{margin:0 16px 16px}
  .week-day-card{background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;padding:12px 14px}
  .week-day-card:first-child{border-radius:var(--radius) var(--radius) 0 0}.week-day-card:last-child{border-radius:0 0 var(--radius) var(--radius)}
  .week-day-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-tertiary);margin-bottom:6px}.week-day-label.today{color:var(--accent)}
  .week-event{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;margin-bottom:2px;border-radius:4px;font-size:13px;cursor:pointer;transition:opacity 0.15s}
  .week-event:hover{opacity:0.8}
  .week-event.who-telman{background:var(--color-telman-bg)}.week-event.who-lena{background:var(--color-lena-bg)}.week-event.who-family{background:var(--color-family-bg)}.week-event.who-default{background:var(--bg-input)}
  .week-event-title{font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.week-event-time{color:var(--text-tertiary);font-size:12px;flex-shrink:0;margin-left:8px}
  .week-no-events{font-size:12px;color:var(--text-tertiary);font-style:italic}
  .event-item{display:flex;align-items:flex-start;padding:12px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;gap:12px;cursor:pointer;transition:background 0.15s}
  .event-item:hover{background:var(--bg-hover)}.event-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.event-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.event-item:only-child{border-radius:var(--radius)}
  .event-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0}
  .event-dot.who-telman{background:var(--color-telman)}.event-dot.who-lena{background:var(--color-lena)}.event-dot.who-family{background:var(--color-family)}.event-dot.who-default{background:var(--text-tertiary)}
  .event-details{flex:1}.event-title{font-size:14px;font-weight:500}.event-meta{font-size:12px;color:var(--text-tertiary);margin-top:2px}
  .sign-in-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;padding:40px 20px;text-align:center}
  .sign-in-screen h1{font-family:var(--font-heading);font-size:32px;font-weight:400;margin-bottom:8px}
  .sign-in-screen p{color:var(--text-secondary);font-size:14px;margin-bottom:32px}
  .google-btn{display:flex;align-items:center;gap:10px;padding:12px 24px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);font-family:var(--font-body);font-size:15px;font-weight:500;cursor:pointer;box-shadow:var(--shadow);transition:box-shadow 0.15s}
  .google-btn:hover{box-shadow:var(--shadow-lg)}.google-btn svg{width:20px;height:20px}
  .loading{display:flex;align-items:center;justify-content:center;padding:40px;color:var(--text-tertiary);font-size:14px}
  .empty-state{text-align:center;padding:32px 16px;color:var(--text-tertiary);font-size:13px}
  .toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:var(--accent);color:white;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:500;z-index:200;animation:toastIn 0.2s ease,toastOut 0.2s ease 2s forwards;white-space:nowrap}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes toastOut{from{opacity:1}to{opacity:0}}
  .month-history-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;font-size:14px}
  .month-history-row:first-child{border-radius:var(--radius) var(--radius) 0 0}.month-history-row:last-child{border-radius:0 0 var(--radius) var(--radius)}
  .month-history-label{color:var(--text-secondary)}.month-history-amount{font-weight:600;font-variant-numeric:tabular-nums}
  .confirm-dialog{padding:20px;text-align:center}.confirm-dialog p{font-size:14px;color:var(--text-secondary);margin-bottom:16px}
  .confirm-actions{display:flex;gap:8px}.confirm-actions button{flex:1}
  .pending-screen{max-width:480px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column;padding:20px 16px}
  .pending-screen h1{font-family:var(--font-heading);font-size:22px;font-weight:400;margin-bottom:4px}
  .pending-subtitle{font-size:13px;color:var(--text-tertiary);margin-bottom:20px}
  .pending-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px}
  .pending-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px}.pending-row:last-child{border-bottom:none}
  .pending-row-label{color:var(--text-tertiary);font-weight:500}.pending-row-value{font-weight:600;text-align:right}
  .pending-actions{display:flex;gap:8px;margin-top:8px}.pending-actions .btn-primary,.pending-actions .btn-secondary{padding:12px;font-size:15px}
  .pending-result{text-align:center;padding:24px;font-size:15px}.pending-result.success{color:var(--green)}.pending-result.error{color:var(--red)}
  .pending-batch-item{background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;font-size:14px}
  .pending-batch-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.pending-batch-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:16px}.pending-batch-item:only-child{border-radius:var(--radius);margin-bottom:16px}
  .pending-batch-merchant{font-weight:500}.pending-batch-meta{font-size:12px;color:var(--text-tertiary)}.pending-batch-amount{font-weight:600;font-variant-numeric:tabular-nums}
  .upcoming-toggle{display:flex;margin-bottom:10px;padding:0 4px;gap:8px}
  .upcoming-toggle button{background:none;border:none;font-family:var(--font-body);font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;color:var(--text-tertiary);cursor:pointer;padding:0;transition:color 0.15s}
  .upcoming-toggle button.active{color:var(--text-primary)}
  .todo-section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:0 4px}
  .todo-section-title{font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-tertiary);font-weight:600}
  .todo-count{font-size:11px;color:var(--text-tertiary);font-weight:600;background:var(--bg-input);padding:2px 8px;border-radius:10px}
  .todo-quick-add{display:flex;gap:8px;margin-bottom:8px}
  .todo-quick-add input{flex:1;padding:9px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;background:var(--bg-input);color:var(--text-primary);outline:none}
  .todo-quick-add input:focus{border-color:var(--border-focus)}
  .todo-quick-add select{padding:9px 6px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:13px;background:var(--bg-input);color:var(--text-primary);outline:none;width:90px}
  .todo-quick-add button{padding:9px 14px;background:var(--accent);color:white;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap}
  .todo-quick-add button:disabled{opacity:0.4;cursor:not-allowed}
  .todo-item{display:flex;align-items:flex-start;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;gap:10px}
  .todo-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.todo-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.todo-item:only-child{border-radius:var(--radius)}
  .todo-checkbox{width:20px;height:20px;border:2px solid var(--border);border-radius:50%;cursor:pointer;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;background:transparent}
  .todo-checkbox:hover{border-color:var(--green)}
  .todo-content{flex:1;min-width:0;cursor:pointer}.todo-text{font-size:14px;font-weight:400}.todo-assignee{font-size:12px;color:var(--text-tertiary);margin-top:2px}
  .todo-history-title{font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-tertiary);font-weight:600;margin-bottom:10px;padding:0 4px;margin-top:8px}
  .todo-history-item{display:flex;align-items:center;padding:8px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;gap:10px;font-size:13px;cursor:pointer;transition:background 0.15s}
  .todo-history-item:hover{background:var(--bg-hover)}.todo-history-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.todo-history-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.todo-history-item:only-child{border-radius:var(--radius)}
  .todo-history-text{flex:1;text-decoration:line-through;color:var(--text-tertiary)}.todo-history-meta{font-size:11px;color:var(--text-tertiary);flex-shrink:0}
  .cycle-settings{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin:0 16px 16px}
  .cycle-settings h4{font-family:var(--font-heading);font-size:15px;font-weight:400;margin-bottom:12px}
  .cycle-row{display:flex;gap:8px;margin-bottom:8px;align-items:flex-end}
  .cycle-row .form-field{flex:1}
`;

// ============================================
// HELPERS
// ============================================
const CATEGORY_ICONS = {'Food & Drink':'🍽','Shopping':'🛍','Activities & Entertainment':'🎭','Travel':'✈️','Sports & Wellness':'💪','Health & Medical':'🏥','Health & Wellness':'💪'};
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayNamesMon = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const dayNamesFullMon = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function formatCurrency(n){return '€'+Math.round(Number(n))}
function formatDate(d){const date=new Date(d);return date.getDate()+' '+monthNames[date.getMonth()].slice(0,3)}
function isSameDay(d1,d2){return d1.getFullYear()===d2.getFullYear()&&d1.getMonth()===d2.getMonth()&&d1.getDate()===d2.getDate()}
function getEventCategory(event){const desc=(event.description||'').toLowerCase();if(desc.includes('category: travel'))return'travel';if(desc.includes('category: social'))return'social';if(desc.includes('category: kids'))return'kids';if(desc.includes('category: work'))return'work';return'default'}
function getEventWho(event){const title=event.summary||'';const match=title.match(/^\[([^\]]+)\]/);if(!match)return'Family';const raw=match[1];for(const u of CONFIG.USERS){if(raw.toLowerCase().startsWith(u.toLowerCase()))return u}if(raw.toLowerCase()==='family')return'Family';return raw}
function getWhoClass(who){const w=(who||'').toLowerCase();if(w==='telman')return'who-telman';if(w==='lena')return'who-lena';if(w==='family')return'who-family';return'who-default'}
function cleanEventTitle(event){return(event.summary||'').replace(/^\[[^\]]+\]\s*/,'')}
function getMondayDow(date){return(date.getDay()+6)%7}
function matchUserName(googleName){const first=(googleName||'').split(' ')[0];for(const u of CONFIG.USERS){if(first.toLowerCase().startsWith(u.toLowerCase())||u.toLowerCase().startsWith(first.toLowerCase()))return u}return first}
function getEventsForDate(calEvents,date){return calEvents.filter(ev=>{const start=new Date(ev.start?.dateTime||ev.start?.date);const end=new Date(ev.end?.dateTime||ev.end?.date);if(ev.start?.date){const endAdj=new Date(end);endAdj.setDate(endAdj.getDate()-1);const sDay=new Date(start.getFullYear(),start.getMonth(),start.getDate());const eDay=new Date(endAdj.getFullYear(),endAdj.getMonth(),endAdj.getDate());const cDay=new Date(date.getFullYear(),date.getMonth(),date.getDate());return cDay>=sDay&&cDay<=eDay}return isSameDay(start,date)})}

// Budget cycle helpers
function getCycleDates(cycleDay, now, overrideDate) {
  if (overrideDate) {
    const override = new Date(overrideDate);
    // Find the next cycle start after override
    const nextCycle = new Date(override.getFullYear(), override.getMonth() + 1, cycleDay);
    if (now < override) return { start: new Date(override.getFullYear(), override.getMonth() - 1, cycleDay), end: new Date(override.getTime() - 86400000) };
    if (now >= override && now < nextCycle) return { start: override, end: new Date(nextCycle.getTime() - 86400000) };
  }
  const y = now.getFullYear(), m = now.getMonth();
  const thisStart = new Date(y, m, cycleDay);
  if (now >= thisStart) {
    return { start: thisStart, end: new Date(y, m + 1, cycleDay - 1) };
  } else {
    return { start: new Date(y, m - 1, cycleDay), end: new Date(y, m, cycleDay - 1) };
  }
}

function formatPeriod(start, end) {
  return `${start.getDate()} ${monthNames[start.getMonth()].slice(0,3)} – ${end.getDate()} ${monthNames[end.getMonth()].slice(0,3)}`;
}

// ============================================
// HOOKS
// ============================================
function useGoogleAuth(){const[user,setUser]=useState(null);const[tokenClient,setTokenClient]=useState(null);const[gapiReady,setGapiReady]=useState(false);const[gsiReady,setGsiReady]=useState(false);useEffect(()=>{const loadGapi=()=>{if(window.gapi){window.gapi.load('client',async()=>{await window.gapi.client.init({apiKey:CONFIG.API_KEY});await window.gapi.client.load('sheets','v4');await window.gapi.client.load('calendar','v3');setGapiReady(true)})}else setTimeout(loadGapi,100)};const loadGsi=()=>{if(window.google?.accounts?.oauth2){const client=window.google.accounts.oauth2.initTokenClient({client_id:CONFIG.CLIENT_ID,scope:CONFIG.SCOPES,callback:(resp)=>{if(resp.access_token)fetchUserInfo(resp.access_token)}});setTokenClient(client);setGsiReady(true)}else setTimeout(loadGsi,100)};loadGapi();loadGsi()},[]);const fetchUserInfo=async(accessToken)=>{try{const res=await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{headers:{Authorization:`Bearer ${accessToken}`}});const info=await res.json();const name=matchUserName(info.given_name||info.name);setUser({name,email:info.email,picture:info.picture})}catch(err){console.error('Failed to get user info',err)}};const signIn=()=>{if(tokenClient)tokenClient.requestAccessToken()};const signOut=()=>{const token=window.gapi?.client?.getToken();if(token){window.google.accounts.oauth2.revoke(token.access_token);window.gapi.client.setToken(null)}setUser(null)};return{user,signIn,signOut,ready:gapiReady&&gsiReady}}

function useSheets(){const[expenses,setExpenses]=useState([]);const[loading,setLoading]=useState(false);const fetchExpenses=useCallback(async()=>{setLoading(true);try{const response=await window.gapi.client.sheets.spreadsheets.values.get({spreadsheetId:CONFIG.SPREADSHEET_ID,range:'Expenses!A2:H10000'});const rows=response.result.values||[];setExpenses(rows.map((r,i)=>({rowIndex:i+2,merchant:r[0]||'',amount:parseFloat(r[1])||0,date:r[2]||'',category:r[3]||'',who:r[4]||'',tag:r[5]||'',notes:r[6]||'',account:r[7]||''})))}catch(err){console.error('Sheets fetch error:',err)}setLoading(false)},[]);const addExpense=useCallback(async(expense)=>{try{await window.gapi.client.sheets.spreadsheets.values.append({spreadsheetId:CONFIG.SPREADSHEET_ID,range:'Expenses!A:H',valueInputOption:'USER_ENTERED',resource:{values:[[expense.merchant,expense.amount,expense.date,expense.category,expense.who,expense.tag||'',expense.notes||'',expense.account||'']]}});await fetchExpenses();return true}catch(err){console.error('Sheets append error:',err);return false}},[fetchExpenses]);const updateExpense=useCallback(async(rowIndex,expense)=>{try{await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`Expenses!A${rowIndex}:H${rowIndex}`,valueInputOption:'USER_ENTERED',resource:{values:[[expense.merchant,expense.amount,expense.date,expense.category,expense.who,expense.tag||'',expense.notes||'',expense.account||'']]}});await fetchExpenses();return true}catch(err){console.error('Sheets update error:',err);return false}},[fetchExpenses]);const deleteExpense=useCallback(async(rowIndex)=>{try{const meta=await window.gapi.client.sheets.spreadsheets.get({spreadsheetId:CONFIG.SPREADSHEET_ID});const sheet=meta.result.sheets.find(s=>s.properties.title==='Expenses');await window.gapi.client.sheets.spreadsheets.batchUpdate({spreadsheetId:CONFIG.SPREADSHEET_ID,resource:{requests:[{deleteDimension:{range:{sheetId:sheet.properties.sheetId,dimension:'ROWS',startIndex:rowIndex-1,endIndex:rowIndex}}}]}});await fetchExpenses();return true}catch(err){console.error('Sheets delete error:',err);return false}},[fetchExpenses]);return{expenses,loading,fetchExpenses,addExpense,updateExpense,deleteExpense}}

function useCalendar(){const[events,setEvents]=useState([]);const[loading,setLoading]=useState(false);const fetchEvents=useCallback(async(timeMin,timeMax)=>{setLoading(true);try{const response=await window.gapi.client.calendar.events.list({calendarId:CONFIG.CALENDAR_ID,timeMin:timeMin.toISOString(),timeMax:timeMax.toISOString(),singleEvents:true,orderBy:'startTime',maxResults:200});setEvents(response.result.items||[])}catch(err){console.error('Calendar fetch error:',err)}setLoading(false)},[]);const addEvent=useCallback(async(event)=>{try{const who=event.who||'Family';const resource={summary:`[${who}] ${event.title}`,description:`Category: ${event.category||'Social'}`};if(event.location)resource.location=event.location;if(event.allDay){resource.start={date:event.startDate};const end=new Date(event.endDate);end.setDate(end.getDate()+1);resource.end={date:end.toISOString().split('T')[0]}}else{resource.start={dateTime:event.startDateTime,timeZone:'Europe/Berlin'};resource.end={dateTime:event.endDateTime,timeZone:'Europe/Berlin'}}await window.gapi.client.calendar.events.insert({calendarId:CONFIG.CALENDAR_ID,resource});return true}catch(err){console.error('Calendar insert error:',err);return false}},[]);const updateEvent=useCallback(async(eventId,event)=>{try{const who=event.who||'Family';const resource={summary:`[${who}] ${event.title}`,description:`Category: ${event.category||'Social'}`};if(event.location)resource.location=event.location;if(event.allDay){resource.start={date:event.startDate};const end=new Date(event.endDate);end.setDate(end.getDate()+1);resource.end={date:end.toISOString().split('T')[0]}}else{resource.start={dateTime:event.startDateTime,timeZone:'Europe/Berlin'};resource.end={dateTime:event.endDateTime,timeZone:'Europe/Berlin'}}await window.gapi.client.calendar.events.update({calendarId:CONFIG.CALENDAR_ID,eventId,resource});return true}catch(err){console.error('Calendar update error:',err);return false}},[]);const deleteEvent=useCallback(async(eventId)=>{try{await window.gapi.client.calendar.events.delete({calendarId:CONFIG.CALENDAR_ID,eventId});return true}catch(err){console.error('Calendar delete error:',err);return false}},[]);return{events,loading,fetchEvents,addEvent,updateEvent,deleteEvent}}

function useTodos(){const[todos,setTodos]=useState([]);const[loading,setLoading]=useState(false);const SHEET='Todos';const fetchTodos=useCallback(async()=>{setLoading(true);try{const response=await window.gapi.client.sheets.spreadsheets.values.get({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${SHEET}!A2:F10000`});const rows=response.result.values||[];setTodos(rows.map((r,i)=>({rowIndex:i+2,task:r[0]||'',category:r[1]||'General',who:r[2]||'Both',status:r[3]||'Open',completedDate:r[4]||'',createdDate:r[5]||''})))}catch(err){if(err?.result?.error?.code===400){console.log('Todos sheet not found')}else console.error('Todos fetch error:',err)}setLoading(false)},[]);const ensureSheet=useCallback(async()=>{try{const meta=await window.gapi.client.sheets.spreadsheets.get({spreadsheetId:CONFIG.SPREADSHEET_ID});const exists=meta.result.sheets.some(s=>s.properties.title===SHEET);if(!exists){await window.gapi.client.sheets.spreadsheets.batchUpdate({spreadsheetId:CONFIG.SPREADSHEET_ID,resource:{requests:[{addSheet:{properties:{title:SHEET}}}]}});await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${SHEET}!A1:F1`,valueInputOption:'USER_ENTERED',resource:{values:[['Task','Category','Who','Status','Completed Date','Created Date']]}})}}catch(err){console.error('Ensure sheet error:',err)}},[]);const addTodo=useCallback(async(todo)=>{try{await ensureSheet();const today=new Date().toISOString().split('T')[0];await window.gapi.client.sheets.spreadsheets.values.append({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${SHEET}!A:F`,valueInputOption:'USER_ENTERED',resource:{values:[[todo.task,todo.category,todo.who,'Open','',today]]}});await fetchTodos();return true}catch(err){console.error('Todo add error:',err);return false}},[fetchTodos,ensureSheet]);const updateTodo=useCallback(async(rowIndex,todo)=>{try{await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${SHEET}!A${rowIndex}:F${rowIndex}`,valueInputOption:'USER_ENTERED',resource:{values:[[todo.task,todo.category,todo.who,todo.status,todo.completedDate||'',todo.createdDate||'']]}});await fetchTodos();return true}catch(err){console.error('Todo update error:',err);return false}},[fetchTodos]);const deleteTodo=useCallback(async(rowIndex)=>{try{const meta=await window.gapi.client.sheets.spreadsheets.get({spreadsheetId:CONFIG.SPREADSHEET_ID});const sheet=meta.result.sheets.find(s=>s.properties.title===SHEET);await window.gapi.client.sheets.spreadsheets.batchUpdate({spreadsheetId:CONFIG.SPREADSHEET_ID,resource:{requests:[{deleteDimension:{range:{sheetId:sheet.properties.sheetId,dimension:'ROWS',startIndex:rowIndex-1,endIndex:rowIndex}}}]}});await fetchTodos();return true}catch(err){console.error('Todo delete error:',err);return false}},[fetchTodos]);return{todos,loading,fetchTodos,addTodo,updateTodo,deleteTodo}}

function useSettings(){const[settings,setSettings]=useState({cycleDay:CONFIG.DEFAULT_CYCLE_DAY,overrideDate:''});const[loaded,setLoaded]=useState(false);const SHEET='Settings';const fetchSettings=useCallback(async()=>{try{const response=await window.gapi.client.sheets.spreadsheets.values.get({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${SHEET}!A2:B10`});const rows=response.result.values||[];const s={cycleDay:CONFIG.DEFAULT_CYCLE_DAY,overrideDate:''};rows.forEach(r=>{if(r[0]==='cycle_day')s.cycleDay=parseInt(r[1])||CONFIG.DEFAULT_CYCLE_DAY;if(r[0]==='override_date')s.overrideDate=r[1]||''});setSettings(s)}catch(err){console.log('Settings sheet not found, using defaults')}setLoaded(true)},[]);const ensureSheet=useCallback(async()=>{try{const meta=await window.gapi.client.sheets.spreadsheets.get({spreadsheetId:CONFIG.SPREADSHEET_ID});const exists=meta.result.sheets.some(s=>s.properties.title===SHEET);if(!exists){await window.gapi.client.sheets.spreadsheets.batchUpdate({spreadsheetId:CONFIG.SPREADSHEET_ID,resource:{requests:[{addSheet:{properties:{title:SHEET}}}]}});await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${SHEET}!A1:B3`,valueInputOption:'USER_ENTERED',resource:{values:[['Key','Value'],['cycle_day',String(CONFIG.DEFAULT_CYCLE_DAY)],['override_date','']]}})}}catch(err){console.error('Ensure settings error:',err)}},[]);const saveSettings=useCallback(async(newSettings)=>{try{await ensureSheet();await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${SHEET}!A2:B3`,valueInputOption:'USER_ENTERED',resource:{values:[['cycle_day',String(newSettings.cycleDay)],['override_date',newSettings.overrideDate||'']]}});setSettings(newSettings);return true}catch(err){console.error('Save settings error:',err);return false}},[ensureSheet]);return{settings,loaded,fetchSettings,saveSettings}}

// ============================================
// ICONS
// ============================================
const Icons = {
  finances:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>),
  calendar:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
  todos:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>),
  left:'‹',right:'›',
};
const GoogleIcon=()=>(<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>);

// ============================================
// FORMS
// ============================================
function ExpenseForm({initial,user,onSave,onCancel,saveLabel}){const today=new Date().toISOString().split('T')[0];const[form,setForm]=useState({merchant:initial?.merchant||'',amount:initial?.amount||'',date:initial?.date||today,category:initial?.category||CONFIG.EXPENSE_CATEGORIES[0],who:initial?.who||user?.name||'Telman',tag:initial?.tag||'',notes:initial?.notes||'',account:initial?.account||CONFIG.ACCOUNTS[0]});const[saving,setSaving]=useState(false);const handleSubmit=async()=>{if(!form.merchant||!form.amount)return;setSaving(true);const success=await onSave({...form,amount:parseFloat(form.amount)});setSaving(false);if(success)onCancel()};const set=(k,v)=>setForm(f=>({...f,[k]:v}));return(<div className="add-form"><div className="form-row"><div className="form-field" style={{flex:2}}><label>Merchant</label><input value={form.merchant} onChange={e=>set('merchant',e.target.value)} placeholder="e.g. Rewe"/></div><div className="form-field" style={{flex:1}}><label>Amount €</label><input type="number" step="0.01" value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="0"/></div></div><div className="form-row"><div className="form-field"><label>Date</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)}/></div><div className="form-field"><label>Category</label><select value={form.category} onChange={e=>set('category',e.target.value)}>{CONFIG.EXPENSE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div></div><div className="form-row"><div className="form-field"><label>Who</label><select value={form.who} onChange={e=>set('who',e.target.value)}>{[...CONFIG.USERS,'Family'].map(u=><option key={u} value={u}>{u}</option>)}</select></div><div className="form-field"><label>Account</label><select value={form.account} onChange={e=>set('account',e.target.value)}>{CONFIG.ACCOUNTS.map(a=><option key={a} value={a}>{a}</option>)}</select></div></div><div className="form-row"><div className="form-field"><label>Tag (optional)</label><input value={form.tag} onChange={e=>set('tag',e.target.value)} placeholder="e.g. Rome trip"/></div></div><div className="form-row"><div className="form-field"><label>Notes (optional)</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Any additional notes..."/></div></div><div className="form-actions"><button className="btn-secondary" onClick={onCancel}>Cancel</button><button className="btn-primary" onClick={handleSubmit} disabled={!form.merchant||!form.amount||saving}>{saving?'Saving...':saveLabel||'Add Expense'}</button></div></div>)}

function EventForm({initial,user,onSave,onCancel,saveLabel}){const today=new Date().toISOString().split('T')[0];const[form,setForm]=useState({title:initial?.title||'',startDate:initial?.startDate||today,startTime:initial?.startTime||'09:00',endDate:initial?.endDate||initial?.startDate||today,endTime:initial?.endTime||'10:00',allDay:initial?.allDay||false,location:initial?.location||'',who:initial?.who||user?.name||'Telman',category:initial?.category||CONFIG.EVENT_CATEGORIES[0]});const[endManuallySet,setEndManuallySet]=useState(!!initial);const[endTimeManuallySet,setEndTimeManuallySet]=useState(!!initial);const[saving,setSaving]=useState(false);const setField=(k,v)=>{setForm(f=>{const next={...f,[k]:v};if(k==='startDate'&&!endManuallySet)next.endDate=v;if(k==='endDate')setEndManuallySet(true);if(k==='startTime'&&!endTimeManuallySet){const[h,m]=v.split(':').map(Number);const endH=Math.min(h+1,23);next.endTime=`${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')}`}if(k==='endTime')setEndTimeManuallySet(true);return next})};const handleSubmit=async()=>{if(!form.title)return;setSaving(true);const eventData={title:form.title,who:form.who,category:form.category,location:form.location,allDay:form.allDay};if(form.allDay){eventData.startDate=form.startDate;eventData.endDate=form.endDate}else{eventData.startDateTime=`${form.startDate}T${form.startTime}:00`;eventData.endDateTime=`${form.endDate}T${form.endTime}:00`}const success=await onSave(eventData);setSaving(false);if(success)onCancel()};return(<div className="add-form"><div className="form-row"><div className="form-field"><label>Title</label><input value={form.title} onChange={e=>setField('title',e.target.value)} placeholder="e.g. Dinner with friends"/></div></div><div className="form-row"><div className="form-field"><label>Who</label><select value={form.who} onChange={e=>setField('who',e.target.value)}>{[...CONFIG.USERS,'Family'].map(u=><option key={u} value={u}>{u}</option>)}</select></div><div className="form-field"><label>Category</label><select value={form.category} onChange={e=>setField('category',e.target.value)}>{CONFIG.EVENT_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div></div><div className="form-row"><div className="form-field" style={{flex:'none'}}><label>All Day</label><input type="checkbox" checked={form.allDay} onChange={e=>setField('allDay',e.target.checked)} style={{width:18,height:18,marginTop:4}}/></div><div className="form-field"><label>Start Date</label><input type="date" value={form.startDate} onChange={e=>setField('startDate',e.target.value)}/></div>{!form.allDay&&<div className="form-field"><label>Start Time</label><input type="time" value={form.startTime} onChange={e=>setField('startTime',e.target.value)}/></div>}</div><div className="form-row"><div className="form-field"><label>End Date</label><input type="date" value={form.endDate} onChange={e=>setField('endDate',e.target.value)}/></div>{!form.allDay&&<div className="form-field"><label>End Time</label><input type="time" value={form.endTime} onChange={e=>setField('endTime',e.target.value)}/></div>}</div><div className="form-row"><div className="form-field"><label>Location (optional)</label><input value={form.location} onChange={e=>setField('location',e.target.value)} placeholder="e.g. Restaurant Zum Löwen"/></div></div><div className="form-actions"><button className="btn-secondary" onClick={onCancel}>Cancel</button><button className="btn-primary" onClick={handleSubmit} disabled={!form.title||saving}>{saving?'Saving...':saveLabel||'Add Event'}</button></div></div>)}

// ============================================
// EDIT MODALS
// ============================================
function EditExpenseModal({expense,user,onUpdate,onDelete,onClose}){const[confirmDelete,setConfirmDelete]=useState(false);const[deleting,setDeleting]=useState(false);const handleDelete=async()=>{setDeleting(true);await onDelete(expense.rowIndex);setDeleting(false);onClose()};if(confirmDelete)return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="confirm-dialog"><p>Delete "{expense.merchant}" ({formatCurrency(expense.amount)})?</p><div className="confirm-actions"><button className="btn-secondary" onClick={()=>setConfirmDelete(false)}>Cancel</button><button className="btn-delete" onClick={handleDelete} disabled={deleting}>{deleting?'Deleting...':'Delete'}</button></div></div></div></div>);return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Edit Expense</h3><button className="modal-close" onClick={onClose}>✕</button></div><ExpenseForm initial={expense} user={user} onSave={async(u)=>{const s=await onUpdate(expense.rowIndex,u);if(s)onClose();return s}} onCancel={onClose} saveLabel="Save Changes"/><button className="btn-delete" onClick={()=>setConfirmDelete(true)}>Delete Expense</button></div></div>)}

function EditEventModal({event,user,onUpdate,onDelete,onClose,onRefresh}){const[confirmDelete,setConfirmDelete]=useState(false);const[deleting,setDeleting]=useState(false);const who=getEventWho(event);const title=cleanEventTitle(event);const cat=getEventCategory(event);const catCap=cat.charAt(0).toUpperCase()+cat.slice(1);const isAllDay=!!event.start?.date;const startDate=isAllDay?event.start.date:(event.start?.dateTime||'').slice(0,10);const startTime=isAllDay?'09:00':(event.start?.dateTime||'').slice(11,16);const endDateRaw=isAllDay?event.end.date:(event.end?.dateTime||'').slice(0,10);let endDate=endDateRaw;if(isAllDay&&endDateRaw){const ed=new Date(endDateRaw);ed.setDate(ed.getDate()-1);endDate=ed.toISOString().split('T')[0]}const endTime=isAllDay?'10:00':(event.end?.dateTime||'').slice(11,16);const initial={title,who,category:catCap==='Default'?'Social':catCap,location:event.location||'',allDay:isAllDay,startDate,startTime,endDate,endTime};const handleDelete=async()=>{setDeleting(true);const s=await onDelete(event.id);setDeleting(false);if(s){onRefresh();onClose()}};if(confirmDelete)return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="confirm-dialog"><p>Delete "{title}"?</p><div className="confirm-actions"><button className="btn-secondary" onClick={()=>setConfirmDelete(false)}>Cancel</button><button className="btn-delete" onClick={handleDelete} disabled={deleting}>{deleting?'Deleting...':'Delete'}</button></div></div></div></div>);return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Edit Event</h3><button className="modal-close" onClick={onClose}>✕</button></div><EventForm initial={initial} user={user} onSave={async(u)=>{const s=await onUpdate(event.id,u);if(s){onRefresh();onClose()}return s}} onCancel={onClose} saveLabel="Save Changes"/><button className="btn-delete" onClick={()=>setConfirmDelete(true)}>Delete Event</button></div></div>)}

// ============================================
// FINANCES TAB
// ============================================
function FinancesTab({user,expenses,loading,onAddExpense,onUpdateExpense,onDeleteExpense,onRefresh,settings,onShowCycleSettings}){
  const[viewMode,setViewMode]=useState('individual');const[showForm,setShowForm]=useState(false);const[editingExpense,setEditingExpense]=useState(null);const[categoryFilter,setCategoryFilter]=useState(null);const[viewingPeriod,setViewingPeriod]=useState(null);
  useEffect(()=>{onRefresh()},[onRefresh]);
  const now=new Date();
  const{start:cycleStart,end:cycleEnd}=getCycleDates(settings.cycleDay,now,settings.overrideDate);
  // Use viewingPeriod if set, otherwise current cycle
  const activeStart=viewingPeriod?viewingPeriod.start:cycleStart;
  const activeEnd=viewingPeriod?viewingPeriod.end:cycleEnd;
  const cycleExpenses=expenses.filter(e=>{const d=new Date(e.date);return d>=activeStart&&d<=activeEnd});
  // #24: In individual view, include user's own expenses + 50% of Family expenses
  const filtered=viewMode==='individual'?cycleExpenses.filter(e=>e.who===user.name||e.who==='Family'):cycleExpenses;
  const totalSpent=filtered.reduce((s,e)=>{
    if(viewMode==='individual'&&e.who==='Family')return s+(e.amount/2);
    return s+e.amount;
  },0);
  const budget=viewMode==='individual'?CONFIG.BUDGET_PER_PERSON:CONFIG.BUDGET_PER_PERSON*2;
  const remaining=budget-totalSpent;const pct=Math.min((totalSpent/budget)*100,100);
  const barColor=pct<60?'green':pct<85?'amber':'red';
  const byCategory={};filtered.forEach(e=>{const amt=viewMode==='individual'&&e.who==='Family'?e.amount/2:e.amount;byCategory[e.category]=(byCategory[e.category]||0)+amt});
  const categoryList=Object.entries(byCategory).sort((a,b)=>b[1]-a[1]);
  const showExpenseList=viewMode==='individual';
  const displayExpenses=categoryFilter?filtered.filter(e=>e.category===categoryFilter):filtered;
  const recent=[...displayExpenses].sort((a,b)=>new Date(b.date)-new Date(a.date));
  // Period history
  const monthHistory=[];
  for(let i=0;i<6;i++){const mStart=new Date(cycleStart);mStart.setMonth(mStart.getMonth()-i);const mEnd=new Date(mStart);mEnd.setMonth(mEnd.getMonth()+1);mEnd.setDate(mEnd.getDate()-1);const mExp=expenses.filter(e=>{const d=new Date(e.date);return d>=mStart&&d<=mEnd&&(viewMode==='combined'||e.who===user.name||e.who==='Family')});const total=mExp.reduce((s,e)=>{if(viewMode==='individual'&&e.who==='Family')return s+(e.amount/2);return s+e.amount},0);if(i>0||total>0)monthHistory.push({label:formatPeriod(mStart,mEnd),total,start:new Date(mStart),end:new Date(mEnd)})}

  return(<>
    <div className="view-toggle"><button className={viewMode==='individual'?'active':''} onClick={()=>{setViewMode('individual');setCategoryFilter(null)}}>{user.name}</button><button className={viewMode==='combined'?'active':''} onClick={()=>{setViewMode('combined');setCategoryFilter(null)}}>Combined</button></div>
    <div className="budget-card">
      <div className="budget-header"><span className="budget-label">Budget</span><span className="budget-amount">{formatCurrency(remaining)}</span></div>
      <div className="budget-bar-track"><div className={`budget-bar-fill ${barColor}`} style={{width:`${pct}%`}}/></div>
      <div className="budget-sub">{formatCurrency(totalSpent)} of {formatCurrency(budget)} spent</div>
      <div className="budget-period">{formatPeriod(cycleStart,cycleEnd)} <button className="budget-settings-btn" onClick={()=>onShowCycleSettings()}>Settings</button></div>
    </div>
    {categoryList.length>0&&<div className="section"><div className="section-title">By Category</div>{categoryList.map(([cat,amount])=>(<div className={`cat-row ${categoryFilter===cat?'active':''}`} key={cat} onClick={()=>showExpenseList&&setCategoryFilter(categoryFilter===cat?null:cat)}><span className="cat-name">{CATEGORY_ICONS[cat]||'•'} {cat}</span><span className="cat-amount">{formatCurrency(amount)}</span></div>))}</div>}
    {showExpenseList&&<div className="section"><div className="section-title">Expenses</div>{showForm?<ExpenseForm user={user} onSave={onAddExpense} onCancel={()=>setShowForm(false)} saveLabel="Add Expense"/>:!viewingPeriod&&<button className="add-form-toggle" onClick={()=>setShowForm(true)}><span style={{fontSize:16,lineHeight:1}}>+</span> Add Expense</button>}{categoryFilter&&<div className="filter-pill">{CATEGORY_ICONS[categoryFilter]||'•'} {categoryFilter}<button onClick={()=>setCategoryFilter(null)}>✕</button></div>}{loading?<div className="loading">Loading expenses...</div>:recent.length===0?<div className="empty-state">{categoryFilter?'No expenses in this category.':'No expenses this period yet.'}</div>:recent.map((e,i)=>(<div className="expense-item" key={i} onClick={()=>setEditingExpense(e)}><div className="expense-icon">{CATEGORY_ICONS[e.category]||'•'}</div><div className="expense-details"><div className="expense-merchant">{e.merchant}{e.who==='Family'&&viewMode==='individual'?' (split)':''}</div><div className="expense-meta">{formatDate(e.date)} · {e.category}{e.account?` · ${e.account}`:''}</div></div><div className="expense-amount">{formatCurrency(viewMode==='individual'&&e.who==='Family'?e.amount/2:e.amount)}</div></div>))}</div>}
    {!showExpenseList&&<div className="section">{showForm?<ExpenseForm user={user} onSave={onAddExpense} onCancel={()=>setShowForm(false)} saveLabel="Add Expense"/>:!viewingPeriod&&<button className="add-form-toggle" onClick={()=>setShowForm(true)}><span style={{fontSize:16,lineHeight:1}}>+</span> Add Expense</button>}</div>}
    {viewingPeriod&&<div className="section"><button className="btn-secondary" onClick={()=>setViewingPeriod(null)} style={{width:'100%'}}>← Back to Current Period</button></div>}
    {!viewingPeriod&&monthHistory.length>1&&<div className="section"><div className="section-title">Period History</div>{monthHistory.map((m,i)=>(<div className="month-history-row" key={i} onClick={()=>setViewingPeriod({start:m.start,end:m.end})} style={{cursor:'pointer'}}><span className="month-history-label">{m.label}</span><span className="month-history-amount">{formatCurrency(m.total)}</span></div>))}</div>}
    {editingExpense&&<EditExpenseModal expense={editingExpense} user={user} onUpdate={onUpdateExpense} onDelete={onDeleteExpense} onClose={()=>setEditingExpense(null)}/>}
  </>);
}

// ============================================
// CYCLE SETTINGS PANEL
// ============================================
function CycleSettingsPanel({settings,onSave,onClose}){
  const[cycleDay,setCycleDay]=useState(settings.cycleDay);const[overrideDate,setOverrideDate]=useState(settings.overrideDate);const[saving,setSaving]=useState(false);
  const handleSave=async()=>{setSaving(true);await onSave({cycleDay:parseInt(cycleDay)||24,overrideDate});setSaving(false);onClose()};
  return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Budget Cycle</h3><button className="modal-close" onClick={onClose}>✕</button></div><div className="add-form"><div className="form-row"><div className="form-field"><label>Cycle Start Day (monthly)</label><input type="number" min="1" max="28" value={cycleDay} onChange={e=>setCycleDay(e.target.value)}/></div></div><div className="form-row"><div className="form-field"><label>Override Start Date (this period only)</label><input type="date" value={overrideDate} onChange={e=>setOverrideDate(e.target.value)}/></div></div>{overrideDate&&<div className="form-row"><div className="form-field"><button className="btn-secondary" onClick={()=>setOverrideDate('')} style={{width:'100%'}}>Clear Override</button></div></div>}<div className="form-actions"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save'}</button></div></div></div></div>);
}

// ============================================
// CALENDAR TAB
// ============================================
function CalendarTab({user,events:calEvents,loading,onFetchEvents,onAddEvent,onUpdateEvent,onDeleteEvent}){
  const[calView,setCalView]=useState('month');const[currentDate,setCurrentDate]=useState(new Date());const[showForm,setShowForm]=useState(false);const[editingEvent,setEditingEvent]=useState(null);const[upcomingMode,setUpcomingMode]=useState('month');
  const year=currentDate.getFullYear();const month=currentDate.getMonth();const today=new Date();
  const fetchCurrentView=useCallback(()=>{if(calView==='month'){onFetchEvents(new Date(year,month-1,1),new Date(year,month+2,0,23,59,59))}else{const d=new Date(currentDate);const dow=getMondayDow(d);const start=new Date(d);start.setDate(start.getDate()-dow);start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+6);end.setHours(23,59,59);onFetchEvents(start,end)}},[calView,year,month,currentDate,onFetchEvents]);
  useEffect(()=>{fetchCurrentView()},[fetchCurrentView]);
  const navigate=(dir)=>{const d=new Date(currentDate);if(calView==='month')d.setMonth(d.getMonth()+dir);else d.setDate(d.getDate()+(dir*7));setCurrentDate(d)};
  const handleAdd=async(event)=>{const s=await onAddEvent(event);if(s)fetchCurrentView();return s};
  const firstOfMonth=new Date(year,month,1);const firstDayDow=getMondayDow(firstOfMonth);const daysInMonth=new Date(year,month+1,0).getDate();const daysInPrev=new Date(year,month,0).getDate();
  const cells=[];for(let i=firstDayDow-1;i>=0;i--)cells.push({day:daysInPrev-i,otherMonth:true,date:new Date(year,month-1,daysInPrev-i)});for(let i=1;i<=daysInMonth;i++)cells.push({day:i,otherMonth:false,date:new Date(year,month,i),isToday:isSameDay(new Date(year,month,i),today)});const rem=Math.ceil(cells.length/7)*7-cells.length;for(let i=1;i<=rem;i++)cells.push({day:i,otherMonth:true,date:new Date(year,month+1,i)});
  const weekStart=new Date(currentDate);const dow=getMondayDow(weekStart);weekStart.setDate(weekStart.getDate()-dow);const weekDays=[];for(let i=0;i<7;i++){const d=new Date(weekStart);d.setDate(d.getDate()+i);weekDays.push(d)}
  const nowTime=today.getTime();const futureEvents=calEvents.filter(ev=>{const end=new Date(ev.end?.dateTime||ev.end?.date);return end.getTime()>=nowTime});
  const upcomingEvents=upcomingMode==='month'?futureEvents.filter(ev=>{const start=new Date(ev.start?.dateTime||ev.start?.date);return start.getMonth()===month&&start.getFullYear()===year}):futureEvents;

  return(<>
    <div className="cal-view-toggle"><button className={calView==='month'?'active':''} onClick={()=>setCalView('month')}>Month</button><button className={calView==='week'?'active':''} onClick={()=>setCalView('week')}>Week</button></div>
    <div className="cal-header"><h2>{calView==='month'?`${monthNames[month]} ${year}`:`Week of ${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`}</h2><div className="cal-nav"><button onClick={()=>navigate(-1)}>{Icons.left}</button><button onClick={()=>navigate(1)}>{Icons.right}</button></div></div>
    <div className="section">{showForm?<EventForm user={user} onSave={handleAdd} onCancel={()=>setShowForm(false)} saveLabel="Add Event"/>:<button className="add-form-toggle" onClick={()=>setShowForm(true)}><span style={{fontSize:16,lineHeight:1}}>+</span> Add Event</button>}</div>
    {loading&&<div className="loading">Loading events...</div>}
    {calView==='month'&&!loading&&<div className="month-grid"><div className="month-grid-header">{dayNamesMon.map(d=><span key={d}>{d}</span>)}</div><div className="month-grid-body">{cells.map((cell,i)=>{const dayEvents=getEventsForDate(calEvents,cell.date);return(<div key={i} className={`month-day ${cell.otherMonth?'other-month':''} ${cell.isToday?'today':''}`}><div className="day-number">{cell.day}</div>{dayEvents.slice(0,3).map((ev,j)=>{const who=getEventWho(ev);return<div key={j} className={`day-event ${getWhoClass(who)}`} onClick={()=>setEditingEvent(ev)}>{cleanEventTitle(ev)}</div>})}{dayEvents.length>3&&<div className="day-event who-default">+{dayEvents.length-3}</div>}</div>)})}</div></div>}
    {calView==='week'&&!loading&&<div className="week-view">{weekDays.map((day,i)=>{const dayEvents=getEventsForDate(calEvents,day);const isToday=isSameDay(day,today);return(<div className="week-day-card" key={i}><div className={`week-day-label ${isToday?'today':''}`}>{dayNamesFullMon[i]} {day.getDate()} {monthNames[day.getMonth()].slice(0,3)}</div>{dayEvents.length===0?<div className="week-no-events">No events</div>:dayEvents.map((ev,j)=>{const who=getEventWho(ev);const startDt=ev.start?.dateTime?new Date(ev.start.dateTime):null;const endDt=ev.end?.dateTime?new Date(ev.end.dateTime):null;let timeStr='All day';if(startDt&&endDt){const s=startDt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});const e2=endDt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});timeStr=`${s}–${e2}`}return<div className={`week-event ${getWhoClass(who)}`} key={j} onClick={()=>setEditingEvent(ev)}><span className="week-event-title">{cleanEventTitle(ev)}</span><span className="week-event-time">{timeStr}</span></div>})}</div>)})}</div>}
    {calView==='month'&&<div className="section"><div className="upcoming-toggle"><button className={upcomingMode==='month'?'active':''} onClick={()=>setUpcomingMode('month')}>This Month</button><button className={upcomingMode==='all'?'active':''} onClick={()=>setUpcomingMode('all')}>All Upcoming</button></div>{upcomingEvents.length===0&&!loading?<div className="empty-state">No upcoming events.</div>:upcomingEvents.slice(0,15).map((ev,i)=>{const who=getEventWho(ev);const start=ev.start?.dateTime?new Date(ev.start.dateTime):new Date(ev.start?.date);const timeStr=ev.start?.dateTime?start.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' · '+start.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):start.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' · All day';return(<div className="event-item" key={i} onClick={()=>setEditingEvent(ev)}><div className={`event-dot ${getWhoClass(who)}`}/><div className="event-details"><div className="event-title">{cleanEventTitle(ev)}</div><div className="event-meta">{who} · {timeStr}{ev.location?` · ${ev.location}`:''}</div></div></div>)})}</div>}
    {calView==='week'&&<div className="section"><div className="section-title">Upcoming</div>{futureEvents.length===0&&!loading?<div className="empty-state">No upcoming events.</div>:futureEvents.slice(0,10).map((ev,i)=>{const who=getEventWho(ev);const start=ev.start?.dateTime?new Date(ev.start.dateTime):new Date(ev.start?.date);const timeStr=ev.start?.dateTime?start.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' · '+start.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):start.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' · All day';return(<div className="event-item" key={i} onClick={()=>setEditingEvent(ev)}><div className={`event-dot ${getWhoClass(who)}`}/><div className="event-details"><div className="event-title">{cleanEventTitle(ev)}</div><div className="event-meta">{who} · {timeStr}{ev.location?` · ${ev.location}`:''}</div></div></div>)})}</div>}
    {editingEvent&&<EditEventModal event={editingEvent} user={user} onUpdate={onUpdateEvent} onDelete={onDeleteEvent} onClose={()=>setEditingEvent(null)} onRefresh={fetchCurrentView}/>}
  </>);
}

// ============================================
// TODOS TAB
// ============================================
function TodoQuickAdd({category,user,onAdd}){const[task,setTask]=useState('');const[who,setWho]=useState(user?.name||'Both');const[saving,setSaving]=useState(false);const handleAdd=async()=>{if(!task.trim())return;setSaving(true);await onAdd({task:task.trim(),category,who});setSaving(false);setTask('')};return(<div className="todo-quick-add"><input value={task} onChange={e=>setTask(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleAdd()}} placeholder={`Add ${category.toLowerCase()} task...`}/><select value={who} onChange={e=>setWho(e.target.value)}>{[...CONFIG.USERS,'Both'].map(u=><option key={u} value={u}>{u}</option>)}</select><button onClick={handleAdd} disabled={!task.trim()||saving}>{saving?'...':'Add'}</button></div>)}

function TodosTab({user,todos,loading,onAdd,onUpdate,onDelete,onRefresh}){
  const[filter,setFilter]=useState('all');const[editingTodo,setEditingTodo]=useState(null);
  useEffect(()=>{onRefresh()},[onRefresh]);
  const openTodos=todos.filter(t=>t.status==='Open');const doneTodos=todos.filter(t=>t.status==='Done').sort((a,b)=>(b.completedDate||'').localeCompare(a.completedDate||'')).slice(0,10);
  const filterTodos=(list)=>filter==='all'?list:list.filter(t=>t.who===user.name||t.who==='Both');
  const generalTodos=filterTodos(openTodos.filter(t=>t.category==='General'));const apartmentTodos=filterTodos(openTodos.filter(t=>t.category==='Apartment'));
  const handleComplete=async(todo)=>{const today=new Date().toISOString().split('T')[0];await onUpdate(todo.rowIndex,{...todo,status:'Done',completedDate:today})};
  const handleRestore=async(todo)=>{await onUpdate(todo.rowIndex,{...todo,status:'Open',completedDate:''})};
  const renderTodoList=(list)=>{if(list.length===0)return<div className="empty-state">No tasks here.</div>;return list.map((t,i)=>(<div className="todo-item" key={i}><div className="todo-checkbox" onClick={()=>handleComplete(t)}/><div className="todo-content" onClick={()=>setEditingTodo(t)}><div className="todo-text">{t.task}</div><div className="todo-assignee">{t.who}</div></div></div>))};
  return(<>
    <div className="todo-filter"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All</button><button className={filter==='mine'?'active':''} onClick={()=>setFilter('mine')}>Mine</button></div>
    {loading?<div className="loading">Loading tasks...</div>:<>
      <div className="section"><div className="todo-section-header"><span className="todo-section-title">General</span><span className="todo-count">{generalTodos.length}</span></div><TodoQuickAdd category="General" user={user} onAdd={onAdd}/>{renderTodoList(generalTodos)}</div>
      <div className="section"><div className="todo-section-header"><span className="todo-section-title">Apartment</span><span className="todo-count">{apartmentTodos.length}</span></div><TodoQuickAdd category="Apartment" user={user} onAdd={onAdd}/>{renderTodoList(apartmentTodos)}</div>
      {doneTodos.length>0&&<div className="section"><div className="todo-history-title">Recently Completed</div>{doneTodos.map((t,i)=>(<div className="todo-history-item" key={i} onClick={()=>handleRestore(t)}><span className="todo-history-text">{t.task}</span><span className="todo-history-meta">{t.who} · {t.completedDate?formatDate(t.completedDate):''}</span></div>))}</div>}
    </>}
    {editingTodo&&<EditTodoModal todo={editingTodo} user={user} onUpdate={onUpdate} onDelete={onDelete} onClose={()=>setEditingTodo(null)}/>}
  </>);
}

function EditTodoModal({todo,user,onUpdate,onDelete,onClose}){const[form,setForm]=useState({task:todo.task,category:todo.category,who:todo.who});const[saving,setSaving]=useState(false);const[confirmDelete,setConfirmDelete]=useState(false);const[deleting,setDeleting]=useState(false);const handleSave=async()=>{setSaving(true);await onUpdate(todo.rowIndex,{...todo,task:form.task,category:form.category,who:form.who});setSaving(false);onClose()};const handleDelete=async()=>{setDeleting(true);await onDelete(todo.rowIndex);setDeleting(false);onClose()};if(confirmDelete)return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="confirm-dialog"><p>Delete "{todo.task}"?</p><div className="confirm-actions"><button className="btn-secondary" onClick={()=>setConfirmDelete(false)}>Cancel</button><button className="btn-delete" onClick={handleDelete} disabled={deleting}>{deleting?'Deleting...':'Delete'}</button></div></div></div></div>);return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Edit Task</h3><button className="modal-close" onClick={onClose}>✕</button></div><div className="add-form"><div className="form-row"><div className="form-field"><label>Task</label><input value={form.task} onChange={e=>setForm(f=>({...f,task:e.target.value}))}/></div></div><div className="form-row"><div className="form-field"><label>Category</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option value="General">General</option><option value="Apartment">Apartment</option></select></div><div className="form-field"><label>Who</label><select value={form.who} onChange={e=>setForm(f=>({...f,who:e.target.value}))}>{[...CONFIG.USERS,'Both'].map(u=><option key={u} value={u}>{u}</option>)}</select></div></div><div className="form-actions"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave} disabled={!form.task||saving}>{saving?'Saving...':'Save Changes'}</button></div></div><button className="btn-delete" onClick={()=>setConfirmDelete(true)}>Delete Task</button></div></div>)}

// ============================================
// PENDING ACTION (from Claude links)
// ============================================
function PendingAction({data,user,onAddExpense,onAddEvent,onDismiss,fetchExpenses}){const[status,setStatus]=useState('ready');const[resultMsg,setResultMsg]=useState('');const isExpense=data.action==='add_expense';const isEvent=data.action==='add_event';const isBatch=isExpense&&Array.isArray(data.expenses);const expenses=isBatch?data.expenses:(isExpense?[data]:[]);const handleConfirm=async()=>{setStatus('sending');try{if(isExpense){let allOk=true;for(const exp of expenses){const success=await onAddExpense({merchant:exp.merchant||'',amount:parseFloat(exp.amount)||0,date:exp.date||new Date().toISOString().split('T')[0],category:exp.category||'',who:exp.who||'Telman',tag:exp.tag||'',notes:exp.notes||'',account:exp.account||''});if(!success)allOk=false}if(allOk){await fetchExpenses();setStatus('success');setResultMsg(`${expenses.length} expense(s) added`)}else{setStatus('error');setResultMsg('Some expenses failed')}}else if(isEvent){const eventData={title:data.title||'',who:data.who||'Telman',category:data.category||'Social',location:data.location||'',allDay:!!data.all_day};if(data.all_day){eventData.startDate=data.start;eventData.endDate=data.end||data.start}else{eventData.startDateTime=data.start;eventData.endDateTime=data.end||data.start}const success=await onAddEvent(eventData);if(success){setStatus('success');setResultMsg(`Event "${data.title}" created`)}else{setStatus('error');setResultMsg('Failed to create event')}}}catch(err){setStatus('error');setResultMsg('Error: '+err.message)}};const handleDismiss=()=>{window.location.hash='';onDismiss()};
  return(<div className="pending-screen"><h1>Family Planner</h1><div className="pending-subtitle">{status==='ready'&&(isExpense?`Confirm ${expenses.length} expense(s) from Claude`:'Confirm event from Claude')}{status==='sending'&&'Saving...'}{status==='success'&&'Done!'}{status==='error'&&'Something went wrong'}</div>
    {status==='ready'&&isExpense&&!isBatch&&<div className="pending-card"><div className="pending-row"><span className="pending-row-label">Merchant</span><span className="pending-row-value">{data.merchant}</span></div><div className="pending-row"><span className="pending-row-label">Amount</span><span className="pending-row-value">{formatCurrency(data.amount)}</span></div><div className="pending-row"><span className="pending-row-label">Date</span><span className="pending-row-value">{data.date}</span></div><div className="pending-row"><span className="pending-row-label">Category</span><span className="pending-row-value">{data.category}</span></div><div className="pending-row"><span className="pending-row-label">Who</span><span className="pending-row-value">{data.who||'Telman'}</span></div><div className="pending-row"><span className="pending-row-label">Account</span><span className="pending-row-value">{data.account}</span></div>{data.tag&&<div className="pending-row"><span className="pending-row-label">Tag</span><span className="pending-row-value">{data.tag}</span></div>}{data.notes&&<div className="pending-row"><span className="pending-row-label">Notes</span><span className="pending-row-value">{data.notes}</span></div>}</div>}
    {status==='ready'&&isExpense&&isBatch&&<>{expenses.map((exp,i)=>(<div className="pending-batch-item" key={i}><div><div className="pending-batch-merchant">{exp.merchant}</div><div className="pending-batch-meta">{exp.date} · {exp.category} · {exp.account}</div></div><div className="pending-batch-amount">{formatCurrency(exp.amount)}</div></div>))}</>}
    {status==='ready'&&isEvent&&<div className="pending-card"><div className="pending-row"><span className="pending-row-label">Title</span><span className="pending-row-value">{data.title}</span></div><div className="pending-row"><span className="pending-row-label">Start</span><span className="pending-row-value">{data.start}</span></div>{data.end&&<div className="pending-row"><span className="pending-row-label">End</span><span className="pending-row-value">{data.end}</span></div>}<div className="pending-row"><span className="pending-row-label">Who</span><span className="pending-row-value">{data.who||'Telman'}</span></div><div className="pending-row"><span className="pending-row-label">Category</span><span className="pending-row-value">{data.category}</span></div>{data.location&&<div className="pending-row"><span className="pending-row-label">Location</span><span className="pending-row-value">{data.location}</span></div>}</div>}
    {status==='ready'&&<div className="pending-actions"><button className="btn-secondary" onClick={handleDismiss}>Cancel</button><button className="btn-primary" onClick={handleConfirm}>Confirm & Save</button></div>}
    {status==='sending'&&<div className="loading">Saving...</div>}
    {status==='success'&&<><div className="pending-result success">✓ {resultMsg}</div><div className="pending-actions"><button className="btn-primary" onClick={handleDismiss}>Back to App</button></div></>}
    {status==='error'&&<><div className="pending-result error">✗ {resultMsg}</div><div className="pending-actions"><button className="btn-secondary" onClick={handleDismiss}>Back to App</button><button className="btn-primary" onClick={handleConfirm}>Retry</button></div></>}
  </div>);
}

// ============================================
// SIGN IN + MAIN APP
// ============================================
function SignInScreen({onSignIn,ready}){return(<div className="sign-in-screen"><h1>Family Planner</h1><p>Sign in with Google to get started</p><button className="google-btn" onClick={onSignIn} disabled={!ready}><GoogleIcon/> Sign in with Google</button></div>)}

export default function App(){
  const{user,signIn,signOut,ready}=useGoogleAuth();
  const{expenses,loading:expLoading,fetchExpenses,addExpense,updateExpense,deleteExpense}=useSheets();
  const{events,loading:calLoading,fetchEvents,addEvent,updateEvent,deleteEvent}=useCalendar();
  const{todos,loading:todoLoading,fetchTodos,addTodo,updateTodo,deleteTodo}=useTodos();
  const{settings,loaded:settingsLoaded,fetchSettings,saveSettings}=useSettings();
  const[tab,setTab]=useState('finances');const[toast,setToast]=useState(null);const[pendingAction,setPendingAction]=useState(null);const[showCycleSettings,setShowCycleSettings]=useState(false);

  useEffect(()=>{const checkHash=()=>{const hash=window.location.hash;if(hash.startsWith('#add/')){try{const json=decodeURIComponent(atob(hash.slice(5)));setPendingAction(JSON.parse(json))}catch(e){console.error('Failed to parse pending action:',e)}}};checkHash();window.addEventListener('hashchange',checkHash);return()=>window.removeEventListener('hashchange',checkHash)},[]);
  useEffect(()=>{if(user)fetchSettings()},[user,fetchSettings]);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2200)};

  if(pendingAction&&user)return(<><style>{styles}</style><PendingAction data={pendingAction} user={user} onAddExpense={async(e)=>{const s=await addExpense(e);return s}} onAddEvent={async(e)=>{const s=await addEvent(e);return s}} onDismiss={()=>setPendingAction(null)} fetchExpenses={fetchExpenses}/></>);
  if(pendingAction&&!user)return(<><style>{styles}</style><div className="sign-in-screen"><h1>Family Planner</h1><p>Sign in to confirm the pending action</p><button className="google-btn" onClick={signIn} disabled={!ready}><GoogleIcon/> Sign in with Google</button></div></>);
  if(!user)return(<><style>{styles}</style><SignInScreen onSignIn={signIn} ready={ready}/></>);

  return(<><style>{styles}</style><div className="app">
    <div className="header"><h1>Family Planner</h1><div className="header-right"><span className="user-pill">{user.name}</span><button className="sign-out-btn" onClick={signOut}>Sign out</button></div></div>
    {tab==='finances'&&<FinancesTab user={user} expenses={expenses} loading={expLoading} settings={settings}
      onAddExpense={async(e)=>{const s=await addExpense(e);if(s)showToast('Expense added');return s}}
      onUpdateExpense={async(r,e)=>{const s=await updateExpense(r,e);if(s)showToast('Expense updated');return s}}
      onDeleteExpense={async(r)=>{const s=await deleteExpense(r);if(s)showToast('Expense deleted');return s}}
      onRefresh={fetchExpenses} onShowCycleSettings={()=>setShowCycleSettings(true)}/>}
    {tab==='calendar'&&<CalendarTab user={user} events={events} loading={calLoading} onFetchEvents={fetchEvents}
      onAddEvent={async(e)=>{const s=await addEvent(e);if(s)showToast('Event created');return s}}
      onUpdateEvent={async(id,e)=>{const s=await updateEvent(id,e);if(s)showToast('Event updated');return s}}
      onDeleteEvent={async(id)=>{const s=await deleteEvent(id);if(s)showToast('Event deleted');return s}}/>}
    {tab==='todos'&&<TodosTab user={user} todos={todos} loading={todoLoading}
      onAdd={async(t)=>{const s=await addTodo(t);if(s)showToast('Task added');return s}}
      onUpdate={async(r,t)=>{const s=await updateTodo(r,t);if(s)showToast('Task updated');return s}}
      onDelete={async(r)=>{const s=await deleteTodo(r);if(s)showToast('Task deleted');return s}}
      onRefresh={fetchTodos}/>}
    {toast&&<div className="toast">{toast}</div>}
    {showCycleSettings&&<CycleSettingsPanel settings={settings} onSave={saveSettings} onClose={()=>setShowCycleSettings(false)}/>}
    <div className="tab-bar">
      <button className={`tab-btn ${tab==='finances'?'active':''}`} onClick={()=>setTab('finances')}>{Icons.finances}<span>Finances</span></button>
      <button className={`tab-btn ${tab==='calendar'?'active':''}`} onClick={()=>setTab('calendar')}>{Icons.calendar}<span>Calendar</span></button>
      <button className={`tab-btn ${tab==='todos'?'active':''}`} onClick={()=>setTab('todos')}>{Icons.todos}<span>To-Do</span></button>
    </div>
  </div></>);
}

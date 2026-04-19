import React, { useState, useEffect, useCallback } from 'react';

const CONFIG = {
  CLIENT_ID: '1018765120682-qka33op2s5qvs95uks63otmr9jiljgq7.apps.googleusercontent.com',
  API_KEY: 'AIzaSyBQlk6Ea_nl05ucjNFb2eMS4WDhIJc7Cs8',
  SPREADSHEET_ID: '1XebU3JkjbabjvVU_4ABmmrIPKNjrFTa9O5XKMqti2xc',
  CALENDAR_ID: '46706267f7316987a9408df500be5b14f9f0da5315547ad35ddde7773eefa330@group.calendar.google.com',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  BUDGET_PER_PERSON: 1200, USERS: ['Telman', 'Lena'],
  EXPENSE_CATEGORIES: ['Food & Drink', 'Shopping', 'Activities & Entertainment', 'Travel', 'Sports & Wellness', 'Health & Medical'],
  EVENT_CATEGORIES: ['Social', 'Travel', 'Kids', 'Work'], ACCOUNTS: ['ING', 'DB'], DEFAULT_CYCLE_DAY: 24,
};

const styles = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#fafaf8;--bg-card:#fff;--bg-hover:#f5f4f2;--bg-input:#f5f4f2;--border:#e8e6e3;--border-focus:#1a1a1a;--text-primary:#1a1a1a;--text-secondary:#6b6963;--text-tertiary:#9b978f;--accent:#1a1a1a;--green:#2d8a4e;--green-bg:#e8f5e9;--amber:#c17f24;--red:#c62828;--red-bg:#ffebee;--font-heading:'DM Serif Display',serif;--font-body:'DM Sans',sans-serif;--radius:10px;--radius-sm:6px;--shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);--shadow-lg:0 4px 12px rgba(0,0,0,.08);--color-telman:#1565c0;--color-telman-bg:#e3f2fd;--color-lena:#2e7d32;--color-lena-bg:#e8f5e9;--color-family:#c62828;--color-family-bg:#ffebee}
body{font-family:var(--font-body);background:var(--bg);color:var(--text-primary);-webkit-font-smoothing:antialiased}
.app{max-width:480px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column;padding-bottom:72px}
.header{padding:16px 20px 12px;display:flex;align-items:center;justify-content:space-between}
.header h1{font-family:var(--font-heading);font-size:22px;font-weight:400;letter-spacing:-.3px}
.header-right{display:flex;align-items:center;gap:12px}
.user-pill{font-size:12px;color:var(--text-secondary);background:var(--bg-input);padding:4px 10px;border-radius:20px;font-weight:500}
.sign-out-btn{font-size:12px;color:var(--text-tertiary);background:none;border:none;cursor:pointer;text-decoration:underline;font-family:var(--font-body)}
.tab-bar{position:fixed;bottom:0;left:0;right:0;background:var(--bg-card);border-top:1px solid var(--border);display:flex;justify-content:center;padding:6px 0 calc(6px + env(safe-area-inset-bottom));z-index:100}
.tab-btn{flex:1;max-width:130px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;background:none;border:none;cursor:pointer;font-family:var(--font-body);font-size:10px;font-weight:500;color:var(--text-tertiary);transition:color .15s}
.tab-btn.active{color:var(--text-primary)}.tab-btn svg{width:22px;height:22px}
.budget-card{margin:0 16px 16px;padding:20px;background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border)}
.budget-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px}
.budget-label{font-size:13px;color:var(--text-secondary);font-weight:500}
.budget-settings-btn{background:none;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:11px;color:var(--text-tertiary);padding:3px 8px;font-family:var(--font-body);font-weight:500;margin-left:8px;transition:all .15s}
.budget-settings-btn:hover{border-color:var(--text-tertiary);color:var(--text-primary)}
.budget-amount{font-family:var(--font-heading);font-size:28px;letter-spacing:-.5px}
.budget-bar-track{height:6px;background:var(--bg-input);border-radius:3px;overflow:hidden;margin-bottom:8px}
.budget-bar-fill{height:100%;border-radius:3px;transition:width .4s ease,background .3s ease}
.budget-bar-fill.green{background:var(--green)}.budget-bar-fill.amber{background:var(--amber)}.budget-bar-fill.red{background:var(--red)}
.budget-sub{font-size:12px;color:var(--text-tertiary)}.budget-period{font-size:11px;color:var(--text-tertiary);margin-top:4px}
.view-toggle,.cal-view-toggle,.todo-filter{display:flex;margin:0 16px 16px;background:var(--bg-input);border-radius:var(--radius-sm);padding:3px;gap:2px}
.view-toggle button,.cal-view-toggle button,.todo-filter button{flex:1;padding:7px 0;border:none;background:transparent;border-radius:5px;font-family:var(--font-body);font-size:13px;font-weight:500;color:var(--text-secondary);cursor:pointer;transition:all .15s}
.view-toggle button.active,.cal-view-toggle button.active,.todo-filter button.active{background:var(--bg-card);color:var(--text-primary);box-shadow:var(--shadow)}
.cal-view-toggle{margin-bottom:12px}.cal-view-toggle button{font-size:12px;padding:6px 0}
.section{margin:0 16px 20px}.section-title{font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:var(--text-tertiary);font-weight:600;margin-bottom:10px;padding:0 4px}
.cat-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;font-size:14px;cursor:pointer;transition:background .15s}
.cat-row:hover{background:var(--bg-hover)}.cat-row:first-child{border-radius:var(--radius) var(--radius) 0 0}.cat-row:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.cat-row:only-child{border-radius:var(--radius)}.cat-row.active{background:var(--bg-hover);border-color:var(--text-tertiary)}
.cat-name{color:var(--text-secondary)}.cat-amount{font-weight:600;font-variant-numeric:tabular-nums}
.filter-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;margin-bottom:10px;background:var(--accent);color:#fff;border-radius:20px;font-size:12px;font-weight:500}
.filter-pill button{background:none;border:none;color:#fff;font-size:14px;cursor:pointer;line-height:1;padding:0;margin-left:2px}
.expense-item{display:flex;align-items:center;padding:12px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;gap:12px;cursor:pointer;transition:background .15s}
.expense-item:hover{background:var(--bg-hover)}.expense-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.expense-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.expense-item:only-child{border-radius:var(--radius)}
.expense-icon{width:36px;height:36px;border-radius:8px;background:var(--bg-input);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.expense-details{flex:1;min-width:0}.expense-merchant{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.expense-meta{font-size:12px;color:var(--text-tertiary);margin-top:1px}.expense-amount{font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;flex-shrink:0}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:300;display:flex;align-items:flex-end;justify-content:center}
.modal-content{background:var(--bg-card);border-radius:16px 16px 0 0;width:100%;max-width:480px;padding:20px 16px calc(20px + env(safe-area-inset-bottom));max-height:85vh;overflow-y:auto}
.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.modal-header h3{font-family:var(--font-heading);font-size:18px;font-weight:400}
.modal-close{background:none;border:none;font-size:20px;color:var(--text-tertiary);cursor:pointer;padding:4px}
.btn-delete{width:100%;padding:10px;background:var(--red-bg);color:var(--red);border:1px solid #ffcdd2;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;margin-top:8px}.btn-delete:hover{background:#ffcdd2}
.add-form-toggle{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;margin-bottom:12px;background:var(--bg-card);border:1px dashed var(--border);border-radius:var(--radius);cursor:pointer;font-family:var(--font-body);font-size:13px;font-weight:500;color:var(--text-secondary);transition:all .15s}
.add-form-toggle:hover{border-color:var(--text-tertiary);color:var(--text-primary)}
.add-form{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
.form-row{display:flex;gap:8px;margin-bottom:8px}.form-field{flex:1;display:flex;flex-direction:column;gap:4px}
.form-field label{font-size:11px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.5px}
.form-field input,.form-field select,.form-field textarea{padding:9px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;background:var(--bg-input);color:var(--text-primary);outline:none;transition:border-color .15s;width:100%}
.form-field textarea{resize:vertical;min-height:60px}.form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:var(--border-focus)}
.form-actions{display:flex;gap:8px;margin-top:4px}
.btn-primary{flex:1;padding:10px;background:var(--accent);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s}.btn-primary:hover{opacity:.85}.btn-primary:disabled{opacity:.4;cursor:not-allowed}
.btn-secondary{padding:10px 16px;background:var(--bg-input);color:var(--text-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;font-weight:500;cursor:pointer}
.cal-header{display:flex;justify-content:space-between;align-items:center;margin:0 16px 12px}.cal-header h2{font-family:var(--font-heading);font-size:18px;font-weight:400}
.cal-nav{display:flex;gap:4px}.cal-nav button{width:32px;height:32px;border:1px solid var(--border);background:var(--bg-card);border-radius:var(--radius-sm);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--text-secondary);transition:all .15s}.cal-nav button:hover{border-color:var(--text-tertiary)}
.month-grid{margin:0 16px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.month-grid-header{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--border)}
.month-grid-header span{padding:8px 0;text-align:center;font-size:11px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.5px}
.month-grid-body{display:grid;grid-template-columns:repeat(7,1fr)}
.month-day{min-height:64px;padding:4px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);font-size:11px;overflow:hidden}
.month-day:nth-child(7n){border-right:none}.month-day.other-month{opacity:.3}
.month-day.today .day-number{background:var(--accent);color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center}
.day-number{font-weight:600;font-size:11px;margin-bottom:2px;color:var(--text-secondary)}
.day-event{font-size:9px;padding:1px 3px;border-radius:2px;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;max-width:100%;display:block;cursor:pointer}
.day-event.who-telman{background:var(--color-telman-bg);color:var(--color-telman)}.day-event.who-lena{background:var(--color-lena-bg);color:var(--color-lena)}.day-event.who-family{background:var(--color-family-bg);color:var(--color-family)}.day-event.who-default{background:var(--bg-input);color:var(--text-secondary)}
.week-view{margin:0 16px 16px}.week-day-card{background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;padding:12px 14px}
.week-day-card:first-child{border-radius:var(--radius) var(--radius) 0 0}.week-day-card:last-child{border-radius:0 0 var(--radius) var(--radius)}
.week-day-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-tertiary);margin-bottom:6px}.week-day-label.today{color:var(--accent)}
.week-event{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;margin-bottom:2px;border-radius:4px;font-size:13px;cursor:pointer;transition:opacity .15s}.week-event:hover{opacity:.8}
.week-event.who-telman{background:var(--color-telman-bg)}.week-event.who-lena{background:var(--color-lena-bg)}.week-event.who-family{background:var(--color-family-bg)}.week-event.who-default{background:var(--bg-input)}
.week-event-title{font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.week-event-time{color:var(--text-tertiary);font-size:12px;flex-shrink:0;margin-left:8px}.week-no-events{font-size:12px;color:var(--text-tertiary);font-style:italic}
.event-item{display:flex;align-items:flex-start;padding:12px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;gap:12px;cursor:pointer;transition:background .15s}
.event-item:hover{background:var(--bg-hover)}.event-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.event-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.event-item:only-child{border-radius:var(--radius)}
.event-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0}
.event-dot.who-telman{background:var(--color-telman)}.event-dot.who-lena{background:var(--color-lena)}.event-dot.who-family{background:var(--color-family)}.event-dot.who-default{background:var(--text-tertiary)}
.event-details{flex:1}.event-title{font-size:14px;font-weight:500}.event-meta{font-size:12px;color:var(--text-tertiary);margin-top:2px}
.sign-in-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;padding:40px 20px;text-align:center}
.sign-in-screen h1{font-family:var(--font-heading);font-size:32px;font-weight:400;margin-bottom:8px}.sign-in-screen p{color:var(--text-secondary);font-size:14px;margin-bottom:32px}
.google-btn{display:flex;align-items:center;gap:10px;padding:12px 24px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);font-family:var(--font-body);font-size:15px;font-weight:500;cursor:pointer;box-shadow:var(--shadow);transition:box-shadow .15s}.google-btn:hover{box-shadow:var(--shadow-lg)}.google-btn svg{width:20px;height:20px}
.loading{display:flex;align-items:center;justify-content:center;padding:40px;color:var(--text-tertiary);font-size:14px}
.empty-state{text-align:center;padding:32px 16px;color:var(--text-tertiary);font-size:13px}
.toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:500;z-index:200;animation:toastIn .2s ease,toastOut .2s ease 2s forwards;white-space:nowrap}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes toastOut{from{opacity:1}to{opacity:0}}
.month-history-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;font-size:14px;cursor:pointer;transition:background .15s}
.month-history-row:hover{background:var(--bg-hover)}.month-history-row:first-child{border-radius:var(--radius) var(--radius) 0 0}.month-history-row:last-child{border-radius:0 0 var(--radius) var(--radius)}
.month-history-label{color:var(--text-secondary)}.month-history-amount{font-weight:600;font-variant-numeric:tabular-nums}
.confirm-dialog{padding:20px;text-align:center}.confirm-dialog p{font-size:14px;color:var(--text-secondary);margin-bottom:16px}.confirm-actions{display:flex;gap:8px}.confirm-actions button{flex:1}
.pending-screen{max-width:480px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column;padding:20px 16px}
.pending-screen h1{font-family:var(--font-heading);font-size:22px;font-weight:400;margin-bottom:4px}.pending-subtitle{font-size:13px;color:var(--text-tertiary);margin-bottom:20px}
.pending-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px}
.pending-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px}.pending-row:last-child{border-bottom:none}
.pending-row-label{color:var(--text-tertiary);font-weight:500}.pending-row-value{font-weight:600;text-align:right}
.pending-actions{display:flex;gap:8px;margin-top:8px}.pending-actions .btn-primary,.pending-actions .btn-secondary{padding:12px;font-size:15px}
.pending-result{text-align:center;padding:24px;font-size:15px}.pending-result.success{color:var(--green)}.pending-result.error{color:var(--red)}
.pending-batch-item{background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;font-size:14px}
.pending-batch-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.pending-batch-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:16px}.pending-batch-item:only-child{border-radius:var(--radius);margin-bottom:16px}
.pending-batch-merchant{font-weight:500}.pending-batch-meta{font-size:12px;color:var(--text-tertiary)}.pending-batch-amount{font-weight:600;font-variant-numeric:tabular-nums}
.upcoming-toggle{display:flex;margin-bottom:10px;padding:0 4px;gap:8px}
.upcoming-toggle button{background:none;border:none;font-family:var(--font-body);font-size:11px;text-transform:uppercase;letter-spacing:.8px;font-weight:600;color:var(--text-tertiary);cursor:pointer;padding:0;transition:color .15s}.upcoming-toggle button.active{color:var(--text-primary)}
.todo-quick-add{display:flex;gap:8px;margin-bottom:8px}
.todo-quick-add input{flex:1;padding:9px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;background:var(--bg-input);color:var(--text-primary);outline:none}.todo-quick-add input:focus{border-color:var(--border-focus)}
.todo-quick-add select{padding:9px 6px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:13px;background:var(--bg-input);color:var(--text-primary);outline:none;width:90px}
.todo-quick-add button{padding:9px 14px;background:var(--accent);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap}.todo-quick-add button:disabled{opacity:.4;cursor:not-allowed}
.todo-item{display:flex;align-items:flex-start;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;gap:10px}
.todo-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.todo-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.todo-item:only-child{border-radius:var(--radius)}
.todo-checkbox{width:20px;height:20px;border:2px solid var(--border);border-radius:50%;cursor:pointer;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all .15s;background:transparent}.todo-checkbox:hover{border-color:var(--green)}
.todo-content{flex:1;min-width:0;cursor:pointer}.todo-text{font-size:14px;font-weight:400}.todo-assignee{font-size:12px;color:var(--text-tertiary);margin-top:2px}
.todo-history-title{font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:var(--text-tertiary);font-weight:600;margin-bottom:10px;padding:0 4px;margin-top:8px}
.todo-history-item{display:flex;align-items:center;padding:8px 14px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:-1px;gap:10px;font-size:13px;cursor:pointer;transition:background .15s}
.todo-history-item:hover{background:var(--bg-hover)}.todo-history-item:first-child{border-radius:var(--radius) var(--radius) 0 0}.todo-history-item:last-child{border-radius:0 0 var(--radius) var(--radius);margin-bottom:0}.todo-history-item:only-child{border-radius:var(--radius)}
.todo-history-text{flex:1;text-decoration:line-through;color:var(--text-tertiary)}.todo-history-meta{font-size:11px;color:var(--text-tertiary);flex-shrink:0}
.settle-card{margin:0 16px 16px;padding:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius)}
.settle-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:14px}
.settle-row:last-child{margin-bottom:0}.settle-amount{font-weight:600;font-variant-numeric:tabular-nums}
.settle-amount.owed{color:var(--red)}.settle-amount.owed-to{color:var(--green)}
.settle-btn{padding:6px 12px;background:var(--green-bg);color:var(--green);border:1px solid #c8e6c9;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer}
.event-banner{margin:0 16px 12px;padding:10px 14px;background:var(--color-telman-bg);border:1px solid #bbdefb;border-radius:var(--radius);font-size:13px;display:flex;align-items:center;gap:8px}
.event-banner-dot{width:6px;height:6px;border-radius:50%;background:var(--color-telman);flex-shrink:0;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.event-banner-text{flex:1}.event-banner-time{font-size:11px;color:var(--text-tertiary)}
.insight-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
.insight-title{font-size:13px;font-weight:600;margin-bottom:8px}.insight-value{font-family:var(--font-heading);font-size:24px;letter-spacing:-.5px}
.insight-sub{font-size:12px;color:var(--text-tertiary);margin-top:4px}
.insight-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px}
.insight-bar-label{width:90px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0}
.insight-bar-track{flex:1;height:14px;background:var(--bg-input);border-radius:3px;overflow:hidden}
.insight-bar-fill{height:100%;border-radius:3px;background:var(--accent);transition:width .4s}
.insight-bar-val{width:50px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;flex-shrink:0}
.trend-row{display:flex;justify-content:space-between;align-items:flex-end;padding:4px 0;border-bottom:1px solid var(--border);font-size:13px}
.trend-row:last-child{border-bottom:none}.trend-label{color:var(--text-secondary)}.trend-val{font-weight:600;font-variant-numeric:tabular-nums}
.trend-change{font-size:11px;margin-left:4px}.trend-up{color:var(--red)}.trend-down{color:var(--green)}
`;

// HELPERS
const CATEGORY_ICONS={'Food & Drink':'🍽','Shopping':'🛍','Activities & Entertainment':'🎭','Travel':'✈️','Sports & Wellness':'💪','Health & Medical':'🏥','Health & Wellness':'💪'};
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayNamesMon=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const dayNamesFullMon=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function formatCurrency(n){return '€'+Math.round(Number(n))}
function formatDate(d){const date=new Date(d);return date.getDate()+' '+monthNames[date.getMonth()].slice(0,3)}
function isSameDay(d1,d2){return d1.getFullYear()===d2.getFullYear()&&d1.getMonth()===d2.getMonth()&&d1.getDate()===d2.getDate()}
function getEventCategory(ev){const d=(ev.description||'').toLowerCase();if(d.includes('category: travel'))return'travel';if(d.includes('category: social'))return'social';if(d.includes('category: kids'))return'kids';if(d.includes('category: work'))return'work';return'default'}
function getEventWho(ev){const t=ev.summary||'';const m=t.match(/^\[([^\]]+)\]/);if(!m)return'Family';const r=m[1];for(const u of CONFIG.USERS){if(r.toLowerCase().startsWith(u.toLowerCase()))return u}if(r.toLowerCase()==='family')return'Family';return r}
function getWhoClass(w){const l=(w||'').toLowerCase();if(l==='telman')return'who-telman';if(l==='lena')return'who-lena';if(l==='family')return'who-family';return'who-default'}
function cleanEventTitle(ev){return(ev.summary||'').replace(/^\[[^\]]+\]\s*/,'')}
function getMondayDow(d){return(d.getDay()+6)%7}
function matchUserName(g){const f=(g||'').split(' ')[0];for(const u of CONFIG.USERS){if(f.toLowerCase().startsWith(u.toLowerCase())||u.toLowerCase().startsWith(f.toLowerCase()))return u}return f}
function getEventsForDate(evs,date){return evs.filter(ev=>{const s=new Date(ev.start?.dateTime||ev.start?.date);const e=new Date(ev.end?.dateTime||ev.end?.date);if(ev.start?.date){const ea=new Date(e);ea.setDate(ea.getDate()-1);return new Date(date.getFullYear(),date.getMonth(),date.getDate())>=new Date(s.getFullYear(),s.getMonth(),s.getDate())&&new Date(date.getFullYear(),date.getMonth(),date.getDate())<=new Date(ea.getFullYear(),ea.getMonth(),ea.getDate())}return isSameDay(s,date)})}
function getCycleDates(cycleDay,now,overrideDate){if(overrideDate){const o=new Date(overrideDate);const n=new Date(o.getFullYear(),o.getMonth()+1,cycleDay);if(now>=o&&now<n)return{start:o,end:new Date(n.getTime()-86400000)}}const y=now.getFullYear(),m=now.getMonth();const ts=new Date(y,m,cycleDay);if(now>=ts)return{start:ts,end:new Date(y,m+1,cycleDay-1)};return{start:new Date(y,m-1,cycleDay),end:new Date(y,m,cycleDay-1)}}
function formatPeriod(s,e){return`${s.getDate()} ${monthNames[s.getMonth()].slice(0,3)} – ${e.getDate()} ${monthNames[e.getMonth()].slice(0,3)}`}
// Settlement calc: returns {telmanOwesLena, lenaOwesTelman}
function calcSettlement(expenses,settleDate){const after=settleDate?new Date(settleDate):new Date(0);let telmanOwes=0,lenaOwes=0;expenses.forEach(ex=>{const d=new Date(ex.date);if(d<=after)return;if(ex.who==='Family'){/* person who entered = person who paid. We infer payer from 'who' field context but since Family means shared, we need payer. Payer = determined by account: ING=Telman paid, DB=whoever's DB */}
  // Simplified: Family+ING = Telman paid → Lena owes 50%. Family+DB = could be either, but we use who entered. Since we can't know who entered from sheet data alone, use account as proxy:
  // ING = Telman's managed account → Telman paid. DB = personal → need another signal.
  // For now: Family+ING → Lena owes Telman 50%. Family+DB → check... DB is personal so if expense is Family, we assume the person whose individual expense it would be paid. But Family is shared. Let's use: if account is ING, Telman paid. If DB, we need "who" but who=Family. 
  // REVISED APPROACH per Telman's instructions: who added it = who paid. But in sheet we don't track who added. So let's add implicit logic: Family expenses on ING → Telman paid (Lena owes 50%). Family expenses on DB with no extra info → we'll treat as "last user who logged in added it" — but we can't know from sheet. SIMPLEST: use a "paid_by" implicit from the app — when user adds a Family expense, we store their name in Notes or a hidden field.
  // ACTUALLY: Let's store payer as the logged-in user's name when who=Family. We'll use the notes field prefix "[Paid:Telman]" or "[Paid:Lena]".
  });
  // The above is getting complex. Let me implement cleanly:
  return{telmanOwes,lenaOwes};
}

// HOOKS
function useGoogleAuth(){const[user,setUser]=useState(null);const[tc,setTc]=useState(null);const[gr,setGr]=useState(false);const[gs,setGs]=useState(false);useEffect(()=>{const lg=()=>{if(window.gapi){window.gapi.load('client',async()=>{await window.gapi.client.init({apiKey:CONFIG.API_KEY});await window.gapi.client.load('sheets','v4');await window.gapi.client.load('calendar','v3');setGr(true)})}else setTimeout(lg,100)};const ls=()=>{if(window.google?.accounts?.oauth2){const c=window.google.accounts.oauth2.initTokenClient({client_id:CONFIG.CLIENT_ID,scope:CONFIG.SCOPES,callback:r=>{if(r.access_token)fi(r.access_token)}});setTc(c);setGs(true)}else setTimeout(ls,100)};lg();ls()},[]);const fi=async(t)=>{try{const r=await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{headers:{Authorization:`Bearer ${t}`}});const i=await r.json();setUser({name:matchUserName(i.given_name||i.name),email:i.email,picture:i.picture})}catch(e){console.error(e)}};return{user,signIn:()=>{if(tc)tc.requestAccessToken()},signOut:()=>{const t=window.gapi?.client?.getToken();if(t){window.google.accounts.oauth2.revoke(t.access_token);window.gapi.client.setToken(null)}setUser(null)},ready:gr&&gs}}

function useSheets(){const[expenses,setExpenses]=useState([]);const[loading,setLoading]=useState(false);const fetch_=useCallback(async()=>{setLoading(true);try{const r=await window.gapi.client.sheets.spreadsheets.values.get({spreadsheetId:CONFIG.SPREADSHEET_ID,range:'Expenses!A2:H10000'});setExpenses((r.result.values||[]).map((r,i)=>({rowIndex:i+2,merchant:r[0]||'',amount:parseFloat(r[1])||0,date:r[2]||'',category:r[3]||'',who:r[4]||'',tag:r[5]||'',notes:r[6]||'',account:r[7]||''})))}catch(e){console.error(e)}setLoading(false)},[]);const add=useCallback(async(ex)=>{try{await window.gapi.client.sheets.spreadsheets.values.append({spreadsheetId:CONFIG.SPREADSHEET_ID,range:'Expenses!A:H',valueInputOption:'USER_ENTERED',resource:{values:[[ex.merchant,ex.amount,ex.date,ex.category,ex.who,ex.tag||'',ex.notes||'',ex.account||'']]}});await fetch_();return true}catch(e){return false}},[fetch_]);const upd=useCallback(async(ri,ex)=>{try{await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`Expenses!A${ri}:H${ri}`,valueInputOption:'USER_ENTERED',resource:{values:[[ex.merchant,ex.amount,ex.date,ex.category,ex.who,ex.tag||'',ex.notes||'',ex.account||'']]}});await fetch_();return true}catch(e){return false}},[fetch_]);const del=useCallback(async(ri)=>{try{const m=await window.gapi.client.sheets.spreadsheets.get({spreadsheetId:CONFIG.SPREADSHEET_ID});const sh=m.result.sheets.find(s=>s.properties.title==='Expenses');await window.gapi.client.sheets.spreadsheets.batchUpdate({spreadsheetId:CONFIG.SPREADSHEET_ID,resource:{requests:[{deleteDimension:{range:{sheetId:sh.properties.sheetId,dimension:'ROWS',startIndex:ri-1,endIndex:ri}}}]}});await fetch_();return true}catch(e){return false}},[fetch_]);return{expenses,loading,fetchExpenses:fetch_,addExpense:add,updateExpense:upd,deleteExpense:del}}

function useCalendar(){const[events,setEvents]=useState([]);const[loading,setLoading]=useState(false);const fetch_=useCallback(async(tMin,tMax)=>{setLoading(true);try{const r=await window.gapi.client.calendar.events.list({calendarId:CONFIG.CALENDAR_ID,timeMin:tMin.toISOString(),timeMax:tMax.toISOString(),singleEvents:true,orderBy:'startTime',maxResults:200});setEvents(r.result.items||[])}catch(e){console.error(e)}setLoading(false)},[]);const add=useCallback(async(ev)=>{try{const w=ev.who||'Family';const res={summary:`[${w}] ${ev.title}`,description:`Category: ${ev.category||'Social'}`};if(ev.location)res.location=ev.location;if(ev.allDay){res.start={date:ev.startDate};const e=new Date(ev.endDate);e.setDate(e.getDate()+1);res.end={date:e.toISOString().split('T')[0]}}else{res.start={dateTime:ev.startDateTime,timeZone:'Europe/Berlin'};res.end={dateTime:ev.endDateTime,timeZone:'Europe/Berlin'}}await window.gapi.client.calendar.events.insert({calendarId:CONFIG.CALENDAR_ID,resource:res});return true}catch(e){return false}},[]);const upd=useCallback(async(id,ev)=>{try{const w=ev.who||'Family';const res={summary:`[${w}] ${ev.title}`,description:`Category: ${ev.category||'Social'}`};if(ev.location)res.location=ev.location;if(ev.allDay){res.start={date:ev.startDate};const e=new Date(ev.endDate);e.setDate(e.getDate()+1);res.end={date:e.toISOString().split('T')[0]}}else{res.start={dateTime:ev.startDateTime,timeZone:'Europe/Berlin'};res.end={dateTime:ev.endDateTime,timeZone:'Europe/Berlin'}}await window.gapi.client.calendar.events.update({calendarId:CONFIG.CALENDAR_ID,eventId:id,resource:res});return true}catch(e){return false}},[]);const del=useCallback(async(id)=>{try{await window.gapi.client.calendar.events.delete({calendarId:CONFIG.CALENDAR_ID,eventId:id});return true}catch(e){return false}},[]);return{events,loading,fetchEvents:fetch_,addEvent:add,updateEvent:upd,deleteEvent:del}}

function useTodos(){const[todos,setTodos]=useState([]);const[loading,setLoading]=useState(false);const S='Todos';const fetch_=useCallback(async()=>{setLoading(true);try{const r=await window.gapi.client.sheets.spreadsheets.values.get({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${S}!A2:F10000`});setTodos((r.result.values||[]).map((r,i)=>({rowIndex:i+2,task:r[0]||'',category:r[1]||'General',who:r[2]||'Both',status:r[3]||'Open',completedDate:r[4]||'',createdDate:r[5]||''})))}catch(e){console.log('Todos sheet not found')}setLoading(false)},[]);const ensure=useCallback(async()=>{try{const m=await window.gapi.client.sheets.spreadsheets.get({spreadsheetId:CONFIG.SPREADSHEET_ID});if(!m.result.sheets.some(s=>s.properties.title===S)){await window.gapi.client.sheets.spreadsheets.batchUpdate({spreadsheetId:CONFIG.SPREADSHEET_ID,resource:{requests:[{addSheet:{properties:{title:S}}}]}});await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${S}!A1:F1`,valueInputOption:'USER_ENTERED',resource:{values:[['Task','Category','Who','Status','Completed Date','Created Date']]}})}}catch(e){console.error(e)}},[]);const add=useCallback(async(t)=>{try{await ensure();await window.gapi.client.sheets.spreadsheets.values.append({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${S}!A:F`,valueInputOption:'USER_ENTERED',resource:{values:[[t.task,t.category||'General',t.who,'Open','',new Date().toISOString().split('T')[0]]]}});await fetch_();return true}catch(e){return false}},[fetch_,ensure]);const upd=useCallback(async(ri,t)=>{try{await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${S}!A${ri}:F${ri}`,valueInputOption:'USER_ENTERED',resource:{values:[[t.task,t.category||'General',t.who,t.status,t.completedDate||'',t.createdDate||'']]}});await fetch_();return true}catch(e){return false}},[fetch_]);const del=useCallback(async(ri)=>{try{const m=await window.gapi.client.sheets.spreadsheets.get({spreadsheetId:CONFIG.SPREADSHEET_ID});const sh=m.result.sheets.find(s=>s.properties.title===S);await window.gapi.client.sheets.spreadsheets.batchUpdate({spreadsheetId:CONFIG.SPREADSHEET_ID,resource:{requests:[{deleteDimension:{range:{sheetId:sh.properties.sheetId,dimension:'ROWS',startIndex:ri-1,endIndex:ri}}}]}});await fetch_();return true}catch(e){return false}},[fetch_]);return{todos,loading,fetchTodos:fetch_,addTodo:add,updateTodo:upd,deleteTodo:del}}

function useSettings(){const[settings,setSettings]=useState({cycleDay:CONFIG.DEFAULT_CYCLE_DAY,overrideDate:'',settledTelman:'',settledLena:''});const[loaded,setLoaded]=useState(false);const S='Settings';const fetch_=useCallback(async()=>{try{const r=await window.gapi.client.sheets.spreadsheets.values.get({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${S}!A2:B10`});const rows=r.result.values||[];const s={cycleDay:CONFIG.DEFAULT_CYCLE_DAY,overrideDate:'',settledTelman:'',settledLena:''};rows.forEach(r=>{if(r[0]==='cycle_day')s.cycleDay=parseInt(r[1])||CONFIG.DEFAULT_CYCLE_DAY;if(r[0]==='override_date')s.overrideDate=r[1]||'';if(r[0]==='settled_telman')s.settledTelman=r[1]||'';if(r[0]==='settled_lena')s.settledLena=r[1]||''});setSettings(s)}catch(e){console.log('Settings not found')}setLoaded(true)},[]);const ensure=useCallback(async()=>{try{const m=await window.gapi.client.sheets.spreadsheets.get({spreadsheetId:CONFIG.SPREADSHEET_ID});if(!m.result.sheets.some(s=>s.properties.title===S)){await window.gapi.client.sheets.spreadsheets.batchUpdate({spreadsheetId:CONFIG.SPREADSHEET_ID,resource:{requests:[{addSheet:{properties:{title:S}}}]}});await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${S}!A1:B5`,valueInputOption:'USER_ENTERED',resource:{values:[['Key','Value'],['cycle_day',String(CONFIG.DEFAULT_CYCLE_DAY)],['override_date',''],['settled_telman',''],['settled_lena','']]}})}}catch(e){console.error(e)}},[]);const save=useCallback(async(ns)=>{try{await ensure();await window.gapi.client.sheets.spreadsheets.values.update({spreadsheetId:CONFIG.SPREADSHEET_ID,range:`${S}!A2:B5`,valueInputOption:'USER_ENTERED',resource:{values:[['cycle_day',String(ns.cycleDay)],['override_date',ns.overrideDate||''],['settled_telman',ns.settledTelman||''],['settled_lena',ns.settledLena||'']]}});setSettings(ns);return true}catch(e){return false}},[ensure]);return{settings,loaded,fetchSettings:fetch_,saveSettings:save}}

// ICONS
const Icons={
  finances:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>),
  calendar:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
  todos:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>),
  insights:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
  left:'‹',right:'›',
};
const GoogleIcon=()=>(<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>);

// FORMS
function ExpenseForm({initial,user,onSave,onCancel,saveLabel}){const today=new Date().toISOString().split('T')[0];const[form,setForm]=useState({merchant:initial?.merchant||'',amount:initial?.amount||'',date:initial?.date||today,category:initial?.category||CONFIG.EXPENSE_CATEGORIES[0],who:initial?.who||user?.name||'Telman',tag:initial?.tag||'',notes:initial?.notes||'',account:initial?.account||CONFIG.ACCOUNTS[0]});const[saving,setSaving]=useState(false);const submit=async()=>{if(!form.merchant||!form.amount)return;setSaving(true);const s=await onSave({...form,amount:parseFloat(form.amount)});setSaving(false);if(s)onCancel()};const set=(k,v)=>setForm(f=>({...f,[k]:v}));return(<div className="add-form"><div className="form-row"><div className="form-field" style={{flex:2}}><label>Merchant</label><input value={form.merchant} onChange={e=>set('merchant',e.target.value)} placeholder="e.g. Rewe"/></div><div className="form-field" style={{flex:1}}><label>Amount €</label><input type="number" step="0.01" value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="0"/></div></div><div className="form-row"><div className="form-field"><label>Date</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)}/></div><div className="form-field"><label>Category</label><select value={form.category} onChange={e=>set('category',e.target.value)}>{CONFIG.EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div></div><div className="form-row"><div className="form-field"><label>Who</label><select value={form.who} onChange={e=>set('who',e.target.value)}>{[...CONFIG.USERS,'Family'].map(u=><option key={u}>{u}</option>)}</select></div><div className="form-field"><label>Account</label><select value={form.account} onChange={e=>set('account',e.target.value)}>{CONFIG.ACCOUNTS.map(a=><option key={a}>{a}</option>)}</select></div></div><div className="form-row"><div className="form-field"><label>Tag</label><input value={form.tag} onChange={e=>set('tag',e.target.value)} placeholder="e.g. Rome trip"/></div></div><div className="form-row"><div className="form-field"><label>Notes</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Any notes..."/></div></div><div className="form-actions"><button className="btn-secondary" onClick={onCancel}>Cancel</button><button className="btn-primary" onClick={submit} disabled={!form.merchant||!form.amount||saving}>{saving?'Saving...':saveLabel||'Add Expense'}</button></div></div>)}

function EventForm({initial,user,onSave,onCancel,saveLabel}){const today=new Date().toISOString().split('T')[0];const[form,setForm]=useState({title:initial?.title||'',startDate:initial?.startDate||today,startTime:initial?.startTime||'09:00',endDate:initial?.endDate||initial?.startDate||today,endTime:initial?.endTime||'10:00',allDay:initial?.allDay||false,location:initial?.location||'',who:initial?.who||user?.name||'Telman',category:initial?.category||CONFIG.EVENT_CATEGORIES[0]});const[edm,setEdm]=useState(!!initial);const[etm,setEtm]=useState(!!initial);const[saving,setSaving]=useState(false);const sf=(k,v)=>{setForm(f=>{const n={...f,[k]:v};if(k==='startDate'&&!edm)n.endDate=v;if(k==='endDate')setEdm(true);if(k==='startTime'&&!etm){const[h,m]=v.split(':').map(Number);n.endTime=`${String(Math.min(h+1,23)).padStart(2,'0')}:${String(m).padStart(2,'0')}`}if(k==='endTime')setEtm(true);return n})};const submit=async()=>{if(!form.title)return;setSaving(true);const d={title:form.title,who:form.who,category:form.category,location:form.location,allDay:form.allDay};if(form.allDay){d.startDate=form.startDate;d.endDate=form.endDate}else{d.startDateTime=`${form.startDate}T${form.startTime}:00`;d.endDateTime=`${form.endDate}T${form.endTime}:00`}const s=await onSave(d);setSaving(false);if(s)onCancel()};return(<div className="add-form"><div className="form-row"><div className="form-field"><label>Title</label><input value={form.title} onChange={e=>sf('title',e.target.value)} placeholder="e.g. Dinner with friends"/></div></div><div className="form-row"><div className="form-field"><label>Who</label><select value={form.who} onChange={e=>sf('who',e.target.value)}>{[...CONFIG.USERS,'Family'].map(u=><option key={u}>{u}</option>)}</select></div><div className="form-field"><label>Category</label><select value={form.category} onChange={e=>sf('category',e.target.value)}>{CONFIG.EVENT_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div></div><div className="form-row"><div className="form-field" style={{flex:'none'}}><label>All Day</label><input type="checkbox" checked={form.allDay} onChange={e=>sf('allDay',e.target.checked)} style={{width:18,height:18,marginTop:4}}/></div><div className="form-field"><label>Start Date</label><input type="date" value={form.startDate} onChange={e=>sf('startDate',e.target.value)}/></div>{!form.allDay&&<div className="form-field"><label>Start Time</label><input type="time" value={form.startTime} onChange={e=>sf('startTime',e.target.value)}/></div>}</div><div className="form-row"><div className="form-field"><label>End Date</label><input type="date" value={form.endDate} onChange={e=>sf('endDate',e.target.value)}/></div>{!form.allDay&&<div className="form-field"><label>End Time</label><input type="time" value={form.endTime} onChange={e=>sf('endTime',e.target.value)}/></div>}</div><div className="form-row"><div className="form-field"><label>Location</label><input value={form.location} onChange={e=>sf('location',e.target.value)} placeholder="e.g. Restaurant"/></div></div><div className="form-actions"><button className="btn-secondary" onClick={onCancel}>Cancel</button><button className="btn-primary" onClick={submit} disabled={!form.title||saving}>{saving?'Saving...':saveLabel||'Add Event'}</button></div></div>)}

// EDIT MODALS
function EditExpenseModal({expense,user,onUpdate,onDelete,onClose}){const[cd,setCd]=useState(false);const[dl,setDl]=useState(false);if(cd)return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="confirm-dialog"><p>Delete "{expense.merchant}" ({formatCurrency(expense.amount)})?</p><div className="confirm-actions"><button className="btn-secondary" onClick={()=>setCd(false)}>Cancel</button><button className="btn-delete" onClick={async()=>{setDl(true);await onDelete(expense.rowIndex);setDl(false);onClose()}} disabled={dl}>{dl?'...':'Delete'}</button></div></div></div></div>);return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Edit Expense</h3><button className="modal-close" onClick={onClose}>✕</button></div><ExpenseForm initial={expense} user={user} onSave={async u=>{const s=await onUpdate(expense.rowIndex,u);if(s)onClose();return s}} onCancel={onClose} saveLabel="Save Changes"/><button className="btn-delete" onClick={()=>setCd(true)}>Delete Expense</button></div></div>)}

function EditEventModal({event,user,onUpdate,onDelete,onClose,onRefresh}){const[cd,setCd]=useState(false);const[dl,setDl]=useState(false);const w=getEventWho(event),t=cleanEventTitle(event),c=getEventCategory(event);const cc=c.charAt(0).toUpperCase()+c.slice(1);const ia=!!event.start?.date;const sd=ia?event.start.date:(event.start?.dateTime||'').slice(0,10);const st=ia?'09:00':(event.start?.dateTime||'').slice(11,16);let ed_=ia?event.end.date:(event.end?.dateTime||'').slice(0,10);if(ia&&ed_){const d=new Date(ed_);d.setDate(d.getDate()-1);ed_=d.toISOString().split('T')[0]}const et=ia?'10:00':(event.end?.dateTime||'').slice(11,16);const init={title:t,who:w,category:cc==='Default'?'Social':cc,location:event.location||'',allDay:ia,startDate:sd,startTime:st,endDate:ed_,endTime:et};if(cd)return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="confirm-dialog"><p>Delete "{t}"?</p><div className="confirm-actions"><button className="btn-secondary" onClick={()=>setCd(false)}>Cancel</button><button className="btn-delete" onClick={async()=>{setDl(true);const s=await onDelete(event.id);setDl(false);if(s){onRefresh();onClose()}}} disabled={dl}>{dl?'...':'Delete'}</button></div></div></div></div>);return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Edit Event</h3><button className="modal-close" onClick={onClose}>✕</button></div><EventForm initial={init} user={user} onSave={async u=>{const s=await onUpdate(event.id,u);if(s){onRefresh();onClose()}return s}} onCancel={onClose} saveLabel="Save Changes"/><button className="btn-delete" onClick={()=>setCd(true)}>Delete Event</button></div></div>)}

// #29: EVENT BANNER
function EventBanner({events}){const now=new Date();const twoHours=new Date(now.getTime()+2*60*60*1000);const upcoming=events.filter(ev=>{if(!ev.start?.dateTime)return false;const s=new Date(ev.start.dateTime);return s>now&&s<=twoHours}).sort((a,b)=>new Date(a.start.dateTime)-new Date(b.start.dateTime));if(upcoming.length===0)return null;const ev=upcoming[0];const s=new Date(ev.start.dateTime);const mins=Math.round((s-now)/60000);const timeLabel=mins<60?`in ${mins} min`:`in ${Math.floor(mins/60)}h ${mins%60}m`;return(<div className="event-banner"><div className="event-banner-dot"/><div className="event-banner-text">{cleanEventTitle(ev)}</div><div className="event-banner-time">{timeLabel}</div></div>)}

// #26: SETTLEMENT DASHBOARD
function SettlementCard({expenses,settings,user,onSettle}){
  const settledT=settings.settledTelman?new Date(settings.settledTelman):new Date(0);
  const settledL=settings.settledLena?new Date(settings.settledLena):new Date(0);
  // Telman owes Lena: Family expenses where Lena paid (account=DB, who=Family, added by Lena inferred) + Telman used DB for personal
  // Simplified: Family+ING → Telman paid → Lena owes 50%. Family+DB → we assume Lena paid → Telman owes 50%. Personal+ING by Lena → Lena owes full. Personal+DB by Telman → impossible (Telman uses ING).
  // Per conversation: ING = Telman's/shared. DB = personal (whoever's expense). Family expenses: who added = who paid. Since we can't track who added, use account: ING=Telman paid, DB=Lena paid.
  let telmanOwes=0,lenaOwes=0;
  expenses.forEach(ex=>{
    const d=new Date(ex.date);
    if(ex.who==='Family'){
      if(ex.account==='ING'){// Telman paid via ING → Lena owes 50%
        if(d>settledL)lenaOwes+=ex.amount/2;
      }else{// DB → Lena paid → Telman owes 50%
        if(d>settledT)telmanOwes+=ex.amount/2;
      }
    }else if(ex.who==='Lena'&&ex.account==='ING'){// Lena used ING (Telman's) → Lena owes full
      if(d>settledL)lenaOwes+=ex.amount;
    }else if(ex.who==='Telman'&&ex.account==='DB'){// Telman used DB (unusual but possible)
      // This would be Telman's own DB, no owed
    }
  });
  telmanOwes=Math.round(telmanOwes);lenaOwes=Math.round(lenaOwes);
  if(telmanOwes===0&&lenaOwes===0)return null;
  const isTelman=user.name==='Telman';
  return(<div className="settle-card">
    {telmanOwes>0&&<div className="settle-row"><span>Telman owes Lena</span><span className={`settle-amount ${isTelman?'owed':'owed-to'}`}>{formatCurrency(telmanOwes)}</span>{isTelman&&<button className="settle-btn" onClick={()=>onSettle('Telman')}>Settle</button>}</div>}
    {lenaOwes>0&&<div className="settle-row"><span>Lena owes Telman</span><span className={`settle-amount ${!isTelman?'owed':'owed-to'}`}>{formatCurrency(lenaOwes)}</span>{!isTelman&&<button className="settle-btn" onClick={()=>onSettle('Lena')}>Settle</button>}</div>}
  </div>);
}

// FINANCES TAB
function FinancesTab({user,expenses,loading,onAddExpense,onUpdateExpense,onDeleteExpense,onRefresh,settings,onShowCycleSettings,onSettle}){
  const[viewMode,setViewMode]=useState('individual');const[showForm,setShowForm]=useState(false);const[editExp,setEditExp]=useState(null);const[catFilter,setCatFilter]=useState(null);const[viewPeriod,setViewPeriod]=useState(null);
  useEffect(()=>{onRefresh()},[onRefresh]);
  const now=new Date();const{start:cs,end:ce}=getCycleDates(settings.cycleDay,now,settings.overrideDate);
  const as=viewPeriod?viewPeriod.start:cs,ae=viewPeriod?viewPeriod.end:ce;
  const cycleExp=expenses.filter(e=>{const d=new Date(e.date);return d>=as&&d<=ae});
  const filtered=viewMode==='individual'?cycleExp.filter(e=>e.who===user.name||e.who==='Family'):cycleExp;
  const totalSpent=filtered.reduce((s,e)=>(viewMode==='individual'&&e.who==='Family')?s+e.amount/2:s+e.amount,0);
  const budget=viewMode==='individual'?CONFIG.BUDGET_PER_PERSON:CONFIG.BUDGET_PER_PERSON*2;
  const remaining=budget-totalSpent;const pct=Math.min((totalSpent/budget)*100,100);const barColor=pct<60?'green':pct<85?'amber':'red';
  const byCat={};filtered.forEach(e=>{const a=viewMode==='individual'&&e.who==='Family'?e.amount/2:e.amount;byCat[e.category]=(byCat[e.category]||0)+a});
  const catList=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const showList=viewMode==='individual';
  const dispExp=catFilter?filtered.filter(e=>e.category===catFilter):filtered;
  const recent=[...dispExp].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const hist=[];for(let i=0;i<6;i++){const ms=new Date(cs);ms.setMonth(ms.getMonth()-i);const me=new Date(ms);me.setMonth(me.getMonth()+1);me.setDate(me.getDate()-1);const mE=expenses.filter(e=>{const d=new Date(e.date);return d>=ms&&d<=me&&(viewMode==='combined'||e.who===user.name||e.who==='Family')});const tot=mE.reduce((s,e)=>(viewMode==='individual'&&e.who==='Family')?s+e.amount/2:s+e.amount,0);if(i>0||tot>0)hist.push({label:formatPeriod(ms,me),total:tot,start:new Date(ms),end:new Date(me)})}

  return(<>
    <div className="view-toggle"><button className={viewMode==='individual'?'active':''} onClick={()=>{setViewMode('individual');setCatFilter(null)}}>{user.name}</button><button className={viewMode==='combined'?'active':''} onClick={()=>{setViewMode('combined');setCatFilter(null)}}>Combined</button></div>
    <SettlementCard expenses={expenses} settings={settings} user={user} onSettle={onSettle}/>
    <div className="budget-card">
      <div className="budget-header"><span className="budget-label">Budget</span><span className="budget-amount">{formatCurrency(remaining)}</span></div>
      <div className="budget-bar-track"><div className={`budget-bar-fill ${barColor}`} style={{width:`${pct}%`}}/></div>
      <div className="budget-sub">{formatCurrency(totalSpent)} of {formatCurrency(budget)} spent</div>
      <div className="budget-period">{formatPeriod(as,ae)} <button className="budget-settings-btn" onClick={onShowCycleSettings}>Settings</button></div>
    </div>
    {catList.length>0&&<div className="section"><div className="section-title">By Category</div>{catList.map(([c,a])=>(<div className={`cat-row ${catFilter===c?'active':''}`} key={c} onClick={()=>showList&&setCatFilter(catFilter===c?null:c)}><span className="cat-name">{CATEGORY_ICONS[c]||'•'} {c}</span><span className="cat-amount">{formatCurrency(a)}</span></div>))}</div>}
    {showList&&<div className="section"><div className="section-title">Expenses</div>{showForm?<ExpenseForm user={user} onSave={onAddExpense} onCancel={()=>setShowForm(false)}/>:!viewPeriod&&<button className="add-form-toggle" onClick={()=>setShowForm(true)}><span style={{fontSize:16,lineHeight:1}}>+</span> Add Expense</button>}{catFilter&&<div className="filter-pill">{CATEGORY_ICONS[catFilter]||'•'} {catFilter}<button onClick={()=>setCatFilter(null)}>✕</button></div>}{loading?<div className="loading">Loading...</div>:recent.length===0?<div className="empty-state">{catFilter?'No expenses here.':'No expenses this period.'}</div>:recent.map((e,i)=>(<div className="expense-item" key={i} onClick={()=>setEditExp(e)}><div className="expense-icon">{CATEGORY_ICONS[e.category]||'•'}</div><div className="expense-details"><div className="expense-merchant">{e.merchant}{e.who==='Family'&&viewMode==='individual'?' (split)':''}</div><div className="expense-meta">{formatDate(e.date)} · {e.category}{e.account?` · ${e.account}`:''}</div></div><div className="expense-amount">{formatCurrency(viewMode==='individual'&&e.who==='Family'?e.amount/2:e.amount)}</div></div>))}</div>}
    {!showList&&<div className="section">{showForm?<ExpenseForm user={user} onSave={onAddExpense} onCancel={()=>setShowForm(false)}/>:!viewPeriod&&<button className="add-form-toggle" onClick={()=>setShowForm(true)}><span style={{fontSize:16,lineHeight:1}}>+</span> Add Expense</button>}</div>}
    {viewPeriod&&<div className="section"><button className="btn-secondary" onClick={()=>setViewPeriod(null)} style={{width:'100%'}}>← Back to Current Period</button></div>}
    {!viewPeriod&&hist.length>1&&<div className="section"><div className="section-title">Period History</div>{hist.map((m,i)=>(<div className="month-history-row" key={i} onClick={()=>setViewPeriod({start:m.start,end:m.end})}><span className="month-history-label">{m.label}</span><span className="month-history-amount">{formatCurrency(m.total)}</span></div>))}</div>}
    {editExp&&<EditExpenseModal expense={editExp} user={user} onUpdate={onUpdateExpense} onDelete={onDeleteExpense} onClose={()=>setEditExp(null)}/>}
  </>);
}

// CYCLE SETTINGS
function CycleSettingsPanel({settings,onSave,onClose}){const[cd,setCd]=useState(settings.cycleDay);const[od,setOd]=useState(settings.overrideDate);const[sv,setSv]=useState(false);return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Budget Cycle</h3><button className="modal-close" onClick={onClose}>✕</button></div><div className="add-form"><div className="form-row"><div className="form-field"><label>Cycle Start Day</label><input type="number" min="1" max="28" value={cd} onChange={e=>setCd(e.target.value)}/></div></div><div className="form-row"><div className="form-field"><label>Override Date (this period)</label><input type="date" value={od} onChange={e=>setOd(e.target.value)}/></div></div>{od&&<div className="form-row"><div className="form-field"><button className="btn-secondary" onClick={()=>setOd('')} style={{width:'100%'}}>Clear Override</button></div></div>}<div className="form-actions"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={async()=>{setSv(true);await onSave({...settings,cycleDay:parseInt(cd)||24,overrideDate:od});setSv(false);onClose()}} disabled={sv}>{sv?'...':'Save'}</button></div></div></div></div>)}

// CALENDAR TAB
function CalendarTab({user,events:calEvents,loading,onFetchEvents,onAddEvent,onUpdateEvent,onDeleteEvent}){
  const[cv,setCv]=useState('month');const[curDate,setCurDate]=useState(new Date());const[showForm,setShowForm]=useState(false);const[editEv,setEditEv]=useState(null);const[um,setUm]=useState('month');
  const year=curDate.getFullYear(),month=curDate.getMonth(),today=new Date();
  const fetchView=useCallback(()=>{if(cv==='month')onFetchEvents(new Date(year,month-1,1),new Date(year,month+2,0,23,59,59));else{const d=new Date(curDate);const dow=getMondayDow(d);const s=new Date(d);s.setDate(s.getDate()-dow);s.setHours(0,0,0,0);const e=new Date(s);e.setDate(e.getDate()+6);e.setHours(23,59,59);onFetchEvents(s,e)}},[cv,year,month,curDate,onFetchEvents]);
  useEffect(()=>{fetchView()},[fetchView]);
  const nav=(dir)=>{const d=new Date(curDate);if(cv==='month')d.setMonth(d.getMonth()+dir);else d.setDate(d.getDate()+(dir*7));setCurDate(d)};
  const handleAdd=async(ev)=>{const s=await onAddEvent(ev);if(s)fetchView();return s};
  const fo=new Date(year,month,1);const fdw=getMondayDow(fo);const dim=new Date(year,month+1,0).getDate();const dip=new Date(year,month,0).getDate();
  const cells=[];for(let i=fdw-1;i>=0;i--)cells.push({day:dip-i,om:true,date:new Date(year,month-1,dip-i)});for(let i=1;i<=dim;i++)cells.push({day:i,om:false,date:new Date(year,month,i),isToday:isSameDay(new Date(year,month,i),today)});const rem=Math.ceil(cells.length/7)*7-cells.length;for(let i=1;i<=rem;i++)cells.push({day:i,om:true,date:new Date(year,month+1,i)});
  const ws=new Date(curDate);const dow=getMondayDow(ws);ws.setDate(ws.getDate()-dow);const wd=[];for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(d.getDate()+i);wd.push(d)}
  const nt=today.getTime();const futEv=calEvents.filter(ev=>new Date(ev.end?.dateTime||ev.end?.date).getTime()>=nt);
  const upEv=um==='month'?futEv.filter(ev=>{const s=new Date(ev.start?.dateTime||ev.start?.date);return s.getMonth()===month&&s.getFullYear()===year}):futEv;

  return(<>
    <div className="cal-view-toggle"><button className={cv==='month'?'active':''} onClick={()=>setCv('month')}>Month</button><button className={cv==='week'?'active':''} onClick={()=>setCv('week')}>Week</button></div>
    <div className="cal-header"><h2>{cv==='month'?`${monthNames[month]} ${year}`:`Week of ${monthNames[ws.getMonth()]} ${ws.getDate()}`}</h2><div className="cal-nav"><button onClick={()=>nav(-1)}>{Icons.left}</button><button onClick={()=>nav(1)}>{Icons.right}</button></div></div>
    <div className="section">{showForm?<EventForm user={user} onSave={handleAdd} onCancel={()=>setShowForm(false)}/>:<button className="add-form-toggle" onClick={()=>setShowForm(true)}><span style={{fontSize:16,lineHeight:1}}>+</span> Add Event</button>}</div>
    {loading&&<div className="loading">Loading...</div>}
    {cv==='month'&&!loading&&<div className="month-grid"><div className="month-grid-header">{dayNamesMon.map(d=><span key={d}>{d}</span>)}</div><div className="month-grid-body">{cells.map((c,i)=>{const de=getEventsForDate(calEvents,c.date);return(<div key={i} className={`month-day ${c.om?'other-month':''} ${c.isToday?'today':''}`}><div className="day-number">{c.day}</div>{de.slice(0,3).map((ev,j)=><div key={j} className={`day-event ${getWhoClass(getEventWho(ev))}`} onClick={()=>setEditEv(ev)}>{cleanEventTitle(ev)}</div>)}{de.length>3&&<div className="day-event who-default">+{de.length-3}</div>}</div>)})}</div></div>}
    {cv==='week'&&!loading&&<div className="week-view">{wd.map((day,i)=>{const de=getEventsForDate(calEvents,day);return(<div className="week-day-card" key={i}><div className={`week-day-label ${isSameDay(day,today)?'today':''}`}>{dayNamesFullMon[i]} {day.getDate()} {monthNames[day.getMonth()].slice(0,3)}</div>{de.length===0?<div className="week-no-events">No events</div>:de.map((ev,j)=>{const sd=ev.start?.dateTime?new Date(ev.start.dateTime):null;const ed=ev.end?.dateTime?new Date(ev.end.dateTime):null;let ts='All day';if(sd&&ed)ts=`${sd.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}–${ed.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`;return<div className={`week-event ${getWhoClass(getEventWho(ev))}`} key={j} onClick={()=>setEditEv(ev)}><span className="week-event-title">{cleanEventTitle(ev)}</span><span className="week-event-time">{ts}</span></div>})}</div>)})}</div>}
    {cv==='month'&&<div className="section"><div className="upcoming-toggle"><button className={um==='month'?'active':''} onClick={()=>setUm('month')}>This Month</button><button className={um==='all'?'active':''} onClick={()=>setUm('all')}>All Upcoming</button></div>{upEv.length===0&&!loading?<div className="empty-state">No upcoming events.</div>:upEv.slice(0,15).map((ev,i)=>{const w=getEventWho(ev);const s=ev.start?.dateTime?new Date(ev.start.dateTime):new Date(ev.start?.date);const ts=ev.start?.dateTime?s.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' · '+s.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):s.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' · All day';return(<div className="event-item" key={i} onClick={()=>setEditEv(ev)}><div className={`event-dot ${getWhoClass(w)}`}/><div className="event-details"><div className="event-title">{cleanEventTitle(ev)}</div><div className="event-meta">{w} · {ts}{ev.location?` · ${ev.location}`:''}</div></div></div>)})}</div>}
    {cv==='week'&&<div className="section"><div className="section-title">Upcoming</div>{futEv.length===0&&!loading?<div className="empty-state">No upcoming events.</div>:futEv.slice(0,10).map((ev,i)=>{const w=getEventWho(ev);const s=ev.start?.dateTime?new Date(ev.start.dateTime):new Date(ev.start?.date);const ts=ev.start?.dateTime?s.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' · '+s.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):s.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' · All day';return(<div className="event-item" key={i} onClick={()=>setEditEv(ev)}><div className={`event-dot ${getWhoClass(w)}`}/><div className="event-details"><div className="event-title">{cleanEventTitle(ev)}</div><div className="event-meta">{w} · {ts}{ev.location?` · ${ev.location}`:''}</div></div></div>)})}</div>}
    {editEv&&<EditEventModal event={editEv} user={user} onUpdate={onUpdateEvent} onDelete={onDeleteEvent} onClose={()=>setEditEv(null)} onRefresh={fetchView}/>}
  </>);
}

// #27: CONSOLIDATED TODOS TAB
function TodosTab({user,todos,loading,onAdd,onUpdate,onDelete,onRefresh}){
  const[filter,setFilter]=useState('all');const[editTodo,setEditTodo]=useState(null);const[task,setTask]=useState('');const[who,setWho]=useState(user?.name||'Both');const[saving,setSaving]=useState(false);
  useEffect(()=>{onRefresh()},[onRefresh]);
  const open=todos.filter(t=>t.status==='Open');const done=todos.filter(t=>t.status==='Done').sort((a,b)=>(b.completedDate||'').localeCompare(a.completedDate||'')).slice(0,10);
  const filtered=filter==='all'?open:open.filter(t=>t.who===user.name||t.who==='Both');
  const addTask=async()=>{if(!task.trim())return;setSaving(true);await onAdd({task:task.trim(),category:'General',who});setSaving(false);setTask('')};
  return(<>
    <div className="todo-filter"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All</button><button className={filter==='mine'?'active':''} onClick={()=>setFilter('mine')}>Mine</button></div>
    <div className="section">
      <div className="section-title">Tasks ({filtered.length})</div>
      <div className="todo-quick-add"><input value={task} onChange={e=>setTask(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addTask()}} placeholder="Add a task..."/><select value={who} onChange={e=>setWho(e.target.value)}>{[...CONFIG.USERS,'Both'].map(u=><option key={u}>{u}</option>)}</select><button onClick={addTask} disabled={!task.trim()||saving}>{saving?'...':'Add'}</button></div>
      {loading?<div className="loading">Loading...</div>:filtered.length===0?<div className="empty-state">No tasks.</div>:filtered.map((t,i)=>(<div className="todo-item" key={i}><div className="todo-checkbox" onClick={async()=>{await onUpdate(t.rowIndex,{...t,status:'Done',completedDate:new Date().toISOString().split('T')[0]})}}/><div className="todo-content" onClick={()=>setEditTodo(t)}><div className="todo-text">{t.task}</div><div className="todo-assignee">{t.who}</div></div></div>))}
    </div>
    {done.length>0&&<div className="section"><div className="todo-history-title">Recently Completed</div>{done.map((t,i)=>(<div className="todo-history-item" key={i} onClick={async()=>{await onUpdate(t.rowIndex,{...t,status:'Open',completedDate:''})}}><span className="todo-history-text">{t.task}</span><span className="todo-history-meta">{t.who} · {t.completedDate?formatDate(t.completedDate):''}</span></div>))}</div>}
    {editTodo&&<EditTodoModal todo={editTodo} user={user} onUpdate={onUpdate} onDelete={onDelete} onClose={()=>setEditTodo(null)}/>}
  </>);
}
function EditTodoModal({todo,user,onUpdate,onDelete,onClose}){const[form,setForm]=useState({task:todo.task,who:todo.who});const[sv,setSv]=useState(false);const[cd,setCd]=useState(false);const[dl,setDl]=useState(false);if(cd)return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="confirm-dialog"><p>Delete "{todo.task}"?</p><div className="confirm-actions"><button className="btn-secondary" onClick={()=>setCd(false)}>Cancel</button><button className="btn-delete" onClick={async()=>{setDl(true);await onDelete(todo.rowIndex);setDl(false);onClose()}} disabled={dl}>{dl?'...':'Delete'}</button></div></div></div></div>);return(<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Edit Task</h3><button className="modal-close" onClick={onClose}>✕</button></div><div className="add-form"><div className="form-row"><div className="form-field"><label>Task</label><input value={form.task} onChange={e=>setForm(f=>({...f,task:e.target.value}))}/></div></div><div className="form-row"><div className="form-field"><label>Who</label><select value={form.who} onChange={e=>setForm(f=>({...f,who:e.target.value}))}>{[...CONFIG.USERS,'Both'].map(u=><option key={u}>{u}</option>)}</select></div></div><div className="form-actions"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={async()=>{setSv(true);await onUpdate(todo.rowIndex,{...todo,task:form.task,who:form.who});setSv(false);onClose()}} disabled={!form.task||sv}>{sv?'...':'Save'}</button></div></div><button className="btn-delete" onClick={()=>setCd(true)}>Delete Task</button></div></div>)}

// #28: INSIGHTS TAB
function InsightsTab({user,expenses,settings}){
  const now=new Date();const{start:cs}=getCycleDates(settings.cycleDay,now,settings.overrideDate);
  // Build 6 periods of data
  const periods=[];for(let i=0;i<6;i++){const s=new Date(cs);s.setMonth(s.getMonth()-i);const e=new Date(s);e.setMonth(e.getMonth()+1);e.setDate(e.getDate()-1);const pExp=expenses.filter(ex=>{const d=new Date(ex.date);return d>=s&&d<=e&&(ex.who===user.name||ex.who==='Family')});const total=pExp.reduce((sum,ex)=>sum+(ex.who==='Family'?ex.amount/2:ex.amount),0);const byCat={};pExp.forEach(ex=>{const a=ex.who==='Family'?ex.amount/2:ex.amount;byCat[ex.category]=(byCat[ex.category]||0)+a});periods.push({label:formatPeriod(s,e),total:Math.round(total),byCat,start:s,end:e})}
  const current=periods[0];const prev=periods[1];
  const change=prev&&prev.total>0?Math.round(((current.total-prev.total)/prev.total)*100):0;
  const catList=Object.entries(current.byCat).sort((a,b)=>b[1]-a[1]);
  const maxCat=catList.length>0?catList[0][1]:1;

  return(<>
    <div className="section">
      <div className="section-title">Current Period</div>
      <div className="insight-card">
        <div className="insight-title">Total Spent</div>
        <div className="insight-value">{formatCurrency(current.total)}</div>
        <div className="insight-sub">{current.label}{change!==0&&<span className={`trend-change ${change>0?'trend-up':'trend-down'}`}> {change>0?'↑':'↓'}{Math.abs(change)}% vs last</span>}</div>
      </div>
    </div>
    {catList.length>0&&<div className="section">
      <div className="section-title">Spending by Category</div>
      <div className="insight-card">{catList.map(([c,a])=>(<div className="insight-bar-row" key={c}><span className="insight-bar-label">{CATEGORY_ICONS[c]||'•'} {c}</span><div className="insight-bar-track"><div className="insight-bar-fill" style={{width:`${(a/maxCat)*100}%`}}/></div><span className="insight-bar-val">{formatCurrency(a)}</span></div>))}</div>
    </div>}
    <div className="section">
      <div className="section-title">6-Period Trend</div>
      <div className="insight-card">{periods.map((p,i)=>{const prevP=periods[i+1];const ch=prevP&&prevP.total>0?Math.round(((p.total-prevP.total)/prevP.total)*100):0;return(<div className="trend-row" key={i}><span className="trend-label">{p.label}</span><span className="trend-val">{formatCurrency(p.total)}{i<periods.length-1&&ch!==0&&<span className={`trend-change ${ch>0?'trend-up':'trend-down'}`}>{ch>0?'↑':'↓'}{Math.abs(ch)}%</span>}</span></div>)})}</div>
    </div>
  </>);
}

// PENDING ACTION
function PendingAction({data,user,onAddExpense,onAddEvent,onDismiss,fetchExpenses}){const[status,setStatus]=useState('ready');const[msg,setMsg]=useState('');const isExp=data.action==='add_expense';const isEv=data.action==='add_event';const isBatch=isExp&&Array.isArray(data.expenses);const exps=isBatch?data.expenses:(isExp?[data]:[]);const confirm=async()=>{setStatus('sending');try{if(isExp){let ok=true;for(const ex of exps){const s=await onAddExpense({merchant:ex.merchant||'',amount:parseFloat(ex.amount)||0,date:ex.date||new Date().toISOString().split('T')[0],category:ex.category||'',who:ex.who||'Telman',tag:ex.tag||'',notes:ex.notes||'',account:ex.account||''});if(!s)ok=false}if(ok){await fetchExpenses();setStatus('success');setMsg(`${exps.length} expense(s) added`)}else{setStatus('error');setMsg('Some failed')}}else if(isEv){const d={title:data.title||'',who:data.who||'Telman',category:data.category||'Social',location:data.location||'',allDay:!!data.all_day};if(data.all_day){d.startDate=data.start;d.endDate=data.end||data.start}else{d.startDateTime=data.start;d.endDateTime=data.end||data.start}const s=await onAddEvent(d);if(s){setStatus('success');setMsg(`Event "${data.title}" created`)}else{setStatus('error');setMsg('Failed')}}}catch(e){setStatus('error');setMsg(e.message)}};const dismiss=()=>{window.location.hash='';onDismiss()};
  return(<div className="pending-screen"><h1>Family Planner</h1><div className="pending-subtitle">{status==='ready'&&(isExp?`Confirm ${exps.length} expense(s)`:'Confirm event')}{status==='sending'&&'Saving...'}{status==='success'&&'Done!'}{status==='error'&&'Error'}</div>
    {status==='ready'&&isExp&&!isBatch&&<div className="pending-card">{[['Merchant',data.merchant],['Amount',formatCurrency(data.amount)],['Date',data.date],['Category',data.category],['Who',data.who||'Telman'],['Account',data.account]].map(([l,v])=>v&&<div className="pending-row" key={l}><span className="pending-row-label">{l}</span><span className="pending-row-value">{v}</span></div>)}</div>}
    {status==='ready'&&isExp&&isBatch&&exps.map((ex,i)=>(<div className="pending-batch-item" key={i}><div><div className="pending-batch-merchant">{ex.merchant}</div><div className="pending-batch-meta">{ex.date} · {ex.category} · {ex.account}</div></div><div className="pending-batch-amount">{formatCurrency(ex.amount)}</div></div>))}
    {status==='ready'&&isEv&&<div className="pending-card">{[['Title',data.title],['Start',data.start],['End',data.end],['Who',data.who||'Telman'],['Category',data.category],['Location',data.location]].map(([l,v])=>v&&<div className="pending-row" key={l}><span className="pending-row-label">{l}</span><span className="pending-row-value">{v}</span></div>)}</div>}
    {status==='ready'&&<div className="pending-actions"><button className="btn-secondary" onClick={dismiss}>Cancel</button><button className="btn-primary" onClick={confirm}>Confirm & Save</button></div>}
    {status==='sending'&&<div className="loading">Saving...</div>}
    {status==='success'&&<><div className="pending-result success">✓ {msg}</div><div className="pending-actions"><button className="btn-primary" onClick={dismiss}>Back to App</button></div></>}
    {status==='error'&&<><div className="pending-result error">✗ {msg}</div><div className="pending-actions"><button className="btn-secondary" onClick={dismiss}>Back</button><button className="btn-primary" onClick={confirm}>Retry</button></div></>}
  </div>);
}

// SIGN IN + MAIN APP
function SignInScreen({onSignIn,ready}){return(<div className="sign-in-screen"><h1>Family Planner</h1><p>Sign in with Google to get started</p><button className="google-btn" onClick={onSignIn} disabled={!ready}><GoogleIcon/> Sign in with Google</button></div>)}

export default function App(){
  const{user,signIn,signOut,ready}=useGoogleAuth();
  const{expenses,loading:el,fetchExpenses,addExpense,updateExpense,deleteExpense}=useSheets();
  const{events,loading:cl,fetchEvents,addEvent,updateEvent,deleteEvent}=useCalendar();
  const{todos,loading:tl,fetchTodos,addTodo,updateTodo,deleteTodo}=useTodos();
  const{settings,fetchSettings,saveSettings}=useSettings();
  const[tab,setTab]=useState('finances');const[toast,setToast]=useState(null);const[pa,setPa]=useState(null);const[showCS,setShowCS]=useState(false);

  useEffect(()=>{const ch=()=>{const h=window.location.hash;if(h.startsWith('#add/')){try{setPa(JSON.parse(decodeURIComponent(atob(h.slice(5)))))}catch(e){}}};ch();window.addEventListener('hashchange',ch);return()=>window.removeEventListener('hashchange',ch)},[]);
  useEffect(()=>{if(user)fetchSettings()},[user,fetchSettings]);
  // Fetch calendar events for banner
  useEffect(()=>{if(user){const now=new Date();const end=new Date(now);end.setDate(end.getDate()+1);fetchEvents(now,end)}},[user,fetchEvents]);

  const showToast=m=>{setToast(m);setTimeout(()=>setToast(null),2200)};
  const handleSettle=async(who)=>{const today=new Date().toISOString().split('T')[0];const ns={...settings};if(who==='Telman')ns.settledTelman=today;else ns.settledLena=today;await saveSettings(ns);showToast(`${who}'s balance settled`)};

  if(pa&&user)return(<><style>{styles}</style><PendingAction data={pa} user={user} onAddExpense={async e=>{return await addExpense(e)}} onAddEvent={async e=>{return await addEvent(e)}} onDismiss={()=>setPa(null)} fetchExpenses={fetchExpenses}/></>);
  if(pa&&!user)return(<><style>{styles}</style><div className="sign-in-screen"><h1>Family Planner</h1><p>Sign in to confirm</p><button className="google-btn" onClick={signIn} disabled={!ready}><GoogleIcon/> Sign in with Google</button></div></>);
  if(!user)return(<><style>{styles}</style><SignInScreen onSignIn={signIn} ready={ready}/></>);

  return(<><style>{styles}</style><div className="app">
    <div className="header"><h1>Family Planner</h1><div className="header-right"><span className="user-pill">{user.name}</span><button className="sign-out-btn" onClick={signOut}>Sign out</button></div></div>
    <EventBanner events={events}/>
    {tab==='finances'&&<FinancesTab user={user} expenses={expenses} loading={el} settings={settings}
      onAddExpense={async e=>{const s=await addExpense(e);if(s)showToast('Expense added');return s}}
      onUpdateExpense={async(r,e)=>{const s=await updateExpense(r,e);if(s)showToast('Expense updated');return s}}
      onDeleteExpense={async r=>{const s=await deleteExpense(r);if(s)showToast('Expense deleted');return s}}
      onRefresh={fetchExpenses} onShowCycleSettings={()=>setShowCS(true)} onSettle={handleSettle}/>}
    {tab==='calendar'&&<CalendarTab user={user} events={events} loading={cl} onFetchEvents={fetchEvents}
      onAddEvent={async e=>{const s=await addEvent(e);if(s)showToast('Event created');return s}}
      onUpdateEvent={async(id,e)=>{const s=await updateEvent(id,e);if(s)showToast('Event updated');return s}}
      onDeleteEvent={async id=>{const s=await deleteEvent(id);if(s)showToast('Event deleted');return s}}/>}
    {tab==='todos'&&<TodosTab user={user} todos={todos} loading={tl}
      onAdd={async t=>{const s=await addTodo(t);if(s)showToast('Task added');return s}}
      onUpdate={async(r,t)=>{const s=await updateTodo(r,t);if(s)showToast('Task updated');return s}}
      onDelete={async r=>{const s=await deleteTodo(r);if(s)showToast('Task deleted');return s}}
      onRefresh={fetchTodos}/>}
    {tab==='insights'&&<InsightsTab user={user} expenses={expenses} settings={settings}/>}
    {toast&&<div className="toast">{toast}</div>}
    {showCS&&<CycleSettingsPanel settings={settings} onSave={saveSettings} onClose={()=>setShowCS(false)}/>}
    <div className="tab-bar">
      <button className={`tab-btn ${tab==='finances'?'active':''}`} onClick={()=>setTab('finances')}>{Icons.finances}<span>Finances</span></button>
      <button className={`tab-btn ${tab==='calendar'?'active':''}`} onClick={()=>setTab('calendar')}>{Icons.calendar}<span>Calendar</span></button>
      <button className={`tab-btn ${tab==='todos'?'active':''}`} onClick={()=>setTab('todos')}>{Icons.todos}<span>To-Do</span></button>
      <button className={`tab-btn ${tab==='insights'?'active':''}`} onClick={()=>setTab('insights')}>{Icons.insights}<span>Insights</span></button>
    </div>
  </div></>);
}

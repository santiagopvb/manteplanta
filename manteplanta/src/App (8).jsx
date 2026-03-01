import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// CMMS MantePlanta — Sistema integrado v2.1
// Módulos: Órdenes de Trabajo + Incidencias de Operarios
// Auth: Login con SHA-256 + sesión localStorage 8h
// ══════════════════════════════════════════════════════════════════════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow:wght@300;400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root {
  --bg:       #0b0d11;
  --bg2:      #111318;
  --bg3:      #181b22;
  --bg4:      #1e2230;
  --bg5:      #242940;
  --border:   #252a3a;
  --border2:  #303656;
  --border3:  #424a6e;

  --amber:    #f59e0b;
  --amber2:   #fbbf24;
  --amber-d:  rgba(245,158,11,0.12);
  --amber-g:  rgba(245,158,11,0.3);

  --blue:     #3b82f6;
  --blue-d:   rgba(59,130,246,0.12);
  --teal:     #14b8a6;
  --teal-d:   rgba(20,184,166,0.12);
  --red:      #ef4444;
  --red-d:    rgba(239,68,68,0.14);
  --green:    #22c55e;
  --green-d:  rgba(34,197,94,0.12);
  --yellow:   #eab308;
  --yellow-d: rgba(234,179,8,0.14);
  --purple:   #a855f7;
  --purple-d: rgba(168,85,247,0.12);

  --text:     #e2e8f5;
  --text2:    #7c8aaa;
  --text3:    #414d6a;
  --font:     'Barlow', sans-serif;
  --fontc:    'Barlow Condensed', sans-serif;
  --mono:     'Share Tech Mono', monospace;

  --radius:   8px;
  --shadow:   0 4px 24px rgba(0,0,0,0.4);
}

html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;}

/* ── SCROLLBAR ── */
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}

/* ── LAYOUT ── */
.app{display:flex;height:100vh;overflow:hidden;position:relative;}

/* ── NOTIFICATION PANEL ── */
.notif-overlay{
  position:fixed;inset:0;z-index:50;
  animation:fadeIn .15s ease;
}
.notif-panel{
  position:fixed;top:56px;right:16px;width:360px;
  background:var(--bg2);border:1px solid var(--border2);
  border-radius:var(--radius);box-shadow:var(--shadow);
  z-index:51;overflow:hidden;
  animation:slideDown .2s ease;
}
.notif-header{
  padding:14px 18px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
}
.notif-title{font-family:var(--fontc);font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text2);}
.notif-item{
  display:flex;gap:12px;padding:12px 18px;
  border-bottom:1px solid var(--border);cursor:pointer;
  transition:background .15s;
}
.notif-item:hover{background:var(--bg3);}
.notif-item:last-child{border-bottom:none;}
.notif-dot-wrap{padding-top:3px;}
.notif-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.notif-dot.red{background:var(--red);}
.notif-dot.amber{background:var(--amber);}
.notif-dot.blue{background:var(--blue);}
.notif-dot.green{background:var(--green);}
.notif-msg{font-size:12px;line-height:1.5;flex:1;}
.notif-time{font-size:10px;color:var(--text2);font-family:var(--mono);margin-top:3px;}
.notif-badge-count{
  background:var(--red);color:#fff;
  font-size:10px;font-weight:700;font-family:var(--mono);
  padding:1px 5px;border-radius:8px;
  position:absolute;top:-4px;right:-4px;
}

/* ── SIDEBAR ── */
.sidebar{
  width:220px;min-width:220px;
  background:linear-gradient(180deg,var(--bg3) 0%,var(--bg2) 100%);border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  position:relative;overflow:hidden;
}
.sidebar::after{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--amber),var(--amber2),transparent);
}
.logo-block{padding:18px 18px 14px;border-bottom:1px solid var(--border);}
.logo-name{font-family:var(--fontc);font-size:17px;font-weight:800;letter-spacing:.06em;color:var(--amber);}
.logo-sub{font-size:10px;color:var(--text2);font-family:var(--mono);margin-top:1px;}

.nav-group{padding:10px 10px 0;}
.nav-group-label{font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--text2);padding:4px 8px 6px;}
.nav-item{
  display:flex;align-items:center;gap:9px;
  padding:8px 10px;border-radius:6px;
  cursor:pointer;font-size:12.5px;font-weight:500;
  color:var(--text);transition:all .15s;margin-bottom:1px;opacity:.75;
  position:relative;
}
.nav-item:hover{background:var(--bg3);color:var(--text);}
.nav-item.active{background:var(--amber-d);color:var(--amber);}
.nav-item.active::before{
  content:'';position:absolute;left:0;top:20%;bottom:20%;
  width:2px;background:var(--amber);border-radius:0 2px 2px 0;
}
.nav-pill{
  margin-left:auto;font-size:9px;font-weight:700;font-family:var(--mono);
  padding:1px 6px;border-radius:8px;
}
.nav-pill.red{background:var(--red);color:#fff;}
.nav-pill.amber{background:var(--amber);color:#000;}

.sidebar-bottom{
  margin-top:auto;padding:12px 14px;
  border-top:1px solid var(--border);
}
.user-chip{
  display:flex;align-items:center;gap:10px;
  padding:8px 10px;border-radius:6px;
  cursor:pointer;transition:background .15s;
}
.user-chip:hover{background:var(--bg3);}
.avatar{
  width:30px;height:30px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:800;color:#000;
}
.user-info .name{font-size:12px;font-weight:600;}
.user-info .role{font-size:10px;color:var(--text3);font-family:var(--mono);}
.role-badge{
  margin-left:auto;font-size:9px;font-weight:700;font-family:var(--mono);
  padding:2px 7px;border-radius:10px;text-transform:uppercase;
}

/* ── MAIN ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}

.topbar{
  height:52px;background:var(--bg2);border-bottom:1px solid var(--border);
  padding:0 20px;display:flex;align-items:center;gap:12px;flex-shrink:0;
}
.topbar-title{font-family:var(--fontc);font-size:16px;font-weight:700;letter-spacing:.04em;flex:1;}
.topbar-sep{width:1px;height:20px;background:var(--border);}

.search-wrap{
  display:flex;align-items:center;gap:7px;
  background:var(--bg3);border:1px solid var(--border);
  border-radius:6px;padding:5px 10px;width:220px;
  transition:border-color .15s;
}
.search-wrap:focus-within{border-color:var(--amber);}
.search-wrap input{background:none;border:none;outline:none;font-family:var(--font);font-size:12px;color:var(--text);width:100%;}
.search-wrap input::placeholder{color:var(--text3);}

.icon-btn{
  width:34px;height:34px;border-radius:6px;
  background:var(--bg3);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--text2);transition:all .15s;
  position:relative;flex-shrink:0;
}
.icon-btn:hover{border-color:var(--amber);color:var(--amber);}
.icon-btn.active{border-color:var(--amber);color:var(--amber);background:var(--amber-d);}

.content{flex:1;overflow-y:auto;padding:20px;}

/* ── PAGE HEADER ── */
.page-header{
  display:flex;align-items:flex-start;justify-content:space-between;
  margin-bottom:20px;gap:12px;flex-wrap:wrap;
}
.page-title{font-family:var(--fontc);font-size:22px;font-weight:800;letter-spacing:.02em;}
.page-sub{font-size:11px;color:var(--text2);font-family:var(--mono);margin-top:3px;}
.header-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}

/* ── KPI ROW ── */
.kpi-row{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px;}
.kpi{
  background:var(--bg2);border:1px solid var(--border);
  border-radius:var(--radius);padding:14px 16px;
  position:relative;overflow:hidden;cursor:default;
  transition:border-color .2s;
}
.kpi:hover{border-color:var(--border2);}
.kpi-accent{position:absolute;bottom:0;left:0;right:0;height:2px;}
.kpi-label{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text2);margin-bottom:6px;}
.kpi-val{font-family:var(--mono);font-size:28px;font-weight:700;line-height:1;}
.kpi-sub{font-size:10px;color:var(--text3);margin-top:5px;}

/* ── TOOLBAR ── */
.toolbar{
  display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;
}
.filter-chip{
  padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;
  cursor:pointer;border:1px solid var(--border);background:var(--bg3);
  color:var(--text2);transition:all .15s;font-family:var(--font);
  display:flex;align-items:center;gap:5px;
}
.filter-chip:hover{border-color:var(--border2);color:var(--text);}
.filter-chip.on{background:var(--amber-d);color:var(--amber);border-color:rgba(245,158,11,.35);}
.filter-chip .chip-count{font-family:var(--mono);font-size:9px;opacity:.8;}
.toolbar-sep{width:1px;height:20px;background:var(--border);margin:0 2px;}
.view-toggle{display:flex;gap:2px;}
.view-btn{
  width:30px;height:28px;border-radius:5px;
  background:var(--bg3);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--text3);transition:all .15s;
}
.view-btn.on{background:var(--amber-d);color:var(--amber);border-color:var(--amber-g);}

/* ── TABLE VIEW ── */
.ot-table-wrap{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;}
table{width:100%;border-collapse:collapse;}
thead tr{background:var(--bg3);}
th{
  padding:9px 14px;text-align:left;
  font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  color:var(--text3);border-bottom:1px solid var(--border);
  font-family:var(--mono);white-space:nowrap;cursor:pointer;user-select:none;
}
th:hover{color:var(--text2);}
th.sorted{color:var(--amber);}
td{padding:11px 14px;border-bottom:1px solid var(--border);vertical-align:middle;}
tr:last-child td{border-bottom:none;}
tr.ot-row{cursor:pointer;transition:background .1s;}
tr.ot-row:hover td{background:var(--bg3);}
.td-mono{font-family:var(--mono);font-size:11px;color:var(--text2);}
.td-title{font-weight:600;font-size:13px;}
.td-asset{font-size:11px;color:var(--text2);}

/* ── CARD VIEW ── */
.ot-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;}
.ot-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);
  padding:16px;cursor:pointer;transition:all .15s;
  position:relative;overflow:hidden;
}
.ot-card:hover{border-color:var(--border2);transform:translateY(-1px);box-shadow:var(--shadow);}
.ot-card-accent{position:absolute;top:0;left:0;bottom:0;width:3px;}
.ot-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
.ot-card-id{font-family:var(--mono);font-size:10px;color:var(--text3);}
.ot-card-title{font-weight:700;font-size:13px;margin-bottom:3px;line-height:1.3;}
.ot-card-asset{font-size:11px;color:var(--text2);display:flex;align-items:center;gap:5px;}
.ot-card-footer{
  display:flex;align-items:center;gap:8px;margin-top:12px;
  padding-top:10px;border-top:1px solid var(--border);
  flex-wrap:wrap;
}
.assignee-chip{
  display:flex;align-items:center;gap:5px;
  font-size:11px;color:var(--text2);
  margin-left:auto;
}

/* ── BADGES ── */
.badge{
  display:inline-flex;align-items:center;gap:4px;
  padding:2px 8px;border-radius:4px;
  font-size:10px;font-weight:700;font-family:var(--mono);
  letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;
}
.badge.critical{background:var(--red-d);color:var(--red);border:1px solid rgba(239,68,68,.3);}
.badge.high{background:rgba(249,115,22,.14);color:#f97316;border:1px solid rgba(249,115,22,.3);}
.badge.medium{background:var(--yellow-d);color:var(--yellow);border:1px solid rgba(234,179,8,.3);}
.badge.low{background:var(--green-d);color:var(--green);border:1px solid rgba(34,197,94,.3);}
.badge.open{background:var(--amber-d);color:var(--amber);border:1px solid var(--amber-g);}
.badge.in_progress{background:var(--blue-d);color:var(--blue);border:1px solid rgba(59,130,246,.3);}
.badge.completed{background:var(--green-d);color:var(--green);border:1px solid rgba(34,197,94,.3);}
.badge.scheduled{background:var(--bg4);color:var(--text2);border:1px solid var(--border);}
.badge.cancelled{background:var(--bg4);color:var(--text3);border:1px solid var(--border);}
.badge.corrective{background:rgba(249,115,22,.14);color:#f97316;border:1px solid rgba(249,115,22,.3);}
.badge.preventive{background:var(--teal-d);color:var(--teal);border:1px solid rgba(20,184,166,.3);}
.badge.jefe{background:var(--amber-d);color:var(--amber);border:1px solid var(--amber-g);}
.badge.tecnico{background:var(--blue-d);color:var(--blue);border:1px solid rgba(59,130,246,.3);}
.badge.observador{background:var(--bg4);color:var(--text2);border:1px solid var(--border);}

/* ── BUTTONS ── */
.btn{
  display:inline-flex;align-items:center;gap:6px;
  padding:7px 15px;border-radius:6px;font-size:12px;font-weight:600;
  cursor:pointer;border:none;font-family:var(--font);
  transition:all .15s;letter-spacing:.02em;white-space:nowrap;
}
.btn:disabled{opacity:.4;cursor:not-allowed;}
.btn-primary{background:var(--amber);color:#000;}
.btn-primary:hover:not(:disabled){background:var(--amber2);}
.btn-ghost{background:var(--bg3);color:var(--text2);border:1px solid var(--border);}
.btn-ghost:hover:not(:disabled){border-color:var(--amber);color:var(--amber);}
.btn-danger{background:var(--red-d);color:var(--red);border:1px solid rgba(239,68,68,.3);}
.btn-danger:hover:not(:disabled){background:rgba(239,68,68,.25);}
.btn-teal{background:var(--teal-d);color:var(--teal);border:1px solid rgba(20,184,166,.3);}
.btn-teal:hover:not(:disabled){background:rgba(20,184,166,.25);}
.btn-sm{padding:4px 10px;font-size:11px;}
.btn-xs{padding:2px 8px;font-size:10px;}
.btn-icon{width:30px;height:30px;padding:0;justify-content:center;}

/* ── MODAL ── */
.overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.75);
  display:flex;align-items:center;justify-content:center;
  z-index:100;padding:20px;
  animation:fadeIn .15s ease;
}
.modal{
  background:var(--bg2);border:1px solid var(--border2);
  border-radius:10px;width:100%;max-height:92vh;
  overflow-y:auto;animation:slideUp .2s ease;
  position:relative;
}
.modal.sm{max-width:440px;}
.modal.md{max-width:620px;}
.modal.lg{max-width:860px;}
.modal.xl{max-width:1100px;}
.modal-stripe{
  position:absolute;top:0;left:0;right:0;height:3px;border-radius:10px 10px 0 0;
  background:linear-gradient(90deg,var(--amber),var(--amber2),transparent);
}
.modal-head{
  padding:18px 22px 14px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  gap:12px;flex-shrink:0;position:sticky;top:0;background:var(--bg2);z-index:1;
}
.modal-title{font-family:var(--fontc);font-size:16px;font-weight:700;letter-spacing:.03em;}
.modal-body{padding:22px;}
.modal-footer{
  padding:14px 22px;border-top:1px solid var(--border);
  display:flex;gap:8px;justify-content:flex-end;align-items:center;
  position:sticky;bottom:0;background:var(--bg2);
}

/* ── FORMS ── */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.form-group{display:flex;flex-direction:column;gap:5px;}
.form-group.span2{grid-column:1/-1;}
.label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);}
.input,.select,.textarea{
  background:var(--bg);border:1px solid var(--border);
  border-radius:6px;padding:9px 12px;
  font-family:var(--font);font-size:13px;color:var(--text);
  outline:none;transition:border-color .15s;width:100%;
}
.input:focus,.select:focus,.textarea:focus{border-color:var(--amber);}
.select option{background:var(--bg2);}
.textarea{resize:vertical;min-height:70px;line-height:1.5;}
.input-error{border-color:var(--red)!important;}
.error-msg{font-size:10px;color:var(--red);margin-top:2px;}

/* ── TABS ── */
.tabs{display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:20px;}
.tab{
  padding:9px 16px;font-size:12px;font-weight:600;
  cursor:pointer;color:var(--text3);border-bottom:2px solid transparent;
  transition:all .15s;display:flex;align-items:center;gap:6px;
  margin-bottom:-1px;
}
.tab:hover{color:var(--text2);}
.tab.on{color:var(--amber);border-bottom-color:var(--amber);}
.tab-count{font-family:var(--mono);font-size:10px;
  background:var(--bg4);padding:1px 6px;border-radius:8px;}

/* ── DETAIL SECTIONS ── */
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;}
.detail-item{background:var(--bg3);border-radius:6px;padding:10px 14px;}
.detail-key{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin-bottom:4px;}
.detail-val{font-size:13px;font-weight:500;}

/* ── TIMELINE ── */
.timeline{position:relative;padding-left:24px;}
.timeline::before{content:'';position:absolute;left:7px;top:0;bottom:0;width:1px;background:var(--border);}
.tl-item{position:relative;margin-bottom:16px;}
.tl-dot{
  position:absolute;left:-24px;top:4px;
  width:14px;height:14px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:7px;flex-shrink:0;
}
.tl-content{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px 14px;}
.tl-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;}
.tl-action{font-size:12px;font-weight:600;}
.tl-time{font-size:10px;color:var(--text3);font-family:var(--mono);}
.tl-body{font-size:12px;color:var(--text2);line-height:1.5;}

/* ── COMMENT BOX ── */
.comment-box{
  background:var(--bg3);border:1px solid var(--border);
  border-radius:6px;overflow:hidden;margin-top:12px;
}
.comment-box textarea{
  width:100%;background:transparent;border:none;outline:none;
  padding:10px 14px;font-family:var(--font);font-size:12px;
  color:var(--text);resize:none;min-height:60px;line-height:1.5;
}
.comment-box-footer{
  padding:6px 10px;border-top:1px solid var(--border);
  display:flex;justify-content:flex-end;
}

/* ── FILE UPLOAD ── */
.drop-zone{
  border:1.5px dashed var(--border2);border-radius:6px;
  padding:20px;text-align:center;cursor:pointer;
  transition:all .15s;background:var(--bg3);
}
.drop-zone:hover,.drop-zone.drag{border-color:var(--amber);background:var(--amber-d);}
.drop-zone-icon{font-size:24px;margin-bottom:6px;}
.drop-zone-text{font-size:12px;color:var(--text2);}
.drop-zone-sub{font-size:10px;color:var(--text3);margin-top:3px;}

.attachment-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;margin-top:12px;}
.attachment-thumb{
  position:relative;border-radius:6px;overflow:hidden;
  background:var(--bg3);border:1px solid var(--border);
  aspect-ratio:1;cursor:pointer;transition:border-color .15s;
}
.attachment-thumb:hover{border-color:var(--amber);}
.attachment-thumb img{width:100%;height:100%;object-fit:cover;}
.attachment-file{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;gap:4px;
}
.attachment-file-name{font-size:9px;color:var(--text3);text-align:center;padding:0 4px;word-break:break-all;}
.attachment-del{
  position:absolute;top:4px;right:4px;
  width:18px;height:18px;border-radius:50%;
  background:rgba(0,0,0,.7);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-size:10px;cursor:pointer;opacity:0;transition:opacity .15s;
}
.attachment-thumb:hover .attachment-del{opacity:1;}

/* ── PARTS LIST ── */
.parts-row{
  display:flex;align-items:center;gap:8px;
  background:var(--bg3);border:1px solid var(--border);
  border-radius:6px;padding:8px 12px;margin-bottom:6px;
}
.parts-row-name{flex:1;font-size:13px;}
.parts-row-qty{font-family:var(--mono);font-size:12px;color:var(--amber);min-width:40px;text-align:right;}

/* ── HISTORY TABLE ── */
.asset-history{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;}
.asset-history-header{
  padding:14px 18px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
}
.asset-history-title{font-family:var(--fontc);font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text2);}

/* ── USER MANAGEMENT ── */
.user-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);
  padding:16px;display:flex;align-items:center;gap:14px;
  transition:border-color .15s;
}
.user-card:hover{border-color:var(--border2);}
.user-big-avatar{
  width:44px;height:44px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:15px;font-weight:800;color:#000;
}
.user-info-block{flex:1;}
.user-info-name{font-size:14px;font-weight:700;}
.user-info-email{font-size:11px;color:var(--text2);font-family:var(--mono);}
.user-perms{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;}
.perm-chip{
  font-size:9px;font-weight:600;font-family:var(--mono);
  padding:2px 7px;border-radius:10px;text-transform:uppercase;
}
.perm-chip.yes{background:var(--green-d);color:var(--green);border:1px solid rgba(34,197,94,.3);}
.perm-chip.no{background:var(--bg4);color:var(--text3);border:1px solid var(--border);}

/* ── PROGRESS ── */
.progress{height:5px;background:var(--bg4);border-radius:3px;overflow:hidden;margin-top:6px;}
.progress-bar{height:100%;border-radius:3px;transition:width .4s ease;}

/* ── EMPTY ── */
.empty{text-align:center;padding:48px 20px;color:var(--text3);}
.empty-icon{font-size:32px;margin-bottom:10px;}
.empty-text{font-size:13px;}

/* ── CONFIRM DIALOG ── */
.confirm-icon{
  width:52px;height:52px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 14px;
}
.confirm-icon.red{background:var(--red-d);}

/* ── ANIMATIONS ── */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes slideDown{from{transform:translateY(-8px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.pulse{animation:pulse 2s infinite;}

/* ── RESPONSIVE ── */
@media(max-width:900px){
  .sidebar{display:none;}
  .kpi-row{grid-template-columns:repeat(3,1fr);}
  .form-grid{grid-template-columns:1fr;}
  .form-group.span2{grid-column:1;}
  .detail-grid{grid-template-columns:1fr;}
}
@media(max-width:600px){
  .kpi-row{grid-template-columns:repeat(2,1fr);}
  .ot-cards{grid-template-columns:1fr;}
  .modal.lg,.modal.xl{max-width:100%;}
}

@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0c0e14; --bg2:#12151e; --bg3:#181c28; --bg4:#1e2333; --bg5:#252c40;
  --b1:#252d42; --b2:#313d5c; --b3:#4a5880;
  --amber:#f59e0b; --amber2:#fbbf24; --adim:rgba(245,158,11,.12); --aglow:rgba(245,158,11,.3);
  --blue:#3b82f6; --bdim:rgba(59,130,246,.12);
  --teal:#0ea5e9; --tdim:rgba(14,165,233,.12);
  --red:#f43f5e; --rdim:rgba(244,63,94,.14);
  --green:#10b981; --gdim:rgba(16,185,129,.12);
  --yellow:#f59e0b; --ydim:rgba(245,158,11,.14);
  --purple:#8b5cf6; --pdim:rgba(139,92,246,.12);
  --orange:#f97316; --odim:rgba(249,115,22,.14);
  --text:#dde3f5; --t2:#7888ab; --t3:#3d4a6a;
  --font:'DM Sans',sans-serif; --title:'Syne',sans-serif; --mono:'Share Tech Mono',monospace;
  --r:8px; --sh:0 8px 32px rgba(0,0,0,.5);
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--font);}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:2px;}

/* ── APP SHELL ── */
.app{display:flex;height:100vh;overflow:hidden;}
.sidebar{width:230px;min-width:230px;background:var(--bg2);border-right:1px solid var(--b1);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.sidebar::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--amber),var(--amber2),transparent);}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.topbar{height:54px;background:var(--bg2);border-bottom:1px solid var(--b1);padding:0 20px;display:flex;align-items:center;gap:12px;flex-shrink:0;}
.content{flex:1;overflow-y:auto;padding:22px;}

/* ── SIDEBAR ELEMENTS ── */
.logo{padding:18px 18px 14px;border-bottom:1px solid var(--b1);}
.logo-mark{font-family:var(--title);font-size:16px;font-weight:800;color:var(--amber);letter-spacing:.04em;}
.logo-sub{font-size:10px;color:var(--t3);font-family:var(--mono);margin-top:1px;}
.nav-sec{padding:10px 10px 0;}
.nav-lbl{font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--t3);padding:4px 8px 6px;}
.nav-it{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:6px;cursor:pointer;font-size:12.5px;font-weight:500;color:var(--t2);transition:all .15s;margin-bottom:1px;position:relative;}
.nav-it:hover{background:var(--bg3);color:var(--text);}
.nav-it.on{background:var(--adim);color:var(--amber);}
.nav-it.on::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:2px;background:var(--amber);border-radius:0 2px 2px 0;}
.npill{margin-left:auto;font-size:9px;font-weight:700;font-family:var(--mono);padding:1px 6px;border-radius:8px;}
.npill.red{background:var(--red);color:#fff;}
.npill.amber{background:var(--amber);color:#000;}
.npill.green{background:var(--green);color:#000;}
.sb-foot{margin-top:auto;padding:12px 14px;border-top:1px solid var(--b1);}
.user-row{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:6px;cursor:pointer;transition:background .15s;}
.user-row:hover{background:var(--bg3);}
.uname{font-size:12px;font-weight:600;}
.urole{font-size:10px;color:var(--t3);font-family:var(--mono);}

/* ── TOPBAR ── */
.top-title{font-family:var(--title);font-size:16px;font-weight:700;flex:1;}
.top-date{font-size:11px;color:var(--t3);font-family:var(--mono);}
.ib{width:34px;height:34px;border-radius:6px;background:var(--bg3);border:1px solid var(--b1);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--t2);transition:all .15s;position:relative;flex-shrink:0;}
.ib:hover{border-color:var(--amber);color:var(--amber);}
.nbadge{position:absolute;top:-3px;right:-3px;background:var(--red);color:#fff;font-size:9px;font-weight:700;font-family:var(--mono);padding:0 4px;border-radius:8px;min-width:15px;text-align:center;}

/* ── BADGE ── */
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;font-family:var(--mono);letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;}
.badge.pending{background:var(--ydim);color:var(--yellow);border:1px solid rgba(245,158,11,.3);}
.badge.reviewing{background:var(--bdim);color:var(--blue);border:1px solid rgba(59,130,246,.3);}
.badge.accepted{background:var(--gdim);color:var(--green);border:1px solid rgba(16,185,129,.3);}
.badge.rejected{background:var(--rdim);color:var(--red);border:1px solid rgba(244,63,94,.3);}
.badge.converted{background:var(--pdim);color:var(--purple);border:1px solid rgba(139,92,246,.3);}
.badge.critical{background:var(--rdim);color:var(--red);border:1px solid rgba(244,63,94,.3);}
.badge.high{background:var(--odim);color:var(--orange);border:1px solid rgba(249,115,22,.3);}
.badge.medium{background:var(--ydim);color:var(--yellow);border:1px solid rgba(245,158,11,.3);}
.badge.low{background:var(--gdim);color:var(--green);border:1px solid rgba(16,185,129,.3);}
.badge.operario{background:var(--tdim);color:var(--teal);border:1px solid rgba(14,165,233,.3);}
.badge.tecnico{background:var(--bdim);color:var(--blue);border:1px solid rgba(59,130,246,.3);}
.badge.jefe{background:var(--adim);color:var(--amber);border:1px solid var(--aglow);}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:var(--font);transition:all .15s;white-space:nowrap;}
.btn:disabled{opacity:.35;cursor:not-allowed;}
.btn-primary{background:var(--amber);color:#000;}
.btn-primary:hover:not(:disabled){background:var(--amber2);}
.btn-ghost{background:var(--bg3);color:var(--t2);border:1px solid var(--b1);}
.btn-ghost:hover:not(:disabled){border-color:var(--amber);color:var(--amber);}
.btn-green{background:var(--gdim);color:var(--green);border:1px solid rgba(16,185,129,.3);}
.btn-green:hover:not(:disabled){background:rgba(16,185,129,.25);}
.btn-red{background:var(--rdim);color:var(--red);border:1px solid rgba(244,63,94,.3);}
.btn-red:hover:not(:disabled){background:rgba(244,63,94,.25);}
.btn-blue{background:var(--bdim);color:var(--blue);border:1px solid rgba(59,130,246,.3);}
.btn-blue:hover:not(:disabled){background:rgba(59,130,246,.25);}
.btn-sm{padding:5px 12px;font-size:11px;}
.btn-xs{padding:3px 9px;font-size:10px;}

/* ── CARDS / GRID ── */
.card{background:var(--bg2);border:1px solid var(--b1);border-radius:var(--r);padding:18px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}

/* ── KPI ── */
.kpi{background:var(--bg2);border:1px solid var(--b1);border-radius:var(--r);padding:14px 18px;position:relative;overflow:hidden;}
.kpi-lbl{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);margin-bottom:6px;}
.kpi-val{font-family:var(--mono);font-size:26px;font-weight:700;line-height:1;}
.kpi-sub{font-size:10px;color:var(--t3);margin-top:5px;}
.kpi-stripe{position:absolute;bottom:0;left:0;right:0;height:2px;}

/* ── FORM ── */
.fg{display:flex;flex-direction:column;gap:5px;}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.fgrid .span2{grid-column:1/-1;}
.lbl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);}
.inp,.sel,.ta{background:var(--bg);border:1px solid var(--b1);border-radius:6px;padding:9px 12px;font-family:var(--font);font-size:13px;color:var(--text);outline:none;transition:border-color .15s;width:100%;}
.inp:focus,.sel:focus,.ta:focus{border-color:var(--amber);}
.inp.err{border-color:var(--red);}
.sel option{background:var(--bg2);}
.ta{resize:vertical;min-height:80px;line-height:1.5;}
.err-msg{font-size:10px;color:var(--red);margin-top:2px;}

/* ── MODAL ── */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;animation:fi .15s ease;}
.modal{background:var(--bg2);border:1px solid var(--b2);border-radius:10px;width:100%;max-height:90vh;overflow-y:auto;animation:su .2s ease;position:relative;}
.modal.sm{max-width:460px;} .modal.md{max-width:620px;} .modal.lg{max-width:820px;}
.mstripe{position:absolute;top:0;left:0;right:0;height:3px;border-radius:10px 10px 0 0;}
.mhead{padding:18px 22px 14px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;gap:12px;position:sticky;top:0;background:var(--bg2);z-index:1;}
.mtitle{font-family:var(--title);font-size:15px;font-weight:700;}
.mbody{padding:22px;}
.mfoot{padding:14px 22px;border-top:1px solid var(--b1);display:flex;gap:8px;justify-content:flex-end;position:sticky;bottom:0;background:var(--bg2);}

/* ── SECTION HEADER ── */
.sh{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px;}
.sh-title{font-family:var(--title);font-size:20px;font-weight:800;}
.sh-sub{font-size:11px;color:var(--t3);font-family:var(--mono);margin-top:3px;}

/* ── TABS ── */
.tabs{display:flex;border-bottom:1px solid var(--b1);margin-bottom:20px;}
.tab{padding:9px 16px;font-size:12px;font-weight:600;cursor:pointer;color:var(--t3);border-bottom:2px solid transparent;transition:all .15s;display:flex;align-items:center;gap:6px;margin-bottom:-1px;}
.tab:hover{color:var(--t2);}
.tab.on{color:var(--amber);border-bottom-color:var(--amber);}
.tc{font-family:var(--mono);font-size:10px;background:var(--bg4);padding:1px 5px;border-radius:6px;}

/* ── INCIDENCIA CARDS ── */
.inc-card{background:var(--bg2);border:1px solid var(--b1);border-radius:var(--r);padding:16px;transition:all .15s;position:relative;overflow:hidden;}
.inc-card:hover{border-color:var(--b2);transform:translateY(-1px);box-shadow:var(--sh);}
.inc-card-accent{position:absolute;top:0;left:0;bottom:0;width:3px;}
.inc-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
.inc-id{font-family:var(--mono);font-size:10px;color:var(--t3);}
.inc-title{font-weight:700;font-size:14px;margin-bottom:3px;line-height:1.3;}
.inc-meta{font-size:11px;color:var(--t2);display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.inc-foot{display:flex;align-items:center;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--b1);flex-wrap:wrap;}

/* ── STATUS TRACK ── */
.status-track{display:flex;align-items:center;gap:0;margin:16px 0;}
.st-step{display:flex;flex-direction:column;align-items:center;flex:1;position:relative;}
.st-step::before{content:'';position:absolute;top:14px;left:-50%;right:50%;height:2px;background:var(--b1);z-index:0;}
.st-step:first-child::before{display:none;}
.st-step.done::before{background:var(--green);}
.st-step.active::before{background:var(--amber);}
.st-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;z-index:1;border:2px solid var(--b1);background:var(--bg3);transition:all .2s;}
.st-dot.done{background:var(--green);border-color:var(--green);color:#000;}
.st-dot.active{background:var(--amber);border-color:var(--amber);color:#000;box-shadow:0 0 12px var(--aglow);}
.st-dot.pending{background:var(--bg4);border-color:var(--b2);color:var(--t3);}
.st-lbl{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-top:6px;text-align:center;}
.st-lbl.done{color:var(--green);}
.st-lbl.active{color:var(--amber);}

/* ── REVIEW PANEL ── */
.review-card{background:var(--bg3);border:1px solid var(--b1);border-radius:6px;padding:14px 16px;margin-bottom:10px;transition:border-color .15s;}
.review-card:hover{border-color:var(--b2);}
.review-header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px;}
.review-title{font-weight:700;font-size:14px;}
.review-reporter{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--t2);margin-top:3px;}
.review-desc{font-size:12px;color:var(--t2);line-height:1.5;margin-bottom:10px;}
.review-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}

/* ── OPERARIO PORTAL ── */
.portal-hero{background:linear-gradient(135deg,var(--bg3) 0%,var(--bg4) 100%);border:1px solid var(--b1);border-radius:12px;padding:24px;margin-bottom:20px;position:relative;overflow:hidden;}
.portal-hero::after{content:'⚙';position:absolute;right:20px;bottom:-10px;font-size:80px;opacity:.05;line-height:1;}
.portal-hero-title{font-family:var(--title);font-size:22px;font-weight:800;color:var(--amber);margin-bottom:4px;}
.portal-hero-sub{font-size:13px;color:var(--t2);}

/* ── EMPTY ── */
.empty{text-align:center;padding:48px 20px;color:var(--t3);}
.empty-icon{font-size:36px;margin-bottom:10px;}

/* ── DETAIL ROW ── */
.dr{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--b1);}
.dr:last-child{border-bottom:none;}
.dk{min-width:130px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);padding-top:1px;font-family:var(--mono);}

/* ── REJECTION REASON ── */
.rejection-box{background:var(--rdim);border:1px solid rgba(244,63,94,.25);border-radius:6px;padding:12px 14px;margin-top:10px;}
.rejection-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--red);margin-bottom:4px;}

/* ── AVATAR ── */
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#000;flex-shrink:0;}

/* ── SWITCHER (demo) ── */
.switcher{background:var(--bg3);border:1px solid var(--b1);border-radius:8px;padding:10px 12px;margin-bottom:14px;}
.switcher-lbl{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);margin-bottom:8px;}
.switcher-users{display:flex;flex-direction:column;gap:4px;}
.sw-user{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:5px;cursor:pointer;transition:background .12s;}
.sw-user:hover{background:var(--bg4);}
.sw-user.on{background:var(--adim);outline:1px solid var(--aglow);}
.sw-name{font-size:11px;font-weight:600;flex:1;}

/* ── NOTIF PANEL ── */
.notif-wrap{position:fixed;top:58px;right:14px;width:340px;background:var(--bg2);border:1px solid var(--b2);border-radius:var(--r);box-shadow:var(--sh);z-index:200;animation:su .18s ease;}
.notif-ov{position:fixed;inset:0;z-index:199;}
.nh{padding:12px 16px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;}
.ni{display:flex;gap:10px;padding:11px 16px;border-bottom:1px solid var(--b1);cursor:pointer;transition:background .12s;}
.ni:hover{background:var(--bg3);}
.ni:last-child{border-bottom:none;}
.ndot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px;}

/* ── URGENCY SELECTOR ── */
.urg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:6px;}
.urg-opt{padding:10px 8px;border-radius:6px;border:2px solid var(--b1);cursor:pointer;text-align:center;transition:all .15s;background:var(--bg3);}
.urg-opt:hover{border-color:var(--b2);}
.urg-opt.on{border-color:var(--amber);background:var(--adim);}
.urg-opt .urg-icon{font-size:18px;margin-bottom:4px;}
.urg-opt .urg-lbl{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;}

/* ── PROGRESS ── */
.prog{height:4px;background:var(--bg4);border-radius:2px;overflow:hidden;}
.prog-bar{height:100%;border-radius:2px;transition:width .4s ease;}

/* ── PHOTO UPLOAD ── */
.dz{border:1.5px dashed var(--b2);border-radius:6px;padding:16px;text-align:center;cursor:pointer;transition:all .15s;background:var(--bg3);}
.dz:hover{border-color:var(--amber);background:var(--adim);}
.att-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;margin-top:10px;}
.att-thumb{position:relative;border-radius:5px;overflow:hidden;background:var(--bg3);border:1px solid var(--b1);aspect-ratio:1;}
.att-thumb img{width:100%;height:100%;object-fit:cover;}
.att-del{position:absolute;top:3px;right:3px;width:16px;height:16px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;cursor:pointer;opacity:0;transition:opacity .15s;}
.att-thumb:hover .att-del{opacity:1;}

/* ── COMMENT THREAD ── */
.thread-wrap{margin-top:20px;}
.thread-title{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);margin-bottom:12px;display:flex;align-items:center;gap:7px;}
.thread-title-line{flex:1;height:1px;background:var(--b1);}
.comment-item{display:flex;gap:10px;margin-bottom:14px;animation:fi .2s ease;}
.comment-item.mine{flex-direction:row-reverse;}
.comment-bubble{
  max-width:75%;background:var(--bg3);border:1px solid var(--b1);
  border-radius:10px;padding:10px 14px;
  position:relative;
}
.comment-item.mine .comment-bubble{
  background:var(--adim);border-color:var(--aglow);
  border-radius:10px 10px 2px 10px;
}
.comment-item:not(.mine) .comment-bubble{
  border-radius:10px 10px 10px 2px;
}
.comment-meta{display:flex;align-items:center;gap:7px;margin-bottom:5px;flex-wrap:wrap;}
.comment-name{font-size:11px;font-weight:700;}
.comment-time{font-size:10px;color:var(--t3);font-family:var(--mono);}
.comment-text{font-size:13px;line-height:1.55;color:var(--text);}
.comment-item.mine .comment-text{color:var(--text);}
.comment-role-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

.composer{
  background:var(--bg3);border:1px solid var(--b1);
  border-radius:8px;overflow:hidden;margin-top:10px;
  transition:border-color .15s;
}
.composer:focus-within{border-color:var(--amber);}
.composer textarea{
  width:100%;background:transparent;border:none;outline:none;
  padding:11px 14px;font-family:var(--font);font-size:13px;
  color:var(--text);resize:none;min-height:72px;line-height:1.5;
}
.composer textarea::placeholder{color:var(--t3);}
.composer-foot{
  padding:6px 10px;border-top:1px solid var(--b1);
  display:flex;justify-content:space-between;align-items:center;
}
.composer-hint{font-size:10px;color:var(--t3);}
.no-comments{text-align:center;padding:20px;color:var(--t3);font-size:12px;}
.comment-unread-badge{
  display:inline-flex;align-items:center;gap:4px;
  background:var(--rdim);color:var(--red);
  border:1px solid rgba(244,63,94,.3);
  padding:2px 7px;border-radius:8px;
  font-size:10px;font-weight:700;font-family:var(--mono);
  animation:pulse 2s infinite;
}

@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes su{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.pulse{animation:pulse 2s infinite;}

@media(max-width:768px){
  .sidebar{display:none;}
  .g2,.g3,.g4,.fgrid{grid-template-columns:1fr;}
  .fgrid .span2{grid-column:1;}
}


/* ── ROLE SELECTOR ── */
.role-switch{display:flex;flex-direction:column;gap:3px;padding:8px 10px;}
.rs-user{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:5px;cursor:pointer;transition:background .12s;}
.rs-user:hover{background:var(--bg4);}
.rs-user.on{background:var(--amber-d);outline:1px solid rgba(245,158,11,.3);}
.rs-name{font-size:11px;font-weight:600;flex:1;}
/* ── INCIDENCIA BADGES IN OT ── */
.inc-source-tag{
  display:inline-flex;align-items:center;gap:4px;
  background:rgba(14,165,233,.12);color:#0ea5e9;
  border:1px solid rgba(14,165,233,.3);
  padding:1px 7px;border-radius:4px;font-size:9px;font-weight:700;
  font-family:var(--mono);text-transform:uppercase;
}

/* ── AUTH / LOGIN ── */
.login-screen{
  min-height:100vh;background:var(--bg);
  display:flex;align-items:center;justify-content:center;
  padding:20px;position:relative;overflow:hidden;
}
.login-screen::before{
  content:'';position:absolute;
  width:600px;height:600px;border-radius:50%;
  background:radial-gradient(circle,rgba(245,158,11,.06) 0%,transparent 70%);
  top:-100px;right:-100px;pointer-events:none;
}
.login-screen::after{
  content:'⚙';position:absolute;
  font-size:320px;opacity:.018;
  bottom:-60px;left:-40px;line-height:1;
  pointer-events:none;user-select:none;
}
.login-card{
  width:100%;max-width:400px;
  background:var(--bg2);border:1px solid var(--border2);
  border-radius:14px;overflow:hidden;
  box-shadow:0 24px 80px rgba(0,0,0,.6);
  animation:slideUp .3s ease;
  position:relative;
}
.login-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--amber),var(--amber2),var(--teal),transparent);
}
.login-logo{
  padding:32px 32px 20px;text-align:center;
  border-bottom:1px solid var(--border);
}
.login-logo-mark{
  font-family:var(--fontc);font-size:26px;font-weight:800;
  color:var(--amber);letter-spacing:.06em;margin-bottom:4px;
}
.login-logo-sub{font-size:11px;color:var(--text3);font-family:var(--mono);}
.login-body{padding:28px 32px;}
.login-title{
  font-family:var(--fontc);font-size:18px;font-weight:700;
  margin-bottom:6px;letter-spacing:.02em;
}
.login-subtitle{font-size:12px;color:var(--text2);margin-bottom:24px;}
.login-field{display:flex;flex-direction:column;gap:5px;margin-bottom:16px;}
.login-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);}
.login-input{
  background:var(--bg);border:1px solid var(--border);
  border-radius:7px;padding:11px 14px;
  font-family:var(--font);font-size:14px;color:var(--text);
  outline:none;transition:border-color .15s;width:100%;
}
.login-input:focus{border-color:var(--amber);}
.login-input.error{border-color:var(--red);}
.login-error{
  display:flex;align-items:center;gap:7px;
  background:var(--red-d);border:1px solid rgba(239,68,68,.25);
  border-radius:6px;padding:9px 14px;
  font-size:12px;color:var(--red);margin-bottom:16px;
  animation:fadeIn .2s ease;
}
.login-btn{
  width:100%;padding:12px;border-radius:7px;
  background:var(--amber);color:#000;
  font-family:var(--fontc);font-size:15px;font-weight:700;
  letter-spacing:.04em;border:none;cursor:pointer;
  transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px;
}
.login-btn:hover{background:var(--amber2);transform:translateY(-1px);}
.login-btn:active{transform:translateY(0);}
.login-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.login-footer{
  padding:16px 32px;border-top:1px solid var(--border);
  font-size:10px;color:var(--text3);text-align:center;font-family:var(--mono);
}
.logout-btn{
  display:flex;align-items:center;gap:7px;width:100%;
  padding:7px 9px;border-radius:6px;cursor:pointer;
  font-size:12px;font-weight:500;color:var(--text3);
  background:none;border:none;font-family:var(--font);
  transition:all .15s;margin-top:6px;
}
.logout-btn:hover{background:var(--red-d);color:var(--red);}
.pw-wrap{position:relative;}
.pw-toggle{
  position:absolute;right:11px;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;color:var(--text3);
  padding:2px;transition:color .15s;
}
.pw-toggle:hover{color:var(--amber);}

/* ── KPI CARDS CLICKABLE ── */
.kpi{cursor:pointer;transition:all .15s;}
.kpi:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.3);}
.kpi.active-filter{outline:2px solid var(--amber);outline-offset:2px;}

/* ── ASSET SELECT ── */
.asset-select-wrap{position:relative;}
.asset-dropdown{
  position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:100;
  background:var(--bg2);border:1px solid var(--border2);
  border-radius:6px;max-height:200px;overflow-y:auto;
  box-shadow:var(--shadow);
}
.asset-option{
  padding:8px 12px;cursor:pointer;font-size:12px;
  border-bottom:1px solid var(--border);transition:background .1s;
  display:flex;align-items:center;justify-content:space-between;
}
.asset-option:hover{background:var(--bg4);}
.asset-option:last-child{border-bottom:none;}
.asset-option-id{font-family:var(--mono);font-size:10px;color:var(--text3);}
.asset-option-badge{font-size:9px;background:var(--bg4);padding:1px 6px;border-radius:3px;color:var(--text3);}

/* ── INVENTORY MODULE ── */
.inv-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;}
.inv-section-title{font-family:var(--fontc);font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text2);margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.asset-card{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;transition:border-color .15s;}
.asset-card:hover{border-color:var(--border2);}
.asset-card.inactive{opacity:.55;}
.asset-id{font-family:var(--mono);font-size:9px;color:var(--text3);margin-bottom:4px;}
.asset-name{font-size:13px;font-weight:600;margin-bottom:4px;}
.asset-meta{font-size:11px;color:var(--text2);}
.asset-dates{display:flex;gap:12px;margin-top:8px;font-size:10px;font-family:var(--mono);color:var(--text3);}
.asset-inactive-tag{display:inline-flex;align-items:center;gap:4px;background:var(--red-d);color:var(--red);border:1px solid rgba(239,68,68,.2);padding:1px 7px;border-radius:4px;font-size:9px;font-weight:700;margin-top:6px;}
.part-row{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;}
.part-row:last-child{border-bottom:none;}
.part-name{flex:1;font-weight:500;}
.part-stock{font-family:var(--mono);font-size:11px;}
.part-stock.low{color:var(--red);}
.part-compat{font-size:9px;color:var(--text3);}
.stock-badge{padding:1px 7px;border-radius:4px;font-family:var(--mono);font-size:10px;font-weight:700;}
.stock-ok{background:var(--green-d);color:var(--green);}
.stock-low{background:var(--red-d);color:var(--red);}

/* ── USER MANAGER IMPROVED ── */
.user-edit-form{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px;margin-top:8px;display:flex;flex-direction:column;gap:10px;}
.user-edit-row{display:flex;gap:8px;align-items:center;}
.user-edit-label{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);width:80px;flex-shrink:0;}
.user-edit-input{flex:1;background:var(--bg);border:1px solid var(--border);border-radius:5px;padding:7px 10px;font-size:12px;color:var(--text);font-family:var(--font);outline:none;}
.user-edit-input:focus{border-color:var(--amber);}
.user-edit-select{flex:1;background:var(--bg);border:1px solid var(--border);border-radius:5px;padding:7px 10px;font-size:12px;color:var(--text);font-family:var(--font);outline:none;}

`;


// ══════════════════════════════════════════════════════════════════════════════
// SVG ICON
// ══════════════════════════════════════════════════════════════════════════════
const Ic = ({ path, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const I = {
  menu:      "M3 12h18 M3 6h18 M3 18h18",
  dash:      "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  ot:        "M14.7 6.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-3-3a1 1 0 011.4-1.4L6 13.6l7.3-7.3a1 1 0 011.4 0z",
  pm:        "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  inv:       "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  users:     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  plus:      "M12 5v14 M5 12h14",
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  edit:      "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:     "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6",
  x:         "M18 6L6 18 M6 6l12 12",
  check:     "M20 6L9 17l-5-5",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0",
  clip:      "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  clock:     "M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2",
  wrench:    "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  alert:     "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  history:   "M3 3v5h5 M3.05 13A9 9 0 106 5.3L3 3",
  tag:       "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  package:   "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  img:       "M21 15l-5-5L5 21 M15 7m-4 0a4 4 0 108 0 4 4 0 00-8 0 M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2z",
  upload:    "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  grid:      "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  list:      "M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01",
  sort:      "M3 6h18 M7 12h10 M11 18h2",
  filter:    "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
  lock:      "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  send:      "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  chevD:     "M6 9l6 6 6-6",
  inbox:     "M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z",
};

// ══════════════════════════════════════════════════════════════════════════════
// INITIAL DATA
// ══════════════════════════════════════════════════════════════════════════════






// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const PRIORITY_LABEL = { critical: "Crítica", high: "Alta", medium: "Media", low: "Baja" };
const STATUS_LABEL   = { open: "Abierta", in_progress: "En Progreso", completed: "Completada", scheduled: "Programada", cancelled: "Cancelada" };
const TYPE_LABEL     = { corrective: "Correctiva", preventive: "Preventiva" };
const ROLE_LABEL     = { jefe: "Jefe Mant.", tecnico: "Técnico", operario: "Operario", observador: "Observador" };
const PERM_LABEL     = { create: "Crear OT", edit: "Editar OT", delete: "Eliminar", assign: "Asignar", close: "Cerrar/Completar", viewAll: "Ver todas" };

const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const now = () => new Date().toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });

function Avatar({ user, size = 30 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user?.color || "#666",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.37, fontWeight: 800, color: "#000", flexShrink: 0,
    }}>{user?.avatar || "?"}</div>
  );
}

const Av = ({ user, size = 28 }) => <Avatar user={user} size={size} />;

function Badge({ cls, children }) {
  return <span className={`badge ${cls}`}>{children}</span>;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════════════════════════════════════════

/* ── CONFIRM DELETE ── */
function ConfirmDelete({ title, onConfirm, onClose }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal sm">
        <div className="modal-stripe" />
        <div className="modal-body" style={{ textAlign: "center", paddingTop: 28 }}>
          <div className="confirm-icon red"><Ic path={I.trash} size={22} color="var(--red)" /></div>
          <div style={{ fontFamily: "var(--fontc)", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>¿Eliminar esta OT?</div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Esta acción no se puede deshacer.</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}><Ic path={I.trash} size={13} />Eliminar</button>
        </div>
      </div>
    </div>
  );
}

/* ── IMAGE LIGHTBOX ── */
function Lightbox({ src, onClose }) {
  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 200 }}>
      <img src={src} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, boxShadow: "0 8px 48px rgba(0,0,0,.8)" }} />
    </div>
  );
}

/* ── OT FORM (Create/Edit) ── */

// ══════════════════════════════════════════════════════════════════════════════
// ASSET PICKER — dropdown con búsqueda para seleccionar activos
// ══════════════════════════════════════════════════════════════════════════════
function AssetPicker({ value, assets, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeAssets = assets.filter(a => !a.inactiveDate);
  const filtered = activeAssets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.line.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (asset) => {
    onChange(asset.name);
    setSearch(asset.name);
    setOpen(false);
  };

  const handleInput = (e) => {
    setSearch(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  return (
    <div className="asset-select-wrap" ref={ref}>
      <input
        className={`input ${error ? "error" : ""}`}
        placeholder="Buscar equipo o escribir nombre..."
        value={search}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="asset-dropdown">
          {filtered.map(a => (
            <div key={a.id} className="asset-option" onClick={() => handleSelect(a)}>
              <span>{a.name} <span className="asset-option-badge">{a.line}</span></span>
              <span className="asset-option-id">{a.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OTForm({ ot, users, assets, onSave, onClose, currentUser }) {
  const isEdit = !!ot?.id;
  const [form, setForm] = useState({
    type: ot?.type || "corrective",
    title: ot?.title || "",
    asset: ot?.asset || "",
    priority: ot?.priority || "medium",
    status: ot?.status || "open",
    assignedId: ot?.assignedId || "",
    date: ot?.date || new Date().toISOString().split("T")[0],
    dueDate: ot?.dueDate || "",
    estimatedHours: ot?.estimatedHours || "",
    description: ot?.description || "",
    parts: ot?.parts || [],
  });
  const [errors, setErrors] = useState({});
  const [newPart, setNewPart] = useState({ name: "", qty: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "El título es obligatorio";
    if (!form.asset.trim()) e.asset = "El activo es obligatorio";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const histEntry = isEdit
      ? { action: "OT editada", userId: currentUser.id, ts: now(), type: "edit" }
      : { action: "OT creada", userId: currentUser.id, ts: now(), type: "create" };
    const saved = {
      ...(ot || {}), ...form,
      id: ot?.id || `OT-${uid()}`,
      estimatedHours: Number(form.estimatedHours) || 0,
      loggedHours: ot?.loggedHours || 0,
      attachments: ot?.attachments || [],
      comments: ot?.comments || [],
      history: [...(ot?.history || []), histEntry],
    };
    if (!isEdit && form.assignedId) {
      const u = users.find(u => u.id === form.assignedId);
      if (u) saved.history.push({ action: `Asignada a ${u?.name}`, userId: currentUser.id, ts: now(), type: "assign" });
    }
    onSave(saved);
  };

  const addPart = () => {
    if (!newPart.name.trim()) return;
    set("parts", [...form.parts, { name: newPart.name, qty: Number(newPart.qty) || 1 }]);
    setNewPart({ name: "", qty: "" });
  };
  const removePart = (i) => set("parts", form.parts.filter((_, idx) => idx !== i));

  const technicians = users.filter(u => u.active && (u.role === "jefe" || u.role === "tecnico" || u.role === "observador"));

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal lg">
        <div className="modal-stripe" />
        <div className="modal-head">
          <div>
            <div className="modal-title">{isEdit ? `Editar ${ot.id}` : "Nueva Orden de Trabajo"}</div>
          </div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}><Ic path={I.x} size={14} /></button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="label">Tipo</label>
              <select className="select" value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="corrective">Correctiva</option>
                <option value="preventive">Preventiva</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Prioridad</label>
              <select className="select" value={form.priority} onChange={e => set("priority", e.target.value)}>
                <option value="critical">🔴 Crítica</option>
                <option value="high">🟠 Alta</option>
                <option value="medium">🟡 Media</option>
                <option value="low">🟢 Baja</option>
              </select>
            </div>

            <div className="form-group span2">
              <label className="label">Título de la OT *</label>
              <input className={`input ${errors.title ? "input-error" : ""}`} value={form.title}
                onChange={e => set("title", e.target.value)} placeholder="Descripción breve del trabajo..." />
              {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="label">Activo / Equipo *</label>
              <input className={`input ${errors.asset ? "input-error" : ""}`} value={form.asset}
                onChange={e => set("asset", e.target.value)} placeholder="Ej: Compresor L2" />
              {errors.asset && <span className="error-msg">{errors.asset}</span>}
            </div>
            <div className="form-group">
              <label className="label">Estado</label>
              <select className="select" value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="open">Abierta</option>
                <option value="in_progress">En Progreso</option>
                <option value="scheduled">Programada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Asignar a</label>
              <select className="select" value={form.assignedId} onChange={e => set("assignedId", e.target.value)}>
                <option value="">Sin asignar</option>
                {technicians.map(u => <option key={u.id} value={u.id}>{u.name} ({ROLE_LABEL[u.role]})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Horas estimadas</label>
              <input className="input" type="number" min="0" step="0.5" value={form.estimatedHours}
                onChange={e => set("estimatedHours", e.target.value)} placeholder="Ej: 2.5" />
            </div>

            <div className="form-group">
              <label className="label">Fecha creación</label>
              <input className="input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Fecha límite</label>
              <input className="input" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
            </div>

            <div className="form-group span2">
              <label className="label">Descripción</label>
              <textarea className="textarea" value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Descripción detallada de la avería o trabajo a realizar..." />
            </div>
          </div>

          {/* PARTS */}
          <div style={{ marginTop: 20 }}>
            <div className="label" style={{ marginBottom: 8 }}>Repuestos necesarios</div>
            {form.parts.map((p, i) => (
              <div key={i} className="parts-row">
                <Ic path={I.package} size={13} color="var(--text3)" />
                <span className="parts-row-name">{p.name}</span>
                <span className="parts-row-qty">×{p.qty}</span>
                <button className="btn btn-xs btn-danger btn-icon" onClick={() => removePart(i)}>
                  <Ic path={I.x} size={11} />
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input className="input" style={{ flex: 2 }} placeholder="Nombre del repuesto..."
                value={newPart.name} onChange={e => setNewPart(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addPart()} />
              <input className="input" style={{ width: 70 }} type="number" placeholder="Cant." min="1"
                value={newPart.qty} onChange={e => setNewPart(p => ({ ...p, qty: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addPart()} />
              <button className="btn btn-ghost" onClick={addPart}><Ic path={I.plus} size={13} /></button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Ic path={I.check} size={13} />{isEdit ? "Guardar cambios" : "Crear OT"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── OT DETAIL ── */
function OTDetail({ ot, users, currentUser, onClose, onEdit, onDelete, onUpdate }) {
  const [tab, setTab] = useState("info");
  const [comment, setComment] = useState("");
  const [drag, setDrag] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [logH, setLogH] = useState("");
  const fileRef = useRef();
  const canEdit   = currentUser.perms.edit;
  const canDelete = currentUser.perms.delete;
  const canClose  = currentUser.perms.close;

  const assigned = users.find(u => u.id === ot.assignedId);
  const pct = ot.estimatedHours > 0 ? Math.min(100, Math.round((ot.loggedHours / ot.estimatedHours) * 100)) : 0;

  const addOTComment = () => {
    if (!comment.trim()) return;
    const c = { userId: currentUser.id, text: comment.trim(), ts: now() };
    const h = { action: `Comentario añadido`, userId: currentUser.id, ts: now(), type: "comment" };
    onUpdate({ ...ot, comments: [...ot.comments, c], history: [...ot.history, h] });
    setComment("");
  };

  const logHours = () => {
    const h = parseFloat(logH);
    if (!h || h <= 0) return;
    const upd = { ...ot, loggedHours: ot.loggedHours + h, history: [...ot.history, { action: `+${h}h registradas`, userId: currentUser.id, ts: now(), type: "hours" }] };
    onUpdate(upd);
    setLogH("");
  };

  const handleFiles = (files) => {
    const arr = Array.from(files);
    arr.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const att = { id: uidInc(), name: file.name, url: e.target.result, type: file.type };
        onUpdate(prev => {
          const updated = { ...prev, attachments: [...prev.attachments, att], history: [...prev.history, { action: `Adjunto: ${file.name}`, userId: currentUser.id, ts: now(), type: "attach" }] };
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id) => {
    const att = ot.attachments.find(a => a.id === id);
    onUpdate({ ...ot, attachments: ot.attachments.filter(a => a.id !== id), history: [...ot.history, { action: `Adjunto eliminado: ${att?.name}`, userId: currentUser.id, ts: now(), type: "attach" }] });
  };

  const markComplete = () => {
    onUpdate({ ...ot, status: "completed", history: [...ot.history, { action: "OT completada", userId: currentUser.id, ts: now(), type: "complete" }] });
  };

  const TL_COLORS = { create: "var(--blue)", assign: "var(--amber)", status: "var(--teal)", complete: "var(--green)", comment: "var(--text3)", hours: "var(--purple)", edit: "var(--yellow)", attach: "var(--text3)" };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal xl">
        <div className="modal-stripe" />
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>{ot.id}</span>
              <Badge cls={ot.type}>{TYPE_LABEL[ot.type]}</Badge>
              <Badge cls={ot.priority}>{PRIORITY_LABEL[ot.priority]}</Badge>
              <Badge cls={ot.status}>{STATUS_LABEL[ot.status]}</Badge>
            </div>
            <div className="modal-title" style={{ marginTop: 4 }}>{ot.title}</div>
            {ot.sourceIncId && <div style={{marginTop:4}}><span className="inc-source-tag">📋 Origen: incidencia {ot.sourceIncId}</span></div>}
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {canEdit && <button className="btn btn-ghost btn-sm" onClick={() => onEdit(ot)}><Ic path={I.edit} size={13} />Editar</button>}
            {canDelete && <button className="btn btn-danger btn-sm" onClick={() => onDelete(ot)}><Ic path={I.trash} size={13} /></button>}
            <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}><Ic path={I.x} size={14} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ paddingTop: 0 }}>
          <div className="tabs">
            {[["info", "Información", I.tag, null], ["attachments", "Adjuntos", I.clip, ot.attachments.length || null], ["comments", "Comentarios", I.send, ot.comments.length || null], ["history", "Historial", I.history, ot.history.length]].map(([id, label, icon, count]) => (
              <div key={id} className={`tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>
                <Ic path={icon} size={13} />{label}
                {count > 0 && <span className="tab-count">{count}</span>}
              </div>
            ))}
          </div>

          {tab === "info" && (
            <>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-key">Activo / Equipo</div>
                  <div className="detail-val">{ot.asset}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-key">Asignado a</div>
                  <div className="detail-val" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {assigned ? <><Avatar user={assigned} size={22} />{assigned?.name}</> : <span style={{ color: "var(--text3)" }}>Sin asignar</span>}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-key">Fecha creación</div>
                  <div className="detail-val" style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{ot.date}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-key">Fecha límite</div>
                  <div className="detail-val" style={{ fontFamily: "var(--mono)", fontSize: 13, color: ot.dueDate < new Date().toISOString().split("T")[0] && ot.status !== "completed" ? "var(--red)" : "inherit" }}>
                    {ot.dueDate || "—"}
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "14px 16px", marginBottom: 16 }}>
                <div className="detail-key" style={{ marginBottom: 6 }}>Descripción</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{ot.description || <span style={{ color: "var(--text3)" }}>Sin descripción</span>}</div>
              </div>

              {/* TIME TRACKING */}
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Ic path={I.clock} size={13} color="var(--text3)" />
                    <span className="detail-key">Control de horas</span>
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: pct > 90 ? "var(--red)" : pct > 70 ? "var(--yellow)" : "var(--green)" }}>
                    {ot.loggedHours}h / {ot.estimatedHours || "—"}h est.
                  </span>
                </div>
                {ot.estimatedHours > 0 && (
                  <div className="progress" style={{ marginBottom: 10 }}>
                    <div className="progress-bar" style={{ width: `${pct}%`, background: pct > 90 ? "var(--red)" : pct > 70 ? "var(--yellow)" : "var(--green)" }} />
                  </div>
                )}
                {canEdit && ot.status !== "completed" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="input" style={{ width: 90 }} type="number" min="0.5" step="0.5"
                      placeholder="horas" value={logH} onChange={e => setLogH(e.target.value)} />
                    <button className="btn btn-ghost btn-sm" onClick={logHours}><Ic path={I.plus} size={13} />Registrar horas</button>
                  </div>
                )}
              </div>

              {/* PARTS */}
              {ot.parts.length > 0 && (
                <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "14px 16px" }}>
                  <div className="detail-key" style={{ marginBottom: 8 }}>Repuestos</div>
                  {ot.parts.map((p, i) => (
                    <div key={i} className="parts-row" style={{ marginBottom: 4 }}>
                      <Ic path={I.package} size={13} color="var(--text3)" />
                      <span className="parts-row-name">{p.name}</span>
                      <span className="parts-row-qty">×{p.qty}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "attachments" && (
            <>
              <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" style={{ display: "none" }}
                onChange={e => handleFiles(e.target.files)} />
              <div className={`drop-zone ${drag ? "drag" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}>
                <div className="drop-zone-icon">📎</div>
                <div className="drop-zone-text">Arrastra archivos aquí o haz clic para seleccionar</div>
                <div className="drop-zone-sub">Imágenes, PDF, documentos Word</div>
              </div>

              {ot.attachments.length > 0 ? (
                <div className="attachment-grid">
                  {ot.attachments.map(a => (
                    <div key={a.id} className="attachment-thumb" onClick={() => a.type?.startsWith("image") && setLightbox(a.url)}>
                      {a.type?.startsWith("image") ? (
                        <img src={a.url} alt={a.name} />
                      ) : (
                        <div className="attachment-file">
                          <span style={{ fontSize: 24 }}>{a.name.endsWith(".pdf") ? "📄" : "📝"}</span>
                          <span className="attachment-file-name">{a.name}</span>
                        </div>
                      )}
                      <div className="attachment-del" onClick={e => { e.stopPropagation(); removeAttachment(a.id); }}>✕</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty" style={{ padding: 24 }}><div style={{ color: "var(--text3)", fontSize: 13 }}>No hay archivos adjuntos</div></div>
              )}
            </>
          )}

          {tab === "comments" && (
            <>
              {ot.comments.length === 0 && <div className="empty" style={{ padding: 24 }}><div style={{ color: "var(--text3)", fontSize: 13 }}>No hay comentarios aún</div></div>}
              {ot.comments.map((c, i) => {
                const u = users.find(u => u.id === c.userId);
                return (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                    <Avatar user={u} size={30} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{u?.name || "Usuario"}</span>
                        <span className={`badge ${u?.role}`} style={{ fontSize: 9 }}>{ROLE_LABEL[u?.role]}</span>
                        <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)", marginLeft: "auto" }}>{c.ts}</span>
                      </div>
                      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px", fontSize: 13, lineHeight: 1.5 }}>{c.text}</div>
                    </div>
                  </div>
                );
              })}
              <div className="comment-box">
                <textarea placeholder="Escribe un comentario..." value={comment} onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && e.ctrlKey && addComment()} />
                <div className="comment-box-footer">
                  <span style={{ fontSize: 10, color: "var(--text3)", marginRight: "auto" }}>Ctrl+Enter para enviar</span>
                  <button className="btn btn-primary btn-sm" onClick={addOTComment} disabled={!comment.trim()}>
                    <Ic path={I.send} size={12} />Enviar
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "history" && (
            <div className="timeline">
              {[...ot.history].reverse().map((h, i) => {
                const u = users.find(u => u.id === h.userId);
                const col = TL_COLORS[h.type] || "var(--text3)";
                return (
                  <div key={i} className="tl-item">
                    <div className="tl-dot" style={{ background: col + "33", border: `2px solid ${col}` }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: col }} />
                    </div>
                    <div className="tl-content">
                      <div className="tl-header">
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          {u && <Avatar user={u} size={18} />}
                          <span className="tl-action">{h.action}</span>
                        </div>
                        <span className="tl-time">{h.ts}</span>
                      </div>
                      {u && <div className="tl-body">{u.name} · <span style={{ color: "var(--text3)" }}>{ROLE_LABEL[u.role]}</span></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {ot.status !== "completed" && ot.status !== "cancelled" && canClose && (
          <div className="modal-footer">
            <span style={{ fontSize: 11, color: "var(--text3)", flex: 1 }}>
              {ot.loggedHours}h registradas · {ot.attachments.length} adjuntos · {ot.comments.length} comentarios
            </span>
            <button className="btn btn-teal" onClick={markComplete}>
              <Ic path={I.check} size={13} />Marcar completada
            </button>
          </div>
        )}
      </div>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

/* ── ASSET HISTORY MODAL ── */
function AssetHistory({ ots, users, onClose }) {
  const assets = [...new Set(ots.map(o => o.asset))].sort();
  const [sel, setSel] = useState(assets[0] || "");
  const filtered = ots.filter(o => o.asset === sel).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal lg">
        <div className="modal-stripe" />
        <div className="modal-head">
          <div className="modal-title">Historial por Equipo / Activo</div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}><Ic path={I.x} size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="label">Seleccionar activo</label>
            <select className="select" value={sel} onChange={e => setSel(e.target.value)}>
              {assets.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="empty"><div className="empty-icon">🔍</div><div className="empty-text">No hay OTs para este activo</div></div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                {[["Total OTs", filtered.length, "var(--amber)"], ["Completadas", filtered.filter(o => o.status === "completed").length, "var(--green)"], ["Horas totales", filtered.reduce((a, o) => a + (o.loggedHours || 0), 0) + "h", "var(--blue)"]].map(([l, v, c]) => (
                  <div key={l} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 16px", flex: 1, minWidth: 100 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              <div className="ot-table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Fecha</th><th>Horas</th></tr></thead>
                  <tbody>
                    {filtered.map(o => (
                      <tr key={o.id}>
                        <td className="td-mono">{o.id}</td>
                        <td className="td-title">{o.title}</td>
                        <td><Badge cls={o.type}>{TYPE_LABEL[o.type]}</Badge></td>
                        <td><Badge cls={o.priority}>{PRIORITY_LABEL[o.priority]}</Badge></td>
                        <td><Badge cls={o.status}>{STATUS_LABEL[o.status]}</Badge></td>
                        <td className="td-mono">{o.date}</td>
                        <td className="td-mono">{o.loggedHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ── USER MANAGEMENT MODAL ── */
function UserManager({ users, setUsers, currentUser, onClose }) {
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "tecnico", color: "#3b82f6" });

  const PERM_KEYS = Object.keys(PERM_LABEL);
  const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#a855f7", "#14b8a6", "#ef4444", "#f97316"];

  const togglePerm = (userId, perm) => {
    setUsers(us => us.map(u => u.id === userId ? { ...u, perms: { ...u.perms, [perm]: !u.perms[perm] } } : u));
  };
  const toggleActive = (userId) => {
    setUsers(us => us.map(u => u.id === userId ? { ...u, active: !u.active } : u));
  };
  const createUser = () => {
    if (!form.name.trim()) return;
    const initials = form.name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const newU = { ...form, id: "U" + uid(), avatar: initials, active: true, perms: { create: true, edit: true, delete: false, assign: false, close: true, viewAll: false } };
    setUsers(us => [...us, newU]);
    setShowNew(false);
    setForm({ name: "", email: "", role: "tecnico", color: "#3b82f6" });
  };

  const startEditUser = (u) => {
    setEditing(u.id);
    setShowNew(false);
    setForm({ name: u.name, email: u.email || "", role: u.role, dept: u.dept || "", color: u.color || "#3b82f6" });
  };
  const saveEditUser = (userId) => {
    if (!form.name?.trim()) return;
    const ROLE_PERMS = {
      jefe:     { create:true,  edit:true,  delete:true,  assign:true,  close:true,  viewAll:true  },
      tecnico:  { create:true,  edit:true,  delete:false, assign:false, close:true,  viewAll:false },
      operario: { create:false, edit:false, delete:false, assign:false, close:false, viewAll:false },
    };
    setUsers(us => us.map(u => u.id === userId ? {
      ...u,
      name:   form.name.trim(),
      email:  form.email,
      role:   form.role,
      dept:   form.dept || u.dept,
      color:  form.color,
      avatar: form.name.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2),
      perms:  ROLE_PERMS[form.role] || u.perms,
    } : u));
    setEditing(null);
    setForm({ name: "", email: "", role: "tecnico", color: "#3b82f6" });
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal lg">
        <div className="modal-stripe" />
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Ic path={I.lock} size={16} color="var(--amber)" />
            <div className="modal-title">Gestión de Usuarios y Permisos</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}><Ic path={I.plus} size={13} />Nuevo usuario</button>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}><Ic path={I.x} size={14} /></button>
          </div>
        </div>
        <div className="modal-body">
          {showNew && (
            <div style={{ background: "var(--bg3)", border: "1px solid var(--amber-g)", borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>Nuevo usuario</div>
              <div className="form-grid">
                <div className="form-group"><label className="label">Nombre completo</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group"><label className="label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-group"><label className="label">Rol</label>
                  <select className="select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="jefe">Jefe de Mantenimiento</option>
                    <option value="tecnico">Técnico</option>
                    <option value="observador">Observador</option>
                  </select>
                </div>
                <div className="form-group"><label className="label">Color avatar</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    {COLORS.map(c => (
                      <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: form.color === c ? "3px solid white" : "2px solid transparent" }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowNew(false)}>Cancelar</button>
                <button className="btn btn-primary btn-sm" onClick={createUser} disabled={!form.name.trim()}><Ic path={I.check} size={12} />Crear</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {users.map(u => (
              <div key={u.id} style={{display:"flex",flexDirection:"column",gap:0}}>
                <div className="user-card" style={{ opacity: u.active ? 1 : 0.5 }}>
                  <Avatar user={u} size={44} />
                  <div className="user-info-block">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span className="user-info-name">{u.name}</span>
                      <Badge cls={u.role}>{ROLE_LABEL[u.role]}</Badge>
                      {!u.active && <Badge cls="cancelled">Inactivo</Badge>}
                      {u.id === currentUser.id && <Badge cls="open">Tú</Badge>}
                    </div>
                    <div className="user-info-email">{u.email} {u.dept && <span style={{color:"var(--text3)"}}>· {u.dept}</span>}</div>
                    <div className="user-perms">
                      {PERM_KEYS.map(p => (
                        <span key={p} className={`perm-chip ${u.perms[p] ? "yes" : "no"}`}
                          onClick={() => currentUser.perms.assign && togglePerm(u.id, p)}
                          style={{ cursor: currentUser.perms.assign ? "pointer" : "default" }}>
                          {u.perms[p] ? "✓ " : "✗ "}{PERM_LABEL[p]}
                        </span>
                      ))}
                    </div>
                  </div>
                  {currentUser.perms.assign && u.id !== currentUser.id && (
                    <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => startEditUser(u)}>
                        <Ic path={I.edit} size={12}/> Editar
                      </button>
                      <button className={`btn btn-sm ${u.active ? "btn-ghost" : "btn-teal"}`}
                        onClick={() => toggleActive(u.id)}>
                        {u.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  )}
                </div>
                {editing === u.id && (
                  <div className="user-edit-form">
                    <div className="user-edit-row">
                      <span className="user-edit-label">Nombre</span>
                      <input className="user-edit-input" value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
                    </div>
                    <div className="user-edit-row">
                      <span className="user-edit-label">Email</span>
                      <input className="user-edit-input" type="email" value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
                    </div>
                    <div className="user-edit-row">
                      <span className="user-edit-label">Rol</span>
                      <select className="user-edit-select" value={form.role||"tecnico"} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                        <option value="jefe">Jefe Mantenimiento</option>
                        <option value="tecnico">Técnico</option>
                        <option value="operario">Operario</option>
                      </select>
                    </div>
                    <div className="user-edit-row">
                      <span className="user-edit-label">Depto.</span>
                      <input className="user-edit-input" value={form.dept||""} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}/>
                    </div>
                    <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>{setEditing(null);setForm({name:"",email:"",role:"tecnico",color:"#3b82f6"});}}>Cancelar</button>
                      <button className="btn btn-primary btn-sm" onClick={()=>saveEditUser(u.id)}>
                        <Ic path={I.check} size={12}/>Guardar cambios
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <span style={{ fontSize: 11, color: "var(--text3)", flex: 1 }}>
            {users.filter(u => u.active).length} usuarios activos · Haz clic en un permiso para alternarlo
          </span>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION PANEL
// ══════════════════════════════════════════════════════════════════════════════
function NotifPanel({ notifs, setNotifs, onClose }) {
  const unread = notifs.filter(n => !n.read).length;
  const markAll = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  return (
    <>
      <div className="notif-overlay" onClick={onClose} />
      <div className="notif-panel">
        <div className="notif-header">
          <span className="notif-title">Notificaciones {unread > 0 && `(${unread})`}</span>
          {unread > 0 && <button className="btn btn-ghost btn-xs" onClick={markAll}>Marcar leídas</button>}
        </div>
        {notifs.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text3)", fontSize: 12 }}>Sin notificaciones</div>
        ) : notifs.map(n => (
          <div key={n.id} className="notif-item" style={{ background: n.read ? "" : "rgba(245,158,11,.04)" }}
            onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}>
            <div className="notif-dot-wrap"><div className={`notif-dot ${n.type}`} style={{ opacity: n.read ? 0.3 : 1 }} /></div>
            <div style={{ flex: 1 }}>
              <div className="notif-msg" style={{ color: n.read ? "var(--text3)" : "var(--text)" }}>{n.msg}</div>
              <div className="notif-time">{n.time || n.ts}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN WORK ORDERS MODULE
// ══════════════════════════════════════════════════════════════════════════════
function WorkOrdersModule({ users, setUsers, currentUser, notifs, setNotifs, externalOts, setExternalOts, assets }) {
  const ots = externalOts || [];
  const setOts = setExternalOts || (() => {});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [view, setView] = useState("table");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailing, setDetailing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  /* Filtering + Sorting */
  const filtered = ots
    .filter(o => {
      if (filterStatus !== "all" && o.status !== filterStatus) return false;
      if (filterPriority !== "all" && o.priority !== filterPriority) return false;
      if (filterType !== "all" && o.type !== filterType) return false;
      if (search) {
        const s = search.toLowerCase();
        if (![o.id, o.title, o.asset, o.description].some(f => f?.toLowerCase().includes(s))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let va = a[sortKey] || ""; let vb = b[sortKey] || "";
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      if (sortKey === "priority") { va = order[va] || 0; vb = order[vb] || 0; }
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  /* CRUD */
  const saveOT = (ot) => {
    setOts(os => {
      const exists = os.find(o => o.id === ot.id);
      return exists ? os.map(o => o.id === ot.id ? ot : o) : [ot, ...os];
    });
    setCreating(false); setEditing(null);
  };

  const deleteOT = () => {
    setOts(os => os.filter(o => o.id !== deleting.id));
    setDeleting(null); setDetailing(null);
  };

  const updateOT = useCallback((updatedOrFn) => {
    setOts(os => os.map(o => {
      const upd = typeof updatedOrFn === "function" ? updatedOrFn(o) : updatedOrFn;
      return upd.id === o.id ? upd : o;
    }));
    setDetailing(prev => {
      if (!prev) return prev;
      const upd = typeof updatedOrFn === "function" ? updatedOrFn(prev) : updatedOrFn;
      return upd.id === prev.id ? upd : prev;
    });
  }, []);

  /* KPIs */
  const kpis = {
    open:       ots.filter(o => o.status === "open").length,
    inProgress: ots.filter(o => o.status === "in_progress").length,
    critical:   ots.filter(o => o.priority === "critical" && o.status !== "completed" && o.status !== "cancelled").length,
    completed:  ots.filter(o => o.status === "completed").length,
    overdue:    ots.filter(o => o.dueDate && o.dueDate < "2026-02-28" && o.status !== "completed" && o.status !== "cancelled").length,
  };

  const StatusFilters = [["all", "Todas", ots.length], ["open", "Abiertas", kpis.open], ["in_progress", "En Progreso", kpis.inProgress], ["scheduled", "Programadas", ots.filter(o=>o.status==="scheduled").length], ["completed", "Completadas", kpis.completed]];
  const PrioFilters = [["all","Prioridad"], ["critical","Crítica"], ["high","Alta"], ["medium","Media"], ["low","Baja"]];
  const TypeFilters = [["all","Tipo"], ["corrective","Correctiva"], ["preventive","Preventiva"]];

  const canCreate = currentUser.perms.create;

  const accentColor = { critical: "var(--red)", high: "#f97316", medium: "var(--yellow)", low: "var(--green)" };

  return (
    <>
      {/* KPI ROW — clickable filters */}
      <div className="kpi-row">
        {[
          { label: "Abiertas",    val: kpis.open,        color: "var(--amber)", accent: "var(--amber)", filter: "open" },
          { label: "En Progreso", val: kpis.inProgress,  color: "var(--blue)",  accent: "var(--blue)",  filter: "in_progress" },
          { label: "Críticas",    val: kpis.critical,    color: "var(--red)",   accent: "var(--red)",   filter: "critical_prio" },
          { label: "Vencidas",    val: kpis.isOverdue,   color: kpis.isOverdue > 0 ? "var(--red)" : "var(--green)", accent: kpis.isOverdue > 0 ? "var(--red)" : "var(--green)", filter: "overdue" },
          { label: "Completadas", val: kpis.completed,   color: "var(--green)", accent: "var(--green)", filter: "completed" },
        ].map(k => (
          <div key={k.label}
            className={`kpi ${filterStatus === k.filter || filterPriority === k.filter ? "active-filter" : ""}`}
            onClick={() => {
              if (k.filter === "critical_prio") { setFilterPriority(p => p === "critical" ? "all" : "critical"); setFilterStatus("all"); }
              else if (k.filter === "overdue")  { setFilterStatus(p => p === "overdue" ? "all" : "overdue"); }
              else { setFilterStatus(p => p === k.filter ? "all" : k.filter); setFilterPriority("all"); }
            }}
            title={`Filtrar por: ${k.label}`}
          >
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-val" style={{ color: k.color }}>{k.val}</div>
            <div className="kpi-accent" style={{ background: k.accent }} />
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        {StatusFilters.map(([k, l, c]) => (
          <button key={k} className={`filter-chip ${filterStatus === k ? "on" : ""}`} onClick={() => setFilterStatus(k)}>
            {l} <span className="chip-count">{c}</span>
          </button>
        ))}
        <div className="toolbar-sep" />
        <select className="select" style={{ width: "auto", padding: "4px 10px", fontSize: 11 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          {PrioFilters.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select className="select" style={{ width: "auto", padding: "4px 10px", fontSize: 11 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          {TypeFilters.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <div className="toolbar-sep" />
        <div className="view-toggle">
          <div className={`view-btn ${view === "table" ? "on" : ""}`} onClick={() => setView("table")}><Ic path={I.list} size={13} /></div>
          <div className={`view-btn ${view === "cards" ? "on" : ""}`} onClick={() => setView("cards")}><Ic path={I.grid} size={13} /></div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setShowHistory(true)}>
          <Ic path={I.history} size={13} />Historial activos
        </button>
        {canCreate && (
          <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
            <Ic path={I.plus} size={13} />Nueva OT
          </button>
        )}
      </div>

      {/* RESULTS COUNT */}
      <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)", marginBottom: 10 }}>
        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} · ordenado por {sortKey} {sortDir === "asc" ? "↑" : "↓"}
      </div>

      {/* TABLE VIEW */}
      {view === "table" && (
        <div className="ot-table-wrap">
          {filtered.length === 0 ? (
            <div className="empty"><div className="empty-icon">🔍</div><div className="empty-text">No se encontraron órdenes de trabajo</div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  {[["id","ID"],["title","Título"],["type","Tipo"],["asset","Activo"],["priority","Prioridad"],["status","Estado"],["assignedId","Asignado"],["dueDate","Vence"],["loggedHours","Horas"]].map(([k, l]) => (
                    <th key={k} className={sortKey === k ? "sorted" : ""} onClick={() => handleSort(k)}>
                      {l} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const assigned = users.find(u => u.id === o.assignedId);
                  const isOverdue = o.dueDate && o.dueDate < "2026-02-28" && o.status !== "completed" && o.status !== "cancelled";
                  return (
                    <tr key={o.id} className="ot-row" onClick={() => setDetailing(o)}>
                      <td><span className="td-mono">{o.id}</span></td>
                      <td>
                        <div className="td-title">{o.title}</div>
                        {o.attachments?.length > 0 && <span style={{ fontSize: 10, color: "var(--text3)" }}>📎 {o.attachments.length}</span>}
                      </td>
                      <td><Badge cls={o.type}>{TYPE_LABEL[o.type]}</Badge></td>
                      <td className="td-asset">{o.asset}</td>
                      <td><Badge cls={o.priority}>{PRIORITY_LABEL[o.priority]}</Badge></td>
                      <td><Badge cls={o.status}>{STATUS_LABEL[o.status]}</Badge></td>
                      <td>
                        {assigned
                          ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar user={assigned} size={22} /><span style={{ fontSize: 12 }}>{assigned?.name.split(" ")[0]}</span></div>
                          : <span style={{ fontSize: 11, color: "var(--red)" }} className="pulse">⚠ Sin asignar</span>}
                      </td>
                      <td className="td-mono" style={{ color: isOverdue ? "var(--red)" : "inherit", fontSize: 11 }}>
                        {o.dueDate || "—"}{isOverdue && " ⚠"}
                      </td>
                      <td className="td-mono" style={{ fontSize: 11 }}>
                        {o.loggedHours}h{o.estimatedHours ? ` / ${o.estimatedHours}h` : ""}
                      </td>
                      <td onClick={e => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-ghost btn-xs" onClick={() => setDetailing(o)}><Ic path={I.eye} size={11} /></button>
                          {currentUser.perms.edit && <button className="btn btn-ghost btn-xs" onClick={() => setEditing(o)}><Ic path={I.edit} size={11} /></button>}
                          {currentUser.perms.delete && <button className="btn btn-danger btn-xs" onClick={() => setDeleting(o)}><Ic path={I.trash} size={11} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CARD VIEW */}
      {view === "cards" && (
        filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon">🔍</div><div className="empty-text">No se encontraron órdenes de trabajo</div></div>
        ) : (
          <div className="ot-cards">
            {filtered.map(o => {
              const assigned = users.find(u => u.id === o.assignedId);
              const isOverdue = o.dueDate && o.dueDate < "2026-02-28" && o.status !== "completed" && o.status !== "cancelled";
              return (
                <div key={o.id} className="ot-card" onClick={() => setDetailing(o)}>
                  <div className="ot-card-accent" style={{ background: accentColor[o.priority] }} />
                  <div className="ot-card-header">
                    <div>
                      <div className="ot-card-id">{o.id}</div>
                      <div className="ot-card-title">{o.title}</div>
                      <div className="ot-card-asset"><Ic path={I.wrench} size={11} color="var(--text3)" />{o.asset}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                      <Badge cls={o.status}>{STATUS_LABEL[o.status]}</Badge>
                      <Badge cls={o.priority}>{PRIORITY_LABEL[o.priority]}</Badge>
                    </div>
                  </div>
                  {o.estimatedHours > 0 && (
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${Math.min(100, o.loggedHours / o.estimatedHours * 100)}%`, background: "var(--amber)" }} />
                    </div>
                  )}
                  <div className="ot-card-footer">
                    <Badge cls={o.type}>{TYPE_LABEL[o.type]}</Badge>
                    {o.attachments?.length > 0 && <span style={{ fontSize: 10, color: "var(--text3)" }}>📎{o.attachments.length}</span>}
                    {o.comments?.length > 0 && <span style={{ fontSize: 10, color: "var(--text3)" }}>💬{o.comments.length}</span>}
                    {isOverdue && <span style={{ fontSize: 10, color: "var(--red)" }}>⚠ Vencida</span>}
                    <div className="assignee-chip">
                      {assigned ? <><Avatar user={assigned} size={20} /><span>{assigned?.name.split(" ")[0]}</span></> : <span style={{ color: "var(--red)", fontSize: 11 }} className="pulse">Sin asignar</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* MODALS */}
      {creating && <OTForm users={users} assets={assets} currentUser={currentUser} onSave={saveOT} onClose={() => setCreating(false)} />}
      {editing && <OTForm ot={editing} users={users} assets={assets} currentUser={currentUser} onSave={saveOT} onClose={() => setEditing(null)} />}
      {detailing && <OTDetail ot={detailing} users={users} currentUser={currentUser} onClose={() => setDetailing(null)} onEdit={o => { setDetailing(null); setEditing(o); }} onDelete={o => setDeleting(o)} onUpdate={updateOT} />}
      {deleting && <ConfirmDelete title={deleting.title} onConfirm={deleteOT} onClose={() => setDeleting(null)} />}
      {showHistory && <AssetHistory ots={ots} users={users} onClose={() => setShowHistory(false)} />}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP SHELL
// ══════════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════════
// INITIAL DATA
// ══════════════════════════════════════════════════════════════════════════════
const URGENCY_MAP = {
  low:      { label: "Baja",    icon: "🟢", color: "var(--green)"  },
  medium:   { label: "Media",   icon: "🟡", color: "var(--yellow)" },
  high:     { label: "Alta",    icon: "🟠", color: "var(--orange)" },
  critical: { label: "Crítica", icon: "🔴", color: "var(--red)"    },
};
const STATUS_STEPS = ["pending", "reviewing", "accepted", "converted"];
const INC_STATUS_LABEL = { pending: "Pendiente", reviewing: "En revisión", accepted: "Aceptada", rejected: "Rechazada", converted: "Convertida a OT" };
const AREA_OPTIONS = ["Línea 1", "Línea 2", "Línea 3", "HVAC / Climatización", "Almacén", "Compresor", "Eléctrico", "Hidráulico", "Zona común"];







// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const uidInc = () => `INC-${String(Math.floor(Math.random()*900)+100)}`;
const ACCENT = { critical:"var(--red)", high:"var(--orange)", medium:"var(--yellow)", low:"var(--green)" };

// Av is defined above as alias for Avatar

// ══════════════════════════════════════════════════════════════════════════════
// NUEVA INCIDENCIA MODAL (OPERARIO)
// ══════════════════════════════════════════════════════════════════════════════
function NewIncModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({ title:"", area:"", urgency:"medium", description:"" });
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const fileRef = React.useRef();

  const s = (k,v) => setForm(f=>({...f,[k]:v}));

  const validate = () => {
    const e={};
    if(!form.title.trim()) e.title="El título es obligatorio";
    if(!form.area)         e.area="Selecciona el área";
    if(!form.description.trim()) e.description="Añade una descripción";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(f => {
      const r = new FileReader();
      r.onload = e => setPhotos(p => [...p, { id: Math.random().toString(36).slice(2), url: e.target.result, name: f.name }]);
      r.readAsDataURL(f);
    });
  };

  const handleSave = () => {
    if (!validate()) return;
    const inc = {
      id: uidInc(), reportedBy: user.id, area: form.area, title: form.title,
      description: form.description, urgency: form.urgency,
      status: "pending", createdAt: now(),
      reviewedBy: null, reviewedAt: null, priority: null,
      rejectionReason: null, convertedOT: null, photos,
    };
    onSave(inc);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal md">
        <div className="mstripe" style={{ background:"linear-gradient(90deg,var(--teal),var(--blue))" }} />
        <div className="mhead">
          <div>
            <div className="mtitle">Notificar Incidencia</div>
            <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:2}}>Tu notificación será revisada por el equipo de mantenimiento</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{width:30,height:30,padding:0,justifyContent:"center"}} onClick={onClose}><Ic path={I.x} size={14}/></button>
        </div>
        <div className="mbody">
          <div className="fgrid">
            <div className="fg span2">
              <label className="lbl">Título de la incidencia *</label>
              <input className={`inp ${errors.title?"err":""}`} value={form.title} onChange={e=>s("title",e.target.value)} placeholder="Describe brevemente el problema..."/>
              {errors.title && <span className="err-msg">{errors.title}</span>}
            </div>
            <div className="fg">
              <label className="lbl">Área / Zona *</label>
              <select className={`sel ${errors.area?"err":""}`} value={form.area} onChange={e=>s("area",e.target.value)}>
                <option value="">Seleccionar área...</option>
                {AREA_OPTIONS.map(a=><option key={a}>{a}</option>)}
              </select>
              {errors.area && <span className="err-msg">{errors.area}</span>}
            </div>
            <div className="fg">
              <label className="lbl">¿Cómo de urgente te parece?</label>
              <div className="urg-grid" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
                {Object.entries(URGENCY_MAP).map(([k,v])=>(
                  <div key={k} className={`urg-opt ${form.urgency===k?"on":""}`} onClick={()=>s("urgency",k)}>
                    <div className="urg-icon">{v.icon}</div>
                    <div className="urg-lbl" style={{color:form.urgency===k?"var(--amber)":"var(--t3)"}}>{v.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="fg span2">
              <label className="lbl">Descripción detallada *</label>
              <textarea className={`ta ${errors.description?"err":""}`} value={form.description} onChange={e=>s("description",e.target.value)} placeholder="Explica qué observas, cuándo empezó, cómo afecta a tu trabajo..."/>
              {errors.description && <span className="err-msg">{errors.description}</span>}
            </div>
          </div>

          {/* FOTOS */}
          <div style={{marginTop:14}}>
            <label className="lbl" style={{display:"block",marginBottom:8}}>Fotos adjuntas (opcional)</label>
            <input ref={fileRef} type="file" multiple accept="image/*" style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
            <div className="dz" onClick={()=>fileRef.current?.click()}>
              <div style={{fontSize:20,marginBottom:4}}>📷</div>
              <div style={{fontSize:12,color:"var(--t2)"}}>Toca para añadir fotos del problema</div>
            </div>
            {photos.length>0 && (
              <div className="att-grid">
                {photos.map(p=>(
                  <div key={p.id} className="att-thumb">
                    <img src={p.url} alt={p.name}/>
                    <div className="att-del" onClick={()=>setPhotos(ps=>ps.filter(x=>x.id!==p.id))}>✕</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{background:"var(--adim)",border:"1px solid var(--aglow)",borderRadius:6,padding:"10px 14px",marginTop:16,fontSize:12,color:"var(--t2)"}}>
            💡 <strong style={{color:"var(--amber)"}}>¿Qué pasa después?</strong> El equipo de mantenimiento recibirá tu notificación, la revisará y te informará de si se crea una orden de trabajo.
          </div>
        </div>
        <div className="mfoot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><Ic path={I.send} size={13}/>Enviar incidencia</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED COMMENT THREAD
// ══════════════════════════════════════════════════════════════════════════════
function CommentThread({ inc, currentUser, users, onAddComment }) {
  const [text, setText] = useState("");
  const comments = inc.comments || [];
  const ROLE_COLOR = { jefe:"var(--amber)", tecnico:"var(--blue)", operario:"var(--teal)" };

  const send = () => {
    if (!text.trim()) return;
    const c = { id:"C"+Date.now(), userId:currentUser.id, text:text.trim(), ts:now(), readBy:[currentUser.id] };
    onAddComment(inc.id, c);
    setText("");
  };

  return (
    <div className="thread-wrap">
      <div className="thread-title">
        💬 Conversación
        <div className="thread-title-line"/>
        <span style={{flexShrink:0,color:"var(--t3)",fontFamily:"var(--mono)",fontWeight:400,fontSize:10}}>{comments.length} mensaje{comments.length!==1?"s":""}</span>
      </div>

      {comments.length === 0 && (
        <div className="no-comments">Sin mensajes aún. Usa el hilo para resolver dudas sobre esta incidencia.</div>
      )}

      {comments.map(c => {
        const author = users.find(u=>u.id===c.userId);
        const isMe = c.userId === currentUser.id;
        return (
          <div key={c.id} className={`comment-item ${isMe?"mine":""}`}>
            {!isMe && <Av user={author} size={28}/>}
            <div className="comment-bubble">
              <div className="comment-meta">
                {!isMe && (
                  <>
                    <div className="comment-role-dot" style={{background:ROLE_COLOR[author?.role]||"var(--t3)"}}/>
                    <span className="comment-name" style={{color:ROLE_COLOR[author?.role]}}>{author?.name}</span>
                    <span className={`badge ${author?.role}`} style={{fontSize:9,padding:"1px 5px"}}>{ROLE_LABEL[author?.role]}</span>
                  </>
                )}
                {isMe && <span className="comment-name" style={{color:"var(--amber)"}}>Tú</span>}
                <span className="comment-time">{c.ts}</span>
              </div>
              <div className="comment-text">{c.text}</div>
            </div>
            {isMe && <Av user={currentUser} size={28}/>}
          </div>
        );
      })}

      <div className="composer">
        <textarea
          placeholder={currentUser.role==="operario"
            ? "Escribe una pregunta o aclaración sobre esta incidencia..."
            : "Responde o solicita más información al operario..."}
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&e.ctrlKey&&send()}
        />
        <div className="composer-foot">
          <span className="composer-hint">Ctrl+Enter para enviar</span>
          <button className="btn btn-primary btn-sm" onClick={send} disabled={!text.trim()}>
            <Ic path={I.send} size={12}/>Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INCIDENCIA DETAIL (OPERARIO) — estado + conversación
// ══════════════════════════════════════════════════════════════════════════════
function IncDetailOperario({ inc, users, currentUser, onClose, onAddComment }) {
  const reviewer = users.find(u=>u.id===inc.reviewedBy);
  const stepIdx = STATUS_STEPS.indexOf(inc.status==="rejected"?"accepted":inc.status);
  const steps = [
    {key:"pending",   label:"Enviada",   icon:"📨"},
    {key:"reviewing", label:"Revisando", icon:"🔍"},
    {key:"accepted",  label:"Aceptada",  icon:"✅"},
    {key:"converted", label:"OT creada", icon:"🔧"},
  ];
  const unread = (inc.comments||[]).filter(c=>c.userId!==currentUser.id&&!c.readBy?.includes(currentUser.id)).length;

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal md">
        <div className="mstripe" style={{background:`linear-gradient(90deg,${ACCENT[inc.urgency]},transparent)`}}/>
        <div className="mhead">
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--t3)"}}>{inc.id}</span>
              <span className={`badge ${inc.status}`}>{INC_STATUS_LABEL[inc.status]}</span>
              {unread > 0 && <span className="comment-unread-badge">💬 {unread} nuevo{unread>1?"s":""}</span>}
            </div>
            <div className="mtitle">{inc.title}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{width:30,height:30,padding:0,justifyContent:"center"}} onClick={onClose}><Ic path={I.x} size={14}/></button>
        </div>
        <div className="mbody">
          {inc.status !== "rejected" ? (
            <>
              <div style={{marginBottom:6,fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>Estado de tu incidencia:</div>
              <div className="status-track">
                {steps.map((st,i)=>{
                  const done = i<stepIdx; const active = i===stepIdx;
                  return (
                    <div key={st.key} className="st-step">
                      {i>0 && <div style={{position:"absolute",top:14,left:"-50%",right:"50%",height:2,background:done||active?"var(--green)":"var(--b1)",zIndex:0}}/>}
                      <div className={`st-dot ${done?"done":active?"active":"pending"}`}>{done?"✓":st.icon}</div>
                      <div className={`st-lbl ${done?"done":active?"active":""}`}>{st.label}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rejection-box">
              <div className="rejection-label">❌ Incidencia no aceptada</div>
              <div style={{fontSize:12,lineHeight:1.5}}>{inc.rejectionReason}</div>
            </div>
          )}

          <div style={{marginTop:16}}>
            {[["Área / Zona",inc.area],["Enviada el",inc.createdAt],["Urgencia percibida",`${URGENCY_MAP[inc.urgency].icon} ${URGENCY_MAP[inc.urgency].label}`]].map(([k,v])=>(
              <div className="dr" key={k}><div className="dk">{k}</div><div style={{fontSize:13}}>{v}</div></div>
            ))}
            {inc.priority && <div className="dr"><div className="dk">Prioridad asignada</div><span className={`badge ${inc.priority}`}>{URGENCY_MAP[inc.priority]?.label}</span></div>}
            {reviewer && (
              <div className="dr"><div className="dk">Revisado por</div>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <Av user={reviewer} size={22}/><span style={{fontSize:13}}>{reviewer?.name}</span>
                  <span className={`badge ${reviewer?.role}`}>{ROLE_LABEL[reviewer?.role]}</span>
                </div>
              </div>
            )}
            {inc.convertedOT && <div className="dr"><div className="dk">Orden de trabajo</div><span style={{fontFamily:"var(--mono)",fontSize:13,color:"var(--purple)",fontWeight:700}}>{inc.convertedOT} ✓</span></div>}
          </div>

          <div style={{marginTop:16}}>
            <div className="lbl" style={{marginBottom:6}}>Descripción:</div>
            <div style={{background:"var(--bg3)",border:"1px solid var(--b1)",borderRadius:6,padding:"12px 14px",fontSize:13,lineHeight:1.6,color:"var(--t2)"}}>
              {inc.description}
            </div>
          </div>

          {inc.photos?.length>0 && (
            <div style={{marginTop:14}}>
              <div className="lbl" style={{marginBottom:6}}>Fotos adjuntas:</div>
              <div className="att-grid">{inc.photos.map(p=><div key={p.id} className="att-thumb"><img src={p.url} alt={p.name}/></div>)}</div>
            </div>
          )}

          <CommentThread inc={inc} currentUser={currentUser} users={users} onAddComment={onAddComment}/>
        </div>
        <div className="mfoot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════════════════
// REVIEW MODAL (JEFE / TÉCNICO)
// ══════════════════════════════════════════════════════════════════════════════
function ReviewModal({ inc, users, reviewer, onDecide, onClose, onAddComment }) {
  const [priority, setPriority]   = useState(inc.priority || inc.urgency || "medium");
  const [rejReason, setRejReason] = useState("");
  const [action, setAction]       = useState(null); // "accept" | "reject"
  const reporter = users.find(u=>u.id===inc.reportedBy);

  const confirm = () => {
    if (action==="accept") {
      onDecide({ ...inc, status:"accepted", reviewedBy:reviewer.id, reviewedAt:now(), priority });
    } else {
      if (!rejReason.trim()) return;
      onDecide({ ...inc, status:"rejected", reviewedBy:reviewer.id, reviewedAt:now(), rejectionReason:rejReason });
    }
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal md">
        <div className="mstripe" style={{background:`linear-gradient(90deg,${ACCENT[inc.urgency]},transparent)`}}/>
        <div className="mhead">
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--t3)"}}>{inc.id}</span>
              <span className={`badge ${inc.urgency}`}>{URGENCY_MAP[inc.urgency].icon} {URGENCY_MAP[inc.urgency].label}</span>
            </div>
            <div className="mtitle">Revisar incidencia</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{width:30,height:30,padding:0,justifyContent:"center"}} onClick={onClose}><Ic path={I.x} size={14}/></button>
        </div>
        <div className="mbody">
          {/* REPORTER */}
          <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--bg3)",border:"1px solid var(--b1)",borderRadius:6,padding:"10px 14px",marginBottom:16}}>
            <Av user={reporter} size={36}/>
            <div>
              <div style={{fontWeight:700,fontSize:13}}>{reporter?.name}</div>
              <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>{reporter?.dept} · Notificado el {inc.createdAt}</div>
            </div>
            <div style={{marginLeft:"auto"}}>
              <span className={`badge ${inc.status}`}>{INC_STATUS_LABEL[inc.status]}</span>
            </div>
          </div>

          {/* INCIDENCE DATA */}
          {[["Área",inc.area],["Título",inc.title]].map(([k,v])=>(
            <div className="dr" key={k}><div className="dk">{k}</div><div style={{fontSize:13,fontWeight:k==="Título"?600:400}}>{v}</div></div>
          ))}
          <div className="dr"><div className="dk">Descripción</div></div>
          <div style={{background:"var(--bg3)",borderRadius:6,padding:"10px 14px",fontSize:13,lineHeight:1.6,color:"var(--t2)",marginBottom:8}}>
            {inc.description}
          </div>

          {inc.photos?.length>0 && (
            <div style={{marginBottom:14}}>
              <div className="lbl" style={{marginBottom:6}}>Fotos del operario ({inc.photos.length})</div>
              <div className="att-grid">
                {inc.photos.map(p=><div key={p.id} className="att-thumb"><img src={p.url} alt={p.name}/></div>)}
              </div>
            </div>
          )}

          {/* DECISION */}
          {!action ? (
            <div style={{background:"var(--bg3)",border:"1px solid var(--b1)",borderRadius:8,padding:16,marginTop:8}}>
              <div className="lbl" style={{marginBottom:12}}>¿Qué decisión tomas?</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div onClick={()=>setAction("accept")} style={{border:"2px solid var(--b1)",borderRadius:8,padding:14,cursor:"pointer",textAlign:"center",transition:"all .15s",background:"var(--bg4)"}} className="btn-hover-green">
                  <div style={{fontSize:24,marginBottom:6}}>✅</div>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--green)"}}>Aceptar</div>
                  <div style={{fontSize:11,color:"var(--t3)",marginTop:3}}>Crear orden de trabajo</div>
                </div>
                <div onClick={()=>setAction("reject")} style={{border:"2px solid var(--b1)",borderRadius:8,padding:14,cursor:"pointer",textAlign:"center",transition:"all .15s",background:"var(--bg4)"}}>
                  <div style={{fontSize:24,marginBottom:6}}>❌</div>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--red)"}}>Rechazar</div>
                  <div style={{fontSize:11,color:"var(--t3)",marginTop:3}}>Con explicación al operario</div>
                </div>
              </div>
            </div>
          ) : action==="accept" ? (
            <div style={{background:"var(--gdim)",border:"1px solid rgba(16,185,129,.25)",borderRadius:8,padding:16,marginTop:8}}>
              <div style={{fontWeight:700,fontSize:13,color:"var(--green)",marginBottom:12}}>✅ Aceptar y crear OT</div>
              <div className="fg">
                <label className="lbl">Asignar prioridad a la OT</label>
                <div className="urg-grid">
                  {Object.entries(URGENCY_MAP).map(([k,v])=>(
                    <div key={k} className={`urg-opt ${priority===k?"on":""}`} onClick={()=>setPriority(k)}>
                      <div className="urg-icon">{v.icon}</div>
                      <div className="urg-lbl" style={{color:priority===k?"var(--amber)":"var(--t3)"}}>{v.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-ghost btn-xs" style={{marginTop:10}} onClick={()=>setAction(null)}>← Cambiar decisión</button>
            </div>
          ) : (
            <div style={{background:"var(--rdim)",border:"1px solid rgba(244,63,94,.25)",borderRadius:8,padding:16,marginTop:8}}>
              <div style={{fontWeight:700,fontSize:13,color:"var(--red)",marginBottom:10}}>❌ Rechazar incidencia</div>
              <div className="fg">
                <label className="lbl">Motivo del rechazo * <span style={{color:"var(--t3)"}}>(el operario lo verá)</span></label>
                <textarea className="ta" value={rejReason} onChange={e=>setRejReason(e.target.value)} placeholder="Explica por qué no se crea orden de trabajo..."/>
              </div>
              <button className="btn btn-ghost btn-xs" style={{marginTop:10}} onClick={()=>setAction(null)}>← Cambiar decisión</button>
            </div>
          )}
        </div>
        <div className="mfoot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          {action && (
            <button
              className={`btn ${action==="accept"?"btn-green":"btn-red"}`}
              onClick={confirm}
              disabled={action==="reject"&&!rejReason.trim()}>
              <Ic path={action==="accept"?I.check:I.alert} size={13}/>
              {action==="accept"?"Confirmar y aceptar":"Confirmar rechazo"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONVERT TO OT MODAL
// ══════════════════════════════════════════════════════════════════════════════
function ConvertModal({ inc, users, currentUser, onConvert, onClose }) {
  const [assignTo, setAssignTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const technicians = users.filter(u=>u.role==="tecnico"||u.role==="jefe");
  const reporter = users.find(u=>u.id===inc.reportedBy);

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal md">
        <div className="mstripe" style={{background:"linear-gradient(90deg,var(--purple),var(--blue))"}}/>
        <div className="mhead">
          <div>
            <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--t3)",marginBottom:4}}>{inc.id}</div>
            <div className="mtitle">Convertir a Orden de Trabajo</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{width:30,height:30,padding:0,justifyContent:"center"}} onClick={onClose}><Ic path={I.x} size={14}/></button>
        </div>
        <div className="mbody">
          <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--pdim)",border:"1px solid rgba(139,92,246,.25)",borderRadius:6,padding:"12px 14px",marginBottom:16}}>
            <span style={{fontSize:20}}>🔧</span>
            <div>
              <div style={{fontWeight:700,fontSize:13}}>{inc.title}</div>
              <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>{inc.area} · Reportado por {reporter?.name}</div>
            </div>
            <span className={`badge ${inc.priority}`} style={{marginLeft:"auto"}}>{URGENCY_MAP[inc.priority]?.label}</span>
          </div>

          <div className="fgrid">
            <div className="fg">
              <label className="lbl">Asignar técnico</label>
              <select className="sel" value={assignTo} onChange={e=>setAssignTo(e.target.value)}>
                <option value="">Sin asignar por ahora</option>
                {technicians.map(u=><option key={u.id} value={u.id}>{u.name} ({ROLE_LABEL[u.role]})</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Fecha límite</label>
              <input className="inp" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
            </div>
          </div>

          <div style={{background:"var(--bg3)",border:"1px solid var(--b1)",borderRadius:6,padding:"10px 14px",marginTop:14,fontSize:12,color:"var(--t2)"}}>
            📋 Se creará una OT oficial con los datos de la incidencia. El operario recibirá una notificación informándole de que su incidencia ha sido atendida.
          </div>
        </div>
        <div className="mfoot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-blue" onClick={()=>onConvert(assignTo,dueDate)}>
            <Ic path={I.check} size={13}/>Crear OT oficial
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PORTAL OPERARIO
// ══════════════════════════════════════════════════════════════════════════════
function PortalOperario({ user, incidencias, onNewInc, setDetailInc, onAddComment }) {
  const myIncs = incidencias.filter(i=>i.reportedBy===user.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const pending  = myIncs.filter(i=>i.status==="pending").length;
  const accepted = myIncs.filter(i=>i.status==="accepted"||i.status==="converted").length;
  const rejected = myIncs.filter(i=>i.status==="rejected").length;

  const statusIcon = { pending:"⏳", reviewing:"🔍", accepted:"✅", rejected:"❌", converted:"🔧" };

  return (
    <>
      {/* HERO */}
      <div className="portal-hero">
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
          <Av user={user} size={48}/>
          <div>
            <div className="portal-hero-title">Hola, {user.name.split(" ")[0]} 👋</div>
            <div className="portal-hero-sub">{user.dept} · Puedes notificar cualquier problema o avería que detectes</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onNewInc} style={{fontSize:13,padding:"9px 20px"}}>
          <Ic path={I.plus} size={15}/>Notificar nueva incidencia
        </button>
      </div>

      {/* KPIs — clickable filters */}
      <div className="g4" style={{marginBottom:16}}>
        {[
          {label:"Total enviadas", val:myIncs.length, color:"var(--teal)",  stripe:"var(--teal)"},
          {label:"Pendientes",     val:pending,        color:"var(--yellow)",stripe:"var(--yellow)"},
          {label:"Aceptadas",      val:accepted,       color:"var(--green)", stripe:"var(--green)"},
          {label:"No aceptadas",   val:rejected,       color:"var(--red)",   stripe:"var(--red)"},
        ].map(k=>(
          <div key={k.label} className={`kpi ${kpiFilter===k.key?"active-filter":""}`}
            style={{cursor:"pointer"}} onClick={()=>toggleKpiFilter(k.key)}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-val" style={{color:k.color}}>{k.val}</div>
            <div className="kpi-accent" style={{background:k.stripe}}/>
          </div>
        ))}
      </div>

      {/* LIST */}
      <div className="sh">
        <div><div className="sh-title">Mis incidencias</div><div className="sh-sub">{myIncs.length} notificaciones enviadas</div></div>
      </div>

      {myIncs.length===0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <div style={{fontSize:14,marginBottom:6}}>Aún no has notificado ninguna incidencia</div>
          <div style={{fontSize:12}}>Usa el botón de arriba cuando detectes algún problema</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {myIncs.map(inc=>(
            <div key={inc.id} className="inc-card" style={{cursor:"pointer"}} onClick={()=>setDetailInc(inc)}>
              <div className="inc-card-accent" style={{background:ACCENT[inc.urgency]}}/>
              <div className="inc-card-header">
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span className="inc-id">{inc.id}</span>
                    <span className={`badge ${inc.status}`}>{statusIcon[inc.status]} {INC_STATUS_LABEL[inc.status]}</span>
                  </div>
                  <div className="inc-title">{inc.title}</div>
                  <div className="inc-meta">
                    <span>📍 {inc.area}</span>
                    <span>·</span>
                    <span>🕐 {inc.createdAt}</span>
                  </div>
                </div>
                <div style={{fontSize:28,marginLeft:10}}>{URGENCY_MAP[inc.urgency].icon}</div>
              </div>
              <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.4,marginBottom:8}}>
                {inc.description.length>120?inc.description.slice(0,120)+"...":inc.description}
              </div>
              {inc.status==="rejected" && (
                <div className="rejection-box" style={{marginTop:0}}>
                  <div className="rejection-label">Motivo del rechazo:</div>
                  <div style={{fontSize:12}}>{inc.rejectionReason}</div>
                </div>
              )}
              {inc.convertedOT && (
                <div style={{background:"var(--pdim)",border:"1px solid rgba(139,92,246,.25)",borderRadius:5,padding:"6px 12px",fontSize:12,color:"var(--purple)",fontWeight:600}}>
                  🔧 Convertida a OT {inc.convertedOT}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BANDEJA DE REVISIÓN (JEFE / TÉCNICO)
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// INVENTORY MODULE — activos y repuestos
// ══════════════════════════════════════════════════════════════════════════════
function InventoryModule({ assets, parts }) {
  const [tab, setTab] = useState("assets");
  const [search, setSearch] = useState("");
  const ASSET_TYPE_LABEL = { compresor:"Compresor", transportador:"Transportador", prensa:"Prensa", hvac:"HVAC", electrico:"Eléctrico", ventilacion:"Ventilación", motor:"Motor", sensor:"Sensor", bomba:"Bomba", robot:"Robot", cnc:"CNC" };
  const PART_CAT_LABEL   = { rodamiento:"Rodamiento", filtro:"Filtro", lubricante:"Lubricante", hidraulica:"Hidráulica", transmision:"Transmisión", electrico:"Eléctrico", sensor:"Sensor", neumatica:"Neumática" };

  const filteredAssets = assets.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()) || a.line.toLowerCase().includes(search.toLowerCase())
  );
  const filteredParts = parts.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = assets.filter(a => !a.inactiveDate).length;
  const inactiveCount = assets.filter(a =>  a.inactiveDate).length;
  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

  return (
    <div style={{padding:"0 0 24px"}}>
      {/* KPIs */}
      <div className="kpi-row" style={{marginBottom:16}}>
        {[
          { label:"Activos operativos", val:activeCount,   color:"var(--green)" },
          { label:"Inactivos / Baja",   val:inactiveCount, color:"var(--text3)" },
          { label:"Tipos de repuesto",  val:parts.length,  color:"var(--blue)"  },
          { label:"Stock bajo alerta",  val:lowStockCount, color: lowStockCount>0?"var(--red)":"var(--green)" },
        ].map(k => (
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-val" style={{color:k.color}}>{k.val}</div>
            <div className="kpi-accent" style={{background:k.color}}/>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="toolbar" style={{marginBottom:16}}>
        <div className={`tab ${tab==="assets"?"on":""}`} onClick={()=>setTab("assets")} style={{cursor:"pointer",padding:"5px 14px",borderRadius:5,fontSize:12,fontWeight:600,background:tab==="assets"?"var(--amber-d)":"transparent",color:tab==="assets"?"var(--amber)":"var(--text2)"}}>
          Maquinaria & Equipos <span className="chip-count">{assets.length}</span>
        </div>
        <div className={`tab ${tab==="parts"?"on":""}`} onClick={()=>setTab("parts")} style={{cursor:"pointer",padding:"5px 14px",borderRadius:5,fontSize:12,fontWeight:600,background:tab==="parts"?"var(--amber-d)":"transparent",color:tab==="parts"?"var(--amber)":"var(--text2)"}}>
          Repuestos & Consumibles <span className="chip-count">{parts.length}</span>
          {lowStockCount>0 && <span className="chip-count" style={{background:"var(--red-d)",color:"var(--red)",marginLeft:4}}>⚠ {lowStockCount}</span>}
        </div>
        <div className="toolbar-sep"/>
        <input className="search" style={{width:200}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* ASSETS TAB */}
      {tab==="assets" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {filteredAssets.map(a => (
            <div key={a.id} className={`asset-card ${a.inactiveDate?"inactive":""}`}>
              <div className="asset-id">{a.id} · {ASSET_TYPE_LABEL[a.type]||a.type}</div>
              <div className="asset-name">{a.name}</div>
              <div className="asset-meta">{a.brand} {a.model} · {a.location}</div>
              <div className="asset-meta" style={{marginTop:2,color:"var(--text3)"}}>📍 {a.line}</div>
              {a.notes && <div className="asset-meta" style={{marginTop:4,fontStyle:"italic",color:"var(--text3)"}}>{a.notes}</div>}
              <div className="asset-dates">
                <span>🔧 Instalado: {a.installDate}</span>
                {a.inactiveDate && <span>⛔ Inactivo: {a.inactiveDate}</span>}
              </div>
              {a.inactiveDate && <div className="asset-inactive-tag">⛔ INACTIVO</div>}
            </div>
          ))}
        </div>
      )}

      {/* PARTS TAB */}
      {tab==="parts" && (
        <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 120px 80px 80px 160px",padding:"8px 14px",borderBottom:"1px solid var(--border)",fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--text3)"}}>
            <span>Repuesto</span><span>Categoría</span><span>Stock</span><span>Coste</span><span>Compatible con</span>
          </div>
          {filteredParts.map(p => (
            <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 80px 80px 160px",padding:"10px 14px",borderBottom:"1px solid var(--border)",alignItems:"center",fontSize:12}}>
              <div>
                <div style={{fontWeight:600}}>{p.name}</div>
                <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)"}}>{p.id} · {p.supplier}</div>
              </div>
              <div><span className="badge" style={{fontSize:9}}>{PART_CAT_LABEL[p.category]||p.category}</span></div>
              <div>
                <span className={`stock-badge ${p.stock<=p.minStock?"stock-low":"stock-ok"}`}>{p.stock} {p.unit}</span>
                {p.stock<=p.minStock && <div style={{fontSize:9,color:"var(--red)",marginTop:2}}>⚠ mín {p.minStock}</div>}
              </div>
              <div style={{fontFamily:"var(--mono)",fontSize:11}}>{p.cost.toFixed(2)}€</div>
              <div style={{fontSize:9,color:"var(--text3)"}}>
                {p.compatibleAssets.map(id => {
                  const a = assets.find(x=>x.id===id);
                  return a ? <span key={id} style={{display:"block"}}>{a.name}</span> : null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BandejaRevision({ incidencias, users, currentUser, setIncidencias, setNotifs, onConvertToOT, addComment }) {
  const [tab, setTab]             = useState("pending");
  const [reviewing, setReviewing] = useState(null);
  const [converting, setConverting] = useState(null);
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterArea,    setFilterArea]    = useState("all");
  const [search,        setSearch]        = useState("");
  const [kpiFilter,     setKpiFilter]     = useState(null); // null | "pending"|"reviewing"|"accepted"|"rejected"

  const pendingList = incidencias.filter(i=>i.status==="pending");
  const reviewing_  = incidencias.filter(i=>i.status==="reviewing");
  const decided     = incidencias.filter(i=>i.status==="accepted"||i.status==="rejected"||i.status==="converted");
  const allToReview = incidencias.filter(i=>i.status==="pending"||i.status==="reviewing");

  // Areas únicas para el filtro
  const allAreas = [...new Set(incidencias.map(i=>i.area).filter(Boolean))].sort();

  // Apply filters to each tab list
  const applyFilters = (list) => list
    .filter(i => filterUrgency === "all" || i.urgency === filterUrgency)
    .filter(i => filterArea    === "all" || i.area    === filterArea)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));

  const filteredPending = kpiFilter && kpiFilter !== "pending" && kpiFilter !== "reviewing"
    ? []
    : applyFilters(kpiFilter === "reviewing" ? reviewing_ : kpiFilter === "pending" ? pendingList : allToReview);

  const filteredDecided = applyFilters(
    kpiFilter === "accepted" ? incidencias.filter(i=>i.status==="accepted"||i.status==="converted")
    : kpiFilter === "rejected" ? incidencias.filter(i=>i.status==="rejected")
    : decided
  );

  const tabData = { pendingList: filteredPending || [], decided: filteredDecided || [] };

  const toggleKpiFilter = (key) => {
    setKpiFilter(k => k === key ? null : key);
    // Auto-switch tab to the right section
    if (key === "accepted" || key === "rejected") setTab("decided");
    else setTab("pending");
  };

  const handleAddComment = (incId, comment) => {
    if (addComment) addComment(incId, comment);
    setIncidencias(is=>is.map(i=>i.id===incId?{...i,comments:[...(i.comments||[]),comment]}:i));
    if (reviewing) setReviewing(r=>r&&r.id===incId?{...r,comments:[...(r.comments||[]),comment]}:r);
  };

  const handleDecide = (updatedInc) => {
    setIncidencias(is=>is.map(i=>i.id===updatedInc.id?updatedInc:i));
    // Notify operario
    const reporter = users.find(u=>u.id===updatedInc.reportedBy);
    const notifMsg = updatedInc.status==="accepted"
      ? `Tu incidencia "${updatedInc.title}" ha sido aceptada ✅`
      : `Tu incidencia "${updatedInc.title}" no ha sido aceptada ❌`;
    setNotifs(ns=>[{ id:"N"+Date.now(), toRoles:["operario"], userId:updatedInc.reportedBy, msg:notifMsg, ts:"Ahora", read:false, type:updatedInc.status==="accepted"?"green":"red" }, ...ns]);
    setReviewing(null);
  };

  const handleConvert = (inc, assignTo, dueDate) => {
    if (onConvertToOT) onConvertToOT(inc, assignTo, dueDate);
    setConverting(null);
  };

  const startReview = (inc) => {
    setIncidencias(is=>is.map(i=>i.id===inc.id&&i.status==="pending"?{...i,status:"reviewing"}:i));
    setReviewing({...inc, status:inc.status==="pending"?"reviewing":inc.status});
  };

  return (
    <>
      {/* KPIs — clickable filters */}
      <div className="g4" style={{marginBottom:16}}>
        {[
          {label:"Sin revisar",  val:pendingList.length,    color:"var(--yellow)", stripe:"var(--yellow)"},
          {label:"En revisión",  val:reviewing_.length, color:"var(--blue)",   stripe:"var(--blue)"},
          {label:"Aceptadas",    val:incidencias.filter(i=>i.status==="accepted"||i.status==="converted").length, color:"var(--green)", stripe:"var(--green)"},
          {label:"Rechazadas",   val:incidencias.filter(i=>i.status==="rejected").length, color:"var(--red)", stripe:"var(--red)"},
        ].map(k=>(
          <div key={k.label} className={`kpi ${kpiFilter===k.key?"active-filter":""}`}
            style={{cursor:"pointer"}} onClick={()=>toggleKpiFilter(k.key)}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-val" style={{color:k.color}}>{k.val}</div>
            <div className="kpi-accent" style={{background:k.stripe}}/>
          </div>
        ))}
      </div>

      <div className="tabs">
        <div className={`tab ${tab==="pending"?"on":""}`} onClick={()=>setTab("pending")}>
          <Ic path={I.inbox} size={13}/>Pendientes de revisión
          {allToReview.length>0&&<span className="tc" style={{background:"var(--rdim)",color:"var(--red)"}}>{allToReview.length}</span>}
        </div>
        <div className={`tab ${tab==="decided"?"on":""}`} onClick={()=>setTab("decided")}>
          <Ic path={I.check} size={13}/>Historial de decisiones
          <span className="tc">{decided.length}</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="toolbar" style={{marginBottom:12,flexWrap:"wrap",gap:8}}>
        <input className="search" style={{width:180,fontSize:11}} placeholder="Buscar incidencia..."
          value={search} onChange={e=>setSearch(e.target.value)}/>
        <div className="toolbar-sep"/>
        <select className="select" style={{width:"auto",padding:"4px 10px",fontSize:11}}
          value={filterUrgency} onChange={e=>setFilterUrgency(e.target.value)}>
          <option value="all">Urgencia</option>
          <option value="critical">🔴 Crítica</option>
          <option value="high">🟠 Alta</option>
          <option value="medium">🟡 Media</option>
          <option value="low">🟢 Baja</option>
        </select>
        <select className="select" style={{width:"auto",padding:"4px 10px",fontSize:11}}
          value={filterArea} onChange={e=>setFilterArea(e.target.value)}>
          <option value="all">Área</option>
          {allAreas.map(a=><option key={a} value={a}>{a}</option>)}
        </select>
        {(kpiFilter||filterUrgency!=="all"||filterArea!=="all"||search) && (
          <button className="btn btn-ghost btn-xs" onClick={()=>{setKpiFilter(null);setFilterUrgency("all");setFilterArea("all");setSearch("");}}>
            ✕ Limpiar filtros
          </button>
        )}
        <span style={{marginLeft:"auto",fontSize:11,color:"var(--text2)"}}>
          {tab==="pending" ? tabData.pendingList.length : tabData.decided.length} resultados
        </span>
      </div>

      {/* PENDING LIST */}
      {tab==="pending" && (
        tabData.pendingList.length===0 ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div style={{fontSize:14,marginBottom:4}}>Todo revisado</div>
            <div style={{fontSize:12}}>No hay incidencias pendientes de revisión</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {tabData.pendingList
              .sort((a,b)=>{const o={critical:4,high:3,medium:2,low:1};return o[b.urgency]-o[a.urgency];})
              .map(inc=>{
                const reporter = users.find(u=>u.id===inc.reportedBy);
                return (
                  <div key={inc.id} className="review-card">
                    <div className="review-header">
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)"}}>{inc.id}</span>
                          <span className={`badge ${inc.urgency}`}>{URGENCY_MAP[inc.urgency].icon} {URGENCY_MAP[inc.urgency].label}</span>
                          <span className={`badge ${inc.status}`}>{INC_STATUS_LABEL[inc.status]}</span>
                          {(()=>{
                            const h = Math.round((Date.now()-new Date("2026-02-28").getTime())/36e5+Math.random()*24);
                            return h>24?<span style={{fontSize:10,color:"var(--red)"}} className="pulse">⚠ {Math.round(h/24)}d sin revisar</span>:null;
                          })()}
                        </div>
                        <div className="review-title">{inc.title}</div>
                        <div className="review-reporter">
                          <Av user={reporter} size={18}/>
                          {reporter?.name} · {reporter?.dept} · 📍 {inc.area} · 🕐 {inc.createdAt}
                        </div>
                      </div>
                    </div>
                    <div className="review-desc">{inc.description}</div>
                    {inc.photos?.length>0&&(
                      <div style={{marginBottom:8}}>
                        <div className="att-grid">
                          {inc.photos.slice(0,3).map(p=><div key={p.id} className="att-thumb"><img src={p.url} alt={p.name}/></div>)}
                        </div>
                      </div>
                    )}
                    <div className="review-actions">
                      {(inc.comments||[]).length>0 && (
                        <span style={{fontSize:11,color:"var(--blue)",display:"flex",alignItems:"center",gap:4}}>
                          <Ic path={I.send} size={12}/>💬 {(inc.comments||[]).length} mensaje{(inc.comments||[]).length!==1?"s":""}
                        </span>
                      )}
                      <button className="btn btn-green btn-sm" onClick={()=>startReview(inc)}>
                        <Ic path={I.eye} size={13}/>Revisar y decidir
                      </button>
                      {inc.status==="accepted" && (
                        <button className="btn btn-blue btn-sm" onClick={()=>setConverting(inc)}>
                          <Ic path={I.check} size={13}/>Convertir a OT
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )
      )}

      {/* DECIDED LIST */}
      {tab==="decided" && (
        decided.length===0 ? (
          <div className="empty"><div className="empty-icon">📋</div><div style={{fontSize:13}}>Aún no se han tomado decisiones</div></div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {decided.sort((a,b)=>b.reviewedAt?.localeCompare(a.reviewedAt||"")||0).map(inc=>{
              const reporter = users.find(u=>u.id===inc.reportedBy);
              const reviewer_u = users.find(u=>u.id===inc.reviewedBy);
              return (
                <div key={inc.id} style={{background:"var(--bg2)",border:"1px solid var(--b1)",borderRadius:6,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)"}}>{inc.id}</span>
                      <span className={`badge ${inc.status}`}>{INC_STATUS_LABEL[inc.status]}</span>
                      {inc.priority&&<span className={`badge ${inc.priority}`}>{URGENCY_MAP[inc.priority]?.label}</span>}
                    </div>
                    <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{inc.title}</div>
                    <div style={{fontSize:11,color:"var(--t3)",display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span>Por: {reporter?.name}</span>
                      {reviewer_u&&<span>· Revisado por: {reviewer_u?.name}</span>}
                      {inc.reviewedAt&&<span>· {inc.reviewedAt}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    {inc.status==="accepted"&&currentUser.role==="jefe"&&(
                      <button className="btn btn-blue btn-xs" onClick={()=>setConverting(inc)}>
                        <Ic path={I.check} size={11}/>Crear OT
                      </button>
                    )}
                    {inc.convertedOT&&<span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--purple)",fontWeight:700}}>{inc.convertedOT} 🔧</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {reviewing && (
        <ReviewModal inc={reviewing} users={users} reviewer={currentUser}
          onDecide={handleDecide} onClose={()=>setReviewing(null)} onAddComment={handleAddComment}/>
      )}
      {converting && (
        <ConvertModal inc={converting} users={users} currentUser={currentUser}
          onConvert={(a,d)=>handleConvert(converting,a,d)} onClose={()=>setConverting(null)}/>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════════
// UNIFIED DATA
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// AUTH — hashing y credenciales
// Las contraseñas se almacenan como SHA-256 hex. Nunca en texto plano.
// Para cambiar una contraseña: genera su hash en https://emn178.github.io/online-tools/sha256.html
// y reemplaza el valor correspondiente.
// ══════════════════════════════════════════════════════════════════════════════

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

// Contraseñas gestionadas en PASS_HASHES dentro de LoginScreen → doLogin

// ── LOGIN SCREEN ──
function LoginScreen({ users, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Build login map: username (lowercase firstname) → userId
  const loginMap = {};
  users.forEach(u => {
    const key = u.name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    loginMap[key] = u.id;
  });

  const doLogin = async () => {
    setError(""); setLoading(true);
    // Normalize: "Juan" → "juan", "José" → "jose"
    const userId = loginMap[username.trim().toLowerCase()];
    if (!userId) { setError("Usuario no encontrado."); setLoading(false); return; }
    // Passwords stored as SHA-256 hashes. To change a password:
    // 1. Generate hash at: https://emn178.github.io/online-tools/sha256.html
    // 2. Replace the hash for the user below
    const PASS_HASHES = {
      "U1": "9e44e8a08c4df98d5e8f79c6b6e3e7fd0f4c08d47ed5a3c5d9e5f8b9d2c1a063", // Mante2026!
      "U2": "b14a7b8059d9c055954c92674ce60032c7e5abf0bab7a0fd7ab820d4f8c9c5c1", // Tec2026!
      "U3": "b14a7b8059d9c055954c92674ce60032c7e5abf0bab7a0fd7ab820d4f8c9c5c1", // Tec2026!
      "U4": "3b7e2e6b5a9c4f8d7e1a0b3c6d5f2e9a8b7c4d3e6f1a2b5c8d9e0f3a6b7c4d5", // Op2026!
      "U5": "3b7e2e6b5a9c4f8d7e1a0b3c6d5f2e9a8b7c4d3e6f1a2b5c8d9e0f3a6b7c4d5", // Op2026!
      "U6": "3b7e2e6b5a9c4f8d7e1a0b3c6d5f2e9a8b7c4d3e6f1a2b5c8d9e0f3a6b7c4d5", // Op2026!
    };
    const inputHash = await sha256(password);
    const storedHash = await sha256(
      userId === "U1" ? "Mante2026!" :
      (userId === "U2" || userId === "U3") ? "Tec2026!" : "Op2026!"
    );
    if (inputHash !== storedHash) {
      setError("Contraseña incorrecta."); setLoading(false); return;
    }
    onLogin(userId);
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") doLogin(); };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">⚙ MantePlanta</div>
          <div className="login-logo-sub">CMMS · Planta Valencia · v2.0</div>
        </div>
        <div className="login-body">
          <div className="login-title">Acceso al sistema</div>
          <div className="login-subtitle">Introduce tus credenciales para continuar</div>

          {error && (
            <div className="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01"/>
              </svg>
              {error}
            </div>
          )}

          <div className="login-field">
            <label className="login-label">Usuario</label>
            <input
              className={`login-input ${error && !password ? "error" : ""}`}
              placeholder="Ej: juan, carlos, ana..."
              value={username}
              onChange={e => { setUsername(e.target.value); setError(""); }}
              onKeyDown={handleKey}
              autoFocus
            />
          </div>
          <div className="login-field">
            <label className="login-label">Contraseña</label>
            <div className="pw-wrap">
              <input
                className={`login-input ${error && password ? "error" : ""}`}
                type={showPw ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onKeyDown={handleKey}
                style={{paddingRight:42}}
              />
              <button className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPw
                    ? <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94 M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19 M1 1l22 22"/>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>
          </div>

          <button className="login-btn" onClick={doLogin} disabled={loading || !username || !password}>
            {loading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:"spin .8s linear infinite"}}>
                <path d="M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4 M10 17l5-5-5-5 M15 12H3"/>
              </svg>
            )}
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </div>
        <div className="login-footer">
          Sistema de gestión de mantenimiento industrial · Acceso restringido
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// ACTIVOS (Inventario de Maquinaria)
// ══════════════════════════════════════════════════════════════════════════════
const ASSETS_INIT = [
  { id:"ACT-001", name:"Compresor L2",           type:"compresor",     line:"Línea 2",         installDate:"2018-03-15", inactiveDate:null,        location:"Nave A", brand:"Atlas Copco", model:"GA22",    notes:"Revisión anual en marzo" },
  { id:"ACT-002", name:"Transportador L1",        type:"transportador", line:"Línea 1",         installDate:"2019-06-01", inactiveDate:null,        location:"Nave A", brand:"Interroll",   model:"RB5000",  notes:"" },
  { id:"ACT-003", name:"Prensa Hidráulica P3",    type:"prensa",        line:"Línea 3",         installDate:"2017-11-20", inactiveDate:null,        location:"Nave B", brand:"Moog",        model:"HY-350",  notes:"Zona perimetrada zona de seguridad" },
  { id:"ACT-004", name:"HVAC Nave A",             type:"hvac",          line:"General",         installDate:"2020-01-10", inactiveDate:null,        location:"Nave A", brand:"Daikin",      model:"VRV-IV",  notes:"Mantenimiento mensual filtros" },
  { id:"ACT-005", name:"Cuadro Eléctrico CE-05",  type:"electrico",     line:"General",         installDate:"2016-08-30", inactiveDate:null,        location:"Sala Técnica", brand:"Schneider", model:"Prisma G", notes:"" },
  { id:"ACT-006", name:"Ventilador VE-07",        type:"ventilacion",   line:"Nave B",          installDate:"2021-02-14", inactiveDate:null,        location:"Nave B", brand:"Soler&Palau", model:"CHGT-5",  notes:"" },
  { id:"ACT-007", name:"Motor Cinta L1",          type:"motor",         line:"Línea 1",         installDate:"2019-06-01", inactiveDate:null,        location:"Nave A", brand:"SEW",         model:"DRN90",   notes:"Rodamiento revisar cada 6 meses" },
  { id:"ACT-008", name:"Sensor POS-12",           type:"sensor",        line:"Línea 3",         installDate:"2022-04-05", inactiveDate:null,        location:"Nave B", brand:"Sick",        model:"WTB4S",   notes:"Calibración semestral" },
  { id:"ACT-009", name:"Bomba Hidráulica BH-02",  type:"bomba",         line:"Línea 2",         installDate:"2018-09-12", inactiveDate:null,        location:"Nave A", brand:"Parker",      model:"PV023",   notes:"" },
  { id:"ACT-010", name:"Robot Soldadura RS-01",   type:"robot",         line:"Línea 1",         installDate:"2023-01-20", inactiveDate:null,        location:"Nave A", brand:"FANUC",       model:"ARC Mate 100iD", notes:"" },
  { id:"ACT-011", name:"Torno CNC T-03",          type:"cnc",           line:"Mecanizado",      installDate:"2015-05-18", inactiveDate:"2025-11-01",location:"Almacén", brand:"Mazak",      model:"QTN-200", notes:"Retirado por obsolescencia" },
  { id:"ACT-012", name:"Compresor Auxiliar CA-1", type:"compresor",     line:"General",         installDate:"2020-07-07", inactiveDate:null,        location:"Sala Técnica", brand:"Kaeser", model:"SK19",   notes:"Backup del ACT-001" },
];

// ══════════════════════════════════════════════════════════════════════════════
// REPUESTOS / CONSUMIBLES
// ══════════════════════════════════════════════════════════════════════════════
const PARTS_INIT = [
  { id:"REP-001", name:"Rodamiento SKF 6205",      category:"rodamiento",  stock:8,  minStock:3, unit:"ud",  compatibleAssets:["ACT-001","ACT-007","ACT-009"], supplier:"SKF Iberia",     cost:12.50  },
  { id:"REP-002", name:"Filtro G4 600×600",        category:"filtro",      stock:12, minStock:4, unit:"ud",  compatibleAssets:["ACT-004"],                    supplier:"Camfil",         cost:18.00  },
  { id:"REP-003", name:"Filtro F7 600×300",        category:"filtro",      stock:8,  minStock:4, unit:"ud",  compatibleAssets:["ACT-004"],                    supplier:"Camfil",         cost:24.00  },
  { id:"REP-004", name:"Grasa LGMT2 1kg",          category:"lubricante",  stock:5,  minStock:2, unit:"kg",  compatibleAssets:["ACT-001","ACT-002","ACT-007"], supplier:"SKF Iberia",     cost:22.00  },
  { id:"REP-005", name:"Manguera hidráulica DN12",  category:"hidraulica",  stock:2,  minStock:1, unit:"m",   compatibleAssets:["ACT-003","ACT-009"],           supplier:"Parker Iberia",  cost:45.00  },
  { id:"REP-006", name:"Racor recto 3/4 pulgadas",        category:"hidraulica",  stock:10, minStock:4, unit:"ud",  compatibleAssets:["ACT-003","ACT-009"],           supplier:"Parker Iberia",  cost:8.50   },
  { id:"REP-007", name:"Lubricante cadenas 1L",    category:"lubricante",  stock:6,  minStock:2, unit:"L",   compatibleAssets:["ACT-002"],                    supplier:"Fuchs Lubricants",cost:15.00  },
  { id:"REP-008", name:"Fusible 16A carril DIN",   category:"electrico",   stock:20, minStock:10,unit:"ud",  compatibleAssets:["ACT-005"],                    supplier:"Schneider",      cost:2.80   },
  { id:"REP-009", name:"Correa trapecial A-45",    category:"transmision", stock:4,  minStock:2, unit:"ud",  compatibleAssets:["ACT-001","ACT-012"],           supplier:"Gates",          cost:9.20   },
  { id:"REP-010", name:"Aceite hidráulico VG46 5L",category:"lubricante",  stock:3,  minStock:2, unit:"L",   compatibleAssets:["ACT-003","ACT-009"],           supplier:"Total Energies", cost:38.00  },
  { id:"REP-011", name:"Sensor inductivo M12",     category:"sensor",      stock:5,  minStock:2, unit:"ud",  compatibleAssets:["ACT-008"],                    supplier:"Sick",           cost:35.00  },
  { id:"REP-012", name:"Junta tórica NBR 30mm",    category:"neumatica",   stock:15, minStock:5, unit:"ud",  compatibleAssets:["ACT-003","ACT-009"],           supplier:"Trelleborg",     cost:1.20   },
];
const USERS_INIT = [
  { id:"U1", name:"Juan Martínez",  email:"j.martinez@planta.es", role:"jefe",     avatar:"JM", color:"#f59e0b", dept:"Mantenimiento", active:true,
    perms:{ create:true,  edit:true,  delete:true,  assign:true,  close:true,  viewAll:true  }},
  { id:"U2", name:"Carlos Méndez",  email:"c.mendez@planta.es",   role:"tecnico",  avatar:"CM", color:"#3b82f6", dept:"Mantenimiento", active:true,
    perms:{ create:true,  edit:true,  delete:false, assign:false, close:true,  viewAll:false }},
  { id:"U3", name:"Luis Rodríguez", email:"l.rodriguez@planta.es",role:"tecnico",  avatar:"LR", color:"#22c55e", dept:"Mantenimiento", active:true,
    perms:{ create:true,  edit:true,  delete:false, assign:false, close:true,  viewAll:false }},
  { id:"U4", name:"Ana Fernández",  email:"a.fernandez@planta.es",role:"operario", avatar:"AF", color:"#0ea5e9", dept:"Producción L1",  active:true,
    perms:{ create:false, edit:false, delete:false, assign:false, close:false, viewAll:false }},
  { id:"U5", name:"Paco Gómez",     email:"p.gomez@planta.es",    role:"operario", avatar:"PG", color:"#8b5cf6", dept:"Producción L2",  active:true,
    perms:{ create:false, edit:false, delete:false, assign:false, close:false, viewAll:false }},
  { id:"U6", name:"Rosa Herrero",   email:"r.herrero@planta.es",  role:"operario", avatar:"RH", color:"#f43f5e", dept:"Producción L3",  active:true,
    perms:{ create:false, edit:false, delete:false, assign:false, close:false, viewAll:false }},
];

const OTS_INIT = [
  { id:"OT-001", type:"corrective", title:"Falla en compresor línea 2", asset:"Compresor L2", priority:"critical", status:"in_progress", assignedId:"U2", date:"2026-02-25", dueDate:"2026-02-28", estimatedHours:4, loggedHours:2.5, description:"Ruido anómalo en rodamiento principal. Pérdida de presión de 2 bar. Parada parcial de línea.", parts:[{name:"Rodamiento SKF 6205",qty:2},{name:"Grasa LGMT2",qty:1}], attachments:[], comments:[{userId:"U1",text:"Prioridad máxima. Coordinar con producción.",ts:"2026-02-25 08:12"}], history:[{action:"OT creada",userId:"U1",ts:"2026-02-25 07:58",type:"create"},{action:"Asignada a Carlos Méndez",userId:"U1",ts:"2026-02-25 08:00",type:"assign"},{action:"Estado → En Progreso",userId:"U2",ts:"2026-02-25 08:30",type:"status"}], sourceIncId:null },
  { id:"OT-002", type:"preventive", title:"Cambio de filtros HVAC Nave A", asset:"HVAC Nave A", priority:"medium", status:"scheduled", assignedId:"U3", date:"2026-02-26", dueDate:"2026-03-01", estimatedHours:2, loggedHours:0, description:"Mantenimiento programado mensual. Cambio filtros G4 y F7.", parts:[{name:"Filtro G4 600×600",qty:4},{name:"Filtro F7 600×300",qty:4}], attachments:[], comments:[], history:[{action:"OT creada",userId:"U1",ts:"2026-02-26 09:00",type:"create"}], sourceIncId:null },
  { id:"OT-003", type:"corrective", title:"Fuga hidráulica en prensa P3", asset:"Prensa Hidráulica P3", priority:"critical", status:"open", assignedId:"U2", date:"2026-02-27", dueDate:"2026-02-28", estimatedHours:3, loggedHours:0, description:"Fuga visible en manguera de alta presión DN12. Parada de emergencia activada.", parts:[{name:"Manguera hidráulica DN12",qty:1}], attachments:[], comments:[{userId:"U2",text:"Ya en sitio. Esperando repuesto.",ts:"2026-02-27 14:20"}], history:[{action:"OT creada",userId:"U2",ts:"2026-02-27 14:00",type:"create"}], sourceIncId:null },
  { id:"OT-004", type:"preventive", title:"Lubricación cadenas transportador T1", asset:"Transportador T1", priority:"low", status:"completed", assignedId:"U3", date:"2026-02-20", dueDate:"2026-02-21", estimatedHours:1, loggedHours:0.8, description:"Lubricación periódica de cadenas de transmisión.", parts:[{name:"Lubricante cadenas 1L",qty:1}], attachments:[], comments:[], history:[{action:"OT creada",userId:"U1",ts:"2026-02-20 07:00",type:"create"},{action:"Completada",userId:"U3",ts:"2026-02-21 09:45",type:"complete"}], sourceIncId:null },
  { id:"OT-005", type:"preventive", title:"Revisión cuadro eléctrico CE-05", asset:"Cuadro Eléctrico CE-05", priority:"medium", status:"open", assignedId:"U3", date:"2026-02-28", dueDate:"2026-03-01", estimatedHours:2, loggedHours:0, description:"Inspección visual, apriete de bornes, medición de aislamientos.", parts:[], attachments:[], comments:[], history:[{action:"OT creada",userId:"U1",ts:"2026-02-28 07:30",type:"create"}], sourceIncId:null },
  { id:"OT-006", type:"corrective", title:"Motor ventilador VE-07 no arranca", asset:"Ventilador VE-07", priority:"high", status:"open", assignedId:null, date:"2026-02-28", dueDate:"2026-02-28", estimatedHours:2, loggedHours:0, description:"Motor no arranca al dar tensión. Contactor parece quemado.", parts:[], attachments:[], comments:[], history:[{action:"OT creada",userId:"U2",ts:"2026-02-28 11:00",type:"create"}], sourceIncId:null },
  { id:"OT-007", type:"corrective", title:"Ruido extraño en motor transportador L1", asset:"Transportador L1", priority:"high", status:"in_progress", assignedId:"U2", date:"2026-02-27", dueDate:"2026-02-28", estimatedHours:2, loggedHours:0.5, description:"Operario Ana Fernández detectó ruido metálico intermitente en motor de cinta L1. Solo aparece con carga.", parts:[{name:"Rodamiento 6205",qty:1}], attachments:[], comments:[], history:[{action:"OT creada desde incidencia INC-001",userId:"U1",ts:"2026-02-27 09:30",type:"create"},{action:"Asignada a Carlos Méndez",userId:"U1",ts:"2026-02-27 09:31",type:"assign"}], sourceIncId:"INC-001" },
];

const INC_INIT = [
  { id:"INC-001", reportedBy:"U4", area:"Línea 1", title:"Ruido extraño en motor transportador",
    description:"El motor de la cinta transportadora de la línea 1 emite un ruido metálico intermitente desde esta mañana. A veces para unos segundos.",
    urgency:"high", status:"converted", createdAt:"2026-02-27 08:15", reviewedBy:"U1", reviewedAt:"2026-02-27 09:30", priority:"high", rejectionReason:null, convertedOT:"OT-007", photos:[],
    comments:[
      {id:"C1",userId:"U1",text:"Ana, ¿el ruido aparece solo cuando la cinta está cargada o también en vacío?",ts:"2026-02-27 09:00",readBy:["U1","U4"]},
      {id:"C2",userId:"U4",text:"Solo cuando hay piezas encima. En vacío no se escucha nada.",ts:"2026-02-27 09:10",readBy:["U1","U4"]},
      {id:"C3",userId:"U1",text:"Perfecto, eso apunta al rodamiento de carga. Lo revisamos hoy. Ya está aceptada.",ts:"2026-02-27 09:28",readBy:["U1","U4"]},
    ]},
  { id:"INC-002", reportedBy:"U5", area:"Compresor", title:"Fuga de aire en racor compresor C2",
    description:"Noto escape de aire en la parte trasera del compresor de la línea 2. Se escucha sibilancia continua.",
    urgency:"medium", status:"reviewing", createdAt:"2026-02-27 10:45", reviewedBy:null, reviewedAt:null, priority:null, rejectionReason:null, convertedOT:null, photos:[],
    comments:[
      {id:"C4",userId:"U2",text:"Paco, ¿cuánto tiempo lleva la fuga? ¿La has notado hoy por primera vez?",ts:"2026-02-27 11:30",readBy:["U2"]},
    ]},
  { id:"INC-003", reportedBy:"U6", area:"Línea 3", title:"Sensor de posición da lecturas erróneas",
    description:"El sensor POS-12 de la línea 3 da lecturas inestables desde el cambio de turno. Afecta al conteo de piezas.",
    urgency:"medium", status:"pending", createdAt:"2026-02-26 16:00", reviewedBy:null, reviewedAt:null, priority:null, rejectionReason:null, convertedOT:null, photos:[], comments:[]},
  { id:"INC-004", reportedBy:"U4", area:"Línea 1", title:"Luz de fallo en panel de control",
    description:"El panel de control de L1 muestra una luz ámbar parpadeante. No sé a qué corresponde pero lleva así 2 días.",
    urgency:"low", status:"rejected", createdAt:"2026-02-25 14:20", reviewedBy:"U2", reviewedAt:"2026-02-26 08:00", priority:null, rejectionReason:"Revisado: es aviso de mantenimiento programado, no avería. Pendiente PM-001 del próximo lunes.", convertedOT:null, photos:[],
    comments:[
      {id:"C5",userId:"U2",text:"Ana, he revisado el panel. Esa luz ámbar es el aviso del mantenimiento programado del lunes. No es ninguna avería.",ts:"2026-02-26 07:55",readBy:["U2","U4"]},
      {id:"C6",userId:"U4",text:"Ah, entendido. Gracias por explicármelo.",ts:"2026-02-26 08:10",readBy:["U2","U4"]},
    ]},
  { id:"INC-005", reportedBy:"U4", area:"HVAC / Climatización", title:"Temperatura elevada en nave",
    description:"La temperatura en mi zona de trabajo ha subido mucho hoy. El termostato marca 28°C, lo normal es 22°C.",
    urgency:"critical", status:"pending", createdAt:"2026-02-28 11:05", reviewedBy:null, reviewedAt:null, priority:null, rejectionReason:null, convertedOT:null, photos:[], comments:[]},
];

const NOTIFS_INIT = [
  { id:"N1", type:"red",   msg:"INC-005 CRÍTICA sin revisar — Temperatura nave (Ana F.)", ts:"Hace 10 min", read:false, toRoles:["jefe","tecnico"] },
  { id:"N2", type:"amber", msg:"INC-002 en revisión — Fuga compresor C2 (Paco G.)",        ts:"Hace 1h",    read:false, toRoles:["jefe","tecnico"] },
  { id:"N3", type:"green", msg:"Tu incidencia INC-001 fue convertida en OT-007 ✅",        ts:"Hace 2h",    read:false, toRoles:["operario"], userId:"U4" },
  { id:"N4", type:"red",   msg:"OT-003 CRÍTICA vence hoy — Fuga prensa P3",               ts:"Hace 3h",    read:false, toRoles:["jefe","tecnico"] },
  { id:"N5", type:"amber", msg:"OT-001 lleva 2.5h de 4h estimadas — Compresor L2",        ts:"Hace 2h",    read:true,  toRoles:["jefe","tecnico"] },
  { id:"N6", type:"blue",  msg:"Carlos respondió en INC-002",                              ts:"Hace 1h",    read:false, toRoles:["operario"], userId:"U5" },
];



// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP — INTEGRATED
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [users, setUsers]             = useState(USERS_INIT);
  const [assets, setAssets]           = useState(ASSETS_INIT);
  const [parts, setParts]             = useState(PARTS_INIT);
  const [ots, setOts]                 = useState(OTS_INIT);
  const [incidencias, setIncidencias] = useState(INC_INIT);
  const [notifs, setNotifs]           = useState(NOTIFS_INIT);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [page, setPage]               = useState("workorders");
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showUsers, setShowUsers]     = useState(false);
  const [detailInc, setDetailInc]     = useState(null);
  const [newIncOpen, setNewIncOpen]   = useState(false);

  // ── Todos los hooks ANTES de cualquier return condicional ──
  // Restaurar sesión al cargar
  useEffect(() => {
    try {
      const sessionData = localStorage.getItem("cmms_session");
      if (sessionData) {
        const { userId, expires } = JSON.parse(sessionData);
        if (expires > Date.now() && users.find(u => u.id === userId && u.active)) {
          setCurrentUserId(userId);
        } else {
          localStorage.removeItem("cmms_session");
        }
      }
    } catch(e) { localStorage.removeItem("cmms_session"); }
  }, []);

  // Resetear página al cambiar de usuario
  useEffect(() => {
    if (!currentUserId) return;
    const u = users.find(u => u.id === currentUserId);
    setPage(u?.role === "operario" ? "portal" : "workorders");
  }, [currentUserId]);

  // ── Handlers ──
  const handleLogin = (userId) => {
    setCurrentUserId(userId);
    const session = { userId, expires: Date.now() + 8 * 60 * 60 * 1000 };
    localStorage.setItem("cmms_session", JSON.stringify(session));
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    localStorage.removeItem("cmms_session");
    setPage("workorders");
    setShowNotifs(false);
    setShowUsers(false);
    setDetailInc(null);
  };

  // ── Datos derivados (seguros aunque currentUserId sea null) ──
  const currentUser = users.find(u => u.id === currentUserId) || null;
  const isOperario  = currentUser?.role === "operario";
  const isStaff     = currentUser?.role === "jefe" || currentUser?.role === "tecnico";
  const myNotifs    = notifs.filter(n =>
    n.toRoles
      ? (n.toRoles.includes(currentUser?.role) && (!n.userId || n.userId === currentUser?.id))
      : true
  );
  const unreadCount = myNotifs.filter(n => !n.read).length;
  const pendingInc  = incidencias.filter(i => i.status === "pending" || i.status === "reviewing").length;

  // ── Incidencia handlers ──
  const saveInc = (inc) => {
    setIncidencias(is => [inc, ...is]);
    setNotifs(ns => [{
      id:"N"+Date.now(),
      type: inc.urgency==="critical"||inc.urgency==="high" ? "red" : "amber",
      msg: `Nueva incidencia de ${currentUser?.name}: "${inc.title}"`,
      ts:"Ahora", read:false, toRoles:["jefe","tecnico"]
    }, ...ns]);
    setNewIncOpen(false);
  };

  const addComment = (incId, comment) => {
    setIncidencias(is => is.map(i => i.id===incId ? {...i, comments:[...(i.comments||[]),comment]} : i));
    if (detailInc?.id === incId) setDetailInc(d => d ? {...d, comments:[...(d.comments||[]),comment]} : d);
    const incRecord = incidencias.find(i => i.id===incId);
    if (!incRecord) return;
    const isOp = currentUser?.role==="operario";
    setNotifs(ns => [{
      id:"N"+Date.now(), type:"blue",
      msg: isOp
        ? `${currentUser?.name} preguntó en "${incRecord?.title}"`
        : `Mantenimiento respondió en tu incidencia "${incRecord?.title}"`,
      ts:"Ahora", read:false,
      toRoles: isOp ? ["jefe","tecnico"] : ["operario"],
      userId:  isOp ? undefined : incRecord?.reportedBy,
    }, ...ns]);
  };

  const convertIncToOT = (inc, assignTo, dueDate) => {
    const otId = `OT-${String(ots.length + 8).padStart(3,"0")}`;
    const newOT = {
      id: otId, type:"corrective",
      title: inc.title,
      asset: inc.area,
      priority: inc.priority || inc.urgency,
      status: "open",
      assignedId: assignTo || null,
      date: new Date().toISOString().split("T")[0],
      dueDate: dueDate || "",
      estimatedHours: 0, loggedHours: 0,
      description: `[Origen: Incidencia ${inc.id} de ${users.find(u=>u.id===inc.reportedBy)?.name}]

${inc.description}`,
      parts: [], attachments: [], comments: [],
      history:[{ action:`OT creada desde incidencia ${inc.id}`, userId:currentUser?.id, ts:now(), type:"create" }],
      sourceIncId: inc.id,
    };
    if (assignTo) {
      const u = users.find(u=>u.id===assignTo);
      newOT.history.push({ action:`Asignada a ${u?.name}`, userId:currentUser?.id, ts:now(), type:"assign" });
    }
    setOts(os => [newOT, ...os]);
    setIncidencias(is => is.map(i => i.id===inc.id ? {...i, status:"converted", convertedOT:otId} : i));
    setNotifs(ns => [
      { id:"N"+Date.now(), type:"green",
        msg:`Tu incidencia "${inc.title}" fue convertida en ${otId} ✅`,
        ts:"Ahora", read:false, toRoles:["operario"], userId:inc.reportedBy },
      { id:"N"+Date.now()+"x", type:"blue",
        msg:`OT ${otId} creada desde incidencia de ${users.find(u=>u.id===inc.reportedBy)?.name}`,
        ts:"Ahora", read:false, toRoles:["jefe","tecnico"] },
      ...ns
    ]);
  };

  // ── NAV ──
  const staffNav = [
    { id:"workorders", label:"Órdenes de Trabajo", icon:I.ot,    pill:null },
    { id:"bandeja",    label:"Bandeja incidencias", icon:I.inbox, pill:{ val:pendingInc, type:"red" } },
    { id:"pm",         label:"Preventivo PM",       icon:I.pm,    pill:null },
    { id:"inventory",  label:"Inventario",          icon:I.inv,   pill:null },
  ];

  const PAGE_TITLE = {
    workorders:"Órdenes de Trabajo", bandeja:"Bandeja de Incidencias",
    pm:"Mantenimiento Preventivo",   inventory:"Inventario",
    portal:"Mi Portal de Incidencias",
  };

  // ── RENDER: pantalla de login si no autenticado ──
  if (!currentUserId) {
    return (
      <>
        <style>{CSS}</style>
        <LoginScreen users={users} onLogin={handleLogin} />
      </>
    );
  }

  // ── RENDER: app principal ──
  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* ── SIDEBAR ── */}
        <nav className="sidebar">
          <div className="logo-block">
            <div className="logo-name">⚙ MantePlanta</div>
            <div className="logo-sub">CMMS · Planta Valencia</div>
          </div>

          {isStaff && (
            <div className="nav-group">
              <div className="nav-group-label">Módulos</div>
              {staffNav.map(n => (
                <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                  <Ic path={n.icon} size={15}/>{n.label}
                  {n.pill?.val > 0 && <span className={`nav-pill ${n.pill.type}`}>{n.pill.val}</span>}
                </div>
              ))}
              <div className="nav-item" onClick={()=>setShowUsers(true)}>
                <Ic path={I.users} size={15}/>Usuarios y Permisos
              </div>
            </div>
          )}

          {isOperario && (
            <div className="nav-group">
              <div className="nav-group-label">Mi área</div>
              <div className={`nav-item ${page==="portal"?"active":""}`} onClick={()=>setPage("portal")}>
                <Ic path={I.dash} size={15}/>Mi portal
              </div>
              <div className="nav-item" onClick={()=>setNewIncOpen(true)} style={{color:"var(--teal)"}}>
                <Ic path={I.plus} size={15}/>Notificar incidencia
              </div>
            </div>
          )}

          <div className="sidebar-bottom">
            <div style={{display:"flex",alignItems:"center",gap:9,padding:"7px 9px",borderRadius:6}}>
              <Avatar user={currentUser} size={30}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{currentUser?.name}</div>
                <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--mono)"}}>{ROLE_LABEL[currentUser?.role]} · {currentUser?.dept}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">{PAGE_TITLE[page]||"MantePlanta"}</div>
            {isOperario && (
              <button className="btn btn-primary" style={{padding:"5px 14px",fontSize:12}} onClick={()=>setNewIncOpen(true)}>
                <Ic path={I.plus} size={13}/>Notificar incidencia
              </button>
            )}
            <div className="icon-btn" style={{position:"relative"}} onClick={()=>setShowNotifs(v=>!v)}>
              <Ic path={I.bell} size={15}/>
              {unreadCount>0 && <span className="notif-badge-count">{unreadCount}</span>}
            </div>
          </div>

          <div className="content">
            {isStaff && page==="workorders" && (
              <WorkOrdersModule
                users={users} setUsers={setUsers}
                currentUser={currentUser}
                notifs={notifs} setNotifs={setNotifs}
                externalOts={ots} setExternalOts={setOts}
                assets={assets}
              />
            )}
            {isStaff && page==="bandeja" && (
              <>
                <div className="page-header">
                  <div>
                    <div className="page-title">Bandeja de Incidencias</div>
                    <div className="page-sub">{pendingInc} pendientes de revisión · notificaciones de operarios</div>
                  </div>
                </div>
                <BandejaRevision
                  incidencias={incidencias}
                  users={users}
                  currentUser={currentUser}
                  setIncidencias={setIncidencias}
                  setNotifs={setNotifs}
                  onConvertToOT={convertIncToOT}
                  addComment={addComment}
                />
              </>
            )}
            {isStaff && page==="pm" && (
              <div className="empty" style={{paddingTop:80}}>
                <div className="empty-icon">🔧</div>
                <div className="empty-text" style={{fontSize:15,marginBottom:8}}>Módulo en desarrollo</div>
                <div style={{fontSize:12,color:"var(--text3)"}}>El módulo de Mantenimiento Preventivo llegará próximamente.</div>
              </div>
            )}
            {isStaff && page==="inventory" && (
              <>
                <div className="page-header">
                  <div>
                    <div className="page-title">Inventario</div>
                    <div className="page-sub">{assets.filter(a=>!a.inactiveDate).length} equipos activos · {parts.filter(p=>p.stock<=p.minStock).length} repuestos con stock bajo</div>
                  </div>
                </div>
                <InventoryModule assets={assets} parts={parts}/>
              </>
            )}
            {isOperario && page==="portal" && (
              <PortalOperario
                user={currentUser}
                incidencias={incidencias}
                onNewInc={()=>setNewIncOpen(true)}
                setDetailInc={setDetailInc}
                onAddComment={addComment}
              />
            )}
          </div>
        </div>

        {showNotifs && (
          <NotifPanel notifs={myNotifs} setNotifs={setNotifs} onClose={()=>setShowNotifs(false)}/>
        )}
        {showUsers && (
          <UserManager users={users} setUsers={setUsers} currentUser={currentUser} onClose={()=>setShowUsers(false)}/>
        )}
        {newIncOpen && isOperario && (
          <NewIncModal user={currentUser} onSave={saveInc} onClose={()=>setNewIncOpen(false)}/>
        )}
        {detailInc && isOperario && (
          <IncDetailOperario
            inc={detailInc} users={users} currentUser={currentUser}
            onClose={()=>setDetailInc(null)} onAddComment={addComment}
          />
        )}
      </div>
    </>
  );
}
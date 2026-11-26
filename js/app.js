// File: js/app.js
(function () {
  "use strict";

  const D = window.ALGODESK_DATA;
  const app = document.getElementById("app");
  const clone = (v) => JSON.parse(JSON.stringify(v));

  const state = {
    docs: clone(D.knowledge.docs),
    modalOpen: false,
    modalTab: "text",
    tasks: clone(D.ops.tasks),
    selectedTaskId: D.ops.tasks[0].id,
    chat: clone(D.qa.messages),
    quick: clone(D.qa.quick),
    waiting: D.qa.waiting,
    toggles: { ssoRequired: false, ip: false, device: false },
    slackResult: null
  };

  /* ---------- Helpers ---------- */
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name, cls = "") => `<i data-lucide="${name}" class="ic ${cls}"></i>`;
  const pill = (text, tone = "slate", extra = "") => `<span class="pill pill-${tone} ${extra}">${esc(text)}</span>`;
  const logo = (cls = "") => `<div class="logo ${cls}">A</div>`;
  const avatar = (ch, cls = "") => `<div class="avatar ${cls}">${esc(ch)}</div>`;
  const nowTime = () => {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const nowStamp = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const refreshIcons = () => {
    if (window.lucide) window.lucide.createIcons();
  };

  let toastTimer;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  const notionLogo = () => `
    <span class="brand-tile">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="#fff" stroke="#111" stroke-width="1.8"/>
        <path d="M8 17V7.5l8 9.5V7" fill="none" stroke="#111" stroke-width="2"/>
      </svg>
    </span>`;

  const driveLogo = () => `
    <span class="brand-tile">
      <svg width="20" height="18" viewBox="0 0 24 21" aria-hidden="true">
        <path d="M8 0h8l8 14h-8z" fill="#FFBA00"/>
        <path d="M0 14L8 0l4 7-4 7z" fill="#0F9D58"/>
        <path d="M4 21l4-7h16l-4 7z" fill="#4285F4"/>
      </svg>
    </span>`;

  const pageHead = (title, sub, actions = "") => `
    <div class="page-head">
      <div>
        <h1>${title}</h1>
        <p>${sub}</p>
      </div>
      <div class="head-actions">${actions}</div>
    </div>`;

  /* ---------- Admin Shell ---------- */
  const NAV = [
    { id: "dashboard", label: "ダッシュボード", icon: "house" },
    { id: "qa", label: "ブラウザQ&A", icon: "circle-help" },
    { id: "knowledge", label: "ナレッジ", icon: "book-open" },
    { id: "ops", label: "情シス業務", icon: "clipboard-check" },
    { id: "slack", label: "Slackデモ", icon: "hash", tag: "DEMO" }
  ];

  function adminShell(active, crumbs, body) {
    const nav = NAV.map(
      (n) => `
        <a href="#/${n.id}" class="nav-item ${active === n.id ? "active" : ""}">
          ${icon(n.icon)}<span>${n.label}</span>${n.tag ? `<span class="tag">${n.tag}</span>` : ""}
        </a>`
    ).join("");

    const crumbHtml = crumbs
      .map((c, i) => (i === crumbs.length - 1 ? `<strong>${esc(c)}</strong>` : `<span>${esc(c)}</span><span>/</span>`))
      .join("");

    return `
      <div class="frame">
        <aside class="sidebar">
          <div class="brand">
            ${logo()}
            <div>
              <div class="brand-name">AlgoDesk</div>
              <div class="brand-sub">AIヘルプデスク</div>
            </div>
          </div>
          <button class="ws-select" data-action="toast" data-msg="デモ環境のため、ワークスペースは1つのみです。">
            <span><small>ワークスペース</small><strong>${esc(D.meta.workspace)}</strong></span>
            ${icon("chevron-down")}
          </button>
          <nav class="nav">${nav}</nav>
          <div class="sidebar-bottom">
            <a href="#/settings" class="nav-item ${active === "settings" ? "active" : ""}">${icon("settings")}<span>設定</span></a>
            <div class="me">
              ${avatar("管")}
              <div><strong>${esc(D.meta.adminName)}</strong><small>${esc(D.meta.plan)}</small></div>
            </div>
          </div>
        </aside>
        <div class="main">
          <header class="topbar">
            <div class="crumbs">${crumbHtml}</div>
            <div class="top-right">
              <span class="badge">デモ環境</span>
              <button class="icon-btn" data-action="toast" data-msg="新しい通知が1件あります（デモ）" aria-label="通知">
                ${icon("bell")}<span class="dot-orange"></span>
              </button>
              ${avatar("管")}
            </div>
          </header>
          <div class="page">${body}</div>
        </div>
      </div>`;
  }

  /* ---------- Dashboard ---------- */
  function viewDashboard() {
    const d = D.dashboard;
    const max = 15;

    const kpis = d.kpis
      .map(
        (k) => `
        <div class="card kpi">
          <div class="kpi-head"><span>${k.label}</span>${icon(k.icon, k.tone || "")}</div>
          <div class="kpi-value">${k.value}<small>${k.unit}</small></div>
          <div class="kpi-note">${k.note}${k.dot ? '<span class="dot amber"></span>' : ""}${k.noteIcon ? icon(k.noteIcon, "xs") : ""}</div>
        </div>`
      )
      .join("");

    const gridlines = [0, 5, 10, 15]
      .map((v) => `<div class="gridline" style="top:${(1 - v / max) * 100}%"><span>${v}</span></div>`)
      .join("");

    const bars = d.daily
      .map(
        (v, i) => `
        <div class="bar-col">
          <div class="bar" style="height:${(v / max) * 100}%"><span>${v}</span></div>
          <em>${d.dailyLabels[i] || ""}</em>
        </div>`
      )
      .join("");

    const total = d.status.reduce((s, x) => s + x.count, 0);
    const last = d.status[d.status.length - 1];
    let acc = 0;
    const stops = d.status
      .map((s) => {
        const from = (acc / total) * 100;
        acc += s.count;
        return `${s.color} ${from}% ${(acc / total) * 100}%`;
      })
      .join(", ");
    const startDeg = (last.count / total) * 360;

    const legend = d.status
      .map((s) => `<li><span class="dot" style="background:${s.color}"></span>${s.label}<b>${s.count}件</b></li>`)
      .join("");

    const rows = d.recent
      .map(
        (r) => `
        <tr>
          <td>${esc(r.q)}</td>
          <td>${esc(r.ch)}</td>
          <td>${pill(r.status, r.tone)}</td>
          <td>${esc(r.updated)}</td>
          <td class="row-link"><a href="${r.link}" aria-label="詳細">${icon("chevron-right", "sm")}</a></td>
        </tr>`
      )
      .join("");

    const sources = d.sources
      .map(
        (s) => `
        <div class="sync-item">
          ${s.type === "notion" ? notionLogo() : driveLogo()}
          <div>
            <strong>${s.name}</strong>
            <small>${s.count}<span class="ok">${icon("circle-check", "xs")}同期完了</span></small>
          </div>
        </div>`
      )
      .join("");

    const body = `
      ${pageHead(
        "ダッシュボード",
        "問い合わせ対応と、AlgoDeskの導入効果を確認できます。",
        `<button class="btn" data-action="toast" data-msg="デモでは2026年10月のデータのみ表示します。">${icon("calendar", "sm")}${d.month}${icon("chevron-down", "sm")}</button>
         <button class="btn" data-action="toast" data-msg="分析レポートは次期アップデートで公開予定です。">レポートを見る</button>`
      )}
      <div class="grid-4">${kpis}</div>
      <div class="dash-row">
        <div class="card card-pad">
          <div class="card-head">
            <h2 class="card-title">問い合わせ推移</h2>
            <button class="chip-select">日別${icon("chevron-down", "sm")}</button>
          </div>
          <div class="chart">${gridlines}<div class="bars">${bars}</div></div>
        </div>
        <div class="card card-pad">
          <h2 class="card-title">対応状況</h2>
          <div class="donut" style="background:conic-gradient(from ${startDeg}deg, ${stops})">
            <div class="donut-center"><strong>${total}<small>件</small></strong><span>問い合わせ</span></div>
          </div>
          <ul class="legend">${legend}</ul>
        </div>
      </div>
      <div class="card card-pad">
        <div class="card-head">
          <h2 class="card-title">最近の問い合わせ</h2>
          <a class="link" href="#/dashboard">すべて見る${icon("arrow-right", "sm")}</a>
        </div>
        <table class="table">
          <thead><tr><th>問い合わせ</th><th>チャネル</th><th>状態</th><th>更新</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="card card-pad sync-row">
        <h2 class="card-title" style="width:200px">ナレッジ同期状況</h2>
        ${sources}
        <div style="margin-left:auto;text-align:right">
          <a class="link" href="#/knowledge">ナレッジを管理${icon("arrow-right", "sm")}</a>
          <div style="font-size:11px;color:#475569">最終同期 ${d.lastSync} ｜ デモデータ</div>
        </div>
      </div>`;

    return adminShell("dashboard", ["ワークスペース", "ダッシュボード"], body);
  }

  /* ---------- Knowledge ---------- */
  function docRows() {
    return state.docs
      .map(
        (d) => `
        <tr data-title="${esc(d.title)}" data-source="${esc(d.source)}">
          <td>${esc(d.title)}</td>
          <td>${esc(d.source)}</td>
          <td>${esc(d.category)}</td>
          <td>${d.status === "利用可能" ? pill("利用可能", "green", "pill-sq") : pill(d.status, "indigo", "pill-sq")}</td>
          <td>${esc(d.updated)}</td>
        </tr>`
      )
      .join("");
  }

  function knowledgeModal() {
    const k = D.knowledge;
    const t = state.modalTab;
    const tabBtn = (id, label, ico) =>
      `<button class="${t === id ? "active" : ""}" data-action="modal-tab" data-tab="${id}">${ico}${label}</button>`;

    let content;
    if (t === "text") {
      content = `
        <p style="font-size:13px;color:#475569">タイトルと本文を入力して、ナレッジを追加します。</p>
        <div class="field">
          <label for="kn-title">タイトル <span class="req">必須</span></label>
          <input id="kn-title" class="input" value="${esc(k.draft.title)}">
        </div>
        <div class="field">
          <label for="kn-category">カテゴリ</label>
          <div class="select-wrap">
            <select id="kn-category" class="input">
              ${k.categories.map((c) => `<option ${c === k.draft.category ? "selected" : ""}>${c}</option>`).join("")}
            </select>
            ${icon("chevron-down", "sm")}
          </div>
        </div>
        <div class="field">
          <label for="kn-body">本文 <span class="req">必須</span></label>
          <textarea id="kn-body" class="textarea">${esc(k.draft.body)}</textarea>
        </div>
        <div class="info-bar">${icon("info", "sm")}登録後、取り込みが完了すると回答に利用できます。</div>`;
    } else {
      const isNotion = t === "notion";
      content = `
        <div class="connect-box">
          ${isNotion ? notionLogo() : driveLogo()}
          <div>
            <strong>${isNotion ? "Notion" : "Google Drive"} と連携済み</strong><br>
            <small>${isNotion ? "24ページ" : "18ファイル"}を自動で同期しています。</small>
          </div>
          <button class="btn btn-sm" data-action="toast" data-msg="同期を開始しました（デモ）">今すぐ同期</button>
        </div>
        <div class="info-bar">${icon("info", "sm")}取り込む範囲は「連携ソース」タブで変更できます。</div>`;
    }

    return `
      <div class="overlay" data-action="close-modal">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="kn-modal-title">
          <div class="modal-head">
            ${icon("file-text", "lg primary")}
            <div>
              <h2 id="kn-modal-title">ナレッジを追加</h2>
              <p>社内の手順やルールを、AIの回答に活用できます。</p>
            </div>
            <button class="icon-btn" data-action="close-modal" aria-label="閉じる">${icon("x")}</button>
          </div>
          <div class="modal-body">
            <div class="seg">
              ${tabBtn("text", "テキスト入力", icon("file-text", "sm"))}
              ${tabBtn("notion", "Notion", notionLogo())}
              ${tabBtn("drive", "Google Drive", driveLogo())}
            </div>
            ${content}
          </div>
          <div class="modal-foot">
            <span>デモ用のナレッジ登録</span>
            <div>
              <button class="btn" data-action="close-modal">キャンセル</button>
              ${t === "text" ? `<button class="btn btn-primary" data-action="register-knowledge">登録する</button>` : ""}
            </div>
          </div>
        </div>
      </div>`;
  }

  function viewKnowledge() {
    const body = `
      ${pageHead(
        "ナレッジ",
        "AlgoDeskの回答に使用する社内情報を管理します。",
        `<button class="btn btn-primary" data-action="open-modal">${icon("plus", "sm")}ナレッジを追加</button>`
      )}
      <div class="toolbar">
        <div class="tabs">
          <button class="tab active">ドキュメント</button>
          <button class="tab" data-action="toast" data-msg="連携ソースの管理画面は次期アップデートで公開予定です。">連携ソース</button>
        </div>
        <div class="toolbar-right">
          <div class="search">${icon("search", "sm")}<input id="kn-search" class="input" placeholder="ナレッジを検索"></div>
          <div class="select-wrap">
            <select id="kn-source" class="input">
              <option value="">すべての登録元</option>
              <option>Notion</option>
              <option>Google Drive</option>
              <option>テキスト入力</option>
            </select>
            ${icon("chevron-down", "sm")}
          </div>
        </div>
      </div>
      <div class="card card-pad" style="padding-top:6px;padding-bottom:6px">
        <table class="table">
          <thead><tr><th>タイトル</th><th>登録元</th><th>カテゴリ</th><th>状態</th><th>最終更新</th></tr></thead>
          <tbody id="kn-rows">${docRows()}</tbody>
        </table>
      </div>
      ${state.modalOpen ? knowledgeModal() : ""}`;

    return adminShell("knowledge", ["ワークスペース", "ナレッジ"], body);
  }

  function filterDocs() {
    const q = (document.getElementById("kn-search")?.value || "").trim().toLowerCase();
    const src = document.getElementById("kn-source")?.value || "";
    document.querySelectorAll("#kn-rows tr").forEach((tr) => {
      const hit = tr.dataset.title.toLowerCase().includes(q) && (!src || tr.dataset.source === src);
      tr.hidden = !hit;
    });
  }

  function registerKnowledge() {
    const title = document.getElementById("kn-title").value.trim();
    const body = document.getElementById("kn-body").value.trim();
    const category = document.getElementById("kn-category").value;
    if (!title || !body) {
      toast("タイトルと本文は必須です。");
      return;
    }
    const doc = { title, source: "テキスト入力", category, status: "取り込み中", updated: nowStamp() };
    state.docs.unshift(doc);
    state.modalOpen = false;
    render();
    toast("ナレッジを登録しました。取り込みが完了すると回答に利用できます。");
    setTimeout(() => {
      doc.status = "利用可能";
      const tbody = document.getElementById("kn-rows");
      if (tbody) {
        tbody.innerHTML = docRows();
        filterDocs();
      }
    }, 1800);
  }

  /* ---------- Ops ---------- */
  const doneCount = (t) => t.items.filter((i) => i.done).length;

  function viewOps() {
    const o = D.ops;
    const task = state.tasks.find((t) => t.id === state.selectedTaskId) || state.tasks[0];

    const kpis = o.kpis
      .map(
        (k) => `
        <div class="card kpi-side">
          ${icon(k.icon, `lg ${k.tone}`)}
          <div>
            <div class="label">${k.label}</div>
            <div class="kpi-value">${k.value}<small>件</small></div>
            <div class="kpi-note">${k.note}</div>
          </div>
        </div>`
      )
      .join("");

    const templates = o.templates
      .map(
        (t) => `
        <div class="card template">
          ${icon(t.icon, "lg")}
          <h3>${t.title}</h3>
          <p>${t.desc}</p>
          <button class="link" data-action="toast" data-msg="「${t.title}」から業務を作成しました（デモ）">${t.cta}${icon("arrow-right", "xs")}</button>
        </div>`
      )
      .join("");

    const owners = [...new Set(state.tasks.map((t) => t.owner))];

    const rows = state.tasks
      .map((t) => {
        const done = doneCount(t);
        const total = t.items.length;
        return `
          <tr class="task-row ${t.id === task.id ? "selected" : ""}" data-action="select-task" data-id="${t.id}" data-name="${esc(t.name)}" data-owner="${esc(t.owner)}">
            <td class="task-name"><strong>${esc(t.name)}</strong>${pill(t.template, t.id === task.id ? "indigo" : "slate", "pill-sq")}</td>
            <td>${esc(t.owner)}</td>
            <td class="${t.overdue ? "overdue" : ""}">${esc(t.due)} ${t.overdue ? pill("期限超過", "amber", "pill-sq") : ""}</td>
            <td><div class="prog-cell"><div class="progress"><span style="width:${(done / total) * 100}%"></span></div><span>${done} / ${total}</span></div></td>
          </tr>`;
      })
      .join("");

    const done = doneCount(task);
    const next = task.items.find((i) => !i.done);
    const checklist = task.items
      .map(
        (it, idx) => `
        <li>
          <button class="checkbox ${it.done ? "on" : ""}" data-action="toggle-check" data-index="${idx}" aria-label="${esc(it.t)}">${it.done ? icon("check", "xs") : ""}</button>
          <div><strong>${esc(it.t)}</strong><small>${esc(it.s)}</small></div>
          ${it.action && !it.done ? `<button class="btn btn-sm" data-action="toast" data-msg="「${esc(it.action)}」を開きます（デモ）">${esc(it.action)}</button>` : ""}
        </li>`
      )
      .join("");

    const body = `
      ${pageHead(
        "情シス業務",
        "定型業務をテンプレートから開始し、対応漏れと進捗をまとめて管理できます。",
        `<button class="btn btn-primary" data-action="toast" data-msg="テンプレートを選択して業務を開始します（デモ）">${icon("plus", "sm")}業務を開始</button>`
      )}
      <div class="tabs">
        <button class="tab active">業務一覧</button>
        <button class="tab" data-action="toast" data-msg="テンプレート管理は次期アップデートで公開予定です。">テンプレート</button>
        <button class="tab" data-action="toast" data-msg="実行履歴は次期アップデートで公開予定です。">実行履歴</button>
      </div>
      <div class="grid-4">${kpis}</div>
      <div class="section-head">
        <h2>テンプレートから開始</h2>
        <button class="link" data-action="toast" data-msg="すべてのテンプレートを表示します（デモ）">すべてのテンプレート${icon("arrow-right", "sm")}</button>
      </div>
      <div class="template-grid">${templates}</div>
      <div class="ops-row">
        <div class="card card-pad">
          <div class="card-head">
            <h2 class="card-title" style="font-size:17px">進行中の業務</h2>
            <div class="select-wrap" style="width:150px">
              <select id="ops-owner" class="input" style="height:32px;font-size:12.5px">
                <option value="">すべての担当者</option>
                ${owners.map((o) => `<option>${o}</option>`).join("")}
              </select>
              ${icon("chevron-down", "xs")}
            </div>
          </div>
          <div class="search ops-filters">${icon("search", "sm")}<input id="ops-search" class="input" placeholder="業務名・対象者で検索"></div>
          <table class="table">
            <thead><tr><th>業務名</th><th>担当</th><th>期限</th><th>進捗</th></tr></thead>
            <tbody id="ops-rows">${rows}</tbody>
          </table>
          <div class="table-foot">
            <span>進行中8件のうち${state.tasks.length}件を表示</span>
            <button class="link" data-action="toast" data-msg="すべての業務を表示します（デモ）">すべて見る${icon("arrow-right", "sm")}</button>
          </div>
        </div>
        <div class="card card-pad" style="display:flex;flex-direction:column;gap:14px">
          <div class="detail-head">
            <div>
              ${pill(task.template, "indigo", "pill-sq")}
              <h2>${esc(task.name)}</h2>
              <small>${esc(task.meta)}</small>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:14px">
              <button class="icon-btn" aria-label="メニュー">${icon("ellipsis")}</button>
              ${done === task.items.length ? pill("完了", "green") : `<span class="pill pill-indigo"><span class="dot indigo"></span>進行中</span>`}
            </div>
          </div>
          <div>
            <div class="card-head" style="margin-bottom:8px">
              <strong>チェックリスト</strong>
              <span style="font-size:13px">${done} / ${task.items.length} 完了</span>
            </div>
            <div class="progress" style="height:8px"><span style="width:${(done / task.items.length) * 100}%"></span></div>
          </div>
          <ul class="checklist">${checklist}</ul>
          <div class="ai-next">
            ${logo("mini")}
            ${next ? `次の対応：${esc(next.t)}を確認してください。` : "すべての項目が完了しました。業務を完了にできます。"}
          </div>
          <div class="table-foot" style="margin-top:auto">
            <span>テンプレートから自動作成</span>
            <button class="link" data-action="toast" data-msg="業務の詳細画面を開きます（デモ）">詳細を開く${icon("arrow-right", "sm")}</button>
          </div>
        </div>
      </div>`;

    return adminShell("ops", ["ワークスペース", "情シス業務"], body);
  }

  function filterOps() {
    const q = (document.getElementById("ops-search")?.value || "").trim();
    const owner = document.getElementById("ops-owner")?.value || "";
    document.querySelectorAll("#ops-rows tr").forEach((tr) => {
      tr.hidden = !(tr.dataset.name.includes(q) && (!owner || tr.dataset.owner === owner));
    });
  }

  /* ---------- Settings / Security ---------- */
  function viewSettings() {
    const tg = state.toggles;
    const logs = D.security.auditLogs
      .map((l) => `<tr><td>${l.time}</td><td>${esc(l.user)}</td><td>${esc(l.action)}</td><td>${pill(l.result, "green", "pill-sq")}</td></tr>`)
      .join("");

    const body = `
      ${pageHead(
        "セキュリティ設定",
        "認証、操作記録、データの取り扱いを管理します。",
        `<button class="btn" data-action="toast" data-msg="セキュリティホワイトペーパーを開きます（デモ）">${icon("file-text", "sm")}セキュリティ資料</button>`
      )}
      <div class="tabs">
        ${["一般", "メンバー", "連携", "セキュリティ", "請求"]
          .map((t) => `<button class="tab ${t === "セキュリティ" ? "active" : ""}" ${t !== "セキュリティ" ? `data-action="toast" data-msg="「${t}」タブはデモでは表示されません。"` : ""}>${t}</button>`)
          .join("")}
      </div>
      <p class="settings-note">${esc(D.meta.plan)}の設定例です。表示内容はデモデータです。</p>

      <div class="grid-2">
        <div class="card set-card">
          <div class="set-title">
            ${icon("lock", "lg")}
            <div><h2>シングルサインオン</h2><p>社内の認証基盤でAlgoDeskにログインできます。</p></div>
          </div>
          <dl class="kv">
            <dt>認証方式</dt>
            <dd><span class="radio on"><i></i>SAML 2.0</span><span class="radio"><i></i>OpenID Connect</span></dd>
            <dt>プロバイダー</dt>
            <dd><div class="readonly">Microsoft Entra ID</div></dd>
            <dt>接続状態</dt>
            <dd><span class="pill pill-green">${icon("circle-check", "xs")}接続テスト成功</span></dd>
          </dl>
          <div class="btn-row">
            <button class="btn btn-soft" data-action="toast" data-msg="接続設定を編集します（デモ）">接続設定を編集</button>
            <button class="btn" data-action="toast" data-msg="接続テストに成功しました（デモ）">接続テスト</button>
          </div>
          <div class="divider"></div>
          <div class="toggle-line">SSOを必須にする<button class="switch ${tg.ssoRequired ? "on" : ""}" data-action="toggle" data-key="ssoRequired" aria-label="SSOを必須にする"></button></div>
          <p class="help">接続確認後に有効化してください。緊急管理者の復旧経路を確保してください。</p>
        </div>

        <div class="card set-card">
          <div class="set-title">
            ${icon("file-text", "lg")}
            <div><h2>監査ログ</h2><p>全API呼び出しと全質問の履歴を記録します。</p></div>
            <span class="pill pill-green"><span class="dot green"></span>記録中</span>
          </div>
          <table class="table">
            <thead><tr><th>時刻</th><th>ユーザー</th><th>操作</th><th>結果</th></tr></thead>
            <tbody>${logs}</tbody>
          </table>
          <div class="btn-row">
            <button class="btn btn-soft" data-action="toast" data-msg="監査ログの一覧を開きます（デモ）">ログを確認</button>
            <button class="btn" data-action="toast" data-msg="CSVをエクスポートしました（デモ）">エクスポート</button>
          </div>
          <p class="help">管理者のみ閲覧可能。機密情報はマスキングして表示します。</p>
        </div>

        <div class="card set-card">
          <div class="set-title">
            ${icon("file-text", "lg")}
            <div><h2>データ非学習保証 ${pill("契約条項に明記", "indigo", "pill-sq")}</h2><p>質問・回答・登録ナレッジを、AIモデルの学習に使用しません。</p></div>
          </div>
          <dl class="kv">
            <dt>関連文書</dt><dd>利用契約 / データ処理契約書（DPA）</dd>
            <dt>確認事項</dt><dd>適用対象・委託先・保存期間</dd>
          </dl>
          <div class="btn-row">
            <button class="link" data-action="toast" data-msg="非学習条項を開きます（デモ）">非学習条項を確認${icon("external-link", "xs")}</button>
            <button class="link" data-action="toast" data-msg="DPAを開きます（デモ）">DPAを確認${icon("external-link", "xs")}</button>
          </div>
        </div>

        <div class="card set-card">
          <div class="set-title">
            ${icon("database", "lg")}
            <div><h2>データ保管リージョン ${pill("デモ設定例", "indigo", "pill-sq")}</h2><p style="font-size:16px;font-weight:700;color:var(--text)">日本・東京</p></div>
          </div>
          <dl class="kv">
            <dt>対象</dt><dd>データベース、ファイル、バックアップ</dd>
            <dt>リージョン変更</dt><dd>サポートへの相談が必要です。</dd>
          </dl>
          <div class="btn-row">
            <button class="link" data-action="toast" data-msg="保管範囲・委託先を開きます（デモ）">保管範囲・委託先を確認${icon("external-link", "xs")}</button>
          </div>
          <div class="info-bar" style="margin-top:12px">${icon("info", "sm")}外部AIサービスの処理地域は、データ保管地域とは別に確認できます。</div>
        </div>
      </div>

      <div class="card set-card">
        <div class="set-title">
          ${icon("shield", "lg")}
          <div><h2>アクセス制限 <span style="font-size:12.5px;font-weight:400;color:#475569">許可するネットワークと端末の条件を設定します。</span></h2></div>
        </div>
        <div class="access-cols">
          <div>
            <h3>IP制限</h3>
            <dl class="kv">
              <dt>IP制限</dt>
              <dd class="toggle-line"><button class="switch ${tg.ip ? "on" : ""}" data-action="toggle" data-key="ip" aria-label="IP制限"></button>IP制限を有効にする</dd>
              <dt>許可するIPアドレス / CIDR</dt>
              <dd style="display:flex;gap:10px;align-items:center"><input class="input" value="203.0.113.0/24" style="height:32px"><button class="link">入力例</button></dd>
              <dt></dt>
              <dd><button class="btn btn-sm" data-action="toast" data-msg="許可IPを追加します（デモ）">${icon("plus", "xs")}許可IPを追加</button></dd>
            </dl>
            <p class="help">有効にすると、許可した送信元からのみアクセスできます。</p>
          </div>
          <div>
            <h3>デバイス制限</h3>
            <dl class="kv">
              <dt>管理対象デバイス</dt>
              <dd class="toggle-line"><button class="switch ${tg.device ? "on" : ""}" data-action="toggle" data-key="device" aria-label="デバイス制限"></button>管理対象デバイスのみ許可</dd>
              <dt>条件</dt>
              <dd style="display:flex;gap:10px;align-items:center"><div class="readonly" style="flex:1">社内で管理されている端末</div>${pill("端末連携が必要", "amber", "pill-sq")}</dd>
              <dt></dt>
              <dd><button class="btn btn-sm btn-soft" data-action="toast" data-msg="端末連携を設定します（デモ）">端末連携を設定</button></dd>
            </dl>
            <p class="help">端末の判定には、IdPまたはMDMとの連携が必要です。</p>
          </div>
        </div>
        <div class="warn-bar" style="margin-top:14px">${icon("circle-alert", "sm")}制限を有効にする前に、現在の端末からアクセスできることを確認してください。</div>
      </div>

      <div class="form-foot">
        <button class="btn" data-action="reset-settings">キャンセル</button>
        <button class="btn btn-primary" data-action="toast" data-msg="デモ環境のため、設定は保存されません。">変更を確認</button>
      </div>`;

    return adminShell("settings", ["ワークスペース", "設定", "セキュリティ"], body);
  }

  /* ---------- Employee Chat (ブラウザQ&A) ---------- */
  function chatMessage(m) {
    if (m.from === "user") {
      const content =
        m.type === "attachment"
          ? `<div class="bubble user file-chip">${icon("image", "sm")}${esc(m.text)}</div>`
          : `<div class="bubble user">${esc(m.text)}</div>`;
      return `<div class="msg user"><div class="who">あなた</div><div class="msg-row">${content}<time>${m.time}</time></div></div>`;
    }

    let content = "";
    if (m.type === "typing") {
      content = `<div class="bubble typing"><span></span><span></span><span></span></div>`;
    } else if (m.type === "text") {
      content = `<div class="bubble">${esc(m.text)}</div>`;
    } else if (m.type === "answer") {
      content = `
        <div class="answer">
          ${m.intro.map((l) => esc(l)).join("<br>")}
          <ol class="steps">${m.steps.map((s, i) => `<li><b>${i + 1}</b>${esc(s)}</li>`).join("")}</ol>
          ${m.note ? `<div>${esc(m.note)}</div>` : ""}
          ${m.warn ? `<div class="answer-warn">${icon("circle-alert")}${esc(m.warn)}</div>` : ""}
          ${
            m.source
              ? `<div class="answer-source">${icon("file-text")}<div><small>参照した社内手順</small><a href="#/knowledge">${esc(m.source)}${icon("arrow-up-right", "xs")}</a></div></div>`
              : ""
          }
        </div>`;
    } else if (m.type === "handoff") {
      content = `
        <div class="answer handoff">
          <h4>${icon("circle-check", "sm")}${esc(m.title)}</h4>
          <dl>${m.lines.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
          <div style="font-size:14px;color:#475569">${esc(m.note)}</div>
        </div>`;
    }

    return `
      <div class="msg bot">
        ${logo("round")}
        <div class="msg-body">
          <div class="who">AlgoDesk</div>
          <div class="msg-row">${content}${m.time ? `<time>${m.time}</time>` : ""}</div>
        </div>
      </div>`;
  }

  function chatFeedHtml() {
    const quick = state.quick.length
      ? `<div class="quick">${state.quick
          .map(
            (q) =>
              `<button class="${q.primary ? "primary" : ""}" data-action="chat-quick" data-quick="${q.action}">${q.icon ? icon(q.icon, "sm") : ""}${esc(q.label)}</button>`
          )
          .join("")}</div>`
      : "";
    const waiting = state.waiting ? `<div class="waiting">${icon("clock", "sm")}${esc(state.waiting)}</div>` : "";
    return `<div class="day-pill">今日</div>${state.chat.map(chatMessage).join("")}${quick}${waiting}`;
  }

  function viewQA() {
    const h = D.qa.history;
    const hist = (title, active) =>
      `<button class="hist ${active ? "active" : ""}" data-action="toast" data-msg="デモでは現在の相談のみ表示します。">${icon("message-circle")}${esc(title)}</button>`;

    return `
      <div class="frame">
        <aside class="emp-side">
          <div class="brand">
            ${logo()}
            <div><div class="brand-name">AlgoDesk</div><div class="brand-sub">社内ITの相談窓口</div></div>
          </div>
          <div class="emp-company">${icon("building-2")}${esc(D.meta.workspace)}</div>
          <button class="new-consult" data-action="new-chat">${icon("plus", "sm")}新しい相談</button>
          <h3>あなたの相談</h3>
          <div class="emp-group">今日</div>
          ${h.today.map((t, i) => hist(t, i === 0)).join("")}
          <div class="emp-group">過去7日間</div>
          ${h.week.map((t) => hist(t, false)).join("")}
          <div class="emp-bottom">
            <button class="hist" data-action="toast" data-msg="使い方ガイドを開きます（デモ）">${icon("circle-help")}使い方・ヘルプ</button>
            <div class="me">${avatar("山", "lg")}<div><strong>${esc(D.meta.employeeName)}</strong><small>マイアカウント</small></div></div>
          </div>
        </aside>
        <div class="emp-main">
          <header class="emp-head">
            <div>
              <h1>${esc(D.qa.title)}</h1>
              <p>社内の手順をもとに、解決をお手伝いします。</p>
            </div>
            <div class="top-right">
              <span class="badge">デモ環境</span>
              <button class="btn" style="height:44px" data-action="handoff">${icon("user")}担当者に相談</button>
            </div>
          </header>
          <div class="chat-scroll" id="chat-feed">${chatFeedHtml()}</div>
          <div class="composer">
            <form id="chat-form" autocomplete="off">
              <button type="button" class="icon-btn" data-action="chat-quick" data-quick="attach" aria-label="ファイルを添付">${icon("paperclip")}</button>
              <input id="chat-input" placeholder="メッセージを入力、または画像を添付" maxlength="500">
              <button type="submit" class="send" aria-label="送信">${icon("arrow-up")}</button>
            </form>
            <p>パスワードや認証コードは送信しないでください。</p>
            <input type="file" id="file-input" accept="image/*" hidden>
          </div>
        </div>
      </div>`;
  }

  function updateChat() {
    const feed = document.getElementById("chat-feed");
    if (!feed) return;
    feed.innerHTML = chatFeedHtml();
    refreshIcons();
    feed.scrollTop = feed.scrollHeight;
  }

  function botRespond(reply, delay = 900) {
    const typing = { from: "bot", type: "typing" };
    state.chat.push(typing);
    updateChat();
    setTimeout(() => {
      const i = state.chat.indexOf(typing);
      state.chat.splice(i, 1, { from: "bot", time: nowTime(), ...clone(reply) });
      updateChat();
    }, delay);
  }

  function pickAnswer(text) {
    const a = D.qa.answers;
    if (/vpn/i.test(text)) return a.vpn;
    if (/wi-?fi|ワイファイ|無線/i.test(text)) return a.wifi;
    if (/診断|開き方/.test(text)) return a.howto;
    return a.fallback;
  }

  function sendUserText(text) {
    state.chat.push({ from: "user", type: "text", text, time: nowTime() });
    state.quick = [];
    state.waiting = "";
    botRespond(pickAnswer(text));
  }

  function handoff() {
    state.quick = [];
    state.waiting = "";
    botRespond({
      type: "handoff",
      title: "担当者に引き継ぎました",
      lines: [
        ["相談内容", D.qa.title],
        ["これまでの対応", "診断手順を案内済み"],
        ["状態", "担当者対応待ち"]
      ],
      note: "会話の内容は要約して担当者に共有済みです。同じ説明を繰り返す必要はありません。"
    });
  }

  /* ---------- Slack Demo ---------- */
  function viewSlack() {
    const result =
      state.slackResult === "solved"
        ? `<div class="pill pill-green" style="margin-top:8px">${icon("circle-check", "xs")}解決済みとして記録しました</div>`
        : state.slackResult === "handoff"
        ? `<div class="pill pill-amber" style="margin-top:8px">${icon("user", "xs")}担当者に引き継ぎました（要約付き）</div>`
        : `<div class="s-actions">
             <button class="btn btn-green" data-action="slack-feedback" data-result="solved">👍 解決した</button>
             <button class="btn" data-action="slack-feedback" data-result="retry">まだ解決しない</button>
             <button class="btn" style="color:var(--primary)" data-action="slack-feedback" data-result="handoff">🙋 担当者に相談する</button>
           </div>`;

    const skeleton = (w) => `<div class="skeleton">${avatar("", "square")}<div>${w.map((x) => `<i style="width:${x}%"></i>`).join("")}</div></div>`;

    return `
      <div class="slack">
        <div class="slack-top">
          <span class="traffic"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i></span>
          <div class="slack-search">${icon("search", "sm")}${esc(D.meta.workspace)} を検索</div>
        </div>
        <nav class="slack-rail">
          <div class="ws">S</div>
          <div class="rail-item active">${icon("house")}ホーム</div>
          <div class="rail-item">${icon("message-circle")}DM</div>
          <div class="rail-item">${icon("bell")}アクティビティ</div>
          <div class="rail-item">${icon("files")}ファイル</div>
          <div class="rail-item">${icon("ellipsis")}その他</div>
          ${avatar("佐", "peach square")}
        </nav>
        <section class="slack-panel channel">
          <div class="slack-panel-head"># 情シス相談 ${icon("chevron-down", "sm")}</div>
          <div class="slack-feed">
            ${skeleton([30, 90, 70])}
            ${skeleton([25, 85, 60])}
            <div class="s-msg">
              ${avatar("佐", "peach square")}
              <div>
                <div class="s-name">佐藤 さくら <small>10:17</small></div>
                <div><span class="mention">@AlgoDesk</span> 在宅勤務中ですが、VPNに接続できません。</div>
              </div>
            </div>
            <div class="s-msg">
              ${logo()}
              <div>
                <div class="s-name">AlgoDesk <span class="app-tag">アプリ</span><small>10:18</small></div>
                <div>回答をお送りしました。サイドパネルでご確認ください →</div>
                <span class="reaction">✅ 1</span>
              </div>
            </div>
          </div>
          <div class="slack-composer">${icon("plus")}<input placeholder="#情シス相談 へのメッセージ" aria-label="メッセージ">${icon("send-horizontal")}</div>
        </section>
        <section class="slack-panel">
          <div class="slack-panel-head">
            ${logo()}
            <div>AlgoDesk<br><small>社内ヘルプデスク</small></div>
            <a class="icon-btn" href="#/dashboard" aria-label="閉じる">${icon("x")}</a>
          </div>
          <div class="slack-tabs">
            <span class="active">${icon("message-square", "sm")}メッセージ</span>
            <span>${icon("clock", "sm")}履歴</span>
            <span>${icon("book-open", "sm")}ナレッジ</span>
            <span>${icon("plus", "sm")}</span>
          </div>
          <div class="slack-feed">
            <div class="s-msg">
              ${avatar("佐", "peach square")}
              <div><div class="s-name">佐藤 さくら <small>10:17</small></div><div>在宅勤務中ですが、VPNに接続できません。</div></div>
            </div>
            <div class="s-msg">
              ${logo()}
              <div>
                <div class="s-name">AlgoDesk <span class="app-tag">アプリ</span><small>10:18</small></div>
                <div>社内の手順では、次の3つを順番にお試しください。</div>
                <ol class="steps">${D.qa.answers.vpn.steps.map((s, i) => `<li><b>${i + 1}</b>${esc(s)}</li>`).join("")}</ol>
                <div class="s-attach">${notionLogo()}<div><strong>VPN接続マニュアル</strong><small>Notion ・ 参考にした資料</small></div></div>
              </div>
            </div>
            <div class="s-msg">
              ${logo()}
              <div>
                <div class="s-name">AlgoDesk <span class="app-tag">アプリ</span><small>10:18</small></div>
                <div>この回答で解決しましたか？</div>
                ${result}
              </div>
            </div>
          </div>
          <div class="slack-composer">${icon("plus")}<input placeholder="AlgoDeskに質問する" aria-label="AlgoDeskに質問する">${icon("send-horizontal")}</div>
        </section>
      </div>`;
  }

  /* ---------- Router ---------- */
  const routes = {
    dashboard: viewDashboard,
    knowledge: viewKnowledge,
    ops: viewOps,
    settings: viewSettings,
    qa: viewQA,
    slack: viewSlack
  };

  function currentRoute() {
    const key = location.hash.replace(/^#\/?/, "").split("?")[0];
    return routes[key] ? key : "dashboard";
  }

  function render() {
    const key = currentRoute();
    app.innerHTML = routes[key]();
    const group = key === "qa" ? "qa" : key === "slack" ? "slack" : "admin";
    document.querySelectorAll(".switcher a").forEach((a) => a.classList.toggle("active", a.dataset.view === group));
    refreshIcons();
    if (key === "qa") {
      const feed = document.getElementById("chat-feed");
      feed.scrollTop = feed.scrollHeight;
    }
  }

  /* ---------- Events ---------- */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case "toast":
        toast(el.dataset.msg);
        break;
      case "open-modal":
        state.modalOpen = true;
        state.modalTab = "text";
        render();
        document.getElementById("kn-title")?.focus();
        break;
      case "close-modal":
        if (el.classList.contains("overlay") && e.target !== el) return;
        state.modalOpen = false;
        render();
        break;
      case "modal-tab":
        state.modalTab = el.dataset.tab;
        render();
        break;
      case "register-knowledge":
        registerKnowledge();
        break;
      case "select-task":
        state.selectedTaskId = el.dataset.id;
        render();
        break;
      case "toggle-check": {
        const task = state.tasks.find((t) => t.id === state.selectedTaskId);
        const item = task.items[Number(el.dataset.index)];
        item.done = !item.done;
        render();
        break;
      }
      case "toggle":
        state.toggles[el.dataset.key] = !state.toggles[el.dataset.key];
        el.classList.toggle("on", state.toggles[el.dataset.key]);
        break;
      case "reset-settings":
        state.toggles = { ssoRequired: false, ip: false, device: false };
        render();
        toast("変更を取り消しました。");
        break;
      case "chat-quick":
        if (el.dataset.quick === "attach") {
          document.getElementById("file-input")?.click();
        } else if (el.dataset.quick === "howto") {
          sendUserText("診断ソフトの開き方がわからない");
        }
        break;
      case "handoff":
        state.chat.push({ from: "user", type: "text", text: "担当者に相談したいです。", time: nowTime() });
        handoff();
        break;
      case "new-chat":
        state.chat = [{ from: "bot", type: "text", text: "こんにちは。社内ITの困りごとをお聞かせください。", time: nowTime() }];
        state.quick = [];
        state.waiting = "";
        updateChat();
        break;
      case "slack-feedback":
        if (el.dataset.result === "retry") {
          toast("別の手順を検索しています…（デモ）");
          return;
        }
        state.slackResult = el.dataset.result;
        render();
        break;
      default:
        break;
    }
  });

  document.addEventListener("submit", (e) => {
    if (e.target.id !== "chat-form") return;
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendUserText(text);
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "file-input" && e.target.files.length) {
      const file = e.target.files[0];
      state.chat.push({ from: "user", type: "attachment", text: file.name, time: nowTime() });
      state.quick = [];
      state.waiting = "";
      e.target.value = "";
      botRespond({
        type: "handoff",
        title: "スクリーンショットを受け付けました",
        lines: [
          ["相談内容", D.qa.title],
          ["添付", file.name],
          ["状態", "担当者対応待ち"]
        ],
        note: "診断結果は情シス担当者が確認し、交換が必要かどうかをご連絡します。"
      });
    }
    if (e.target.id === "kn-source") filterDocs();
    if (e.target.id === "ops-owner") filterOps();
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "kn-search") filterDocs();
    if (e.target.id === "ops-search") filterOps();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.modalOpen) {
      state.modalOpen = false;
      render();
    }
  });

  document.getElementById("disclaimer").textContent = D.meta.disclaimer;
  window.addEventListener("hashchange", render);
  render();
})();
// File: js/data.js
window.ALGODESK_DATA = {
  meta: {
    workspace: "サンプル株式会社",
    plan: "プロプラン",
    adminName: "管理者",
    employeeName: "山田さん",
    disclaimer: "画像はデモ版です。"
  },

  dashboard: {
    month: "2026年10月",
    kpis: [
      { label: "今月の問い合わせ", value: "128", unit: "件", note: "今月受け付けた相談", icon: "file-text" },
      { label: "AI解決率", value: "75", unit: "%", note: "128件中96件をAIで解決", icon: "chart-pie" },
      { label: "担当者対応待ち", value: "8", unit: "件", note: "引き継ぎ済み・未完了", icon: "user", tone: "amber", dot: true },
      { label: "推定削減時間", value: "16", unit: "時間", note: "AI解決96件 × 10分", icon: "info", noteIcon: "info" }
    ],
    daily: [4, 6, 5, 8, 3, 2, 7, 9, 6, 5, 8, 4, 3, 7, 10, 6, 8, 5, 9, 13],
    dailyLabels: { 0: "10/1", 4: "10/5", 9: "10/10", 14: "10/15", 18: "10/20" },
    status: [
      { label: "AIで解決", count: 96, color: "#3F3FB8" },
      { label: "利用者の確認待ち", count: 24, color: "#C3CBF6" },
      { label: "担当者対応待ち", count: 8, color: "#E9A21B" }
    ],
    recent: [
      { q: "パソコンのバッテリーを交換したい", ch: "ブラウザ", status: "利用者の確認待ち", tone: "amber", updated: "5分前", link: "#/qa" },
      { q: "VPNに接続できない", ch: "Slack", status: "解決済み", tone: "green", updated: "18分前", link: "#/slack" },
      { q: "アカウントにログインできない", ch: "Slack", status: "担当者対応待ち", tone: "amber", updated: "32分前", link: "#/dashboard" },
      { q: "社内Wi-Fiの接続方法を知りたい", ch: "Slack", status: "解決済み", tone: "green", updated: "1時間前", link: "#/dashboard" }
    ],
    sources: [
      { type: "notion", name: "Notion", count: "24ページ" },
      { type: "drive", name: "Google Drive", count: "18ファイル" }
    ],
    lastSync: "10:30"
  },

  knowledge: {
    categories: ["PC・周辺機器", "ネットワーク", "アカウント", "ソフトウェア", "その他"],
    docs: [
      { title: "社内Wi-Fiの接続手順", source: "Notion", category: "ネットワーク", status: "利用可能", updated: "2026/10/15 14:32" },
      { title: "VPN接続マニュアル", source: "Notion", category: "ネットワーク", status: "利用可能", updated: "2026/10/14 09:21" },
      { title: "アカウントの初期設定ガイド", source: "Google Drive", category: "アカウント", status: "利用可能", updated: "2026/10/12 16:03" }
    ],
    draft: {
      title: "社用PCのバッテリー診断・交換手順",
      category: "PC・周辺機器",
      body: "バッテリーの持続時間が短くなった場合は、以下の手順で確認してください。\n\n1. パソコン内の診断ソフトで、バッテリーヘルスチェックを実行してください。\n2. 診断結果のスクリーンショットを撮影してください。\n3. スクリーンショットをAlgoDeskの相談画面に投稿してください。\n\n交換の要否は、診断結果を確認した情シス担当者が判断します。\n\n※バッテリーの膨張や異常な発熱がある場合は、使用と充電を中止し、担当者へ連絡してください。"
    }
  },

  qa: {
    title: "パソコンのバッテリー交換",
    history: {
      today: ["パソコンのバッテリー交換"],
      week: ["VPNに接続できない", "Wi-Fiの接続方法"]
    },
    messages: [
      { from: "bot", type: "text", text: "こんにちは。社内ITの困りごとをお聞かせください。", time: "10:32" },
      { from: "user", type: "text", text: "パソコンのバッテリーが弱くなってきて交換して欲しい。", time: "10:33" },
      {
        from: "bot",
        type: "answer",
        time: "10:34",
        intro: ["バッテリーの状態を確認しましょう。", "まずは、以下の手順をお願いします。"],
        steps: [
          "パソコン内の診断ソフトで、バッテリーヘルスチェックを実行",
          "診断結果のスクリーンショットを撮影",
          "このチャットにスクリーンショットを添付"
        ],
        note: "交換が必要かどうかは、診断結果を確認した情シス担当者が判断します。",
        warn: "膨張や異常な発熱がある場合は、使用と充電を中止し、担当者へ連絡してください。",
        source: "社用PCのバッテリー診断・交換手順"
      }
    ],
    quick: [
      { label: "スクリーンショットを添付", icon: "paperclip", action: "attach", primary: true },
      { label: "診断ソフトの開き方がわからない", action: "howto" }
    ],
    waiting: "スクリーンショットの送信をお待ちしています",
    answers: {
      howto: {
        type: "answer",
        intro: ["診断ソフトは、次の方法で開けます。"],
        steps: [
          "画面左下のスタートメニューを開く",
          "「PC診断」と入力して検索する",
          "「バッテリー」タブからヘルスチェックを実行する"
        ],
        note: "表示された結果の画面を、そのままスクリーンショットで送ってください。",
        source: "社用PCのバッテリー診断・交換手順"
      },
      vpn: {
        type: "answer",
        intro: ["社内の手順では、次の3つを順番にお試しください。"],
        steps: ["VPNアプリを最新版に更新する", "社内アカウントでサインインし直す", "改善しない場合はPCを再起動する"],
        source: "VPN接続マニュアル"
      },
      wifi: {
        type: "answer",
        intro: ["社内Wi-Fiには、次の手順で接続できます。"],
        steps: ["Wi-Fi一覧から「Sample-Office」を選ぶ", "社内アカウントのIDとパスワードを入力する", "証明書の確認画面で「接続」を選ぶ"],
        source: "社内Wi-Fiの接続手順"
      },
      fallback: {
        type: "text",
        text: "社内の手順に該当する情報が見つかりませんでした。右上の「担当者に相談」から、情シス担当者へ引き継ぐことができます。"
      }
    }
  },

  ops: {
    kpis: [
      { label: "進行中の業務", value: "8", note: "対応中の業務数", icon: "file-text", tone: "primary" },
      { label: "本日期限のタスク", value: "3", note: "本日が期限のタスク", icon: "calendar", tone: "primary" },
      { label: "期限超過のタスク", value: "1", note: "期限を過ぎたタスク", icon: "triangle-alert", tone: "amber" },
      { label: "今月完了した業務", value: "12", note: "今月完了した業務数", icon: "circle-check", tone: "green" }
    ],
    templates: [
      { icon: "user-plus", title: "入社オンボーディング", desc: "アカウント準備から端末貸与まで", cta: "テンプレートを使う" },
      { icon: "user-check", title: "退職者棚卸", desc: "アカウント停止と端末回収を確認", cta: "テンプレートを使う" },
      { icon: "layout-grid", title: "SaaS棚卸", desc: "契約・利用状況・更新日を整理", cta: "ダッシュボードを開く" },
      { icon: "laptop", title: "PCキッティング", desc: "対話ガイドで初期設定をサポート", cta: "ガイドを開始" },
      { icon: "file-clock", title: "インシデント振り返り", desc: "対応記録から報告書の下書きを生成", cta: "下書きを作成" }
    ],
    tasks: [
      {
        id: "t1", name: "鈴木 花さんの入社準備", template: "入社オンボーディング", owner: "田中", due: "10/23", overdue: false,
        meta: "担当：田中　　入社日：10月26日",
        items: [
          { t: "社員情報の確認", s: "所属・入社日・連絡先", done: true },
          { t: "アカウント発行の確認", s: "Google Workspace / Slack", done: true },
          { t: "貸与PCの手配", s: "端末と管理番号を確認済み", done: true },
          { t: "初回ログインの案内", s: "本人への案内内容を確認", done: false, action: "案内文を確認" },
          { t: "受け入れ完了の確認", s: "初回ログインと端末の受領を確認", done: false }
        ]
      },
      {
        id: "t2", name: "佐藤 健さんの退職対応", template: "退職者棚卸", owner: "田中", due: "10/20", overdue: false,
        meta: "担当：田中　　最終出社日：10月20日",
        items: [
          { t: "退職日・最終出社日の確認", s: "人事からの連絡内容", done: true },
          { t: "業務データの移管先確認", s: "Drive・メールの引き継ぎ先", done: true },
          { t: "Google Workspaceの停止", s: "最終出社日の18時以降", done: false, action: "手順を確認" },
          { t: "Slackアカウントの無効化", s: "共有チャネルの権限も確認", done: false },
          { t: "貸与PCの回収", s: "管理番号と付属品を照合", done: false },
          { t: "SaaSライセンスの解除", s: "契約中のSaaS 6件", done: false }
        ]
      },
      {
        id: "t3", name: "10月 SaaS利用状況の確認", template: "SaaS棚卸", owner: "山本", due: "10/25", overdue: false,
        meta: "担当：山本　　対象：契約SaaS 24件",
        items: [
          { t: "契約一覧の更新", s: "新規契約・解約の反映", done: true },
          { t: "請求額の照合", s: "カード明細・請求書", done: true },
          { t: "利用者数の確認", s: "アカウント数と契約数", done: true },
          { t: "更新日の確認", s: "今後90日以内の更新", done: true },
          { t: "未使用ライセンスの抽出", s: "30日以上ログインなし", done: false, action: "一覧を確認" },
          { t: "部署への利用確認", s: "継続の要否を確認", done: false },
          { t: "解約・削減の判断", s: "削減見込み額を算出", done: false },
          { t: "結果の報告", s: "月次レポートへ反映", done: false }
        ]
      },
      {
        id: "t4", name: "営業部PCの初期設定", template: "PCキッティング", owner: "田中", due: "10/19", overdue: true,
        meta: "担当：田中　　対象：営業部 2台",
        items: [
          { t: "端末の受け取り", s: "管理番号の登録", done: true },
          { t: "OSアップデート", s: "最新の更新プログラム", done: false },
          { t: "セキュリティソフトの導入", s: "社内指定ソフト", done: false, action: "手順を確認" },
          { t: "業務アプリの導入", s: "Office・VPN・Slack", done: false },
          { t: "本人への引き渡し", s: "受領サインの取得", done: false }
        ]
      },
      {
        id: "t5", name: "VPN障害の振り返り", template: "インシデント振り返り", owner: "山本", due: "10/22", overdue: false,
        meta: "担当：山本　　発生日：10月17日",
        items: [
          { t: "対応記録の収集", s: "Slackの会話と問い合わせ", done: true },
          { t: "報告書の下書き確認", s: "AIが作成した下書き", done: false, action: "下書きを開く" },
          { t: "再発防止策の共有", s: "全社への周知", done: false }
        ]
      }
    ]
  },

  security: {
    auditLogs: [
      { time: "10:42", user: "管理者", action: "SSO接続テスト", result: "成功" },
      { time: "10:38", user: "山田", action: "質問を投稿", result: "成功" },
      { time: "10:35", user: "管理者", action: "ナレッジを追加", result: "成功" }
    ]
  }
};
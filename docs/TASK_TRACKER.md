# TASK_TRACKER — en-chakai（円茶会）

task-manager エージェントが管理するタスク台帳の正本。
ステータス: TODO / IN_PROGRESS / BLOCKED / REVIEW / DONE / CANCELLED
更新は必ずこのファイルに反映する。実装は dev-logic / designer に委譲（task-manager は実装しない）。

ID 採番: **EC-xx**。採番は `bash /home/dev/cron-scripts/next-task-id.sh EC` を使う（目視で数えない）。

> このファイルは Apollo タスクボードのソース（config.ts TASK_SOURCES）に含める。
> 全タスクを Apollo に乗せる方針（Keita 2026-05-31）に従い、en-chakai のタスクもここで一元管理する。

---

## 🟡 進行中・TODO

| ID | タイトル | 優先度 | ステータス | 担当 | 備考 |
|----|---------|--------|-----------|------|------|
| EC-1 | 円茶会 再構築（Render/Supabase脱却・自宅サーバ化） | 高 | DONE | Son | 2026-08-11完了。DoD: ①成果物=en-chakai repo main(219f875/b6395bc)+en-chakai.service(:3002)+cloudflared ingress追加 ②検証=実測 top200/公開API200/admin旧PW401/新PW200/https://chakai.apollomansion.com/en 200・既存2ホスト無傷 ③本番反映=済(systemd常駐+Tunnel公開・push済)。過去データ移行不要(Keita指示)。残: Resendキー未設定=メール通知スキップ動作、予約枠の登録はadmin画面から |
| EC-2 | メール通知の有効化（Resend） | 中 | DONE | Son | 2026-08-11完了。DoD: ①成果物=EMAIL_FROM環境変数化(8688118)+.env.localにRESEND_API_KEY設定(Keita提供)+再起動 ②検証=テスト予約でホスト通知/ゲスト受付の2通をResend API実測 last_event=delivered・テストデータは削除済 ③本番反映=済。制約: 送信元がonboarding@resend.devのためアカウント本人宛のみ送達可→顧客宛はEC-3のドメイン認証待ち |
| EC-7 | Stripe決済リンク連携 | 高 | IN_PROGRESS | Son | 2026-08-11実装済(361d288・subagent)。確定時にPayment Link自動発行(SDK不使用・fetch直叩き・失効しないリンク)→確定メールに決済ボタン、/api/admin/payments/sync で支払状況同期、管理画面に支払バッジ/リンクコピー/CSV支払列/売上内訳。キー未設定時は従来動作(実測: 確定メールdelivered・sync enabled:false)。残=Keita の STRIPE_SECRET_KEY 提供→.env.local設定→テストモードで決済まで実測→本番キー切替 |
| EC-6 | 管理画面の本格作り込み | 中 | DONE | Son | 2026-08-11完了。subagent実装(「シンプルすぎる」FB対応)。DoD: ①成果物=admin/slots{page,components,dashboard}.tsx+bookings API ?limit拡張(後方互換・4f63e63)・月次チャート(純CSS)/稼働率カード/要対応アラート/直近予定3セクション/カレンダー予約ドット+人数/月一括公開/予約枠の削除ガード/件数バッジ/日付グルーピング/CSV(BOM付)/英語定型返信コピー ②検証=build+tscゼロ・再起動後 top/admin/両API/公開API全200・配信チャンクに新機能文字列実測 ③本番反映=済(restart+push済) |
| EC-5 | 管理画面UI改善（モバイル最適化） | 中 | DONE | Son | 2026-08-11完了。subagent実装。DoD: ①成果物=admin/slots/page.tsx+admin/page.tsx(8a8ca37)・小画面タブ短縮/ボトムシート枠エディタ/1日一括公開・非公開/今日ボタン/週一括のPromise.all並列化/初期ロード表示/401時セッション破棄→ログインへ/予約検索・開催日順/タップターゲット拡大 ②検証=npm run buildエラーゼロ・再起動後 /admin 200・API認証200・配信チャンクに新UI文字列実測 ③本番反映=済(restart+push済) |
| EC-4 | Apollo茶事ページにサイト情報タブ | 低 | DONE | Son | 2026-08-11完了。DoD: ①成果物=cxo-agent web/src/views/Chaji.tsx「円茶会サイト」タブ(65867e2)・公開URL/予約/管理画面(PW伏せ字トグル)/メール設定/運用メモ ②検証=build後 /chaji の配信チャンクに新タブ文字列を実測確認(静的配信のため再起動不要) ③本番反映=済(push済) |
| EC-3 | 送信ドメイン認証（顧客宛メール解放） | 中 | DONE | Son | 2026-08-11完了。Keitaがenchakai.com取得→CFトークンにゾーン追加。DoD: ①成果物=enchakai.comゾーンにDNS5件(サイトCNAME×2+DKIM TXT/SPF MX/SPF TXT)・Resendドメイン差替(apollomansion削除→enchakai.com id=3fbe36ba, verified)・EMAIL_FROM=円茶会 <bookings@enchakai.com>・NEXT_PUBLIC_BASE_URL=https://enchakai.com ②検証=テスト予約でホスト通知/ゲスト受付2通ともbookings@enchakai.com送信元でlast_event=delivered実測・テストデータ削除済 ③本番反映=済(cloudflared+en-chakai再起動・https://enchakai.com 200実測・chakai.apollomansion.com併存) |

---

## 🟢 完了 (Done)

| ID | タスク | 完了日 |
|----|--------|--------|

---

最終更新: 2026-08-11 / 管理: task-manager

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
| EC-8 | 管理画面リニューアル（業界定石準拠） | 中 | DONE | Son | 2026-08-12完了。予約管理SaaS定石(今日ビュー/下タブ・サイドバー/月週カレンダー/ドロワー詳細/設定画面)を分析しsubagent実装。DoD: ①成果物=admin/slots{page,home,calendar,settings,components}.tsx再構成+settings API新規(data/settings.json・定休日設定)+confirmed_at記録 ②検証=build+tscゼロ・再起動後 /admin/slots・両API・設定PATCH往復/全曜日400/無認証401・配信チャンクに新UI文字列・公開API200・既存2予約無傷を実測 ③本番反映=済(restart+push済) / 8-12深夜追記: /adminがglobals.css未読込でCSS欠落と判明→layoutでimport修正(e08e3fc)。和紙と墨ライト案(2641900)は不採用、ダーク版へ戻し(7190d7d)。業界調査版v3も作成したがKeita判断で現行維持(ギャラリー=apollomansion /shots/enchakai-admin-v3/) |
| EC-1 | 円茶会 再構築（Render/Supabase脱却・自宅サーバ化） | 高 | DONE | Son | 2026-08-11完了。DoD: ①成果物=en-chakai repo main(219f875/b6395bc)+en-chakai.service(:3002)+cloudflared ingress追加 ②検証=実測 top200/公開API200/admin旧PW401/新PW200/https://chakai.apollomansion.com/en 200・既存2ホスト無傷 ③本番反映=済(systemd常駐+Tunnel公開・push済)。過去データ移行不要(Keita指示)。残: Resendキー未設定=メール通知スキップ動作、予約枠の登録はadmin画面から |
| EC-2 | メール通知の有効化（Resend） | 中 | DONE | Son | 2026-08-11完了。DoD: ①成果物=EMAIL_FROM環境変数化(8688118)+.env.localにRESEND_API_KEY設定(Keita提供)+再起動 ②検証=テスト予約でホスト通知/ゲスト受付の2通をResend API実測 last_event=delivered・テストデータは削除済 ③本番反映=済。制約: 送信元がonboarding@resend.devのためアカウント本人宛のみ送達可→顧客宛はEC-3のドメイン認証待ち |
| EC-7 | Stripe決済リンク連携 | 高 | DONE | Son | 2026-08-11完了。DoD: ①成果物=stripe.ts(SDK不使用fetch直叩き)+確定時PaymentLink自動発行+確定メール決済ボタン+payments/sync+管理画面バッジ/コピー/CSV/売上内訳(361d288)・.env.localにsk_live設定(Keita提供) ②検証=本番キーでテスト予約→確定→リンク発行(buy.stripe.com 200)・確定メールdelivered(Complete Paymentボタン入り実測)・sync enabled:true checked:1・テストリンクは無効化しデータ削除済 ③本番反映=済。注: 実支払→支払済バッジの遷移は初回の実予約で確認(コード経路はsyncで検証済) |
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

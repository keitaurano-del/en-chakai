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
| EC-2 | メール通知の有効化（Resend） | 中 | BLOCKED | Son | 2026-08-11着手(Keita指示)。Son側準備完了: 送信元をEMAIL_FROM環境変数化(既定=onboarding@resend.dev・8688118 push済)・サービス再起動/実測200確認済。BLOCKED理由=RESEND_API_KEY未入手(型A: resend.com のアカウント作成+APIキー発行はKeita操作)。キー受領後: .env.localへ設定→再起動→テスト予約で送達確認 |

---

## 🟢 完了 (Done)

| ID | タスク | 完了日 |
|----|--------|--------|

---

最終更新: 2026-08-11 / 管理: task-manager

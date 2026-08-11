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
| EC-3 | 送信ドメイン認証（顧客宛メール解放） | 中 | BLOCKED | Son | 2026-08-11起票。onboarding@resend.devは本人宛限定のため、顧客宛の受付/確定メールにはResendでドメイン認証が必要。進捗: ResendへのドメインAPI登録はSonが実施済(id=5228bde3, status=not_started)・必要DNS 3件(DKIM TXT/SPF MX/SPF TXT)取得しKeitaへ提示済。残=CloudflareへのDNS追加(Keita操作 or CF APIトークン提供でSon実施)→verify→EMAIL_FROM切替・再検証 |

---

## 🟢 完了 (Done)

| ID | タスク | 完了日 |
|----|--------|--------|

---

最終更新: 2026-08-11 / 管理: task-manager

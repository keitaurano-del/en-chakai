---
name: project-logic-render-auto-deploy
description: Logic の Render Production environment は required reviewers 削除済み、main push と workflow_dispatch どちらも approve なしで自動デプロイされる
metadata:
  type: project
  originSessionId: 2026-05-22
---

Logic の Render Production environment は **required reviewers なし** で `deploy-production.yml` を承認なしで実行できる設定（2026-05-22 設定変更）。

**【2026-05-26 訂正・重要】** 「main push で Render web が auto-deploy される」という下記の記述は実態と異なる。2026-05-26 にレッスン視覚化を8回 main にマージしたが、Render web は一度も自動再ビルドされず、本番 web は 5/25 の古いバンドルのまま取り残された。`gh workflow run deploy-production.yml -f confirm=yes` を手動実行して初めて当日ビルドに更新された。つまり **Render web の本番反映には手動 deploy-production.yml が必要**（main push の自動デプロイは当てにしない）。一方 **Android は android-deploy.yml が main push ごとに毎回フレッシュビルドして内部配信される**ので、モバイル本番は main マージで自動反映される（[[project-logic-android-deploy]]）。Logic はモバイル専用（[[project-logic-mobile-only]]）なので web 停滞のユーザー影響は無いが、「web で確認して最新が見えない」時はまず deploy-production.yml を手動実行すること。

**Why:** 2026-05-22 Keita 明示「毎回 approve したくないよ。次回からは自動にして」。それまで Production environment に `required_reviewers` 保護ルールがあり、`gh workflow run deploy-production.yml -f confirm=yes` でも `workflow_dispatch` のたびに GitHub の environment 承認画面で Keita が手動 approve する必要があった。実害として：

- 5/19〜5/21 朝までに workflow_dispatch が 5 回 `waiting` で積み上がって放置された
- Keita 端末で「Web が更新されてない」と感じる原因（実際は build 待ちか approve 待ちで止まっていた）
- 緊急修正の反映に余計な手間がかかる

これを解消するため、`gh api -X PUT repos/keitaurano-del/logic/environments/Production --input -` で `protection_rules: []` / `deployment_branch_policy: null` に変更した。

**How to apply:**
- 今後 Logic の Render Production への deploy は **承認操作不要**。`gh workflow run deploy-production.yml --repo keitaurano-del/logic -f confirm=yes` で即実行される
- **main への push では Render web の auto-deploy は当てにしない**（上記 2026-05-26 訂正参照）。`render.yaml` に `autoDeploy: true` があるが実際は発火しないことが多い。2026-05-27 も PR #233 を main マージ後 12 分待っても未反映で、手動 `deploy-production.yml -f confirm=yes` を実行して初めて反映された（バンドル index-Cd_qnb4B.js → index-B-v5OeCk.js）。**Render web 反映は手動 workflow_dispatch で行うこと**。Android は main push で android-deploy.yml が毎回走るので自動反映される
- 「Render に最新が反映されてない」と Keita が感じたら、まず確認すべきは：
  1. ブラウザキャッシュ無効化（DevTools → Network → Disable cache）でリロード
  2. `curl -s https://logic-u5wn.onrender.com/ | grep -oE "index-[a-zA-Z0-9_-]+\.js"` で現バンドル ID を見て、`curl -sI` の `last-modified` を確認
  3. `gh run list --workflow="deploy-production.yml" --limit 3` で直近の dispatch が `success` か確認
  4. Render Dashboard 側の build 状況確認（GitHub Action と Render auto-deploy が両方走るため、稀に競合する）
- protection rules を将来復活させたい場合（例：本番に勝手にデプロイされないよう厳密化したい）は `gh api -X PUT` で `reviewers: [{type: "User", id: 270368204}]` のように追加する。Keita のユーザー ID は 270368204

**注意点:**
- 同じ pattern で en-chakai プロジェクトの Render deploy にも environment protection が掛かってる可能性がある。en-chakai 側で同様の自動化を希望する場合は別途 Keita 確認の上で実施

関連 memory: [[reference-deploy-commands]]、[[project-logic-mobile-only]]

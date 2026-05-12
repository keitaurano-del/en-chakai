# 円茶会 — 予約システム設計書

最終更新: 2026-05-03

---

## システム概要

バックエンドなし。Google フォーム・Google スプレッドシート・Apps Script・Stripe Payment Links で構成する。

```
お客様がGoogle フォームを送信
        ↓
スプレッドシートに自動記録
        ↓
Keita が日程確認 → Status を "Confirmed" に変更
        ↓
Apps Script が確定メール + Stripe 決済リンクを自動送信
        ↓
お客様が 48時間以内に決済 → 予約確定
        ↓
キャンセル時: お客様が info@en-chakai.com にメール送信
Keita が Stripe ダッシュボードで返金処理
```

---

## プラン一覧

| ID | 名前 | 料金 | 時間 | 最大人数 |
|----|------|------|------|----------|
| ume | 梅 (Ume) | ¥9,000 | 60分 | 6名 |
| take | 竹 (Take) | ¥15,000 | 90分 | 4名 |
| matsu | 松 (Matsu) | ¥25,000 | 120分 | 2名 |

---

## 時間帯

| ID | 時刻 |
|----|------|
| morning | 10:00 |
| afternoon | 14:00 |
| evening | 16:00 |

---

## Google フォーム設計

**タイトル**: `En Chakai — Reservation`

**説明文**:
```
Book your tea ceremony experience. We will send a confirmation email with payment details within 24 hours.
```

**言語**: 英語のみ

### 項目一覧

| # | ラベル | 形式 | 必須 | 備考 |
|---|--------|------|------|------|
| 1 | Select Plan | ラジオボタン | 必須 | 3プランから選択 |
| 2 | Preferred Date | 日付 | 必須 | |
| 3 | Preferred Time | ラジオボタン | 必須 | 3時間帯から選択 |
| 4 | Number of Guests | プルダウン | 必須 | 1〜6 |
| 5 | Full Name | 短文テキスト | 必須 | |
| 6 | Email Address | 短文テキスト | 必須 | メール形式で検証 |
| 7 | Phone Number | 短文テキスト | 任意 | 国番号含む旨を説明文に記載 |
| 8 | Country of Residence | 短文テキスト | 任意 | |
| 9 | Allergies or Special Requests | 長文テキスト | 任意 | |
| 10 | Cancellation Policy Agreement | チェックボックス | 必須 | ポリシー全文をインラインで表示 |

**項目1 の選択肢**:
```
Ume — ¥9,000 / 60 min / Up to 6 guests
Take — ¥15,000 / 90 min / Up to 4 guests
Matsu — ¥25,000 / 120 min / Up to 2 guests (Recommended)
```

**項目3 の選択肢**:
```
Morning — 10:00
Afternoon — 14:00
Late Afternoon — 16:00
```

**項目10 のテキスト**:
```
I understand and agree to the cancellation policy:
14+ days before: full refund / 7–13 days: 50% refund / Less than 7 days: no refund.
Payment is required within 48 hours of confirmation to secure the booking.
```

---

## スプレッドシート設計（顧客管理）

フォームの回答が自動記録される。スプシ連携後に Keita が L列・M列のヘッダーを手動追加する。

### 列構成

| 列 | ヘッダー | 入力元 |
|----|----------|--------|
| A | Timestamp | フォーム自動 |
| B | Select Plan | フォーム |
| C | Preferred Date | フォーム |
| D | Preferred Time | フォーム |
| E | Number of Guests | フォーム |
| F | Full Name | フォーム |
| G | Email Address | フォーム |
| H | Phone Number | フォーム |
| I | Country of Residence | フォーム |
| J | Allergies or Special Requests | フォーム |
| K | Cancellation Policy Agreement | フォーム |
| L | **Status** | **Keita が手動入力** |
| M | **Email Sent** | **Apps Script が自動記入** |

### Status 列（L列）の値

データの入力規則でドロップダウンを設定:

```
Pending, Confirmed, Declined
```

| 値 | 意味 | アクション |
|----|------|-----------|
| Pending | 新規受付・確認待ち | （デフォルト、何もしない） |
| Confirmed | 日程確定 | 確定メールが自動送信される |
| Declined | 日程不可 | Keita が手動でお断りメールを送る |

---

## Apps Script

スプレッドシートに紐付ける。L列（Status）の編集を検知して動作する。

**トリガー**: `onEdit`（自動。別途設定不要）

**動作ロジック**:
1. L列のセルが編集されたときに発火
2. 値が `"Confirmed"` かつ M列が空であることを確認
3. 確定メール（決済リンク付き）を送信
4. M列に送信タイムスタンプを記録（二重送信防止）

```javascript
const STATUS_COL    = 12; // L列
const EMAIL_COL     = 13; // M列
const NAME_COL      = 6;  // F列
const EMAIL_ROW_COL = 7;  // G列
const PLAN_COL      = 2;  // B列
const DATE_COL      = 3;  // C列
const TIME_COL      = 4;  // D列
const GUESTS_COL    = 5;  // E列

// Stripe Payment Links（作成後に差し替え）
const PAYMENT_LINKS = {
  "Ume — ¥9,000 / 60 min / Up to 6 guests":                  "https://buy.stripe.com/UME_PLACEHOLDER",
  "Take — ¥15,000 / 90 min / Up to 4 guests":                "https://buy.stripe.com/TAKE_PLACEHOLDER",
  "Matsu — ¥25,000 / 120 min / Up to 2 guests (Recommended)":"https://buy.stripe.com/MATSU_PLACEHOLDER",
};

function onEdit(e) {
  const sheet = e.range.getSheet();
  const col   = e.range.getColumn();
  const row   = e.range.getRow();

  // ヘッダー行・Status列以外は無視
  if (row < 2 || col !== STATUS_COL) return;

  const status    = sheet.getRange(row, STATUS_COL).getValue();
  const emailSent = sheet.getRange(row, EMAIL_COL).getValue();

  // Confirmed かつ未送信のときだけ実行
  if (status !== "Confirmed" || emailSent !== "") return;

  const name   = sheet.getRange(row, NAME_COL).getValue();
  const email  = sheet.getRange(row, EMAIL_ROW_COL).getValue();
  const plan   = sheet.getRange(row, PLAN_COL).getValue();
  const date   = sheet.getRange(row, DATE_COL).getValue();
  const time   = sheet.getRange(row, TIME_COL).getValue();
  const guests = sheet.getRange(row, GUESTS_COL).getValue();

  if (!email) return;

  const paymentLink = PAYMENT_LINKS[plan] || "https://en-chakai.com";
  const payDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const deadlineStr = payDeadline.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  MailApp.sendEmail({
    to: email,
    subject: "Your Tea Ceremony Reservation is Confirmed — En Chakai",
    body:
      `Dear ${name},\n\n` +
      `We are delighted to confirm your reservation. ` +
      `Please complete your payment within 48 hours to secure your booking.\n\n` +
      `── Reservation Details ──\n` +
      `Plan:    ${plan}\n` +
      `Date:    ${date}\n` +
      `Time:    ${time}\n` +
      `Guests:  ${guests}\n\n` +
      `── Payment ──\n` +
      `Payment Link: ${paymentLink}\n` +
      `Deadline: ${deadlineStr}\n` +
      `(Your reservation will be released if payment is not received by this date.)\n\n` +
      `── Cancellation Policy ──\n` +
      `14+ days before session:  Full refund\n` +
      `7–13 days before session: 50% refund\n` +
      `Less than 7 days:         No refund\n\n` +
      `To cancel, please email us directly:\n` +
      `info@en-chakai.com\n\n` +
      `── Access ──\n` +
      `Sengoku, Bunkyo-ku, Tokyo\n` +
      `Sengoku Station (Toei Mita Line) — 5 min walk\n` +
      `Tel: +81-3-XXXX-XXXX\n\n` +
      `Please arrive 5 minutes early.\n` +
      `We look forward to welcoming you.\n\n` +
      `En Chakai\n` +
      `info@en-chakai.com`
  });

  // 送信済みタイムスタンプを記録
  sheet.getRange(row, EMAIL_COL).setValue(new Date());
}
```

---

## Stripe Payment Links

Stripe ダッシュボードでプランごとに1つずつ作成する。

### 作成する商品

| プラン | 商品名 | 金額 | 通貨 |
|--------|--------|------|------|
| 梅 | En Chakai — Ume Plan | 9,000 | JPY |
| 竹 | En Chakai — Take Plan | 15,000 | JPY |
| 松 | En Chakai — Matsu Plan | 25,000 | JPY |

### 設定値

- 数量: 固定「1」
- 支払い後のページ: 確認ページ（カスタムメッセージ可）
- 返金: ダッシュボードから手動処理（キャンセルポリシーに従う）

### 作成後の更新箇所

`src/lib/constants.ts` の `STRIPE_PAYMENT_LINKS` を差し替え:

```typescript
export const STRIPE_PAYMENT_LINKS = {
  ume:   "https://buy.stripe.com/xxxxx",
  take:  "https://buy.stripe.com/xxxxx",
  matsu: "https://buy.stripe.com/xxxxx",
};
```

Apps Script 内の `PAYMENT_LINKS` オブジェクトも同様に更新する。

---

## キャンセルポリシー

| キャンセルのタイミング | 返金額 |
|----------------------|--------|
| セッション14日以上前 | 全額返金（100%） |
| セッション7〜13日前 | 50%返金 |
| セッション3〜6日前 | 返金なし |
| セッション3日未満 | 返金なし |

**キャンセル手続き**:
1. お客様が info@en-chakai.com にキャンセルメール送信
2. Keita がセッション日と申請日から返金額を計算
3. Stripe ダッシュボード（支払い → 該当取引 → 返金）で処理

---

## サイト側の更新事項

外部サービスの設定完了後に対応:

- [ ] `src/lib/constants.ts` — `STRIPE_PAYMENT_LINKS` を実URLに差し替え
- [ ] `src/lib/constants.ts` — `GOOGLE_FORMS.booking` をフォームURLに差し替え
- [ ] `src/lib/constants.ts` — 電話番号のプレースホルダーを実番号に差し替え
- [ ] キャンセルページ — Google フォームの埋め込みを `mailto:info@en-chakai.com` リンクに変更
- [ ] キャンセルポリシーをサイト内に明記（予約ページ or 専用ページ）

---

## セットアップチェックリスト

### Google フォーム
- [ ] フォーム作成（10項目）
- [ ] スプレッドシートに回答を連携
- [ ] L列にStatus ドロップダウン設定（`Pending, Confirmed, Declined`）
- [ ] M列に `Email Sent` ヘッダーを追加
- [ ] スプレッドシートのスクリプトエディタに Apps Script を貼り付け
- [ ] 動作テスト: ダミー送信 → Status を Confirmed に変更 → メール着信確認

### Stripe
- [ ] Payment Link を3つ作成（梅 / 竹 / 松）
- [ ] `constants.ts` の URL を差し替え
- [ ] Apps Script の `PAYMENT_LINKS` を差し替え
- [ ] テストモードで決済フロー確認

### サイト
- [ ] `constants.ts` をフォームURL・Stripe URLで更新
- [ ] キャンセルページを mailto リンクに変更
- [ ] キャンセルポリシーをサイトに追加
- [ ] デプロイ

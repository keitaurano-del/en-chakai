/**
 * En Chakai — 予約フォーム自動生成スクリプト
 *
 * 使い方:
 *   1. https://script.google.com で新規プロジェクトを作成
 *   2. このコードを貼り付けて保存
 *   3. createBookingForm() を選択して「実行」
 *   4. 権限の確認が出たら許可する
 *   5. 実行ログにフォームのURLが表示される
 */

function createBookingForm() {
  const form = FormApp.create("En Chakai — Reservation");
  form.setDescription(
    "Book your tea ceremony experience. " +
    "We will send a confirmation email with payment details within 24 hours."
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);

  // 1. Select Plan
  const planItem = form.addMultipleChoiceItem();
  planItem
    .setTitle("Select Plan")
    .setRequired(true)
    .setChoiceValues([
      "Ume — ¥9,000 / 60 min / Up to 6 guests",
      "Take — ¥15,000 / 90 min / Up to 4 guests",
      "Matsu — ¥25,000 / 120 min / Up to 2 guests (Recommended)",
    ]);

  // 2. Preferred Date
  const dateItem = form.addDateItem();
  dateItem
    .setTitle("Preferred Date")
    .setRequired(true);

  // 3. Preferred Time
  const timeItem = form.addMultipleChoiceItem();
  timeItem
    .setTitle("Preferred Time")
    .setRequired(true)
    .setChoiceValues([
      "Morning — 10:00",
      "Afternoon — 14:00",
      "Late Afternoon — 16:00",
    ]);

  // 4. Number of Guests
  const guestsItem = form.addListItem();
  guestsItem
    .setTitle("Number of Guests")
    .setRequired(true)
    .setChoiceValues(["1", "2", "3", "4", "5", "6"]);

  // 5. Full Name
  const nameItem = form.addTextItem();
  nameItem
    .setTitle("Full Name")
    .setRequired(true);

  // 6. Email Address
  const emailItem = form.addTextItem();
  emailItem
    .setTitle("Email Address")
    .setRequired(true)
    .setValidation(
      FormApp.createTextValidation()
        .requireTextIsEmail()
        .build()
    );

  // 7. Phone Number（任意）
  const phoneItem = form.addTextItem();
  phoneItem
    .setTitle("Phone Number")
    .setHelpText("Please include your country code (e.g. +81-90-XXXX-XXXX).")
    .setRequired(false);

  // 8. Country of Residence（任意）
  const countryItem = form.addTextItem();
  countryItem
    .setTitle("Country of Residence")
    .setRequired(false);

  // 9. Allergies or Special Requests（任意）
  const notesItem = form.addParagraphTextItem();
  notesItem
    .setTitle("Allergies or Special Requests")
    .setRequired(false);

  // 10. Cancellation Policy Agreement（必須チェックボックス）
  const policyItem = form.addCheckboxItem();
  policyItem
    .setTitle("Cancellation Policy Agreement")
    .setHelpText(
      "I understand and agree to the cancellation policy:\n" +
      "14+ days before: full refund / 7–13 days: 50% refund / Less than 7 days: no refund.\n" +
      "Payment is required within 48 hours of confirmation to secure the booking."
    )
    .setRequired(true)
    .setChoiceValues([
      "I understand and agree to the cancellation policy above."
    ]);

  const url = form.getPublishedUrl();
  const editUrl = form.getEditUrl();

  Logger.log("=== フォーム作成完了 ===");
  Logger.log("公開URL（お客様向け）: " + url);
  Logger.log("編集URL（管理者向け）: " + editUrl);
  Logger.log("");
  Logger.log("次のステップ:");
  Logger.log("1. 編集URLを開いてスプレッドシートに回答を連携する");
  Logger.log("   [回答] タブ → スプレッドシートのアイコン → 新しいスプレッドシートを作成");
  Logger.log("2. 作成されたスプレッドシートのL列にStatusドロップダウンを設定");
  Logger.log("3. M列に 'Email Sent' ヘッダーを追加");
  Logger.log("4. スプレッドシートのApps Scriptにメール送信スクリプトを設定");
}

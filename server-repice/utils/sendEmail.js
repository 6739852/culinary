/**
 * שליחת מייל באמצעות nodemailer.
 * 
 * @param {string} to - כתובת המייל של הנמען
 * @param {string} subject - נושא המייל
 * @param {string} text - גוף המייל (טקסט רגיל)
 * @param {string|null} html - גוף המייל ב-HTML (אופציונלי)
 */
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // כתובת השרת SMTP לשליחת מיילים, נלקחת מהסביבה
      port: process.env.SMTP_PORT, // פורט השרת SMTP, נלקח מהסביבה
      secure: false, // האם להשתמש בחיבור מאובטח (SSL/TLS), כאן מוגדר כ-false
      auth: {
        user: process.env.SMTP_USER, // שם משתמש לחשבון המייל, נלקח מהסביבה
        pass: process.env.SMTP_PASS, // סיסמה לחשבון המייל, נלקחת מהסביבה
      },
    });

    const mailOptions = {
      from: '"Recipe App" <no-reply@recipes.com>',
      to,
      subject,
      text,
    };

    if (html) {
      mailOptions.html = html;
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
  }
};

module.exports = sendEmail;
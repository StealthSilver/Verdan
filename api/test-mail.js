require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendTestMail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // use false for custom/internal SMTP ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // 🔥 FIX for expired/self-signed cert
      },
    });

    const to =
      process.env.MAIL_TEST_TO?.trim() ||
      process.env.TEST_MAIL_TO?.trim() ||
      "bet.srvadmin@sterliteelectric.in";

    const info = await transporter.sendMail({
      from: `"Plant Monitoring" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject: "SMTP Test - Plant Monitoring",
      text: "SMTP is working successfully 🚀",
      html: `
        <h2>SMTP Test Successful 🎉</h2>
        <p>This email confirms that your SMTP configuration is working.</p>
        <p><b>Server:</b> ${process.env.SMTP_HOST}</p>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
}

sendTestMail();

import nodemailer from "nodemailer"

const smtpPort = Number(process.env.SMTP_PORT)
const smtpSecure =
    process.env.SMTP_SECURE === "true" || smtpPort === 465

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim(),
    port: smtpPort,
    secure: smtpSecure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth:{
        user: process.env.SMTP_USER?.trim(),
        pass: process.env.SMTP_PASS?.trim()
    }
});

export default transporter

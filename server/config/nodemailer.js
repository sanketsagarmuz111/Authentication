import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth:{
        user: process.env.SMTP_USER?.trim(),
        pass: process.env.SMTP_PASS?.trim()
    }
});

export default transporter

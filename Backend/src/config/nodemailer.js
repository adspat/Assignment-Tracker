import nodemailer from 'nodemailer'
import config from '../config/config.js'
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, 
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export default transporter
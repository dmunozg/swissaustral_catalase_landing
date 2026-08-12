import nodemailer from "nodemailer";
import type { AppConfig } from "./config";
import type { ContactMail } from "./contact";

export interface MailMessage {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] ?? character));
const textValue = (value: string): string => value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");

export function buildMailMessage(mail: ContactMail, config: AppConfig): MailMessage {
  const name = textValue(mail.payload.name);
  const email = textValue(mail.payload.email);
  const message = textValue(mail.payload.message);
  const escapedMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");
  if (mail.kind === "receipt") {
    return { to: email, subject: "We received your message", text: `Hello ${name},\n\nWe received your message:\n\n${message}\n\nWe will be in touch soon.`, html: `<p>Hello ${escapeHtml(name)},</p><p>We received your message:</p><p>${escapedMessage}</p><p>We will be in touch soon.</p>` };
  }
  return { to: config.emailReportTo, replyTo: email, subject: `New contact message from ${name}`, text: `Name: ${name}\nEmail: ${email}\n\n${message}`, html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p>${escapedMessage}</p>` };
}

export function createMailer(config: AppConfig): (mail: ContactMail) => Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    requireTLS: true,
    auth: { user: config.smtpUser, pass: config.smtpPass },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  });
  return async (mail) => {
    const message = buildMailMessage(mail, config);
    await transporter.sendMail({ from: config.emailFrom, to: message.to, replyTo: message.replyTo, subject: message.subject, text: message.text, html: message.html });
  };
}

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendStatusUpdateEmail = async ({ to, name, trackingId, status }) => {
  const statusColors = { process: '#f59e0b', resolved: '#10b981', closed: '#6b7280' };
  const color = statusColors[status] || '#f59e0b';
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `Complaint Update — Status: ${status.toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;background:#f9fafb;padding:24px;border-radius:12px;">
          <div style="background:#1a1a2e;padding:20px;border-radius:10px;text-align:center;">
            <h2 style="color:#fff;margin:0;">🏗️ T.R Construction</h2>
            <p style="color:#ffffff88;margin:4px 0 0;">Complaint Status Update</p>
          </div>
          <div style="padding:24px 0;">
            <p style="color:#374151;">Dear <strong>${name}</strong>,</p>
            <p style="color:#374151;">Your complaint status has been updated.</p>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Tracking ID</p>
              <p style="margin:0;font-size:18px;font-weight:bold;color:#1a1a2e;letter-spacing:1px;">${trackingId}</p>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Current Status</p>
              <span style="background:${color}22;color:${color};padding:6px 16px;border-radius:20px;font-weight:bold;font-size:14px;">${status.toUpperCase()}</span>
            </div>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2024 T.R Construction. All rights reserved.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const sendComplaintConfirmEmail = async ({ to, name, trackingId }) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `Complaint Received — Tracking ID: ${trackingId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;background:#f9fafb;padding:24px;border-radius:12px;">
          <div style="background:#1a1a2e;padding:20px;border-radius:10px;text-align:center;">
            <h2 style="color:#fff;margin:0;">🏗️ T.R Construction</h2>
            <p style="color:#ffffff88;margin:4px 0 0;">Complaint Received</p>
          </div>
          <div style="padding:24px 0;">
            <p style="color:#374151;">Dear <strong>${name}</strong>,</p>
            <p style="color:#374151;">We have received your complaint and will process it shortly.</p>
            <div style="background:#fff;border:2px solid #10b981;border-radius:10px;padding:20px;margin:16px 0;text-align:center;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Your Tracking ID</p>
              <p style="margin:0;font-size:24px;font-weight:bold;color:#10b981;letter-spacing:2px;">${trackingId}</p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">Save this ID to track your complaint status</p>
            </div>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2024 T.R Construction. All rights reserved.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

module.exports = { sendStatusUpdateEmail, sendComplaintConfirmEmail };

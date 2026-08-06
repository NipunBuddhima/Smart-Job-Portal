"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'Gmail', // Or use SendGrid/Mailgun in production
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Passwords for Gmail
    },
});
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Smart Job Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error('Email sending failed:', error);
    }
};
exports.sendEmail = sendEmail;
exports.emailTemplates = {
    registration: (name) => `
    <h2>Welcome to Smart Job Portal, ${name}!</h2>
    <p>Your account has been successfully created. Start exploring opportunities today.</p>
  `,
    passwordReset: (url) => `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
    <p><a href="${url}">Reset Password</a></p>
  `,
    applicationConfirmation: (jobTitle, company) => `
    <h2>Application Received</h2>
    <p>You have successfully applied for the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.</p>
  `,
    statusUpdate: (jobTitle, company, status) => `
    <h2>Application Update</h2>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated to: <strong><span style="text-transform: uppercase;">${status}</span></strong>.</p>
  `,
    interviewInvitation: (jobTitle, company) => `
    <h2>Interview Invitation</h2>
    <p>You have been shortlisted for the <strong>${jobTitle}</strong> role at <strong>${company}</strong>.</p>
    <p>The employer will contact you with the interview schedule.</p>
  `,
};
//# sourceMappingURL=email.js.map
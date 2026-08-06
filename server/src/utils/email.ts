import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Or use SendGrid/Mailgun in production
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Passwords for Gmail
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"Smart Job Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

export const emailTemplates = {
  registration: (name: string) => `
    <h2>Welcome to Smart Job Portal, ${name}!</h2>
    <p>Your account has been successfully created. Start exploring opportunities today.</p>
  `,
  passwordReset: (url: string) => `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
    <p><a href="${url}">Reset Password</a></p>
  `,
  applicationConfirmation: (jobTitle: string, company: string) => `
    <h2>Application Received</h2>
    <p>You have successfully applied for the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.</p>
  `,
  statusUpdate: (jobTitle: string, company: string, status: string) => `
    <h2>Application Update</h2>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated to: <strong><span style="text-transform: uppercase;">${status}</span></strong>.</p>
  `,
  interviewInvitation: (jobTitle: string, company: string) => `
    <h2>Interview Invitation</h2>
    <p>You have been shortlisted for the <strong>${jobTitle}</strong> role at <strong>${company}</strong>.</p>
    <p>The employer will contact you with the interview schedule.</p>
  `,
};
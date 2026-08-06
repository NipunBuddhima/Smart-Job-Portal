export declare const sendEmail: (to: string, subject: string, html: string) => Promise<void>;
export declare const emailTemplates: {
    registration: (name: string) => string;
    passwordReset: (url: string) => string;
    applicationConfirmation: (jobTitle: string, company: string) => string;
    statusUpdate: (jobTitle: string, company: string, status: string) => string;
    interviewInvitation: (jobTitle: string, company: string) => string;
};
//# sourceMappingURL=email.d.ts.map
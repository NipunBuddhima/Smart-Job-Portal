type CandidateProfileBody = Record<string, unknown>;
type EmployerProfileBody = Record<string, unknown>;
type ValidationResult<T> = {
    value: Partial<T>;
    errors: string[];
};
type CandidateProfileUpdate = {
    name?: string;
    skills?: string[];
    education?: Array<{
        institution: string;
        degree: string;
        startDate: string;
        endDate?: string;
        description?: string;
    }>;
    experience?: Array<{
        company: string;
        title: string;
        startDate: string;
        endDate?: string;
        description?: string;
    }>;
    socialLinks?: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
    };
};
type EmployerProfileUpdate = {
    name?: string;
    companyName?: string;
    companyDescription?: string;
    website?: string;
};
export declare const validateCandidateProfileUpdate: (body: CandidateProfileBody) => ValidationResult<CandidateProfileUpdate>;
export declare const validateEmployerProfileUpdate: (body: EmployerProfileBody) => ValidationResult<EmployerProfileUpdate>;
export {};
//# sourceMappingURL=profile.validators.d.ts.map
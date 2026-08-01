"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmployerProfileUpdate = exports.validateCandidateProfileUpdate = void 0;
const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');
const parseUrl = (value) => {
    const stringValue = toTrimmedString(value);
    if (!stringValue) {
        return '';
    }
    try {
        return new URL(stringValue).toString();
    }
    catch {
        return null;
    }
};
const parseSkills = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => toTrimmedString(item)).filter(Boolean);
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};
const parseCandidateEntry = (value, requiredFields) => {
    if (!value || typeof value !== 'object') {
        return { item: null, errors: ['Invalid entry format'] };
    }
    const source = value;
    const item = {
        institution: toTrimmedString(source.institution),
        degree: toTrimmedString(source.degree),
        company: toTrimmedString(source.company),
        title: toTrimmedString(source.title),
        startDate: toTrimmedString(source.startDate),
        endDate: toTrimmedString(source.endDate),
        description: toTrimmedString(source.description),
    };
    const errors = requiredFields.filter((field) => !item[field]).map((field) => `${field} is required`);
    return { item, errors };
};
const validateCandidateProfileUpdate = (body) => {
    const errors = [];
    const value = {};
    const name = toTrimmedString(body.name);
    if (name) {
        value.name = name;
    }
    const skills = parseSkills(body.skills);
    if (body.skills !== undefined) {
        if (!skills.length) {
            errors.push('Add at least one skill');
        }
        else {
            value.skills = skills;
        }
    }
    if (Array.isArray(body.education)) {
        const education = body.education
            .map((entry) => parseCandidateEntry(entry, ['institution', 'degree', 'startDate']))
            .filter(({ item }) => Boolean(item));
        const educationErrors = education.flatMap(({ errors: entryErrors }) => entryErrors);
        if (educationErrors.length) {
            errors.push(`Education: ${educationErrors.join(', ')}`);
        }
        else {
            value.education = education.map(({ item }) => ({
                institution: item.institution,
                degree: item.degree,
                startDate: item.startDate,
                endDate: item.endDate,
                description: item.description,
            }));
        }
    }
    if (Array.isArray(body.experience)) {
        const experience = body.experience
            .map((entry) => parseCandidateEntry(entry, ['company', 'title', 'startDate']))
            .filter(({ item }) => Boolean(item));
        const experienceErrors = experience.flatMap(({ errors: entryErrors }) => entryErrors);
        if (experienceErrors.length) {
            errors.push(`Experience: ${experienceErrors.join(', ')}`);
        }
        else {
            value.experience = experience.map(({ item }) => ({
                company: item.company,
                title: item.title,
                startDate: item.startDate,
                endDate: item.endDate,
                description: item.description,
            }));
        }
    }
    if (body.socialLinks && typeof body.socialLinks === 'object') {
        const socialLinks = body.socialLinks;
        const linkedin = parseUrl(socialLinks.linkedin);
        const github = parseUrl(socialLinks.github);
        const portfolio = parseUrl(socialLinks.portfolio);
        if (linkedin === null)
            errors.push('LinkedIn must be a valid URL');
        if (github === null)
            errors.push('GitHub must be a valid URL');
        if (portfolio === null)
            errors.push('Portfolio must be a valid URL');
        value.socialLinks = {
            linkedin: linkedin ?? '',
            github: github ?? '',
            portfolio: portfolio ?? '',
        };
    }
    return { value, errors };
};
exports.validateCandidateProfileUpdate = validateCandidateProfileUpdate;
const validateEmployerProfileUpdate = (body) => {
    const errors = [];
    const value = {};
    const name = toTrimmedString(body.name);
    if (name) {
        value.name = name;
    }
    const companyName = toTrimmedString(body.companyName);
    if (companyName) {
        value.companyName = companyName;
    }
    const companyDescription = toTrimmedString(body.companyDescription);
    if (companyDescription) {
        value.companyDescription = companyDescription;
    }
    if (body.website !== undefined) {
        const website = parseUrl(body.website);
        if (website === null) {
            errors.push('Website must be a valid URL');
        }
        else if (website) {
            value.website = website;
        }
    }
    return { value, errors };
};
exports.validateEmployerProfileUpdate = validateEmployerProfileUpdate;
//# sourceMappingURL=profile.validators.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationStatus = exports.getJobApplicants = exports.withdrawApplication = exports.getCandidateApplications = exports.applyForJob = void 0;
const Application_1 = __importDefault(require("../models/Application"));
const Job_1 = __importDefault(require("../models/Job"));
const cloudinary_1 = require("../utils/cloudinary");
const errorHandler_1 = require("../middleware/errorHandler");
const allowedApplicationStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
const parseApplicationStatus = (value) => {
    if (typeof value !== 'string') {
        return null;
    }
    return allowedApplicationStatuses.includes(value)
        ? value
        : null;
};
// CANDIDATE: Apply for a job
const applyForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { coverLetter, profileResumeUrl } = req.body; // profileResumeUrl is sent if they don't upload a new one
        const job = await Job_1.default.findById(jobId);
        if (!job)
            return next(new errorHandler_1.AppError('Job not found', 404));
        if (job.status !== 'published')
            return next(new errorHandler_1.AppError('This job is no longer accepting applications', 400));
        // Check if already applied
        const existingApplication = await Application_1.default.findOne({ jobId, candidateId: req.user.id });
        if (existingApplication)
            return next(new errorHandler_1.AppError('You have already applied for this job', 400));
        let finalResumeUrl = profileResumeUrl;
        // If candidate uploads a tailored resume just for this application
        if (req.file) {
            finalResumeUrl = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'job_portal/applications', 'raw');
        }
        if (!finalResumeUrl)
            return next(new errorHandler_1.AppError('A resume is required to apply', 400));
        const application = await Application_1.default.create({
            jobId,
            candidateId: req.user.id,
            resumeUrl: finalResumeUrl,
            coverLetter,
        });
        res.status(201).json({ success: true, data: application });
    }
    catch (error) {
        next(error);
    }
};
exports.applyForJob = applyForJob;
// CANDIDATE: Get own applications
const getCandidateApplications = async (req, res, next) => {
    try {
        const applications = await Application_1.default.find({ candidateId: req.user.id })
            .populate({
            path: 'jobId',
            select: 'title location jobType salaryRange status employerId',
            populate: { path: 'employerId', select: 'name companyName companyLogo avatar' },
        })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    }
    catch (error) {
        next(error);
    }
};
exports.getCandidateApplications = getCandidateApplications;
// CANDIDATE: Withdraw application
const withdrawApplication = async (req, res, next) => {
    try {
        const application = await Application_1.default.findOne({ _id: req.params.id, candidateId: req.user.id });
        if (!application)
            return next(new errorHandler_1.AppError('Application not found or unauthorized', 404));
        await application.deleteOne();
        res.status(200).json({ success: true, message: 'Application withdrawn successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.withdrawApplication = withdrawApplication;
// EMPLOYER: Get applicants for a specific job
const getJobApplicants = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        // Verify the employer owns this job
        const job = await Job_1.default.findOne({ _id: jobId, employerId: req.user.id });
        if (!job && req.user.role !== 'admin') {
            return next(new errorHandler_1.AppError('Not authorized to view these applications', 403));
        }
        const applications = await Application_1.default.find({ jobId })
            .populate('candidateId', 'name email avatar skills') // Get candidate profile data
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    }
    catch (error) {
        next(error);
    }
};
exports.getJobApplicants = getJobApplicants;
// EMPLOYER: Update application status
const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const parsedStatus = parseApplicationStatus(status);
        if (!parsedStatus) {
            return next(new errorHandler_1.AppError('Invalid application status', 400));
        }
        const application = await Application_1.default.findById(req.params.id).populate('jobId');
        if (!application)
            return next(new errorHandler_1.AppError('Application not found', 404));
        // Verify employer owns the job this application is for
        const job = application.jobId;
        if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new errorHandler_1.AppError('Not authorized to update this application', 403));
        }
        application.status = parsedStatus;
        await application.save();
        res.status(200).json({ success: true, data: application });
    }
    catch (error) {
        next(error);
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
//# sourceMappingURL=application.controller.js.map
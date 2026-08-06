"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsaveJob = exports.saveJob = exports.draftJob = exports.closeJob = exports.deleteJob = exports.updateJob = exports.getJobById = exports.getJobs = exports.createJob = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const errorHandler_1 = require("../middleware/errorHandler");
const socket_1 = require("../utils/socket");
const buildUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    resume: user.resume,
    resumeName: user.resumeName ?? '',
    skills: user.skills ?? [],
    education: user.education ?? [],
    experience: user.experience ?? [],
    socialLinks: user.socialLinks ?? {},
    companyName: user.companyName ?? '',
    companyDescription: user.companyDescription ?? '',
    website: user.website ?? '',
    companyLogo: user.companyLogo ?? '',
    savedJobs: user.savedJobs ?? [],
});
const buildJobResponse = (job, currentUser) => ({
    id: job._id,
    title: job.title,
    description: job.description,
    requirements: job.requirements ?? [],
    location: job.location,
    jobType: job.jobType,
    salaryRange: job.salaryRange,
    status: job.status,
    tags: job.tags ?? [],
    employer: job.employerId && typeof job.employerId === 'object'
        ? {
            id: job.employerId._id,
            name: job.employerId.name,
            avatar: job.employerId.avatar ?? '',
            companyName: job.employerId.companyName ?? '',
            companyLogo: job.employerId.companyLogo ?? '',
        }
        : job.employerId,
    isSaved: Boolean(currentUser?.savedJobs?.some((savedJobId) => savedJobId.toString() === job._id.toString())),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
});
const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const parseStatus = (value) => {
    if (value === 'draft' || value === 'published' || value === 'closed') {
        return value;
    }
    return null;
};
const parseSort = (sort) => {
    switch (sort) {
        case 'salaryAsc':
            return { 'salaryRange.min': 1 };
        case 'salaryDesc':
            return { 'salaryRange.max': -1 };
        case 'oldest':
            return { createdAt: 1 };
        default:
            return { createdAt: -1 };
    }
};
const canAccessNonPublishedJob = (req, job) => {
    if (!req.user) {
        return false;
    }
    if (req.user.role === 'admin') {
        return true;
    }
    return req.user.role === 'employer' && job.employerId.toString() === req.user.id;
};
const canManageJob = (req, job) => {
    if (req.user?.role === 'admin') {
        return true;
    }
    return req.user?.role === 'employer' && job.employerId.toString() === req.user.id;
};
const createJob = async (req, res, next) => {
    try {
        const job = await Job_1.default.create({
            ...req.body,
            employerId: req.user.id,
            status: parseStatus(req.body.status) || 'published',
        });
        const populatedJob = await Job_1.default.findById(job._id).populate('employerId', 'name avatar companyName companyLogo');
        await Notification_1.default.create({
            userId: req.user.id,
            message: `New job posted: ${job.title}.`,
            type: 'info',
            read: false,
        });
        (0, socket_1.broadcastNotification)({
            message: `New job posted: ${job.title}.`,
            type: 'info',
        });
        res.status(201).json({ success: true, data: buildJobResponse(populatedJob) });
    }
    catch (error) {
        next(error);
    }
};
exports.createJob = createJob;
const getJobs = async (req, res, next) => {
    try {
        const { search, jobType, location, sort, page = 1, limit = 10, status } = req.query;
        const query = req.user?.role === 'employer' ? { employerId: req.user.id } : { status: 'published' };
        if (search) {
            query.$text = { $search: search };
        }
        if (jobType) {
            query.jobType = jobType;
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        const parsedStatus = parseStatus(status);
        if (parsedStatus && req.user?.role === 'employer') {
            query.status = parsedStatus;
        }
        const skip = (parseNumber(page, 1) - 1) * parseNumber(limit, 10);
        const jobs = await Job_1.default.find(query)
            .populate('employerId', 'name avatar companyName companyLogo')
            .sort(parseSort(sort))
            .skip(skip)
            .limit(parseNumber(limit, 10));
        const total = await Job_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            count: jobs.length,
            total,
            page: parseNumber(page, 1),
            totalPages: Math.ceil(total / parseNumber(limit, 10)),
            data: jobs.map((job) => buildJobResponse(job, req.user)),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getJobs = getJobs;
const getJobById = async (req, res, next) => {
    try {
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            return next(new errorHandler_1.AppError('Job not found', 404));
        }
        if (job.status !== 'published' && !canAccessNonPublishedJob(req, job)) {
            return next(new errorHandler_1.AppError('Job not found', 404));
        }
        const populatedJob = await Job_1.default.findById(job._id).populate('employerId', 'name avatar companyName companyLogo');
        res.status(200).json({ success: true, data: buildJobResponse(populatedJob, req.user) });
    }
    catch (error) {
        next(error);
    }
};
exports.getJobById = getJobById;
const updateJob = async (req, res, next) => {
    try {
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            return next(new errorHandler_1.AppError('Job not found', 404));
        }
        if (!canManageJob(req, job)) {
            return next(new errorHandler_1.AppError('Not authorized to update this job', 403));
        }
        const updatePayload = { ...req.body };
        if (updatePayload.status) {
            const parsedStatus = parseStatus(updatePayload.status);
            updatePayload.status = parsedStatus || job.status;
        }
        const updatedJob = await Job_1.default.findByIdAndUpdate(req.params.id, updatePayload, { new: true, runValidators: true }).populate('employerId', 'name avatar companyName companyLogo');
        res.status(200).json({ success: true, data: buildJobResponse(updatedJob) });
    }
    catch (error) {
        next(error);
    }
};
exports.updateJob = updateJob;
const deleteJob = async (req, res, next) => {
    try {
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            return next(new errorHandler_1.AppError('Job not found', 404));
        }
        if (!canManageJob(req, job)) {
            return next(new errorHandler_1.AppError('Not authorized to delete this job', 403));
        }
        await job.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteJob = deleteJob;
const closeJob = async (req, res, next) => {
    try {
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            return next(new errorHandler_1.AppError('Job not found', 404));
        }
        if (!canManageJob(req, job)) {
            return next(new errorHandler_1.AppError('Not authorized to update this job', 403));
        }
        job.status = 'closed';
        await job.save();
        const populatedJob = await Job_1.default.findById(job._id).populate('employerId', 'name avatar companyName companyLogo');
        res.status(200).json({ success: true, data: buildJobResponse(populatedJob) });
    }
    catch (error) {
        next(error);
    }
};
exports.closeJob = closeJob;
const draftJob = async (req, res, next) => {
    try {
        const job = await Job_1.default.findById(req.params.id);
        if (!job) {
            return next(new errorHandler_1.AppError('Job not found', 404));
        }
        if (!canManageJob(req, job)) {
            return next(new errorHandler_1.AppError('Not authorized to update this job', 403));
        }
        job.status = 'draft';
        await job.save();
        const populatedJob = await Job_1.default.findById(job._id).populate('employerId', 'name avatar companyName companyLogo');
        res.status(200).json({ success: true, data: buildJobResponse(populatedJob) });
    }
    catch (error) {
        next(error);
    }
};
exports.draftJob = draftJob;
const saveJob = async (req, res, next) => {
    try {
        if (req.user?.role !== 'candidate') {
            return next(new errorHandler_1.AppError('Only candidates can save jobs', 403));
        }
        const job = await Job_1.default.findById(req.params.id);
        if (!job || job.status !== 'published') {
            return next(new errorHandler_1.AppError('Job not found', 404));
        }
        const user = await User_1.default.findByIdAndUpdate(req.user.id, { $addToSet: { savedJobs: job._id } }, { new: true, runValidators: true });
        res.status(200).json({ success: true, saved: true, user: buildUserResponse(user) });
    }
    catch (error) {
        next(error);
    }
};
exports.saveJob = saveJob;
const unsaveJob = async (req, res, next) => {
    try {
        if (req.user?.role !== 'candidate') {
            return next(new errorHandler_1.AppError('Only candidates can save jobs', 403));
        }
        const user = await User_1.default.findByIdAndUpdate(req.user.id, { $pull: { savedJobs: req.params.id } }, { new: true, runValidators: true });
        res.status(200).json({ success: true, saved: false, user: buildUserResponse(user) });
    }
    catch (error) {
        next(error);
    }
};
exports.unsaveJob = unsaveJob;
//# sourceMappingURL=job.controller.js.map
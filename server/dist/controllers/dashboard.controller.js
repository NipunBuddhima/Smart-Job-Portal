"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = exports.getEmployerDashboard = exports.getCandidateDashboard = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const Application_1 = __importDefault(require("../models/Application"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
// CANDIDATE DASHBOARD
const getCandidateDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // 1. Fetch User details to calculate profile completion
        const user = await User_1.default.findById(userId).populate('savedJobs', 'title location companyName');
        let completionPercentage = 20; // Base for having an account
        if (user?.avatar)
            completionPercentage += 20;
        if (user?.resume)
            completionPercentage += 40;
        if (user?.skills && user.skills.length > 0)
            completionPercentage += 20;
        // 2. Get Applied Jobs count & recent
        const applications = await Application_1.default.find({ candidateId: userId })
            .populate('jobId', 'title location status')
            .sort({ createdAt: -1 })
            .limit(5);
        const totalApplied = await Application_1.default.countDocuments({ candidateId: userId });
        // 3. Get Notifications
        const notifications = await Notification_1.default.find({ userId }).sort({ createdAt: -1 }).limit(5);
        res.status(200).json({
            success: true,
            data: {
                profileCompletion: completionPercentage,
                totalApplied,
                savedJobs: user?.savedJobs || [],
                recentApplications: applications,
                notifications,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCandidateDashboard = getCandidateDashboard;
// EMPLOYER DASHBOARD
const getEmployerDashboard = async (req, res, next) => {
    try {
        const employerId = req.user.id;
        // 1. Job Stats
        const totalJobs = await Job_1.default.countDocuments({ employerId });
        const activeJobs = await Job_1.default.countDocuments({ employerId, status: 'published' });
        // 2. Applicant Analytics (using Aggregation)
        const applicantStats = await Application_1.default.aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            { $unwind: '$job' },
            { $match: { 'job.employerId': employerId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        // Format stats into a readable object { pending: 5, shortlisted: 2, etc. }
        const formattedStats = applicantStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});
        // 3. Recent Applicants
        const recentJobs = await Job_1.default.find({ employerId }).select('_id title status location createdAt').sort({ createdAt: -1 }).limit(5);
        const jobIds = recentJobs.map((job) => job._id);
        const recentApplicants = await Application_1.default.find({ jobId: { $in: jobIds } })
            .populate('candidateId', 'name email')
            .populate('jobId', 'title')
            .sort({ createdAt: -1 })
            .limit(5);
        res.status(200).json({
            success: true,
            data: {
                totalJobs,
                activeJobs,
                applicantStats: formattedStats,
                recentApplicants,
                recentJobs,
                totalApplicants: recentApplicants.length,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEmployerDashboard = getEmployerDashboard;
// ADMIN DASHBOARD
const getAdminDashboard = async (req, res, next) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const totalEmployers = await User_1.default.countDocuments({ role: 'employer' });
        const totalCandidates = await User_1.default.countDocuments({ role: 'candidate' });
        const totalCompanies = await User_1.default.countDocuments({ role: 'employer', companyName: { $ne: '' } });
        const totalJobs = await Job_1.default.countDocuments();
        const totalApplications = await Application_1.default.countDocuments();
        const publishedJobs = await Job_1.default.countDocuments({ status: 'published' });
        const pendingApplications = await Application_1.default.countDocuments({ status: 'pending' });
        const recentCompanies = await User_1.default.find({ role: 'employer' })
            .select('name email companyName companyLogo createdAt')
            .sort({ createdAt: -1 })
            .limit(5);
        res.status(200).json({
            success: true,
            data: {
                users: { total: totalUsers, employers: totalEmployers, candidates: totalCandidates },
                companies: totalCompanies,
                jobs: totalJobs,
                applications: totalApplications,
                reports: {
                    publishedJobs,
                    pendingApplications,
                    totalCompanies,
                },
                recentCompanies,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdminDashboard = getAdminDashboard;
//# sourceMappingURL=dashboard.controller.js.map
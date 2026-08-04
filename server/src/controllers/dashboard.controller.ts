import { Request, Response, NextFunction } from 'express';
import Job from '../models/Job';
import Application from '../models/Application';
import User from '../models/User';
import Notification from '../models/Notification';
import { AppError } from '../middleware/errorHandler';

// CANDIDATE DASHBOARD
export const getCandidateDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    // 1. Fetch User details to calculate profile completion
    const user = await User.findById(userId).populate('savedJobs', 'title location companyName');
    let completionPercentage = 20; // Base for having an account
    if (user?.avatar) completionPercentage += 20;
    if (user?.resume) completionPercentage += 40;
    if (user?.skills && user.skills.length > 0) completionPercentage += 20;

    // 2. Get Applied Jobs count & recent
    const applications = await Application.find({ candidateId: userId })
      .populate('jobId', 'title location status')
      .sort({ createdAt: -1 })
      .limit(5);
    const totalApplied = await Application.countDocuments({ candidateId: userId });

    // 3. Get Notifications
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(5);

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
  } catch (error) {
    next(error);
  }
};

// EMPLOYER DASHBOARD
export const getEmployerDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employerId = req.user.id;

    // 1. Job Stats
    const totalJobs = await Job.countDocuments({ employerId });
    const activeJobs = await Job.countDocuments({ employerId, status: 'published' });

    // 2. Applicant Analytics (using Aggregation)
    const applicantStats = await Application.aggregate([
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
    const formattedStats = applicantStats.reduce((acc: Record<string, number>, curr: { _id: string; count: number }) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // 3. Recent Applicants
    const recentJobs = await Job.find({ employerId }).select('_id title status location createdAt').sort({ createdAt: -1 }).limit(5);
    const jobIds = recentJobs.map((job) => job._id);

    const recentApplicants = await Application.find({ jobId: { $in: jobIds } })
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
  } catch (error) {
    next(error);
  }
};

// ADMIN DASHBOARD
export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalCompanies = await User.countDocuments({ role: 'employer', companyName: { $ne: '' } });

    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const publishedJobs = await Job.countDocuments({ status: 'published' });
    const pendingApplications = await Application.countDocuments({ status: 'pending' });

    const recentCompanies = await User.find({ role: 'employer' })
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
  } catch (error) {
    next(error);
  }
};
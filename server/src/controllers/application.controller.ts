import { Request, Response, NextFunction } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import User from '../models/User';
import Notification from '../models/Notification';
import { AppError } from '../middleware/errorHandler';
import { saveUploadedFileLocally } from '../utils/localFileStorage';
import { sendEmail, emailTemplates } from '../utils/email';
import { sendRealTimeNotification } from '../utils/socket';

const allowedApplicationStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'] as const;

const parseApplicationStatus = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  return allowedApplicationStatuses.includes(value as (typeof allowedApplicationStatuses)[number])
    ? (value as (typeof allowedApplicationStatuses)[number])
    : null;
};

// CANDIDATE: Apply for a job
export const applyForJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, profileResumeUrl } = req.body; // profileResumeUrl is sent if they don't upload a new one

    const job = await Job.findById(jobId);
    if (!job) return next(new AppError('Job not found', 404));
    if (job.status !== 'published') return next(new AppError('This job is no longer accepting applications', 400));

    // Check if already applied
    const existingApplication = await Application.findOne({ jobId, candidateId: req.user.id });
    if (existingApplication) return next(new AppError('You have already applied for this job', 400));

    let finalResumeUrl = profileResumeUrl;

    // If candidate uploads a tailored resume just for this application
    if (req.file) {
      finalResumeUrl = await saveUploadedFileLocally(
        req.file.buffer,
        'job_portal/applications',
        req.file.originalname,
        req.user.id
      );
    }

    if (!finalResumeUrl) return next(new AppError('A resume is required to apply', 400));

    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      resumeUrl: finalResumeUrl,
      coverLetter,
    });

    const candidate = await User.findById(req.user.id).select('email name');
    const employer = await User.findById(job.employerId).select('name companyName email');
    const employerName = employer?.companyName || employer?.name || 'the employer';

    await sendEmail(
      candidate?.email || '',
      'Application confirmed',
      emailTemplates.applicationConfirmation(job.title, employerName)
    );

    await Notification.create({
      userId: req.user.id,
      message: `Application submitted for ${job.title}.`,
      type: 'success',
      read: false,
    });

    sendRealTimeNotification(req.user.id, {
      message: `Application submitted for ${job.title}.`,
      type: 'success',
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// CANDIDATE: Get own applications
export const getCandidateApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applications = await Application.find({ candidateId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title location jobType salaryRange status employerId',
        populate: { path: 'employerId', select: 'name companyName companyLogo avatar' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// CANDIDATE: Withdraw application
export const withdrawApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, candidateId: req.user.id });
    if (!application) return next(new AppError('Application not found or unauthorized', 404));

    await application.deleteOne();
    res.status(200).json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

// EMPLOYER: Get applicants for a specific job
export const getJobApplicants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;

    // Verify the employer owns this job
    const job = await Job.findOne({ _id: jobId, employerId: req.user.id });
    if (!job && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to view these applications', 403));
    }

    const applications = await Application.find({ jobId })
      .populate('candidateId', 'name email avatar skills') // Get candidate profile data
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// EMPLOYER: Update application status
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const parsedStatus = parseApplicationStatus(status);

    if (!parsedStatus) {
      return next(new AppError('Invalid application status', 400));
    }

    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) return next(new AppError('Application not found', 404));

    // Verify employer owns the job this application is for
    const job: any = application.jobId;
    if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this application', 403));
    }

    application.status = parsedStatus;
    await application.save();

    await application.populate('candidateId', 'name email');
    await application.populate('jobId', 'title employerId');

    const candidate = application.candidateId as any;
    const jobDetails = application.jobId as any;
    const employer = await User.findById(jobDetails.employerId).select('companyName name');
    const employerName = employer?.companyName || employer?.name || 'the employer';

    if (parsedStatus === 'shortlisted') {
      await sendEmail(
        candidate.email,
        'Interview Invitation',
        emailTemplates.interviewInvitation(jobDetails.title, employerName)
      );
    }

    if (parsedStatus === 'accepted' || parsedStatus === 'rejected') {
      await sendEmail(
        candidate.email,
        `Application ${parsedStatus}`,
        emailTemplates.statusUpdate(jobDetails.title, employerName, parsedStatus)
      );
    }

    const notificationMessage =
      parsedStatus === 'accepted'
        ? `Your application for ${jobDetails.title} has been accepted.`
        : parsedStatus === 'rejected'
          ? `Your application for ${jobDetails.title} has been rejected.`
          : parsedStatus === 'shortlisted'
            ? `You have been shortlisted for ${jobDetails.title}.`
            : `Your application for ${jobDetails.title} is now ${parsedStatus}.`;

    await Notification.create({
      userId: candidate._id,
      message: notificationMessage,
      type: parsedStatus === 'rejected' ? 'warning' : 'success',
      read: false,
    });

    sendRealTimeNotification(candidate._id.toString(), {
      message: notificationMessage,
      type: parsedStatus === 'rejected' ? 'warning' : 'success',
    });

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
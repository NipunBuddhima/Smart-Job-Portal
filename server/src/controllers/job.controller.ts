import { Request, Response, NextFunction } from 'express';
import Job from '../models/Job';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';

const buildUserResponse = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  resume: user.resume,
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

const buildJobResponse = (job: any, currentUser?: any) => ({
  id: job._id,
  title: job.title,
  description: job.description,
  requirements: job.requirements ?? [],
  location: job.location,
  jobType: job.jobType,
  salaryRange: job.salaryRange,
  status: job.status,
  tags: job.tags ?? [],
  employer:
    job.employerId && typeof job.employerId === 'object'
      ? {
          id: job.employerId._id,
          name: job.employerId.name,
          avatar: job.employerId.avatar ?? '',
          companyName: job.employerId.companyName ?? '',
          companyLogo: job.employerId.companyLogo ?? '',
        }
      : job.employerId,
  isSaved: Boolean(currentUser?.savedJobs?.some((savedJobId: any) => savedJobId.toString() === job._id.toString())),
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

const parseNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseStatus = (value: unknown) => {
  if (value === 'draft' || value === 'published' || value === 'closed') {
    return value;
  }

  return null;
};

const parseSort = (sort: unknown) => {
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

const canAccessNonPublishedJob = (req: Request, job: any) => {
  if (!req.user) {
    return false;
  }

  if (req.user.role === 'admin') {
    return true;
  }

  return req.user.role === 'employer' && job.employerId.toString() === req.user.id;
};

const canManageJob = (req: Request, job: any) => {
  if (req.user?.role === 'admin') {
    return true;
  }

  return req.user?.role === 'employer' && job.employerId.toString() === req.user.id;
};

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.create({
      ...req.body,
      employerId: req.user.id,
      status: parseStatus(req.body.status) || 'published',
    });

    const populatedJob = await Job.findById(job._id).populate('employerId', 'name avatar companyName companyLogo');

    res.status(201).json({ success: true, data: buildJobResponse(populatedJob) });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, jobType, location, sort, page = 1, limit = 10, status } = req.query;
    const query: Record<string, unknown> = req.user?.role === 'employer' ? { employerId: req.user.id } : { status: 'published' };

    if (search) {
      query.$text = { $search: search as string };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (location) {
      query.location = { $regex: location as string, $options: 'i' };
    }

    const parsedStatus = parseStatus(status);
    if (parsedStatus && req.user?.role === 'employer') {
      query.status = parsedStatus;
    }

    const skip = (parseNumber(page, 1) - 1) * parseNumber(limit, 10);
    const jobs = await Job.find(query)
      .populate('employerId', 'name avatar companyName companyLogo')
      .sort(parseSort(sort) as any)
      .skip(skip)
      .limit(parseNumber(limit, 10));

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseNumber(page, 1),
      totalPages: Math.ceil(total / parseNumber(limit, 10)),
      data: jobs.map((job) => buildJobResponse(job, req.user)),
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.status !== 'published' && !canAccessNonPublishedJob(req, job)) {
      return next(new AppError('Job not found', 404));
    }

    const populatedJob = await Job.findById(job._id).populate('employerId', 'name avatar companyName companyLogo');
    res.status(200).json({ success: true, data: buildJobResponse(populatedJob, req.user) });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (!canManageJob(req, job)) {
      return next(new AppError('Not authorized to update this job', 403));
    }

    const updatePayload = { ...req.body };
    if (updatePayload.status) {
      const parsedStatus = parseStatus(updatePayload.status);
      updatePayload.status = parsedStatus || job.status;
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updatePayload, { new: true, runValidators: true }).populate(
      'employerId',
      'name avatar companyName companyLogo'
    );

    res.status(200).json({ success: true, data: buildJobResponse(updatedJob) });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (!canManageJob(req, job)) {
      return next(new AppError('Not authorized to delete this job', 403));
    }

    await job.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const closeJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (!canManageJob(req, job)) {
      return next(new AppError('Not authorized to update this job', 403));
    }

    job.status = 'closed';
    await job.save();

    const populatedJob = await Job.findById(job._id).populate('employerId', 'name avatar companyName companyLogo');
    res.status(200).json({ success: true, data: buildJobResponse(populatedJob) });
  } catch (error) {
    next(error);
  }
};

export const draftJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (!canManageJob(req, job)) {
      return next(new AppError('Not authorized to update this job', 403));
    }

    job.status = 'draft';
    await job.save();

    const populatedJob = await Job.findById(job._id).populate('employerId', 'name avatar companyName companyLogo');
    res.status(200).json({ success: true, data: buildJobResponse(populatedJob) });
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'candidate') {
      return next(new AppError('Only candidates can save jobs', 403));
    }

    const job = await Job.findById(req.params.id);
    if (!job || job.status !== 'published') {
      return next(new AppError('Job not found', 404));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { savedJobs: job._id } },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, saved: true, user: buildUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

export const unsaveJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'candidate') {
      return next(new AppError('Only candidates can save jobs', 403));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { savedJobs: req.params.id } },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, saved: false, user: buildUserResponse(user) });
  } catch (error) {
    next(error);
  }
};
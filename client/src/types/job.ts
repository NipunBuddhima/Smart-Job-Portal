export type JobStatus = 'draft' | 'published' | 'closed';
export type JobType = 'Remote' | 'On-site' | 'Hybrid';

export interface JobEmployer {
  id: string;
  name: string;
  avatar?: string;
  companyName?: string;
  companyLogo?: string;
}

export interface JobSalaryRange {
  min: number;
  max: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  jobType: JobType;
  salaryRange: JobSalaryRange;
  status: JobStatus;
  tags: string[];
  employer?: JobEmployer | string;
  isSaved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Job[];
}

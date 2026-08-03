import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/axios';
import { jobSchema, type JobFormValues } from '../../utils/jobValidations';
import type { Job } from '../../types/job';

type JobResponse = {
  success: boolean;
  data: Job;
};

const emptyValues: JobFormValues = {
  title: '',
  description: '',
  requirements: '',
  location: '',
  jobType: 'Remote',
  status: 'published',
  tagsText: '',
  salaryMin: 0,
  salaryMax: 0,
};

const fetchJob = async (jobId: string) => {
  const { data } = await api.get<JobResponse>(`/jobs/${jobId}`);
  return data.data;
};

export const CreateJob = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(jobId);
  const [formError, setFormError] = useState('');

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => fetchJob(jobId as string),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!job) {
      return;
    }

    reset({
      title: job.title,
      description: job.description,
      requirements: job.requirements.join(', '),
      location: job.location,
      jobType: job.jobType,
      status: job.status,
      tagsText: job.tags.join(', '),
      salaryMin: job.salaryRange.min,
      salaryMax: job.salaryRange.max,
    });
  }, [job, reset]);

  const onSubmit = async (data: JobFormValues) => {
    setFormError('');

    const payload = {
      title: data.title,
      description: data.description,
      requirements: data.requirements
        .split(',')
        .map((requirement) => requirement.trim())
        .filter(Boolean),
      location: data.location,
      jobType: data.jobType,
      status: data.status || 'published',
      tags: data.tagsText
        ? data.tagsText
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      salaryRange: {
        min: data.salaryMin,
        max: data.salaryMax,
      },
    };

    if (isEditing) {
      try {
        await api.put(`/jobs/${jobId}`, payload);
        navigate('/jobs');
      } catch {
        setFormError('Failed to update the job.');
      }
    } else {
      try {
        await api.post('/jobs', payload);
        navigate('/jobs');
      } catch {
        setFormError('Failed to create the job.');
      }
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        Loading job...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              {isEditing ? 'Edit job' : 'Create job'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {isEditing ? 'Update the posting' : 'Publish a new opening'}
            </h1>
          </div>
          <Link to="/jobs" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to jobs
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5">
          {formError && <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</div>}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-200">
              Job title
              <input
                {...register('title')}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                placeholder="Senior Frontend Engineer"
              />
              {errors.title && <span className="text-xs text-rose-300">{errors.title.message}</span>}
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Job type
              <select
                {...register('jobType')}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-200">
              Location
              <input
                {...register('location')}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                placeholder="Lagos, Nigeria"
              />
              {errors.location && <span className="text-xs text-rose-300">{errors.location.message}</span>}
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Status
              <select
                {...register('status')}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-200">
              Min salary
              <input
                type="number"
                {...register('salaryMin')}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                placeholder="50000"
              />
              {errors.salaryMin && <span className="text-xs text-rose-300">{errors.salaryMin.message}</span>}
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Max salary
              <input
                type="number"
                {...register('salaryMax')}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                placeholder="90000"
              />
              {errors.salaryMax && <span className="text-xs text-rose-300">{errors.salaryMax.message}</span>}
            </label>
          </div>

          <label className="grid gap-2 text-sm text-slate-200">
            Description
            <textarea
              {...register('description')}
              rows={6}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              placeholder="Describe the team, scope, and what success looks like."
            />
            {errors.description && <span className="text-xs text-rose-300">{errors.description.message}</span>}
          </label>

          <label className="grid gap-2 text-sm text-slate-200">
            Requirements
            <input
              {...register('requirements')}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              placeholder="3+ years React, TypeScript, REST APIs"
            />
            {errors.requirements && <span className="text-xs text-rose-300">{errors.requirements.message}</span>}
          </label>

          <label className="grid gap-2 text-sm text-slate-200">
            Tags
            <input
              {...register('tagsText')}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              placeholder="frontend, react, remote"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update job' : 'Create job'}
            </button>
            <span className="text-sm text-slate-400">You can switch between draft, published, and closed later.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
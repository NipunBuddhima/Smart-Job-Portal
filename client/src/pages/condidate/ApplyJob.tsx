import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { api } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { applySchema } from '../../utils/applicationValidations';
import type { ApplyFormValues } from '../../utils/applicationValidations';
import { useNavigate, useParams } from 'react-router-dom';

export const ApplyJob = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', jobId, 'apply'],
    queryFn: async () => (await api.get(`/jobs/${jobId}`)).data.data,
    enabled: Boolean(jobId),
  });

  const defaultUseProfileResume = Boolean(user?.resume);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { useProfileResume: defaultUseProfileResume },
  });

  useEffect(() => {
    reset({ useProfileResume: defaultUseProfileResume, coverLetter: '' });
  }, [defaultUseProfileResume, reset]);

  const useProfileResume = useWatch({ control, name: 'useProfileResume' });

  const onSubmit = async (data: ApplyFormValues) => {
    try {
      const formData = new FormData();
      formData.append('coverLetter', data.coverLetter);

      if (useProfileResume && user?.resume) {
        formData.append('profileResumeUrl', user.resume);
      } else if (file) {
        formData.append('resume', file); // Multer intercepts this
      } else {
        alert('Please provide a resume.');
        return;
      }

      await api.post(`/applications/apply/${jobId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      alert('Application submitted successfully!');
      navigate('/candidate/applied-jobs');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to apply');
        return;
      }

      alert('Failed to apply');
    }
  };

  if (isLoading) {
    return <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading job details...</div>;
  }

  if (isError || !job) {
    return <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-rose-400/30 bg-rose-500/10 p-8 text-rose-200">Failed to load the job.</div>;
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-slate-100 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Apply for role</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{job.title}</h2>
        <p className="mt-2 text-sm text-slate-300">
          {job.location} · {job.jobType} · ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-slate-400">{job.employer?.companyName || job.employer?.name || 'Employer'}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {user?.resume ? (
          <div className="flex items-center space-x-2">
            <input type="checkbox" {...register('useProfileResume')} id="useProfile" className="h-4 w-4 text-cyan-400" />
            <label htmlFor="useProfile" className="text-sm text-slate-200">Use the resume saved on my profile</label>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            No profile resume found. Upload a PDF below to submit your application.
          </div>
        )}

        {!useProfileResume && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="block text-sm font-medium text-slate-200">Upload tailored resume (PDF)</label>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-3 block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-medium file:text-slate-950 hover:file:bg-cyan-300"
            />
            {file && <p className="mt-2 text-xs text-slate-400">Selected: {file.name}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-200">Cover letter</label>
          <textarea
            {...register('coverLetter')}
            rows={8}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
            placeholder="Why are you a fit for this role?"
          />
          {errors.coverLetter && <p className="mt-2 text-sm text-rose-300">{errors.coverLetter.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';

type CandidateApplication = {
  _id: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  resumeUrl: string;
  createdAt: string;
  jobId?: {
    title?: string;
    employerId?: {
      name?: string;
      companyName?: string;
    };
  };
};

const normalizeResumeUrl = (url: string) =>
  url.replace('/raw/raw/upload/', '/raw/upload/').replace('/image/image/upload/', '/image/upload/');

const getResumeViewUrl = (url: string) => normalizeResumeUrl(url);
const getResumeDownloadUrl = (url: string) =>
  normalizeResumeUrl(url).replace('/raw/upload/', '/raw/upload/fl_attachment/');

export const AppliedJobs = () => {
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery<CandidateApplication[]>({
    queryKey: ['my-applications'],
    queryFn: async () => (await api.get('/applications/my-applications')).data.data,
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/applications/${id}/withdraw`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-applications'] }),
  });

  if (isLoading) return <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading applications...</div>;
  const applicationList = applications ?? [];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="mx-auto mt-6 max-w-5xl px-4 py-6 text-slate-100">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Candidate applications</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">My applications</h2>
        </div>
        <Link to="/jobs" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
          Browse jobs
        </Link>
      </div>

      <div className="space-y-4">
        {applicationList.map((app) => (
          <div key={app._id} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/20 md:flex md:items-center md:justify-between md:gap-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-white">{app.jobId?.title || 'Job application'}</h3>
                <p className="text-sm text-slate-400">
                  {app.jobId?.employerId?.companyName || app.jobId?.employerId?.name || 'Employer'}
                </p>
              </div>
              <p className="text-sm text-slate-400">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[app.status]}`}>
                {app.status.toUpperCase()}
              </span>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-0">
              <a href={getResumeViewUrl(app.resumeUrl)} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                View Submitted Resume
              </a>
              <a href={getResumeDownloadUrl(app.resumeUrl)} download="resume.pdf" target="_blank" rel="noreferrer" className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20">
                Download Resume
              </a>
              {app.status === 'pending' && (
                <button 
                  onClick={() => withdrawMutation.mutate(app._id)}
                  className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>
        ))}
        {applicationList.length === 0 && <p className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">You haven&apos;t applied to any jobs yet.</p>}
      </div>
    </div>
  );
};
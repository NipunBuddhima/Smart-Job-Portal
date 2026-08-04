import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';

export const EmployerDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['employer-dashboard'],
    queryFn: async () => (await api.get('/dashboard/employer')).data.data,
  });

  if (isLoading) {
    return <div className="mx-auto mt-8 max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading dashboard...</div>;
  }

  const stats = data.applicantStats ?? {};
  const totalApplicants = Object.values(stats).reduce((total: number, count: any) => total + Number(count ?? 0), 0);
  const recentApplicants = data.recentApplicants ?? [];
  const recentJobs = data.recentJobs ?? [];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Employer dashboard</p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-white">Hiring overview</h2>
              <p className="mt-2 text-slate-400">Posted jobs, applicants, and live research metrics for your team.</p>
            </div>
            <Link to="/jobs/new" className="rounded-xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300">
              Post a job
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Posted jobs</p>
            <p className="mt-3 text-3xl font-semibold text-white">{data.totalJobs ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Active jobs</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">{data.activeJobs ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Applicants</p>
            <p className="mt-3 text-3xl font-semibold text-white">{totalApplicants}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Shortlisted</p>
            <p className="mt-3 text-3xl font-semibold text-violet-300">{stats.shortlisted ?? 0}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Recent applicants</h3>
              <Link to="/jobs" className="text-sm text-cyan-300 hover:text-cyan-200">Manage jobs</Link>
            </div>

            <div className="space-y-3">
              {recentApplicants.length === 0 && <p className="text-slate-400">No candidates have applied yet.</p>}
              {recentApplicants.map((app: any) => (
                <div key={app._id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-white">{app.candidateId?.name ?? 'Unknown candidate'}</p>
                      <p className="text-sm text-slate-400">{app.jobId?.title ?? 'Role'} · {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Active jobs</h3>
              <span className="text-sm text-slate-400">Latest listings</span>
            </div>

            <div className="space-y-3">
              {recentJobs.length === 0 && <p className="text-slate-400">No jobs published recently.</p>}
              {recentJobs.map((job: any) => (
                <div key={job._id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{job.location} · {job.status}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
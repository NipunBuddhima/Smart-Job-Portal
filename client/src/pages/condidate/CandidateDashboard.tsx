import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';

export const CandidateDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['candidate-dashboard'],
    queryFn: async () => (await api.get('/dashboard/candidate')).data.data,
  });

  if (isLoading) {
    return <div className="mx-auto mt-8 max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading dashboard...</div>;
  }

  const recentApplications = data.recentApplications ?? [];
  const notifications = data.notifications ?? [];
  const savedJobs = data.savedJobs ?? [];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Candidate dashboard</p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-white">Your activity snapshot</h2>
              <p className="mt-2 text-slate-400">Applied jobs, saved opportunities, and notifications in one view.</p>
            </div>
            <Link to="/jobs" className="rounded-xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300">
              Browse jobs
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Profile completion</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-cyan-400" style={{ width: `${data.profileCompletion}%` }} />
            </div>
            <p className="mt-3 text-lg font-semibold text-white">{data.profileCompletion}% complete</p>
            {data.profileCompletion < 100 && (
              <Link to="/profile" className="mt-3 inline-block text-sm text-cyan-300 hover:text-cyan-200">Finish your profile</Link>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Applied jobs</p>
            <p className="mt-3 text-3xl font-semibold text-white">{data.totalApplied ?? 0}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Saved jobs</p>
            <p className="mt-3 text-3xl font-semibold text-white">{savedJobs.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Notifications</p>
            <p className="mt-3 text-3xl font-semibold text-white">{notifications.length}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Recent applications</h3>
              <Link to="/candidate/applied-jobs" className="text-sm text-cyan-300 hover:text-cyan-200">View all</Link>
            </div>

            <div className="space-y-3">
              {recentApplications.length === 0 && <p className="text-slate-400">No recent applications yet.</p>}
              {recentApplications.map((application: any) => (
                <div key={application._id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{application.jobId?.title ?? 'Untitled role'}</p>
                      <p className="text-sm text-slate-400">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Notifications</h3>
              <span className="text-sm text-slate-400">Latest updates</span>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 && <p className="text-slate-400">You are all caught up.</p>}
              {notifications.map((notification: any) => (
                <div key={notification._id} className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-cyan-50">
                  {notification.message}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Saved jobs</h3>
            <Link to="/jobs" className="text-sm text-cyan-300 hover:text-cyan-200">Open job feed</Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedJobs.length === 0 && <p className="text-slate-400">No saved jobs yet.</p>}
            {savedJobs.map((job: any) => (
              <div key={job._id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="font-medium text-white">{job.title}</p>
                <p className="mt-1 text-sm text-slate-400">{job.location}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
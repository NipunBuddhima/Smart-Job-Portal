import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/axios';

export const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/dashboard/admin')).data.data,
  });

  if (isLoading) {
    return <div className="mx-auto mt-8 max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading system report...</div>;
  }

  const users = data.users ?? { total: 0, employers: 0, candidates: 0 };
  const recentCompanies = data.recentCompanies ?? [];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Admin dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Platform control center</h2>
          <p className="mt-2 text-slate-400">System-wide visibility across users, companies, jobs, and reports.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Users</p>
            <p className="mt-3 text-3xl font-semibold text-white">{users.total ?? 0}</p>
            <p className="mt-2 text-sm text-slate-400">Candidates: {users.candidates ?? 0} · Employers: {users.employers ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Companies</p>
            <p className="mt-3 text-3xl font-semibold text-white">{data.companies ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Jobs</p>
            <p className="mt-3 text-3xl font-semibold text-white">{data.jobs ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Applications</p>
            <p className="mt-3 text-3xl font-semibold text-white">{data.applications ?? 0}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold text-white">Reports snapshot</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-400">Published jobs</p>
                <p className="mt-2 text-2xl font-semibold text-white">{data.reports?.publishedJobs ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-400">Pending applications</p>
                <p className="mt-2 text-2xl font-semibold text-white">{data.reports?.pendingApplications ?? 0}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold text-white">Recent companies</h3>
            <div className="mt-4 space-y-3">
              {recentCompanies.length === 0 && <p className="text-slate-400">No employer companies have been added yet.</p>}
              {recentCompanies.map((company: any) => (
                <div key={company._id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="font-medium text-white">{company.companyName || company.name}</p>
                  <p className="text-sm text-slate-400">{company.email}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
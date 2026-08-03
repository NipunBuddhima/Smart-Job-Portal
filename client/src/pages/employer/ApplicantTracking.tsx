import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../../api/axios';

type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';

type ApplicantRow = {
  _id: string;
  status: ApplicationStatus;
  resumeUrl: string;
  coverLetter: string;
  createdAt: string;
  candidateId: {
    name: string;
    email: string;
  };
};

export const ApplicantTracking = () => {
  const { jobId } = useParams();
  const queryClient = useQueryClient();

  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => (await api.get(`/jobs/${jobId}`)).data.data,
    enabled: Boolean(jobId),
  });

  const { data: applicants, isLoading } = useQuery<ApplicantRow[]>({
    queryKey: ['job-applicants', jobId],
    queryFn: async () => (await api.get(`/applications/job/${jobId}`)).data.data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      api.patch(`/applications/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] }),
  });

  if (isLoading) return <div className="mx-auto mt-10 max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading applicants...</div>;
  const applicantList = applicants ?? [];

  const statusColors: Record<ApplicationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="mx-auto mt-6 max-w-6xl px-4 py-6 text-slate-100">
      <div className="mb-6 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Employer applicant tracking</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{job?.title || 'Applicant tracking'}</h2>
        <p className="mt-2 text-sm text-slate-400">Review candidates and move them through pending, reviewed, shortlisted, accepted, or rejected.</p>
      </div>
      
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 shadow-xl shadow-black/20">
        <table className="w-full text-left">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-4 text-sm font-medium text-slate-300">Candidate</th>
              <th className="p-4 text-sm font-medium text-slate-300">Applied Date</th>
              <th className="p-4 text-sm font-medium text-slate-300">Resume / Cover Letter</th>
              <th className="p-4 text-sm font-medium text-slate-300">Status</th>
              <th className="p-4 text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicantList.map((app) => (
              <tr key={app._id} className="border-b border-white/10">
                <td className="p-4">
                  <div className="font-medium text-white">{app.candidateId.name}</div>
                  <div className="text-sm text-slate-400">{app.candidateId.email}</div>
                </td>
                <td className="p-4 text-slate-300">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="block text-cyan-300 hover:underline">Resume PDF</a>
                  <button onClick={() => alert(app.coverLetter)} className="mt-2 text-xs text-slate-400 underline">Read cover letter</button>
                </td>
                <td className="p-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[app.status as ApplicationStatus]}`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'reviewed' })}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
                    >
                      Review
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'shortlisted' })}
                      className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-100 transition hover:bg-purple-500/20"
                    >
                      Shortlist
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'accepted' })}
                      className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-500/20"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ id: app._id, status: 'rejected' })}
                      className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-100 transition hover:bg-rose-500/20"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applicantList.length === 0 && <p className="p-6 text-center text-slate-300">No applicants yet.</p>}
      </div>
    </div>
  );
};
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../api/axios';
import type { Job, JobListResponse } from '../../types/job';

type JobFilters = {
  search: string;
  jobType: string;
  status: string;
  sort: string;
  page: number;
};

const fetchJobs = async (filters: JobFilters) => {
  const { data } = await api.get<JobListResponse>('/jobs', {
    params: {
      mine: true,
      search: filters.search || undefined,
      jobType: filters.jobType || undefined,
      status: filters.status || undefined,
      sort: filters.sort || undefined,
      page: filters.page,
      limit: 8,
    },
  });

  return data;
};

export const JobManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    jobType: '',
    status: '',
    sort: 'newest',
    page: 1,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', 'mine', filters],
    queryFn: () => fetchJobs(filters),
    placeholderData: keepPreviousData,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ jobId, nextStatus }: { jobId: string; nextStatus: 'draft' | 'closed' }) => {
      const endpoint = nextStatus === 'closed' ? `/jobs/${jobId}/close` : `/jobs/${jobId}/draft`;
      const { data } = await api.patch(endpoint);
      return data as { success: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.delete(`/jobs/${jobId}`);
      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const jobs = data?.data ?? [];

  const handleDelete = async (job: Job) => {
    const confirmed = window.confirm(`Delete ${job.title}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(job.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Employer tools</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Manage your jobs</h1>
              <p className="mt-2 text-sm text-slate-400">Create drafts, publish openings, close roles, and keep the list tidy.</p>
            </div>
            <Link
              to="/jobs/new"
              className="inline-flex rounded-xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              New job
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value, page: 1 }))}
              placeholder="Search jobs"
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
            />
            <select
              value={filters.jobType}
              onChange={(event) => setFilters((previous) => ({ ...previous, jobType: event.target.value, page: 1 }))}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">All types</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <select
              value={filters.status}
              onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value, page: 1 }))}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filters.sort}
              onChange={(event) => setFilters((previous) => ({ ...previous, sort: event.target.value, page: 1 }))}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="salaryAsc">Salary: low to high</option>
              <option value="salaryDesc">Salary: high to low</option>
            </select>
          </div>
        </section>

        {isLoading && <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading jobs...</div>}
        {isError && <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-8 text-rose-200">Failed to load jobs.</div>}

        <div className="space-y-4">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                    <span>{job.jobType}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 capitalize text-slate-200">
                      {job.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">{job.title}</h2>
                  <p className="max-w-3xl text-sm leading-6 text-slate-300">{job.description}</p>
                </div>

                <div className="shrink-0 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Salary</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${job.id}/edit`)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Edit
                </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
                  >
                    View applicants
                  </button>

                {job.status === 'closed' ? (
                  <button
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => updateStatusMutation.mutate({ jobId: job.id, nextStatus: 'draft' })}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-400/15 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Move to draft
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => updateStatusMutation.mutate({ jobId: job.id, nextStatus: 'closed' })}
                    className="rounded-xl border border-amber-400/30 bg-amber-400/15 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Close job
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(job)}
                  disabled={deleteMutation.isPending}
                  className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {!isLoading && !jobs.length && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">
              You have not created any jobs yet.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-sm text-slate-300">
          <button
            type="button"
            disabled={filters.page === 1}
            onClick={() => setFilters((previous) => ({ ...previous, page: previous.page - 1 }))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {data?.page ?? 1} of {data?.totalPages ?? 1}
          </span>
          <button
            type="button"
            disabled={(data?.totalPages ?? 1) <= filters.page}
            onClick={() => setFilters((previous) => ({ ...previous, page: previous.page + 1 }))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
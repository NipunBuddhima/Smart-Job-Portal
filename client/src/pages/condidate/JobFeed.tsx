import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import type { Job, JobListResponse } from '../../types/job';

type JobFilters = {
  search: string;
  jobType: string;
  location: string;
  sort: string;
  page: number;
  savedOnly: boolean;
};

const fetchJobs = async (filters: JobFilters) => {
  const { data } = await api.get<JobListResponse>('/jobs', {
    params: {
      search: filters.search || undefined,
      jobType: filters.jobType || undefined,
      location: filters.location || undefined,
      sort: filters.sort || undefined,
      page: filters.page,
      limit: 8,
    },
  });

  return data;
};

export const JobFeed = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    jobType: '',
    location: '',
    sort: 'newest',
    page: 1,
    savedOnly: false,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', 'feed', filters],
    queryFn: () => fetchJobs(filters),
    placeholderData: keepPreviousData,
  });

  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => (await api.get('/applications/my-applications')).data.data,
  });

  const savedJobIds = useMemo(() => new Set(user?.savedJobs ?? []), [user?.savedJobs]);
  const appliedJobIds = useMemo(() => new Set((applications ?? []).map((application: any) => application.jobId?.id || application.jobId?._id)), [applications]);

  const saveMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.post(`/jobs/${jobId}/save`);
      return data.user as typeof user;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.delete(`/jobs/${jobId}/save`);
      return data.user as typeof user;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const visibleJobs = useMemo(() => {
    const jobs = data?.data ?? [];
    return filters.savedOnly ? jobs.filter((job) => savedJobIds.has(job.id)) : jobs;
  }, [data?.data, filters.savedOnly, savedJobIds]);

  const toggleSaved = (job: Job) => {
    const isSaved = savedJobIds.has(job.id) || job.isSaved;

    if (isSaved) {
      unsaveMutation.mutate(job.id);
      return;
    }

    saveMutation.mutate(job.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:sticky lg:top-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Job feed</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Find work that fits</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Search, filter, sort, and save openings as you browse.
          </p>

          <div className="mt-8 space-y-4">
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value, page: 1 }))}
              placeholder="Search title, description, or tags"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
            />

            <input
              type="text"
              value={filters.location}
              onChange={(event) => setFilters((previous) => ({ ...previous, location: event.target.value, page: 1 }))}
              placeholder="Location"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
            />

            <select
              value={filters.jobType}
              onChange={(event) => setFilters((previous) => ({ ...previous, jobType: event.target.value, page: 1 }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
            >
              <option value="">All types</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <select
              value={filters.sort}
              onChange={(event) => setFilters((previous) => ({ ...previous, sort: event.target.value, page: 1 }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="salaryAsc">Salary: low to high</option>
              <option value="salaryDesc">Salary: high to low</option>
            </select>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={filters.savedOnly}
                onChange={(event) => setFilters((previous) => ({ ...previous, savedOnly: event.target.checked, page: 1 }))}
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-400/30"
              />
              Saved jobs only
            </label>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-indigo-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-cyan-200">Candidate dashboard</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Browse live opportunities</h2>
              </div>
              <div className="text-sm text-slate-300">
                {data?.total ?? 0} results · {user?.savedJobs?.length ?? 0} saved
              </div>
            </div>
          </div>

          {isLoading && <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading jobs...</div>}
          {isError && <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-8 text-rose-200">Failed to load jobs.</div>}

          <div className="space-y-4">
            {visibleJobs.map((job) => {
              const isSaved = savedJobIds.has(job.id) || job.isSaved;

              return (
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
                      <h3 className="text-2xl font-semibold text-white">{job.title}</h3>
                      <p className="max-w-3xl text-sm leading-6 text-slate-300">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.slice(0, 4).map((requirement) => (
                          <span key={requirement} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                            {requirement}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Salary</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                          to={`/jobs/${job.id}/apply`}
                          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                            appliedJobIds.has(job.id)
                              ? 'pointer-events-none border border-emerald-400/30 bg-emerald-400/15 text-emerald-100'
                              : 'border border-cyan-400/30 bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                          }`}
                        >
                          {appliedJobIds.has(job.id) ? 'Applied' : 'Apply now'}
                        </Link>

                    <button
                      type="button"
                      onClick={() => toggleSaved(job)}
                      disabled={saveMutation.isPending || unsaveMutation.isPending}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isSaved
                          ? 'border border-cyan-400/30 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/20'
                          : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {isSaved ? 'Saved' : 'Save job'}
                    </button>

                    <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      {job.employer && typeof job.employer === 'object' ? job.employer.companyName || job.employer.name : 'Employer'}
                    </span>
                  </div>
                </article>
              );
            })}

            {!isLoading && !visibleJobs.length && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">
                No jobs match your current filters.
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
        </main>
      </div>
    </div>
  );
};
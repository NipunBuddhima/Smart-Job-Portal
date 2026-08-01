import { Link } from 'react-router-dom';

export const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.25em] text-rose-300">Access denied</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">You are not allowed here</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The current account does not have permission for this page.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};
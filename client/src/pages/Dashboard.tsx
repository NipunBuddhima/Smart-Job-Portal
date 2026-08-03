import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Protected area</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
            <p className="mt-2 text-slate-400">You are authenticated with the backend session cookie.</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Sign out
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/jobs"
            className="rounded-xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
          >
            Open jobs
          </Link>
          {user?.role === 'candidate' && (
            <Link
              to="/candidate/applied-jobs"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
            >
              My applications
            </Link>
          )}
          {user?.role === 'employer' && (
            <Link
              to="/jobs/new"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Post a job
            </Link>
          )}
          <Link
            to="/profile"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Edit profile
          </Link>
          <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            {user?.role === 'employer' ? 'Employer profile' : 'Candidate profile'}
          </span>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Name</p>
            <p className="mt-2 text-lg font-medium text-white">{user?.name}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Email</p>
            <p className="mt-2 text-lg font-medium text-white">{user?.email}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Role</p>
            <p className="mt-2 text-lg font-medium text-white capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Skills</p>
            <p className="mt-2 text-lg font-medium text-white">
              {user?.skills?.length ? user.skills.join(', ') : 'No skills added yet'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Profile assets</p>
            <p className="mt-2 text-lg font-medium text-white">
              {user?.role === 'employer'
                ? user?.companyLogo
                  ? 'Company logo uploaded'
                  : 'Company logo missing'
                : user?.avatar
                  ? 'Profile photo uploaded'
                  : 'Profile photo missing'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
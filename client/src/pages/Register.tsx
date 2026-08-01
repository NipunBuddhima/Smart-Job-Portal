import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../utils/validations';
import type { RegisterFormValues } from '../utils/validations';

export const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'candidate',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await api.post('/auth/register', data);
      setUser(response.data.user);
      navigate('/dashboard');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setError('root', {
        message: axiosError.response?.data?.message || 'Registration failed. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 shadow-xl shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">Create account</h2>
            <p className="mt-2 text-sm text-slate-400">Register as a candidate or employer.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-200">Full name</label>
                <input
                  {...register('name')}
                  type="text"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Jane Doe"
                />
                {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="name@example.com"
                />
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="At least 6 characters"
                />
                {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">Account type</label>
                <select
                  {...register('role')}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option value="candidate" className="bg-slate-900">Candidate</option>
                  <option value="employer" className="bg-slate-900">Employer</option>
                </select>
                {errors.role && <p className="mt-2 text-sm text-red-400">{errors.role.message}</p>}
              </div>

              {errors.root && <p className="text-sm text-red-400 text-center">{errors.root.message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
                Sign in
              </Link>
            </p>
          </section>

          <section className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-cyan-500/15 p-8 ring-1 ring-white/10">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-1 text-sm font-medium text-fuchsia-200">
                Start here
              </p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                Build your profile and unlock protected access.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
                Registration sets an HTTP-only session cookie so the frontend can stay logged in across refreshes.
              </p>
            </div>

            <div className="mt-10 grid gap-4 text-sm text-slate-200 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">Secure signup</div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">Cookie session</div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">Role selection</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
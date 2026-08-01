import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validations';
import type { LoginFormValues } from '../utils/validations';

export const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post('/auth/login', data);
      setUser(response.data.user);
      navigate('/dashboard'); // Redirect on success
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setError('root', { 
        message: axiosError.response?.data?.message || 'Login failed. Please try again.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <section className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-cyan-400/15 via-sky-400/10 to-indigo-500/15 p-8 ring-1 ring-white/10">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-1 text-sm font-medium text-cyan-200">
                Job Portal Access
              </p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                Sign in to manage applications, jobs, and hiring flows.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
                Use your account to access the protected dashboard. New here? Create an account in a minute.
              </p>
            </div>

            <div className="mt-10 grid gap-4 text-sm text-slate-200 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">Secure sessions</div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">HTTP-only cookies</div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">Role-based access</div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 shadow-xl shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Sign in with your email and password.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
                  placeholder="Your password"
                />
                {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
              </div>

              {errors.root && <p className="text-sm text-red-400 text-center">{errors.root.message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              New to the portal?{' '}
              <Link to="/register" className="font-medium text-cyan-300 hover:text-cyan-200">
                Create an account
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
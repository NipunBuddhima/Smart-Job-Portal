import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { employerProfileSchema, type EmployerProfileFormValues } from '../utils/profileValidations';

export const EmployerProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmployerProfileFormValues>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      companyName: user?.companyName || '',
      companyDescription: user?.companyDescription || '',
      website: user?.website || '',
    },
  });

  useEffect(() => {
    reset({
      companyName: user?.companyName || '',
      companyDescription: user?.companyDescription || '',
      website: user?.website || '',
    });
  }, [reset, user]);

  const companyLogoUrl = user?.companyLogo || '';

  const handleCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('companyLogo', file);

    try {
      setUploadingLogo(true);
      const { data } = await api.post('/users/company-logo', formData);
      if (data.user) {
        setUser(data.user);
      }
      setError('root', { message: '' });
      e.target.value = '';
    } catch {
      setError('root', { message: 'Failed to upload company logo' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSubmit = async (data: EmployerProfileFormValues) => {
    try {
      const { data: response } = await api.put('/users/profile', data);
      if (response.user) {
        setUser(response.user);
      }
      setError('root', { message: '' });
      navigate('/dashboard');
    } catch {
      setError('root', { message: 'Failed to update company profile' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Employer profile</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Company branding and overview</h2>
          </div>
          <p className="text-sm text-slate-400">Show candidates who you are and what you do.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h3 className="text-xl font-semibold text-white">Company logo</h3>
            <label className="mt-6 block rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="mb-2 block text-sm font-medium text-slate-200">Upload logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCompanyLogoUpload}
                disabled={uploadingLogo}
                className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-medium file:text-slate-950 hover:file:bg-cyan-300"
              />
              <p className="mt-2 text-xs text-slate-400">PNG or JPG under 2MB.</p>
              {uploadingLogo && <p className="mt-2 text-sm text-cyan-300">Uploading logo...</p>}
              {companyLogoUrl && (
                <img
                  src={companyLogoUrl}
                  alt="Company logo preview"
                  className="mt-4 h-24 w-24 rounded-2xl object-cover ring-1 ring-white/10"
                />
              )}
            </label>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-200">Company name</label>
                <input
                  {...register('companyName')}
                  placeholder="Northwind Labs"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                />
                {errors.companyName && <p className="mt-2 text-sm text-rose-300">{errors.companyName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">Company description</label>
                <textarea
                  {...register('companyDescription')}
                  rows={6}
                  placeholder="Tell candidates about your mission, team, and hiring culture."
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                />
                {errors.companyDescription && (
                  <p className="mt-2 text-sm text-rose-300">{errors.companyDescription.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">Website</label>
                <input
                  {...register('website')}
                  placeholder="https://example.com"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                />
                {errors.website && <p className="mt-2 text-sm text-rose-300">{errors.website.message}</p>}
              </div>

              {errors.root?.message && <p className="text-sm text-rose-300">{errors.root.message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Saving company profile...' : 'Save company profile'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};
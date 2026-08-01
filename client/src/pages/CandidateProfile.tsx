import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { candidateProfileSchema, type CandidateProfileFormValues } from '../utils/profileValidations';

const emptyEducation = () => ({
  institution: '',
  degree: '',
  startDate: '',
  endDate: '',
  description: '',
});

const emptyExperience = () => ({
  company: '',
  title: '',
  startDate: '',
  endDate: '',
  description: '',
});

export const CandidateProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CandidateProfileFormValues>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      skillsText: user?.skills?.join(', ') || '',
      education: user?.education?.length
        ? user.education.map((entry) => ({
            institution: entry.institution,
            degree: entry.degree,
            startDate: entry.startDate,
            endDate: entry.endDate || '',
            description: entry.description || '',
          }))
        : [emptyEducation()],
      experience: user?.experience?.length
        ? user.experience.map((entry) => ({
            company: entry.company,
            title: entry.title,
            startDate: entry.startDate,
            endDate: entry.endDate || '',
            description: entry.description || '',
          }))
        : [emptyExperience()],
      socialLinks: {
        linkedin: user?.socialLinks?.linkedin || '',
        github: user?.socialLinks?.github || '',
        portfolio: user?.socialLinks?.portfolio || '',
      },
    }
  });

  const educationFieldArray = useFieldArray({ control, name: 'education' });
  const experienceFieldArray = useFieldArray({ control, name: 'experience' });

  useEffect(() => {
    reset({
      skillsText: user?.skills?.join(', ') || '',
      education: user?.education?.length
        ? user.education.map((entry) => ({
            institution: entry.institution,
            degree: entry.degree,
            startDate: entry.startDate,
            endDate: entry.endDate || '',
            description: entry.description || '',
          }))
        : [emptyEducation()],
      experience: user?.experience?.length
        ? user.experience.map((entry) => ({
            company: entry.company,
            title: entry.title,
            startDate: entry.startDate,
            endDate: entry.endDate || '',
            description: entry.description || '',
          }))
        : [emptyExperience()],
      socialLinks: {
        linkedin: user?.socialLinks?.linkedin || '',
        github: user?.socialLinks?.github || '',
        portfolio: user?.socialLinks?.portfolio || '',
      },
    });
  }, [reset, user]);

  const avatarUrl = user?.avatar || '';
  const resumeUrl = user?.resume || '';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      const { data } = await api.post('/users/avatar', formData);
      if (data.user) {
        setUser(data.user);
      }
      setError('root', { message: '' });
      e.target.value = '';
    } catch {
      setError('root', { message: 'Failed to upload profile picture' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadingResume(true);
      const { data } = await api.post('/users/resume', formData);
      if (data.user) {
        setUser(data.user);
      }
      setError('root', { message: '' });
      e.target.value = '';
    } catch {
      setError('root', { message: 'Failed to upload resume' });
    } finally {
      setUploadingResume(false);
    }
  };

  // Handle standard JSON profile update
  const onSubmit = async (data: CandidateProfileFormValues) => {
    const skills = data.skillsText
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!skills.length) {
      setError('skillsText', { message: 'Add at least one skill' });
      return;
    }

    const payload = {
      skills,
      education: data.education,
      experience: data.experience,
      socialLinks: data.socialLinks,
    };

    try {
      const { data: response } = await api.put('/users/profile', payload);
      if (response.user) {
        setUser(response.user);
      }
      setError('root', { message: '' });
      navigate('/dashboard');
    } catch {
      setError('root', { message: 'Failed to update profile details' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Candidate profile</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Profile picture, resume, and career details</h2>
          </div>
          <p className="text-sm text-slate-400">Keep your profile current for recruiters.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h3 className="text-xl font-semibold text-white">Profile assets</h3>

            <div className="mt-6 space-y-6">
              <label className="block rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="mb-2 block text-sm font-medium text-slate-200">Profile picture</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-medium file:text-slate-950 hover:file:bg-cyan-300"
                />
                <p className="mt-2 text-xs text-slate-400">PNG or JPG under 2MB.</p>
                {uploadingAvatar && <p className="mt-2 text-sm text-cyan-300">Uploading picture...</p>}
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="Profile preview"
                    className="mt-4 h-24 w-24 rounded-2xl object-cover ring-1 ring-white/10"
                  />
                )}
              </label>

              <label className="block rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="mb-2 block text-sm font-medium text-slate-200">Resume (PDF)</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-medium file:text-slate-950 hover:file:bg-cyan-300"
                />
                <p className="mt-2 text-xs text-slate-400">PDF only, up to 5MB.</p>
                {uploadingResume && <p className="mt-2 text-sm text-cyan-300">Uploading resume...</p>}
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    View resume
                  </a>
                )}
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-slate-200">Skills</label>
                <input
                  {...register('skillsText')}
                  placeholder="React, Node.js, TypeScript"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                />
                {errors.skillsText && <p className="mt-2 text-sm text-rose-300">{errors.skillsText.message}</p>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Education</h3>
                    <p className="text-sm text-slate-400">Add each completed or current program.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => educationFieldArray.append(emptyEducation())}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Add education
                  </button>
                </div>

                {educationFieldArray.fields.map((field, index) => (
                  <div key={field.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm text-slate-300">Institution</label>
                        <input
                          {...register(`education.${index}.institution` as const)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                        />
                        {errors.education?.[index]?.institution && (
                          <p className="mt-2 text-sm text-rose-300">{errors.education[index]?.institution?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300">Degree</label>
                        <input
                          {...register(`education.${index}.degree` as const)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                        />
                        {errors.education?.[index]?.degree && (
                          <p className="mt-2 text-sm text-rose-300">{errors.education[index]?.degree?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300">Start date</label>
                        <input
                          type="date"
                          {...register(`education.${index}.startDate` as const)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                        />
                        {errors.education?.[index]?.startDate && (
                          <p className="mt-2 text-sm text-rose-300">{errors.education[index]?.startDate?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300">End date</label>
                        <input
                          type="date"
                          {...register(`education.${index}.endDate` as const)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm text-slate-300">Description</label>
                      <textarea
                        {...register(`education.${index}.description` as const)}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                      />
                    </div>

                    {educationFieldArray.fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => educationFieldArray.remove(index)}
                        className="mt-4 text-sm font-medium text-rose-300 transition hover:text-rose-200"
                      >
                        Remove education
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Experience</h3>
                    <p className="text-sm text-slate-400">Include your most relevant roles.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => experienceFieldArray.append(emptyExperience())}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Add experience
                  </button>
                </div>

                {experienceFieldArray.fields.map((field, index) => (
                  <div key={field.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm text-slate-300">Company</label>
                        <input
                          {...register(`experience.${index}.company` as const)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                        />
                        {errors.experience?.[index]?.company && (
                          <p className="mt-2 text-sm text-rose-300">{errors.experience[index]?.company?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300">Title</label>
                        <input
                          {...register(`experience.${index}.title` as const)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                        />
                        {errors.experience?.[index]?.title && (
                          <p className="mt-2 text-sm text-rose-300">{errors.experience[index]?.title?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300">Start date</label>
                        <input
                          type="date"
                          {...register(`experience.${index}.startDate` as const)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                        />
                        {errors.experience?.[index]?.startDate && (
                          <p className="mt-2 text-sm text-rose-300">{errors.experience[index]?.startDate?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300">End date</label>
                        <input
                          type="date"
                          {...register(`experience.${index}.endDate` as const)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm text-slate-300">Description</label>
                      <textarea
                        {...register(`experience.${index}.description` as const)}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400/60"
                      />
                    </div>

                    {experienceFieldArray.fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => experienceFieldArray.remove(index)}
                        className="mt-4 text-sm font-medium text-rose-300 transition hover:text-rose-200"
                      >
                        Remove experience
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Social links</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm text-slate-300">LinkedIn</label>
                    <input
                      {...register('socialLinks.linkedin')}
                      placeholder="https://linkedin.com/in/your-name"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
                    />
                    {errors.socialLinks?.linkedin && (
                      <p className="mt-2 text-sm text-rose-300">{errors.socialLinks.linkedin.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300">GitHub</label>
                    <input
                      {...register('socialLinks.github')}
                      placeholder="https://github.com/your-name"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
                    />
                    {errors.socialLinks?.github && (
                      <p className="mt-2 text-sm text-rose-300">{errors.socialLinks.github.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300">Portfolio</label>
                    <input
                      {...register('socialLinks.portfolio')}
                      placeholder="https://your-portfolio.com"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
                    />
                    {errors.socialLinks?.portfolio && (
                      <p className="mt-2 text-sm text-rose-300">{errors.socialLinks.portfolio.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {errors.root?.message && <p className="text-sm text-rose-300">{errors.root.message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Saving profile...' : 'Save profile'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};
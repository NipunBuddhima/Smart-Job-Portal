import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IEducationEntry {
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface IExperienceEntry {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'candidate' | 'employer' | 'admin';
  avatar?: string;
  resume?: string;
  resumeName?: string;
  skills?: string[];
  education?: IEducationEntry[];
  experience?: IExperienceEntry[];
  socialLinks?: ISocialLinks;
  savedJobs?: mongoose.Types.ObjectId[];
  companyName?: string;
  companyDescription?: string;
  website?: string;
  companyLogo?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const educationSchema = new Schema<IEducationEntry>(
  {
    institution: { type: String, trim: true, default: '' },
    degree: { type: String, trim: true, default: '' },
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const experienceSchema = new Schema<IExperienceEntry>(
  {
    company: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const socialLinksSchema = new Schema<ISocialLinks>(
  {
    linkedin: { type: String, trim: true, default: '' },
    github: { type: String, trim: true, default: '' },
    portfolio: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['candidate', 'employer', 'admin'],
      default: 'candidate',
    },
    avatar: { type: String, default: '' },
    resume: { type: String, default: '' },
    resumeName: { type: String, default: '' },
    skills: [{ type: String, trim: true }],
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    savedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    companyName: { type: String, trim: true, default: '' },
    companyDescription: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    companyLogo: { type: String, default: '' },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
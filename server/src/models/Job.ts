import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  employerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  jobType: 'Remote' | 'On-site' | 'Hybrid';
  salaryRange: { min: number; max: number };
  status: 'draft' | 'published' | 'closed';
  tags: string[];
}

const jobSchema = new Schema<IJob>(
  {
    employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    location: { type: String, required: true },
    jobType: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], required: true },
    salaryRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Text index for search functionality
jobSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IJob>('Job', jobSchema);
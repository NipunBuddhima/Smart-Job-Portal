import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  resumeUrl: string;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true }, // Snapshot of the resume used for this specific app
    coverLetter: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent a candidate from applying to the same job twice
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', applicationSchema);
import mongoose, { Document } from 'mongoose';
export interface IApplication extends Document {
    jobId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    resumeUrl: string;
    coverLetter: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
}
declare const _default: mongoose.Model<IApplication, {}, {}, {}, mongoose.Document<unknown, {}, IApplication, {}, {}> & IApplication & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Application.d.ts.map
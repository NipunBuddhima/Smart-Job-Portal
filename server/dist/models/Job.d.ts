import mongoose, { Document } from 'mongoose';
export interface IJob extends Document {
    employerId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    requirements: string[];
    location: string;
    jobType: 'Remote' | 'On-site' | 'Hybrid';
    salaryRange: {
        min: number;
        max: number;
    };
    status: 'draft' | 'published' | 'closed';
    tags: string[];
}
declare const _default: mongoose.Model<IJob, {}, {}, {}, mongoose.Document<unknown, {}, IJob, {}, {}> & IJob & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Job.d.ts.map
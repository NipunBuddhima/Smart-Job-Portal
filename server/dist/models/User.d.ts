import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map
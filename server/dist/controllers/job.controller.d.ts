import { Request, Response, NextFunction } from 'express';
export declare const createJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getJobs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getJobById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const closeJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const draftJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const saveJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const unsaveJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=job.controller.d.ts.map
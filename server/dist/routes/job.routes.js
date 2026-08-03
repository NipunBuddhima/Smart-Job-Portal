"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = require("../controllers/job.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public / Candidate view
router.get('/', auth_middleware_1.attachOptionalUser, job_controller_1.getJobs);
router.get('/:id', auth_middleware_1.attachOptionalUser, job_controller_1.getJobById);
// Protected Employer views
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('employer', 'admin'), job_controller_1.createJob);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('employer', 'admin'), job_controller_1.updateJob);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('employer', 'admin'), job_controller_1.deleteJob);
router.patch('/:id/close', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('employer', 'admin'), job_controller_1.closeJob);
router.patch('/:id/draft', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('employer', 'admin'), job_controller_1.draftJob);
router.post('/:id/save', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('candidate'), job_controller_1.saveJob);
router.delete('/:id/save', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('candidate'), job_controller_1.unsaveJob);
exports.default = router;
//# sourceMappingURL=job.routes.js.map
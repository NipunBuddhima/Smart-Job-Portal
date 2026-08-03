"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const application_controller_1 = require("../controllers/application.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
// Candidate Routes
router.post('/apply/:jobId', (0, auth_middleware_1.authorize)('candidate'), upload_middleware_1.uploadResume.single('resume'), application_controller_1.applyForJob);
router.get('/my-applications', (0, auth_middleware_1.authorize)('candidate'), application_controller_1.getCandidateApplications);
router.delete('/:id/withdraw', (0, auth_middleware_1.authorize)('candidate'), application_controller_1.withdrawApplication);
// Employer Routes
router.get('/job/:jobId', (0, auth_middleware_1.authorize)('employer', 'admin'), application_controller_1.getJobApplicants);
router.patch('/:id/status', (0, auth_middleware_1.authorize)('employer', 'admin'), application_controller_1.updateApplicationStatus);
exports.default = router;
//# sourceMappingURL=application.routes.js.map
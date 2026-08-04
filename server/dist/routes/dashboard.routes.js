"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.get('/candidate', (0, auth_middleware_1.authorize)('candidate'), dashboard_controller_1.getCandidateDashboard);
router.get('/employer', (0, auth_middleware_1.authorize)('employer'), dashboard_controller_1.getEmployerDashboard);
router.get('/admin', (0, auth_middleware_1.authorize)('admin'), dashboard_controller_1.getAdminDashboard);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map
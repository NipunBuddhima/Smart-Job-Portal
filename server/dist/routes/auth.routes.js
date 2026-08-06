"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/logout', auth_controller_1.logout);
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.put('/reset-password/:token', auth_controller_1.resetPassword);
// Protected route example
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
// Role-based route example (Admin only)
router.get('/admin-stats', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (req, res) => {
    res.json({ success: true, data: 'Admin data accessed' });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect); // All user routes require authentication
router.put('/profile', user_controller_1.updateProfile);
router.post('/avatar', upload_middleware_1.uploadAvatar.single('avatar'), user_controller_1.uploadUserAvatar);
router.post('/resume', upload_middleware_1.uploadResume.single('resume'), user_controller_1.uploadUserResume);
router.post('/company-logo', upload_middleware_1.uploadAvatar.single('companyLogo'), user_controller_1.uploadCompanyLogo);
exports.default = router;
//# sourceMappingURL=user.routes.js.map
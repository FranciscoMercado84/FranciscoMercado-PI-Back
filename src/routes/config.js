/**
 * Configuración Routes
 */

import { Router } from 'express';
import * as configController from '../controllers/configController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/adminMiddleware.js';

const router = Router();

// GET configuración (público)
router.get('/', configController.getConfiguration);

// PUT configuración (admin only)
router.put('/', protect, restrictTo('admin'), configController.updateConfiguration);

export default router;

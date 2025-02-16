import express from 'express';
import * as commonController from '../controllers/common.controllers.js';

const router = express.Router();

router.get('/storage/signed-url', commonController.getSignedUrl);
router.post('/storage/getSignedUrlUseingBodyPath', commonController.getSignedUrlUseingBodyPath);
router.post('/storage/upload/signed-url', commonController.getSignedUrlForUpload);
router.delete('/storage/delete', commonController.deleteFile);

export default router;
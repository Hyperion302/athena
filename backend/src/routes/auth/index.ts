import express from 'express';
import tokenHandler from './token';
import refreshHandler from './refresh';
const router = express.Router();

router.post('/token', tokenHandler);
router.post('/refresh', refreshHandler);

export default router;

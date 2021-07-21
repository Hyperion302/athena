import express from 'express';
import channelHandler from "./channel";
import memberHandler from "./member";
import roleHandler from "./role";
const router = express.Router({ mergeParams: true });

router.use("/channel", channelHandler);
router.use("/member", memberHandler);
router.use("/role", roleHandler);

export default router;

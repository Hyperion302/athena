import express from "express"
import rootHandler from "./root";
import channelHandler from "./channel";
const router = express.Router({ mergeParams: true });

router.get("/", rootHandler);
router.get("/:channel", channelHandler);

export default router;

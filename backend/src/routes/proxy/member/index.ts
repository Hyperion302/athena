import express from "express"
import rootHandler from "./root";
import memberHandler from "./member";
const router = express.Router({ mergeParams: true });

router.get("/", rootHandler);
router.get("/:member", memberHandler);

export default router;


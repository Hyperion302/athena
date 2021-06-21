import express from "express"
import rootHandler from "./root";
import roleHandler from "./role";
const router = express.Router({ mergeParams: true });

router.get("/", rootHandler);
router.get("/:role", roleHandler);

export default router;

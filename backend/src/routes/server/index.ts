import rootHandler from "./root";
import express from "express";
const router = express.Router();

router.get("/", rootHandler);

export default router;


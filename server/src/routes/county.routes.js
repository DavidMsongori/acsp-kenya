
import express from "express";
import { getCounties } from "../controllers/county.controller.js";

const router = express.Router();

router.get("/", getCounties);

export default router;

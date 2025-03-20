import express from "express";
const router = express.Router();

/* GET home page. */
router.get("/health", (req, res) => {
  res.status(200).send("Healthy");
});

export default router;

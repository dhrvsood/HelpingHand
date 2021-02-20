const express = require('express');
const router = express.Router();
const insightController = require("../controllers/insightController")

router.get('/', insightController.handle_get_insight);

module.exports = router;
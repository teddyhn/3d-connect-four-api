const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  res.send({ response: "Server online" }).status(200)
})

module.exports = router
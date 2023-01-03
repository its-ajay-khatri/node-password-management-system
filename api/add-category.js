var express = require('express');
var router = express.Router();

router.get("/", (req, res, next) => {
    res.send("Node js RestFul API Get Method working")
})

router.get("/add-category", (req, res, next) => {
    res.send("Node js RestFul API POST Method working")
})

module.exports = router;
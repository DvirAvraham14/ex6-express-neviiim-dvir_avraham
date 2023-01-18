const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require("../models");
const func  = require("../controller/funcs");
const c_login = require("../controller/c_login");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("login", {title : "Login page"})
});

router.post(`/`, c_login.loginPost);

module.exports = router;

const express = require('express');
const router = express.Router();

const Users = require("../models/Register")
const func  = require("../models/funcs")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("login", {title : "Login page"})
});

router.post(`/`, (req, res) => {
  const email = req.body.emailField;
  const pass = req.body.pass;
  const loginName = Users.login(email, pass)
  if(loginName !== false){
      req.session.loginName = loginName;
      req.session.log = true;
      res.redirect("/")
  }else{
      func.set_error(req, "One of the field`s incorrect", true);
      res.redirect("/")
  }
})



module.exports = router;

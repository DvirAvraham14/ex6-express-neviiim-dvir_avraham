const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require("../models");
const func  = require("../controller/funcs")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("login", {title : "Login page"})
});

router.post(`/`, (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
    db.User.findOne({where: {email: email}}).then((user) =>{
        bcrypt.compare(pass, user.password, (err, result) => {
            if (result) {
                req.session.loginName = `${user.firstName} ${user.lastName}`;
                req.session.log = user.id;
                res.redirect("/")
            } else {
                func.set_error(res, false, "One of the field`s incorrect");
                res.redirect("/")
            }
        })
  }).catch(err => console.log(err))
})


module.exports = router;

const express = require('express');
const router = express.Router();

const db = require("../models");
const func  = require("../controller/funcs")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("login", {title : "Login page"})
});

router.post(`/`, (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
    db.User.findOne({where: {email: email, password: pass}}).then((respone) =>{
      if(respone !== null){
          req.session.loginName = `${respone.firstName} ${respone.lastName}`;
          req.session.log = true;
          res.redirect("/")
      }else{
          func.set_error(res, false,"One of the field`s incorrect");
          res.redirect("/")
        }
  }).catch(err => console.log(err))
})


module.exports = router;

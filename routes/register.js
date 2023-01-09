let express = require('express');
let router = express.Router();
//const Register = require('../controller/Register');
//const User = require('../controller/Users');
const func = require('../controller/funcs');
const db = require("../models");


/* GET users listing. */

router.get('/', function(req, res, next) {
    let formData = {};
    if (req.cookies.formData)
        formData = req.cookies.formData;
    try {
        res.render("register", {
        title: "register step one",
        formData,
        });
    }catch (e){
        console.log(e)
    }
});

router.post('/step1/', (req, res, next) => {
    try {
        let firstName = req.body.firstName.trim();
        let lastName = req.body.lastName.trim();
        let email = req.body.email.trim();
        /*if (!req.body.email || (emailField)) {
            func.set_error(res, false, "the email you choose already in use.");
            res.redirect('/register/');
        }else {
            res.cookie('formData', {firstName, lastName, emailField}, {maxAge: 30000});
            res.redirect('../step2')
        }*/
        db.User.findOne({where : {email: email}})
            .then((re) => {
                if(!re){
                    res.cookie('formData', {firstName, lastName, email}, {maxAge: 30000});
                    res.redirect('../step2')
                }else{
                    func.set_error(res, false, "the email you choose already in use.");
                    res.redirect('/register/');
                }
            }).catch((e) => {
            console.log(e)

        })
    }catch (e) {
        console.log(e)
    }
});


router.get('/step2', function(req, res, next) {
  if(!req.cookies.formData)
      return res.redirect('/register/');
  res.render("registerStepTwo", {title: "register step two"})
});


router.post('/validate/', (req, res, next) => {
    let formData = {};
    if(!req.cookies.formData){
        func.set_error(res, false, "Your session expired");
        res.redirect('/register/');
    }else if(req.body.password !== req.body.confPass) {
        func.set_error(res, false, "the password`s don`t match!.");
        res.redirect('../step2/');
    }else if(req.body.password === '' || req.body.passCond === '') {
        func.set_error(res, false,"All the field`s required");
        res.redirect('../step2/');
    }else {
        const {firstName, lastName, email} = req.cookies.formData;
        const password = req.body.password
        let u = db.User.build({firstName,lastName,email, password});
        return u.save()
            .then((contact) => {
                res.clearCookie("formData");
                func.set_error(res, true, "success registered");
                res.redirect('/');})
            .catch((err) => {
                if (err instanceof Sequelize.ValidationError)
                    console.log(`validation error ${err}`);
                else
                    console.log(`other error ${err}`);
            })
    }
});

module.exports = router;

let express = require('express');
let router = express.Router();
const Register = require('../models/Register');
const User = require('../models/Users');
const func = require('../models/funcs');

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
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let emailField = req.body.emailField;
        if (Register.mailExsists(emailField)) {
            func.set_error(req, "the email you choose already in use.", true);
            res.redirect('/register/');
        }else {
            res.cookie('formData', {firstName, lastName, emailField}, {maxAge: 30000});
            res.redirect('../step2')
        }
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
        func.set_error(req, "Your session expired", true);
        res.redirect('/register/');
    }else if(req.body.pass !== req.body.confPass) {
        func.set_error(req, "the password`s don`t match!.", true);
        res.redirect('../step2/');
    }else if(req.body.pass === '' || req.body.passCond === '') {
        func.set_error(req, "All the field`s required", true);
        res.redirect('../step2/');
    }else {
        formData = req.cookies.formData;
        const user = new User(formData.firstName, formData.lastName, formData.emailField, req.body.pass)
        if(Register.addUser(user)){
            func.clearTemp(res); // delete to cookie that storage the field`s data
            res.redirect('/');
        }else{
            func.set_error(req, "The mail you choose already registered", true);
            func.clearTemp(res); // delete to cookie that storage the field`s data
            res.redirect('/register')
        }
    }
});

module.exports = router;

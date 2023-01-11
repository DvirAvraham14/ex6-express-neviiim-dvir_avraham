const db = require("../models");
const func = require("./funcs");
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.renderHome = (req, res, next) => {
    try {
        const formData = req.cookies.formData ? req.cookies.formData : {};;
        res.render("register", {
            title: "register step one",
            formData,
        });
    }catch (e){
        console.log(e)
    }
};

exports.postStepOne = (req, res, next) => {
    try {
        let firstName = req.body.firstName.trim();
        let lastName = req.body.lastName.trim();
        let email = req.body.email.trim();
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
};

exports.getStepTwo = (req, res, next) => {
    if(!req.cookies.formData)
        return res.redirect('/register/');
    res.render("registerStepTwo", {title: "register step two"})
};

exports.postStepTwo = async (req, res, next) => {
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
        const password = await bcrypt.hash(req.body.password, saltRounds);
        let u = db.User.build({firstName,lastName,email, password});
        return u.save()
            .then((contact) => {
                res.clearCookie("formData");
                func.set_error(res, true, "success registered");
                res.redirect('/');})
            .catch((err) => {
                if (err instanceof Sequelize.ValidationError) {
                    func.set_error(res, false, err.message);
                    res.redirect("/register")
                }else
                    console.log(`other error ${err}`);
            })
    }
}
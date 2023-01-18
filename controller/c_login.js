const db = require("../models");
const func = require("./funcs");
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const createError = require("http-errors");
const saltRounds = 10;

exports.loginPost = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;

    if(!validateInput(req.body)) {
        func.set_error(res, false, "All the fields required");
        res.redirect("/login");
        return;
    }

    db.User.findOne({where: {email: email}})
        .then((user) => handleUserFound(user, pass, req, res))
        .catch(err => next(createError(401, e)));
};

function validateInput(body){
    return body.email && body.password;
}

function handleUserFound(user, pass, req, res){
    if(user){
        bcrypt.compare(pass, user.password, (err, result) => {
            if (result) {
                handleSuccessfulLogin(user, req, res);
            } else {
                handleIncorrectInput(res);
            }
        });
    }else{
        handleIncorrectInput(res);
    }
}

function handleSuccessfulLogin(user, req, res){
    req.session.loginName = `${user.firstName} ${user.lastName}`;
    req.session.log = user.id;
    res.redirect("/");
}

function handleIncorrectInput(res){
    func.set_error(res, false, "One of the field`s incorrect");
    res.redirect("/")
}


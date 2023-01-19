const db = require("../models");
const func = require("./funcs");
const createError = require('http-errors');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.renderHome = (req, res, next) => {
    try {
        const formData = req.cookies.formData ? req.cookies.formData : {};
        res.render("register", {
            title: "register step one",
            formData,
        });
    }catch (e){
        next(createError(401, e))
    }
};


/**
 * @function postStepOne
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 *
 * @description This function handles the form submission for step one of the registration process
 */
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
            next(createError(401, e))
        })
    }catch (e) {
        next(createError(401, e))
    }
};

exports.getStepTwo = (req, res, next) => {
    if(!req.cookies.formData)
        return res.redirect('/register/');
    res.render("registerStepTwo", {title: "register step two"})
};

/**
 * @function handleFormData
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} formData - An object containing form data from cookies
 *
 * @description This function retrieves form data from cookies and returns it
 */
const handleFormData = (req, res) => {
    if(!req.cookies.formData){
        func.set_error(res, false, "Your session expired");
        res.redirect('/register/');
    }
}

/**
 * @function handlePasswords
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Boolean} isValid - A boolean indicating whether the passwords match
 *
 * @description This function checks if the password and confirm password fields match
 */
const handlePasswords = (req, res) => {
    let isValid = true;
    if(req.body.password !== req.body.confPass) {
        func.set_error(res, false, "the password`s don`t match!.");
        res.redirect('../step2/');
        isValid = false;
    }
    return isValid;
}

/**
 * @function handleEmptyFields
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Boolean} isValid - A boolean indicating whether all fields are filled
 *
 * @description This function checks if all the fields are filled
 */
const handleEmptyFields = (req, res) => {
    let isValid = true;
    if(req.body.password === '' || req.body.passCond === '') {
        func.set_error(res, false,"All the field`s required");
        res.redirect('../step2/');
        isValid = false;
    }
    return isValid;
}

/**
 * @function createUser
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that creates a user in the database
 *
 * @description This function creates a user in the database with the provided form data
 */
const createUser = async (req, res) => {
    const {firstName, lastName, email} = req.cookies.formData;
    const password = await bcrypt.hash(req.body.password, saltRounds);
    let u = db.User.build({firstName,lastName,email, password});
    return u.save();
}

/**
 * @function postStepTwo
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 *
 * @description This function handles the form submission for step two of the registration process
 */
exports.postStepTwo = async (req, res, next) => {
    handleFormData(req, res);
    const isPassValid = handlePasswords(req, res);
    const isFieldsValid = handleEmptyFields(req, res);

    if(isPassValid && isFieldsValid) {
        try {
            await createUser(req, res);
            res.clearCookie("formData");
            func.set_error(res, true, "success registered");
            res.redirect('/login');
        } catch (err) {
            if (err instanceof Sequelize.ValidationError) {
                func.set_error(res, false, err.message);
                res.redirect("/register")
            }else
                next(createError(401, err))
        }
    }
}



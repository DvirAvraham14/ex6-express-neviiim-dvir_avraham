let express = require('express');
let router = express.Router();
const func = require('../controller/funcs');
const db = require("../models");
const c_register = require("../controller/c_register")
/* GET users listing. */
router.get('/', c_register.renderHome);

router.post('/step1/', c_register.postStepOne);

router.get('/step2', c_register.getStepTwo);

router.post('/validate/', c_register.postStepTwo);

module.exports = router;

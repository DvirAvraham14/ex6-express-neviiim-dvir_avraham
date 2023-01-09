let express = require('express');
let router = express.Router();
let db = require("../models");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).json({msg: "hello from spacebook api"});
});


/* GET home page. */
router.get('/users/', function(req, res, next) {
        db.User.findAll({attributes: ['id','firstName', 'lastName','email']}).then(respone =>
        res.status(200).send(respone))
            .catch((e) => console.log(e))
});

module.exports = router;

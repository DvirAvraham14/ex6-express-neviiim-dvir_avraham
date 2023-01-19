let express = require('express');
let router = express.Router();
const db = require("../models");
const Sequelize = require('sequelize');
const createError = require("http-errors");


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


/* GET home page. */
router.get('/logout/', function(req, res, next) {
    if(req.session.log) {
        delete req.session.log
        delete req.session.loginName
    }
    res.redirect('/');
});

router.post("/addComment", (req,res,next) => {
    const {pic_date, comment} = req.body;
    const user_id = req.session.log;
    if (!comment || comment.trim().length === 0 || comment.length > 128)
        return next(createError(400, "Your comment now allowed!"));
    if (new Date(pic_date) == "Invalid Date")
        return next(createError(400, "Invalid date format"));


    db.Comment.create({user_id : user_id, comment: comment, pic_date: pic_date}).then((r) => {
        res.status(204).end()
    }).catch(e =>  next(createError(401, e))
    )
})

module.exports = router;

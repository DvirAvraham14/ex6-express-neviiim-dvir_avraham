let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.log)
    res.render('login', { title: 'Express'});
  else
    res.render('index', { title: 'Express' });
});


/* GET home page. */
router.get('/logout/', function(req, res, next) {
    if(req.session.log)
       delete req.session.log
    res.redirect('/');
});

module.exports = router;

let express = require('express');
let router = express.Router();
let db = require("../models");

// get request for the root route of the api
router.get('/', function(req, res, next) {
    // respond with a JSON message
    res.status(200).send({msg: "hello from spacebook api"});
});

/* GET all the users. */
router.get('/users/', function(req, res, next) {
    //find all user in the User table with attributes firstName, lastName and email
    db.User.findAll({attributes: ['id','firstName', 'lastName','email']}).then(response =>
        // respond with the found users
        res.status(200).send(response))
        .catch((e) => console.log(e))
});

/* GET comments by date. */
router.get('/comments/:date', function(req, res, next) {
    // find all comments that match the provided date
    db.Comment.findAll({
        where: {pic_date: req.params.date},
        //select the id, comment, user_id columns
        attributes: ['id','comment','user_id'],
        //include the related user details
        include: [{
            model: db.User,
            attributes: ['firstName', 'lastName'],
        }]
    }).then(response => {
        let html = '';
        let index = 0;
        // loop through the comments
        response.forEach((comment) => {
            let del = '';
            // check if the current logged in user is the owner of the comment
            if(req.session.log == comment.user_id){
                // create a delete form
                del = `<form class="deleteForm" method="post" action="/api/comments/del/">
                            <input type="hidden" value="${comment.id}" name="todel" />
                            <input type="hidden" value="comment_${index}" id="comment_id" name="comment_id" />
                            <input type="submit" value="Delete" class="btn btn-sm btn-outline-secondary">
                       </form>`;
            }
            // create a card element for each comment
            html += `<div class="card mb-2" id="comment_${index++}">
                        <div class="card-body">
                          <span class="fw-bold fs-10">
                          <div class="row">
                          <div class="col col-8">${comment.User.firstName} ${comment.User.lastName}</div>
                          <div class="col col-4">${del}</div>
                          </div>
                          </span>
                          <hr />
                          <p class="fs-10">${comment.comment}</p>         
                        </div>
                    </div>`;
        })
        res.status(200).send(html);
    }).catch((e) => console.log(e))
});

// delete comment by its id
router.post('/comments/del/', function(req, res, next){
    // destroy the comment
    db.Comment.destroy({where: {id:req.body.todel}})
        .then((response) => {
            console.log(response)
            //if success remove the comment's card from the frontend
            res.status(200)
        })
        .catch((err) => {
            console.log(err)
        })
});

module.exports = router;


let express = require('express');
const createError = require('http-errors');
let router = express.Router();
let db = require("../models");

// get request for the root route of the api
router.get('/', function(req, res, next) {
    // respond with a JSON message
    res.status(200).send({msg: "hello from spacebook api"});
});

/* GET comments by date. */
router.get('/comments/:date', function(req, res, next) {
    validateDate(req.params.date, next);
    db.Comment.findAll({
        where: {pic_date: req.params.date},
        attributes: ['id','comment','user_id'],
        include: [{
            model: db.User,
            attributes: ['firstName', 'lastName'],
        }]
    }).then(response => {
        const html = createCommentCards(response, req.session.log);
        res.status(200).send(html);
    }).catch((e) => next(createError(401, e)))
});

/**
 * Validates the provided date
 * @param {string} date - The date to validate
 * @param {function} next - The next middleware function
 */
function validateDate(date, next) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))
        next(createError(401, "not valid date"));
}

/**
 * Creates the comment cards to be displayed on the UI
 * @param {Array} comments - An array of comments
 * @param {string} loggedInUserId - The ID of the logged in user
 * @returns {string} - The generated HTML
 */
function createCommentCards(comments, loggedInUserId) {
    let html = '';
    let index = 0;
    comments.forEach((comment) => {
        let del = '';
        if(loggedInUserId == comment.user_id)
            del = createDeleteForm(comment.id, `comment_${index}`);

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
    return html;
}

/**
 * Creates a delete form for a comment
 * @param {string} commentId - The ID of the comment
 * @param {string} commentElementId - The ID of the comment element
 * @returns {string} - The generated HTML
 */
function createDeleteForm(commentId, commentElementId) {
    return `<form class="deleteForm" method="post" action="/api/comments/del/">
                <input type="hidden" value="${commentId}" name="todel" />
                <input type="hidden" value="${commentElementId}" id="comment_id" name="comment_id" />
                <input type="submit" value="Delete" class="btn btn-sm btn-outline-secondary">
                </form>`;
}


// delete comment by its id
router.post('/comments/del/', function(req, res, next){
    // destroy the comment
    db.Comment.findOne({where : {id: req.body.todel}})
        .then(data => {
            console.log(data["user_id"], req.session.log)
            if(data["user_id"] == req.session.log){
                db.Comment.destroy({where: {id:req.body.todel}})
                    .then(() => {
                        //if success remove the comment's card from the frontend
                        res.status(204).end()
                    })
                    .catch((err) => {
                        next(createError(401, err))
                    })
            }else
                next(createError(401, "you not allowed to delete that"));
        })
        .catch(e => {
            next(createError(401, e));
        })
});

module.exports = router;


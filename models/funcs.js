/*module.exports = function set_error(req, error_message, error_code = null) {
    req.session.error = error_code;
    req.session.error_message = error_message;
}*/

module.exports = (function (){

    function  set_error(req, error_message, error_code = null) {
        req.session.error = error_code;
        req.session.error_message = error_message;
    }

    function clearCookie(res) {
        res.cookie('formData', 'cookieValue', {
            expires: new Date(Date.now() - 3600000)
            ,
            httpOnly: true
        });
    }

    return {
        set_error : set_error,
        clearTemp : clearCookie,
    }
})();


module.exports = (function (){

    function  set_error(res,  error_type, error_message) {
        res.cookie( "error", {error_type, error_message})
    }

    return {
        set_error : set_error,
    }
})();


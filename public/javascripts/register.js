const register = function () {
    function goBack() {
        window.location.assign('/register');
    }

    return {
        goBack: goBack,
    }

}();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("back-button").addEventListener("click", register.goBack);
});

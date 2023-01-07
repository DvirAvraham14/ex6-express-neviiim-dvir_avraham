// use the module pattern to handle a list of contacts
module.exports = (function() {
    // private data
    let users = [];

    // private methods
    function addUser(user) {
        let index = users.findIndex((item) => item.email === user.email);
        if(index === -1)
            return users.push(user);
        return false;
    }

    function deleteUser(user) {
        let index = users.indexOf(user);
        if (index > -1) {
            users.splice(index, 1);
        }
    }

    function mailExsists(mail){
        let index = users.findIndex((item) => item.email === mail);
        if(index === -1)
            return false
        return true
    }

    function login(user,password){
        let valid = users.findIndex((item) => (item.email === user && item.password === password));
        console.log(valid)
        if(valid === -1)
            return false
        return `${users[valid].firstName} ${users[valid].lastName}`
    }

    // public API
    return {
        addUser: addUser,
        deleteUser: deleteUser,
        mailExsists: mailExsists,
        login: login,
        getUsers: () => users
    };
})();
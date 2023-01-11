(function() {
    const api_key = 'B5iZwVm6HcOzzg5DPqaSFmZsymzMgAowzH2QGF8h';
    const api_url = `https://api.nasa.gov/planetary/apod`;

    const connectToAPI = function (){
        let date = new Date();
        let end_date   = dateFormat();
        date.setDate(date.getDate() - 2);
        let start_date = dateFormat();

        /**
         * create format date to match to api rules
         * @returns {string}
         */
        function dateFormat(){
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }

        /**
         * set new date from date input and match the format
         * @param event
         */
        function setDate(event) {
            const elemTarget = event.target;
            date = new Date(elemTarget.value);
            end_date   = dateFormat();
            date.setDate(date.getDate() - 2);
            start_date = dateFormat();
            document.getElementById("main-data").innerHTML = "";
            displayTree();
        }

        /**
         * update the date with by sub two days
         */
        function updateDates() {
            date.setDate(date.getDate() - 1);
            end_date = dateFormat();
            date.setDate(date.getDate() - 2);
            start_date   = dateFormat();
        }

        /**
         * after the user choose an image to view and comment
         * we create a modal to enable this choose.
         * @param elem
         */
        function loadModal(elem){
            const imgDate = elem.target.id;
            connectDataBase.getCom(imgDate);
            fetch(`${api_url}?api_key=${api_key}&date=${imgDate}`).then(function (response){
                return response.json()
            }).then(function (data){
                document.getElementById("modal-sub").innerHTML = `${data["title"]} <i>${data["date"]}</i>`
                document.getElementById("pic_date").value = data["date"]
                document.getElementById("modal-img").innerHTML = getCover(data, "75vh")
                document.getElementById('modal-comments-area').style = `height: ${document.getElementById('modal-img').offsetHeight}px;`

            }).catch(function (e) {
                console.log(e);
            });
        }
        function getCover(elem, height){
            if(elem["media_type"] === "image")
                return `<img class="card-img-top" alt="${elem.title}" src="${elem.url}" data-holder-rendered="true" style="height: ${height}; width: 100%; display: block;">`
            else
                return `<iframe class="card-img-top" data-holder-rendered="true" style="height: ${height}; width: 100%; display: block;" src="${elem.url}"></iframe>`
        }
        /**
         * create a card that included the pic and description
         * @param data
         * @returns {string}
         */
        function createHtml (data){
            let html= "";
            let cover = "";
            if (!Array.isArray(data))
                data = Array.from(data);

            data.slice().reverse().forEach((elem) => {
                cover = getCover(elem, "225px")
                html += `
          <div class="col-lg-4 col-md-6">
          <div class="card mb-4 box-shadow">
            ${cover}
            <div class="card-body">
              <h6 class="card-title">${elem.title}</h6>
              <p class="card-text overflow-auto" style="height: 100px">${elem.explanation}</p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group">
                  <a data-bs-toggle="modal" data-bs-target="#view" role="button" id="${elem.date}" class="btn btn-sm btn-outline-secondary comments" >
                                Comment
                </a>
                </div>
                <small class="text-muted">
                    ©${elem.copyright} <br />
                    Publish: ${elem.date}
                </small>
              </div>
            </div>
          </div>
        </div>`
            })
            return html;
        }

        /**
         * Display three cards in a row every scrolling
         */
        function displayTree() {
            document.getElementById("loader").classList.remove("d-none")
            fetch(`${api_url}?api_key=${api_key}&start_date=${start_date}&end_date=${end_date}`)
                .then(function (response){
                    return response.json();
                })
                .then(function (data) {
                    document.getElementById("loader").classList.add("d-none")
                    if(data["code"] >= 300)
                        throw new Error(`code ${data['code']}, Error: ${data['msg']}`)
                    data = createHtml(data);
                    document.getElementById("main-data").innerHTML += data;
                    document.querySelectorAll(".comments").forEach((item) => {
                        item.addEventListener("click", loadModal);
                    });
                }).catch(function (e) {
                document.getElementById("main-data").innerHTML = e;
            });



        }
        return {
            displayFeed : displayTree,
            update : updateDates,
            selectDate   : setDate,
            getDate : dateFormat

        };
    }();


    /**
     * connect to our database that included the comments.
     * @type {{getIntrval: (function(): *), getCom: getComment, postCom: postComment}}
     */
    const connectDataBase = function () {
        let imgDate = ''
        let intravl;
        let t = 0;

        /**
         * get all comments that belong to specific picture
         * and refresh the comments every 15 second
         * @param id
         */
        function getComment(id) {
            imgDate = id;
            fetch(`api/comments/${imgDate}`).then(function (response) {
                return response.text();
            }).then(function (data) {
                document.getElementById("com").innerHTML = "";
                document.getElementById("com").innerHTML += data
                // Select all the delete buttons
                const deleteButtons = document.querySelectorAll('.deleteForm input[type="submit"]');

                // Iterate over the buttons and add an event listener to each
                deleteButtons.forEach(button => {
                    button.addEventListener('click', (event) => {
                        // Find the closest parent div with the class "card"
                        const commentBox = event.target.closest('.card');
                        // Remove the comment box from the DOM
                        setTimeout(() => {commentBox.remove()},500);
                    });
                });
            }).catch(function (e) {
                console.log(e)
            })
            clearInterval(intravl);
            intravl = setTimeout(() => { return getComment(imgDate) }, 15000);
        }

        /**
         * get an intrval id for stopping the refresh
         * @returns {*}
         */
        function getIntrval(){
            return intravl;
        }

        return {
            getCom : getComment,
            getIntrval: getIntrval,
        }
    }();



    /// Main Section
    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("close-modal").addEventListener("click",() => {
            document.getElementById("modal-img").src = "";
            clearInterval(connectDataBase.getIntrval());
        })
        document.getElementById("submit-comment").addEventListener("submit", (elem) => {

            setTimeout( () => {
                connectDataBase.getCom(elem.target.pic_date.value)
                elem.target.comment.value = ""
            },500)
        })
        connectToAPI.displayFeed();
        window.addEventListener("scroll", () => {
            if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight){
                connectToAPI.update();
                connectToAPI.displayFeed();
            }
        });
    });

})();
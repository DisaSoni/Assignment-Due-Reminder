window.onload = getReady;


function getReady() {


    // Getting some of required elements.
    var infoForm = document.getElementById("form");
    var createBt = document.getElementById("create");
    var estimateBt = document.getElementById("estimate");
    var estimatorDiv = document.getElementById("estimator-div");
    var proficiencyOptions = document.getElementsByClassName("proficiency");
    var checkboxes = document.getElementsByClassName("lang-check");
    var invalid = document.getElementById("invalid");
    var startCountdown = document.getElementById("start-count");
    var stopCountdown = document.getElementById("stop-count");
    var toggleCountdown = document.getElementById("pause-count");

    // List that stores all the assigment details.
    var assignments = [];

    var countdownData = {
        ms: 0,
        intervalHandler: null,
        timeoutHandler: null,
        state: false,
        ended: false
    };

    var globalData = {};


    // Handles fetching of data from the inputs.
    function fetchData() {

        var userInfo = {
            name: "",
            requirements: 0,
            languages: [],
            languages_with_proficiency: 0,
            difficulty: 0,
            due: "",
            total_time: 0,
            time: '',
            completed: false,
        };

        // Getting the assigment name
        userInfo.name = document.getElementById("name-input").value;

        // Getting the number of requirements
        userInfo.requirements = parseInt(document.getElementById("req-input").value)

        // Getting the Languages used and languages_wit_proficiency
        for (var i = 0; i < checkboxes.length; i++) {
            var checkbox = checkboxes[i];
            if (checkbox.checked) {
                userInfo.languages.push(checkbox.name);
                var idName = "prof-" + checkbox.id;
                userInfo.languages_with_proficiency += parseInt(document.getElementById(idName).value) * parseInt(checkbox.value);
            }
        }

        // Getting the difficulty
        var index = document.getElementById("complexity").selectedIndex;
        userInfo.difficulty = document.getElementById("complexity").options[index.toString()].text;

        // Getting Due Date and time
        userInfo.due = document.getElementById("due").value;
        userInfo.time = document.getElementById("due-time").value;

        //
        userInfo.total_time = userInfo.languages_with_proficiency +
            (userInfo.requirements *
                parseInt(document.getElementById("complexity").value));

        globalData = userInfo;

        // returning userInfo Object
        return userInfo;

    }


    // Validates the remaining part of the form.
    function handleFormValidation() {

        var valid = false;

        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                var idName = "prof-" + checkboxes[i].id;
                if (document.getElementById(idName).value !== "") {
                    valid = true;
                }
            }
        }

        return valid;
    }

    // Starts the countdown
    function handleCountdown(distance) {

        // console.log(countdownData);

        var alarm = document.getElementById("myAudio");

        distance *= 60 * 1000;
        distance -= 1000;
        // countdownData.ms = distance;
        countdownData.state = true;
        countdownData.intervalHandler = setInterval(() => {
            // console.log(countdownData.intervalHandler);
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownData.ms = distance;
            // Stopping when the timer ends
            if (minutes === 0 && seconds === 0) {
                clearInterval(countdownData.intervalHandler);
                countdownData.state = false;
            }

            // console.log(minutes, seconds, distance)
            displayEstimate(minutes.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            }) + ":" + seconds.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            }))
            distance -= 1000;

        }, 1000)

        countdownData.timeoutHandler = setTimeout(() => {
            alarm.play();
        }, distance);
    }


    // Toggles the countdown
    function countdownPause() {
        if (countdownData.state) {
            // console.log("paused");
            clearInterval(countdownData.intervalHandler);
            clearTimeout(countdownData.timeoutHandler);

            countdownData.intervalHandler = null;
            countdownData.timeoutHandler = null;
            countdownData.state = false;
            toggleCountdown.innerText = "Resume Countdown"
        }
        else {
            // console.log("resumed");
            clearInterval(countdownData.intervalHandler);
            clearTimeout(countdownData.timeoutHandler);
            handleCountdown((countdownData.ms) / (1000 * 60));
            toggleCountdown.innerText = "Pause Countdown"
        }
    }


    // Resets the countdown
    function resetCountdown() {

        // console.log(countdownData);

        clearInterval(countdownData.intervalHandler);
        clearTimeout(countdownData.timeoutHandler);

        countdownData = {
            ms: 0,
            intervalHandler: null,
            timeoutHandler: null,
            state: false,
            ended: false
        }

        // console.log(countdownData);

    }


    // Handles the deletion of the tiles
    function handleDelete(index) {
        assignments.splice(index, 1);
        handleCreateTileAfterCompleted();
    }


    // handles when user marks tile as completed
    function handleCompleted(index) {
        assignments[index].completed = !assignments[index].completed;
        handleCreateTileAfterCompleted();
    }


    // Handles making HTML for langauge tiles
    function handleCreateLanguage(currData) {
        var languagesHTML = "";
        for (var i = 0; i < currData.languages.length; i++) {
            languagesHTML += `<div class="tile-lang ${currData.completed ? "strike" : null}">${currData.languages[i]}</div>`
        }
        return languagesHTML;
    }


    // Handles the creation of tiles after Completion
    function handleCreateTileAfterCompleted() {
        var finalHTML = ``;

        for (var i = 0; i < assignments.length; i++) {
            var assData = assignments[i];
            // console.log(assData.completed);

            if (assData.completed) {
                finalHTML += `<div class="tile-main">
                            <input type="checkbox" checked name="completed" class="completed ${assData.completed ? "strike" : null}">

                            <h3 class="tile-name ${assData.completed ? "strike" : null}">${assData.name}</h3>
                            <div class="tile-langs">
                            ${handleCreateLanguage(assData)}

                            
                            <div class="quick-fix">
                                <div class="tile-diff ${assData.completed ? "strike" : null}">
                                    ${assData.difficulty}
                                </div>
                            </div>
                            <div class="tile-due ${assData.completed ? "strike" : null}">
                                ${assData.due}
                                ${assData.time}
                            </div>
                            
                            <div class="quick-fix">
                                <div class="tile-estimate ${assData.completed ? "strike" : null}">
                                    ${assData.total_time} minutes
                                </div>
                            </div>
                
                            <button class="tile-countdown ${assData.completed ? "strike" : null}">
                                Delete
                            </button>

                        </div>`
            } else {
                finalHTML += `<div class="tile-main">
                            <input type="checkbox" name="completed" class="completed ${assData.completed ? "strike" : null}">

                            <h3 class="tile-name ${assData.completed ? "strike" : null}">${assData.name}</h3>
                            <div class="tile-langs">
                            ${handleCreateLanguage(assData)}
                            </div>
                            
                            <div class="quick-fix">
                                <div class="tile-diff ${assData.completed ? "strike" : null}">
                                    ${assData.difficulty}
                                </div>
                            </div>
                            <div class="tile-due ${assData.completed ? "strike" : null}">
                                ${assData.due}
                                ${assData.time}
                            </div>
                            
                            <div class="quick-fix">
                                <div class="tile-estimate ${assData.completed ? "strike" : null}">
                                    ${assData.total_time} minutes
                                </div>
                            </div>
                
                            <button class="tile-countdown ${assData.completed ? "strike" : null}">
                                Delete
                            </button>

                        </div>`
            }
        }

        var assigmentBlock = document.getElementById("assigment-tiles");
        assigmentBlock.innerHTML = finalHTML;
        handleAddEventListeners();

    }


    // Handles the creation of tiles after Deletion [[Unused]]
    function handleCreateTileAfterDeletion() {
        var finalHTML = ``;

        for (var i = 0; i < assignments.length; i++) {
            var assData = assignments[i];
            // console.log(assData.completed);
            finalHTML += `<div class="tile-main">
                            <input type="checkbox" name="completed" class="completed ${assData.completed ? "strike" : null}">
                            <h3 class="tile-name ${assData.completed ? "strike" : null}">${assData.name}</h3>
                            <div class="tile-langs">
                            ${handleCreateLanguage(assData)}

                            
                            <div class="quick-fix">
                                <div class="tile-diff ${assData.completed ? "strike" : null}">
                                    ${assData.difficulty}
                                </div>
                            </div>
                            <div class="tile-due ${assData.completed ? "strike" : null}">
                                ${assData.due}
                                ${assData.time}
                            </div>
                            
                            <div class="quick-fix">
                                <div class="tile-estimate ${assData.completed ? "strike" : null}">
                                    ${assData.total_time} minutes
                                </div>
                            </div>
                
                            <button class="tile-countdown ${assData.completed ? "strike" : null}">
                                Delete
                            </button>
                        </div>`
        }

        var assigmentBlock = document.getElementById("assigment-tiles");
        assigmentBlock.innerHTML = finalHTML;
        handleAddEventListeners();

    }


    // Handles the creation of tiles
    function handleCreateTile() {
        // Fetching Data submitted by user.
        var currData = fetchData();

        assignments.push(currData);

        // console.log("Verified")

        // var languagesHTML = ``;
        var finalHTML = ``;


        for (var i = 0; i < assignments.length; i++) {
            var assData = assignments[i];
            finalHTML += `<div class="tile-main">
                            <input type="checkbox" name="completed" class="completed ${assData.completed ? "strike" : null}">
                            <h3 class="tile-name ${assData.completed ? "strike" : null}">${assData.name}</h3>
                            <div class="tile-langs">
                            ${handleCreateLanguage(assData)}
                            </div>
                            
                            <div class="quick-fix">
                                <div class="tile-diff ${assData.completed ? "strike" : null}">
                                    ${assData.difficulty}
                                </div>
                            </div>
                            <div class="tile-due ${assData.completed ? "strike" : null}">
                                ${assData.due}
                                ${assData.time}
                            </div>
                            
                            <div class="quick-fix">
                                <div class="tile-estimate ${assData.completed ? "strike" : null}">
                                    ${assData.total_time} minutes
                                </div>
                            </div>
                
                            <button class="tile-countdown ${assData.completed ? "strike" : null}">
                                Delete
                            </button>

                        </div>`
        }

        var assigmentBlock = document.getElementById("assigment-tiles");
        assigmentBlock.innerHTML = finalHTML;
        handleAddEventListeners();

    }


    // Adds Event listeners to all the tiles
    function handleAddEventListeners() {
        var deleteButtons = document.getElementsByClassName("tile-countdown");
        var completedButtons = document.getElementsByClassName("completed");
        // console.log(completedButtons);
        for (var i = 0; i < deleteButtons.length; i++) {
            ((e) => {
                deleteButtons[i].addEventListener('click', () => {
                    handleDelete(e);
                });
            })(i)
        }
        for (var i = 0; i < completedButtons.length; i++) {
            ((e) => {
                completedButtons[i].addEventListener('change', () => {
                    handleCompleted(e)
                });
            })(i)
        }
    }


    // Handles form Submitting
    function handleSubmit() {

        // event.preventDefault();

        var formValidated = handleFormValidation();

        if (formValidated) {
            invalid.style.display = "none"
            handleCreateTile();
        } else {
            invalid.style.display = "inline-block";
        }
    }


    // Handles the estimated time that will be taken to complete the assigment
    function handleEstimate() {
        estimatorDiv.style.display = "flex";

        var currData = fetchData();

        //Assigning initial state to buttons
        startCountdown.disabled = false;
        toggleCountdown.disabled = true;


        // Attaches event listener to each button.
        displayEstimate(currData.total_time.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        }) + ":00");
    }


    function displayEstimate(totalTime) {
        document.getElementById("estimated-time").innerText = totalTime;

    }


    // Handles when to show ==Select your Proficiency== option
    function handleLangCheckboxes(event) {
        invalid.style.display = "none";
        var idName = "prof-" + event.target.id;
        if (event.target.checked) {
            document.getElementById(idName).style.display = "inline-block";
        } else {
            document.getElementById(idName).style.display = "none";
        }
    }


    // Checking which button triggered the form submit.
    function choosePath(event) {
        event.preventDefault();
        if (document.activeElement.id === "create") {
            handleSubmit();
        }
        else {
            resetCountdown();
            handleEstimate();
        }
    }


    infoForm.onsubmit = choosePath;
    for (var checkbox of checkboxes) {
        checkbox.onchange = handleLangCheckboxes;
    }

    startCountdown.addEventListener('click', () => {
        // console.log("clicked");
        handleCountdown(globalData.total_time);
        toggleCountdown.disabled = false;
        startCountdown.disabled = true;
    })


    toggleCountdown.addEventListener('click', () => {
        countdownPause();
    })

    stopCountdown.addEventListener('click', () => {
        resetCountdown();
        displayEstimate(globalData.total_time.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        }) + ":00");
        toggleCountdown.innerText = "Pause Countdown"
        toggleCountdown.disabled = true;
        startCountdown.disabled = false;
    })

}


// Yay 500 lines.
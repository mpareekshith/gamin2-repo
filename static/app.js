let selectedTheme = "";
let recentResponse = "";
let isSpeaking = false;
let currentSpeech = null;

const handleSelectTheme = (theme) => {
  selectedTheme = theme;
  /*
   *Hide Welcome page ->
   *hid welcome pge by setting display to none and
   * welcome page is identifed by its id
   */
  document.getElementById("welcomePage").style.display = "none";

  /*
   *Defin array for all theme
   *themescreen have all the id which are available
   *thi array will be used to hide theme screen
   */
  const themeScreens = [
    "fantasyScreen",
    "sciFiScreen",
    "mysteryScreen",
    "AdventureScreen",
    "HorrorScreen",
    "HistoricalScreen",
  ];

  /*
   *Hide all theme screen ->
   * iterate all teh id in themescreen using foreach
   * set all scren style to none to hide
   */
  themeScreens.forEach((screen) => {
    document.getElementById(screen).style.display = "none";
  });

  /*
   * Display descriptin screen for selectde theme
   *all ids for selected theem description will be dynamicalyl added
   * description screen set to flex to make it visibel
   */
  document.getElementById(`${theme}DescriptionScreen`).style.display = "flex";
};

const handleStartGame = (theme) => {
  /*
   * Hide description screen ->
   * Will append DescriptionScreen  to the theem  will be hidden by setting display as none, and for visiblity will set it to block
   */
  document.getElementById(theme + "DescriptionScreen").style.display = "none";

  document.getElementById(theme + "Screen").style.display = "block";

  /*
   *add event lister to enter ket
   *enable inpuut functionaly fot ensuring the user can intect with game by using enter ket
   */
  addEnterKeyListener(theme);
};

const addEnterKeyListener = (theme) => {
  /*
   *Select user input fieeld->
   *Input field of selected theem will be identified by the userinput which is appeneded
   */
  const userInputField = document.getElementById(`${theme}UserInput`);

  /*
   * Add event listner to enter key
   * to detect keypress added an event listner
   * Once user clicks an enter ket the submitInput will be passed with theme as argu to function
   */
  userInputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      handleSubmitInput(theme);
    }
  });
};

const handleSubmitInput = async (theme) => {
  /*
   * Get back user input
   *take input filed value dor selecteed them by fetchinng id
   */
  const userInput = document.getElementById(`${theme}UserInput`).value;

  /*
   * Validate user data
   * Alert a message if the input is empty or contains empty space
   * prompt user if user does not have the valid command and retunr it
   */
  if (userInput.trim() === "") {
    alert("Please enter a valid command!");
    return;
  }

  /*
   * select reponse box
   *idemtify the selected theme by its id it will be created by appending the response box to theme name
   */
  const responseDiv = document.getElementById(`${theme}ResponseBox`);

  try {
    /*
     * Send user data to BE
     */
    const response = await fetch("https://gamin2-repo-3.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userInput,
        theme: theme,
        recent_response: recentResponse,
      }),
    });

    /*
     *Handle BE data
     * server will send parsed json data then store it and display in the screen and clear the input fied
     */
    const data = await response.json();
    if (data.gpt_response) {
      recentResponse = data.gpt_response;

      // append user entered data tand gpt respo to respinse box
      responseDiv.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
      responseDiv.innerHTML += `<p><strong>Game:</strong> ${recentResponse}</p>`;

      // clear input filed once it submitted
      document.getElementById(`${theme}UserInput`).value = "";

      //scroll to bottom after updating
      handleScrollToBottom(theme);
    } else if (data.error) {
      responseDiv.innerHTML += `<p><strong>Error:</strong> ${data.error}</p>`;
    }
  } catch (error) {
    responseDiv.innerHTML += `<p><strong>Error:</strong> Unable to communicate with the server.</p>`;
  }
};

const handleScrollToBottom = (theme) => {
  //get the respo box id
  const responseBox = document.getElementById(`${theme}ResponseBox`); // Get the response box by ID

  //set scroll posi to bootoom
  responseBox.scrollTop = responseBox.scrollHeight; // Set scroll position to the bottom
};

const handleTextToSpeech = (text) => {
  /*
   * test if text to speeach is supporteeed in web
   */
  if ("speechSynthesis" in window) {
    currentSpeech = new SpeechSynthesisUtterance(text);

    // set the language to british englis
    currentSpeech.lang = "en-GB";

    //  add eveent listner to know when speech end to help update the icon

    currentSpeech.onend = function () {
      isSpeaking = false;
      document.getElementById("speakButton").innerHTML = "&#x1F50A;";
    };

    //  call the api with current speaach object to initialte speak
    window.speechSynthesis.speak(currentSpeech);
  } else {
    console.log("Text-to-Speech not supported in this browser.");
  }
};

const handleSpeake = (theme) => {
  //  toggle speeach button by theme name ,theme name will append with speakbutton

  const speakButton = document.getElementById(`${theme}SpeakButton`);

  /*
   *if isspeaking is true  stop speak explination
   *if it is not update the button icon to tell it's on
   */

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    speakButton.innerHTML = "&#x1F50A;";
  } else {
    /*
     * if the recent response is there then call handlespeeachfunction
     *to conver the respo to speeach set isspeaking to false to indicate speaker is off
     */
    if (recentResponse) {
      handleTextToSpeech(recentResponse, theme);
      isSpeaking = true;
      speakButton.innerHTML = "&#x1F507;";
    }
  }
};

const handleBackButtonClicked = () => {
  // this function retrivees reference to all the screen using ther id
  const welcomePage = document.getElementById("welcomePage");
  const descriptionScreen = document.getElementById(
    `${selectedTheme}DescriptionScreen`
  );
  const gameScreen = document.getElementById(`${selectedTheme}Screen`);
  const responseBox = document.getElementById(`${selectedTheme}ResponseBox`);

  // if isspeaking in true then speech is cancelled if it is false update the icon to indicate the speaker is on
  if (isSpeaking) {
    window.speechSynthesis.cancel(); // Stop the speech
    isSpeaking = false;
    document.getElementById(`${selectedTheme}SpeakButton`).innerHTML =
      "&#x1F50A;";
  }

  if (responseBox) {
    //clear data in respo box
    responseBox.innerHTML = "";
  }
  // if current screen is gaame screen it is hidden
  if (gameScreen && gameScreen.style.display === "block") {
    console.log("Currently on Game Screen. Going back to Description Screen.");
    gameScreen.style.display = "none"; // hide decriptiooon screen
    descriptionScreen.style.display = "flex"; //show descrip show
  } else if (descriptionScreen && descriptionScreen.style.display === "flex") {
    //if current screen is decription screen it will be hidden and welcoome page is displaayed
    console.log("Currently on Description Screen. Going back to Welcome Page."); // Debugging log
    descriptionScreen.style.display = "none";
    welcomePage.style.display = "block";
  } else {
    console.log("No valid screen found to go back from.");
  }
};

let slideIndex = 0;

//store the slder class in variible
const slides = document.querySelectorAll(".slide");

// basked on the slideindex it will show the curren slide and index will change after 4 sec
const handleSlideShow = () => {
  //iterate all slide and set to none to hide
  slides.forEach((slide) => (slide.style.display = "none"));

  //increment the slide index using module opeator
  slideIndex = (slideIndex + 1) % slides.length;

  // make current slide visible by stetting it to bloock
  slides[slideIndex].style.display = "block";

  // after 4 sc the slide will change
  setTimeout(handleSlideShow, 4000);
};

// once  page is loaded start tht slide show
document.addEventListener("DOMContentLoaded", handleSlideShow);

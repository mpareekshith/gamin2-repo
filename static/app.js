let selectedTheme = "";
let recentResponse = "";
let isSpeaking = false;
let currentSpeech = null;

const handleSelectTheme = (theme) => {
  selectedTheme = theme;
  /*
   *hid welcome pge by setting display to none and it will identified by its id
   *then define array for  themescreen have all the id which are available
   *this array will be used to hide theme screen
   * iterate all theme id in themescreen using foreach and set it to none to hide
   *all ids for selected theem description will be dynamicalyl added and set it tp flex to make it visible
   */
  document.getElementById("welcomePage").style.display = "none";

  const themeScreens = [
    "fantasyScreen",
    "sciFiScreen",
    "mysteryScreen",
    "AdventureScreen",
    "HorrorScreen",
    "HistoricalScreen",
  ];

  themeScreens.forEach((screen) => {
    document.getElementById(screen).style.display = "none";
  });

  document.getElementById(`${theme}DescriptionScreen`).style.display = "flex";
};

const handleStartGame = (theme) => {
  /*
   * Will append subscriptionscreen to the theme will be hidden by setting display as none, and for visiblity will set it to block
   *enable inpuut functionaly fot ensuring the user can intect with game by using enter kety
   */
  document.getElementById(theme + "DescriptionScreen").style.display = "none";
  document.getElementById(theme + "Screen").style.display = "block";

  addEnterKeyListener(theme);
};

const addEnterKeyListener = (theme) => {
  /*
   *Select user input fieeld->
   *select user input field and it will be selected theem will be identified by the userinput which is appeneded
   * to detect keypress added an event listner
   * once user press then enter key submit input will passed with theme argument to function
   */
  const userInputField = document.getElementById(`${theme}UserInput`);

  userInputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      handleSubmitInput(theme);
    }
  });
};

const handleSubmitInput = async (theme) => {
  /*
   *get user input and take input filed value for selecteed them by fetchinng id
   * Alert a message if the input is empty or contains empty space
   * prompt user if user does not have the valid command and retunr it
   * idemtify the selected theme by its id it will be created by appending the response box to theme name
   * Send user data to BE
   * server will send parsed json data then store it and display in the screen and clear the input fied
   */
  const userInput = document.getElementById(`${theme}UserInput`).value;

  if (userInput.trim() === "") {
    alert("Please enter a valid command!");
    return;
  }

  const responseDiv = document.getElementById(`${theme}ResponseBox`);

  try {
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

    const data = await response.json();
    if (data.gpt_response) {
      recentResponse = data.gpt_response;

      /*
       * append user entered data then gpt respo to response box and clear input field
       *once it submitted later
       *scroll to bottom after updating
       */

      responseDiv.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
      responseDiv.innerHTML += `<p><strong>Game:</strong> ${recentResponse}</p>`;

      document.getElementById(`${theme}UserInput`).value = "";

      handleScrollToBottom(theme);
    } else if (data.error) {
      responseDiv.innerHTML += `<p><strong>Error:</strong> ${data.error}</p>`;
    }
  } catch (error) {
    responseDiv.innerHTML += `<p><strong>Error:</strong> Unable to communicate with the server.</p>`;
  }
};

const handleScrollToBottom = (theme) => {
  /*
   *get the respo box id later get respnse box by id then scroll to bottom
   */
  const responseBox = document.getElementById(`${theme}ResponseBox`);
  responseBox.scrollTop = responseBox.scrollHeight;
};

const handleTextToSpeech = (text) => {
  /*
   * test if text to speeach is supporteeed in web later set lnaguage to british englis then
   * add event listner to know when speach ends then update the icon later
   * call the api with current speaach object to initialte speak
   */
  if ("speechSynthesis" in window) {
    currentSpeech = new SpeechSynthesisUtterance(text);

    currentSpeech.lang = "en-GB";

    currentSpeech.onend = function () {
      isSpeaking = false;
      document.getElementById("speakButton").innerHTML = "&#x1F50A;";
    };

    window.speechSynthesis.speak(currentSpeech);
  } else {
    console.log("Text-to-Speech not supported in this browser.");
  }
};

const handleSpeake = (theme) => {
  /*
   * toggle speeach button by theme name ,theme name will append with speakbutton,
   * if speaking is true it will stop explaining if it false it will update button icon to show it is on
   */
  const speakButton = document.getElementById(`${theme}SpeakButton`);

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
  //

  /*
   * this function retrivees reference to all the screen using ther id
   * if isspeaking in true then speech is cancelled if it is false update the icon to indicate the speaker is on
   */

  const welcomePage = document.getElementById("welcomePage");
  const descriptionScreen = document.getElementById(
    `${selectedTheme}DescriptionScreen`
  );
  const gameScreen = document.getElementById(`${selectedTheme}Screen`);
  const responseBox = document.getElementById(`${selectedTheme}ResponseBox`);

  if (isSpeaking) {
    window.speechSynthesis.cancel();
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

const handleSlideShow = () => {
  /*
   * iterate all slide and set to none to hide then increment slide index usinf
   *module operator later set it to block to make it visible
   *after 4 sec the slide will change
   */
  slides.forEach((slide) => (slide.style.display = "none"));

  slideIndex = (slideIndex + 1) % slides.length;

  slides[slideIndex].style.display = "block";

  setTimeout(handleSlideShow, 4000);
};

// once  page is loaded start tht slide show
document.addEventListener("DOMContentLoaded", handleSlideShow);

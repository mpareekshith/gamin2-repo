let selectedTheme = "";
let recentResponse = ""; // Variable to store the most recent GPT response
let isSpeaking = false; // Variable to track if speech is ongoing
let currentSpeech = null; // Variable to hold the SpeechSynthesisUtterance object

// Function to handle theme selection
function selectTheme(theme) {
  selectedTheme = theme; // Store the selected theme
  document.getElementById("welcomePage").style.display = "none"; // Hide the welcome page

  // Hide all theme screens
  const themeScreens = [
    "fantasyScreen",
    "sciFiScreen",
    "mysteryScreen",
    "AdventureScreen",
    "HorrorScreen",
    "HistoricalScreen",
  ];

  themeScreens.forEach((screen) => {
    styleNone(screen); // Hide all themes
  });
  // Show the selected theme's description screen
  themePosition(`${theme}DescriptionScreen`, "flex");
}

// Function to add "Enter" key event listener to the user input field
const addEnterKeyListener = (theme) => {
  const userInputField = document.getElementById(`${theme}UserInput`);
  // Listen for Enter key in the user input field
  userInputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      submitInput(theme); // Trigger the submit function when "Enter" is pressed
    }
  });
};

// Function for starting game
const startGame = (theme) => {
  // hiding  description screen
  styleNone(theme + "DescriptionScreen");

  // Show the selected theme's game screen
  themePosition(theme + "Screen", "block");

  addEnterKeyListener(theme); // Add listener for the game screen
};

// Function to handle input submission for the selected theme
const submitInput = async (theme) => {
  const userInput = document.getElementById(`${theme}UserInput`).value; // Get user input

  if (userInput.trim() === "") {
    //alert for empty input
    alert("Please enter a valid command!");
    return;
  }

  const responseDiv = document.getElementById(`${theme}ResponseBox`); // Response box for displaying messages

  try {
    // Send the user input and recent response to the backend
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
      recentResponse = data.gpt_response; // Store the most recent response

      // Display the user's input and GPT's response on the screen
      responseDiv.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
      responseDiv.innerHTML += `<p><strong>Game:</strong> ${recentResponse}</p>`;

      // Clear  input field
      document.getElementById(`${theme}UserInput`).value = "";
      // Scroll  response box
      scrollToBottom(theme);
    } else if (data.error) {
      responseDiv.innerHTML += `<p><strong>Error:</strong> ${data.error}</p>`;
    }
  } catch (error) {
    responseDiv.innerHTML += `<p><strong>Error:</strong> Unable to communicate with the server.</p>`;
  }
};
// Function to scroll the response box to the bottom
const scrollToBottom = (theme) => {
  const responseBox = document.getElementById(`${theme}ResponseBox`); // Get the response box by ID
  responseBox.scrollTop = responseBox.scrollHeight; // Set scroll position to the bottom
};
// Function to speak or stop speaking the  response
const speakResponse = (theme) => {
  const speakButton = document.getElementById(`${theme}SpeakButton`);

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    speakButton.innerHTML = "&#x1F50A;";
  } else {
    if (recentResponse) {
      textToSpeech(recentResponse, theme);
      isSpeaking = true;
      speakButton.innerHTML = "&#x1F507;";
    }
  }
};
// Function to convert GPT response to speech using Web Speech API
const textToSpeech = (text) => {
  if ("speechSynthesis" in window) {
    // Check if the browser supports TTS
    currentSpeech = new SpeechSynthesisUtterance(text);
    currentSpeech.lang = "en-GB";

    currentSpeech.onend = function () {
      // Reset speaking state when speech ends
      isSpeaking = false;
      document.getElementById("speakButton").innerHTML = "&#x1F50A;";
    };

    window.speechSynthesis.speak(currentSpeech);
  } else {
    console.log("Text-to-Speech not supported in this browser.");
  }
};

// Back button functionality
const goBack = () => {
  // Define references to key elements
  const welcomePage = document.getElementById("welcomePage");
  const descriptionScreen = document.getElementById(
    `${selectedTheme}DescriptionScreen`
  );
  const gameScreen = document.getElementById(`${selectedTheme}Screen`);
  const responseBox = document.getElementById(`${selectedTheme}ResponseBox`);
  if (isSpeaking) {
    window.speechSynthesis.cancel(); // Stop the speech
    isSpeaking = false;
    document.getElementById(`${selectedTheme}SpeakButton`).innerHTML =
      "&#x1F50A;"; //
  }

  // Clear the response box oon click of back
  if (responseBox) {
    responseBox.innerHTML = "";
  }

  // Check  Game Screen is in use
  if (gameScreen && gameScreen.style.display === "block") {
    console.log("Currently on Game Screen. Going back to Description Screen.");
    gameScreen.style.display = "none"; // Hide  Game Screen
    descriptionScreen.style.display = "flex"; // Show  Description Screen
  }
  // Check  Description Screen is in use
  else if (descriptionScreen && descriptionScreen.style.display === "flex") {
    console.log("Currently on Description Screen. Going back to Welcome Page.");
    descriptionScreen.style.display = "none"; // Hide  Description Screen
    welcomePage.style.display = "block"; // Show  Welcome Page
  } else {
    console.log("No valid screen found to go back from.");
  }
};

const showSlides = () => {
  slides.forEach((slide) => (slide.style.display = "none")); // Hide  slides
  slideIndex = (slideIndex + 1) % slides.length; // Increment index with wrap-around
  slides[slideIndex].style.display = "block"; // Show the current slide
  setTimeout(showSlides, 4000); // Change slide every 4 seconds
};

// Start the slideshow on page load
document.addEventListener("DOMContentLoaded", showSlides);

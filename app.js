// Initialize the selected theme variable
let selectedTheme = "";
let recentResponse = ""; // Variable to store the most recent GPT response
let isSpeaking = false; // Variable to track if speech is ongoing
let currentSpeech = null; // Variable to hold the SpeechSynthesisUtterance object

// Function to handle theme selection
function selectTheme(theme) {
    selectedTheme = theme; // Store the selected theme
    document.getElementById("welcomePage").style.display = "none"; // Hide the welcome page

    // Hide all theme screens
    const themeScreens = ["fantasyScreen", "sciFiScreen", "mysteryScreen", "AdventureScreen", "HorrorScreen", "HistoricalScreen"];
    themeScreens.forEach(screen => {
        document.getElementById(screen).style.display = "none"; // Hide all theme screens
    }); 
    // Show the selected theme's description screen
    document.getElementById(`${theme}DescriptionScreen`).style.display = 'flex';
}

// New functionality to start the game
function startGame(theme) {
    // Hide the description screen
    document.getElementById(theme + 'DescriptionScreen').style.display = 'none';
    
    // Show the selected theme's game screen
    document.getElementById(theme + 'Screen').style.display = 'block';
 // Add event listener for the "Enter" key on the user input field
    addEnterKeyListener(theme); // Add listener for the game screen
}

// Function to add "Enter" key event listener to the user input field
function addEnterKeyListener(theme) {
    const userInputField = document.getElementById(`${theme}UserInput`);
 // Listen for Enter key in the user input field
    userInputField.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            submitInput(theme); // Trigger the submit function when "Enter" is pressed
        }
    });
}

// Function to handle input submission for the selected theme
async function submitInput(theme) {
    const userInput = document.getElementById(`${theme}UserInput`).value; // Get user input from the corresponding input field
    
    if (userInput.trim() === "") {
        // Display an alert for empty input
        alert("Please enter a valid command!");
        return;  // Don't proceed if the input is empty
    }

    const responseDiv = document.getElementById(`${theme}ResponseBox`); // Response box to display messages

    try {
        // Send the user input to the backend
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: userInput, theme: theme })
        });

        const data = await response.json();
        if (data.gpt_response) {
            recentResponse = data.gpt_response; // Store the most recent response

            const gptResponse = recentResponse;

            // Display the user's input and GPT's response on the screen
            responseDiv.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
            responseDiv.innerHTML += `<p><strong>Game:</strong> ${recentResponse}</p>`;

            // Call the function to convert GPT response to speech
            textToSpeech(recentResponse);

            // Clear the input field
            document.getElementById(`${theme}UserInput`).value = '';
        } else if (data.error) {
            responseDiv.innerHTML += `<p><strong>Error:</strong> ${data.error}</p>`;
        }
    } catch (error) {
        responseDiv.innerHTML += `<p><strong>Error:</strong> Unable to communicate with the server.</p>`;
    }
}
// Function to speak or stop speaking the most recent response
function speakResponse(theme) {
    const speakButton = document.getElementById(`${theme}SpeakButton`);

    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        speakButton.innerHTML = '&#x1F50A;'; // Change to speaker on icon
    } else {
        if (recentResponse) {
            textToSpeech(recentResponse, theme);
            isSpeaking = true;
            speakButton.innerHTML = '&#x1F507;'; // Change to speaker off icon
        }
    }
}
// Function to convert GPT response to speech using Web Speech API
function textToSpeech(text) {
    if ('speechSynthesis' in window) {  // Check if the browser supports TTS
        currentSpeech = new SpeechSynthesisUtterance(text);  // Create a SpeechSynthesisUtterance object
        currentSpeech.lang = 'en-GB';  // Set the language to British English

        currentSpeech.onend = function() { // Reset speaking state when speech ends
            isSpeaking = false;
            document.getElementById('speakButton').innerHTML = '&#x1F50A;'; // Change button back to speaker on icon
        };

        window.speechSynthesis.speak(currentSpeech);  // Speak the text
    } else {
        console.log("Text-to-Speech not supported in this browser.");
    }
}

// Back button functionality
function goBack() {
console.log("Back button clicked"); // Log when back button is clicked

    // Define references to key elements
    const welcomePage = document.getElementById("welcomePage");
    const descriptionScreen = document.getElementById(`${selectedTheme}DescriptionScreen`);
    const gameScreen = document.getElementById(`${selectedTheme}Screen`);

    // Check if we are on the Game Screen
    if (gameScreen && gameScreen.style.display === "block") {
        console.log("Currently on Game Screen. Going back to Description Screen."); // Debugging log
        gameScreen.style.display = "none"; // Hide the Game Screen
        descriptionScreen.style.display = "flex"; // Show the Description Screen
    } 
    // Check if we are on the Description Screen
    else if (descriptionScreen && descriptionScreen.style.display === "flex") {
        console.log("Currently on Description Screen. Going back to Welcome Page."); // Debugging log
        descriptionScreen.style.display = "none"; // Hide the Description Screen
        welcomePage.style.display = "block"; // Show the Welcome Page
    } 
    // If neither, log an issue
    else {
        console.log("No valid screen found to go back from."); // Debugging log
    }
}
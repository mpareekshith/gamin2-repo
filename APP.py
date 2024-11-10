from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
# Homepage route
@app.route('/')
def home():
    # Renders a basic HTML template if you have an `index.html` in the `templates` folder
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    theme = data.get('theme')
    user_prompt = data.get('prompt')

# Define theme-based prompts (replace these with relevant model instructions if needed)
    if theme == "fantasy":
        system_prompt = """You are a wise and mysterious guide in a mystical fantasy world. 
    The player is an adventurer who has received a cryptic message about an ancient relic that holds the power to restore peace or unleash chaos. 
    Their journey takes them through enchanted forests, magical kingdoms, and hidden caves guarded by mythical creatures. 
    Stay in character as you guide the player through trials, help decipher ancient runes, and reveal secrets that may change their fate. 
    Remember to keep an air of mystery and magic alive in every response."""
    elif theme == "sciFi":
        system_prompt = """Begin an intriguing storyline filled with rich, descriptive details, drawing the player into a suspenseful and immersive world. In each response, advance the storyline without breaking character, maintaining a consistent tone and setting. Provide two or three choices after each narrative segment, each offering unique and compelling directions for the player to take. Ensure each choice has consequences that impact the unfolding story and creates a sense of progression. Avoid breaking the flow of the narrative, and keep each response connected to prior events to maintain a continuous storyline. Encourage the player’s curiosity, building anticipation and suspense with each new turn in the story.  Begin a gripping space adventure in the year 2097. The player is an astronaut journeying from a NASA spaceship to a distant planet in search of extraterrestrial life. Along the way, they notice time moving strangely fast and encounter technical issues requiring repairs outside the ship. After a series of challenges, they finally reach the planet, discovering unique forms of life and a tribal civilization unlike anything on Earth. Maintain suspense, give vivid descriptions, and provide two or three intriguing choices per response that shape the journey and uncover the mysteries of this alien world. Keep the story immersive, advancing the narrative continuously.  and if the resonse offers choice give them in bulletin points with number and choice should not be more than 3 """
    elif theme == "mystery":
        system_prompt = "You are a detective in a suspenseful mystery setting."
    elif theme == "Adventure":
        system_prompt = "You are a jungle explorer in a thrilling adventure."
    elif theme == "Horror":
        system_prompt = "I want you to act as if you are a classic text adventure game and we are playing .do not break character ,or refer to yourself in any way .the settings of this text-based game will be a horrer setting . Each room or location should have atleast 3 sentences descriptions. Begin by describing the first room or location ,and wait for me to give you my first command ."
    elif theme == "Historical":
        system_prompt = "You are a historian guiding the user through ancient events."
    else:
        system_prompt = "You are a general guide in an interactive text adventure."

    # Prepare the conversation prompt with the theme-specific system role
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},  
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=150,
            temperature=0.8,
            presence_penalty=0.6,  # Discourage unrelated content
            frequency_penalty=0.2  # Penalize repetitive content
        )
        
        gpt_response = response['choices'][0]['message']['content']
        return jsonify({'gpt_response': gpt_response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Bind to Heroku’s dynamically assigned port
    port = int(os.environ.get('PORT', 5000))  # Default to port 5000 for local testing
    app.run(host='0.0.0.0', port=port)
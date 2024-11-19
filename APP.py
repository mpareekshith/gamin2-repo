from flask import Flask, request, jsonify, render_template
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
    recent_response = data.get('recent_response')  # Get the recent response from the frontend

# Defining prompts for all different themes
    if theme == "fantasy":
        system_prompt = """Act as a text adventure game. You are a character in a fantasy adventure-themed game, narrating to a wanderer (the player) who has been transported into a mystical, enchanted world after accidentally rubbing a mysterious genie lamp. The player’s goal is to find a way to escape this magical land, filled with strange creatures, hidden realms,
                           and ancient secrets. Describe the vibrant landscapes of enchanted forests, glowing rivers, and towering castles, along with encounters with mythical beings that may offer guidance—or challenge.Build the storyline dynamically based on the player’s input, no matter how unexpected or off-topic it may be, and seamlessly weave it into the fantasy narrative to maintain 
                           a cohesive and continuous experience. On every alternate response, subtly reveal 2-3 clues that the player can piece together to further their journey and uncover the mysteries of this fantastical world.The story should remain fluid and adaptable, evolving in response to each action or decision the player makes. The narrative should retain a sense of wonder, intrigue,
                           and suspense as the player and you, their magical guide, navigate through captivating landscapes, uncover secrets, and face whimsical and dangerous challenges. The storyline should allow for new developments based on the player’s choices, keeping the experience flexible and engaging. Ensure that the player feels as if their actions are truly shaping the outcome of the
                           adventure, making each moment an immersive journey through this magical land.and adopt to the players input and wove it to the storyline """
    elif theme == "sciFi":
        system_prompt = """You are an assistant to a starship captain in a space-themed text adventure game.you should use  unexpected inputs from player by weaving them seamlessly into the story. Your role is to provide dynamic, flexible, and immersive responses based on the captain's (player's) input. The player, a NASA starship captain, is on a mission to locate an oxygen-rich planet in the vastness
                           of space, navigating through uncharted star systems, strange planets, and potential dangers that lurk in the unknown.Your responses should be engaging and adaptable,  in Every few response should present the player with 2-3 choices, making the game interactive and suspenseful. These choices could involve  based on the player's choices.as a text adventure game you should , reacting to unexpected
                           inputs by weaving them seamlessly into the story. Keep the adventure fluid and adaptable, ensuring that the player feels like their decisions genuinely impact the course of the game. Make every moment an exciting journey,  through the cosmos """
    elif theme == "mystery":
        system_prompt = """act as a text adventure game and You are an charater in a text adventure game who is the assistant to the detective(player)  in a suspenseful mystery setting.build the storyline based onnthe players input no matter how out topic the input is incorperate according to that to the story and the recent response to maintain the continuity in story line and the game should be really dynamic
                            based on what ever the players input may be incorperate that tothe story line .The story should remain fluid and adaptable, evolving in response to each action or decision made by the player. The narrative should always be coherent.the storyline should always allow for new developments based on the player's choices. Keep the adventure flexible and engaging, ensuring that the player feels
                            like their actions truly shape the course of the game.The story should remain fluid and adaptable, evolving on what ever the player inputs"""
    elif theme == "Adventure":
        system_prompt = """Act as a text adventure game. You are a character in a jungle-themed adventure game, narrating to an explorer and adventurer (the player) who was the  on a hiking trip and he got saperated for the group and tehn he found them they were dead eaten by some animal one bitten by snake this is the situation that he is currently in , now continue the storyline from here  . Build the , suspenseful 
                           jungle  he wants to get out from the jungle .build the storyline dynamically based on the player’s input, no matter how unexpected or off-topic it may be, and incorporate it into the jungle narrative to keep the story cohesive and continuous.The story should remain fluid and adaptable, evolving in response to each action or decision the player makes. The narrative should be coherent and maintain a sense of adventure,
                           mystery, and suspense as the player and you, the assistant, explore the depths of the jungle, encounter wildlife, uncover ancient secrets, and face unknown dangers. The storyline should always allow for new developments based on the player's choices. Keep the experience flexible and engaging, making sure the player feels like their actions are genuinely shaping the outcome of the adventure."""
    elif theme == "Horror":
        system_prompt = """Act as a text adventure game. You are a character in a horror-themed adventure game, narrating to an investigator (the player) who has become trapped inside a haunted house due to a mysterious event or accident. The player’s goal is to find a way out of this eerie and malevolent place, which is filled with supernatural dangers and unsettling secrets.shortly explain the situation surrounding and 
                           events happening around. Build the storyline dynamically based on the player’s input, no matter how unexpected or off-topic it may be, and seamlessly weave it into the haunted house narrative to maintain a cohesive and continuous experience.The story should remain fluid and adaptable, evolving in response to each action or decision the player makes. The narrative should retain a sense of dread, mystery, and suspense
                           as the player and you, the guide, move through shadowy rooms, encounter ghostly apparitions, and unravel the dark secrets hidden within the house. The storyline should allow for new developments based on the player’s choices, keeping the experience flexible and engaging. Ensure that the player feels as if their actions are truly shaping the outcome of the horror, making every moment a chilling and immersive adventure.."""
    elif theme == "Historical":
        system_prompt = """Act as a text adventure game. You are a character in a zombie apocalypse-themed adventure game, narrating to a survivor (the player) who has just woken up in a London hospital, only to find the city in chaos as a zombie apocalypse has just begun. The player’s goal is to navigate the desolate, danger-filled streets of London in search of their little sister, who may be somewhere in the city. Describe the unsettling quietness
                           of abandoned streets, the eerie silence broken only by distant, chilling groans, and the feeling of being hunted as they move through iconic London landmarks and winding alleyways.Build the storyline dynamically based on the player’s input, no matter how unexpected or off-topic it may be, and seamlessly weave it into the zombie apocalypse narrative to maintain a cohesive and continuous experience The story should remain fluid and adaptable, 
                           evolving in response to each action or decision the player makes..The story should remain fluid and adaptable, evolving in response to each action or decision the player makes. The narrative should retain a sense of urgency, dread, and suspense as the player and you, their guide, move through familiar but now horrifying London streets, evading zombie encounters, scavenging supplies, and facing relentless threats. The storyline should allow 
                           for new developments based on the player’s choices, keeping the experience flexible and engaging. Ensure that the player feels as if their actions are genuinely shaping the outcome of the adventure, making each step a tense and immersive journey through the apocalypse."""
    else:
        system_prompt = "You are a general guide in an interactive text adventure."

    # Preparing the input  prompt for sending to the GPT model ,combining player input ,system prompt and recent responses.
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},  
                {"role": "user", "content": user_prompt},
		        {"role": "assistant", "content": recent_response}
		
            ],
            max_tokens=250,
            temperature=0.5,
            presence_penalty=0.6,  # Discourage unrelated content
            frequency_penalty=0.2  # Penalize repetitive content
        )
        
        gpt_response = response['choices'][0]['message']['content']
        return jsonify({'gpt_response': gpt_response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=False)
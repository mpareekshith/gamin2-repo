from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    theme = data.get('theme')
    user_prompt = data.get('prompt')

# Define theme-based prompts (replace these with relevant model instructions if needed)
    if theme == "fantasy":
        system_prompt = "You are a guide in a mystical fantasy world."
    elif theme == "sciFi":
        system_prompt = "You are a spaceship AI in a futuristic sci-fi world."
    elif theme == "mystery":
        system_prompt = "You are a detective in a suspenseful mystery setting."
    elif theme == "Adventure":
        system_prompt = "You are a jungle explorer in a thrilling adventure."
    elif theme == "Horror":
        system_prompt = "You are in a haunted house helping the user escape."
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
            temperature=0.7,
            presence_penalty=0.6,  # Discourage unrelated content
            frequency_penalty=0.2  # Penalize repetitive content
        )
        
        gpt_response = response['choices'][0]['message']['content']
        return jsonify({'gpt_response': gpt_response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

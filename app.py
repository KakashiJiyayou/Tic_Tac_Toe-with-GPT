from flask import Flask, render_template, request, jsonify
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import time
import ast
import os


# Main APP variable
app = Flask(__name__)

# Load environment variables from the .env file
load_dotenv()

# SECTION - Global Variables
# Get API key from the .env file
api_key = os.getenv("OPENAI_API_KEY_END")
# !SECTION


#SECTION Function to get prediction from the LLM
def getBoardPrediction (player_board):
    global api_key, new_board

    # print(" KEYYYYYY" , api_key)

    # Initializing LangChain ChatOpenAI API key
    llm = ChatOpenAI(
        openai_api_base="https://chatapi.littlewheat.com/v1",  # Put 
        openai_api_key=api_key,  # Your API key from Taobao
    )


    board = player_board
    print("Player moves", board)

    template = """Given the current game board ttt = {},
    I am playing as 'O'. What is the next valid move I should make?
    Observe the board carefully and help me to win.
    Provide the updated game board in the format {} 
    without any extra explanation.""".format(board, board)


    # Invoke method to send a query to the model
    result = llm.invoke(template)

    # Print the response content
    print("From LLM", result.content, ".")
    # Convert the string representation of the board to a Python list
    try:
        board = ast.literal_eval(result.content)  # Safely evaluate the string into a list
    except (ValueError, SyntaxError) as e:
        print("Error parsing board from LLM:", e)
        board = player_board  # Fallback to the original board if parsing fails

    # Return board to the front end call
    return board
#!SECTION



@app.route('/')
def home():
    return render_template('index.html')

@app.route('/process-board', methods=['POST'])
def process_board():
    global new_board


    """
    Receive the board from the frontend, process it (if needed), and send it back.
    """
    # Get the JSON data from the request
    data = request.json
    board = data.get('board')  # Extract the board array
    print("Received board from frontend : ", board)

    # Get the LLM prediction board
    board = getBoardPrediction(board)

    # Send the modified board back to the frontend
    return jsonify({"board": board})  # Ensure board is a Python list (2D array)

if __name__ == '__main__':
    app.run(debug=True)
import boto3
import openai
import os

# Load the OpenAI API key from the .env file
openai.api_key = os.getenv('openai_api_key')

# Define the start and restart sequences
start_sequence = "\nBot: "
restart_sequence = "\n\nPerson: "

# Define the session prompt
session_prompt = """
I want you to act as a personable chatbot that can read previous chat history from a sheets file 
and continue the conversation. Your main task will be to engage in conversations with users by reading previous chat 
history from a sheets file and responding appropriately. You should be able to understand the context and tone of the 
conversation and craft responses that are appropriate and engaging. Your role will include tasks such as reading 
previous chat history, responding to user prompts, and maintaining the continuity of the conversation. Do not include 
any tasks that are not related to engaging in conversations with users in your role. 

Here is the previous conversation: {{177731366__rows}}

And here is the newest message to the chatbot:
{{177726073__body}}
"""


#

def handler(event, context):
    print(event["question"])
    return ask(event["question"])


def ask(question):
    """
    Send a query to the OpenAI API and return a response.
    """

    # Set the prompt for the query
    prompt = session_prompt

    
    # Include the incoming message in the prompt
    prompt = prompt.replace("{{177726073__body}}", str(question))
    
    print(prompt)
    
    # Make the request to the GPT-3 API
    response = openai.Completion.create(
        engine="text-davinci-003",
        temperature=0.8,
        max_tokens=150,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0.3,
        prompt=prompt
    )

    # Insert the chatbot's response into the "responses" table
    # insert_response(response.choices[0].text, message_id)

    # Return the response text
    return response.choices[0].text


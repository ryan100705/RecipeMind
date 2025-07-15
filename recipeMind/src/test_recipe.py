from google import genai
from google.genai import types

def start_chat():
    client = genai.Client(
        api_key="AIzaSyA7rCncXvneba63POJHqvGo_V_JS6aRR2Y",
    )

    model = "gemini-1.5-flash"

    print("Type 'exit' to quit.")
    contents = [
        types.Content(
            role="user", 
            parts=[types.Part.from_text(
                text="You are a helpful AI that ONLY gives food recipes on the user's input. Do not respond to anything not food related. For each recipe, give the macros"
            )]
        )
    ]

    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break

        
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=user_input)]
            )
        )

        
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
            )

            model_response = response.text.strip()
            print(f"\nGemini: {model_response}")

            
            contents.append(
                types.Content(
                    role="model",
                    parts=[types.Part.from_text(text=model_response)]
                )
            )

        except Exception as e:
            print(f"Error: {e}")
            break

if __name__ == "__main__":
    start_chat()

import base64
import os
from google import genai
from google.genai import types


def generate():
    client = genai.Client(
        api_key="AIzaSyA7rCncXvneba63POJHqvGo_V_JS6aRR2Y",
    )

    model = "gemma-3-27b-it"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""give me a high protein dinner that is easy to make """),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""Okay, here are a few high-protein, easy-to-make dinner ideas, ranging in effort/complexity. I'll give a quick overview, estimated protein content, and a link to a simple recipe for each.  I'll also note how quick they are!

**Important Note:** Protein needs vary based on individual factors (weight, activity level, etc.).  These are good *sources* of protein, but adjust portion sizes to meet *your* needs.  I'm estimating protein based on typical serving sizes.



**1. Sheet Pan Lemon Herb Chicken & Veggies (Quickest - ~30 mins)**

*   **Protein:** ~40-50g per serving (depending on chicken portion)
*   **Ease:** Super easy!  Minimal cleanup.
*   **Description:**  Chicken thighs (or breasts) and your favorite veggies (broccoli, bell peppers, zucchini, asparagus) tossed with lemon juice, herbs, and olive oil, then roasted on a single sheet pan.
*   **Recipe:** [https://downshiftology.com/recipes/sheet-pan-lemon-herb-chicken-and-veggies/](https://downshiftology.com/recipes/sheet-pan-lemon-herb-chicken-and-veggies/)

**Why it's good:**  Very little active cooking time.  Healthy and flavorful.  Easy to customize with different veggies.



**2.  Salmon with Roasted Asparagus (Fast - ~25 mins)**

*   **Protein:** ~30-40g per serving
*   **Ease:** Very easy.
*   **Description:** Salmon fillets seasoned simply (salt, pepper, garlic powder) and baked or pan-fried.  Asparagus roasted alongside.
*   **Recipe:** [https://www.allrecipes.com/recipe/21334/simple-roasted-salmon-and-asparagus/](https://www.allrecipes.com/recipe/21334/simple-roasted-salmon-and-asparagus/)

**Why it's good:** Salmon is packed with protein and healthy fats.  Asparagus is a quick-cooking, nutritious side.

**3.  Turkey or Chicken Stir-Fry (Medium - ~30-40 mins)**

*   **Protein:** ~35-45g per serving
*   **Ease:**  Relatively easy, but requires a bit of chopping.
*   **Description:**  Lean ground turkey or diced chicken breast stir-fried with your favorite veggies (broccoli, carrots, snap peas, bell peppers) and a simple soy sauce-based sauce. Serve over brown rice or quinoa.
*   **Recipe:** [https://www.simplyrecipes.com/recipes/chicken_stir_fry/](https://www.simplyrecipes.com/recipes/chicken_stir_fry/) (Can easily substitute turkey for chicken)

**Why it's good:**  Versatile – use whatever veggies you have on hand.  Quick cooking time once prepped.  Good way to get a lot of protein and veggies in one meal.

**4.  Lentil Soup (Slightly More Effort - ~45 mins, mostly simmering)**

*   **Protein:** ~18-25g per serving (Lentils are a great plant-based protein source!)
*   **Ease:**  Easy, but requires a bit more simmering time.  Mostly hands-off.
*   **Description:**  A hearty and flavorful soup made with lentils, vegetables (carrots, celery, onion), and broth.  Can be made vegetarian or with added sausage/chicken for extra protein.
*   """),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""Give me a good recipe for chicken"""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
    )

print("Starting generation...")
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")

if __name__ == "__main__":
    generate()


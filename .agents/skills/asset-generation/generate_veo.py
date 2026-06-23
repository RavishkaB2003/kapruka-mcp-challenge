import os
import sys
import time
from dotenv import load_dotenv

# Load environment variables from .env in the parent root directory
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
dotenv_path = os.path.join(project_root, '.env')
load_dotenv(dotenv_path)

# Verify API key exists
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY environment variable is not set in .env")
    sys.exit(1)

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Error: google-genai library is not installed.")
    print("Please install it: pip install google-genai dotenv")
    sys.exit(1)

def generate_video(prompt, output_path, model="veo-2.0-generate-001"):
    print(f"Initializing Gemini client with model: {model}...")
    client = genai.Client(api_key=api_key)
    
    print(f"Submitting video generation request...")
    print(f"Prompt: {prompt}")
    
    try:
        operation = client.models.generate_videos(
            model=model,
            prompt=prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio="16:9",
                resolution="720p",
                duration_seconds=5
            ),
        )
        
        print("Video generation started. Polling status (this can take 2-5 minutes)...")
        while not operation.done:
            time.sleep(15)
            print("Processing...", end="\r", flush=True)
            operation = client.operations.get(operation)
            
        print("\nGeneration finished! Downloading video...")
        generated_video = operation.response.generated_videos[0]
        client.files.download(file=generated_video.video)
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        generated_video.video.save(output_path)
        print(f"Video saved successfully to: {output_path}")
        
    except Exception as e:
        print(f"Error during video generation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    default_prompt = (
        "A close-up, slow-motion 5-second video loop of a minimalist linen gift box wrapped in textured warm alabaster paper, "
        "sitting on a soft stone surface. A terracotta-colored cotton ribbon is gently tied around it. Still-life studio setup, "
        "soft tropical leaf shadows in sage moss green, clean editorial e-commerce look, no text, no logos, no human hands."
    )
    
    video_prompt = sys.argv[1] if len(sys.argv) > 1 else default_prompt
    output_dir = os.path.join(project_root, 'public/assets/video')
    video_output = os.path.join(output_dir, 'veo_hero.mp4')
    
    generate_video(video_prompt, video_output)

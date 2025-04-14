from fastapi import FastAPI, Request
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

class Prompt(BaseModel):
    prompt: str
    temperature: float = 0.5
    max_tokens: int = 512

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/generate")
def generate_content(prompt: Prompt):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt.prompt,
        config=types.GenerateContentConfig(
            max_output_tokens=prompt.max_tokens,
            temperature=prompt.temperature,
        )
    )
    return {"content": response.text}

# Clé API par défaut (Groq) - peut être remplacée par l'utilisateur
API_KEY = ""

# Liste des providers disponibles (format OpenAI-compatible)
# Le système essaiera chaque provider dans l'ordre jusqu'à succès
PROVIDERS = [
    {
        "name": "Groq – DeepSeek R1",
        "id": "groq_deepseek",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "model": "deepseek-r1-distill-llama-70b",
        "api_key_env": "GROQ_API_KEY",  # clé saisie par l'utilisateur
    },
    {
        "name": "Groq – Llama 3.3 70B",
        "id": "groq_llama",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "model": "llama-3.3-70b-versatile",
        "api_key_env": "GROQ_API_KEY",
    },
    {
        "name": "Groq – Qwen QwQ 32B",
        "id": "groq_qwen",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "model": "qwen-qwq-32b",
        "api_key_env": "GROQ_API_KEY",
    },
    {
        "name": "Cerebras – Llama 3.3 70B",
        "id": "cerebras_llama",
        "url": "https://api.cerebras.ai/v1/chat/completions",
        "model": "llama-3.3-70b",
        "api_key_env": "CEREBRAS_API_KEY",
    },
    {
        "name": "Google – Gemini 2.0 Flash",
        "id": "google_gemini",
        "url": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "model": "gemini-2.0-flash",
        "api_key_env": "GOOGLE_API_KEY",
    },
]

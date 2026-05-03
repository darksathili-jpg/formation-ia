#!/usr/bin/env python3
"""
li_main.py — Orchestrateur principal de l'assistant Li
═══════════════════════════════════════════════════════
Wake word "Hello Li"
     ↓
Animation visage (IDLE → LISTENING)
     ↓
Enregistrement audio (~6s)
     ↓
Transcription Whisper (voix → texte)
     ↓
LLM Ollama (texte → réponse)     + THINKING animation
     ↓
Piper TTS (réponse → audio)      + SPEAKING animation bouche
     ↓
Retour IDLE
"""

import os
import sys
import time
import wave
import threading
import pyaudio
import ollama
from faster_whisper import WhisperModel

# Modules Li
from li_face  import LiFace, Emotion
from li_wake  import WakeWordDetector
from li_audio import PiperTTSEngine


# ══════════════════════════════════════════════════════════════════════════════
#  CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

CONFIG = {
    # Chemins
    "piper_path":  os.path.expanduser("~/ai-assistant/piper/piper"),
    "piper_model": os.path.expanduser("~/ai-assistant/piper/fr_FR-upmc-medium.onnx"),

    # Modèles IA
    "whisper_model": "small",          # tiny | base | small | medium
    "ollama_model":  "llama3.2:3b",    # llama3.2:3b | qwen2.5:3b | phi3:mini

    # Audio
    "sample_rate":    16000,
    "record_seconds": 6,

    # Personnalité de Li
    "system_prompt": (
        "Tu es Li, un assistant vocal sympathique et concis. "
        "Tu réponds toujours en français, de manière naturelle et conversationnelle. "
        "Tes réponses font 1 à 3 phrases maximum pour être agréables à écouter. "
        "Tu es curieux, bienveillant et légèrement enjoué."
    ),
}


# ══════════════════════════════════════════════════════════════════════════════
#  ASSISTANT LI
# ══════════════════════════════════════════════════════════════════════════════

class LiAssistant:

    def __init__(self):
        print("╔══════════════════════════════════════╗")
        print("║     Démarrage de Li — Bonjour !      ║")
        print("╚══════════════════════════════════════╝")

        # Visage
        print("[LI] Initialisation du visage...")
        self.face = LiFace()
        self.face.start()
        self.face.set_emotion(Emotion.SLEEPING)

        # Historique de conversation (mémoire multi-tours)
        self.history = [
            {"role": "system", "content": CONFIG["system_prompt"]}
        ]

        # Chargement Whisper
        print("[LI] Chargement de Whisper...")
        self.face.set_emotion(Emotion.THINKING)
        self.whisper = WhisperModel(
            CONFIG["whisper_model"],
            device="cpu",
            compute_type="int8"
        )

        # Moteur TTS
        self.tts = PiperTTSEngine(
            face_controller=self.face,
            piper_path=CONFIG["piper_path"],
            model_path=CONFIG["piper_model"]
        )

        # Wake word
        self.wake_detector = WakeWordDetector(
            on_wake_callback=self._on_wake_word
        )

        # État
        self._busy      = False
        self._busy_lock = threading.Lock()

        print("[LI] Prêt !")
        self.face.set_emotion(Emotion.IDLE)

    # ── Wake word callback ────────────────────────────────────────────────────

    def _on_wake_word(self):
        with self._busy_lock:
            if self._busy:
                return  # Ignorer si déjà en traitement
            self._busy = True

        # Lancer le pipeline dans un thread séparé
        thread = threading.Thread(target=self._pipeline, daemon=True)
        thread.start()

    # ── Pipeline principal ────────────────────────────────────────────────────

    def _pipeline(self):
        try:
            # 1. Accusé de réception
            self.face.set_emotion(Emotion.SURPRISED)
            time.sleep(0.4)
            self.face.set_listening()

            # Son de confirmation (bip court optionnel)
            self._play_beep(freq=880, duration_ms=120)

            # 2. Enregistrement
            print("[LI] Enregistrement en cours...")
            audio_path = "/tmp/li_input.wav"
            self._record_audio(audio_path, CONFIG["record_seconds"])
            print("[LI] Enregistrement terminé")

            # 3. Transcription
            self.face.set_emotion(Emotion.THINKING)
            print("[LI] Transcription...")
            segments, _ = self.whisper.transcribe(
                audio_path,
                language="fr",
                vad_filter=True,          # Filtre silence
                vad_parameters={"min_silence_duration_ms": 500}
            )
            text = " ".join(s.text for s in segments).strip()

            if not text:
                print("[LI] Rien compris")
                self.face.set_emotion(Emotion.IDLE)
                self.tts.speak("Je n'ai pas compris, pouvez-vous répéter ?")
                return

            print(f"[LI] Vous : {text}")

            # 4. LLM
            print("[LI] Réflexion...")
            self.face.set_emotion(Emotion.THINKING)

            self.history.append({"role": "user", "content": text})
            response = ollama.chat(
                model=CONFIG["ollama_model"],
                messages=self.history
            )
            answer = response["message"]["content"]
            self.history.append({"role": "assistant", "content": answer})

            # Limiter l'historique (éviter de dépasser le context window)
            if len(self.history) > 21:  # system + 10 échanges max
                self.history = [self.history[0]] + self.history[-20:]

            print(f"[LI] Li : {answer}")

            # 5. Synthèse vocale + animation
            self.face.set_emotion(Emotion.HAPPY)
            time.sleep(0.2)
            self.tts.speak(answer)  # Bloquant, anime la bouche en même temps

        except Exception as e:
            print(f"[LI] Erreur pipeline : {e}")
            self.face.set_emotion(Emotion.IDLE)

        finally:
            self.face.set_emotion(Emotion.IDLE)
            with self._busy_lock:
                self._busy = False
            print("[LI] En attente de 'Hello Li'...")

    # ── Enregistrement audio ──────────────────────────────────────────────────

    def _record_audio(self, output_path: str, seconds: int):
        pa      = pyaudio.PyAudio()
        stream  = pa.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=CONFIG["sample_rate"],
            input=True,
            frames_per_buffer=1024
        )
        n_frames = int(CONFIG["sample_rate"] / 1024 * seconds)
        frames   = [stream.read(1024, exception_on_overflow=False)
                    for _ in range(n_frames)]
        stream.close()
        pa.terminate()

        with wave.open(output_path, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(CONFIG["sample_rate"])
            wf.writeframes(b"".join(frames))

    # ── Bip de confirmation ───────────────────────────────────────────────────

    def _play_beep(self, freq: int = 880, duration_ms: int = 120):
        try:
            import numpy as np
            rate    = 44100
            n       = int(rate * duration_ms / 1000)
            t       = np.linspace(0, duration_ms / 1000, n, False)
            wave_data = (np.sin(2 * np.pi * freq * t) * 16000).astype(np.int16)
            pa      = pyaudio.PyAudio()
            stream  = pa.open(format=pyaudio.paInt16, channels=1,
                               rate=rate, output=True)
            stream.write(wave_data.tobytes())
            stream.close()
            pa.terminate()
        except Exception:
            pass  # Bip optionnel, échec silencieux

    # ── Démarrage ─────────────────────────────────────────────────────────────

    def run(self):
        self.wake_detector.start()
        print("\n" + "═" * 42)
        print("   Li est prêt — Dites 'Hello Li' !")
        print("═" * 42 + "\n")

        # Message de bienvenue
        self.face.set_emotion(Emotion.HAPPY)
        self.tts.speak("Bonjour ! Je suis Li, votre assistant. Dites Hello Li pour commencer.")
        self.face.set_emotion(Emotion.IDLE)

        try:
            while True:
                time.sleep(0.5)
        except KeyboardInterrupt:
            print("\n[LI] Arrêt de Li...")
            self.face.set_emotion(Emotion.SLEEPING)
            time.sleep(1.0)
            self.face.stop()
            self.wake_detector.stop()
            print("[LI] Au revoir !")


# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    assistant = LiAssistant()
    assistant.run()

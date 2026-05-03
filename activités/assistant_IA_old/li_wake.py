#!/usr/bin/env python3
"""
li_wake.py — Détection du wake word "Hello Li"
Utilise openWakeWord avec un modèle personnalisé ou le modèle
générique "hey_jarvis" comme fallback pendant l'entraînement.
"""

import threading
import queue
import numpy as np
import pyaudio

# openWakeWord
try:
    from openwakeword.model import Model as OWWModel
    OWW_AVAILABLE = True
except ImportError:
    OWW_AVAILABLE = False
    print("[WAKE] openWakeWord non installé — mode clavier activé")


# ── Configuration ─────────────────────────────────────────────────────────────
CHUNK          = 1280       # ~80ms à 16kHz — taille recommandée par openWakeWord
SAMPLE_RATE    = 16000
CHANNELS       = 1
THRESHOLD      = 0.7        # Score de confiance minimum (0.0–1.0)
COOLDOWN_S     = 2.0        # Secondes entre deux déclenchements


# ── Modèles wake word disponibles ────────────────────────────────────────────
# Priorité : modèle custom "hello_li" > "hey_jarvis" > "alexa" (fallback)
WAKE_MODELS = [
    "hello_li.onnx",        # Modèle custom à entraîner (voir guide ci-dessous)
    "hey_jarvis",           # Modèle pré-entraîné OWW (bon fallback)
    "alexa",                # Autre fallback
]


class WakeWordDetector:
    """
    Détecte le wake word en continu dans un thread dédié.
    Appelle le callback `on_wake` quand détecté.
    """

    def __init__(self, on_wake_callback):
        self._on_wake   = on_wake_callback
        self._running   = False
        self._last_wake = 0.0
        self._lock      = threading.Lock()
        self._model     = None
        self._pa        = None
        self._stream    = None

        if OWW_AVAILABLE:
            self._load_model()

    def _load_model(self):
        """Charge le meilleur modèle disponible."""
        import os
        for model_name in WAKE_MODELS:
            try:
                if model_name.endswith(".onnx") and not os.path.exists(model_name):
                    continue
                print(f"[WAKE] Chargement modèle : {model_name}")
                self._model = OWWModel(
                    wakeword_models=[model_name],
                    inference_framework="onnx"
                )
                print(f"[WAKE] Modèle chargé : {model_name}")
                self._active_model = model_name
                return
            except Exception as e:
                print(f"[WAKE] {model_name} indisponible : {e}")

        print("[WAKE] Aucun modèle trouvé — utiliser le mode clavier")
        self._model = None

    def start(self):
        self._running = True
        if OWW_AVAILABLE and self._model:
            self._thread = threading.Thread(target=self._listen_loop, daemon=True)
            self._thread.start()
            print("[WAKE] Écoute du wake word 'Hello Li' activée")
        else:
            self._thread = threading.Thread(target=self._keyboard_loop, daemon=True)
            self._thread.start()
            print("[WAKE] Mode clavier : appuyez sur Entrée pour activer Li")

    def stop(self):
        self._running = False
        if self._stream:
            self._stream.stop_stream()
            self._stream.close()
        if self._pa:
            self._pa.terminate()

    # ── Boucle d'écoute wake word ─────────────────────────────────────────────

    def _listen_loop(self):
        import time
        self._pa     = pyaudio.PyAudio()
        self._stream = self._pa.open(
            rate=SAMPLE_RATE,
            channels=CHANNELS,
            format=pyaudio.paInt16,
            input=True,
            frames_per_buffer=CHUNK
        )

        print("[WAKE] En attente de 'Hello Li'...")

        while self._running:
            try:
                audio_chunk = np.frombuffer(
                    self._stream.read(CHUNK, exception_on_overflow=False),
                    dtype=np.int16
                )

                predictions = self._model.predict(audio_chunk)

                for model_name, score in predictions.items():
                    if score >= THRESHOLD:
                        now = time.time()
                        with self._lock:
                            if now - self._last_wake > COOLDOWN_S:
                                self._last_wake = now
                                print(f"[WAKE] Wake word détecté ! Score : {score:.2f}")
                                self._on_wake()

            except Exception as e:
                print(f"[WAKE] Erreur lecture audio : {e}")
                time.sleep(0.1)

    # ── Fallback clavier ──────────────────────────────────────────────────────

    def _keyboard_loop(self):
        while self._running:
            try:
                input()  # Attend Entrée
                self._on_wake()
            except EOFError:
                break


# ── Guide entraînement modèle custom "Hello Li" ───────────────────────────────
TRAINING_GUIDE = """
╔══════════════════════════════════════════════════════════════════╗
║         CRÉER UN MODÈLE WAKE WORD "Hello Li" CUSTOM             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Option A — openWakeWord training (recommandé, gratuit)          ║
║  ─────────────────────────────────────────────────────           ║
║  1. Installer les outils :                                       ║
║     pip install openWakeWord[training]                           ║
║                                                                  ║
║  2. Générer des échantillons TTS du wake word :                  ║
║     python -c "                                                  ║
║       from openwakeword.utils import generate_training_data      ║
║       generate_training_data(                                    ║
║         phrase='hello li',                                       ║
║         output_dir='./hello_li_data',                            ║
║         n_samples=1000                                           ║
║       )"                                                         ║
║                                                                  ║
║  3. Entraîner le modèle :                                        ║
║     python train_wake_word.py                                    ║
║        --positive_data ./hello_li_data/positive                  ║
║        --negative_data ./hello_li_data/negative                  ║
║        --output hello_li.onnx                                    ║
║                                                                  ║
║  Option B — Porcupine (plus simple, mais freemium)               ║
║  ─────────────────────────────────────────────────               ║
║  1. S'inscrire sur console.picovoice.ai                          ║
║  2. Créer un wake word "Hello Li" → télécharger .ppn             ║
║  3. pip install pvporcupine                                      ║
║  4. Remplacer WakeWordDetector par PorcupineDetector             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
"""

if __name__ == "__main__":
    print(TRAINING_GUIDE)
    def on_wake():
        print("Wake word déclenché !")
    det = WakeWordDetector(on_wake_callback=on_wake)
    det.start()
    try:
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        det.stop()

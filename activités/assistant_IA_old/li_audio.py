#!/usr/bin/env python3
"""
li_audio.py — Moniteur de niveau audio pour synchroniser
la bouche de Li avec la sortie vocale Piper TTS.
Lit le fichier WAV généré par Piper et streame les niveaux RMS
vers l'animation pendant la lecture.
"""

import wave
import struct
import subprocess
import threading
import numpy as np
import time


class AudioLevelMonitor:
    """
    Joue un fichier WAV et émet des niveaux audio en temps réel
    pour animer la bouche de Li en synchronisation avec la voix.
    """

    def __init__(self, face_controller):
        self._face   = face_controller
        self._thread = None

    def play_and_animate(self, wav_path: str):
        """
        Joue le fichier audio et anime la bouche en parallèle.
        Bloquant jusqu'à la fin de la lecture.
        """
        # Lire le WAV et calculer les niveaux
        levels = self._extract_levels(wav_path, chunk_ms=50)
        duration_s = len(levels) * 0.05

        # Démarrer la lecture audio en sous-processus
        audio_proc = subprocess.Popen(
            ["aplay", "-q", wav_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        # Animer la bouche frame par frame
        self._face.set_speaking(True, 0.0)
        start = time.time()

        for i, level in enumerate(levels):
            target_time = start + i * 0.05
            now = time.time()
            if now < target_time:
                time.sleep(target_time - now)

            # Normaliser et envoyer au visage
            self._face.set_speaking(True, float(level))

        # Attendre fin de lecture
        audio_proc.wait()
        self._face.set_speaking(False, 0.0)

    def _extract_levels(self, wav_path: str, chunk_ms: int = 50):
        """
        Extrait les niveaux RMS normalisés (0.0–1.0) par chunk de chunk_ms ms.
        """
        levels = []
        try:
            with wave.open(wav_path, 'rb') as wf:
                rate       = wf.getframerate()
                n_channels = wf.getnchannels()
                sampwidth  = wf.getsampwidth()
                chunk_frames = int(rate * chunk_ms / 1000)

                # Valeur max selon la profondeur de bits
                max_val = float(2 ** (sampwidth * 8 - 1))

                while True:
                    raw = wf.readframes(chunk_frames)
                    if not raw:
                        break

                    # Décoder en int16
                    fmt   = f"<{len(raw) // sampwidth}h"
                    try:
                        samples = np.array(struct.unpack(fmt, raw), dtype=np.float32)
                    except struct.error:
                        break

                    # Mixer si stéréo
                    if n_channels == 2:
                        samples = samples[::2] + samples[1::2]
                        samples /= 2.0

                    # RMS normalisé
                    rms = np.sqrt(np.mean(samples ** 2)) / max_val

                    # Normalisation empirique pour Piper TTS (voix ~0.05–0.3 RMS)
                    level = min(1.0, rms / 0.25)
                    levels.append(level)

        except Exception as e:
            print(f"[AUDIO] Erreur extraction niveaux : {e}")
            # Retourner des niveaux plats en cas d'erreur
            return [0.5] * 20

        return levels


class PiperTTSEngine:
    """
    Synthèse vocale avec Piper TTS + animation automatique de Li.
    """

    def __init__(self, face_controller, piper_path: str, model_path: str):
        self._face       = face_controller
        self._piper_path = piper_path
        self._model_path = model_path
        self._monitor    = AudioLevelMonitor(face_controller)
        self._output_wav = "/tmp/li_response.wav"

    def speak(self, text: str):
        """Synthétise le texte et joue l'audio avec animation labiale."""
        print(f"[TTS] Synthèse : {text[:60]}{'...' if len(text) > 60 else ''}")

        # Synthèse Piper
        proc = subprocess.Popen(
            [self._piper_path,
             "--model",       self._model_path,
             "--output_file", self._output_wav],
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        proc.communicate(input=text.encode("utf-8"))

        if proc.returncode != 0:
            print("[TTS] ❌ Erreur Piper TTS")
            return

        # Lecture + animation synchronisée
        self._monitor.play_and_animate(self._output_wav)
        print("[TTS] ✅ Lecture terminée")

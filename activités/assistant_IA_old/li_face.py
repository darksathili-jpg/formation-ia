#!/usr/bin/env python3
"""
li_face.py — Moteur d'animation du visage de Li
Écran TFT SPI 240x240 (ST7789) ou OLED I2C 128x64
Cartoon friendly : yeux expressifs, bouche animée, émotions
"""

import threading
import time
import random
import math
import numpy as np

# ── Détection automatique de l'écran disponible ──────────────────────────────
# Ordre de priorité : ST7735 → ST7789 → OLED SSD1306 → Simulation pygame

SCREEN_TYPE = None
WIDTH, HEIGHT = 240, 240

# Tentative ST7735R (ex. Module 1.3" IPS 240x240 RGB)
if SCREEN_TYPE is None:
    try:
        import board, digitalio, busio
        from adafruit_st7735r import ST7735R
        from PIL import Image, ImageDraw
        SCREEN_TYPE = "TFT_ST7735"
        print("[SCREEN] Contrôleur détecté : ST7735R")
    except ImportError:
        pass

# Tentative ST7789
if SCREEN_TYPE is None:
    try:
        import board, digitalio, busio
        from adafruit_st7789 import ST7789
        from PIL import Image, ImageDraw
        SCREEN_TYPE = "TFT_ST7789"
        print("[SCREEN] Contrôleur détecté : ST7789")
    except ImportError:
        pass

# Tentative OLED I2C SSD1306
if SCREEN_TYPE is None:
    try:
        from luma.oled.device import ssd1306
        from luma.core.interface.serial import i2c
        from luma.core.render import canvas
        SCREEN_TYPE = "OLED_SSD1306"
        WIDTH, HEIGHT = 128, 64
        print("[SCREEN] Contrôleur détecté : SSD1306 OLED")
    except ImportError:
        pass

# Fallback simulation pygame (développement sans écran)
if SCREEN_TYPE is None:
    import pygame
    from PIL import Image, ImageDraw
    SCREEN_TYPE = "PYGAME_SIM"
    print("[SCREEN] Mode simulation pygame (aucun écran détecté)")


# ── Constantes émotions ───────────────────────────────────────────────────────
class Emotion:
    IDLE      = "idle"
    LISTENING = "listening"
    THINKING  = "thinking"
    SPEAKING  = "speaking"
    SURPRISED = "surprised"
    HAPPY     = "happy"
    SLEEPING  = "sleeping"


# ── Palettes couleurs (RGB565 pour TFT, RGB pour PIL/pygame) ─────────────────
COLORS = {
    "bg":          (15,  15,  30),   # fond bleu nuit
    "eye_white":   (230, 240, 255),  # blanc légèrement bleuté
    "eye_iris":    ( 80, 180, 255),  # bleu électrique
    "eye_pupil":   ( 10,  10,  25),  # pupille sombre
    "eye_shine":   (255, 255, 255),  # reflet
    "mouth":       (255, 100, 120),  # rose/rouge
    "mouth_teeth": (240, 245, 255),  # dents
    "cheek":       (255, 140, 160),  # joues rouges (embarras)
    "glow_listen": ( 50, 220, 180),  # halo écoute (cyan)
    "glow_think":  (200, 150, 255),  # halo réflexion (violet)
    "glow_speak":  (255, 200,  60),  # halo parole (orange)
}


class LiFace:
    """
    Visage animé de Li — cartoon friendly.
    Tourne dans un thread dédié, thread-safe via des propriétés.
    """

    def __init__(self):
        self._emotion       = Emotion.IDLE
        self._speaking      = False
        self._mouth_open    = 0.0        # 0.0 fermé → 1.0 grand ouvert
        self._blink_state   = 1.0        # 1.0 ouvert → 0.0 fermé
        self._look_x        = 0.0        # -1.0 gauche → +1.0 droite
        self._look_y        = 0.0        # -1.0 haut   → +1.0 bas
        self._lock          = threading.Lock()
        self._running       = False
        self._frame         = 0
        self._last_blink    = time.time()
        self._next_blink    = random.uniform(2.5, 6.0)
        self._last_look     = time.time()
        self._next_look     = random.uniform(3.0, 8.0)
        self._target_look_x = 0.0
        self._target_look_y = 0.0
        self._audio_levels  = [0.0] * 8   # niveaux audio pour bouche

        self._init_display()

    # ── Init écran ────────────────────────────────────────────────────────────

    def _init_display(self):
        if SCREEN_TYPE == "TFT_ST7735":
            cs_pin    = digitalio.DigitalInOut(board.CE0)
            dc_pin    = digitalio.DigitalInOut(board.D25)
            reset_pin = digitalio.DigitalInOut(board.D24)
            spi = busio.SPI(clock=board.SCK, MOSI=board.MOSI)
            # bgr=True corrige le décalage rouge/bleu fréquent sur les clones ST7735
            # Si les couleurs sont encore inversées, passer bgr=False
            self.disp = ST7735R(spi, height=HEIGHT, width=WIDTH,
                                rotation=0, bgr=True,
                                cs=cs_pin, dc=dc_pin, rst=reset_pin,
                                baudrate=40_000_000)
            self.image = Image.new("RGB", (WIDTH, HEIGHT))
            self.draw  = ImageDraw.Draw(self.image)

        elif SCREEN_TYPE == "TFT_ST7789":
            cs_pin    = digitalio.DigitalInOut(board.CE0)
            dc_pin    = digitalio.DigitalInOut(board.D25)
            reset_pin = digitalio.DigitalInOut(board.D24)
            spi = busio.SPI(clock=board.SCK, MOSI=board.MOSI)
            self.disp = ST7789(spi, height=HEIGHT, width=WIDTH,
                               y_offset=0, rotation=0,
                               cs=cs_pin, dc=dc_pin, rst=reset_pin,
                               baudrate=64_000_000)
            self.image = Image.new("RGB", (WIDTH, HEIGHT))
            self.draw  = ImageDraw.Draw(self.image)

        elif SCREEN_TYPE == "OLED_SSD1306":
            serial    = i2c(port=1, address=0x3C)
            self.disp = ssd1306(serial, width=128, height=64)

        else:  # PYGAME_SIM
            pygame.init()
            self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
            pygame.display.set_caption("Li — Face Simulator")
            self.clock  = pygame.time.Clock()
            self.image  = Image.new("RGB", (WIDTH, HEIGHT))
            self.draw   = ImageDraw.Draw(self.image)

    # ── API publique (thread-safe) ────────────────────────────────────────────

    def set_emotion(self, emotion: str):
        with self._lock:
            self._emotion = emotion

    def set_speaking(self, speaking: bool, audio_level: float = 0.0):
        """Appelé depuis le thread audio avec le niveau sonore (0.0–1.0)."""
        with self._lock:
            self._speaking    = speaking
            self._emotion     = Emotion.SPEAKING if speaking else Emotion.IDLE
            # Décale le buffer audio (ring buffer simplifié)
            self._audio_levels = self._audio_levels[1:] + [audio_level]
            self._mouth_open   = min(1.0, audio_level * 2.2)

    def set_listening(self):
        with self._lock:
            self._emotion    = Emotion.LISTENING
            self._speaking   = False
            self._mouth_open = 0.0

    def set_thinking(self):
        with self._lock:
            self._emotion    = Emotion.THINKING
            self._speaking   = False
            self._mouth_open = 0.0

    # ── Boucle principale ─────────────────────────────────────────────────────

    def start(self):
        self._running = True
        self._thread  = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False

    def _loop(self):
        fps = 30
        while self._running:
            t0 = time.time()
            self._update_automatics()
            self._render()
            elapsed = time.time() - t0
            time.sleep(max(0, 1/fps - elapsed))
            self._frame += 1

    # ── Automatismes (clignements, regard) ────────────────────────────────────

    def _update_automatics(self):
        now = time.time()

        # ── Clignement aléatoire ──────────────────────────────────────────────
        if self._emotion not in (Emotion.SLEEPING, Emotion.SURPRISED):
            if now - self._last_blink > self._next_blink:
                self._trigger_blink()
                self._last_blink = now
                self._next_blink = random.uniform(2.5, 7.0)

        # Animation clignement : fermeture rapide puis réouverture
        if self._blink_state < 1.0:
            self._blink_state = min(1.0, self._blink_state + 0.25)

        # ── Regard aléatoire ──────────────────────────────────────────────────
        if self._emotion == Emotion.THINKING:
            # Regard vers le haut-gauche pendant la réflexion
            self._target_look_x = -0.4
            self._target_look_y = -0.5
        elif now - self._last_look > self._next_look:
            self._target_look_x = random.uniform(-0.6, 0.6)
            self._target_look_y = random.uniform(-0.4, 0.4)
            self._last_look = now
            self._next_look = random.uniform(3.0, 9.0)

        # Interpolation douce du regard
        speed = 0.08
        self._look_x += (self._target_look_x - self._look_x) * speed
        self._look_y += (self._target_look_y - self._look_y) * speed

        # ── Bouche idle : légère oscillation ─────────────────────────────────
        if not self._speaking and self._emotion not in (Emotion.THINKING, Emotion.SLEEPING):
            self._mouth_open = max(0.0, self._mouth_open - 0.05)

    def _trigger_blink(self):
        self._blink_state = 0.0

    # ── Rendu ─────────────────────────────────────────────────────────────────

    def _render(self):
        if SCREEN_TYPE in ("TFT_ST7789", "PYGAME_SIM"):
            self._render_pil()
        elif SCREEN_TYPE == "OLED_SSD1306":
            self._render_oled()

    def _render_pil(self):
        """Rendu PIL pour TFT couleur 240×240."""
        d = self.draw
        t = self._frame / 30.0  # temps en secondes

        with self._lock:
            emotion     = self._emotion
            mouth_open  = self._mouth_open
            blink       = self._blink_state
            look_x      = self._look_x
            look_y      = self._look_y

        # ── Fond ──────────────────────────────────────────────────────────────
        d.rectangle([0, 0, WIDTH, HEIGHT], fill=COLORS["bg"])

        # ── Halo d'émotion ────────────────────────────────────────────────────
        glow_color = None
        if emotion == Emotion.LISTENING:
            pulse = 0.5 + 0.5 * math.sin(t * 3.0)
            glow_color = tuple(int(c * pulse) for c in COLORS["glow_listen"])
        elif emotion == Emotion.THINKING:
            pulse = 0.3 + 0.7 * math.sin(t * 1.5)
            glow_color = tuple(int(c * pulse) for c in COLORS["glow_think"])
        elif emotion == Emotion.SPEAKING:
            pulse = 0.4 + 0.6 * abs(math.sin(t * 8.0))
            glow_color = tuple(int(c * pulse) for c in COLORS["glow_speak"])

        if glow_color:
            for r in range(110, 60, -10):
                alpha_ratio = (r - 60) / 50
                gc = tuple(int(c * alpha_ratio * 0.3) for c in glow_color)
                d.ellipse([WIDTH//2 - r, HEIGHT//2 - r,
                            WIDTH//2 + r, HEIGHT//2 + r],
                           fill=gc)

        # ── Yeux ──────────────────────────────────────────────────────────────
        eye_cx = [WIDTH // 2 - 52, WIDTH // 2 + 52]
        eye_cy = HEIGHT // 2 - 20
        eye_r  = 30   # rayon blanc de l'œil

        for cx in eye_cx:
            cy = eye_cy
            # Blanc de l'œil
            d.ellipse([cx - eye_r, cy - eye_r, cx + eye_r, cy + eye_r],
                       fill=COLORS["eye_white"])

            # Clignement : masque rectangle qui ferme l'œil depuis le bas
            if blink < 1.0:
                lid_h = int(eye_r * 2 * (1.0 - blink))
                d.rectangle([cx - eye_r - 2,
                              cy + eye_r - lid_h,
                              cx + eye_r + 2,
                              cy + eye_r + 2],
                              fill=COLORS["bg"])
                # Paupière supérieure si à moitié fermé
                lid_top = int(eye_r * 2 * (1.0 - blink) * 0.6)
                d.rectangle([cx - eye_r - 2,
                              cy - eye_r - 2,
                              cx + eye_r + 2,
                              cy - eye_r + lid_top],
                              fill=COLORS["bg"])

            # Iris (suit le regard)
            iris_r  = 18
            max_off = eye_r - iris_r - 2
            ix = cx + int(look_x * max_off)
            iy = cy + int(look_y * max_off)

            # Émotion surprise : iris plus grands
            if emotion == Emotion.SURPRISED:
                iris_r = 22

            d.ellipse([ix - iris_r, iy - iris_r,
                        ix + iris_r, iy + iris_r],
                       fill=COLORS["eye_iris"])

            # Pupille
            pupil_r = iris_r // 2
            d.ellipse([ix - pupil_r, iy - pupil_r,
                        ix + pupil_r, iy + pupil_r],
                       fill=COLORS["eye_pupil"])

            # Reflet (fixe dans l'iris)
            shine_r = 5
            d.ellipse([ix - iris_r//2 - shine_r//2,
                        iy - iris_r//2 - shine_r//2,
                        ix - iris_r//2 + shine_r//2,
                        iy - iris_r//2 + shine_r//2],
                       fill=COLORS["eye_shine"])

            # Sourcil (position change selon émotion)
            brow_y  = cy - eye_r - 8
            brow_tilt = 0
            if emotion == Emotion.SURPRISED:
                brow_y   -= 10
            elif emotion == Emotion.THINKING:
                brow_tilt = 4 if cx < WIDTH // 2 else -4
            elif emotion == Emotion.HAPPY:
                brow_y   -= 5

            d.line([(cx - eye_r + 4, brow_y + brow_tilt),
                     (cx + eye_r - 4, brow_y - brow_tilt)],
                    fill=COLORS["eye_iris"], width=4)

        # ── Bouche ────────────────────────────────────────────────────────────
        mouth_cx = WIDTH  // 2
        mouth_cy = HEIGHT // 2 + 48
        mouth_w  = 60
        mouth_h_max = 28

        if emotion == Emotion.SLEEPING:
            # Ligne horizontale simple
            d.line([(mouth_cx - 20, mouth_cy),
                     (mouth_cx + 20, mouth_cy)],
                    fill=COLORS["mouth"], width=3)

        elif emotion == Emotion.HAPPY or emotion == Emotion.IDLE:
            # Sourire courbe
            smile = int(12 + mouth_open * 8)
            d.arc([mouth_cx - mouth_w//2, mouth_cy - smile//2,
                    mouth_cx + mouth_w//2, mouth_cy + smile],
                   start=0, end=180, fill=COLORS["mouth"], width=4)

        elif emotion in (Emotion.SPEAKING, Emotion.LISTENING):
            # Bouche ouverte avec dents
            mh = int(mouth_h_max * mouth_open)
            if mh < 4:
                # Bouche quasi fermée : sourire
                d.arc([mouth_cx - mouth_w//2, mouth_cy - 8,
                        mouth_cx + mouth_w//2, mouth_cy + 8],
                       start=0, end=180, fill=COLORS["mouth"], width=3)
            else:
                # Ellipse ouverte
                d.ellipse([mouth_cx - mouth_w//2, mouth_cy - mh//2,
                            mouth_cx + mouth_w//2, mouth_cy + mh//2],
                           fill=COLORS["mouth"])
                # Dents
                teeth_h = max(3, mh // 3)
                d.rectangle([mouth_cx - mouth_w//2 + 6, mouth_cy - mh//2 + 2,
                              mouth_cx + mouth_w//2 - 6, mouth_cy - mh//2 + teeth_h + 2],
                              fill=COLORS["mouth_teeth"])

        elif emotion == Emotion.SURPRISED:
            # Bouche ronde grande ouverte
            d.ellipse([mouth_cx - 20, mouth_cy - 18,
                        mouth_cx + 20, mouth_cy + 18],
                       fill=COLORS["mouth"])

        elif emotion == Emotion.THINKING:
            # Bouche de côté (réflexion)
            d.arc([mouth_cx - 15, mouth_cy - 6,
                    mouth_cx + 25, mouth_cy + 12],
                   start=0, end=180, fill=COLORS["mouth"], width=3)

        # ── Joues (happy / speaking) ─────────────────────────────────────────
        if emotion in (Emotion.HAPPY, Emotion.SPEAKING) and mouth_open > 0.3:
            cheek_alpha = int(mouth_open * 80)
            for cx_c, cy_c in [(WIDTH//2 - 80, HEIGHT//2 + 30),
                                (WIDTH//2 + 80, HEIGHT//2 + 30)]:
                # PIL n'a pas d'alpha direct, simulation avec cercle teinté
                d.ellipse([cx_c - 18, cy_c - 10,
                            cx_c + 18, cy_c + 10],
                           fill=COLORS["cheek"])

        # ── Indicateur d'état (petit point en bas) ────────────────────────────
        state_colors = {
            Emotion.IDLE:      (80,  80,  80),
            Emotion.LISTENING: COLORS["glow_listen"],
            Emotion.THINKING:  COLORS["glow_think"],
            Emotion.SPEAKING:  COLORS["glow_speak"],
            Emotion.SURPRISED: (255, 200,  60),
            Emotion.HAPPY:     (100, 220, 100),
            Emotion.SLEEPING:  ( 50,  50, 150),
        }
        sc = state_colors.get(emotion, (80, 80, 80))
        pulse = 0.6 + 0.4 * math.sin(t * 4.0)
        sc_p  = tuple(int(c * pulse) for c in sc)
        d.ellipse([WIDTH//2 - 5, HEIGHT - 14, WIDTH//2 + 5, HEIGHT - 4],
                   fill=sc_p)

        # ── Envoi vers l'écran ────────────────────────────────────────────────
        if SCREEN_TYPE in ("TFT_ST7735", "TFT_ST7789"):
            self.disp.image(self.image)

        elif SCREEN_TYPE == "PYGAME_SIM":
            surf = pygame.image.fromstring(self.image.tobytes(), (WIDTH, HEIGHT), "RGB")
            self.screen.blit(surf, (0, 0))
            pygame.display.flip()
            self.clock.tick(30)
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self._running = False

    def _render_oled(self):
        """Rendu monochrome simplifié pour OLED 128×64."""
        with canvas(self.disp) as d:
            with self._lock:
                emotion    = self._emotion
                mouth_open = self._mouth_open
                blink      = self._blink_state

            # Fond noir (implicite)
            eye_positions = [(30, 26), (98, 26)]

            for ex, ey in eye_positions:
                er = 14
                if blink > 0.5:
                    d.ellipse([ex - er, ey - er, ex + er, ey + er], outline="white")
                    d.ellipse([ex - 6, ey - 6, ex + 6, ey + 6], fill="white")
                else:
                    # Œil fermé : ligne
                    d.line([ex - er, ey, ex + er, ey], fill="white", width=2)

            # Bouche OLED
            mx, my = 64, 52
            mh = int(10 * mouth_open)
            if mh < 3:
                d.arc([mx - 18, my - 5, mx + 18, my + 5], 0, 180, fill="white")
            else:
                d.ellipse([mx - 18, my - mh//2, mx + 18, my + mh//2], outline="white")

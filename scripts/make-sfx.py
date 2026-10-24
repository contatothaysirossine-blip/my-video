"""Generates the subtle sound effects used in the edit (public/sfx/*.wav).

Synthesised from scratch so there are no licensing issues.
Run: python3 scripts/make-sfx.py  (needs numpy)
"""

import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def save(name: str, x: np.ndarray, peak: float) -> None:
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    stereo = np.repeat((x * 32767).astype(np.int16)[:, None], 2, axis=1)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())


def lowpass_sweep(noise: np.ndarray, cutoff: np.ndarray) -> np.ndarray:
    # One-pole lowpass with a time-varying cutoff, run twice for a softer slope.
    out = noise
    for _ in range(2):
        y = np.zeros_like(out)
        a = np.exp(-2 * np.pi * cutoff / SR)
        acc = 0.0
        for i, v in enumerate(out):
            acc = (1 - a[i]) * v + a[i] * acc
            y[i] = acc
        out = y
    return out


def whoosh(duration: float, lo: float, hi: float) -> np.ndarray:
    n = int(SR * duration)
    t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t**0.7) ** 2
    cutoff = lo + (hi - lo) * np.sin(np.pi * t) ** 1.5
    x = lowpass_sweep(rng.standard_normal(n), cutoff)
    x = x - lowpass_sweep(x, np.full(n, 120.0))  # remove rumble
    return x * env


def pop(duration: float = 0.09, f0: float = 820, f1: float = 260) -> np.ndarray:
    n = int(SR * duration)
    t = np.arange(n) / SR
    freq = f1 + (f0 - f1) * np.exp(-t * 55)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.exp(-t * 45) * np.minimum(1, t * SR / 40)
    return np.sin(phase) * env


def tick(duration: float = 0.04) -> np.ndarray:
    n = int(SR * duration)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 160)
    click = rng.standard_normal(n) * np.exp(-t * 600) * 0.3
    return body + click


OUT.mkdir(parents=True, exist_ok=True)
save("whoosh.wav", whoosh(0.42, 400, 5200), 0.8)
save("whoosh-soft.wav", whoosh(0.6, 250, 2600), 0.7)
save("pop.wav", pop(), 0.8)
save("tick.wav", tick(), 0.6)
print("ok", sorted(p.name for p in OUT.glob("*.wav")))

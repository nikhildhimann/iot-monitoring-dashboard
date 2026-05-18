"use client";

const ALERT_SOUND_KEY = "alertSoundEnabled";
const ALERT_SOUND_SRC = "/sounds/alert.mp3";
const ALERT_SOUND_VOLUME = 0.8;
const ALERT_SOUND_MAX_DURATION_MS = 3000;
const ALERT_SOUND_COOLDOWN_MS = 60000;

let audioElement = null;
let stopTimer = null;
let lastPlayedAt = 0;

function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

function warnInDevelopment(message, error) {
  if (isDevelopment()) {
    console.warn(message, error);
  }
}

function getAudioElement() {
  if (typeof Audio === "undefined") {
    return null;
  }

  if (!audioElement) {
    audioElement = new Audio(ALERT_SOUND_SRC);
    audioElement.preload = "auto";
    audioElement.volume = ALERT_SOUND_VOLUME;
  }

  return audioElement;
}

function stopAlertSound(audio) {
  window.clearTimeout(stopTimer);
  stopTimer = null;
  audio.pause();
  audio.currentTime = 0;
}

export function isAlertSoundEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(ALERT_SOUND_KEY) === "true";
}

export async function enableAlertSound() {
  if (typeof window === "undefined") {
    return false;
  }

  window.localStorage.setItem(ALERT_SOUND_KEY, "true");

  const audio = getAudioElement();
  if (!audio) {
    return false;
  }

  try {
    const previousMuted = audio.muted;
    const previousVolume = audio.volume;

    audio.muted = true;
    audio.volume = 0;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.muted = previousMuted;
    audio.volume = previousVolume || ALERT_SOUND_VOLUME;
  } catch (error) {
    warnInDevelopment("Alert sound could not be primed.", error);
  }

  return true;
}

export async function playAlertSound() {
  if (typeof window === "undefined" || !isAlertSoundEnabled()) {
    return false;
  }

  if (document.visibilityState !== "visible") {
    return false;
  }

  const now = Date.now();
  if (now - lastPlayedAt < ALERT_SOUND_COOLDOWN_MS) {
    return false;
  }
  lastPlayedAt = now;

  const audio = getAudioElement();
  if (!audio) {
    return false;
  }

  try {
    window.clearTimeout(stopTimer);
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = ALERT_SOUND_VOLUME;

    await audio.play();

    stopTimer = window.setTimeout(() => {
      stopAlertSound(audio);
    }, ALERT_SOUND_MAX_DURATION_MS);

    return true;
  } catch (error) {
    warnInDevelopment("Alert sound playback was blocked or unavailable.", error);
    return false;
  }
}

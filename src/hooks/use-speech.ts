import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "./use-local-storage";

export type SpeechSettings = {
  enabled: boolean;
  voiceURI: string | null;
  rate: number;
  pitch: number;
  volume: number;
};

const DEFAULT_SETTINGS: SpeechSettings = {
  enabled: true,
  voiceURI: null,
  rate: 1,
  pitch: 1,
  volume: 1,
};

export function useSpeechSettings() {
  const [settings, setSettings] = useLocalStorage<SpeechSettings>(
    "va-speech-settings",
    DEFAULT_SETTINGS,
  );
  return { settings, setSettings };
}

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  return voices;
}

export function useSpeech() {
  const { settings } = useSpeechSettings();
  const voices = useVoices();
  const [speaking, setSpeaking] = useState(false);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback(
    (text: string, opts?: { force?: boolean }) => {
      if (!supported) return false;
      if (!opts?.force && !settings.enabled) return false;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => v.voiceURI === settings.voiceURI);
      if (voice) utter.voice = voice;
      utter.rate = settings.rate;
      utter.pitch = settings.pitch;
      utter.volume = settings.volume;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      synth.speak(utter);
      return true;
    },
    [supported, settings, voices],
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { speak, stop, speaking, supported, voices };
}

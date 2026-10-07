/**
 * TTS SERVICE ABSTRACTION — Web Speech API Only
 * Replaces D-ID and OpenAI with free local browser synthesis.
 */

const resolvedBrowserVoices = new Map();
let currentPlaybackSessionId = 0;
let currentUtterance = null;

export function getBrowserVoices() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const immediate = window.speechSynthesis.getVoices();
    if (immediate && immediate.length > 0) {
      resolve(immediate);
      return;
    }

    let resolved = false;
    const handleVoicesChanged = () => {
      if (resolved) return;
      resolved = true;
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(window.speechSynthesis.getVoices() || []);
      }
    }, 1200);
  });
}

export async function resolveVoiceForPersona(persona) {
  if (!persona) return null;
  if (resolvedBrowserVoices.has(persona.id)) {
    return resolvedBrowserVoices.get(persona.id);
  }

  const allVoices = await getBrowserVoices();
  console.log(`[TTS] Voices loaded: ${allVoices.length} available.`);
  if (!allVoices || allVoices.length === 0) return null;

  const englishVoices = allVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  const searchPool = englishVoices.length > 0 ? englishVoices : allVoices;

  const isMale = persona.gender === 'male';

  let match = null;

  if (isMale) {
    match = searchPool.find((v) => v.name.includes('Microsoft David')) ||
            searchPool.find((v) => v.name.includes('Microsoft Mark')) ||
            searchPool.find((v) => v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('mark') || v.name.toLowerCase().includes('male'));
  } else {
    match = searchPool.find((v) => v.name.includes('Microsoft Zira')) ||
            searchPool.find((v) => v.name.includes('Microsoft Heera')) ||
            searchPool.find((v) => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('female'));
  }

  const finalVoice = match || searchPool[0] || allVoices[0];
  if (finalVoice) {
    resolvedBrowserVoices.set(persona.id, finalVoice);
    console.log(`[TTS] Selected voice: ${finalVoice.name} for ${isMale ? 'Male' : 'Female'} persona.`);
  }
  return finalVoice;
}

export function stopTTS() {
  currentPlaybackSessionId += 1;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    if (currentUtterance) {
        currentUtterance.onend = null;
        currentUtterance.onerror = null;
        currentUtterance = null;
    }
    console.log('[TTS] Speech cancelled.');
  }
}

export async function speak(text, persona, options = {}) {
  const { onStart, onBoundary, onEnd, onError } = options;
  stopTTS();

  const thisSessionId = currentPlaybackSessionId;
  
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[TTS] SpeechSynthesis not supported in this browser.');
    onError?.(new Error('SpeechSynthesis not supported'));
    return;
  }

  const voice = await resolveVoiceForPersona(persona);
  if (thisSessionId !== currentPlaybackSessionId) return;

  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;

  utterance.rate = persona?.voice?.rate || 0.95;
  utterance.pitch = persona?.voice?.pitch || 1.0;
  utterance.volume = 1;

  utterance.onstart = () => {
    if (thisSessionId === currentPlaybackSessionId) {
      console.log('[TTS] Speaking interviewer question...');
      onStart?.();
    }
  };

  utterance.onboundary = (event) => {
    if (thisSessionId !== currentPlaybackSessionId) return;
    if (event.name === 'word') {
      const charIdx = event.charIndex || 0;
      const len = event.charLength || 5;
      const word = text.substring(charIdx, charIdx + len).trim();
      onBoundary?.({ word, charIndex: charIdx });
    }
  };

  utterance.onend = () => {
    if (thisSessionId === currentPlaybackSessionId) {
      console.log('[TTS] Speech ended.');
      onEnd?.();
    }
  };

  utterance.onerror = (e) => {
    if (thisSessionId === currentPlaybackSessionId) {
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      console.error('[TTS] Speech error:', e);
      onError?.(e);
      onEnd?.();
    }
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export const ttsService = {
  speak,
  stop: stopTTS,
  getBrowserVoices,
  resolveVoiceForPersona,
};

export default ttsService;

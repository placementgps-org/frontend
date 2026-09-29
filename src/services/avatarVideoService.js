/**
 * ════════════════════════════════════════════════════════════════════════════
 * AVATAR VIDEO SERVICE — PlacementGPS (Harden & Resilient)
 * ════════════════════════════════════════════════════════════════════════════
 * Client-side service for requesting photorealistic AI talking avatar video
 * clips from the backend D-ID controller (POST /api/interview/avatar-video/generate).
 *
 * Resilience & Guardrails:
 *  - Client-side in-memory cache to eliminate duplicate generation of seen phrases.
 *  - In-flight request deduplication: sharing promises across concurrent callers.
 *  - AbortController support with bounded timeout so the candidate is never stuck.
 *  - Silent fallback: returns null on any error, timeout, or malformed data
 *    so the UI smoothly routes to the permanent SVG avatar + TTS fallback.
 * ════════════════════════════════════════════════════════════════════════════
 */

const clientVideoCache = new Map();
const inFlightRequests = new Map();
const DEFAULT_CLIENT_TIMEOUT_MS = 130000; // 130s maximum client wait

/**
 * Generate or fetch speaking avatar video clip for interviewer text.
 *
 * @param {object} params
 * @param {string} [params.sessionId] - Active interview session ID
 * @param {string} [params.personaId] - Interviewer persona ID
 * @param {string} params.text - Interviewer speech text to animate
 * @param {AbortSignal} [params.signal] - Optional external abort signal
 * @param {number} [params.timeoutMs] - Optional custom timeout
 * @returns {Promise<{ videoUrl: string, durationSec: number } | null>}
 */
export async function generateSpeakingVideo({
  sessionId,
  personaId = 'matt',
  text,
  signal,
  timeoutMs = DEFAULT_CLIENT_TIMEOUT_MS,
}) {
  if (!text || !text.trim()) return null;

  const cleanText = text.trim().replace(/\s+/g, ' ');
  const cacheKey = `${personaId}_${cleanText.toLowerCase()}`;

  // 1. Client-side in-memory cache check
  if (clientVideoCache.has(cacheKey)) {
    console.log(`[AvatarVideoService] Client cache hit for "${cleanText.substring(0, 30)}..."`);
    return clientVideoCache.get(cacheKey);
  }

  // 2. Prevent duplicate simultaneous requests (in-flight deduplication)
  if (inFlightRequests.has(cacheKey)) {
    console.log(`[AvatarVideoService] Joining in-flight request for "${cleanText.substring(0, 30)}..."`);
    return inFlightRequests.get(cacheKey);
  }

  // 3. Initiate fetch with bounded timeout & combined abort signal
  const requestPromise = (async () => {
    const internalController = new AbortController();
    const timeoutId = setTimeout(() => {
      internalController.abort(new Error('Timeout'));
    }, timeoutMs);

    // Link external abort signal if provided
    let removeExternalAbort = null;
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeoutId);
        return null;
      }
      const onExternalAbort = () => internalController.abort(new Error('AbortedByCaller'));
      signal.addEventListener('abort', onExternalAbort);
      removeExternalAbort = () => signal.removeEventListener('abort', onExternalAbort);
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      console.log(`[AvatarVideoService] Requesting D-ID video for: "${cleanText.substring(0, 40)}..."`);

      const res = await fetch(`${apiUrl}/interview/avatar-video/generate`, {
        method: 'POST',
        headers,
        signal: internalController.signal,
        body: JSON.stringify({
          sessionId,
          personaId,
          text: cleanText,
        }),
      });

      clearTimeout(timeoutId);
      if (removeExternalAbort) removeExternalAbort();

      if (!res.ok) {
        console.warn(`[AvatarVideoService] Backend returned HTTP ${res.status}. Falling back to SVG/TTS.`);
        return null;
      }

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn('[AvatarVideoService] Malformed JSON response from server:', parseErr.message);
        return null;
      }

      if (data && data.success && data.videoUrl) {
        const result = {
          videoUrl: data.videoUrl,
          durationSec: data.durationSec || 3,
        };
        clientVideoCache.set(cacheKey, result);
        console.log(`[AvatarVideoService] Video clip ready (~${result.durationSec}s).`);
        return result;
      }

      if (data && data.fallbackToTTS) {
        console.log(`[AvatarVideoService] Server routed to SVG/TTS fallback (${data.error || data.message || 'Standard'}).`);
        return null;
      }

      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      if (removeExternalAbort) removeExternalAbort();

      if (error.name === 'AbortError' || error.message === 'Timeout' || error.message === 'AbortedByCaller') {
        console.warn(`[AvatarVideoService] Request aborted or timed out (${timeoutMs / 1000}s). Route to SVG/TTS.`);
      } else {
        console.warn('[AvatarVideoService] Exception occurred, falling back to SVG/TTS:', error.message);
      }
      return null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

export const avatarVideoService = {
  generateSpeakingVideo,
};

export default avatarVideoService;

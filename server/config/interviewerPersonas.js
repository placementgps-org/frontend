/**
 * Centralized server-side catalog for D-ID interviewer personas.
 * Maps frontend interviewer choices to secure D-ID presenter API parameters.
 */

export const PERSONA_CATALOG = {
  matt: {
    id: 'matt',
    name: 'Matt',
    role: 'HR Interviewer',
    description: 'Professional HR interviewer — balanced and structured.',
    gender: 'male',
    language: 'en-US',
    enabled: true,
    did: {
      source_url: 'https://clips-presenters.d-id.com/v2/matt/hbMP8_7cv7/BTuR3JVOBy/image.png',
      voice_id: 'en-US-GuyNeural',
      voice_provider: 'microsoft',
    },
    svgFallback: { avatarConfigId: 'david' },
  },
  amy: {
    id: 'amy',
    name: 'Amy',
    role: 'Friendly Interviewer',
    description: 'Warm and encouraging interviewer.',
    gender: 'female',
    language: 'en-US',
    enabled: true,
    did: {
      source_url: 'https://clips-presenters.d-id.com/v2/matt/hbMP8_7cv7/BTuR3JVOBy/image.png',
      voice_id: 'en-US-AvaMultilingualNeural',
      voice_provider: 'microsoft',
    },
    svgFallback: { avatarConfigId: 'sarah' },
  },
  jack: {
    id: 'jack',
    name: 'Jack',
    role: 'Technical Interviewer',
    description: 'Direct and analytical interviewer.',
    gender: 'male',
    language: 'en-US',
    enabled: true,
    did: {
      source_url: 'https://clips-presenters.d-id.com/v2/matt/hbMP8_7cv7/BTuR3JVOBy/image.png',
      voice_id: 'en-US-DavisNeural',
      voice_provider: 'microsoft',
    },
    svgFallback: { avatarConfigId: 'alex' },
  }
};

export const DEFAULT_PERSONA_ID = 'matt';

export function getPersonaById(id) {
  if (!id) return PERSONA_CATALOG[DEFAULT_PERSONA_ID];
  const normalizedId = id.toLowerCase();
  const persona = PERSONA_CATALOG[normalizedId];
  return persona && persona.enabled ? persona : PERSONA_CATALOG[DEFAULT_PERSONA_ID];
}

export function getEnabledPersonas() {
  return Object.values(PERSONA_CATALOG).filter(p => p.enabled);
}

export default {
  PERSONA_CATALOG,
  DEFAULT_PERSONA_ID,
  getPersonaById,
  getEnabledPersonas,
};

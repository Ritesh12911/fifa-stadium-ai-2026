/**
 * @fileoverview Gemini AI Client
 * @description Handles all communication with Google Gemini 1.5 Flash API.
 */

'use strict';

const GeminiClient = (() => {
  /** @type {string} Runtime API key (set by user in settings) */
  let _apiKey = CONFIG.GEMINI.API_KEY || '';

  /**
   * Sets the API key at runtime.
   * @param {string} key
   */
  function setApiKey(key) {
    _apiKey = key.trim();
  }

  /**
   * Returns whether an API key is configured.
   * @returns {boolean}
   */
  function isReady() {
    return _apiKey.length > 10;
  }

  /**
   * Sanitizes user input to prevent prompt injection.
   * @param {string} text
   * @returns {string}
   */
  function _sanitize(text) {
    return text
      .replace(/<[^>]*>/g, '')      // strip HTML
      .replace(/[{}]/g, '')          // strip template literals
      .slice(0, 2000)                // cap length
      .trim();
  }

  /**
   * Sends a message to Gemini and returns the response text.
   * @param {string} userMessage - Raw user text
   * @param {Array<{role:string, parts:Array}>} history - Conversation history
   * @param {string} [contextOverride] - Optional system context override
   * @returns {Promise<string>}
   */
  async function chat(userMessage, history = [], contextOverride = null) {
    if (!isReady()) {
      throw new Error('API_KEY_MISSING');
    }

    const safeMsg = _sanitize(userMessage);
    const systemContext = contextOverride || CONFIG.GEMINI.SYSTEM_CONTEXT;

    // Build conversation contents
    const contents = [
      {
        role: 'user',
        parts: [{ text: `[SYSTEM]: ${systemContext}` }]
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I am StadiumIQ, ready to assist.' }]
      },
      ...history,
      {
        role: 'user',
        parts: [{ text: safeMsg }]
      }
    ];

    const payload = {
      contents,
      generationConfig: {
        maxOutputTokens: CONFIG.GEMINI.MAX_TOKENS,
        temperature: CONFIG.GEMINI.TEMPERATURE,
        topP: 0.9,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ]
    };

    const res = await fetch(`${CONFIG.GEMINI.API_URL}?key=${encodeURIComponent(_apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('EMPTY_RESPONSE');
    return text.trim();
  }

  /**
   * Generates an incident analysis + recommendations for Decision Support.
   * @param {Object} incident
   * @returns {Promise<string>}
   */
  async function analyzeIncident(incident) {
    const prompt = `You are a stadium safety AI. Analyze this incident and provide:
1. Severity level (LOW/MEDIUM/HIGH/CRITICAL)
2. Immediate actions (3-5 bullet points)
3. Resources to deploy
4. Estimated resolution time

INCIDENT:
- Type: ${incident.type}
- Zone: ${incident.zone}
- Crowd density: ${incident.density}%
- Description: ${incident.description}

Reply in structured JSON format:
{
  "severity": "HIGH",
  "color": "#ff4444",
  "immediate_actions": ["Action 1", "Action 2"],
  "resources": ["Resource 1"],
  "eta_minutes": 15,
  "summary": "Brief AI summary"
}`;
    return chat(prompt, [], prompt);
  }

  /**
   * Gets AI navigation instructions between two POIs.
   * @param {string} from - POI id
   * @param {string} to - POI id
   * @param {boolean} accessible - Wheelchair-friendly route
   * @returns {Promise<string>}
   */
  async function getNavigationInstructions(from, to, accessible = false) {
    const fromPOI = CONFIG.POIS.find(p => p.id === from);
    const toPOI = CONFIG.POIS.find(p => p.id === to);
    if (!fromPOI || !toPOI) throw new Error('INVALID_POI');

    const prompt = `Generate clear, step-by-step stadium navigation instructions from "${fromPOI.label}" to "${toPOI.label}". ${accessible ? 'Use ONLY wheelchair-accessible routes.' : ''} Keep each step short and actionable. Format as numbered list. Max 6 steps.`;
    return chat(prompt, [], prompt);
  }

  return { setApiKey, isReady, chat, analyzeIncident, getNavigationInstructions };
})();

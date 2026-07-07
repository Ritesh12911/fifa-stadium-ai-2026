/**
 * @fileoverview Multilingual AI Assistant Module
 * @description Gemini-powered chatbot supporting 10+ languages for fans and staff.
 */

'use strict';

const Assistant = (() => {
  /** @type {Array<{role:string, parts:Array}>} Conversation history for Gemini */
  let _history = [];
  /** @type {boolean} Voice input active */
  let _listening = false;
  /** @type {SpeechRecognition|null} */
  let _recognition = null;

  // Quick reply suggestions per context
  const QUICK_REPLIES = {
    en: ['Where is Gate A?', 'Find nearest restroom', 'Show match schedule', 'Lost and found', 'Medical help'],
    es: ['¿Dónde está la Puerta A?', 'Baño más cercano', 'Horario de partidos', 'Objetos perdidos', 'Ayuda médica'],
    fr: ['Où est la Porte A?', 'Toilettes les plus proches', 'Programme des matchs', 'Objets trouvés', 'Aide médicale'],
    pt: ['Onde fica o Portão A?', 'Banheiro mais próximo', 'Calendário de jogos', 'Achados e perdidos', 'Ajuda médica'],
    ar: ['أين البوابة أ؟', 'أقرب دورة مياه', 'جدول المباريات', 'الأشياء المفقودة', 'مساعدة طبية'],
    zh: ['A门在哪里？', '最近的洗手间', '赛程安排', '失物招领', '医疗帮助'],
    de: ['Wo ist Tor A?', 'Nächste Toilette', 'Spielplan', 'Fundbüro', 'Medizinische Hilfe'],
    hi: ['गेट A कहाँ है?', 'नजदीकी शौचालय', 'मैच शेड्यूल', 'खोई-पाई', 'चिकित्सा सहायता'],
    ja: ['ゲートAはどこ？', '近くのトイレ', '試合スケジュール', '遺失物', '医療支援'],
    ko: ['A 게이트 어디 있어요?', '가장 가까운 화장실', '경기 일정', '분실물 센터', '의료 지원'],
  };

  let _currentLang = 'en';

  /**
   * Initializes the assistant module.
   */
  function init() {
    _setupVoiceRecognition();
    _renderQuickReplies(_currentLang);
  }

  /**
   * Sets up Web Speech API for voice input.
   */
  function _setupVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    _recognition = new SpeechRecognition();
    _recognition.continuous = false;
    _recognition.interimResults = false;

    _recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      const input = document.getElementById('chat-input');
      if (input) { input.value = text; input.focus(); }
      _stopListening();
    };

    _recognition.onerror = () => _stopListening();
    _recognition.onend = () => _stopListening();
  }

  function _stopListening() {
    _listening = false;
    const btn = document.getElementById('voice-btn');
    if (btn) { btn.classList.remove('active'); btn.setAttribute('aria-pressed', 'false'); }
  }

  /**
   * Toggles voice input.
   */
  function toggleVoice() {
    if (!_recognition) {
      App.showToast('Voice input not supported in this browser', 'warning');
      return;
    }
    if (_listening) {
      _recognition.stop();
      _stopListening();
    } else {
      _recognition.lang = _currentLang;
      _recognition.start();
      _listening = true;
      const btn = document.getElementById('voice-btn');
      if (btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); }
    }
  }

  /**
   * Renders language selector.
   * @param {string} selectedCode
   */
  function renderLanguageSelector(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = CONFIG.LANGUAGES.map(lang => `
      <button class="lang-btn ${lang.code === _currentLang ? 'active' : ''}"
              data-lang="${lang.code}"
              aria-pressed="${lang.code === _currentLang}"
              title="${lang.label}">
        <span class="lang-flag">${lang.flag}</span>
        <span class="lang-name">${lang.label}</span>
      </button>`).join('');

    el.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _currentLang = btn.dataset.lang;
        el.querySelectorAll('.lang-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.lang === _currentLang);
          b.setAttribute('aria-pressed', b.dataset.lang === _currentLang);
        });
        _renderQuickReplies(_currentLang);   // re-renders + attaches new listeners
        if (_recognition) _recognition.lang = _currentLang;
      });
    });
  }

  function _renderQuickReplies(lang) {
    const el = document.getElementById('quick-replies');
    if (!el) return;
    const replies = QUICK_REPLIES[lang] || QUICK_REPLIES.en;

    // Build buttons WITHOUT inline onclick (double-quotes from JSON.stringify break attributes)
    el.innerHTML = replies.map((r, i) => `
      <button class="quick-reply-btn" data-reply-index="${i}"
              aria-label="Quick reply: ${r.replace(/"/g, '&quot;')}">
        ${r}
      </button>`).join('');

    // Attach listeners safely — no quote-escaping issues
    el.querySelectorAll('.quick-reply-btn').forEach((btn, i) => {
      btn.addEventListener('click', () => sendQuickReply(replies[i]));
    });
  }

  /**
   * Sends a quick reply message.
   * @param {string} text
   */
  function sendQuickReply(text) {
    const input = document.getElementById('chat-input');
    if (input) input.value = text;
    sendMessage();
  }

  /**
   * Sends the current input as a chat message.
   */
  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const chatLog = document.getElementById('chat-log');
    if (!input || !chatLog) return;

    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    // Append user bubble
    _appendBubble(chatLog, 'user', text);
    chatLog.scrollTop = chatLog.scrollHeight;

    // Typing indicator
    const typingId = `typing-${Date.now()}`;
    chatLog.insertAdjacentHTML('beforeend', `
      <div class="msg-row bot" id="${typingId}" aria-live="polite" aria-label="StadiumIQ is typing">
        <div class="msg-avatar">🏟️</div>
        <div class="msg-bubble typing-bubble">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      </div>`);
    chatLog.scrollTop = chatLog.scrollHeight;

    try {
      let reply;
      if (GeminiClient.isReady()) {
        reply = await GeminiClient.chat(text, _history);
        // Add to history (keep last 10 turns)
        _history.push({ role: 'user', parts: [{ text }] });
        _history.push({ role: 'model', parts: [{ text: reply }] });
        if (_history.length > 20) _history = _history.slice(-20);
      } else {
        reply = _getDemoResponse(text);
      }

      document.getElementById(typingId)?.remove();
      _appendBubble(chatLog, 'bot', reply);
    } catch (e) {
      document.getElementById(typingId)?.remove();
      const errMsg = e.message === 'API_KEY_MISSING'
        ? '🔑 Please add your Gemini API key in ⚙️ Settings to enable AI responses. I\'m running in demo mode for now!'
        : `⚠️ Error: ${e.message}`;
      _appendBubble(chatLog, 'bot', errMsg, true);
    }

    chatLog.scrollTop = chatLog.scrollHeight;
  }

  /**
   * Appends a chat bubble to the log.
   * @param {Element} log
   * @param {'user'|'bot'} role
   * @param {string} text
   * @param {boolean} isError
   */
  function _appendBubble(log, role, text, isError = false) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatted = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const safeText = text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    log.insertAdjacentHTML('beforeend', `
      <div class="msg-row ${role}" role="listitem">
        ${role === 'bot' ? '<div class="msg-avatar" aria-hidden="true">🏟️</div>' : ''}
        <div class="msg-bubble ${isError ? 'error' : ''}" aria-label="${role === 'user' ? 'You' : 'StadiumIQ'}: ${safeText}">
          ${formatted}
          <span class="msg-time" aria-hidden="true">${time}</span>
        </div>
        ${role === 'user' ? '<div class="msg-avatar user-av" aria-hidden="true">👤</div>' : ''}
      </div>`);
  }

  /**
   * Demo responses for when no API key is set.
   * @param {string} text
   * @returns {string}
   */
  function _getDemoResponse(text) {
    const t = text.toLowerCase();
    if (t.includes('gate') || t.includes('entrada') || t.includes('porte') || t.includes('portão')) {
      return '🚪 **Gate A** (Main Entrance) is at the North end of the stadium.\nShow your ticket QR code to security staff.\nGates open 2 hours before kickoff.\nNeed directions to a specific gate? Try the **Smart Navigation** module!';
    }
    if (t.includes('restroom') || t.includes('toilet') || t.includes('bathroom') || t.includes('baño') || t.includes('toilette') || t.includes('banheiro') || t.includes('nearest')) {
      return '🚻 Nearest restrooms:\n- **North Concourse** — Sections 102–108\n- **South Concourse** — Sections 220–228\n- **East Wing** — Level 2\n\nAll restrooms are wheelchair accessible. Use **Smart Navigation** to find the closest one to you!';
    }
    if (t.includes('food') || t.includes('eat') || t.includes('hungry') || t.includes('comida') || t.includes('manger') || t.includes('schedule') || t.includes('match') || t.includes('partido') || t.includes('horario')) {
      if (t.includes('schedule') || t.includes('match') || t.includes('partido')) {
        return '⚽ **Today at MetLife Stadium:**\n- 15:00 — Group A: Brazil 🇧🇷 vs Germany 🇩🇪\n- 20:00 — Group B: France 🇫🇷 vs Argentina 🇦🇷\n\nDoors open 2 hours before each match. Check the official FIFA app for live updates!';
      }
      return '🍔 **Food Courts:**\n- **Court A** (West concourse) — American & Mexican cuisine\n- **Court B** (East concourse) — International options\n- **Court C** (North upper) — Snacks & beverages\n\nAll dietary options labeled. Average wait time: 8–12 min.';
    }
    if (t.includes('lost') || t.includes('found') || t.includes('perdido') || t.includes('perdu')) {
      return '🔍 **Lost & Found** is located at the **Info Desk** near Gate A (North entrance).\n\nOperating hours: 2 hours before kickoff to 1 hour after final whistle.\n📞 Stadium hotline: **+1-800-FIFA-2026**';
    }
    if (t.includes('medical') || t.includes('help') || t.includes('emergency') || t.includes('hurt') || t.includes('ayuda') || t.includes('aide')) {
      return '🏥 **Medical Centers:**\n- Section 115 (field level, east side)\n- Section 235 (field level, west side)\n- First Aid at every gate entrance\n\n🚨 **Emergency?** Alert any staff member in a **red vest**, or call: **+1-800-FIFA-2026**';
    }
    return '👋 Welcome to **StadiumIQ**! I\'m your AI assistant for FIFA World Cup 2026.\nI can help with:\n- 🗺️ Navigation & directions\n- 🍔 Food & amenities\n- 🚨 Emergency info\n- ⚽ Match schedules\n- 🌐 Multi-language support\n\n💡 Add your **Gemini API key** in ⚙️ Settings for full AI-powered responses!';
  }

  /**
   * Clears the chat history.
   */
  function clearChat() {
    _history = [];
    const log = document.getElementById('chat-log');
    if (log) {
      log.innerHTML = `<div class="msg-row bot" role="listitem">
        <div class="msg-avatar" aria-hidden="true">🏟️</div>
        <div class="msg-bubble">
          👋 Hello! I'm <strong>StadiumIQ</strong>, your AI assistant for FIFA World Cup 2026.
          How can I help you today? You can ask me in any language!
          <span class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>`;
    }
  }

  return { init, renderLanguageSelector, sendMessage, sendQuickReply, toggleVoice, clearChat };
})();

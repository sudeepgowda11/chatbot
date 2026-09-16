/* ==========================================================================
   SAGE — an AI you can think with
   Vanilla JS, no build step, no dependencies. Talks directly to the Gemini
   API's Interactions endpoint (https://ai.google.dev/gemini-api/docs) from
   the browser using the free API key you paste into Settings.

   NOTE ON SECURITY: storing an API key in localStorage and calling Google's
   API directly from the browser is convenient for a personal project or demo,
   but it exposes the key to anyone with access to this browser/machine. For
   anything you ship to other people, proxy the request through a small
   backend that holds the key instead.

   NOTE ON RUNNING THIS: this is a fully static site — no server required.
   Just open index.html in a browser, or serve the folder with VS Code's
   Live Server / `python -m http.server`. Either way works the same.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* Config                                                                  */
/* ---------------------------------------------------------------------- */

const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const DEFAULT_TITLE = "New conversation";
const DEFAULT_MODEL = "models/gemini-3.6-flash";
const KNOWN_MODELS = [DEFAULT_MODEL];
const DEFAULT_LANGUAGE = "en";
const LANGUAGE_STORAGE_KEY = "sage_language";
const LANGUAGE_NAMES = {
    en: "English",
    kn: "Kannada",
    hi: "Hindi",
    ta: "Tamil",
    te: "Telugu",
};
const TRANSLATIONS = {
    en: {
        heroGreeting: "Ask me anything.",
        heroSub: "I'm Sage — calm, considered, and a little curious. Powered by Gemini.",
        hintSimple: "Explain something simply",
        hintCode: "Write some code",
        hintDinner: "Plan a quick dinner",
        footnote: "Sage can make mistakes. Consider checking important information.",
        placeholder: "Message Sage…",
        hints: [
            "Explain quantum computing the way you'd explain it to a curious 12-year-old.",
            "Give me a clean, well-commented Python function to check if a string is a palindrome.",
            "I have onions, eggs, and leftover rice. Suggest a quick dinner.",
        ],
    },
    kn: {
        heroGreeting: "ನಿಮಗೆ ಬೇಕಾದುದನ್ನು ಕೇಳಿ.",
        heroSub: "ನಾನು Sage — ಶಾಂತ, ವಿಚಾರಶೀಲ ಮತ್ತು ಕುತೂಹಲದಿಂದ ಕೂಡಿದ್ದೇನೆ. Gemini ನಿಂದ ಚಾಲಿತ.",
        hintSimple: "ಸರಳವಾಗಿ ವಿವರಿಸಿ",
        hintCode: "ಕೋಡ್ ಬರೆಯಿರಿ",
        hintDinner: "ತ್ವರಿತ ಭೋಜನ ಯೋಜಿಸಿ",
        footnote: "Sage ತಪ್ಪುಗಳನ್ನು ಮಾಡಬಹುದು. ಮುಖ್ಯ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
        placeholder: "Sage ಗೆ ಸಂದೇಶ…",
        hints: [
            "ಕುತೂಹಲವುಳ್ಳ 12 ವರ್ಷದ ಮಗುವಿಗೆ ವಿವರಿಸುವಂತೆ ಕ್ವಾಂಟಮ್ ಕಂಪ್ಯೂಟಿಂಗ್ ಅನ್ನು ವಿವರಿಸಿ.",
            "ಸ್ಟ್ರಿಂಗ್ ಪ್ಯಾಲಿಂಡ್ರೋಮ್ ಆಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸುವ ಸ್ವಚ್ಛವಾದ Python ಫಂಕ್ಷನ್ ಬರೆಯಿರಿ.",
            "ನನ್ನ ಬಳಿ ಈರುಳ್ಳಿ, ಮೊಟ್ಟೆ ಮತ್ತು ಉಳಿದ ಅನ್ನ ಇದೆ. ತ್ವರಿತ ಭೋಜನವನ್ನು ಸೂಚಿಸಿ.",
        ],
    },
    hi: {
        heroGreeting: "मुझसे कुछ भी पूछें।",
        heroSub: "मैं Sage हूँ — शांत, विचारशील और थोड़ा जिज्ञासु। Gemini द्वारा संचालित।",
        hintSimple: "सरल तरीके से समझाएँ",
        hintCode: "कुछ कोड लिखें",
        hintDinner: "जल्दी बनने वाला भोजन सुझाएँ",
        footnote: "Sage गलतियाँ कर सकता है। महत्वपूर्ण जानकारी जाँच लें।",
        placeholder: "Sage को संदेश दें…",
        hints: [
            "क्वांटम कंप्यूटिंग को ऐसे समझाएँ जैसे आप इसे 12 साल के जिज्ञासु बच्चे को समझा रहे हों।",
            "यह जाँचने के लिए साफ-सुथरा Python फ़ंक्शन लिखें कि कोई स्ट्रिंग पैलिंड्रोम है या नहीं।",
            "मेरे पास प्याज, अंडे और बचा हुआ चावल है। जल्दी बनने वाला भोजन सुझाएँ।",
        ],
    },
    ta: {
        heroGreeting: "எதையும் என்னிடம் கேளுங்கள்.",
        heroSub: "நான் Sage — அமைதியான, சிந்தனையுள்ள, ஆர்வமுள்ள AI. Gemini மூலம் இயக்கப்படுகிறது.",
        hintSimple: "எளிமையாக விளக்குங்கள்",
        hintCode: "குறியீடு எழுதுங்கள்",
        hintDinner: "விரைவான இரவு உணவைத் திட்டமிடுங்கள்",
        footnote: "Sage தவறுகளைச் செய்யலாம். முக்கியமான தகவல்களைச் சரிபார்க்கவும்.",
        placeholder: "Sage-க்கு செய்தி அனுப்புங்கள்…",
        hints: [
            "ஆர்வமுள்ள 12 வயது குழந்தைக்கு விளக்குவது போல் குவாண்டம் கம்ப்யூட்டிங்கை விளக்குங்கள்.",
            "ஒரு சரம் பாலிண்ட்ரோமா என்பதைச் சரிபார்க்க சுத்தமான Python செயல்பாட்டை எழுதுங்கள்.",
            "என்னிடம் வெங்காயம், முட்டை மற்றும் மீதமுள்ள சாதம் உள்ளது. விரைவான இரவு உணவைப் பரிந்துரைக்கவும்.",
        ],
    },
    te: {
        heroGreeting: "ఏదైనా నన్ను అడగండి.",
        heroSub: "నేను Sage — ప్రశాంతమైన, ఆలోచనాత్మకమైన, కొంచెం ఆసక్తికరమైన AI. Gemini ద్వారా పనిచేస్తుంది.",
        hintSimple: "సులభంగా వివరించండి",
        hintCode: "కోడ్ రాయండి",
        hintDinner: "త్వరగా తయారయ్యే భోజనం సూచించండి",
        footnote: "Sage తప్పులు చేయవచ్చు. ముఖ్యమైన సమాచారాన్ని తనిఖీ చేయండి.",
        placeholder: "Sageకి సందేశం పంపండి…",
        hints: [
            "ఆసక్తిగల 12 ఏళ్ల పిల్లవాడికి వివరించినట్లు క్వాంటం కంప్యూటింగ్‌ను వివరించండి.",
            "స్ట్రింగ్ పాలిండ్రోమ్ కాదా అని తనిఖీ చేయడానికి చక్కని Python ఫంక్షన్ రాయండి.",
            "నా దగ్గర ఉల్లిపాయలు, గుడ్లు మరియు మిగిలిన అన్నం ఉన్నాయి. త్వరగా తయారయ్యే భోజనం సూచించండి.",
        ],
    },
};
const DEFAULT_PERSONA =
    "You are Sage, a calm, thoughtful, and precise AI assistant. Keep responses clear and well organized, and use markdown (headings, lists, code blocks) only when it genuinely improves readability.";

const STORAGE_KEYS = {
    apiKey: "sage_api_key",
    persona: "sage_persona",
    theme: "sage_theme",
    store: "sage_store",
};

/* ---------------------------------------------------------------------- */
/* DOM references                                                         */
/* ---------------------------------------------------------------------- */

const sidebarEl = document.getElementById("sidebar");
const sidebarOpenBtn = document.getElementById("sidebarOpenBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarScrim = document.getElementById("sidebarScrim");
const newChatBtn = document.getElementById("newChatBtn");
const conversationList = document.getElementById("conversationList");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const settingsBtn = document.getElementById("settingsBtn");

const chatTitle = document.getElementById("chatTitle");
const modelSelect = document.getElementById("modelSelect");
const languageSelect = document.getElementById("languageSelect");
const customModelInput = document.getElementById("customModelInput");
const exportBtn = document.getElementById("exportBtn");

const chatScroll = document.getElementById("chatScroll");
const emptyState = document.getElementById("emptyState");
const messagesEl = document.getElementById("messages");

const composer = document.getElementById("composer");
const composerInput = document.getElementById("composerInput");
const micBtn = document.getElementById("micBtn");
const sendBtn = document.getElementById("sendBtn");
const stopBtn = document.getElementById("stopBtn");
const tempSlider = document.getElementById("tempSlider");
const tempValue = document.getElementById("tempValue");
const composerMeta = document.getElementById("composerMeta");

const settingsOverlay = document.getElementById("settingsOverlay");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const settingsCancelBtn = document.getElementById("settingsCancelBtn");
const settingsSaveBtn = document.getElementById("settingsSaveBtn");
const apiKeyInput = document.getElementById("apiKeyInput");
const toggleKeyVisibilityBtn = document.getElementById("toggleKeyVisibilityBtn");
const personaInput = document.getElementById("personaInput");

const toastStack = document.getElementById("toastStack");

/* ---------------------------------------------------------------------- */
/* State                                                                   */
/* ---------------------------------------------------------------------- */

let store = loadStore(); // { conversations: {id: conv}, order: [ids], activeId }
let currentAbortController = null;
const messageEls = new Map(); // messageId -> { root, avatar, content, meta }

function getLanguage() {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return TRANSLATIONS[saved] ? saved : DEFAULT_LANGUAGE;
}

function getLanguageInstruction() {
    return `Always respond in ${LANGUAGE_NAMES[getLanguage()]}.`;
}

function applyLanguage(language) {
    const selected = TRANSLATIONS[language] ? language : DEFAULT_LANGUAGE;
    const translation = TRANSLATIONS[selected];
    languageSelect.value = selected;
    document.documentElement.lang = selected;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, selected);

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        if (translation[key]) element.textContent = translation[key];
    });
    composerInput.placeholder = translation.placeholder;
    document.querySelectorAll(".hint-chip").forEach((chip, index) => {
        chip.dataset.hint = translation.hints[index];
    });
}

/* ---------------------------------------------------------------------- */
/* Persistence helpers                                                    */
/* ---------------------------------------------------------------------- */

function loadStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.store);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.conversations && parsed.order) {
                Object.values(parsed.conversations).forEach((conversation) => {
                    if (conversation.model === "gemini-2.5-flash" || conversation.model === "models/gemini-2.5-flash") {
                        conversation.model = DEFAULT_MODEL;
                    }
                });
                return parsed;
            }
        }
    } catch (_) {
        /* ignore corrupt storage */
    }
    return { conversations: {}, order: [], activeId: null };
}

function saveStore() {
    try {
        localStorage.setItem(STORAGE_KEYS.store, JSON.stringify(store));
    } catch (_) {
        toast("Couldn't save — your browser storage may be full.", "error");
    }
}

function getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.apiKey) || "";
}
function getPersona() {
    const saved = localStorage.getItem(STORAGE_KEYS.persona);
    const persona = saved === null ? DEFAULT_PERSONA : saved;
    return `${persona}\n\n${getLanguageInstruction()}`;
}

function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ---------------------------------------------------------------------- */
/* Conversation management                                                */
/* ---------------------------------------------------------------------- */

function getActiveConversation() {
    return store.conversations[store.activeId] || null;
}

function resolveModel() {
    if (modelSelect.value === "__custom__") {
        return customModelInput.value.trim() || DEFAULT_MODEL;
    }
    return modelSelect.value;
}

function createConversation() {
    const conv = {
        id: uid(),
        title: DEFAULT_TITLE,
        model: resolveModel(),
        temperature: Number(tempSlider.value),
        systemInstruction: getPersona(),
        lastInteractionId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
    };
    store.conversations[conv.id] = conv;
    store.order.unshift(conv.id);
    store.activeId = conv.id;
    saveStore();
    return conv;
}

function newConversation() {
    createConversation();
    renderActiveConversation();
    renderConversationList();
    closeSidebar();
    composerInput.focus();
}

function selectConversation(id) {
    if (!store.conversations[id] || id === store.activeId) {
        closeSidebar();
        return;
    }
    store.activeId = id;
    saveStore();
    renderActiveConversation();
    renderConversationList();
    closeSidebar();
}

function deleteConversation(id) {
    if (!confirm("Delete this conversation? This can't be undone.")) return;
    delete store.conversations[id];
    store.order = store.order.filter((x) => x !== id);
    if (store.activeId === id) {
        store.activeId = store.order[0] || null;
    }
    saveStore();
    renderActiveConversation();
    renderConversationList();
}

function titleFromText(text) {
    if (!text) return "";
    const clean = text.replace(/\s+/g, " ").trim();
    return clean.length > 42 ? clean.slice(0, 42).trim() + "…" : clean;
}

/* ---------------------------------------------------------------------- */
/* Sidebar / conversation list rendering                                  */
/* ---------------------------------------------------------------------- */

function renderConversationList() {
    conversationList.innerHTML = "";
    const todayStr = new Date().toDateString();
    const todayItems = [];
    const earlierItems = [];

    store.order.forEach((id) => {
        const conv = store.conversations[id];
        if (!conv) return;
        const bucket = new Date(conv.updatedAt).toDateString() === todayStr ? todayItems : earlierItems;
        bucket.push(conv);
    });

    const buildSection = (label, items) => {
        if (!items.length) return;
        const heading = document.createElement("div");
        heading.className = "list-heading";
        heading.textContent = label;
        conversationList.appendChild(heading);
        items.forEach((conv) => conversationList.appendChild(buildConvItem(conv)));
    };

    buildSection("Today", todayItems);
    buildSection("Earlier", earlierItems);
}

function buildConvItem(conv) {
    const item = document.createElement("div");
    item.className = "conv-item" + (conv.id === store.activeId ? " active" : "");
    item.dataset.id = conv.id;

    const title = document.createElement("span");
    title.className = "conv-title";
    title.textContent = conv.title;

    const del = document.createElement("button");
    del.className = "conv-delete";
    del.setAttribute("aria-label", "Delete conversation");
    del.innerHTML = '<svg class="icon"><use href="#i-trash"/></svg>';
    del.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteConversation(conv.id);
    });

    item.appendChild(title);
    item.appendChild(del);
    item.addEventListener("click", () => selectConversation(conv.id));
    return item;
}

/* ---------------------------------------------------------------------- */
/* Message rendering                                                      */
/* ---------------------------------------------------------------------- */

function renderActiveConversation() {
    const conv = getActiveConversation();
    messagesEl.innerHTML = "";
    messageEls.clear();

    if (!conv) {
        chatTitle.textContent = DEFAULT_TITLE;
        emptyState.hidden = false;
        updateComposerMeta(null);
        return;
    }

    chatTitle.textContent = conv.title;

    if (KNOWN_MODELS.includes(conv.model)) {
        modelSelect.value = conv.model;
        customModelInput.hidden = true;
    } else {
        modelSelect.value = "__custom__";
        customModelInput.hidden = false;
        customModelInput.value = conv.model;
    }

    tempSlider.value = conv.temperature;
    tempValue.textContent = formatTemp(conv.temperature);

    conv.messages.forEach((m) => {
        const els = renderMessage(m, conv);
        messageEls.set(m.id, els);
    });

    emptyState.hidden = conv.messages.length > 0;
    updateComposerMeta(conv);
    scrollToBottom();
}

function renderMessage(msg) {
    const root = document.createElement("div");
    root.className = `msg ${msg.role}`;
    root.dataset.id = msg.id;

    let avatar = null;
    if (msg.role === "model") {
        avatar = document.createElement("div");
        avatar.className = "msg-avatar" + (msg.streaming ? " thinking" : "");
        root.appendChild(avatar);
    }

    const body = document.createElement("div");
    body.className = "msg-body";

    const content = document.createElement("div");
    content.className = "msg-content";

    const meta = document.createElement("div");
    meta.className = "msg-meta";

    body.appendChild(content);
    body.appendChild(meta);
    root.appendChild(body);
    messagesEl.appendChild(root);

    const els = { root, avatar, content, meta };

    if (msg.role === "user") {
        renderUserContent(els, msg);
        renderUserMeta(els, msg);
    } else {
        if (msg.streaming) {
            updateStreamingContent(els, msg.text);
        } else if (msg.error) {
            renderErrorContent(els, msg);
        } else {
            content.innerHTML = renderMarkdown(msg.text) || "<p></p>";
        }
        renderModelMeta(els, msg);
    }

    return els;
}

function renderUserContent(els, msg) {
    els.content.innerHTML = "";
    if (msg.image) {
        const img = document.createElement("img");
        img.src = msg.image.dataUrl;
        img.className = "msg-image";
        img.alt = "Attached image";
        els.content.appendChild(img);
    }
    if (msg.text) {
        const p = document.createElement("p");
        p.textContent = msg.text;
        els.content.appendChild(p);
    }
}

function renderUserMeta(els, msg) {
    els.meta.innerHTML = "";
    els.meta.appendChild(actionButton("edit", msg.id, "Edit message"));
    els.meta.appendChild(actionButton("copy", msg.id, "Copy message"));
}

function renderModelMeta(els, msg) {
    els.meta.innerHTML = "";
    if (msg.streaming || msg.error) return;
    els.meta.appendChild(actionButton("speak", msg.id, "Read aloud"));
    els.meta.appendChild(actionButton("regenerate", msg.id, "Regenerate response"));
    els.meta.appendChild(actionButton("copy", msg.id, "Copy response"));
    if (msg.usage && msg.usage.total_tokens) {
        const tok = document.createElement("span");
        tok.className = "msg-tokens";
        tok.textContent = `${msg.usage.total_tokens.toLocaleString()} tokens`;
        els.meta.appendChild(tok);
    }
}

function actionButton(action, id, label) {
    const iconMap = { edit: "i-pencil", copy: "i-copy", regenerate: "i-refresh", speak: "i-speaker" };
    const btn = document.createElement("button");
    btn.className = "msg-action";
    btn.dataset.action = action;
    btn.dataset.id = id;
    btn.type = "button";
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = `<svg class="icon"><use href="#${iconMap[action]}"/></svg>`;
    return btn;
}

function updateStreamingContent(els, text) {
    els.content.innerHTML = "";
    const span = document.createElement("span");
    span.className = "stream-text";
    span.textContent = text;
    const caret = document.createElement("span");
    caret.className = "caret";
    els.content.appendChild(span);
    els.content.appendChild(caret);
}

function renderErrorContent(els, msg) {
    els.content.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "msg-error";
    const span = document.createElement("span");
    span.textContent = msg.error;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Try again";
    retry.dataset.action = "regenerate";
    retry.dataset.id = msg.id;
    wrap.appendChild(span);
    wrap.appendChild(retry);
    els.content.appendChild(wrap);
}

function finalizeMessageElement(els, msg) {
    if (els.avatar) els.avatar.classList.remove("thinking");
    if (msg.error) {
        renderErrorContent(els, msg);
    } else {
        els.content.innerHTML = renderMarkdown(msg.text) || "<p></p>";
    }
    renderModelMeta(els, msg);
}

function formatTemp(v) {
    return (Math.round(Number(v) * 100) / 100).toString();
}

function updateComposerMeta(conv) {
    if (!conv) {
        composerMeta.textContent = "";
        return;
    }
    const total = conv.messages.reduce((sum, m) => sum + (m.usage && m.usage.total_tokens ? m.usage.total_tokens : 0), 0);
    composerMeta.textContent = total ? `${total.toLocaleString()} tokens this chat` : "";
}

function scrollToBottom() {
    chatScroll.scrollTop = chatScroll.scrollHeight;
}
function scrollToBottomIfNear() {
    const nearBottom = chatScroll.scrollHeight - chatScroll.scrollTop - chatScroll.clientHeight < 130;
    if (nearBottom) scrollToBottom();
}

/* ---------------------------------------------------------------------- */
/* Markdown rendering (small, dependency-free)                            */
/* ---------------------------------------------------------------------- */

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderMarkdown(raw) {
    if (!raw) return "";

    // 1. Pull fenced code blocks out first so nothing else touches their contents.
    const codeBlocks = [];
    let text = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push({ lang: lang || "", code: code.replace(/\n$/, "") });
        return `\u0000CODEBLOCK${idx}\u0000`;
    });

    // 2. Escape the rest, then layer markdown on top of the escaped text.
    text = escapeHtml(text);

    text = text.replace(/`([^`\n]+)`/g, (m, c) => `<code>${c}</code>`);
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    text = text.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    text = text.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    text = text.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    text = text.replace(/^&gt; ?(.*)$/gm, "<blockquote>$1</blockquote>");

    // 3. Group consecutive list lines into <ul>/<ol> blocks.
    const lines = text.split("\n");
    const grouped = [];
    let listBuffer = [];
    let listType = null;
    const flushList = () => {
        if (!listBuffer.length) return;
        const tag = listType === "ol" ? "ol" : "ul";
        grouped.push(`<${tag}>` + listBuffer.map((li) => `<li>${li}</li>`).join("") + `</${tag}>`);
        listBuffer = [];
        listType = null;
    };
    for (const line of lines) {
        const ulMatch = line.match(/^[-*] (.+)$/);
        const olMatch = line.match(/^\d+\. (.+)$/);
        if (ulMatch) {
            if (listType && listType !== "ul") flushList();
            listType = "ul";
            listBuffer.push(ulMatch[1]);
        } else if (olMatch) {
            if (listType && listType !== "ol") flushList();
            listType = "ol";
            listBuffer.push(olMatch[1]);
        } else {
            flushList();
            grouped.push(line);
        }
    }
    flushList();
    text = grouped.join("\n");

    // 4. Wrap plain-text paragraphs, leaving block-level elements untouched.
    const blocks = text.split(/\n{2,}/).map((block) => {
        const t = block.trim();
        if (!t) return "";
        if (/^<(h[1-3]|ul|ol|blockquote)/.test(t)) return t;
        if (/^\u0000CODEBLOCK\d+\u0000$/.test(t)) return t;
        return `<p>${t.replace(/\n/g, "<br>")}</p>`;
    });
    text = blocks.join("\n");

    // 5. Restore code blocks as real elements with a copy button.
    text = text.replace(/\u0000CODEBLOCK(\d+)\u0000/g, (m, idx) => {
        const block = codeBlocks[Number(idx)];
        const label = block.lang || "text";
        return (
            `<div class="code-block"><div class="code-block-header"><span>${escapeHtml(label)}</span>` +
            `<button class="code-copy-btn" type="button" data-action="copy-code">` +
            `<svg class="icon"><use href="#i-copy"/></svg>Copy</button></div>` +
            `<pre><code>${escapeHtml(block.code)}</code></pre></div>`
        );
    });

    return text;
}

function stripMarkdown(text) {
    return text
        .replace(/```[\s\S]*?```/g, " code block omitted ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/[*_#>]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

/* ---------------------------------------------------------------------- */
/* Gemini Interactions API — streaming client                             */
/* ---------------------------------------------------------------------- */

function buildInput(text, image) {
    const parts = [];
    if (text) parts.push({ type: "text", text });
    if (image) parts.push({ type: "image", data: image.base64, mime_type: image.mimeType });
    if (parts.length === 0) return text || "";
    if (parts.length === 1 && parts[0].type === "text") return text;
    return parts;
}

async function streamInteraction({
    apiKey,
    model,
    input,
    systemInstruction,
    temperature,
    previousInteractionId,
    signal,
    onCreated,
    onTextDelta,
    onCompleted,
    onError,
}) {
    const body = {
        model,
        input,
        generation_config: { temperature },
        stream: true,
    };
    if (systemInstruction) body.system_instruction = systemInstruction;
    if (previousInteractionId) body.previous_interaction_id = previousInteractionId;

    const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
        signal,
    });

    if (!res.ok || !res.body) {
        let message = `Gemini returned an error (status ${res.status}).`;
        try {
            const errJson = await res.json();
            if (errJson && errJson.error && errJson.error.message) message = errJson.error.message;
        } catch (_) {
            /* body wasn't JSON — keep the generic message */
        }
        if (res.status === 401 || res.status === 403) {
            message = "That API key was rejected. Double-check it in Settings.";
        } else if (res.status === 429) {
            message = "Gemini's free-tier rate limit was hit. Wait a moment and try again.";
        }
        throw new Error(message);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let frameEnd;
        while ((frameEnd = buffer.indexOf("\n\n")) !== -1) {
            const frame = buffer.slice(0, frameEnd);
            buffer = buffer.slice(frameEnd + 2);

            const dataLines = frame.split("\n").filter((l) => l.startsWith("data:"));
            if (!dataLines.length) continue;
            const dataStr = dataLines.map((l) => l.slice(5).trim()).join("\n");
            if (dataStr === "[DONE]") continue;

            let evt;
            try {
                evt = JSON.parse(dataStr);
            } catch (_) {
                continue; // skip malformed/unknown frames rather than crash the stream
            }

            switch (evt.event_type) {
                case "interaction.created":
                    if (evt.interaction && evt.interaction.id) onCreated && onCreated(evt.interaction.id);
                    break;
                case "step.delta":
                    if (evt.delta && evt.delta.type === "text" && typeof evt.delta.text === "string") {
                        onTextDelta && onTextDelta(evt.delta.text);
                    }
                    break;
                case "interaction.completed":
                    onCompleted && onCompleted(evt.interaction ? evt.interaction.usage : null);
                    break;
                case "error":
                    onError && onError((evt.error && evt.error.message) || "Gemini reported an unknown error.");
                    break;
                default:
                    break; // step.start / step.stop / thinking deltas / status updates — ignored on purpose
            }
        }
    }
}

/* ---------------------------------------------------------------------- */
/* Send / regenerate / edit flows                                         */
/* ---------------------------------------------------------------------- */

async function sendMessage() {
    const text = composerInput.value.trim();
    if (!text) return;
    if (currentAbortController) return;

    let conv = getActiveConversation();
    if (!conv) conv = createConversation();

    const userMsg = {
        id: uid(),
        role: "user",
        text,
        image: null,
        parentInteractionId: conv.lastInteractionId || null,
        ts: Date.now(),
    };
    conv.messages.push(userMsg);
    const uEls = renderMessage(userMsg, conv);
    messageEls.set(userMsg.id, uEls);
    emptyState.hidden = true;
    scrollToBottom();

    composerInput.value = "";
    autoResize(composerInput);

    conv.updatedAt = Date.now();
    saveStore();
    renderConversationList();

    await runAssistantTurn(conv, userMsg);
}

async function runAssistantTurn(conv, userMsg) {
    const apiKey = getApiKey();
    if (!apiKey) {
        toast("Add your Gemini API key in Settings to start chatting.", "error");
        openSettings();
        return;
    }

    const assistantMsg = {
        id: uid(),
        role: "model",
        text: "",
        image: null,
        interactionId: null,
        usage: null,
        streaming: true,
        error: null,
        ts: Date.now(),
    };
    conv.messages.push(assistantMsg);
    const els = renderMessage(assistantMsg, conv);
    messageEls.set(assistantMsg.id, els);
    scrollToBottom();

    const controller = new AbortController();
    currentAbortController = controller;
    setGenerating(true);

    const input = buildInput(
        userMsg.text,
        userMsg.image ? { base64: userMsg.image.base64, mimeType: userMsg.image.mimeType } : null
    );

    try {
        await streamInteraction({
            apiKey,
            model: conv.model || resolveModel(),
            input,
            systemInstruction: conv.systemInstruction || "",
            temperature: conv.temperature,
            previousInteractionId: userMsg.parentInteractionId,
            signal: controller.signal,
            onCreated: (id) => {
                assistantMsg.interactionId = id;
                conv.lastInteractionId = id;
                if (conv.title === DEFAULT_TITLE) {
                    conv.title = titleFromText(userMsg.text) || "Image message";
                    chatTitle.textContent = conv.title;
                    renderConversationList();
                }
            },
            onTextDelta: (delta) => {
                assistantMsg.text += delta;
                updateStreamingContent(els, assistantMsg.text);
                scrollToBottomIfNear();
            },
            onCompleted: (usage) => {
                assistantMsg.usage = usage || null;
            },
            onError: (message) => {
                assistantMsg.error = message;
            },
        });
    } catch (err) {
        if (err && err.name === "AbortError") {
            // user pressed Stop — keep whatever text streamed in so far
        } else {
            assistantMsg.error = (err && err.message) || "Something went wrong talking to Gemini.";
            toast(assistantMsg.error, "error");
        }
    } finally {
        assistantMsg.streaming = false;
        finalizeMessageElement(els, assistantMsg);
        setGenerating(false);
        currentAbortController = null;
        conv.updatedAt = Date.now();
        saveStore();
        updateComposerMeta(conv);
    }
}

async function regenerate(msgId) {
    if (currentAbortController) return;
    const conv = getActiveConversation();
    if (!conv) return;
    const idx = conv.messages.findIndex((m) => m.id === msgId);
    if (idx < 1) return;
    const userMsg = conv.messages[idx - 1];
    if (!userMsg || userMsg.role !== "user") return;

    const removed = conv.messages.splice(idx);
    removed.forEach((m) => {
        const els = messageEls.get(m.id);
        if (els) els.root.remove();
        messageEls.delete(m.id);
    });

    await runAssistantTurn(conv, userMsg);
}

async function editAndResend(msgId, newText) {
    if (currentAbortController) return;
    const conv = getActiveConversation();
    if (!conv) return;
    const idx = conv.messages.findIndex((m) => m.id === msgId);
    if (idx === -1) return;

    const userMsg = conv.messages[idx];
    userMsg.text = newText;

    const removed = conv.messages.splice(idx + 1);
    removed.forEach((m) => {
        const els = messageEls.get(m.id);
        if (els) els.root.remove();
        messageEls.delete(m.id);
    });

    const els = messageEls.get(userMsg.id);
    if (els) renderUserContent(els, userMsg);

    await runAssistantTurn(conv, userMsg);
}

function startEdit(id) {
    const conv = getActiveConversation();
    if (!conv) return;
    const msg = conv.messages.find((m) => m.id === id);
    const els = messageEls.get(id);
    if (!msg || !els) return;

    const wrap = document.createElement("div");
    wrap.className = "edit-wrap";

    const ta = document.createElement("textarea");
    ta.className = "field-input field-textarea";
    ta.value = msg.text;
    ta.rows = Math.min(8, Math.max(2, msg.text.split("\n").length));

    const row = document.createElement("div");
    row.style.cssText = "display:flex; gap:8px; margin-top:8px; justify-content:flex-end;";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "btn-ghost";
    cancel.textContent = "Cancel";

    const save = document.createElement("button");
    save.type = "button";
    save.className = "btn-primary";
    save.textContent = "Save & resend";

    row.appendChild(cancel);
    row.appendChild(save);
    wrap.appendChild(ta);
    wrap.appendChild(row);

    els.content.replaceWith(wrap);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);

    cancel.addEventListener("click", () => {
        wrap.replaceWith(els.content);
    });
    save.addEventListener("click", () => {
        const newText = ta.value.trim();
        wrap.replaceWith(els.content);
        if (newText && newText !== msg.text) editAndResend(id, newText);
    });
}

function setGenerating(isGenerating) {
    sendBtn.hidden = isGenerating;
    stopBtn.hidden = !isGenerating;
}

/* ---------------------------------------------------------------------- */
/* Message action bar (event delegation)                                  */
/* ---------------------------------------------------------------------- */

messagesEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "copy-code") {
        const block = btn.closest(".code-block");
        const code = block ? block.querySelector("code").textContent : "";
        copyToClipboard(code).then(() => flashCopied(btn));
        return;
    }

    const conv = getActiveConversation();
    const msg = conv ? conv.messages.find((m) => m.id === id) : null;
    if (!msg) return;

    if (action === "copy") {
        copyToClipboard(msg.text).then(() => flashCopied(btn));
    } else if (action === "regenerate") {
        regenerate(id);
    } else if (action === "speak") {
        toggleSpeak(msg.text, btn);
    } else if (action === "edit") {
        startEdit(id);
    }
});

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (_) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand("copy");
        } catch (_) {
            /* clipboard truly unavailable — nothing more we can do */
        }
        document.body.removeChild(ta);
    }
}

function flashCopied(btn) {
    const original = btn.innerHTML;
    btn.innerHTML = '<svg class="icon"><use href="#i-check"/></svg>';
    setTimeout(() => {
        btn.innerHTML = original;
    }, 1200);
}

/* ---------------------------------------------------------------------- */
/* Voice input (Web Speech API)                                           */
/* ---------------------------------------------------------------------- */

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let recognizing = false;

if (SpeechRecognitionCtor) {
    recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (e) => {
        let transcript = "";
        for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
        composerInput.value = transcript;
        autoResize(composerInput);
    };
    recognition.onend = () => {
        recognizing = false;
        micBtn.classList.remove("listening");
    };
    recognition.onerror = () => {
        recognizing = false;
        micBtn.classList.remove("listening");
    };

    micBtn.addEventListener("click", () => {
        if (recognizing) {
            recognition.stop();
            return;
        }
        try {
            recognition.start();
            recognizing = true;
            micBtn.classList.add("listening");
        } catch (_) {
            /* already started — ignore */
        }
    });
} else {
    micBtn.hidden = true;
}

/* ---------------------------------------------------------------------- */
/* Read aloud (SpeechSynthesis)                                           */
/* ---------------------------------------------------------------------- */

let currentUtterance = null;
let currentSpeakingBtn = null;

function toggleSpeak(text, btn) {
    if (!("speechSynthesis" in window)) {
        toast("Read-aloud isn't supported in this browser.", "error");
        return;
    }
    if (currentSpeakingBtn === btn) {
        window.speechSynthesis.cancel();
        currentSpeakingBtn.classList.remove("speaking");
        currentSpeakingBtn = null;
        currentUtterance = null;
        return;
    }
    window.speechSynthesis.cancel();
    if (currentSpeakingBtn) currentSpeakingBtn.classList.remove("speaking");

    const utter = new SpeechSynthesisUtterance(stripMarkdown(text));
    utter.onend = () => {
        btn.classList.remove("speaking");
        if (currentSpeakingBtn === btn) currentSpeakingBtn = null;
        currentUtterance = null;
    };
    currentUtterance = utter;
    currentSpeakingBtn = btn;
    btn.classList.add("speaking");
    window.speechSynthesis.speak(utter);
}

/* ---------------------------------------------------------------------- */
/* Composer: autosize, keyboard shortcuts, model + temperature controls   */
/* ---------------------------------------------------------------------- */

function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
}
composerInput.addEventListener("input", () => autoResize(composerInput));

composerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener("click", sendMessage);
stopBtn.addEventListener("click", () => {
    if (currentAbortController) currentAbortController.abort();
});

modelSelect.addEventListener("change", () => {
    customModelInput.hidden = modelSelect.value !== "__custom__";
    const conv = getActiveConversation();
    if (conv) conv.model = resolveModel();
    saveStore();
    if (modelSelect.value === "__custom__") customModelInput.focus();
});
customModelInput.addEventListener("input", () => {
    const conv = getActiveConversation();
    if (conv) conv.model = resolveModel();
    saveStore();
});

tempSlider.addEventListener("input", () => {
    tempValue.textContent = formatTemp(tempSlider.value);
    const conv = getActiveConversation();
    if (conv) conv.temperature = Number(tempSlider.value);
});
tempSlider.addEventListener("change", saveStore);

languageSelect.addEventListener("change", () => {
    applyLanguage(languageSelect.value);
    const conv = getActiveConversation();
    if (conv) {
        conv.systemInstruction = getPersona();
        saveStore();
    }
});

/* ---------------------------------------------------------------------- */
/* Sidebar (mobile) + new chat + hint chips                               */
/* ---------------------------------------------------------------------- */

function openSidebar() {
    sidebarEl.classList.add("open");
    sidebarScrim.classList.add("show");
}
function closeSidebar() {
    sidebarEl.classList.remove("open");
    sidebarScrim.classList.remove("show");
}
sidebarOpenBtn.addEventListener("click", openSidebar);
sidebarCloseBtn.addEventListener("click", closeSidebar);
sidebarScrim.addEventListener("click", closeSidebar);
newChatBtn.addEventListener("click", newConversation);

document.querySelectorAll(".hint-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        composerInput.value = chip.dataset.hint;
        autoResize(composerInput);
        composerInput.focus();
    });
});

/* ---------------------------------------------------------------------- */
/* Theme                                                                  */
/* ---------------------------------------------------------------------- */

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
}
themeToggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
});
(function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved) {
        applyTheme(saved);
        return;
    }
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
})();

/* ---------------------------------------------------------------------- */
/* Settings modal                                                         */
/* ---------------------------------------------------------------------- */

function openSettings() {
    apiKeyInput.value = getApiKey();
    personaInput.value = getPersona();
    settingsOverlay.hidden = false;
}
function closeSettings() {
    settingsOverlay.hidden = true;
}

settingsBtn.addEventListener("click", openSettings);
settingsCloseBtn.addEventListener("click", closeSettings);
settingsCancelBtn.addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", (e) => {
    if (e.target === settingsOverlay) closeSettings();
});

settingsSaveBtn.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEYS.apiKey, apiKeyInput.value.trim());
    localStorage.setItem(STORAGE_KEYS.persona, personaInput.value);
    closeSettings();
    toast("Settings saved.");
});

toggleKeyVisibilityBtn.addEventListener("click", () => {
    const isPassword = apiKeyInput.type === "password";
    apiKeyInput.type = isPassword ? "text" : "password";
    toggleKeyVisibilityBtn.querySelector(".icon-eye").hidden = isPassword;
    toggleKeyVisibilityBtn.querySelector(".icon-eye-off").hidden = !isPassword;
});

/* ---------------------------------------------------------------------- */
/* Export                                                                 */
/* ---------------------------------------------------------------------- */

exportBtn.addEventListener("click", () => {
    const conv = getActiveConversation();
    if (!conv || !conv.messages.length) {
        toast("Nothing to export yet.");
        return;
    }
    const lines = [`# ${conv.title}`, ""];
    conv.messages.forEach((m) => {
        lines.push(m.role === "user" ? "**You:**" : "**Sage:**");
        if (m.image) lines.push("*[attached image]*");
        lines.push(m.text || "");
        lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(conv.title)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});

function slugify(str) {
    const s = (str || "conversation").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);
    return s || "conversation";
}

/* ---------------------------------------------------------------------- */
/* Global keyboard shortcuts                                              */
/* ---------------------------------------------------------------------- */

document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        newConversation();
        return;
    }
    if (e.key === "Escape") {
        if (!settingsOverlay.hidden) closeSettings();
        else closeSidebar();
    }
});

/* ---------------------------------------------------------------------- */
/* Toasts                                                                 */
/* ---------------------------------------------------------------------- */

function toast(message, type) {
    const el = document.createElement("div");
    el.className = "toast" + (type === "error" ? " toast-error" : "");
    el.textContent = message;
    toastStack.appendChild(el);
    setTimeout(() => {
        el.style.transition = "opacity 0.25s ease";
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 260);
    }, 3400);
}

/* ---------------------------------------------------------------------- */
/* Boot                                                                   */
/* ---------------------------------------------------------------------- */

applyLanguage(getLanguage());
renderConversationList();
renderActiveConversation();

if (!getApiKey()) {
    toast("Add a free Gemini API key in Settings to start chatting.");
}
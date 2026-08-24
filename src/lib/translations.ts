// Lightweight i18n dictionary for MrsANONymous.
// Missing keys fall back to English, then to the key itself.

// Any Google-Translate ISO code is accepted; strict union removed so all
// languages can be selected. Codes below match Google Translate.
export type LangCode = string;

export const LANGUAGES: { code: LangCode; label: string; native: string; dir?: "rtl" }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
  { code: "pl", label: "Polish", native: "Polski" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "uk", label: "Ukrainian", native: "Українська" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "he", label: "Hebrew", native: "עברית", dir: "rtl" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "fa", label: "Persian / Farsi", native: "فارسی", dir: "rtl" },
  { code: "ur", label: "Urdu", native: "اردو", dir: "rtl" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "zh", label: "Chinese (Simplified)", native: "简体中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt" },
  { code: "tl", label: "Tagalog / Filipino", native: "Filipino" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "safety.needLeave": "Leave fast",
  "safety.pressEsc": "Press",
  "safety.or": "or",
  "safety.clickQuickExit": "Quick Exit",
  "safety.switchGoogle": "",
  "safety.quickExit": "Exit",

  "safety.call911": "Call 911",
  "safety.callEmergency": "Call",
  "safety.language": "Language",
  "nav.about": "About us",
  "nav.women": "Women",
  "nav.girls": "Girls",
  "nav.tellStory": "Tell Your Story!",
  "nav.notebooks": "My Notebooks",
  "nav.board": "The Board",
  "nav.tools": "Tools",
  "nav.resources": "Resources",
  "nav.getHelpWomen": "Get help now! (women)",
  "nav.getHelpGirls": "get help now! (girls)",
  "nav.inbox": "Inbox",
  "nav.admin": "Admin",
  "nav.login": "Log in",
  "nav.signup": "Sign up",
  "nav.logout": "Log out",
  "nav.hello": "Hello,",
  "emg.title": "Need help now?",
  "emg.disclaimer": "If you are in immediate danger, call emergency services or a trusted hotline.",
  "emg.call988": "Call 988",
  "emg.call911": "Call 911",
  "emg.text911": "Text 911 (with location)",
  "emg.translating": "Translating…",
  "emg.location": "Location",
  "emg.locating": "Locating…",
  "emg.refresh": "Refresh",
  "emg.getLocation": "Get my location",
  "emg.attachLoc": "Tap to attach your address & coordinates to the 911 text.",
  "emg.editMsg": "Edit custom 911 message",
  "emg.hideMsg": "Hide custom message",
  "emg.msgLang": "Message language (keyboard & translation)",
  "emg.msgPlaceholder": "Message sent to 911 with your location",
  "emg.translateNote": "Message will be translated to English before sending to 911.",
  "emg.textFooter": "Not all US areas support Text-to-911. If it does not go through, call 911.",
  "emg.defaultMsg": "Emergency. I need help. Please send police to my location.",
};

// Only the highest-visibility strings are translated; missing keys fall back to English.
const es: Dict = {
  "safety.needLeave": "Salir rápido",
  "safety.pressEsc": "Presiona",
  "safety.or": "o",
  "safety.clickQuickExit": "Salida rápida",
  "safety.switchGoogle": "",
  "safety.quickExit": "Salir",

  "safety.call911": "Llamar al 911",
  "safety.callEmergency": "Llamar",
  "safety.language": "Idioma",
  "nav.about": "Sobre nosotras",
  "nav.women": "Mujeres",
  "nav.girls": "Chicas",
  "nav.tellStory": "¡Cuenta tu historia!",
  "nav.notebooks": "Mis cuadernos",
  "nav.board": "El Tablero",
  "nav.tools": "Herramientas",
  "nav.resources": "Recursos",
  "nav.getHelpWomen": "¡Obtén ayuda ahora! (mujeres)",
  "nav.getHelpGirls": "¡obtén ayuda ahora! (chicas)",
  "nav.inbox": "Bandeja",
  "nav.admin": "Admin",
  "nav.login": "Iniciar sesión",
  "nav.signup": "Registrarse",
  "nav.logout": "Cerrar sesión",
  "nav.hello": "Hola,",
  "emg.title": "¿Necesitas ayuda ahora?",
  "emg.disclaimer": "Si estás en peligro inmediato, llama a los servicios de emergencia o a una línea de ayuda.",
  "emg.call988": "Llamar al 988",
  "emg.call911": "Llamar al 911",
  "emg.text911": "Enviar SMS al 911 (con ubicación)",
  "emg.translating": "Traduciendo…",
  "emg.location": "Ubicación",
  "emg.locating": "Localizando…",
  "emg.refresh": "Actualizar",
  "emg.getLocation": "Obtener mi ubicación",
  "emg.attachLoc": "Toca para adjuntar tu dirección y coordenadas al SMS del 911.",
  "emg.editMsg": "Editar mensaje personalizado para el 911",
  "emg.hideMsg": "Ocultar mensaje personalizado",
  "emg.msgLang": "Idioma del mensaje (teclado y traducción)",
  "emg.msgPlaceholder": "Mensaje enviado al 911 con tu ubicación",
  "emg.translateNote": "El mensaje se traducirá al inglés antes de enviarse al 911.",
  "emg.textFooter": "No todas las áreas de EE. UU. admiten SMS al 911. Si no se envía, llama al 911.",
  "emg.defaultMsg": "Emergencia. Necesito ayuda. Por favor envíen policía a mi ubicación.",
};

const fr: Dict = {
  "safety.needLeave": "Besoin de partir vite ?",
  "safety.quickExit": "Sortie rapide",
  "safety.call911": "Appeler le 911",
  "safety.callEmergency": "Appeler",
  "safety.language": "Langue",
  "nav.about": "À propos",
  "nav.women": "Femmes",
  "nav.girls": "Filles",
  "nav.tellStory": "Racontez votre histoire !",
  "nav.notebooks": "Mes carnets",
  "nav.board": "Le Tableau",
  "nav.tools": "Outils",
  "nav.resources": "Ressources",
  "nav.login": "Connexion",
  "nav.signup": "S'inscrire",
  "nav.logout": "Déconnexion",
  "nav.hello": "Bonjour,",
  "emg.title": "Besoin d'aide maintenant ?",
  "emg.text911": "Envoyer un SMS au 911 (avec position)",
  "emg.translating": "Traduction…",
  "emg.location": "Position",
  "emg.getLocation": "Obtenir ma position",
  "emg.msgLang": "Langue du message (clavier & traduction)",
  "emg.translateNote": "Le message sera traduit en anglais avant d'être envoyé au 911.",
  "emg.defaultMsg": "Urgence. J'ai besoin d'aide. Envoyez la police à ma position.",
};

const ar: Dict = {
  "safety.needLeave": "بحاجة للمغادرة بسرعة؟",
  "safety.quickExit": "خروج سريع",
  "safety.call911": "اتصل بالطوارئ 911",
  "safety.callEmergency": "اتصل",
  "safety.language": "اللغة",
  "nav.about": "من نحن",
  "nav.women": "النساء",
  "nav.girls": "الفتيات",
  "nav.tellStory": "احكِ قصتك!",
  "nav.notebooks": "دفاتري",
  "nav.board": "اللوحة",
  "nav.tools": "أدوات",
  "nav.resources": "الموارد",
  "nav.login": "تسجيل الدخول",
  "nav.signup": "إنشاء حساب",
  "nav.logout": "تسجيل الخروج",
  "nav.hello": "مرحبًا،",
  "emg.title": "هل تحتاج إلى مساعدة الآن؟",
  "emg.text911": "إرسال رسالة إلى 911 (مع الموقع)",
  "emg.translating": "جارٍ الترجمة…",
  "emg.location": "الموقع",
  "emg.getLocation": "احصل على موقعي",
  "emg.msgLang": "لغة الرسالة (لوحة المفاتيح والترجمة)",
  "emg.translateNote": "ستتم ترجمة الرسالة إلى الإنجليزية قبل إرسالها إلى 911.",
  "emg.defaultMsg": "طارئ. أحتاج إلى مساعدة. من فضلكم أرسلوا الشرطة إلى موقعي.",
};

const zh: Dict = {
  "safety.needLeave": "需要快速离开？",
  "safety.quickExit": "快速退出",
  "safety.call911": "拨打 911",
  "safety.callEmergency": "拨打",
  "safety.language": "语言",
  "nav.about": "关于我们",
  "nav.women": "女性",
  "nav.girls": "女孩",
  "nav.tellStory": "讲述你的故事！",
  "nav.notebooks": "我的笔记本",
  "nav.board": "留言板",
  "nav.tools": "工具",
  "nav.resources": "资源",
  "nav.login": "登录",
  "nav.signup": "注册",
  "nav.logout": "退出",
  "nav.hello": "你好，",
  "emg.title": "现在需要帮助吗？",
  "emg.text911": "发送短信到 911（含位置）",
  "emg.translating": "翻译中…",
  "emg.location": "位置",
  "emg.getLocation": "获取我的位置",
  "emg.msgLang": "消息语言（键盘和翻译）",
  "emg.translateNote": "消息将在发送到 911 之前翻译成英文。",
  "emg.defaultMsg": "紧急情况。我需要帮助。请派警察到我的位置。",
};

const hi: Dict = {
  "safety.quickExit": "त्वरित निकास",
  "safety.call911": "911 पर कॉल करें",
  "safety.callEmergency": "कॉल करें",
  "safety.language": "भाषा",
  "nav.about": "हमारे बारे में",
  "nav.women": "महिलाएँ",
  "nav.girls": "लड़कियाँ",
  "nav.tellStory": "अपनी कहानी बताएं!",
  "nav.notebooks": "मेरी नोटबुक",
  "nav.board": "बोर्ड",
  "nav.tools": "उपकरण",
  "nav.resources": "संसाधन",
  "nav.login": "लॉग इन",
  "nav.signup": "साइन अप",
  "nav.logout": "लॉग आउट",
  "emg.title": "अभी मदद चाहिए?",
  "emg.text911": "911 को टेक्स्ट करें (स्थान के साथ)",
  "emg.translateNote": "911 पर भेजने से पहले संदेश का अंग्रेज़ी में अनुवाद किया जाएगा।",
  "emg.defaultMsg": "आपातकाल। मुझे मदद चाहिए। कृपया मेरे स्थान पर पुलिस भेजें।",
};

export const dictionaries: Record<string, Dict> = {
  en,
  es,
  fr,
  ar,
  zh,
  hi,
};

export function translate(lang: LangCode, key: string): string {
  return dictionaries[lang]?.[key] ?? en[key] ?? key;
}

/**
 * Translate text to English using the public Google Translate endpoint.
 * Returns the original text if the request fails.
 */
export async function translateToEnglish(text: string, sourceLang: LangCode): Promise<string> {
  if (!text.trim() || sourceLang === "en") return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    // Response: [[["translated","original",...]], ...]
    if (!Array.isArray(data) || !Array.isArray(data[0])) return text;
    return data[0].map((seg: unknown[]) => (Array.isArray(seg) ? String(seg[0] ?? "") : "")).join("");
  } catch {
    return text;
  }
}

/**
 * Translate arbitrary text from one language to another using the public
 * Google Translate endpoint. Returns the original on failure.
 */
export async function translateText(
  text: string,
  targetLang: LangCode,
  sourceLang: LangCode = "en",
): Promise<string> {
  if (!text.trim() || targetLang === sourceLang) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return text;
    return data[0].map((seg: unknown[]) => (Array.isArray(seg) ? String(seg[0] ?? "") : "")).join("");
  } catch {
    return text;
  }
}
// ==UserScript==
// @name         MathJax Copy Fix (Plain ^ + LaTeX modes)
// @namespace    https://github.com/GenericUsername01/mathjax-copy-userscript
// @version      1.2
// @description  Copy MathJax CHTML as ASCII-like plain math (a^3) or real LaTeX
// @match        *://*/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';
  let copyMode = "plain";

  // --- UI toggle button ---
  GM_addStyle(`
    mjx-container, mjx-container * { user-select: text !important; }
    #mjx-copy-toggle {
      position: fixed; top: 8px; right: 8px; z-index: 99999;
      background: #333; color: #fff; font: 12px sans-serif;
      border: none; border-radius: 4px; padding: 4px 8px;
      cursor: pointer; opacity: 0.7;
    }
    #mjx-copy-toggle:hover { opacity: 1; }
  `);

  const btn = document.createElement("button");
  btn.id = "mjx-copy-toggle";
  btn.textContent = "Mode: Plain";
  btn.onclick = () => {
    copyMode = copyMode === "plain" ? "latex" : "plain";
    btn.textContent = "Mode: " + (copyMode === "plain" ? "Plain" : "LaTeX");
  };
  document.body.appendChild(btn);

  // --- Operator mappings ---
  const moMap = {
    "≥": "\\geq ",
    "≤": "\\leq ",
    "≠": "\\neq ",
    "±": "\\pm ",
    "×": "\\times ",
    "÷": "\\div ",
    "·": "\\cdot ",
    "⁢": "", // invisible times
  };

  // --- Helper: normalize italic math letters to ASCII ---
  function normalizeMathChar(char, cp) {
    if (cp >= 0x1D400 && cp <= 0x1D7FF) {
      const norm = char.normalize("NFKD").replace(/[^\w]/g, "");
      if (norm.length === 1) return norm;
    }
    return char;
  }

  // --- Recursive DOM → TeX ---
  function mjxToTex(el) {
    if (!el) return "";
    if (el.nodeType === Node.TEXT_NODE) return el.nodeValue;

    if (el.nodeType === Node.ELEMENT_NODE) {
      const tag = el.tagName.toLowerCase();

      if (tag === "mjx-c") {
        const m = el.className.match(/mjx-c([0-9A-F]+)/i);
        if (m) {
          const cp = parseInt(m[1], 16);
          let char = String.fromCodePoint(cp);
          char = normalizeMathChar(char, cp);
          return moMap[char] || char;
        }
        return "";
      }

      if (tag === "mjx-mi" || tag === "mjx-mn") {
        return Array.from(el.childNodes).map(mjxToTex).join("");
      }

      if (tag === "mjx-mo") {
        const content = Array.from(el.childNodes).map(mjxToTex).join("").trim();
        return moMap[content] || content;
      }

      if (tag === "mjx-msup") {
        const base = mjxToTex(el.children[0]);
        const exp = mjxToTex(el.querySelector("mjx-script"));
        return base + "^{" + exp + "}";
      }

      if (tag === "mjx-msub") {
        const base = mjxToTex(el.children[0]);
        const sub = mjxToTex(el.querySelector("mjx-script"));
        return base + "_{" + sub + "}";
      }

      if (tag === "mjx-msubsup") {
        const base = mjxToTex(el.children[0]);
        const sub = mjxToTex(el.children[1]);
        const sup = mjxToTex(el.children[2]);
        return base + "_{" + mjxToTex(sub) + "}^{" + mjxToTex(sup) + "}";
      }

      if (tag === "mjx-mfrac") {
        const num = mjxToTex(el.children[0]);
        const den = mjxToTex(el.children[1]);
        return "\\frac{" + num + "}{" + den + "}";
      }

      if (tag === "mjx-sqrt") {
        const radicand = mjxToTex(el.children[0]);
        return "\\sqrt{" + radicand + "}";
      }

      if (tag === "mjx-script" || tag === "mjx-mrow" || tag === "mjx-math") {
        return Array.from(el.childNodes).map(mjxToTex).join("");
      }

      return Array.from(el.childNodes).map(mjxToTex).join("");
    }
    return "";
  }

  // --- Postprocess TeX into plain ASCII style ---
  function texToPlain(tex) {
    return tex
      .replace(/\^\{(\d+)\}/g, "^$1")   // a^{3} -> a^3
      .replace(/_\{(\d+)\}/g, "_$1")    // x_{1} -> x_1
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)") // frac -> (/)
      .replace(/\\geq/g, "≥")
      .replace(/\\leq/g, "≤")
      .replace(/\\times/g, "*")
      .replace(/\\div/g, "/")
      .replace(/\\cdot/g, "*")
      .replace(/\s+/g, "");             // trim extra spaces
  }

  // --- Copy handler ---
  document.addEventListener("copy", (e) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const frag = sel.getRangeAt(0).cloneContents();
    if (!frag.querySelector) return;
    if (!frag.querySelector("mjx-container")) return;

    frag.querySelectorAll("mjx-container").forEach((c) => {
      const math = c.querySelector("mjx-math");
      let replacement = mjxToTex(math);

      if (copyMode === "plain") {
        replacement = texToPlain(replacement);
      }

      c.replaceWith(document.createTextNode(replacement));
    });

    const tmp = document.createElement("div");
    tmp.appendChild(frag);
    const text = tmp.innerText;

    e.clipboardData.setData("text/plain", text.trim());
    e.preventDefault();
  });
})();

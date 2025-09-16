// ==UserScript==
// @name         MathJax CHTML: Select & Copy
// @namespace    https://github.com/<your-username>/mathjax-copy-userscript
// @version      0.4
// @description  Make MathJax CHTML (<mjx-*> elements) selectable and copyable
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/GenericUsername01/mathjax-copy-userscript/main/mathjax-copy.user.js
// @downloadURL  https://raw.githubusercontent.com/GenericUsername01/mathjax-copy-userscript/main/mathjax-copy.user.js
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==


(function () {
  'use strict';

  // Default mode: "plain" or "latex"
  let copyMode = "plain";

  // Add style to make MathJax selectable
  GM_addStyle(`
    mjx-container, mjx-container * {
      user-select: text !important;
      -webkit-user-select: text !important;
    }
    #mjx-copy-toggle {
      position: fixed;
      top: 8px;
      right: 8px;
      z-index: 99999;
      background: #333;
      color: #fff;
      font: 12px sans-serif;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      opacity: 0.7;
    }
    #mjx-copy-toggle:hover {
      opacity: 1;
    }
  `);

  // Insert toggle button
  const btn = document.createElement("button");
  btn.id = "mjx-copy-toggle";
  btn.textContent = "Mode: Plain";
  btn.onclick = () => {
    copyMode = copyMode === "plain" ? "latex" : "plain";
    btn.textContent = "Mode: " + (copyMode === "plain" ? "Plain" : "LaTeX");
  };
  document.body.appendChild(btn);

  // Copy handler
  document.addEventListener("copy", (e) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const frag = sel.getRangeAt(0).cloneContents();
    const hasMJX = frag.querySelector && frag.querySelector("mjx-container");
    if (!hasMJX) return; // no MathJax, let native copy work

    frag.querySelectorAll("mjx-container").forEach((c) => {
      let replacement = "";
      if (copyMode === "latex" && window.MathJax) {
        try {
          // MathJax v3 exposes the original TeX via dataset or API
          if (c.getAttribute("data-mathml")) {
            replacement = c.getAttribute("data-mathml"); // fallback if site provides
          } else if (c.getAttribute("jax")) {
            // sometimes TeX is stored in sibling script[type="math/tex"]
            const script = c.previousElementSibling;
            if (script && script.tagName === "SCRIPT" && script.textContent) {
              replacement = script.textContent.trim();
            }
          }
        } catch (err) {
          replacement = "";
        }
      }
      if (!replacement) {
        // fallback to plain-text MathML assistive
        const assist = c.querySelector("mjx-assistive-mml math");
        replacement = assist ? assist.textContent : c.innerText;
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

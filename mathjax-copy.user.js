// ==UserScript==
// @name         MathJax CHTML: Select & Copy
// @namespace    https://github.com/<your-username>/mathjax-copy-userscript
// @version      0.3
// @description  Make MathJax CHTML (<mjx-*> elements) selectable and copyable
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/GenericUsername01/mathjax-copy-userscript/main/mathjax-copy.user.js
// @downloadURL  https://raw.githubusercontent.com/GenericUsername01/mathjax-copy-userscript/main/mathjax-copy.user.js
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==


(function () {
  'use strict';

  // 1) Force-selectable MathJax CHTML (the core fix).
  const css = `
    mjx-container, mjx-container * {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
    /* Some sites set pointer-events/roles that interfere; neutralize the worst offenders */
    mjx-container [aria-hidden="true"] { aria-hidden: false !important; }
    mjx-container[role="application"] { role: none !important; }
  `;
  try {
    if (typeof GM_addStyle === 'function') GM_addStyle(css);
    else {
      const s = document.createElement('style');
      s.textContent = css;
      document.documentElement.appendChild(s);
    }
  } catch {
    const s = document.createElement('style');
    s.textContent = css;
    document.documentElement.appendChild(s);
  }

  // 2) OPTIONAL: Plain-text fallback on copy when selection contains MathJax.
  //    This helps when some sites still screw with selection/copy.
  document.addEventListener('copy', (e) => {
    const sel = window.getSelection && window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    // Quick check: does selection intersect any MathJax container?
    const intersectsMJX = (() => {
      for (let i = 0; i < sel.rangeCount; i++) {
        const r = sel.getRangeAt(i);
        const node = r.commonAncestorContainer.nodeType === 1
          ? r.commonAncestorContainer
          : r.commonAncestorContainer.parentElement;
        if (!node) continue;
        if (node.closest && node.closest('mjx-container')) return true;
        // broader scan: if any mjx is inside the range
        const frag = r.cloneContents();
        if (frag.querySelector && frag.querySelector('mjx-container, mjx-math, mjx-mi, mjx-mo, mjx-mn')) return true;
      }
      return false;
    })();

    if (!intersectsMJX) return; // let default copy proceed

    // Build a plain-text representation from the selected fragment.
    const tmp = document.createElement('div');
    for (let i = 0; i < sel.rangeCount; i++) {
      tmp.appendChild(sel.getRangeAt(i).cloneContents());
    }

    // Convert <mjx-*> to readable text: handle common cases (mi, mn, mo, msup/msub/msubsup, mrow).
    const serializeMJX = (el) => {
      if (!el) return '';
      if (el.nodeType === Node.TEXT_NODE) return el.nodeValue || '';
      if (el.nodeType !== Node.ELEMENT_NODE) return '';

      const tag = el.tagName || '';
      const children = Array.from(el.childNodes);

      const joinChildren = () => children.map(serializeMJX).join('');

      // Common tokens
      if (/^MJX-MI$|^MJX-MN$/.test(tag)) return el.textContent || '';
      if (tag === 'MJX-MO') {
        const t = el.textContent || '';
        // Put spaces around most infix ops for readability
        return /\S/.test(t) && /[+\-*/=<>≤≥≠∧∨∼≈·]/.test(t) ? ` ${t} ` : t;
      }

      // Super/sub scripts
      if (tag === 'MJX-MSUP') {
        // structure: <mjx-msup><base><mjx-script>exp</mjx-script></mjx-msup>
        const [base, script] = children;
        const baseTxt = serializeMJX(base);
        const expTxt = script ? script.textContent : '';
        return `${baseTxt}^${expTxt}`;
      }
      if (tag === 'MJX-MSUB') {
        const [base, script] = children;
        const baseTxt = serializeMJX(base);
        const subTxt = script ? script.textContent : '';
        return `${baseTxt}_${subTxt}`;
      }
      if (tag === 'MJX-MSUBSUP') {
        const [base, sub, sup] = children;
        return `${serializeMJX(base)}_${sub ? sub.textContent : ''}^${sup ? sup.textContent : ''}`;
      }

      // Rows/groups: just recurse
      if (tag === 'MJX-MROW' || tag === 'MJX-MATH' || tag === 'MJX-CONTAINER') return joinChildren();

      // Inner script container
      if (tag === 'MJX-SCRIPT') return el.textContent || '';

      // Fallback: recurse
      return joinChildren();
    };

    // Replace each mjx-container in the fragment with a text node
    tmp.querySelectorAll('mjx-container').forEach((c) => {
      const math = c.querySelector('mjx-math');
      const txt = serializeMJX(math || c);
      c.replaceWith(document.createTextNode(txt));
    });

    // Use the cleaned text for clipboard
    const text = tmp.innerText.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    if (text && e.clipboardData) {
      e.clipboardData.setData('text/plain', text.trim());
      e.preventDefault();
    }
  }, true);
})();

# mathjax-copy-userscript
Tampermonkey userscript that makes MathJax CHTML (&lt;mjx-*>) equations selectable and copyable as plain text (e.g., a^3 + b^3 + c^3 ≥ 3abc).
# MathJax Copy Userscript

This is a Tampermonkey/Greasemonkey userscript that fixes the common issue where MathJax (CHTML output) equations cannot be selected or copied with `Ctrl+A` / `Ctrl+C`.

## Features
- Makes MathJax `<mjx-*>` elements selectable and copyable.
- Optional plain-text fallback (so superscripts like `a³` can also be copied as `a^3`).
- Works on any site that uses MathJax with CHTML rendering.

## Installation
1. Install [Tampermonkey](https://www.tampermonkey.net/) (or another userscript manager).
2. Click [**Install Script**](https://raw.githubusercontent.com/GenericUsername01/mathjax-copy-userscript/main/mathjax-copy.user.js)  
   *(Tampermonkey will prompt you to add it)*

## Usage
- Navigate to any site using MathJax (e.g., lecture notes, textbooks, forums).
- Select math expressions normally and copy with `Ctrl+C`.
- Pasted result will include the math as either:
  - **Rendered text** with superscripts/subscripts, or
  - **Plain text fallback** (e.g. `a^3 + b^3 + c^3 ≥ 3abc`).

## Example
Expression on page:
a³ + b³ + c³ ≥ 3abc
Copied plain text:
a^3 + b^3 + c^3 ≥ 3abc
## Notes
- The plain-text export covers common MathJax constructs (`msup`, `msub`, `mi`, `mn`, `mo`).  
- If you only want native copy (e.g., with real superscripts), comment out or remove the `document.addEventListener('copy', ...)` block in the script.

## License
MIT

# MathJax CHTML: Select & Copy

A Tampermonkey userscript that makes **MathJax CHTML** (`<mjx-*>` elements) selectable and copyable in web pages.

By default, MathJax renders math as custom DOM nodes that:
- Don’t highlight properly when selecting with the mouse.
- Don’t copy correctly with `Ctrl+C` (exponents, fractions, operators get lost or flattened).

This script fixes those issues by:
- Allowing normal text selection inside `<mjx-container>`.
- Converting the rendered math DOM back into either **plain math text** (e.g. `a^3+b^3+c^3>=3abc`) or **LaTeX source** (e.g. `a^{3}+b^{3}+c^{3}\\geq 3abc`) on copy.

---

## Features

- **Toggle button** at the top-right corner of the page:
  - `Mode: Plain` → Copies math in simple ASCII style with `^`, `_`, and `/`.
  - `Mode: LaTeX` → Copies full LaTeX syntax.
- Handles:
  - Superscripts (`a^3` / `a^{3}`)
  - Subscripts (`x_1` / `x_{1}`)
  - Fractions (`(a+b)/(c+d)` / `\frac{a+b}{c+d}`)
  - Roots (`\sqrt{a+b}`)
  - Common operators (`≥`, `≤`, `×`, `÷`, `·`, etc.)
- Normalizes italic MathJax letters back to plain ASCII (`𝑎, 𝑏, 𝑐 → a, b, c`).

---

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or a similar userscript manager).
2. Create a new userscript and paste in the code from [`mathjax-copy.user.js`](./mathjax-copy.user.js).
3. Save and enable the script.

---

## Usage

1. Navigate to any page that renders math with MathJax (CHTML).
2. Use the toggle button in the top-right corner to choose:
   - **Plain** mode for human-friendly copy.
   - **LaTeX** mode for raw TeX source.
3. Select math with your mouse and press `Ctrl+C`.
4. Paste anywhere — you’ll get clean text instead of broken glyphs.

---

## Example

Rendered expression:

> Let a, b, and c be nonnegative real numbers. Then  
> \(a^3 + b^3 + c^3 \geq 3abc\).

Copy results:

- **Plain mode**:
> a^3+b^3+c^3≥3abc
- **LaTeX mode**:
> a^{3}+b^{3}+c^{3}\geq 3abc

---

##License

> MIT



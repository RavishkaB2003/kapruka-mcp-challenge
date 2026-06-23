# UI Issues — Resolved Memory
## Agent Kit · UI Review Agent

Previously resolved UI/UX patterns for this project.
The UI Review agent reads this before every session.
If a pattern is listed here as resolved, do not re-flag it unless the fix has regressed.

---

<!-- Resolved entries appended below -->

## [UI-20260622-01] Missing Form Field Labels and IDs — RESOLVED 2026-06-22
- **Fix:** Assigned unique IDs and names to all input elements and matched them with label `htmlFor` bindings across the Checkout Form, Cake Customizer icing input, and chatbot input field. This resolves WCAG A11y warnings.

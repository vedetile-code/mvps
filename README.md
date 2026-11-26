# MVP demo hub

Static, demo-only previews of five consumer tools. Live at [https://vedetile-code.github.io/mvps/](https://vedetile-code.github.io/mvps/).

| Site | Path | What it is |
| --- | --- | --- |
| [Nookshift](https://vedetile-code.github.io/mvps/nookshift/) | `nookshift/` | Room and garden restyle demo |
| [ListReady](https://vedetile-code.github.io/mvps/listready/) | `listready/` | Reseller listing drafts (never posts) |
| [TellMe Coach](https://vedetile-code.github.io/mvps/tellme-coach/) | `tellme-coach/` | UK show me / tell me practice |
| [Quire](https://vedetile-code.github.io/mvps/quirepress/) | `quirepress/` | KDP interior and cover layout studio |
| [ShiftReady](https://vedetile-code.github.io/mvps/shiftready/) | `shiftready/` | Human-checked RN application pack |

The public pages run in demo mode and never store API keys or card details. Checkout links (Stripe Payment Links or PayPal) are set in one place, `checkout-config.js`; an empty link falls back to an email reservation. After payment, buyers land on `thanks.html?p=<slug>`.

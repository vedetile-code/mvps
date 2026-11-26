# MVP demo hub

Static, demo-only previews of five consumer tools. Live at [https://mvps.pages.dev/](https://mvps.pages.dev/).

The live site is hosted on [Cloudflare Pages](https://mvps.pages.dev/). The older GitHub Pages URLs at `https://vedetile-code.github.io/mvps/` redirect there so existing outreach links keep working.


| Site | Path | What it is |
| --- | --- | --- |
| [Nookshift](https://mvps.pages.dev/nookshift/) | `nookshift/` | Room and garden restyle demo |
| [ListReady](https://mvps.pages.dev/listready/) | `listready/` | Reseller listing drafts (never posts) |
| [TellMe Coach](https://mvps.pages.dev/tellme-coach/) | `tellme-coach/` | UK show me / tell me practice |
| [Quire](https://mvps.pages.dev/quirepress/) | `quirepress/` | KDP interior and cover layout studio |
| [ShiftReady](https://mvps.pages.dev/shiftready/) | `shiftready/` | Human-checked RN application pack |

The public pages run in demo mode and never store API keys or card details. Checkout links (Stripe Payment Links or PayPal) are set in one place, `checkout-config.js`; an empty link falls back to an email reservation. After payment, buyers land on `thanks.html?p=<slug>`.

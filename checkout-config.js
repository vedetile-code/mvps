/*
 * ONE place to drop in checkout links.
 * Paste a Stripe Payment Link (https://buy.stripe.com/...) or PayPal link into
 * the matching "" below, commit, push. Empty string = button falls back to the
 * email reservation (mailto) flow. Nothing else needs editing.
 *
 * formEndpoint (optional): a form backend URL that accepts POST (e.g.
 * https://formsubmit.co/ajax/<address> after activation). Empty = mailto.
 */
window.MVPS_CHECKOUT = {
  formEndpoint: "",
  products: {
    nookshift: {
      name: "Nookshift",
      contact: "timwvedco+nookshift@gmail.com",
      offer: "Founding year $29",
      links: {
        primary: ""          // Stripe: Nookshift Founding Year, $29 one-time
      }
    },
    listready: {
      name: "ListReady",
      contact: "timwvedco+listready@gmail.com",
      offer: "Founding $9/month",
      links: {
        primary: "",         // Stripe: ListReady Founding Monthly, $9/month
        year: ""             // Stripe: ListReady Founding Year, $99 one-time
      }
    },
    "tellme-coach": {
      name: "TellMe Coach",
      contact: "timwvedco+tellmecoach@gmail.com",
      offer: "£9 pilot 30-day pass",
      links: {
        primary: ""          // Stripe: TellMe Coach 30-Day Pass (Pilot), £9 one-time
      }
    },
    quirepress: {
      name: "Quire",
      contact: "timwvedco+quirepress@gmail.com",
      offer: "Founder year $99",
      links: {
        primary: "",         // Stripe: Quire Founder Year, $99 one-time
        monthly: ""          // Stripe: Quire Monthly, $19/month
      }
    },
    shiftready: {
      name: "ShiftReady",
      contact: "timwvedco+shiftready@gmail.com",
      offer: "$19 pilot (5 slots)",
      links: {
        primary: "",         // Stripe or PayPal: ShiftReady Pilot, $19
        application: "",     // Stripe or PayPal: ShiftReady Application Pack, $49
        interview: ""        // Stripe or PayPal: ShiftReady Interview Pack, $99
      }
    }
  }
};

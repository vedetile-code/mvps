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
        primary: "https://buy.stripe.com/6oU28s2Mia5Nd6kc4IbV600" // Stripe: Nookshift Founding Year, $29 one-time
      }
    },
    listready: {
      name: "ListReady",
      contact: "timwvedco+listready@gmail.com",
      offer: "Founding $9/month",
      links: {
        primary: "https://buy.stripe.com/aFa5kEev03Hp1nC9WAbV601", // Stripe: ListReady Founding Monthly, $9/month
        year: "https://buy.stripe.com/5kQ14o72y7XFd6k4CgbV602" // Stripe: ListReady Founding Year, $99 one-time
      }
    },
    "tellme-coach": {
      name: "TellMe Coach",
      contact: "timwvedco+tellmecoach@gmail.com",
      offer: "£9 pilot 30-day pass",
      links: {
        primary: "https://buy.stripe.com/6oU3cw9aGcdVc2g6KobV603" // Stripe: TellMe Coach 30-Day Pass (Pilot), £9 one-time
      }
    },
    quirepress: {
      name: "Quire",
      contact: "timwvedco+quirepress@gmail.com",
      offer: "Founder year $99",
      links: {
        primary: "https://buy.stripe.com/aFa9AUev02Dlc2g6KobV604", // Stripe: Quire Founder Year, $99 one-time
        monthly: "https://buy.stripe.com/7sYeVe5Yufq7fesb0EbV605" // Stripe: Quire Monthly, $19/month
      }
    },
    shiftready: {
      name: "ShiftReady",
      contact: "timwvedco+shiftready@gmail.com",
      offer: "$19 pilot (5 slots)",
      links: {
        primary: "https://buy.stripe.com/9B66oIev0cdV7M07OsbV606", // Stripe: ShiftReady Pilot, $19
        application: "https://buy.stripe.com/eVq14obiOcdV3vKfgUbV607", // Stripe: ShiftReady Standard Application Pack, $49
        interview: "https://buy.stripe.com/cNi14o3Qm7XF9U82u8bV608" // Stripe: ShiftReady Plus Interview Pack, $99
      }
    }
  }
};

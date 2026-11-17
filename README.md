# Amul Vidya — *Gyan ka Bharosa* (ज्ञान का भरोसा)

A landing website for **Amul Vidya**, a study platform with demo classes, quizzes and subscriptions. It has a 3D scene, a cinematic opening animation and scroll-driven animations, and it works on laptops and phones.

It is a plain static site (HTML, CSS and JavaScript). There is no build step and nothing to install.

---

## Features

| Section | What it does |
|---|---|
| **Opening intro** | The logo draws itself, "Amul Vidya" reveals letter by letter, a 000→100% counter runs, then the screen splits away like a curtain while the 3D world flies in. |
| **3D background** | Floating books, an open book turning its pages, a graduation cap, an atom, a crystal and gold dust. They react to the mouse and to scrolling (Three.js). |
| **Hero** | Title, tagline in Hindi and English, call-to-action buttons and animated stats. |
| **Our promise** | A large paragraph whose words light up as you scroll. |
| **Features** | Six cards that tilt in 3D on hover. |
| **Book of Gyan** | A pinned section where scrolling turns the pages of a 3D book, one page per subject. |
| **Devices** | A laptop lid opens and a phone slides in, both showing the app. |
| **Demo videos** | Filterable lesson cards with a video player. Free demos play straight away; premium demos unlock with the free trial. |
| **Quiz Arena** | Five working quiz formats: Multiple Choice, True/False, Fill in the Blank, Match Up and Rapid Fire (30 seconds). |
| **Pricing** | Free Demo, Vidya Pro and Vidya Elite, with a monthly/yearly toggle. |
| **Login / Sign up** | Modal forms with validation. |
| **Free trial** | 7-day trial in one click, **no signup needed**. |
| **Smooth scrolling** | Lenis smooth scroll throughout; menu links glide to their sections. |

**Phone support:** a ☰ menu, single-column layouts, full-width buttons and a lighter 3D scene for better performance.
**Accessibility:** if the visitor has turned on "reduce motion" in their device settings, the heavy animations switch off automatically.

---

## Running it

### Option 1: just open it
Double-click **`index.html`**. It opens in your browser.

### Option 2: local server (recommended, and needed to test on a phone)
```bash
npx serve .
```
Then open the address it prints, for example `http://localhost:3000`.

**To view it on your phone:** connect the phone and the laptop to the same Wi-Fi network, then open the *Network* address that `npx serve` prints (for example `http://192.168.x.x:3000`) in the phone's browser.

> An internet connection is required: the fonts and animation libraries load from CDNs.

---

## Project structure

```
Amul_Vidya/
├── index.html      # All page sections, modals and script tags
├── css/
│   └── style.css   # Theme, layout, animations, responsive rules
├── js/
│   ├── scene.js    # Three.js 3D background (books, cap, atom, particles)
│   ├── quiz.js     # Quiz Arena: 5 formats + QUESTION BANK
│   └── main.js     # Intro, smooth scroll, scroll animations, demos,
│                   # login/signup, free trial, pricing, book flip
└── README.md
```

---

## Customising

### Demo videos
1. Create a `videos/` folder next to `index.html`.
2. Put your `.mp4` files in it.
3. Edit the `DEMOS` list at the top of **`js/main.js`**:
   ```js
   { title: "Quadratic Equations in 3D", teacher: "Prof. R. Mehta", cat: "maths",
     dur: "12:40", free: true, sym: "x²", ..., src: "videos/maths-quadratic.mp4" },
   ```
   - `cat` must be one of `maths`, `science`, `language` or `exam` (these match the filter buttons).
   - `free: false` locks the demo until the visitor starts a trial or logs in.

If a video file is missing, the player shows a "Demo video coming soon" screen instead of an error.

### Quiz questions
Edit the `BANK` object at the top of **`js/quiz.js`**. It has one list per format:
- `mcq`: `{ q, o: [4 options], a: index of correct option, e: explanation }`
- `tf`: `{ q, a: true/false, e }`
- `fill`: `{ pre, post, a: ["accepted", "answers"], hint }` (answers are compared in lowercase with spaces removed)
- `match`: `{ l: left item, r: matching right item }`

Rapid Fire generates arithmetic questions automatically.

### Prices
In **`index.html`**, find the pricing section and change the `data-monthly` and `data-yearly` values:
```html
<b data-monthly="299" data-yearly="179">299</b>
```
Also update the visible number between the tags so it matches `data-monthly`.

### Trial length
In **`js/main.js`**: `const TRIAL_DAYS = 7;`

### Colours and fonts
All theme values are CSS variables at the top of **`css/style.css`** (`--gold`, `--saffron`, `--teal`, `--grad`, `--ff-head`, and so on).

### The "Our promise" text
Edit the paragraph with `id="manifestoText"` in **`index.html`**. The word-by-word lighting effect is applied automatically.

---

## ⚠️ Before going live

The current version is a **front-end prototype**. These parts need a real backend:

| Area | Current behaviour | What is needed |
|---|---|---|
| **Login / Sign up** | Accounts are saved only in the visitor's own browser (`localStorage`). Passwords are only lightly encoded, **not secure**. | A real auth service such as Firebase Auth, Supabase or your own API. |
| **Free trial** | The trial end date is stored in the browser, so clearing site data resets it. | Track trials on the server (per device or phone number). |
| **Payments** | "Get Pro" and "Go Elite" only show a placeholder message. | Integrate Razorpay or Stripe checkout. |
| **Videos** | Sample file paths only. | Upload real lessons, ideally to a video host or CDN. |
| **Content** | Teacher names, stats and testimonials are placeholders. | Replace them with real data. |

The browser storage keys used are `av_users`, `av_session` and `av_trial`.

> **Name check:** "Amul" is a well-known registered brand in India. Confirm you have the right to use the name "Amul Vidya" before you launch commercially.

---

## Tech used

| Library | Version | Purpose |
|---|---|---|
| [Three.js](https://threejs.org/) | r128 | 3D background scene |
| [GSAP](https://gsap.com/) + ScrollTrigger | 3.12.5 | Intro timeline and scroll animations |
| [Lenis](https://lenis.darkroom.engineering/) | 1.1.13 | Smooth scrolling |
| Google Fonts | — | Bricolage Grotesque, Instrument Serif, Plus Jakarta Sans, JetBrains Mono, Noto Serif Devanagari |

All libraries load from CDNs (cdnjs, unpkg) with pinned versions.

**Fallbacks:** if the 3D or animation libraries fail to load, the content still appears without the effects, and the book pages can be turned by clicking.

---

## Browser support

Recent versions of Chrome, Edge, Firefox and Safari on desktop and mobile. The 3D scene needs WebGL; on older or low-end phones it may run slower.

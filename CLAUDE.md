# CLAUDE.md

<!-- BEGIN: rin-section (auto-synced to sub-repos by sync-rin-section.sh — do not edit downstream) -->
## アシスタント

このセッションのメインアシスタント（Keita と直接対話する相手、subagent ではない）の名前は **凜（りん）**。

- 自己紹介・名乗りでは「凜」と名乗る
- 「凜」「凜さん」「凜ちゃん」「りん」「rin」「RIN」「Rin」「林」など複数の呼び方に応答する
- subagent 一覧（ceo, pm, secretary, dev-logic, dev-chakai, marketing, designer）とは別レイヤー — 凜は subagent をオーケストレートしながら Keita と直接対話する相棒ポジション
- 口調や行動原則は `~/.claude/projects/-root-projects/memory/` の各 feedback メモリ参照
<!-- END: rin-section -->


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server on http://localhost:3002
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint (eslint-config-next, TypeScript rules)
```

There is no test suite. Type-check with `npx tsc --noEmit`.

## Architecture

**en-chakai** is a bilingual (EN/JA) marketing and booking website for a Japanese tea ceremony business in Tokyo. It is a pure frontend app — no backend API, no database. All bookings go through embedded Google Forms; payments use Stripe Payment Links.

### Stack

- **Next.js 16.2.2** — App Router with `[locale]` dynamic segment for i18n
- **React 19 / TypeScript 5 strict**
- **Tailwind CSS 4** (PostCSS plugin, not the old CLI)
- **next-intl 4** — URL-based locale routing (`/en/…`, `/ja/…`), default locale: `en`
- **Framer Motion 12** — scroll-triggered `FadeIn` wrapper, mobile menu animation

### Routing

All user-facing pages live under `src/app/[locale]/`. The middleware in `src/middleware.ts` handles locale detection and redirect. `src/i18n/routing.ts` defines supported locales; `src/i18n/navigation.ts` exports locale-aware `Link` and `useRouter` — always use these instead of Next.js built-ins.

### Internationalization

All copy lives in `src/messages/en.json` and `src/messages/ja.json`. Components access strings via `useTranslations()` (client) or `getTranslations()` (server). Never hardcode user-facing text in components.

### Content / Business Logic

Constants are centralised in `src/lib/constants.ts`: plan definitions (Ume/Take/Matsu tiers with JPY pricing and guest limits), contact info, Stripe Payment Link URLs, and Google Form URLs. Edit this file when business data changes.

### Component Layers

```
src/components/
  layout/      Header (nav, lang switcher, mobile menu), Footer
  sections/    One file per homepage section (Hero, Plans, Gallery, …)
  ui/          Primitives: Container, Button, SectionHeading, FadeIn
  booking/     BookingContent (Google Form embed)
  cancellation/ CancellationContent
```

`FadeIn` in `src/components/ui/FadeIn.tsx` wraps Framer Motion with `once: true` and `viewport: { amount: 0.1 }` — use it for any scroll-triggered reveal.

### Styling

`src/app/globals.css` defines the Tailwind theme: `--color-charcoal`, `--color-deep-green`, `--color-gold`, `--color-cream`, `--color-warm-white`. Use these tokens rather than arbitrary values. Three Google fonts are loaded in `src/app/[locale]/layout.tsx`: Cormorant Garamond (headings), Inter (body), Noto Sans JP (Japanese text).

### Deployment

Deployed on Render.com via `render.yaml`. Build command: `npm install && npm run build`. Start command: `npm run start`. No environment variables are required for the frontend.

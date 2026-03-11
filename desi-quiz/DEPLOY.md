# 🚀 Desi Quiz AI — Deployment Guide

## What's in this folder
```
desi-quiz/
├── api/
│   └── quiz.js          ← Backend proxy (keeps API key secret)
├── public/
│   └── index.html       ← Your game (full frontend)
├── vercel.json          ← Vercel routing config
├── package.json         ← Node.js project info
└── DEPLOY.md            ← This file
```

---

## Step 1 — Get Your Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **"API Keys"** → **"Create Key"**
4. Copy the key (starts with `sk-ant-...`) — save it somewhere safe

---

## Step 2 — Deploy to Vercel (Free)
1. Go to https://vercel.com and sign up with GitHub
2. Install Vercel CLI on your computer:
   ```
   npm install -g vercel
   ```
3. Open terminal inside this `desi-quiz` folder
4. Run:
   ```
   vercel
   ```
5. Follow prompts — choose defaults for everything
6. When asked "Link to existing project?" → **No**, create new

---

## Step 3 — Add Your API Key to Vercel (IMPORTANT)
Your API key must NEVER go in the code. Add it as an environment variable:

1. Go to https://vercel.com/dashboard
2. Click your **desi-quiz** project
3. Go to **Settings → Environment Variables**
4. Click **Add New**:
   - Name:  `ANTHROPIC_API_KEY`
   - Value: `sk-ant-your-key-here`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**
6. Re-deploy: run `vercel --prod` in terminal

---

## Step 4 — Add Google AdSense (Earn Money!)
1. Go to https://adsense.google.com
2. Sign up with your Google account
3. Add your Vercel URL (e.g. `desi-quiz.vercel.app`) as your site
4. Wait for approval (1–3 days)
5. Once approved, replace the 4 ad slots in `public/index.html`:
   - Search for `✅ REPLACE` — there are 4 spots
   - Paste the AdSense `<script>` code inside each div

---

## Step 5 — Custom Domain (Optional but recommended)
1. Buy a domain on GoDaddy or Namecheap (e.g. `desiquizai.com` — ~₹800/year)
2. In Vercel → your project → **Domains** → Add your domain
3. Follow DNS instructions → done in 10 minutes

---

## 💰 Ad Slots Summary
| Location | Type | Ad Size |
|---|---|---|
| Top of page | Banner | 728×90 |
| Bottom of page | Banner | 320×50 |
| Between questions (every 5) | Interstitial | Any |
| After game ends | Rewarded | Any |

---

## 🔧 Customization Tips
- Change the game name: search `Desi Quiz` in `index.html`
- Add more categories: edit the category cards in `index.html`
- Change number of questions: edit the prompt in `api/quiz.js` (change `10` to any number)
- Change timer: find `TIMER_S = 20` in `index.html` and change the value

---

## 🆘 Troubleshooting
- **"Could not load questions"** → Check your API key is set in Vercel env variables
- **Questions not loading locally** → Run `vercel dev` instead of opening the HTML file directly
- **CORS error** → Make sure you're using the Vercel URL, not opening index.html as a local file

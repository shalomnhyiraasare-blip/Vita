# VitaData Intelligence Platform

VitaData is an advanced, low-cost, real-time early warning analytics and vulnerability mapping dashboard designed for governments, NGOs, and humanitarian agencies. By combining lightweight community ingestion channels (represented via granular localized reporting forms) with state of the art server-side AI model classifications, VitaData translates fragmented community parameters into actionable early-warning alerts.

---

## 🎨 Visual Identity & Layout Overview
The interface has been tailored with high emphasis on readability, contrast, and cognitive offloading under high stress.
* **Responsive Layout Grid**: Seamlessly shifts between a clean collapsible desktop layout and a mobile-first floating layout.
* **Tactile Choropleth Map**: Custom SVG-based regional map with accessibility-certified patterns (`stripes`, `crosshatch`, `dots`) to support color-agnostic scanning.
* **Dynamic Recharts Charts**: Deep-dive statistical breakdowns of localized risk factors (violence indices, food insecurity, etc.) and 30-day historical time-series trends.
* **AI Analysis Feed**: Direct server-side API connection powered by `gemini-3.5-flash` to evaluate, summarize, and categorize community incident credibility.

---

## 📁 Repository Directory Structure

```text
├── .env.example                # Template for secure environment configuration keys
├── .gitignore                  # Standards excluding node modules, caches, and key configs
├── Dockerfile                  # Highly-optimized multi-stage docker compiler container configuration
├── firebase-applet-config.json # Firebase connection credentials target
├── firebase-blueprint.json     # Intermediate representation DB Schema
├── firestore.rules             # Mathematical attribute-based access control rules
├── index.html                  # Core single-page template gateway
├── metadata.json               # Frame permission constraints and metadata parameters
├── package.json                # Project node engines configuration
├── server.ts                   # Backend Express router logic with secure Gemini APIs proxy
├── tsconfig.json               # Type system specifications compiled rules
├── vercel.json                 # Vercel deployment edge routing configurations
├── vite.config.ts              # Vite asset bundler configurations
└── src/
    ├── main.tsx                # Entry point script
    ├── App.tsx                 # Core UI coordinator and state observer
    ├── index.css               # Global tailwind rules, typography, custom scrollbars, animations
    ├── types.ts                # Rigid types specifications for models and stats
    ├── components/             # Reusable modular UI components
    │   ├── AlertNotificationList.tsx   # Early-warning logs with interactive resolve states
    │   ├── AreaRiskMap.tsx             # Interactive SVG Tactile choropleth regional maps
    │   ├── BottomNav.tsx               # Floating mobile-first bottom tabs navigation menu
    │   ├── Header.tsx                  # Top header bar carrying themes, notices, profiles
    │   ├── RiskBarChart.tsx            # Recharts factors and trends visualisers
    │   ├── Sidebar.tsx                 # Collapsible navigational dashboard drawer (Desktop)
    │   ├── UserProfileDetails.tsx      # Authenticators and role-switching controls
    │   └── WidgetCards.tsx             # Primary overview stats panels grid 
    └── lib/
        └── firebase.ts                 # Dynamic database and authentication wrapper (Real/Mock state)
```

---

## 🔑 Secure Environment Variables Management

Copy `.env.example` into a local `.env` file inside the root:
```bash
cp .env.example .env
```

Define the parameters:
* `GEMINI_API_KEY`: Secret string required to run the server-side analysis. Configure in the **Secrets** panel on Google AI Studio.
* `APP_URL`: The production hosted URL, used dynamically for linking endpoints.

---

## 🚀 Easy Installation & Local Setup

### 1. Local Node Environment

Install all package dependencies:
```bash
npm install
```

Start the local development server (binds on port `3000` via Express + Vite dynamically):
```bash
npm run dev
```

Inspect output at: `http://localhost:3000`

### 2. Live Docker Compilation

To compile and verify consistent local container builds on port `3000`:

```bash
# Build the container image
docker build -t vitadata-platform .

# Launch container exposing port 3000
docker run -p 3000:3000 --env-file .env vitadata-platform
```

---

## 🔥 Setting Up Live Firebase Integration

To link this code to a live Firestore database and enable Google Authentication:

1. Click **Set Up Firebase** in the AI Studio cloud interface or configure manually.
2. Ensure `/firebase-applet-config.json` is updated with your production credentials:
   ```json
   {
     "apiKey": "YOUR_ACTUAL_API_KEY",
     "authDomain": "YOUR_PROJECT.firebaseapp.com",
     "projectId": "YOUR_PROJECT",
     "storageBucket": "YOUR_PROJECT.appspot.com",
     "messagingSenderId": "YOUR_SENDER_ID",
     "appId": "YOUR_APP_ID",
     "firestoreDatabaseId": "(default)"
   }
   ```
3. Deploy security rules using:
   ```bash
   node -e "require('child_process').execSync('npm run deploy-rules')" # or your custom CLI
   ```
4. The application dynamically detects real credentials and binds to live cloud collections.

---

## 🛡️ Vercel Edge Networks Deployment

To deploy on Vercel:
1. Push this repository to any public or private GitHub repository.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Set the Environment Variables: `GEMINI_API_KEY` in Vercel settings under "Secrets".
4. The project builds `vite build` and deploys static compilation structures cleanly, routing through the configured `vercel.json` rewrite maps.

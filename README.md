# Resonance

Resonance is a modern React application deployed at:
https://resonance.neuronus.net/

GitHub Repository:
https://github.com/Neuronus-Computing/resonance

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/Neuronus-Computing/resonance.git
cd resonance
```

### 2. Node Version Requirement

⚠️ Important: This project requires **Node.js v16**

Check your version:

```bash
node -v
```

If needed, switch using nvm:

```bash
nvm install 16
nvm use 16
```

### 3. Install dependencies

```bash
npm install
```

### 4. Environment Variables

Create a `.env` file in the root directory and add:

```
REACT_APP_API_BASE_URL=http://apiresonance.neuronus.net/api
REACT_APP_API_BASE=http://apiresonance.neuronus.net
REACT_APP_CHANNEL_URL=http://localhost:3001/channel/
REACT_APP_API_QUANTOM_BASE_URL=https://qgraphy.xyz
```

Restart the server after editing environment variables.

### 5. Start development server

```bash
npm start
```

The app will run at:

```
http://localhost:3000
```

---

## 🛠 Requirements

- Node.js v16
- npm
- Git

---

## 📁 Project Architecture

```
resonance/
│
├── public/                 # Static public files
│
├── src/
│   ├── assets/             # Images, styles, fonts
│   ├── components/         # Shared UI components
│   ├── helpers/            # Helper utilities
│   ├── locales/            # Translation files (i18n)
│   ├── pages/              # Application views/pages
│   ├── routes/             # Routing configuration
│   ├── store/              # Redux store & reducers
│   ├── util/               # Utility functions
│   ├── App.js              # Root React component
│   ├── index.js            # Entry point
│   └── i18n.js             # Internationalization config
│
├── package.json
└── README.md
```

---

## 🧠 Application Architecture

- React functional components
- Redux state management
- Modular folder architecture
- Environment-based configuration
- Real-time channel support

---

## 🏗 Production Build

To build the app for production:

```bash
npm run build
```

The optimized build will be inside:

```
/build
```


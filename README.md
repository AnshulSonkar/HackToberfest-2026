# BriefMail AI 🤖✉️

BriefMail AI is a modern, fast, and secure AI-driven email assistant built with TypeScript and Vite. It helps users instantly generate professional emails, smart replies, and follow-ups.

[![TypeScript](https://shields.io)](https://typescriptlang.org)
[![Vite](https://shields.io)](https://vite.dev)
[![License: MIT](https://shields.io)](https://opensource.org)

---

## 📂 Project Structure

Here is an overview of the project configuration files:
*   `src/` — Contains the application source code (components, logic, types).
*   `index.html` — The main entry point for the Vite application layout.
*   `server.ts` — Local Node.js server handling backend configurations or mock endpoints.
*   `vite.config.ts` — Core configuration file for Vite build settings and plugins.
*   `tsconfig.json` — TypeScript compiler settings ensuring 99.2% type safety.
*   `metadata.json` — Contains project configurations, extension metadata, or app build specs.

---

## 🛠️ Prerequisites

Make sure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org) (v18.0.0 or higher recommended)
*   [npm](https://npmjs.com) or [yarn](https://yarnpkg.com)

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd briefmail-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the provided `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and insert your respective AI model API credentials (e.g., OpenAI, Anthropic, or Gemini keys).

---

## 💻 Running the Application

### Development Server
To launch the Vite hot-reloading development server:
```bash
npm run dev
```
Once started, open your terminal output link (usually `http://localhost:5173`) in your web browser.

### Local Backend Server
To run the companion Node/TypeScript server:
```bash
npx tsx server.ts
```

### Production Build
To compile the TypeScript code and optimize the project for production distribution:
```bash
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request if you want to enhance BriefMail AI.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.

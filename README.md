# ✨ Multi-Platform Professional Calculator

A feature-rich, beautiful calculator application capable of running as a **Web App**, a **Desktop App (Electron)**, and a **Command-Line Interface (CLI)**. Built with React, Vite, Node.js, and Electron, it features a highly polished design with glassmorphism, fluid animations, and a shared mathematical core.

## 🚀 Features

- **Unified Mathematical Core:** Shared logic powers the React GUI and Node.js CLI flawlessly.
- **Dual Interfaces:** Seamlessly run a modern Desktop UI or a hacker-friendly CLI.
- **Aesthetic Design:** Complete UI overhaul with JetBrains Mono typography, custom squircle buttons, and a premium dark/light mode toggle.
- **Multiple Modes:** Switches instantly between **Standard** and **Scientific** calculation layouts.
- **Advanced Tools Sidebar:**
  - ⚖️ BMI Calculator
  - 🎂 Age Calculator
  - 💱 Currency Converter
  - 📏 Length, 🏋️ Weight, & 🌡️ Temperature converters
- **Advanced Memory:** Full functional Memory Bar (`MC`, `M+`, `M−`, `MR`)
- **Action History:** Keeps track of previous calculations, displaying them beautifully in the sidebar with timestamps. Note: History can be easily cleared.
- **Keyboard Navigation:** Full keyboard event binding handles keypresses naturally (Numpad, Enter, C, Escape, Backend, etc.).

## 📦 Tech Stack

- **Frontend:** React + Vite
- **Styling:** Vanilla CSS (CSS Variables, Flexbox/Grid, Glassmorphism)
- **Desktop Wrapper:** Electron
- **CLI Wrapper:** Node.js + Inquirer + Chalk
- **Math Engine:** math.js

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
Clone this repository and open your terminal inside the project directory:

```bash
git clone https://github.com/your-username/calculator.git
cd calculator
npm install
```

---

## 🎮 How to Run

### 1. Run as a Desktop App (Electron GUI)
Experience the full graphical interface in a standalone window:
```bash
npm run gui
```

### 2. Run as a Web App (Browser)
You can also use the live deployed version directly:

👉 **Open:** https://calculator-app-psi-sage.vercel.app/

Or run the React application locally in your browser:
```bash
npm run dev
```
Then navigate to `http://localhost:5173`.

### 3. Run as a Terminal App (CLI)
For quick, distraction-free calculations straight from your terminal:
```bash
npm run cli
```
Use the `Up ⬆️` and `Down ⬇️` arrow keys to navigate the colorful menu options, and press `Enter` to select!

## 📸 Overview

*The application features a sleek dark mode, slide-out utilitarian menus, advanced math logic parsing, and much more!*

## 🤝 Contributing
Feel free to fork this repository, submit Pull Requests, or open Issues for new feature requests (like implementing new unit converters or expanding the CLI tools). Let's build the ultimate hybrid calculator together!

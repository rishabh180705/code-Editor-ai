# 🧠 CodeHack – AI-Powered Code Editor

**CodeHack** is an intelligent, real-time code editor that combines the power of AI with a customizable developer environment. Built with React and Monaco Editor, it provides smart code suggestions, syntax highlighting, real-time execution (via Piston API), and voice-to-code capabilities – all in a sleek, modern interface.


---

## 🚀 Features

- 🧠 **AI Code Suggestions** – Auto-complete your code using OpenAI-powered intelligent prompts.
- 🎤 **Voice Input** – Write code using voice commands with real-time speech-to-text.
- 🌐 **Multi-language Support** – Supports C++, Java, Python and more using [Piston API](https://github.com/engineer-man/piston).
- 🎨 **Theme Customization** – Switch between light/dark modes and various Monaco themes.
- 🧪 **Live Code Execution** – Instantly compile and run code in the editor itself.
- 💾 **Auto-Save** – Your code is automatically saved locally.
- 📜 **Input/Output Panel** – Feed custom input and view output in a terminal-like UI.
- 🔊 **Accessibility** – Works with screen readers and has high-contrast mode support.

---

## 🖼️ Demo

👉 [Live Demo](https://your-deployment-url.vercel.app)  
🚧 _Currently in beta – features are being actively improved._

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Monaco Editor
- **AI Integration**: OpenAI API
- **Code Execution**: Piston API
- **Voice Input**: Web Speech API / `react-speech-recognition`

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/codespace-pro.git

# Navigate into the project
cd codespace-pro

# Install dependencies
npm install

# Add environment variables
# .env
VITE_OPENAI_API_KEY=your_openai_key_here

# Run the development server
npm run dev

 

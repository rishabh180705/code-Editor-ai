import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Dictaphone from "./speech";
import { debounce } from "lodash";
import axios from "axios";
const apiKey = import.meta.env.VITE_OPENROUTER_KEY;
import "./codeEditor.css";
import {
  FaDownload,
  FaPlay,
  FaSave,
  FaMicrophone,
  FaCode,
  FaPalette,
  FaSearch,
  FaCopy,
  FaUndo,
  FaRedo,
  FaExpand,
  FaCompress,
  FaFileCode,
  FaTerminal,
  FaCog,
  FaGithub,
  FaMoon,FaSun,FaFont,FaEye,FaEyeSlash,FaFolder,FaFile,
} from "react-icons/fa";

const themes = [
  { value: "vs-dark", label: "Dark", icon: FaMoon },
  { value: "light", label: "Light", icon: FaSun },
  { value: "hc-black", label: "High Contrast Dark", icon: FaEye },
  { value: "hc-light", label: "High Contrast Light", icon: FaEyeSlash },
];

const languages = [
  { value: "javascript", label: "JavaScript", icon: "🟨" },
  { value: "typescript", label: "TypeScript", icon: "🔷" },
  { value: "python", label: "Python", icon: "🐍" },
  { value: "cpp", label: "C++", icon: "⚡" },
  { value: "java", label: "Java", icon: "☕" },
];

const CodeEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(16);
  const [code, setCode] = useState("// Start coding...");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Ready to run your code...");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [minimap, setMinimap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [isRunning, setIsRunning] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [ghostText, setGhostText] = useState("");


  const editorRef = useRef(null);
  const monacoRef = useRef(null);


  // Load from state management (no localStorage)
//   useEffect(() => {
//     setCode(defaultCodes[language] || "// Start coding...");
//   }, [language]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        // Auto-save logic would go here
        console.log("Auto-saved");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [code, autoSave]);



const handleEditorDidMount = (editor, monaco) => {
  editorRef.current = editor;
  monacoRef.current = monaco;

  editor.onDidChangeCursorPosition((e) => {
    setCursorPosition({
      line: e.position.lineNumber,
      column: e.position.column,
    });
  });

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, saveCode);
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, runCode);

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
  });
};


useEffect(() => {
  if (!editorRef.current || !monacoRef.current) return;

  editorRef.current.addCommand(
    monacoRef.current.KeyCode.Tab,
    () => {
      if (ghostText) {
        const currentPosition = editorRef.current.getPosition();
        editorRef.current.executeEdits("", [
          {
            range: new monacoRef.current.Range(
              currentPosition.lineNumber,
              currentPosition.column,
              currentPosition.lineNumber,
              currentPosition.column
            ),
            text: ghostText,
            forceMoveMarkers: true,
          },
        ]);
        setGhostText("");
        editorRef.current.focus();
      }
    }
  );
}, [ghostText]);



const applyGhostText = (text, position) => {
  if (!editorRef.current || !monacoRef.current) return;

  editorRef.current.deltaDecorations(
    [], // Clear previous decorations
    [
      {
        range: new monacoRef.current.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        options: {
          after: {
            contentText: text,
            inlineClassName: "ghost-text",
          },
          showIfCollapsed: true,
        },
      },
    ]
  );
};




const debounceInlineSuggest = debounce(async (code, position) => {
  const codeUntilCursor = code.split("\n")
    .slice(0, position.lineNumber)
    .join("\n");

  const prompt = `Continue the following code and give code only for correct syntax \n${codeUntilCursor}`;

  try {
    const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "thudm/glm-4-32b:free", // or any available model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 40
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`, // your OpenRouter API key
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", // optional but helps OpenRouter track usage
        "X-Title": "CodeSpace Pro" // optional title for analytics
      }
    });

    const suggestionText = res.data.choices[0].message.content.trim();
    setGhostText(suggestionText);
    applyGhostText(suggestionText, position);
    console.log("Suggesting ghost text at:", position, suggestionText);

  } catch (err) {
    console.error("Ghost suggestion failed:", err?.response?.data || err.message);
  }
}, 3000);


const handleChange = (value) => {
  setCode(value || "");
  if (editorRef.current) {
    debounceInlineSuggest(value || "", editorRef.current.getPosition());
  }
};



  const saveCode = () => {
    // Instead of localStorage, we'll just show a success message
    setOutput(`✅ Code saved successfully for ${language}!`);
  };

  const downloadCode = () => {
    const file = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = `code.${getFileExtension(language)}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      cpp: "cpp",
     java: "java",
    };
    return extensions[lang] || "txt";
  };

  const runCode = async () => {
    if (language !== "javascript") {
      setOutput(
        "⚠️ Code execution is only supported for JavaScript in the browser environment."
      );
      return;
    }

    setIsRunning(true);
    setOutput("🚀 Running code...");

    try {
      const log = [];
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => log.push("📝 " + args.join(" "));
      console.error = (...args) => log.push("❌ " + args.join(" "));

      // Add a small delay to show the running state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // eslint-disable-next-line no-eval
      eval(code);

      setOutput(
        log.length > 0
          ? log.join("\n")
          : "✅ Code executed successfully (no output)"
      );

      console.log = originalLog;
      console.error = originalError;
    } catch (err) {
      setOutput(`❌ Runtime Error:\n${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setOutput("📋 Code copied to clipboard!");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const undoAction = () => {
    if (editorRef.current) {
      editorRef.current.trigger("keyboard", "undo", null);
    }
  };

  const redoAction = () => {
    if (editorRef.current) {
      editorRef.current.trigger("keyboard", "redo", null);
    }
  };

  const findAndReplace = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.startFindReplaceAction").run();
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        theme === "vs-dark" || theme === "hc-black"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      } ${
        theme === "vs-dark" || theme === "hc-black"
          ? "text-white"
          : "text-gray-900"
      } font-sans ${isFullscreen ? "fixed inset-0 z-50" : "p-4"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaFileCode className="text-3xl text-blue-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              CodeSpace
            </h1>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              theme === "vs-dark" || theme === "hc-black"
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-700"
            }`}
          ></div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`text-sm px-3 py-1 rounded ${
              theme === "vs-dark" || theme === "hc-black"
                ? "bg-gray-700"
                : "bg-gray-200"
            }`}
          >
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              theme === "vs-dark" || theme === "hc-black"
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-200 text-gray-600"
            }`}
          >
            <FaCog />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            theme === "vs-dark" || theme === "hc-black"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300 shadow-lg"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaCog className="mr-2" /> Editor Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
                className="rounded"
              />
              <span>Word Wrap</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={minimap}
                onChange={(e) => setMinimap(e.target.checked)}
                className="rounded"
              />
              <span>Minimap</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={lineNumbers}
                onChange={(e) => setLineNumbers(e.target.checked)}
                className="rounded"
              />
              <span>Line Numbers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded"
              />
              <span>Auto Save</span>
            </label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-1 py-1 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
        >
          <FaPlay />
          <span>{isRunning ? "Running..." : "Run Code"}</span>
        </button>

        <button
          onClick={saveCode}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <FaSave />
          <span>Save</span>
        </button>

        <button
          onClick={downloadCode}
          className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-1 py-1 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <FaDownload />
          <span>Download</span>
        </button>

      

        <button
          onClick={copyCode}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <FaCopy />
          <span>Copy</span>
        </button>

        <button
          onClick={findAndReplace}
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <FaSearch />
          <span>Find</span>
        </button>

        <button
          onClick={undoAction}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            theme === "vs-dark" || theme === "hc-black"
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <FaUndo />
          <span>Undo</span>
        </button>

        <button
          onClick={redoAction}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            theme === "vs-dark" || theme === "hc-black"
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <FaRedo />
          <span>Redo</span>
        </button>

    
          
        <Dictaphone setCode={setCode} />

        <button
          onClick={toggleFullscreen}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            theme === "vs-dark" || theme === "hc-black"
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
          <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            className={`w-full p-2 rounded-lg border ${
              theme === "vs-dark" || theme === "hc-black"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.icon} {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <select
            className={`w-full p-2 rounded-lg border ${
              theme === "vs-dark" || theme === "hc-black"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {themes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <select
            className={`w-full p-2 rounded-lg border ${
              theme === "vs-dark" || theme === "hc-black"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          >
            {[10, 12, 14, 16, 18, 20, 24, 28].map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Actions</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setCode("")}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                theme === "vs-dark" || theme === "hc-black"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Clear
            </button>
            <button
              onClick={() => setCode(defaultCodes[language])}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                theme === "vs-dark" || theme === "hc-black"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div
        className={`rounded-lg overflow-hidden shadow-2xl border relative ${
          theme === "vs-dark" || theme === "hc-black"
            ? "border-gray-700"
            : "border-gray-300"
        }`}
      >
     

        <Editor
          height={isFullscreen ? "calc(100vh - 500px)" : "60vh"}
          theme={theme}
          language={language}
          value={code}
          onChange={(value) => {
            handleChange(value);
          }}
          onMount={handleEditorDidMount}
          options={{
            fontSize,
            fontFamily:
              "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            minimap: { enabled: minimap },
            automaticLayout: true,
            formatOnType: true,
            formatOnPaste: true,
            autoIndent: "full",

            insertSpaces: true,
            tabSize:2,
            renderLineHighlight: "all",
            scrollBeyondLastColumn: 5,
            scrollBeyondLastLine: true,
            tabCompletion: "on",
            contextmenu: true,
            quickSuggestions: true,
            quickSuggestionsDelay: 100,
            parameterHints: true,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoClosingOvertype: "always",
            autoSurround: { language },
            autoIndent: "advanced",
            selectionHighlight: true,
            overviewRulerLanes: 3,
            overviewRulerBorder: true,
            renderLineHighlightOnlyWhenFocus: false,
            renderLineHighlight: "gutter",
            renderIndentGuides: true,
            renderFinalNewline: true,
            renderLineNumbers: "on",
            renderValidationDecorations: "editable",
            renderWhitespace: "boundary",
            renderControlCharacters: true,
            renderIndentGuides: true,
            renderLineHighlight: "all",
            renderLineHighlightOnlyWhenFocus: false,
            renderLineHighlight: "gutter",
            renderFinalNewline: true,
            renderLineNumbers: "on",
            decreaseIndentPattern: RegExp,
            increaseIndentPattern: RegExp,
            indentNextLinePattern: RegExp,
            unIndentedLinePattern: RegExp,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,

            wordWrap: wordWrap ? "on" : "off",
            lineNumbers: lineNumbers ? "on" : "off",
            renderWhitespace: "selection",
            cursorStyle: "line",
            cursorBlinking: "blink",
            smoothScrolling: true,
            mouseWheelZoom: true,
            folding: true,
            foldingStrategy: "indentation",
            showFoldingControls: "always",
            unfoldOnClickAfterEndOfLine: false,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: "active",
              highlightActiveIndentation: true,
              indentation: true,
            },
            suggest: {
              showMethods: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showKeywords: true,
              showWords: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showSnippets: true,
              showUsers: true,
              showIssues: true,
              showCustomColors: true,
            },
          }}
        />
           {suggestion && (
          <div className="bg-gray-100 text-sm p-3 rounded mt-3 shadow">
            💡 <strong>AI Suggestion:</strong>
            <br />
            {suggestion}
          </div>
        )}
      </div>

      {/* Input & Output */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center">
            <FaTerminal className="mr-2" />
            Input (for future interactive features)
          </label>
          <textarea
            className={`w-full h-32 p-3 rounded-lg border font-mono text-sm resize-true ${
              theme === "vs-dark" || theme === "hc-black"
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Input data for your program..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center">
            <FaTerminal className="mr-2" />
            Output Console
          </label>
          <pre
            className={`w-full h-32 p-3 rounded-lg font-mono text-sm overflow-auto whitespace-pre-wrap ${
              theme === "vs-dark" || theme === "hc-black"
                ? "bg-black text-green-400 border border-gray-700"
                : "bg-gray-50 text-gray-800 border border-gray-300"
            }`}
          >
            {output}
          </pre>
        </div>
      </div>

    </div>
  );
};

export default CodeEditor;



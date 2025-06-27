import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import Dictaphone from "./speech";
// import CodeRunner from "./runCode";
// import { debounce, set } from "lodash";
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
  FaMoon,
  FaSun,
  FaFont,
  FaEye,
  FaEyeSlash,
  FaFolder,
  FaFile,
} from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { GiHamburgerMenu } from "react-icons/gi";

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

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const CodeEditor = () => {
  const [language, setLanguage] = useState("cpp");
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
  const [showSidebar, setShowSidebar] = useState(true);
  const [apiKey, setApiKey] = useState(""); // Fixed variable name
  const [model, setModel] = useState(""); // Fixed variable name
  const [aiEnabled, setAiEnabled] = useState(false); // Fixed variable name

  const debounceTimerRef = useRef(null);
  const isRequestingRef = useRef(false);
  const lastRequestRef = useRef({ code: "", position: null });
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  const llmModels = []; // You can populate this with available models
  const { project, topic, urllanguage } = useParams();

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, saveCode);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, runCode);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, downloadCode);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, copyCode);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, findAndReplace);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, undoAction);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY, redoAction);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, toggleFullscreen);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM, () => {
      setShowSidebar(!showSidebar);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      setShowSettings(!showSettings);
    });

    // Configure TypeScript/JavaScript settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
    });
  };

  // Set language from URL parameter
  useEffect(() => {
    if (urllanguage) {
      setLanguage(urllanguage);
    }
  }, [urllanguage]);

  // Load code from localStorage
  useEffect(() => {
    if (!project || !topic) return;

    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const selectedProjectIndex = savedProjects.findIndex(p => p.name === project);

    if (selectedProjectIndex !== -1) {
      const foundProject = savedProjects[selectedProjectIndex];
      let foundTopic = foundProject.topics?.find(
        t => t.name === topic && t.language === language
      );

      if (!foundTopic) {
        // Create new topic if it doesn't exist
        if (!foundProject.topics) foundProject.topics = [];
        foundProject.topics.push({
          name: topic.trim(),
          language,
          code: "// Start coding here...",
        });
        localStorage.setItem("projects", JSON.stringify(savedProjects));
        foundTopic = foundProject.topics.find(
          t => t.name === topic && t.language === language
        );
      }

      setCode(foundTopic?.code || "// Start coding here...");
    }
  }, [project, topic, language]);

  // Auto-save code to localStorage
  useEffect(() => {
    if (!project || !topic || !code) return;

    const interval = setInterval(() => {
      const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
      const updatedProjects = savedProjects.map(p => {
        if (p.name === project) {
          return {
            ...p,
            topics: p.topics?.map(t =>
              t.name === topic && t.language === language 
                ? { ...t, code } 
                : t
            ) || []
          };
        }
        return p;
      });
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
    }, 1000);

    return () => clearInterval(interval);
  }, [code, project, topic, language]);

  const saveCode = useCallback(() => {
    if (!project || !topic) return;

    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const updatedProjects = savedProjects.map(p => {
      if (p.name === project) {
        return {
          ...p,
          topics: p.topics?.map(t =>
            t.name === topic && t.language === language
              ? { ...t, code }
              : t
          ) || []
        };
      }
      return p;
    });

    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    alert("Code saved manually!");
  }, [code, project, topic, language]);

  // Clear suggestion after timeout
  useEffect(() => {
    if (suggestion) {
      const timer = setTimeout(() => {
        setSuggestion("");
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [suggestion]);

  const debounceInlineSuggest = useCallback(
    debounce(async (code, position) => {
      if (isRequestingRef.current || !code || !position || !aiEnabled || !apiKey) {
        return;
      }

      const currentRequest = {
        code,
        position: position ? `${position.lineNumber}:${position.column}` : null,
      };

      if (
        lastRequestRef.current.code === currentRequest.code &&
        lastRequestRef.current.position === currentRequest.position
      ) {
        return;
      }

      lastRequestRef.current = currentRequest;
      isRequestingRef.current = true;

      const codeUntilCursor = code
        .split("\n")
        .slice(0, position.lineNumber)
        .join("\n");

      const prompt = `Continue this code and return only valid code (no explanation) and return only next code of line and missing code do not return query code and duplicate code as it used for suggestions in my editor and if code is correct do not return anything:\n${codeUntilCursor}`;

      try {
        const res = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "thudm/glm-4-32b:free",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            max_tokens: 40,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": window.location.origin,
              "X-Title": "CodeSpace Pro",
            },
          }
        );

        const suggestionText = res.data.choices[0].message.content.trim();

        if (editorRef.current && editorRef.current.getPosition()) {
          const currentPos = editorRef.current.getPosition();
          if (
            currentPos.lineNumber === position.lineNumber &&
            currentPos.column === position.column
          ) {
            setGhostText(suggestionText);
            applyGhostText(suggestionText, position);
            setSuggestion(suggestionText);
            setOutput(`AI Suggestion: ${suggestionText}`);
          }
        }
      } catch (error) {
        console.error("Inline suggestion error:", error?.response?.data || error.message);
        setOutput(`Error: ${error.message}`);
      } finally {
        isRequestingRef.current = false;
      }
    }, 2500),
    [apiKey, aiEnabled]
  );

  // Setup editor actions for Tab and Ctrl+Space
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const tabAction = editor.addAction({
      id: "apply-ghost-text",
      label: "Apply Ghost Text",
      keybindings: [monaco.KeyCode.Tab],
      run: () => {
        if (ghostText) {
          const pos = editor.getPosition();
          editor.executeEdits("", [
            {
              range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
              text: ghostText,
              forceMoveMarkers: true,
            },
          ]);
          setGhostText("");
          setSuggestion("");
          editor.focus();
          return null;
        }
      },
    });

    const ctrlSpaceAction = editor.addAction({
      id: "trigger-ai-suggestion",
      label: "Trigger AI Suggestion",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space],
      run: () => {
        const pos = editor.getPosition();
        const currentCode = editor.getValue();
        if (aiEnabled && pos && currentCode) {
          debounceInlineSuggest(currentCode, pos);
        }
        return null;
      },
    });

    return () => {
      tabAction?.dispose();
      ctrlSpaceAction?.dispose();
    };
  }, [ghostText, debounceInlineSuggest, aiEnabled]);

  const applyGhostText = useCallback((text, position) => {
    if (!editorRef.current || !monacoRef.current) return;

    // Clear previous decorations
    const model = editorRef.current.getModel();
    const decorations = model.getAllDecorations().map(d => d.id);
    editorRef.current.deltaDecorations(decorations, []);

    // Apply new ghost text decoration
    editorRef.current.deltaDecorations([], [
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
    ]);
  }, []);

  const handleChange = useCallback((value) => {
    setCode(value || "");

    if (ghostText) {
      setGhostText("");
    }

    if (editorRef.current && aiEnabled && value) {
      const position = editorRef.current.getPosition();
      if (position) {
        debounceInlineSuggest(value, position);
      }
    }
  }, [ghostText, aiEnabled, debounceInlineSuggest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      isRequestingRef.current = false;
    };
  }, []);

  const downloadCode = useCallback(() => {
    const file = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = `code.${getFileExtension(language)}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [code, language]);

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      cpp: "cpp",
      java: "java",
      c: "c",
      csharp: "cs",
      php: "php",
      ruby: "rb",
      go: "go",
      rust: "rs",
    };
    return extensions[lang] || "txt";
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("🚀 Running code...");

    // if (!code || code.trim().startsWith("// Start coding")) {
    //   setOutput("⚠️ Please write some code before running.");
    //   setIsRunning(false);
    //   return;
    // }

    if (language !== "javascript") {
      try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language,
            version: "*",
            files: [
              {
                name: `main.${getFileExtension(language)}`,
                content: code,
              },
            ],
            stdin: input,
          }),
        });

        const result = await response.json();
        setOutput(result.run?.output || result.run?.stderr || "⚠️ No output.");
      } catch (err) {
        setOutput(`❌ Error executing code: ${err.message}`);
      } finally {
        setIsRunning(false);
      }
    } else {
      // JavaScript execution
      try {
        const log = [];
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => log.push("📝 " + args.join(" "));
        console.error = (...args) => log.push("❌ " + args.join(" "));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Create a safe execution context
        const func = new Function(code);
        func();

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
    }
  };

  // Placeholder functions for missing methods
  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  }, [code]);

  // const findAndReplace = useCallback(() => {
  //   if (editorRef.current) {
  //     editorRef.current.getAction('actions.find').run();
  //   }
  // }, []);

  const undoAction = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
    }
  }, []);

  const redoAction = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const findAndReplace = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.startFindReplaceAction").run();
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 flex ${
        theme === "vs-dark" || theme === "hc-black"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"
      } font-sans`}
    >
      <div className="flex">
        {/* Drag Handle */}
        <div
          onClick={() => setShowSidebar(!showSidebar)}
          className={`w-2 cursor-ew-resize hover:w-3 transition-all duration-200 ${
            theme === "vs-dark" ? "bg-gray-700" : "bg-gray-300"
          }`}
          title={showSidebar ? "Hide Panel" : "Show Panel"}
        />

        {/* Sidebar */}
        {showSidebar && (
          <div
            className={`w-64 hidden lg:flex flex-col justify-between p-4 border-r overflow-y-auto h-screen ${
              theme === "vs-dark" || theme === "hc-black"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            {/* ...your sidebar content remains the same... */}
            {/* Sidebar */}
            <div
              className={`w-64 hidden lg:flex flex-col justify-between p-4 border-r overflow-y-auto h-screen ${
                theme === "vs-dark" || theme === "hc-black"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <div>
                <div
                  className="relative flex justify-end mb-2"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <RxCross1 className="cursor-pointer hover:text-red-500 transition duration-200" />
                </div>
                <h2 className="text-lg font-bold mb-4">Features & Controls</h2>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-3 py-1 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 w-full"
                  >
                    <FaPlay />
                    <span>{isRunning ? "Running..." : "Run Code"}</span>
                  </button>
                  {/* {language !== "javascript" && (
                    <CodeRunner/>
                  )} */}

                  <button
                    onClick={saveCode}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 py-1 rounded-lg transition-all duration-200 transform hover:scale-105 w-full"
                  >
                    <FaSave />
                    <span>Save</span>
                  </button>

                  <button
                    onClick={downloadCode}
                    className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-3 py-1 rounded-lg transition-all duration-200 transform hover:scale-105 w-full"
                  >
                    <FaDownload />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={copyCode}
                    className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-3 py-1 rounded-lg transition-all duration-200 transform hover:scale-105 w-full"
                  >
                    <FaCopy />
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={findAndReplace}
                    className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 px-3 py-1 rounded-lg transition-all duration-200 transform hover:scale-105 w-full"
                  >
                    <FaSearch />
                    <span>Find</span>
                  </button>

                  <button
                    onClick={undoAction}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-all duration-200 w-full ${
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
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-all duration-200 w-full ${
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
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-all duration-200 w-full ${
                      theme === "vs-dark" || theme === "hc-black"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                    <span>
                      {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </span>
                  </button>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Language
                    </label>
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
                    <label className="block text-sm font-medium mb-1">
                      Theme
                    </label>
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
                    <label className="block text-sm font-medium mb-1">
                      Font Size
                    </label>
                    <select
                      className={`w-full p-2 rounded-lg border ${
                        theme === "vs-dark" || theme === "hc-black"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                    >
                      {[14, 16, 18, 20, 24, 28, 30, 32, 34].map((size) => (
                        <option key={size} value={size}>
                          {size}px
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Quick Actions
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCode("")}
                        className={`px-3 py-1 rounded-lg text-sm w-1/2 ${
                          theme === "vs-dark" || theme === "hc-black"
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setCode(defaultCodes[language])}
                        className={`px-3 py-1 rounded-lg text-sm w-1/2 ${
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 p-4 ${
          isFullscreen ? "fixed inset-0 z-50 bg-black" : "relative"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center space-x-3">
            <FaFileCode className="text-2xl text-blue-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Code{"</"}HaCk{"\\>"}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`text-xs px-2 py-1 rounded ${
                theme === "vs-dark" || theme === "hc-black"
                  ? "bg-gray-700"
                  : "bg-gray-200"
              }`}
            >
              Ln {cursorPosition.line}, Col {cursorPosition.column}
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${
                theme === "vs-dark" || theme === "hc-black"
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-200 text-gray-600"
              }`}
            >
              <FaCog />
            </button>
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2 rounded-lg  ${
                  theme === "vs-dark" || theme === "hc-black"
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
              >
                <GiHamburgerMenu />
              </button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            className={`mb-4 p-4 rounded-lg border ${
              theme === "vs-dark" || theme === "hc-black"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300 shadow"
            }`}
          >
            <h3 className="text-base font-semibold mb-3 flex items-center">
              <FaCog className="mr-2" /> Editor Settings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Word Wrap */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                  className="rounded"
                />
                <span>Word Wrap</span>
              </label>
              {/* Minimap */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={minimap}
                  onChange={(e) => setMinimap(e.target.checked)}
                  className="rounded"
                />
                <span>Minimap</span>
              </label>
              {/* Line Numbers */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={lineNumbers}
                  onChange={(e) => setLineNumbers(e.target.checked)}
                  className="rounded"
                />
                <span>Line Numbers</span>
              </label>
              {/* Auto Save */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="rounded"
                />
                <span>Auto Save</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="rounded"
                />
                <span>Ai</span>
              </label>
              <div className="col-span-2  ">
                <label className="flex items-center space-x-2">LLM Model</label>
                <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"></select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setkey(e.target.value)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue
                  dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Enter your OpenRouter API Key"
                />
              </label>
            </div>
          </div>
        )}

        {/* Editor Panel */}
        <div
          className={`relative rounded-lg border shadow-xl mb-4  className="ghost-text"${
            theme === "vs-dark" || theme === "hc-black"
              ? "border-gray-700"
              : "border-gray-300"
          }`}
        >
          <div className="absolute bottom-3 right-2 z-10">
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg text-xs ${
                theme === "vs-dark" || theme === "hc-black"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}{" "}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </div>

          <Editor
            height={isFullscreen ? "calc(100vh - 140px)" : "67vh"}
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
              tabSize: 2,
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
              selectionHighlight: true,
              overviewRulerLanes: 3,
              overviewRulerBorder: true,
              renderLineHighlightOnlyWhenFocus: false,
              renderIndentGuides: true,
              renderFinalNewline: true,
              renderLineNumbers: "on",
              renderValidationDecorations: "editable",
              renderWhitespace: "boundary",
              renderControlCharacters: true,
              suggestOnTriggerCharacters: true,

              wordWrap: wordWrap ? "on" : "off",
              lineNumbers: lineNumbers ? "on" : "off",

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
            <div className="bg-gray-100 text-sm p-3 rounded mt-3 shadow text-black">
              💡 <strong>AI Suggestion:</strong>
              <br />
              {suggestion}
            </div>
          )}
        </div>

        {/* Input / Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium flex items-center mb-1">
              <FaTerminal className="mr-2" /> Input
            </label>
            <textarea
              className={`w-full h-28 p-3 rounded-lg border font-mono text-sm resize ${true} ${
                theme === "vs-dark" || theme === "hc-black"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input data for your program..."
            />
          </div>
          <div>
            <label className="text-sm font-medium flex items-center mb-1">
              <FaTerminal className="mr-2" /> Output
            </label>
            <pre
              className={`w-full h-28 p-3 rounded-lg font-mono text-sm overflow-auto whitespace-pre-wrap ${
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
    </div>
  );
};

export default CodeEditor;
import { useState } from "react";

const CodeRunner = ({language,setOutput,input}) => {


  const runCode = async () => {
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language,
          version: "*",
          files: [
            {
              name: `main.${language === "python" ? "py" : language === "java" ? "java" : "cpp"}`,
              content: code,
            },
          ],
          stdin: input,
        }),
      });

      const result = await response.json();
      setOutput(result.run.output || result.run.stderr);
    } catch (err) {
      setOutput("Error executing code.");
    }
  };

  return (
    <div>

      <button
        onClick={runCode}
        className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded text-white font-semibold"
      >
        Run Code
      </button>
    </div>
  );
};

export default CodeRunner;

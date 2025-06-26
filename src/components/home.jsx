import React, { useEffect, useState, useCallback } from "react";
import {
  FaJava,
  FaJsSquare,
  FaPython,
  FaEdit,
  FaSave,
  FaTrash,
  FaMicrophone,
  FaGithub,
  FaCode,
  FaFolder,
  FaPlus,
} from "react-icons/fa";
import { SiCplusplus, SiTypescript } from "react-icons/si";
import { useNavigate } from "react-router-dom";

const languageIcon = (lang) => {
  switch (lang) {
    case "cpp":
      return <SiCplusplus className="text-blue-400 text-xl" />;
    case "java":
      return <FaJava className="text-red-500 text-xl" />;
    case "javascript":
      return <FaJsSquare className="text-yellow-400 text-xl" />;
    case "typescript":
      return <SiTypescript className="text-blue-500 text-xl" />;
    case "python":
      return <FaPython className="text-blue-300 text-xl" />;
    default:
      return <FaCode className="text-gray-400 text-xl" />;
  }
};

const HomePage = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);
  const [topicName, setTopicName] = useState("");
  const [language, setLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [editingTopicIndex, setEditingTopicIndex] = useState(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [editTopicName, setEditTopicName] = useState("");
  const [editLanguage, setEditLanguage] = useState("");

  const navigate = useNavigate();

  // Load projects from localStorage
  useEffect(() => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
      setProjects(savedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setError("Failed to load projects from storage");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("projects", JSON.stringify(projects));
      } catch (error) {
        console.error("Error saving projects:", error);
        setError("Failed to save projects to storage");
      }
    }
  }, [projects, isLoading]);

  const createProject = useCallback(() => {
    const name = projectName.trim();
    if (!name) {
      setError("Project name cannot be empty");
      return;
    }
    
    // Check for duplicate project names
    if (projects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError("A project with this name already exists");
      return;
    }

    setProjects(prev => [...prev, { name, topics: [] }]);
    setProjectName("");
    setError("");
  }, [projectName, projects]);

  const addTopicToProject = useCallback(() => {
    if (selectedProjectIndex === null) {
      setError("Please select a project first");
      return;
    }
    
    if (!topicName.trim()) {
      setError("Topic name cannot be empty");
      return;
    }
    
    if (!language) {
      setError("Please select a programming language");
      return;
    }

    const trimmedTopicName = topicName.trim();
    const selectedProject = projects[selectedProjectIndex];
    
    // Check for duplicate topic names within the same project and language
    if (selectedProject.topics.some(t => 
      t.name.toLowerCase() === trimmedTopicName.toLowerCase() && 
      t.language === language
    )) {
      setError("A topic with this name and language already exists in this project");
      return;
    }

    setProjects(prev => {
      const updated = [...prev];
      updated[selectedProjectIndex].topics.push({
        name: trimmedTopicName,
        language,
        code: `// Welcome to ${trimmedTopicName}\n// Start coding here...\n`,
      });
      return updated;
    });
    
    setTopicName("");
    setLanguage("");
    setError("");
  }, [selectedProjectIndex, topicName, language, projects]);

  const saveProjectEdit = useCallback((index) => {
    const name = editProjectName.trim();
    if (!name) {
      setError("Project name cannot be empty");
      return;
    }
    
    // Check for duplicate names (excluding current project)
    if (projects.some((p, i) => i !== index && p.name.toLowerCase() === name.toLowerCase())) {
      setError("A project with this name already exists");
      return;
    }

    setProjects(prev => {
      const updated = [...prev];
      updated[index].name = name;
      return updated;
    });
    
    setEditingProjectIndex(null);
    setEditProjectName("");
    setError("");
  }, [editProjectName, projects]);

  const saveTopicEdit = useCallback((pIndex, tIndex) => {
    const name = editTopicName.trim();
    if (!name) {
      setError("Topic name cannot be empty");
      return;
    }
    
    if (!editLanguage) {
      setError("Please select a programming language");
      return;
    }

    const project = projects[pIndex];
    // Check for duplicates (excluding current topic)
    if (project.topics.some((t, i) => 
      i !== tIndex && 
      t.name.toLowerCase() === name.toLowerCase() && 
      t.language === editLanguage
    )) {
      setError("A topic with this name and language already exists in this project");
      return;
    }

    setProjects(prev => {
      const updated = [...prev];
      updated[pIndex].topics[tIndex].name = name;
      updated[pIndex].topics[tIndex].language = editLanguage;
      return updated;
    });
    
    setEditingTopicIndex(null);
    setEditTopicName("");
    setEditLanguage("");
    setError("");
  }, [editTopicName, editLanguage, projects]);

  const deleteProject = useCallback((index) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      setProjects(prev => prev.filter((_, i) => i !== index));
      setError("");
    }
  }, []);

  const deleteTopic = useCallback((pIndex, tIndex) => {
    if (window.confirm("Are you sure you want to delete this topic? This action cannot be undone.")) {
      setProjects(prev => {
        const updated = [...prev];
        updated[pIndex].topics.splice(tIndex, 1);
        return updated;
      });
      setError("");
    }
  }, []);

  const handleTopicClick = useCallback((proj, topic) => {
    try {
      const projectNameEncoded = encodeURIComponent(proj.name.trim());
      const topicNameEncoded = encodeURIComponent(topic.name.trim());
      navigate(`/editor/${projectNameEncoded}/${topicNameEncoded}/${topic.language}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setError("Failed to open editor");
    }
  }, [navigate]);

  const cancelEdit = useCallback(() => {
    setEditingProjectIndex(null);
    setEditingTopicIndex(null);
    setEditProjectName("");
    setEditTopicName("");
    setEditLanguage("");
    setError("");
  }, []);

  const handleKeyPress = useCallback((e, action) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }, [cancelEdit]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaCode className="text-emerald-400 text-2xl" />
          <h1 className="text-2xl font-bold text-emerald-400">
            Code{"</"}HaCk{"\\>"}
          </h1>
        </div>
        <a
          href="https://github.com/rishabh180705/code-Editor-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <FaGithub />
          GitHub
        </a>
      </header>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-3 mx-6 mt-4 rounded flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-200 ml-4"
          >
            ×
          </button>
        </div>
      )}

      <main className="flex flex-1 overflow-hidden divide-x divide-gray-800">
        {/* Left Panel - Create Projects/Topics */}
        <div className="w-1/2 p-8 overflow-y-auto">
          <div className="mb-10 text-center">
            <FaMicrophone className="mx-auto text-4xl text-emerald-400 mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold mb-4">AI Powered Assistant</h2>
            <div className="space-y-2 text-gray-400">
              <p>🎤 Just speak your idea – we'll write the code.</p>
              <p>✨ Accelerate your coding workflow with AI.</p>
              <p>🧠 Describe what you want – watch the magic happen.</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Create Project Section */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <FaFolder className="text-emerald-400" />
                <h2 className="text-xl font-semibold">Create a Project</h2>
              </div>
              <div className="space-y-3">
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, createProject)}
                  placeholder="Enter project name"
                  className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  maxLength={50}
                />
                <button
                  onClick={createProject}
                  disabled={!projectName.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <FaPlus />
                  Create Project
                </button>
              </div>
            </div>

            {/* Add Topic Section */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <FaCode className="text-emerald-400" />
                <h2 className="text-xl font-semibold">Add Topic</h2>
              </div>
              <div className="space-y-3">
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedProjectIndex(value === "" ? null : Number(value));
                  }}
                  value={selectedProjectIndex === null ? "" : selectedProjectIndex}
                  className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="" disabled>
                    {projects.length === 0 ? "No projects available" : "Select project"}
                  </option>
                  {projects.map((proj, idx) => (
                    <option key={idx} value={idx}>
                      {proj.name}
                    </option>
                  ))}
                </select>
                <input
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addTopicToProject)}
                  placeholder="Enter topic name"
                  className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  maxLength={50}
                />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select programming language</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                </select>
                <button
                  onClick={addTopicToProject}
                  disabled={selectedProjectIndex === null || !topicName.trim() || !language}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <FaPlus />
                  Add Topic
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Projects List */}
        <div className="w-1/2 p-8 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <FaFolder className="text-emerald-400 text-2xl" />
            <h2 className="text-2xl font-semibold">My Projects</h2>
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-sm">
              {projects.length}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FaFolder className="mx-auto text-6xl text-gray-600 mb-4" />
              <p className="text-gray-500 italic text-lg">No projects created yet.</p>
              <p className="text-gray-600 text-sm mt-2">Create your first project to get started!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((proj, pIndex) => (
                <div key={pIndex} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    {editingProjectIndex === pIndex ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          value={editProjectName}
                          onChange={(e) => setEditProjectName(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, () => saveProjectEdit(pIndex))}
                          className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          maxLength={50}
                          autoFocus
                        />
                        <button
                          onClick={() => saveProjectEdit(pIndex)}
                          className="text-green-400 hover:text-green-300 p-2"
                          title="Save changes"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-400 hover:text-gray-300 p-2"
                          title="Cancel"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <FaFolder className="text-emerald-400" />
                          <h3 className="text-xl font-bold text-emerald-400">{proj.name}</h3>
                          <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-sm">
                            {proj.topics.length} topics
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditProjectName(proj.name);
                              setEditingProjectIndex(pIndex);
                              setEditingTopicIndex(null);
                            }}
                            className="text-gray-400 hover:text-white p-2 transition-colors"
                            title="Edit project name"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteProject(pIndex)}
                            className="text-red-500 hover:text-red-400 p-2 transition-colors"
                            title="Delete project"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {proj.topics.length > 0 ? (
                    <div className="space-y-3">
                      {proj.topics.map((topic, tIndex) => (
                        <div
                          key={tIndex}
                          className="group bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 hover:bg-gray-750 transition-colors"
                        >
                          {editingTopicIndex === `${pIndex}-${tIndex}` ? (
                            <div className="flex items-center gap-3">
                              <input
                                value={editTopicName}
                                onChange={(e) => setEditTopicName(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, () => saveTopicEdit(pIndex, tIndex))}
                                className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                maxLength={50}
                                autoFocus
                              />
                              <select
                                value={editLanguage}
                                onChange={(e) => setEditLanguage(e.target.value)}
                                className="bg-gray-900 border border-gray-700 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                              </select>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveTopicEdit(pIndex, tIndex);
                                }}
                                className="text-green-400 hover:text-green-300 p-2"
                                title="Save changes"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-400 hover:text-gray-300 p-2"
                                title="Cancel"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-4 cursor-pointer"
                              onClick={() => handleTopicClick(proj, topic)}
                            >
                              {languageIcon(topic.language)}
                              <div className="flex-grow">
                                <p className="font-semibold text-white">{topic.name}</p>
                                <p className="text-sm text-gray-400 capitalize">
                                  {topic.language === 'cpp' ? 'C++' : topic.language}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditTopicName(topic.name);
                                    setEditLanguage(topic.language);
                                    setEditingTopicIndex(`${pIndex}-${tIndex}`);
                                    setEditingProjectIndex(null);
                                  }}
                                  className="text-gray-400 hover:text-white p-2 transition-colors"
                                  title="Edit topic"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTopic(pIndex, tIndex);
                                  }}
                                  className="text-red-500 hover:text-red-400 p-2 transition-colors"
                                  title="Delete topic"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FaCode className="mx-auto text-3xl text-gray-600 mb-2" />
                      <p className="text-gray-500 italic">No topics yet</p>
                      <p className="text-gray-600 text-sm">Add your first topic to start coding!</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
// import React, { useEffect, useState } from "react";
// import {
//   FaJava,
//   FaJsSquare,
//   FaPython,
//   FaEdit,
//   FaSave,
//   FaTrash,
//   FaMicrophone,
// } from "react-icons/fa";
// import { SiCplusplus } from "react-icons/si";
// import { useNavigate } from "react-router-dom";

// const languageIcon = (lang) => {
//   switch (lang) {
//     case "cpp":
//       return <SiCplusplus className="text-blue-400 text-xl" />;
//     case "java":
//       return <FaJava className="text-red-500 text-xl" />;
//     case "javascript":
//       return <FaJsSquare className="text-yellow-400 text-xl" />;
//     case "python":
//       return <FaPython className="text-blue-300 text-xl" />;
//     default:
//       return null;
//   }
// };

// const HomePage = () => {
//   const [projects, setProjects] = useState([]);
//   const [projectName, setProjectName] = useState("");
//   const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);
//   const [topicName, setTopicName] = useState("");
//   const [language, setLanguage] = useState("");

//   const [editingProjectIndex, setEditingProjectIndex] = useState(null);
//   const [editingTopicIndex, setEditingTopicIndex] = useState(null);
//   const [editProjectName, setEditProjectName] = useState("");
//   const [editTopicName, setEditTopicName] = useState("");
//   const [editLanguage, setEditLanguage] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
//     setProjects(savedProjects);
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("projects", JSON.stringify(projects));
//   }, [projects]);

//   const createProject = () => {
//     const name = projectName.trim();
//     if (!name) return;
//     setProjects([...projects, { name, topics: [] }]);
//     setProjectName("");
//   };

//   const addTopicToProject = () => {
//     if (selectedProjectIndex === null || !topicName.trim()) return;
//     const updated = [...projects];
//     updated[selectedProjectIndex].topics.push({
//       name: topicName.trim(),
//       language,
//       code:"",
//     });
//     setProjects(updated);
//     setTopicName("");
//     setLanguage("");
//   };

//   const saveProjectEdit = (index) => {
//     const updated = [...projects];
//     updated[index].name = editProjectName.trim();
//     setProjects(updated);
//     setEditingProjectIndex(null);
//   };

//   const saveTopicEdit = (pIndex, tIndex) => {
//     const updated = [...projects];
//     updated[pIndex].topics[tIndex].name = editTopicName.trim();
//     updated[pIndex].topics[tIndex].language = editLanguage;
//     setProjects(updated);
//     setEditingTopicIndex(null);
//   };

//   const deleteProject = (index) => {
//     const updated = [...projects];
//     updated.splice(index, 1);
//     setProjects(updated);
//   };

//   const deleteTopic = (pIndex, tIndex) => {
//     const updated = [...projects];
//     updated[pIndex].topics.splice(tIndex, 1);
//     setProjects(updated);
//   };

//   return (
//     <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
//       <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-emerald-400"> Code{"</"}HaCk{"\\>"}</h1>
//         <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded">
//           <a
//             href="https://github.com/rishabh180705/code-Editor-ai"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Github
//           </a>
//         </button>
//       </header>

//       <main className="flex flex-1 overflow-hidden divide-x divide-gray-800">
//         <div className="w-1/2 p-8 overflow-y-auto">
//           <div className="mb-10 text-center">
//             <FaMicrophone className="mx-auto text-4xl text-emerald-400 mb-4 animate-pulse" />
//             <h2 className="text-3xl font-bold mb-2">AI Powered Assistant</h2>
//             <p className="text-gray-400 mb-1">🎤 Just speak your idea – we’ll write the code.</p>
//             <p className="text-gray-400 mb-1">✨ Accelerate your coding workflow with AI.</p>
//             <p className="text-gray-400">🧠 Describe what you want – watch the magic happen.</p>
//           </div>

//           <div className="space-y-6">
//             <div>
//               <h2 className="text-xl font-semibold mb-2">Create a Project</h2>
//               <input
//                 value={projectName}
//                 onChange={(e) => setProjectName(e.target.value)}
//                 placeholder="Enter project name"
//                 className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//               <button
//                 onClick={createProject}
//                 className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded font-medium"
//               >
//                 + Create Project
//               </button>
//             </div>

//             <div>
//               <h2 className="text-xl font-semibold mb-2">Add Topic</h2>
//               <select
//                 onChange={(e) => setSelectedProjectIndex(Number(e.target.value))}
//                 defaultValue=""
//                 className="mb-3 w-full px-4 py-2 rounded bg-gray-800 border border-gray-700"
//               >
//                 <option value="" disabled>Select project</option>
//                 {projects.map((proj, idx) => (
//                   <option key={idx} value={idx}>
//                     {proj.name}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 value={topicName}
//                 onChange={(e) => setTopicName(e.target.value)}
//                 placeholder="Enter topic name"
//                 className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 mb-3"
//               />
//               <select
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//                 className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 mb-3"
//               >
//                 <option value="">Select language</option>
//                 <option value="cpp">C++</option>
//                 <option value="java">Java</option>
//                 <option value="javascript">JavaScript</option>
//                 <option value="python">Python</option>
//               </select>
//               <button
//                 onClick={addTopicToProject}
//                 className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded font-medium"
//               >
//                 + Add Topic
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="w-1/2 p-8 overflow-y-auto">
//           <h2 className="text-2xl font-semibold mb-6">📂 My Projects</h2>
//           {projects.length === 0 ? (
//             <p className="text-gray-500 italic">No projects created yet.</p>
//           ) : (
//             projects.map((proj, pIndex) => (
//               <div key={pIndex} className="mb-6">
//                 <div className="flex items-center gap-2 mb-3">
//                   {editingProjectIndex === pIndex ? (
//                     <>
//                       <input
//                         value={editProjectName}
//                         onChange={(e) => setEditProjectName(e.target.value)}
//                         className="px-3 py-1 rounded bg-gray-800 border border-gray-700"
//                       />
//                       <button onClick={() => saveProjectEdit(pIndex)}>
//                         <FaSave className="text-green-400 cursor-pointer" />
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <h3 className="text-xl font-bold text-emerald-400">{proj.name}</h3>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setEditProjectName(proj.name);
//                           setEditingProjectIndex(pIndex);
//                           setEditingTopicIndex(null);
//                         }}
//                       >
//                         <FaEdit className="text-gray-400 hover:text-white cursor-pointer" />
//                       </button>
//                       <button onClick={() => deleteProject(pIndex)}>
//                         <FaTrash className="text-red-500 hover:text-red-600 cursor-pointer" />
//                       </button>
//                     </>
//                   )}
//                 </div>

//                 {proj.topics.length > 0 ? (
//                   <div className="space-y-3">
//                     {proj.topics.map((topic, tIndex) => (
//                       <div
//                         key={tIndex}
//                         className="bg-gray-800 border border-gray-700 rounded px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-gray-700 transition"
//                         onClick={() => {
//                           const projectNameEncoded = encodeURIComponent(proj.name.trim());
//                           const topicNameEncoded = encodeURIComponent(topic.name.trim());
//                           navigate(`/editor/${projectNameEncoded}/${topicNameEncoded}/${topic.language}`);
//                         }}
//                       >
//                         {editingTopicIndex === `${pIndex}-${tIndex}` ? (
//                           <>
//                             <input
//                               value={editTopicName}
//                               onChange={(e) => setEditTopicName(e.target.value)}
//                               className="px-2 py-1 rounded bg-gray-900 border border-gray-700"
//                             />
//                             <select
//                               value={editLanguage}
//                               onChange={(e) => setEditLanguage(e.target.value)}
//                               className="bg-gray-900 border border-gray-700 px-2 py-1 rounded"
//                             >
//                               <option value="cpp">C++</option>
//                               <option value="java">Java</option>
//                               <option value="javascript">JavaScript</option>
//                               <option value="python">Python</option>
//                             </select>
//                             <button onClick={(e) => {
//                               e.stopPropagation();
//                               saveTopicEdit(pIndex, tIndex);
//                             }}>
//                               <FaSave className="text-green-400 cursor-pointer" />
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             {languageIcon(topic.language)}
//                             <div className="flex-grow">
//                               <p className="font-semibold">{topic.name}</p>
//                               <p className="text-sm text-gray-400">Language: {topic.language}</p>
//                             </div>
//                             <button onClick={(e) => {
//                               e.stopPropagation();
//                               setEditTopicName(topic.name);
//                               setEditLanguage(topic.language);
//                               setEditingTopicIndex(`${pIndex}-${tIndex}`);
//                               setEditingProjectIndex(null);
//                             }}>
//                               <FaEdit className="text-gray-400 hover:text-white cursor-pointer" />
//                             </button>
//                             <button onClick={(e) => {
//                               e.stopPropagation();
//                               deleteTopic(pIndex, tIndex);
//                             }}>
//                               <FaTrash className="text-red-500 hover:text-red-600 cursor-pointer" />
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic">No topics yet</p>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default HomePage;


{
  /* Footer
      <footer className="bg-gray-900 border-t border-gray-800 px-6 py-8 text-sm text-gray-400">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-2">Product</h4>
            <ul className="space-y-1">
              <li>Features</li>
              <li>Templates</li>
              <li>Integrations</li>
              <li>Pricing</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Support</h4>
            <ul className="space-y-1">
              <li>Documentation</li>
              <li>Community</li>
              <li>Help Center</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Legal</h4>
            <ul className="space-y-1">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">About</h4>
            <p>
              The ultimate online code editor for developers. Create, collaborate, and deploy your
              projects with ease.
            </p>
          </div>
        </div>
        <div className="text-center mt-6 text-xs text-gray-500">
          © 2024 CodeSpace. All rights reserved.
        </div>
      </footer> */
}

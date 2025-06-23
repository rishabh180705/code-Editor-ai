// import React, { useState } from "react";
// import { FaJava, FaJsSquare, FaPython, FaEdit, FaSave, FaMicrophone } from "react-icons/fa";
// import { SiCplusplus } from "react-icons/si";

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
//   const [language, setLanguage] = useState("cpp");

//   const [editingProjectIndex, setEditingProjectIndex] = useState(null);
//   const [editingTopicIndex, setEditingTopicIndex] = useState(null);
//   const [editProjectName, setEditProjectName] = useState("");
//   const [editTopicName, setEditTopicName] = useState("");
//   const [editLanguage, setEditLanguage] = useState("");

//   const createProject = () => {
//     if (!projectName.trim()) return;
//     setProjects([...projects, { name: projectName, topics: [] }]);
//     setProjectName("");
//   };

//   const addTopicToProject = () => {
//     if (selectedProjectIndex === null || !topicName.trim()) return;
//     const updatedProjects = [...projects];
//     updatedProjects[selectedProjectIndex].topics.push({ name: topicName, language });
//     setProjects(updatedProjects);
//     setTopicName("");
//     setLanguage("cpp");
//   };

//   const saveProjectEdit = (index) => {
//     const updated = [...projects];
//     updated[index].name = editProjectName;
//     setProjects(updated);
//     setEditingProjectIndex(null);
//   };

//   const saveTopicEdit = (pIndex, tIndex) => {
//     const updated = [...projects];
//     updated[pIndex].topics[tIndex].name = editTopicName;
//     updated[pIndex].topics[tIndex].language = editLanguage;
//     setProjects(updated);
//     setEditingTopicIndex(null);
//   };

//   return (
//     <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
//       {/* Navbar */}
//       <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-emerald-400">Code Deck</h1>
//         <div className="flex gap-4">
//           <button className="text-white hover:text-emerald-400">Login</button>
//           <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded">
//             Sign Up
//           </button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 flex divide-x divide-gray-800">
//         {/* Left Panel - AI Suggestion and Project/Topic creation */}
//         <div className="w-1/2 p-8">
//           <div className="mb-10 text-center">
//             <FaMicrophone className="mx-auto text-4xl text-emerald-400 mb-4 animate-pulse" />
//             <h2 className="text-3xl font-bold mb-2">AI Powered Assistant</h2>
//             <p className="text-gray-400 mb-1">
//               🎤 Just speak your idea – we’ll write the code.
//             </p>
//             <p className="text-gray-400 mb-1">
//               ✨ Powered by AI to accelerate your coding workflow.
//             </p>
//             <p className="text-gray-400">
//               🧠 Describe what you want – watch the magic happen.
//             </p>
//           </div>

//           <h2 className="text-2xl font-semibold mb-4">Create a Project</h2>
//           <input
//             value={projectName}
//             onChange={(e) => setProjectName(e.target.value)}
//             placeholder="Enter project name"
//             className="w-full max-w-md px-4 py-2 rounded bg-gray-800 border border-gray-700 mb-4"
//           />
//           <button
//             onClick={createProject}
//             className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded font-medium mb-8"
//           >
//             + Create Project
//           </button>

//           <h3 className="text-xl font-semibold mb-2">Add Topic</h3>
//           <select
//             className="mb-3 w-full max-w-md px-4 py-2 rounded bg-gray-800 border border-gray-700"
//             onChange={(e) => setSelectedProjectIndex(Number(e.target.value))}
//             defaultValue=""
//           >
//             <option value="" disabled>
//               Select project
//             </option>
//             {projects.map((proj, idx) => (
//               <option key={idx} value={idx}>
//                 {proj.name}
//               </option>
//             ))}
//           </select>

//           <input
//             value={topicName}
//             onChange={(e) => setTopicName(e.target.value)}
//             placeholder="Enter topic name"
//             className="w-full max-w-md px-4 py-2 rounded bg-gray-800 border border-gray-700 mb-3"
//           />

//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//             className="w-full max-w-md px-4 py-2 rounded bg-gray-800 border border-gray-700 mb-4"
//           >
//             <option value="cpp">C++</option>
//             <option value="java">Java</option>
//             <option value="javascript">JavaScript</option>
//             <option value="python">Python</option>
//           </select>

//           <button
//             onClick={addTopicToProject}
//             className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded font-medium"
//           >
//             + Add Topic
//           </button>
//         </div>

//         {/* Right Panel - List of Projects & Topics */}
//         <div className="w-1/2 p-8 overflow-y-auto">
//           <h2 className="text-2xl font-semibold mb-6">My Projects</h2>
//           {projects.map((proj, pIndex) => (
//             <div key={pIndex} className="mb-6">
//               <div className="flex items-center gap-2 mb-2">
//                 {editingProjectIndex === pIndex ? (
//                   <>
//                     <input
//                       value={editProjectName}
//                       onChange={(e) => setEditProjectName(e.target.value)}
//                       className="px-2 py-1 rounded bg-gray-800 border border-gray-700"
//                     />
//                     <button onClick={() => saveProjectEdit(pIndex)}>
//                       <FaSave className="text-green-400" />
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <h3 className="text-xl text-emerald-400 font-bold">📁 {proj.name}</h3>
//                     <button
//                       onClick={() => {
//                         setEditProjectName(proj.name);
//                         setEditingProjectIndex(pIndex);
//                       }}
//                     >
//                       <FaEdit className="text-gray-400 hover:text-white" />
//                     </button>
//                   </>
//                 )}
//               </div>

//               {proj.topics.length > 0 ? (
//                 <div className="space-y-3">
//                   {proj.topics.map((topic, tIndex) => (
//                     <div
//                       key={tIndex}
//                       className="bg-gray-800 border border-gray-700 rounded px-4 py-3 flex items-center gap-4"
//                     >
//                       {editingTopicIndex === `${pIndex}-${tIndex}` ? (
//                         <>
//                           <input
//                             value={editTopicName}
//                             onChange={(e) => setEditTopicName(e.target.value)}
//                             className="px-2 py-1 rounded bg-gray-900 border border-gray-700"
//                           />
//                           <select
//                             value={editLanguage}
//                             onChange={(e) => setEditLanguage(e.target.value)}
//                             className="bg-gray-900 border border-gray-700 px-2 py-1 rounded"
//                           >
//                             <option value="cpp">C++</option>
//                             <option value="java">Java</option>
//                             <option value="javascript">JavaScript</option>
//                             <option value="python">Python</option>
//                           </select>
//                           <button onClick={() => saveTopicEdit(pIndex, tIndex)}>
//                             <FaSave className="text-green-400" />
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           {languageIcon(topic.language)}
//                           <div>
//                             <p className="font-semibold">{topic.name}</p>
//                             <p className="text-sm text-gray-400">Language: {topic.language}</p>
//                           </div>
//                           <button
//                             onClick={() => {
//                               setEditTopicName(topic.name);
//                               setEditLanguage(topic.language);
//                               setEditingTopicIndex(`${pIndex}-${tIndex}`);
//                             }}
//                           >
//                             <FaEdit className="text-gray-400 hover:text-white ml-auto" />
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-gray-500 italic">No topics yet</p>
//               )}
//             </div>
//           ))}
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-gray-900 border-t border-gray-800 px-6 py-8 text-sm text-gray-400">
//         <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
//           <div>
//             <h4 className="text-white font-semibold mb-2">Product</h4>
//             <ul>
//               <li>Features</li>
//               <li>Templates</li>
//               <li>Integrations</li>
//               <li>Pricing</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-semibold mb-2">Support</h4>
//             <ul>
//               <li>Documentation</li>
//               <li>Community</li>
//               <li>Help Center</li>
//               <li>Contact Us</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-semibold mb-2">Legal</h4>
//             <ul>
//               <li>Privacy Policy</li>
//               <li>Terms of Service</li>
//               <li>Cookie Policy</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-semibold mb-2">About</h4>
//             <p>
//               The ultimate online code editor for developers. Create, collaborate, and deploy your projects with ease.
//             </p>
//           </div>
//         </div>
//         <div className="text-center mt-6 text-xs text-gray-500">
//           © 2024 CodeSpace. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default HomePage;





import React, { useState } from "react";
import { FaJava, FaJsSquare, FaPython, FaEdit, FaSave, FaMicrophone } from "react-icons/fa";
import { SiCplusplus } from "react-icons/si";

const languageIcon = (lang) => {
  switch (lang) {
    case "cpp":
      return <SiCplusplus className="text-blue-400 text-xl" />;
    case "java":
      return <FaJava className="text-red-500 text-xl" />;
    case "javascript":
      return <FaJsSquare className="text-yellow-400 text-xl" />;
    case "python":
      return <FaPython className="text-blue-300 text-xl" />;
    default:
      return null;
  }
};

const HomePage = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);
  const [topicName, setTopicName] = useState("");
  const [language, setLanguage] = useState("cpp");

  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [editingTopicIndex, setEditingTopicIndex] = useState(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [editTopicName, setEditTopicName] = useState("");
  const [editLanguage, setEditLanguage] = useState("");

  const createProject = () => {
    if (!projectName.trim()) return;
    setProjects([...projects, { name: projectName, topics: [] }]);
    setProjectName("");
  };

  const addTopicToProject = () => {
    if (selectedProjectIndex === null || !topicName.trim()) return;
    const updatedProjects = [...projects];
    updatedProjects[selectedProjectIndex].topics.push({ name: topicName, language });
    setProjects(updatedProjects);
    setTopicName("");
    setLanguage("cpp");
  };

  const saveProjectEdit = (index) => {
    const updated = [...projects];
    updated[index].name = editProjectName;
    setProjects(updated);
    setEditingProjectIndex(null);
  };

  const saveTopicEdit = (pIndex, tIndex) => {
    const updated = [...projects];
    updated[pIndex].topics[tIndex].name = editTopicName;
    updated[pIndex].topics[tIndex].language = editLanguage;
    setProjects(updated);
    setEditingTopicIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      {/* Navbar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-400">Code Deck</h1>
        <div className="flex gap-4">
          <button className="text-white hover:text-emerald-400">Login</button>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded">
            Sign Up
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden divide-x divide-gray-800">
        {/* Left */}
        <div className="w-1/2 p-8 overflow-y-auto">
          <div className="mb-10 text-center">
            <FaMicrophone className="mx-auto text-4xl text-emerald-400 mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold mb-2">AI Powered Assistant</h2>
            <p className="text-gray-400 mb-1">🎤 Just speak your idea – we’ll write the code.</p>
            <p className="text-gray-400 mb-1">✨ Accelerate your coding workflow with AI.</p>
            <p className="text-gray-400">🧠 Describe what you want – watch the magic happen.</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Create a Project</h2>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={createProject}
                className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded font-medium"
              >
                + Create Project
              </button>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Add Topic</h2>
              <select
                onChange={(e) => setSelectedProjectIndex(Number(e.target.value))}
                defaultValue=""
                className="mb-3 w-full px-4 py-2 rounded bg-gray-800 border border-gray-700"
              >
                <option value="" disabled>
                  Select project
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
                placeholder="Enter topic name"
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 mb-3"
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 mb-3"
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
              <button
                onClick={addTopicToProject}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded font-medium"
              >
                + Add Topic
              </button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="w-1/2 p-8 overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-6">📂 My Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500 italic">No projects created yet.</p>
          ) : (
            projects.map((proj, pIndex) => (
              <div key={pIndex} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {editingProjectIndex === pIndex ? (
                    <>
                      <input
                        value={editProjectName}
                        onChange={(e) => setEditProjectName(e.target.value)}
                        className="px-3 py-1 rounded bg-gray-800 border border-gray-700"
                      />
                      <button onClick={() => saveProjectEdit(pIndex)}>
                        <FaSave className="text-green-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-emerald-400">{proj.name}</h3>
                      <button
                        onClick={() => {
                          setEditProjectName(proj.name);
                          setEditingProjectIndex(pIndex);
                        }}
                      >
                        <FaEdit className="text-gray-400 hover:text-white" />
                      </button>
                    </>
                  )}
                </div>

                {proj.topics.length > 0 ? (
                  <div className="space-y-3">
                    {proj.topics.map((topic, tIndex) => (
                      <div
                        key={tIndex}
                        className="bg-gray-800 border border-gray-700 rounded px-4 py-3 flex items-center gap-4"
                      >
                        {editingTopicIndex === `${pIndex}-${tIndex}` ? (
                          <>
                            <input
                              value={editTopicName}
                              onChange={(e) => setEditTopicName(e.target.value)}
                              className="px-2 py-1 rounded bg-gray-900 border border-gray-700"
                            />
                            <select
                              value={editLanguage}
                              onChange={(e) => setEditLanguage(e.target.value)}
                              className="bg-gray-900 border border-gray-700 px-2 py-1 rounded"
                            >
                              <option value="cpp">C++</option>
                              <option value="java">Java</option>
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                            </select>
                            <button onClick={() => saveTopicEdit(pIndex, tIndex)}>
                              <FaSave className="text-green-400" />
                            </button>
                          </>
                        ) : (
                          <>
                            {languageIcon(topic.language)}
                            <div>
                              <p className="font-semibold">{topic.name}</p>
                              <p className="text-sm text-gray-400">Language: {topic.language}</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditTopicName(topic.name);
                                setEditLanguage(topic.language);
                                setEditingTopicIndex(`${pIndex}-${tIndex}`);
                              }}
                            >
                              <FaEdit className="text-gray-400 hover:text-white ml-auto" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No topics yet</p>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
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
      </footer>
    </div>
  );
};

export default HomePage;

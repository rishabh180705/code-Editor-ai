import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Dictaphone from "./components/speech";
import HomePage from "./components/home";
import PageNotFound from "./components/PageNotFound";
import CodeEditor from "./components/codeEditor";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/editor/:project/:topic/:language" element={<CodeEditor/>} />
        <Route path="*" element={<PageNotFound/>} />
        <Route path="/speech" element={<Dictaphone/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

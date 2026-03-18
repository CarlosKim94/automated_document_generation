import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// import "./styles.css"; // Commented out to bypass local build issues with Node/Tailwind

const root = createRoot(document.getElementById("root"));
root.render(<App />);
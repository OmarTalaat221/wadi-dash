import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./sass/index.scss";
import "./css/index.css";
import "leaflet/dist/leaflet.css";
import "./css/leaflet-custom.css";

import { BrowserRouter } from "react-router-dom";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

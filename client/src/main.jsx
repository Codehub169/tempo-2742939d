import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";

const colors = {
  brand: {
    bg: "#1a1a2e",
    primary: "#16213e",
    secondary: "#0f3460",
    accent: "#e94560",
    font: "#dcdcdc",
    border: "#2a2a4a",
    cardBg: "#1e1e3f",
    success: "#4caf50",
    warning: "#ffc107",
    danger: "#f44336",
  },
};

const fonts = {
    heading: `'Poppins', sans-serif`,
    body: `'Inter', sans-serif`,
}

const theme = extendTheme({ colors, fonts });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);

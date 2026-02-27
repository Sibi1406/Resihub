import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import App from "./App";
import "./index.css";

// Show the page once React mounts
document.documentElement.classList.add('ready');

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                background: "#fff",
                color: "#1f2937",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              },
              success: {
                iconTheme: { primary: "#E5B94B", secondary: "#fff" },
              },
            }}
          />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
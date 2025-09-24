import { createRoot } from "react-dom/client";
import "./index.css";
import { ToastProvider } from "./contexts/toast-context";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "./components/ui/Toast";
import { AppRouter } from "./routes";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ToastProvider>
      <AppRouter />
      <ToastContainer />
    </ToastProvider>
  </AuthProvider>
);

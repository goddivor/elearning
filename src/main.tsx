import { createRoot } from "react-dom/client";
import "./index.css";
import { ToastProvider } from "./context/toast-context";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "./components/ui/Toast";
import { AppRouter } from "./pages";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ToastProvider>
      <AppRouter />
      <ToastContainer />
    </ToastProvider>
  </AuthProvider>
);

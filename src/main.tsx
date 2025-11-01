import { createRoot } from "react-dom/client";
import "./index.css";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./lib/apollo-client";
import { ToastProvider } from "./contexts/toast-context";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "./components/ui/Toast";
import { AppRouter } from "./routes";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  </ApolloProvider>
);

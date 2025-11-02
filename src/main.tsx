import { createRoot } from "react-dom/client";
import "./index.css";
import { ApolloProvider } from "@apollo/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { apolloClient } from "./lib/apollo-client";
import { ToastProvider } from "./contexts/toast-context";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "./components/ui/Toast";
import { AppRouter } from "./routes";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </ApolloProvider>
  </GoogleOAuthProvider>
);

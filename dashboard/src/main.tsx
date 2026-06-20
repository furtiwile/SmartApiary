import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./features/users/contexts/AuthContext.tsx";

const app =
  <AuthProvider>
    <App />
  </AuthProvider>;

createRoot(document.getElementById("root")!).render(app);

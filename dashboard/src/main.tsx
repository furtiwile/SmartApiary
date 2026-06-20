import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./features/users/contexts/AuthContext.tsx";
import { ApiarySignalRProvider } from "./features/beehives/contexts/ApiarySignalRContext.tsx";

const app =
  <AuthProvider>
    <ApiarySignalRProvider>
      <App />
    </ApiarySignalRProvider>
  </AuthProvider>;

createRoot(document.getElementById("root")!).render(app);

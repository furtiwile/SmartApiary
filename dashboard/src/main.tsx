import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./features/users/contexts/AuthContext.tsx";
import { ApiarySignalRProvider } from "./features/beehives/contexts/ApiarySignalRContext.tsx";
import { ApiProvider } from "./shared/api/ApiProvider.tsx";

const app =
  <ApiProvider>
    <AuthProvider>
      <ApiarySignalRProvider>
        <App />
      </ApiarySignalRProvider>
    </AuthProvider>
  </ApiProvider>;

createRoot(document.getElementById("root")!).render(app);

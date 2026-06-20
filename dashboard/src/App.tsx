import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./routes";
import { LoggerProvider } from "./shared/logger/LoggerProvider";
import { SignalRProvider } from "./shared/signalr/SignalRProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CONFIG } from "./config/config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoggerProvider>
        <SignalRProvider
          hubUrl={CONFIG.HUB_URL}
          reconnectTimeoutMs={CONFIG.SIGNALR_RECONNECT_INTERVAL}
        >
          <RouterProvider router={router} />
        </SignalRProvider>
      </LoggerProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

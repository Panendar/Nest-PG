import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, useToast } from "@chakra-ui/react";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { App } from "./App";
import { AuthProvider } from "./state/AuthContext";
import { UIProvider, useUI } from "./state/UIContext";
import { theme } from "./theme";

function ToastBridge() {
  const toast = useToast();
  const { toasts, dismissToast } = useUI();

  React.useEffect(() => {
    toasts.forEach((item) => {
      toast({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        onCloseComplete: () => dismissToast(item.id),
      });
    });
  }, [dismissToast, toast, toasts]);

  return null;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <UIProvider>
          <AuthProvider>
            <ToastBridge />
            <App />
          </AuthProvider>
        </UIProvider>
      </ChakraProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

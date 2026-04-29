import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import { registerApiInterceptors } from "./api/client";
import { useAuth } from "./state/AuthContext";
import { useUI } from "./state/UIContext";

function InterceptorBridge() {
  const { token, logout } = useAuth();
  const { showToast } = useUI();

  useEffect(() => {
    registerApiInterceptors({
      getToken: () => token,
      onUnauthorized: () => {
        logout();
        window.location.replace("/login");
      },
      onNetworkError: () => {
        showToast({
          title: "Network issue",
          description: "Please check your connection and try again.",
          status: "error",
        });
      },
    });
  }, [logout, showToast, token]);

  return null;
}

export function App() {
  return (
    <>
      <InterceptorBridge />
      <RouterProvider router={router} />
    </>
  );
}

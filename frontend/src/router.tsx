import { Navigate, createBrowserRouter } from "react-router-dom";

import { AuthGuard } from "./components/AuthGuard";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { CompareListingsPage } from "./pages/CompareListingsPage";
import { ListingDetailsPage } from "./pages/ListingDetailsPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function createModuleRoutes(basePath: string) {
  return {
    path: basePath,
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="search" replace />,
      },
      {
        path: "search",
        element: <DashboardPage />,
      },
      {
        path: "listings/:listingId",
        element: <ListingDetailsPage />,
      },
      {
        path: "compare",
        element: <CompareListingsPage />,
      },
      {
        path: "saved",
        element: <NotFoundPage />,
      },
    ],
  };
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      createModuleRoutes("/app"),
      createModuleRoutes("/user"),
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

import { Navigate, createBrowserRouter } from "react-router-dom";

import { AuthGuard } from "./components/AuthGuard";
import { AppLayout } from "./layouts/AppLayout";
import { BuilderHomePage } from "./pages/BuilderHomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { CompareListingsPage } from "./pages/CompareListingsPage";
import { ListingDetailsPage } from "./pages/ListingDetailsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthEntryPage } from "./pages/AuthEntryPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RecentSearchesPage } from "./pages/RecentSearchesPage";
import { SavedListingsPage } from "./pages/SavedListingsPage";

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
        element: <SavedListingsPage />,
      },
      {
        path: "recent-searches",
        element: <RecentSearchesPage />,
      },
    ],
  };
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthEntryPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: "/owner",
        element: <BuilderHomePage />,
      },
      createModuleRoutes("/app"),
      createModuleRoutes("/user"),
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

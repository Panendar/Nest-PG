import { Navigate, createBrowserRouter } from "react-router-dom";

import { AuthGuard } from "./components/AuthGuard";
import { AppLayout } from "./layouts/AppLayout";
import { OwnerLayout } from "./layouts/OwnerLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { CompareListingsPage } from "./pages/CompareListingsPage";
import { ListingDetailsPage } from "./pages/ListingDetailsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthEntryPage } from "./pages/AuthEntryPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OwnerOverviewPage } from "./pages/OwnerOverviewPage";
import { OwnerRoutePlaceholderPage } from "./pages/OwnerRoutePlaceholderPage";
import { OwnerCreateListingPage } from "./pages/OwnerCreateListingPage";
import { OwnerListingManagementPage } from "./pages/OwnerListingManagementPage";
import { OwnerListingsPage } from "./pages/OwnerListingsPage";
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

function createOwnerRoutes() {
  return {
    path: "/owner",
    element: <OwnerLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="overview" replace />,
      },
      {
        path: "overview",
        element: <OwnerOverviewPage />,
      },
      {
        path: "listings",
        element: <OwnerListingsPage />,
      },
      {
        path: "listings/new",
        element: <OwnerCreateListingPage />,
      },
      {
        path: "listings/:listingId",
        element: <OwnerListingManagementPage />,
      },
      {
        path: "media",
        element: (
          <OwnerRoutePlaceholderPage
            title="Media workspace"
            description="Listing media upload and management flows will attach to this route group."
          />
        ),
      },
      {
        path: "availability",
        element: (
          <OwnerRoutePlaceholderPage
            title="Availability workspace"
            description="Availability status update flows will attach to this route group."
          />
        ),
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
      createOwnerRoutes(),
      createModuleRoutes("/app"),
      createModuleRoutes("/user"),
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

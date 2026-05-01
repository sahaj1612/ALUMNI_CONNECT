import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { AlumniPortalPage } from "./pages/AlumniPortalPage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { AlumniInfoPage } from "./pages/AlumniInfoPage.jsx";
import { DetailPage } from "./pages/DetailPage.jsx";
import { EventsInfoPage } from "./pages/EventsInfoPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { StudentPortalPage } from "./pages/StudentPortalPage.jsx";
import { SupportPage } from "./pages/SupportPage.jsx";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/alumni" element={<AlumniInfoPage />} />
      <Route path="/events" element={<EventsInfoPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentPortalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni-portal"
        element={
          <ProtectedRoute role="alumni">
            <AlumniPortalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/details/:type/:id"
        element={
          <ProtectedRoute role={user?.role}>
            <DetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

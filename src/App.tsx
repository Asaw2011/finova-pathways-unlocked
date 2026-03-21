import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AppLayout from "./components/AppLayout";
import Courses from "./pages/Courses";
import CoursePlayer from "./pages/CoursePlayer";
import Awards from "./pages/Awards";
import Profile from "./pages/Profile";
import Library from "./pages/Library";
import GamesZone from "./pages/GamesZone";
import LearningPath from "./pages/LearningPath";
import MoneyCoach from "./pages/MoneyCoach";
import Shop from "./pages/Shop";
import About from "./pages/About";
import FFI from "./pages/FFI";
import Disclaimers from "./pages/Disclaimers";
import CoursesPreview from "./pages/CoursesPreview";
import CoursesPreview from "./pages/CoursesPreview";
import Plus from "./pages/Plus";
import MistakesReview from "./pages/MistakesReview";
import Quests from "./pages/Quests";
import Rankings from "./pages/Rankings";
import PaperTrading from "./pages/PaperTrading";
import Friends from "./pages/Friends";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/financial-freedom-initiative" element={<FFI />} />
              <Route path="/disclaimers" element={<Disclaimers />} />
              <Route path="/school-program" element={<SchoolProgram />} />
              <Route path="/quant-vault" element={<QuantVault />} />
              <Route path="/courses-preview" element={<CoursesPreview />} />
              <Route path="/plus" element={<Plus />} />
              <Route path="/resources" element={<Landing />} />

              {/* Authenticated app */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Navigate to="/learning-path" replace />} />
                <Route path="/learning-path" element={<LearningPath />} />
                <Route path="/library" element={<Library />} />
                <Route path="/money-coach" element={<MoneyCoach />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CoursePlayer />} />
                <Route path="/awards" element={<Awards />} />
                <Route path="/certificates" element={<Awards />} />
                <Route path="/games" element={<GamesZone />} />
                <Route path="/mistakes" element={<MistakesReview />} />
                <Route path="/quests" element={<Quests />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/paper-trading" element={<PaperTrading />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/resource-hub" element={<Library />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

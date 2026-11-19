import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/AppLayout';
import { SettingsProvider } from '@/components/SettingsContext';
import Feed from '@/pages/Feed';
import Rides from '@/pages/Rides';
import Market from '@/pages/Market';
import Music from '@/pages/Music';
import Movies from '@/pages/Movies';
import Video from '@/pages/Video';
import Radio from '@/pages/Radio';
import Sheets from '@/pages/Sheets';
import Docs from '@/pages/Docs';
import Slides from '@/pages/Slides';
import Cloud from '@/pages/Cloud';
import News from '@/pages/News';
import Assistant from '@/pages/Assistant';
import Finance from '@/pages/Finance';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Calculator from '@/pages/Calculator';
import Dating from '@/pages/Dating';
import Calendar from '@/pages/Calendar';
import Desktop from '@/pages/Desktop';
import Hotels from '@/pages/Hotels';
import Flights from '@/pages/Flights';
import Notes from '@/pages/Notes';
import CreatorStudio from '@/pages/CreatorStudio';
import ErrorBoundary from '@/components/ErrorBoundary';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Mfa from '@/pages/Mfa';
import ArticlesPage from '@/pages/ArticlesPage';
import Terms from '@/pages/Terms';
import Messages from '@/pages/Messages';
import Stories from '@/pages/Stories';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mfa" element={<Mfa />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Feed />} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/market" element={<Market />} />
        <Route path="/music" element={<Music />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/video" element={<Video />} />
        <Route path="/radio" element={<Radio />} />
        <Route path="/sheets" element={<Sheets />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/slides" element={<Slides />} />
        <Route path="/cloud" element={<Cloud />} />
        <Route path="/news" element={<News />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/dating" element={<Dating />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/desktop" element={<Desktop />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/studio" element={<CreatorStudio />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/terms" element={<Terms />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </ErrorBoundary>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SettingsProvider>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </SettingsProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
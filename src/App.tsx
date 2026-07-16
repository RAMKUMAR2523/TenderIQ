// @ts-nocheck
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/login/Login'));
const Register = lazy(() => import('./pages/register/Register'));
const ForgotPassword = lazy(() => import('./pages/forgot-password/Forgot-password'));

// Dashboard Routes
const Dashboard = lazy(() => import('./pages/dashboard/dashboard/Dashboard'));
const Proposals = lazy(() => import('./pages/dashboard/proposals/Proposals'));
const Vault = lazy(() => import('./pages/dashboard/vault/Vault'));
const Tenders = lazy(() => import('./pages/dashboard/tenders/Tenders'));
const TenderDetails = lazy(() => import('./pages/dashboard/tenders/[id]/TenderDetails'));
const Settings = lazy(() => import('./pages/dashboard/settings/Settings'));
const Chat = lazy(() => import('./pages/dashboard/chat/Chat'));
const Profile = lazy(() => import('./pages/dashboard/profile/Profile'));
const AdminConnectors = lazy(() => import('./pages/dashboard/admin/connectors/Connectors'));

const DashboardLayout = () => {
  return (
    <div className="h-full relative font-sans text-slate-900 dark:text-slate-50 antialiased selection:bg-primary/20">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-slate-900 border-r border-slate-800 shadow-2xl">
        <Sidebar />
      </div>
      <main className="md:pl-72 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 p-6 lg:p-8 overflow-auto pb-24">
          <div className="max-w-7xl mx-auto w-full h-full animate-in fade-in zoom-in-95 duration-500">
            <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/tenders" element={<Tenders />} />
            <Route path="/tenders/:id" element={<TenderDetails />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/company" element={<Profile />} />
            <Route path="/admin/connectors" element={<AdminConnectors />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

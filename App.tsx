import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientForm from './pages/PatientForm';
import NutritionReport from './pages/NutritionReport';
import Understanding from './pages/Understanding';
import UnderstandingReport from './pages/UnderstandingReport';
import NutritionLog from './pages/NutritionLog';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import { User } from './types';
import { Menu, ChevronDown, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protected Route Wrapper
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#F0F4F8] font-sans text-gray-900 flex flex-col">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 fixed top-0 left-0 right-0 z-40 px-4 md:px-6 flex items-center justify-between no-print">
           {/* Left: Logo & Mobile Menu */}
           <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
               <Menu className="w-6 h-6 text-gray-600" />
             </button>
             <div className="flex items-center gap-3">
               <img 
                 src="https://www.aonanghospital.com/themes/wattanapat2021/images/logo.png" 
                 alt="Wattanapat Logo" 
                 className="h-10 w-auto object-contain"
               />
               <div className="hidden md:block">
                 <h1 className="text-primaryDark font-bold text-lg leading-tight">โรงพยาบาลวัฒนแพทย์ อ่าวนาง</h1>
                 <p className="text-xs text-gray-500 font-medium tracking-wider">WATTANAPAT HOSPITAL AO NANG</p>
               </div>
             </div>
           </div>

           {/* Right: User Profile */}
           <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-indigo-500" />
                )}
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-blue-600 leading-none">{user.fullName}</p>
                <p className="text-xs text-gray-500 mt-1">{user.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
           </div>
        </header>

        {/* Main Layout */}
        <div className="flex pt-16 min-h-screen">
          
          {/* Sidebar */}
          <Sidebar 
            user={user} 
            onLogout={() => setUser(null)} 
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />

          {/* Content Area */}
          <main className={`
             flex-1 p-4 md:p-8 transition-all duration-300
             md:ml-64 
             print:ml-0 print:p-0 print:bg-white
          `}>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard user={user} /></ProtectedRoute>} />
              <Route path="/patient-form" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />
              <Route path="/nutrition-report" element={<ProtectedRoute><NutritionReport /></ProtectedRoute>} />
              <Route path="/understanding" element={<ProtectedRoute><Understanding /></ProtectedRoute>} />
              <Route path="/understanding-report" element={<ProtectedRoute><UnderstandingReport /></ProtectedRoute>} />
              <Route path="/nutrition-log" element={<ProtectedRoute><NutritionLog /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/login" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>

      </div>
    </HashRouter>
  );
};

export default App;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  FileBarChart, 
  BrainCircuit, 
  Utensils, 
  Users, 
  LogOut,
  Settings,
  PieChart
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { name: 'แดชบอร์ด/โปรไฟล์', path: '/', icon: LayoutDashboard },
    { name: 'บันทึกผลผู้ป่วย', path: '/patient-form', icon: UserPlus },
    { name: 'รายงานโภชนาการ', path: '/nutrition-report', icon: FileBarChart },
    { name: 'บันทึกการรับรู้', path: '/understanding', icon: BrainCircuit },
    { name: 'รายงานการรับรู้', path: '/understanding-report', icon: PieChart },
    { name: 'วิเคราะห์สารอาหาร', path: '/nutrition-log', icon: Utensils },
    { name: 'ผู้ใช้งานระบบ', path: '/users', icon: Users, role: 'ADMIN' },
    { name: 'ตั้งค่าระบบ', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-16 bottom-0 w-64 bg-[#EAF4F4] border-r border-gray-200 z-30
        transform transition-transform duration-300 md:translate-x-0 overflow-y-auto no-print
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pl-2 font-display">เมนูหลัก</h2>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              (item.role && user?.role !== item.role) ? null :
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm
                  ${isActive 
                    ? 'bg-[#1A5C91] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-white hover:text-[#1A5C91] hover:shadow-sm'}
                `}
              >
                <item.icon className={`w-5 h-5 ${ ({isActive}:any) => isActive ? 'text-white' : 'text-current'}`} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 border-t border-gray-300 pt-4">
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full text-sm font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
import React, { useEffect, useState } from 'react';
import { Users, User as UserIcon, Moon, Sun, Archive, Briefcase } from 'lucide-react';
import { getPatients } from '../services/mockService';
import { Patient, User } from '../types';

interface DashboardProps {
  user?: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const pData = await getPatients();
      setPatients(pData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Stats Calculations
  const totalPatients = patients.length;
  const maleCount = patients.filter(p => p.gender === 'Male').length;
  const femaleCount = patients.filter(p => p.gender === 'Female').length;
  const buddhismCount = patients.filter(p => p.religion === 'Buddhism' || p.religion === 'พุทธ').length;
  const islamCount = patients.filter(p => p.religion === 'Islam' || p.religion === 'อิสลาม').length;
  // Others: Total - (Buddhism + Islam)
  const otherReligionCount = totalPatients - (buddhismCount + islamCount);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Overview Section */}
      <section>
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-6">ภาพรวมข้อมูลผู้ป่วย</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <GradientCard 
            title="ผู้ป่วยทั้งหมด" 
            value={totalPatients} 
            icon={<Users className="w-12 h-12 opacity-20" />} 
            gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
            subLabel="คน"
          />
          
          <GradientCard 
            title="เพศชาย" 
            value={maleCount} 
            icon={<UserIcon className="w-12 h-12 opacity-20" />} 
            gradient="bg-gradient-to-r from-emerald-400 to-teal-500"
            subLabel="คน"
          />
          
          <GradientCard 
            title="เพศหญิง" 
            value={femaleCount} 
            icon={<UserIcon className="w-12 h-12 opacity-20" />} 
            gradient="bg-gradient-to-r from-rose-400 to-pink-500"
            subLabel="คน"
          />
          
          <GradientCard 
            title="ศาสนาพุทธ" 
            value={buddhismCount} 
            icon={<Sun className="w-12 h-12 opacity-20" />} 
            gradient="bg-gradient-to-r from-amber-400 to-orange-400"
            subLabel="คน"
          />
          
          <GradientCard 
            title="ศาสนาอิสลาม" 
            value={islamCount} 
            icon={<Moon className="w-12 h-12 opacity-20" />} 
            gradient="bg-gradient-to-r from-slate-700 to-emerald-800"
            subLabel="คน"
          />
          
          <GradientCard 
            title="ศาสนาอื่นๆ" 
            value={otherReligionCount} 
            icon={<Archive className="w-12 h-12 opacity-20" />} 
            gradient="bg-gradient-to-r from-gray-400 to-slate-500"
            subLabel="คน"
          />

        </div>
      </section>

      {/* User Profile Section */}
      <section>
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-6">ข้อมูลผู้ใช้งาน</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           {/* Cover Photo */}
           <div className="h-48 bg-gradient-to-r from-blue-100 to-indigo-100 relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-display text-lg opacity-30 select-none">
                 Cover Photo
              </div>
           </div>
           
           {/* Profile Content */}
           <div className="px-8 pb-8 relative">
              <div className="flex flex-col md:flex-row items-end md:items-end -mt-16 mb-4 gap-6">
                 {/* Avatar */}
                 <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-indigo-50 overflow-hidden flex-shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-300">
                        <UserIcon className="w-16 h-16" />
                      </div>
                    )}
                 </div>
                 
                 {/* Text Info */}
                 <div className="flex-1 pb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{user?.fullName || 'Guest User'}</h3>
                    <p className="text-gray-500 font-medium">{user?.role} • {user?.hospital || 'Wattanapat Hospital'}</p>
                 </div>
                 
                 {/* Action Button */}
                 <div className="pb-4">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                       แก้ไขโปรไฟล์
                    </button>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 border-t pt-6">
                 <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                       <Briefcase className="w-4 h-4 text-gray-400" /> ข้อมูลสังกัด
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                       <li className="flex justify-between border-b border-gray-50 pb-2">
                          <span>แผนก:</span> <span className="font-medium text-gray-800">{user?.department || '-'}</span>
                       </li>
                       <li className="flex justify-between border-b border-gray-50 pb-2">
                          <span>ตำแหน่ง:</span> <span className="font-medium text-gray-800">นักโภชนาการ</span>
                       </li>
                       <li className="flex justify-between border-b border-gray-50 pb-2">
                          <span>รหัสเจ้าหน้าที่:</span> <span className="font-medium text-gray-800">{user?.username}</span>
                       </li>
                    </ul>
                 </div>
                 
                 <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                       <Archive className="w-4 h-4 text-gray-400" /> ข้อมูลการศึกษา
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                       <li className="flex justify-between border-b border-gray-50 pb-2">
                          <span>วุฒิการศึกษา:</span> <span className="font-medium text-gray-800">{user?.degree || '-'}</span>
                       </li>
                       <li className="flex justify-between border-b border-gray-50 pb-2">
                          <span>สาขาวิชา:</span> <span className="font-medium text-gray-800">{user?.major || '-'}</span>
                       </li>
                       <li className="flex justify-between border-b border-gray-50 pb-2">
                          <span>สถาบัน:</span> <span className="font-medium text-gray-800">{user?.institute || '-'}</span>
                       </li>
                    </ul>
                 </div>
              </div>

           </div>
        </div>
      </section>

    </div>
  );
};

// Reusable Gradient Card Component
const GradientCard: React.FC<{
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  gradient: string;
  subLabel?: string;
}> = ({ title, value, icon, gradient, subLabel }) => (
  <div className={`rounded-xl shadow-lg p-6 text-white relative overflow-hidden transition-transform hover:-translate-y-1 ${gradient}`}>
     <div className="relative z-10">
        <h3 className="text-white/90 font-medium text-lg mb-2 flex items-center gap-2">
           {icon && <div className="w-6 h-6 flex items-center justify-center">{/* Small Icon placeholder if needed */}</div>} 
           {title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-display font-bold tracking-tight">{value}</span>
          {subLabel && <span className="text-lg opacity-80">{subLabel}</span>}
        </div>
     </div>
     <div className="absolute right-[-10px] bottom-[-10px] transform rotate-12">
        {icon}
     </div>
  </div>
);

export default Dashboard;
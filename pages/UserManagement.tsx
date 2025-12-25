import React, { useEffect, useState } from 'react';
import { User, Role } from '../types';
import { getUsers } from '../services/mockService';
import { Users, UserPlus } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">กำลังโหลดรายชื่อผู้ใช้...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Page Title Section */}
      <div className="bg-[#FFF9C4] p-4 rounded-lg border border-yellow-200 shadow-sm mb-6">
         <h1 className="text-xl font-display font-bold text-gray-800">ข้อมูลผู้ใช้งานระบบ</h1>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
           <div className="flex items-center gap-2 font-bold text-gray-700 text-sm">
              <Users className="w-4 h-4" />
              <span>รายชื่อผู้ใช้งาน</span>
           </div>
           <button className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-orange-600 transition-colors shadow-sm">
              <UserPlus className="w-3 h-3" /> เพิ่มผู้ใช้งาน
           </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-sans">
            <thead className="bg-gray-100 text-gray-800 font-bold border-b">
              <tr>
                <th className="px-6 py-3 w-20">รูปภาพ</th>
                <th className="px-6 py-3">ชื่อ-สกุล</th>
                <th className="px-6 py-3">แผนก</th>
                <th className="px-6 py-3">โรงพยาบาล</th>
                <th className="px-6 py-3">วุฒิการศึกษา</th>
                <th className="px-6 py-3">สถาบัน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors bg-white">
                  <td className="px-6 py-3 align-middle">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                      {u.avatarUrl ? (
                         <img src={u.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                            <Users className="w-4 h-4" />
                         </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600 align-middle">
                    {u.fullName}
                  </td>
                  <td className="px-6 py-3 text-gray-600 align-middle">{u.department || '-'}</td>
                  <td className="px-6 py-3 text-gray-600 align-middle">{u.hospital || '-'}</td>
                  <td className="px-6 py-3 text-gray-600 align-middle">
                    {u.degree || '-'} {u.major && <span className="text-gray-500"> {u.major}</span>}
                  </td>
                  <td className="px-6 py-3 text-gray-600 align-middle">{u.institute || '-'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูลผู้ใช้งาน</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Copyright */}
      <div className="text-center text-[10px] text-gray-400 mt-10">
         © 2025 ระบบประเมินภาวะโภชนาการเบื้องต้น | โรงพยาบาลวัฒนแพทย์ อ่าวนาง V.02
      </div>
    </div>
  );
};

export default UserManagement;
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Printer, Filter, BarChart as ChartIcon } from 'lucide-react';
import { getUnderstandingAssessments } from '../services/mockService';

const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

interface DiseaseStat {
  name: string;
  n: number;
  avgAge: number;
  malePct: number;
  femalePct: number;
  passPre: number;
  passPost: number;
  improvement: number;
  incomplete: number;
  risk: string;
}

const UnderstandingReport: React.FC = () => {
  const [fromMonth, setFromMonth] = useState('สิงหาคม');
  const [printMode, setPrintMode] = useState<'report' | 'graph' | null>(null);
  const [data, setData] = useState<DiseaseStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fromMonth]);

  const fetchData = async () => {
    setLoading(true);
    const rawData = await getUnderstandingAssessments(fromMonth);
    
    // Group by Disease
    const grouped: Record<string, any[]> = {};
    rawData.forEach(r => {
      if (!grouped[r.disease]) grouped[r.disease] = [];
      grouped[r.disease].push(r);
    });

    const stats: DiseaseStat[] = Object.keys(grouped).map(disease => {
      const items = grouped[disease];
      const n = items.length;
      const avgAge = Math.round(items.reduce((sum, i) => sum + (i.patients?.age || 0), 0) / n) || 0;
      
      const maleCount = items.filter(i => i.patients?.gender === 'Male' || i.patients?.gender === 'ชาย').length;
      
      // Pass if > 60% score
      const prePassCount = items.filter(i => (i.score_pre / i.full_score) > 0.6).length;
      const postPassCount = items.filter(i => (i.score_post / i.full_score) > 0.6).length;

      const avgImprovement = Math.round(
          items.reduce((sum, i) => sum + (((i.score_post - i.score_pre) / i.full_score) * 100), 0) / n
      );

      return {
        name: disease,
        n,
        avgAge,
        malePct: Math.round((maleCount / n) * 100),
        femalePct: Math.round(((n - maleCount) / n) * 100),
        passPre: Math.round((prePassCount / n) * 100),
        passPost: Math.round((postPassCount / n) * 100),
        improvement: avgImprovement > 0 ? avgImprovement : 0,
        incomplete: 0,
        risk: 'Low' // Simple logic placeholder
      };
    });

    setData(stats);
    setLoading(false);
  };

  const chartData = data.map(d => ({
    name: d.name,
    pre: d.passPre,
    post: d.passPost
  }));

  const handlePrint = (mode: 'report' | 'graph') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 500);
  };

  return (
    <div className={`space-y-6 pb-20 ${printMode ? 'print-mode-active' : ''}`}>
      
      <div className="no-print space-y-4">
        <h1 className="text-xl font-display font-bold text-gray-800 flex items-center gap-2">
           <ChartIcon className="w-6 h-6 text-[#1A5C91]" />
           รายงานผลการรับรู้และเข้าใจ
        </h1>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                 <label className="block text-xs text-gray-500 mb-1">ประจำเดือน</label>
                 <select 
                   className="w-full border rounded p-2 text-sm bg-white"
                   value={fromMonth}
                   onChange={e => setFromMonth(e.target.value)}
                 >
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="flex justify-end gap-2 mt-4 border-t pt-3">
              <button onClick={() => handlePrint('report')} className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-800">
                 <Printer className="w-4 h-4" /> พิมพ์รายงาน
              </button>
              <button onClick={() => handlePrint('graph')} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-teal-700">
                 <Printer className="w-4 h-4" /> พิมพ์กราฟ
              </button>
           </div>
        </div>
      </div>

      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${printMode === 'graph' ? 'hidden' : ''}`}>
         <div className="hidden print:block text-center mb-6">
            <div className="flex justify-center mb-2">
                 <img src="https://www.aonanghospital.com/themes/wattanapat2021/images/logo.png" className="h-10" alt="logo" />
            </div>
            <h1 className="text-xl font-bold">รายงานผลการรับรู้และเข้าใจ (Understanding Report)</h1>
            <p className="text-sm">ประจำเดือน {fromMonth} พ.ศ. 2568</p>
         </div>

         {loading ? <div className="text-center p-8">กำลังประมวลผล...</div> :
         <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
               <thead>
                  <tr className="bg-gray-100 border-b border-t border-gray-200">
                     <th className="p-3 text-left font-semibold text-gray-700 border">โรค</th>
                     <th className="p-3 font-semibold text-gray-700 border">N</th>
                     <th className="p-3 font-semibold text-gray-700 border">อายุ(เฉลี่ย)</th>
                     <th className="p-3 font-semibold text-gray-700 border">ชาย(%)</th>
                     <th className="p-3 font-semibold text-gray-700 border">หญิง(%)</th>
                     <th className="p-3 font-semibold text-gray-700 border bg-orange-50">ผ่านก่อน(%)</th>
                     <th className="p-3 font-semibold text-gray-700 border bg-teal-50">ผ่านหลัง(%)</th>
                     <th className="p-3 font-semibold text-gray-700 border">พัฒนา(%)</th>
                     <th className="p-3 font-semibold text-gray-700 border">ไม่สมบูรณ์</th>
                     <th className="p-3 font-semibold text-gray-700 border">ความเสี่ยง</th>
                  </tr>
               </thead>
               <tbody>
                  {data.length === 0 ? <tr><td colSpan={10} className="p-4 text-center">ไม่มีข้อมูลในเดือนนี้</td></tr> :
                  data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 border-b">
                       <td className="p-3 text-left border font-medium">{row.name}</td>
                       <td className="p-3 border">{row.n}</td>
                       <td className="p-3 border">{row.avgAge}</td>
                       <td className="p-3 border">{row.malePct}%</td>
                       <td className="p-3 border">{row.femalePct}%</td>
                       <td className="p-3 border bg-orange-50/50 font-semibold text-orange-700">{row.passPre}%</td>
                       <td className="p-3 border bg-teal-50/50 font-semibold text-teal-700">{row.passPost}%</td>
                       <td className="p-3 border font-bold text-green-600">+{row.improvement}%</td>
                       <td className="p-3 border text-gray-500">{row.incomplete}</td>
                       <td className="p-3 border">{row.risk}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>}
      </div>

      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${printMode === 'report' ? 'hidden' : ''}`}>
         <div className="text-center mb-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-1">เปรียบเทียบผลการประเมิน ก่อน-หลัง การให้คำแนะนำ</h2>
            <div className="flex justify-center gap-4 text-xs">
               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#FDBA74]"></div> ผ่านก่อน (%)</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#5EEAD4]"></div> ผ่านหลัง (%)</div>
            </div>
         </div>
         
         <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="pre" name="ผ่านก่อน (%)" fill="#FDBA74" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="post" name="ผ่านหลัง (%)" fill="#5EEAD4" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default UnderstandingReport;
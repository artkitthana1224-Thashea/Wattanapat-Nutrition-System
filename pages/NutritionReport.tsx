import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Printer, FileText, Filter } from 'lucide-react';
import { getNutritionAssessments } from '../services/mockService';

const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const NutritionReport: React.FC = () => {
  const [fromMonth, setFromMonth] = useState('ตุลาคม');
  const [toMonth, setToMonth] = useState('ตุลาคม'); // Range logic simplified for demo to single selection usually or filter in JS
  const [printMode, setPrintMode] = useState<'table' | 'graph' | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fromMonth]);

  const fetchData = async () => {
    setLoading(true);
    const result = await getNutritionAssessments(fromMonth);
    // Transform API data to Report Row format
    const rows = result.map(item => ({
       date: item.date,
       month: item.month,
       hn: item.hn,
       fullName: item.patientName,
       diseases: item.diseases || {},
       intake: item.nutritionStatus.score0_5 ? 'Normal' : item.nutritionStatus.score6_10 ? 'Risk' : 'High Risk',
       status: item.assessmentCodes?.e1 ? 'E1' : item.assessmentCodes?.e2 ? 'E2' : '-'
    }));
    setData(rows);
    setLoading(false);
  };

  // Calculations
  const calculateStats = () => {
    const total = data.length;
    const initial = { dm: 0, ht: 0, dlp: 0, ckd: 0, gout: 0, heart: 0, stroke: 0, bmi: 0, cc: 0, other: 0 };
    
    const sums = data.reduce((acc, row) => {
      if (row.diseases.dm) acc.dm++;
      if (row.diseases.ht) acc.ht++;
      if (row.diseases.dlp) acc.dlp++;
      if (row.diseases.ckd) acc.ckd++;
      if (row.diseases.gout) acc.gout++;
      if (row.diseases.heart) acc.heart++;
      if (row.diseases.stroke) acc.stroke++;
      if (row.diseases.bmiRisk) acc.bmi++;
      if (row.diseases.critical) acc.cc++;
      if (row.diseases.other) acc.other++;
      return acc;
    }, initial);

    return { total, sums };
  };

  const { total, sums } = calculateStats();

  const chartData = [
    { name: 'DM', val: sums.dm },
    { name: 'HT', val: sums.ht },
    { name: 'DLP', val: sums.dlp },
    { name: 'CKD', val: sums.ckd },
    { name: 'Gout', val: sums.gout },
    { name: 'Heart', val: sums.heart },
    { name: 'Stroke', val: sums.stroke },
    { name: 'BMI', val: sums.bmi },
    { name: 'CC', val: sums.cc },
    { name: 'อื่นๆ', val: sums.other },
  ];

  const handlePrint = (mode: 'table' | 'graph') => {
    setPrintMode(mode);
    setTimeout(() => {
        window.print();
        setPrintMode(null);
    }, 500);
  };

  return (
    <div className={`space-y-6 ${printMode ? 'print-mode-active' : ''}`}>
      
      <div className="no-print space-y-4">
        <h1 className="text-2xl font-display font-bold text-gray-800">รายงานผลการตรวจเยี่ยมผู้ป่วย (โภชนาการ)</h1>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <h2 className="font-semibold text-gray-700 mb-3 text-sm">กรองข้อมูล</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                 <label className="block text-xs text-gray-500 mb-1">เดือน</label>
                 <select 
                   className="w-full border rounded p-2 text-sm bg-white"
                   value={fromMonth}
                   onChange={e => setFromMonth(e.target.value)}
                 >
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                 </select>
              </div>
              <div className="pb-2 text-xs text-gray-400">
                เลือกเดือนเพื่อดูรายงานประจำเดือนนั้นๆ
              </div>
           </div>
           <div className="flex justify-end gap-2 mt-4 border-t pt-3">
              <button 
                onClick={() => handlePrint('table')}
                className="bg-[#2563EB] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-600"
              >
                 <Printer className="w-4 h-4" /> พิมพ์รายงาน
              </button>
           </div>
        </div>
      </div>

      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${printMode === 'graph' ? 'hidden' : ''}`}>
         {/* Print Header for Table */}
         <div className="hidden print:block text-center mb-4">
            <div className="flex justify-center mb-2">
                 <img src="https://www.aonanghospital.com/themes/wattanapat2021/images/logo.png" className="h-10" alt="logo" />
            </div>
            <h1 className="text-xl font-bold">แผนกโภชนาการ โรงพยาบาลวัฒนแพทย์ อ่าวนาง</h1>
            <p className="text-sm">555 หมู่ 5 ต.อ่าวนาง อ.เมือง จ.กระบี่ 81180</p>
            <div className="border-b-2 border-black my-2"></div>
            <h2 className="text-lg font-bold">รายงานแบบประเมินภาวะโภชนาการเบื้องต้น ประจำเดือน {fromMonth}</h2>
         </div>

         {loading ? <div className="text-center p-8">กำลังโหลดข้อมูล...</div> :
         <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
               <thead>
                  <tr className="bg-gray-50 border-b border-t print:border-black">
                     <th className="p-2 text-left print:border print:border-black">วันที่</th>
                     <th className="p-2 text-left print:border print:border-black">HN</th>
                     <th className="p-2 text-left print:border print:border-black">ชื่อ-สกุล</th>
                     <th className="p-2 print:border print:border-black">DM</th>
                     <th className="p-2 print:border print:border-black">HT</th>
                     <th className="p-2 print:border print:border-black">DLP</th>
                     <th className="p-2 print:border print:border-black">CKD</th>
                     <th className="p-2 print:border print:border-black">Gout</th>
                     <th className="p-2 print:border print:border-black">Heart</th>
                     <th className="p-2 print:border print:border-black">Stroke</th>
                     <th className="p-2 print:border print:border-black">BMI</th>
                     <th className="p-2 print:border print:border-black">CC</th>
                     <th className="p-2 print:border print:border-black">อื่นๆ</th>
                     <th className="p-2 print:border print:border-black">เสี่ยง</th>
                     <th className="p-2 print:border print:border-black">Code</th>
                  </tr>
               </thead>
               <tbody>
                  {data.map((row, i) => (
                     <tr key={i} className="border-b hover:bg-gray-50 print:border-black">
                        <td className="p-2 text-left print:border print:border-black">{row.date}</td>
                        <td className="p-2 text-left print:border print:border-black">{row.hn}</td>
                        <td className="p-2 text-left print:border print:border-black">{row.fullName}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.dm ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.ht ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.dlp ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.ckd ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.gout ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.heart ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.stroke ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.bmiRisk ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.critical ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.diseases.other ? '✓' : '-'}</td>
                        <td className="p-2 print:border print:border-black">{row.intake}</td>
                        <td className="p-2 print:border print:border-black">{row.status}</td>
                     </tr>
                  ))}
                  <tr className="font-bold bg-gray-50 border-t print:border-black">
                     <td colSpan={3} className="p-2 text-right print:border print:border-black">รวม:</td>
                     <td className="p-2 print:border print:border-black">{sums.dm}</td>
                     <td className="p-2 print:border print:border-black">{sums.ht}</td>
                     <td className="p-2 print:border print:border-black">{sums.dlp}</td>
                     <td className="p-2 print:border print:border-black">{sums.ckd}</td>
                     <td className="p-2 print:border print:border-black">{sums.gout}</td>
                     <td className="p-2 print:border print:border-black">{sums.heart}</td>
                     <td className="p-2 print:border print:border-black">{sums.stroke}</td>
                     <td className="p-2 print:border print:border-black">{sums.bmi}</td>
                     <td className="p-2 print:border print:border-black">{sums.cc}</td>
                     <td className="p-2 print:border print:border-black">{sums.other}</td>
                     <td colSpan={2} className="print:border print:border-black"></td>
                  </tr>
               </tbody>
            </table>
         </div>}
      </div>

      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${printMode === 'table' ? 'hidden' : ''}`}>
         <div className="flex justify-between items-center mb-6 no-print">
             <h2 className="font-semibold text-gray-800 flex items-center gap-2">
               <div className="w-1 h-5 bg-gray-800 rounded"></div>
               กราฟสรุป
             </h2>
             <button onClick={() => handlePrint('graph')} className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-xs border px-2 py-1 rounded">
                <Printer className="w-3 h-3" /> พิมพ์กราฟ
             </button>
         </div>

         <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} opacity={0.3} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip />
                  <Bar dataKey="val" fill="#3B6691" barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#3B6691" />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default NutritionReport;
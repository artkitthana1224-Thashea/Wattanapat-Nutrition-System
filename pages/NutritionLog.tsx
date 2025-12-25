import React, { useState } from 'react';
import { Search, Save, Printer, BarChart2, Calculator, History, CheckSquare, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { getPatientByHN, calculateBMI, calculateIBW, saveNutritionLog } from '../services/mockService';
import { FoodRow, NutritionLog as LogType } from '../types';
import Swal from 'sweetalert2';

type FoodGroup = 'rice' | 'meat' | 'veg' | 'fruit' | 'milk' | 'fat' | 'sugar';

const INITIAL_ROW: FoodRow = { rice: 0, meat: 0, veg: 0, fruit: 0, milk: 0, fat: 0, sugar: 0 };
const KCAL_PER_UNIT: FoodRow = { rice: 80, meat: 55, veg: 25, fruit: 60, milk: 120, fat: 45, sugar: 20 };

const NutritionLog: React.FC = () => {
  const [hnSearch, setHnSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [patient, setPatient] = useState({
    date: new Date().toISOString().split('T')[0],
    hn: '',
    prefix: '',
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    religion: '',
    weight: '',
    height: '',
    ibw: '',
    bmi: '',
    energyReq: '',
    source: '',
    diseases: ''
  });

  const [tableData, setTableData] = useState<{
    target: FoodRow;
    breakfast: FoodRow;
    lunch: FoodRow;
    snack: FoodRow;
    dinner: FoodRow;
  }>({
    target: { ...INITIAL_ROW },
    breakfast: { ...INITIAL_ROW },
    lunch: { ...INITIAL_ROW },
    snack: { ...INITIAL_ROW },
    dinner: { ...INITIAL_ROW },
  });

  const [showGraph, setShowGraph] = useState(false);

  // --- Calculations ---
  const calculateTotalIntake = (): FoodRow => {
    const keys = Object.keys(INITIAL_ROW) as FoodGroup[];
    const total = { ...INITIAL_ROW };
    keys.forEach(k => {
      total[k] = 
        (Number(tableData.breakfast[k]) || 0) +
        (Number(tableData.lunch[k]) || 0) +
        (Number(tableData.snack[k]) || 0) +
        (Number(tableData.dinner[k]) || 0);
    });
    return total;
  };

  const totalIntake = calculateTotalIntake();

  const calculateEnergyReceived = (): FoodRow => {
    const keys = Object.keys(INITIAL_ROW) as FoodGroup[];
    const energy = { ...INITIAL_ROW };
    keys.forEach(k => {
      energy[k] = totalIntake[k] * KCAL_PER_UNIT[k];
    });
    return energy;
  };

  const energyReceived = calculateEnergyReceived();
  const grandTotalKcal = Object.values(energyReceived).reduce((a, b) => a + b, 0);

  // --- Handlers ---
  const handleSearch = async () => {
    if (!hnSearch) return;
    setLoading(true);
    try {
      const p = await getPatientByHN(hnSearch);
      if (p) {
        const ibw = calculateIBW(p.height || 0, p.gender);
        setPatient(prev => ({
          ...prev,
          hn: p.hn,
          prefix: p.prefix,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender === 'Male' ? 'ชาย' : 'หญิง',
          age: p.age.toString(),
          religion: p.religion || '',
          weight: p.weight?.toString() || '',
          height: p.height?.toString() || '',
          bmi: p.bmi?.toString() || '',
          ibw: ibw.toString(),
          diseases: p.diagnosis || ''
        }));
        Swal.fire({
          icon: 'success',
          title: 'พบข้อมูลผู้ป่วย',
          text: `${p.firstName} ${p.lastName}`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire('ไม่พบข้อมูล', 'กรุณาตรวจสอบ HN หรือกรอกข้อมูลด้วยตนเอง', 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!patient.hn) {
      Swal.fire('กรุณาระบุ HN', '', 'warning');
      return;
    }
    setLoading(true);
    try {
      const logData: LogType = {
        hn: patient.hn,
        date: patient.date,
        meals: tableData,
        totalCalories: grandTotalKcal
      };
      await saveNutritionLog(logData);
      Swal.fire('บันทึกสำเร็จ', 'ข้อมูลการบริโภคถูกบันทึกแล้ว', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (meal: keyof typeof tableData, group: FoodGroup, value: string) => {
    setTableData(prev => ({
      ...prev,
      [meal]: {
        ...prev[meal],
        [group]: Number(value)
      }
    }));
  };

  const handlePatientChange = (field: string, value: string) => {
    setPatient(prev => {
        const updated = { ...prev, [field]: value };
        if ((field === 'weight' || field === 'height') && updated.weight && updated.height) {
            const w = parseFloat(updated.weight);
            const h = parseFloat(updated.height);
            if (!isNaN(w) && !isNaN(h)) {
                updated.bmi = calculateBMI(w, h).toString();
                const genderFactor = updated.gender === 'ชาย' ? 100 : 105;
                updated.ibw = (h - genderFactor).toString();
            }
        }
        return updated;
    });
  };

  const chartData = [
    { name: 'ข้าว-แป้ง', target: tableData.target.rice, actual: totalIntake.rice },
    { name: 'เนื้อสัตว์', target: tableData.target.meat, actual: totalIntake.meat },
    { name: 'ผัก', target: tableData.target.veg, actual: totalIntake.veg },
    { name: 'ผลไม้', target: tableData.target.fruit, actual: totalIntake.fruit },
    { name: 'นม', target: tableData.target.milk, actual: totalIntake.milk },
    { name: 'ไขมัน', target: tableData.target.fat, actual: totalIntake.fat },
    { name: 'น้ำตาล', target: tableData.target.sugar, actual: totalIntake.sugar },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="no-print space-y-4">
        <h1 className="text-xl font-display font-bold text-gray-800 flex items-center gap-2">
           <User className="w-6 h-6 text-[#E65100]" />
           บันทึกผลทางโภชนาการ (Nutrition Analysis)
        </h1>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <label className="text-xs font-semibold text-gray-500 mb-1 block">กรอกเลขที่ HN เพื่อค้นหา</label>
           <div className="flex gap-2 flex-wrap">
              <input 
                 className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                 placeholder="ค้นหา HN จากฐานข้อมูล..."
                 value={hnSearch}
                 onChange={e => setHnSearch(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700">
                 <Search className="w-4 h-4" /> {loading ? '...' : 'ค้นหา'}
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-700">
                 <CheckSquare className="w-4 h-4" /> กรอกข้อมูลด้วยตนเอง
              </button>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 pb-6 border-b">
            <div className="md:col-span-3">
               <label className="label">วันที่บันทึก</label>
               <input type="date" className="input w-full" value={patient.date} onChange={e => handlePatientChange('date', e.target.value)} />
            </div>
            <div className="md:col-span-3">
               <label className="label">HN</label>
               <input className="input w-full" value={patient.hn} onChange={e => handlePatientChange('hn', e.target.value)} />
            </div>
            <div className="md:col-span-2">
               <label className="label">คำนำหน้า</label>
               <input className="input w-full" value={patient.prefix} onChange={e => handlePatientChange('prefix', e.target.value)} />
            </div>
            <div className="md:col-span-4">
               <label className="label">ชื่อ</label>
               <input className="input w-full" value={patient.firstName} onChange={e => handlePatientChange('firstName', e.target.value)} />
            </div>

            <div className="md:col-span-4">
               <label className="label">นามสกุล</label>
               <input className="input w-full" value={patient.lastName} onChange={e => handlePatientChange('lastName', e.target.value)} />
            </div>
            <div className="md:col-span-2">
               <label className="label">เพศ</label>
               <select className="input w-full" value={patient.gender} onChange={e => handlePatientChange('gender', e.target.value)}>
                  <option value="">ระบุ</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
               </select>
            </div>
            <div className="md:col-span-2">
               <label className="label">อายุ</label>
               <input className="input w-full" type="number" value={patient.age} onChange={e => handlePatientChange('age', e.target.value)} />
            </div>
            <div className="md:col-span-4">
               <label className="label">ศาสนา</label>
               <input className="input w-full" value={patient.religion} onChange={e => handlePatientChange('religion', e.target.value)} />
            </div>

            <div className="md:col-span-3">
               <label className="label">น้ำหนักปัจจุบัน (kg)</label>
               <input className="input w-full" type="number" value={patient.weight} onChange={e => handlePatientChange('weight', e.target.value)} />
            </div>
            <div className="md:col-span-3">
               <label className="label">น้ำหนักมาตรฐาน (kg)</label>
               <input className="input w-full bg-gray-50" readOnly value={patient.ibw} />
            </div>
            <div className="md:col-span-3">
               <label className="label">ส่วนสูง (cm)</label>
               <input className="input w-full" type="number" value={patient.height} onChange={e => handlePatientChange('height', e.target.value)} />
            </div>
            <div className="md:col-span-3">
               <label className="label">BMI</label>
               <input className="input w-full bg-gray-50" readOnly value={patient.bmi} />
            </div>

            <div className="md:col-span-4">
               <label className="label">พลังงาน (Kcal/วัน)</label>
               <input className="input w-full" type="number" value={patient.energyReq} onChange={e => handlePatientChange('energyReq', e.target.value)} />
            </div>
            <div className="md:col-span-8">
               <label className="label">ข้อมูลจาก</label>
               <input className="input w-full" value={patient.source} onChange={e => handlePatientChange('source', e.target.value)} />
            </div>
            
            <div className="md:col-span-12">
               <label className="label">โรคประจำตัว</label>
               <textarea className="input w-full h-16 resize-none" value={patient.diseases} onChange={e => handlePatientChange('diseases', e.target.value)}></textarea>
            </div>
         </div>

         <div className="mb-6">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
               <div className="w-5 h-5 bg-gray-800 text-white flex items-center justify-center rounded text-xs grid-icon">▦</div> 
               ตารางบันทึกการบริโภคอาหาร
            </h3>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200">
               <table className="w-full text-xs text-center border-collapse min-w-[800px]">
                  <thead className="bg-[#E3F2FD] text-gray-700 font-bold">
                     <tr>
                        <th className="p-3 border-r border-b text-left w-32">มื้อ/รายการอาหาร</th>
                        <th className="p-3 border-r border-b w-24">ข้าว (ทัพพี)</th>
                        <th className="p-3 border-r border-b w-24">เนื้อสัตว์ (ช้อน)</th>
                        <th className="p-3 border-r border-b w-24">ผัก (ทัพพี)</th>
                        <th className="p-3 border-r border-b w-24">ผลไม้ (ส่วน)</th>
                        <th className="p-3 border-r border-b w-24">นม (กล่อง)</th>
                        <th className="p-3 border-r border-b w-24">ไขมัน (ช้อนชา)</th>
                        <th className="p-3 border-b w-24">น้ำตาล (ช้อนชา)</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr className="bg-white">
                        <td className="p-2 border-r border-b text-left font-bold text-blue-600">เป้าหมายการบริโภค</td>
                        {(Object.keys(INITIAL_ROW) as FoodGroup[]).map(g => (
                           <td key={g} className="p-2 border-r border-b">
                              <input 
                                 type="number" 
                                 className="w-full text-center border rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500"
                                 value={tableData.target[g] || ''}
                                 onChange={e => handleInputChange('target', g, e.target.value)}
                              />
                           </td>
                        ))}
                     </tr>
                     {['breakfast', 'lunch', 'snack', 'dinner'].map((meal) => (
                        <tr key={meal} className="bg-white hover:bg-gray-50">
                           <td className="p-2 border-r border-b text-left font-medium capitalize">
                              {meal === 'breakfast' ? 'เช้า' : meal === 'lunch' ? 'เที่ยง' : meal === 'snack' ? 'ว่างบ่าย' : 'เย็น'}
                           </td>
                           {(Object.keys(INITIAL_ROW) as FoodGroup[]).map(g => (
                              <td key={g} className="p-2 border-r border-b">
                                 <input 
                                    type="number" 
                                    className="w-full text-center border rounded px-1 py-0.5 focus:ring-1 focus:ring-orange-500"
                                    value={(tableData as any)[meal][g] || ''}
                                    onChange={e => handleInputChange(meal as any, g, e.target.value)}
                                 />
                              </td>
                           ))}
                        </tr>
                     ))}
                     <tr className="bg-gray-100 font-bold">
                        <td className="p-2 border-r border-b text-left">รวม</td>
                        {(Object.keys(INITIAL_ROW) as FoodGroup[]).map(g => (
                           <td key={g} className="p-2 border-r border-b">{totalIntake[g]}</td>
                        ))}
                     </tr>
                     <tr className="bg-gray-50 text-gray-500">
                        <td className="p-2 border-r border-b text-left text-[10px]">พลังงาน/1 ส่วน (kcal)</td>
                        {(Object.keys(INITIAL_ROW) as FoodGroup[]).map(g => (
                           <td key={g} className="p-2 border-r border-b">{KCAL_PER_UNIT[g]}</td>
                        ))}
                     </tr>
                     <tr className="bg-gray-100 font-bold text-blue-800">
                        <td className="p-2 border-r border-b text-left">พลังงานที่ได้รับ (kcal)</td>
                        {(Object.keys(INITIAL_ROW) as FoodGroup[]).map(g => (
                           <td key={g} className="p-2 border-r border-b">{energyReceived[g]}</td>
                        ))}
                     </tr>
                  </tbody>
                  <tfoot>
                     <tr className="bg-[#E0F2F1]">
                        <td colSpan={8} className="p-3 text-right font-bold text-base text-teal-800 border-t-2 border-teal-500">
                           พลังงานรวม (kcal) <span className="ml-4 text-xl">{grandTotalKcal.toLocaleString()}</span>
                        </td>
                     </tr>
                  </tfoot>
               </table>
            </div>
         </div>

         <div className="flex justify-between items-center pt-4 border-t no-print">
            <div className="flex gap-2">
               <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm">
                  <Save className="w-4 h-4" /> {loading ? 'กำลังบันทึก...' : 'บันทึก'}
               </button>
               <button onClick={() => setShowGraph(!showGraph)} className="bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-600 text-sm">
                  <BarChart2 className="w-4 h-4" /> {showGraph ? 'ซ่อนกราฟ' : 'ประมวลผลกราฟ'}
               </button>
            </div>
            
            <div className="flex gap-2">
               <button onClick={() => Swal.fire('เครื่องคิดเลข', 'ฟีเจอร์นี้กำลังพัฒนา', 'info')} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 text-sm">
                  <Calculator className="w-4 h-4" /> เครื่องคิดเลข
               </button>
               <button onClick={() => window.print()} className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-600 text-sm">
                  <Printer className="w-4 h-4" /> พิมพ์ผลการบันทึก
               </button>
            </div>
         </div>
         
         {showGraph && (
            <div className="mt-8 h-80 w-full animate-fade-in no-print">
               <h3 className="text-center font-bold mb-4">กราฟเปรียบเทียบเป้าหมาย vs การบริโภคจริง (หน่วย: ส่วน)</h3>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey="target" name="เป้าหมาย" fill="#8884d8" />
                     <Bar dataKey="actual" name="ที่บริโภคจริง" fill="#82ca9d" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         )}
      </div>

      <div className="hidden print:block bg-white p-0 text-xs text-black font-sans leading-tight">
          <div className="flex justify-between items-start mb-4 border-b pb-2">
             <div className="flex items-center gap-2">
               <img src="https://www.aonanghospital.com/themes/wattanapat2021/images/logo.png" className="h-10" />
               <div>
                  <h1 className="text-sm font-bold text-[#1A5C91]">โรงพยาบาลวัฒนแพทย์ อ่าวนาง</h1>
                  <p className="text-[9px] text-gray-600">WATTANAPAT HOSPITAL AO NANG</p>
               </div>
             </div>
             <div className="text-right">
                <h2 className="text-sm font-bold">บันทึกผลทางโภชนาการ (Nutrition Analysis)</h2>
                <p className="text-[9px]">แผนกโภชนาการ</p>
             </div>
          </div>

          <div className="grid grid-cols-12 gap-2 mb-4 border p-2 rounded">
             <div className="col-span-4"><b>วันที่:</b> {patient.date}</div>
             <div className="col-span-4"><b>HN:</b> {patient.hn}</div>
             <div className="col-span-4"><b>ชื่อ-สกุล:</b> {patient.prefix} {patient.firstName} {patient.lastName}</div>
             <div className="col-span-3"><b>เพศ:</b> {patient.gender}</div>
             <div className="col-span-3"><b>อายุ:</b> {patient.age}</div>
             <div className="col-span-3"><b>ศาสนา:</b> {patient.religion}</div>
             <div className="col-span-3"><b>BMI:</b> {patient.bmi}</div>
             <div className="col-span-6"><b>พลังงานที่ต้องการ:</b> {patient.energyReq} Kcal</div>
             <div className="col-span-6"><b>โรคประจำตัว:</b> {patient.diseases}</div>
          </div>

          <h3 className="font-bold mb-2">ตารางสรุปการบริโภคอาหาร</h3>
          <table className="w-full border-collapse border border-black text-[10px] text-center mb-4">
              <thead>
                 <tr className="bg-gray-100">
                    <th className="border border-black p-1">รายการ</th>
                    <th className="border border-black p-1">ข้าว (ทัพพี)</th>
                    <th className="border border-black p-1">เนื้อสัตว์ (ช้อน)</th>
                    <th className="border border-black p-1">ผัก (ทัพพี)</th>
                    <th className="border border-black p-1">ผลไม้ (ส่วน)</th>
                    <th className="border border-black p-1">นม (กล่อง)</th>
                    <th className="border border-black p-1">ไขมัน (ชช.)</th>
                    <th className="border border-black p-1">น้ำตาล (ชช.)</th>
                 </tr>
              </thead>
              <tbody>
                 <tr>
                    <td className="border border-black p-1 text-left font-bold">เป้าหมาย</td>
                    {(Object.keys(INITIAL_ROW) as FoodGroup[]).map(g => <td key={g} className="border border-black p-1">{tableData.target[g]}</td>)}
                 </tr>
                 <tr>
                    <td className="border border-black p-1 text-left">บริโภคจริง</td>
                    {(Object.keys(INITIAL_ROW) as FoodGroup[]).map(g => <td key={g} className="border border-black p-1">{totalIntake[g]}</td>)}
                 </tr>
                 <tr className="bg-gray-100 font-bold">
                    <td className="border border-black p-1 text-left">พลังงาน (kcal)</td>
                    {(Object.keys(INITIAL_ROW) as FoodGroup[]).map(g => <td key={g} className="border border-black p-1">{energyReceived[g]}</td>)}
                 </tr>
              </tbody>
          </table>
          
          <div className="text-right text-sm font-bold border-t border-black pt-2">
             พลังงานรวมทั้งหมด: {grandTotalKcal.toLocaleString()} kcal
          </div>

          <div className="flex justify-end mt-12">
             <div className="text-center">
                <div className="border-b border-black w-40 mb-1"></div>
                <p>ผู้บันทึกข้อมูล</p>
             </div>
          </div>
      </div>
    </div>
  );
};

export default NutritionLog;
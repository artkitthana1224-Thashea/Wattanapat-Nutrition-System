import React, { useState, useEffect } from 'react';
import { Search, Save, Printer, AlertCircle, FileText, Activity, Utensils, Brain, CheckSquare, List, MessageCircle, Clock, Heart } from 'lucide-react';
import { getPatientByHN, savePatient, saveNutritionAssessment, calculateBMI, calculateIBW, searchPatients } from '../services/mockService';
import { Patient, NutritionAssessment } from '../types';
import Swal from 'sweetalert2';

const PatientForm: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState('disease'); // disease, intake, status, problem, plan, recommend, followup, understanding
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Patient Info
  const [patient, setPatient] = useState<Patient>({
    hn: '', prefix: 'นาย', firstName: '', lastName: '', vn: '',
    age: 0, gender: 'Male', religion: 'Buddhism', ward: '', 
    admitDate: new Date().toISOString().split('T')[0], 
    diagnosis: '', weight: 0, height: 0, bmi: 0, dietType: 'Regular'
  });

  // Assessment Data
  const [form, setForm] = useState<NutritionAssessment>({
    hn: '', date: new Date().toISOString().split('T')[0], month: 'มกราคม', vn: '',
    weight: 0, height: 0, bmi: 0, ibw: 0, energyDaily: 0, energyTarget: 0, source: [],
    diseases: { dm: false, ht: false, dlp: false, ckd: false, gout: false, heart: false, stroke: false, bmiRisk: false, critical: false, other: '' },
    dietHistory: {
      breakfast: '', lunch: '', dinner: '', snack: '', drink: '', supplement: '',
      preferenceType: '', preferenceMenu: '', dislike: '', allergy: '',
      cooking: [], alcohol: '', smoking: '',
      exercise: '', excretion: '', sleep: '', medication: '', occupation: ''
    },
    assessmentCodes: { e1: false, e2: false, e3: false, e4: false, e5: false, e6: false },
    nutritionStatus: { score0_5: false, score6_10: false, scoreGT11: false },
    problems: { p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, p7: false },
    plans: { behavior: false, reduce: false, increase: false, exchange: false, portion: false, mobility: false, modification: false, shopping: false },
    recommendation: '', followUp: '',
    understanding: { passed: false, details: '' }
  });

  // --- Effects ---
  useEffect(() => {
    setForm(prev => ({ 
      ...prev, 
      hn: patient.hn, 
      vn: patient.vn,
      weight: patient.weight || 0, 
      height: patient.height || 0, 
      bmi: patient.bmi || 0 
    }));
  }, [patient.hn, patient.vn, patient.weight, patient.height, patient.bmi]);

  useEffect(() => {
    if (form.weight > 0 && form.height > 0) {
      const bmi = calculateBMI(form.weight, form.height);
      const ibw = calculateIBW(form.height, patient.gender);
      setForm(prev => ({ ...prev, bmi, ibw }));
      setPatient(prev => ({ ...prev, weight: form.weight, height: form.height, bmi }));
    }
  }, [form.weight, form.height, patient.gender]);

  // --- Handlers ---
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPatient(prev => ({ ...prev, hn: val }));
    if (val.length > 2) {
      const res = await searchPatients(val);
      setSearchResults(res);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectPatient = (p: Patient) => {
    setPatient(p);
    setShowResults(false);
  };

  const handleSave = async () => {
    if (!patient.hn) {
      Swal.fire('กรุณากรอก HN', '', 'warning');
      return;
    }
    setLoading(true);
    try {
      await savePatient(patient);
      await saveNutritionAssessment(form);
      Swal.fire('บันทึกข้อมูลสำเร็จ', '', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
    setLoading(false);
  };

  // Helper for Checkboxes in Array
  const toggleArrayCheckbox = (field: 'source' | 'cooking', value: string) => {
    setForm(prev => {
      const current = prev[field === 'source' ? 'source' : 'dietHistory'][field === 'cooking' ? 'cooking' : 'source'] as string[];
      // @ts-ignore
      const newArray = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      
      if (field === 'source') return { ...prev, source: newArray };
      return { ...prev, dietHistory: { ...prev.dietHistory, cooking: newArray } };
    });
  };

  // --- Render ---

  // Date Formatting for display
  const currentYear = new Date().getFullYear() + 543;
  const todayFormatted = `${new Date().getDate()}/${new Date().getMonth() + 1}/${currentYear}`;

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-20">
      
      {/* 1. Header & Title */}
      <h1 className="text-2xl font-display font-bold text-gray-800 no-print">บันทึกผลการตรวจเยี่ยมผู้ป่วย</h1>

      {/* 2. Warning Banner */}
      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-3 text-sm flex items-center gap-2 rounded-r shadow-sm no-print">
        <AlertCircle className="w-4 h-4" />
        <p>คำแนะนำ: เมื่อกรอกข้อมูลเรียบร้อยแล้ว กรุณาคลิก "พิมพ์ข้อมูล" ทุกครั้ง (หากต้องการ) จากนั้นจึงคลิก "บันทึกข้อมูล"</p>
      </div>

      {/* 3. Main Form Container */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 no-print">
        
        {/* Row 1: Date, Month, HN */}
        <div className="grid grid-cols-12 gap-4 mb-4">
           <div className="col-span-3">
             <label className="text-xs font-semibold text-gray-500 block mb-1">วันที่บันทึก (พ.ศ.)</label>
             <input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={todayFormatted} readOnly />
           </div>
           <div className="col-span-3">
             <label className="text-xs font-semibold text-gray-500 block mb-1">เดือน</label>
             <select className="input" value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
               {['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'].map(m => <option key={m}>{m}</option>)}
             </select>
           </div>
           <div className="col-span-6 relative">
             <label className="text-xs font-semibold text-gray-500 block mb-1">หมายเลข HN</label>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 className="input flex-1" 
                 placeholder="หมายเลข HN" 
                 value={patient.hn} 
                 onChange={handleSearchChange} 
               />
               <button className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600">ค้นหาประวัติผู้ป่วยจาก HN</button>
             </div>
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white rounded shadow-xl border z-10">
                  {searchResults.map(p => (
                    <div key={p.hn} className="p-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => selectPatient(p)}>
                      {p.hn} - {p.firstName} {p.lastName}
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Row 2: Prefix, Name, Surname, VN */}
        <div className="grid grid-cols-12 gap-4 mb-4">
           <div className="col-span-2">
             <label className="label">คำนำหน้า</label>
             <select className="input" value={patient.prefix} onChange={e => setPatient({...patient, prefix: e.target.value})}>
                <option>นาย</option><option>นาง</option><option>นางสาว</option><option>ด.ช.</option><option>ด.ญ.</option>
             </select>
           </div>
           <div className="col-span-4">
             <label className="label">ชื่อ</label>
             <input className="input" value={patient.firstName} onChange={e => setPatient({...patient, firstName: e.target.value})} placeholder="ชื่อ" />
           </div>
           <div className="col-span-4">
             <label className="label">นามสกุล</label>
             <input className="input" value={patient.lastName} onChange={e => setPatient({...patient, lastName: e.target.value})} placeholder="นามสกุล" />
           </div>
           <div className="col-span-2">
             <label className="label">VN/ห้องพัก</label>
             <input className="input" value={patient.vn} onChange={e => setPatient({...patient, vn: e.target.value})} placeholder="ห้องพัก" />
           </div>
        </div>

        {/* Row 3: Gender, Age, Religion, Source */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-3">
             <label className="label">เพศ</label>
             <select className="input" value={patient.gender} onChange={e => setPatient({...patient, gender: e.target.value as any})}>
                <option value="Male">ชาย</option><option value="Female">หญิง</option>
             </select>
          </div>
          <div className="col-span-3">
             <label className="label">อายุ (ปี)</label>
             <input className="input" type="number" value={patient.age} onChange={e => setPatient({...patient, age: Number(e.target.value)})} placeholder="อายุ" />
          </div>
          <div className="col-span-3">
             <label className="label">ศาสนา</label>
             <select className="input" value={patient.religion} onChange={e => setPatient({...patient, religion: e.target.value})}>
                <option value="Buddhism">พุทธ</option><option value="Islam">อิสลาม</option><option value="Christianity">คริสต์</option><option value="Other">อื่นๆ</option>
             </select>
          </div>
          <div className="col-span-3">
             <label className="label">ข้อมูลจาก</label>
             <div className="flex gap-3 mt-2">
               {['ผู้ป่วย', 'ญาติ', 'อื่นๆ'].map(s => (
                 <label key={s} className="flex items-center gap-1 text-sm cursor-pointer">
                   <input type="checkbox" checked={form.source.includes(s)} onChange={() => toggleArrayCheckbox('source', s)} /> {s}
                 </label>
               ))}
             </div>
          </div>
        </div>

        {/* Row 4: Anthropometry */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-3">
            <label className="label">น้ำหนักปัจจุบัน (kg)</label>
            <input className="input" type="number" value={form.weight} onChange={e => setForm({...form, weight: Number(e.target.value)})} placeholder="น้ำหนัก" />
          </div>
          <div className="col-span-3">
            <label className="label">น้ำหนักมาตรฐาน (kg)</label>
            <input className="input bg-gray-50" readOnly value={form.ibw} placeholder="IBW" />
          </div>
          <div className="col-span-3">
            <label className="label">ส่วนสูง (cm)</label>
            <input className="input" type="number" value={form.height} onChange={e => setForm({...form, height: Number(e.target.value)})} placeholder="ส่วนสูง" />
          </div>
          <div className="col-span-1">
            <label className="label">BMI</label>
            <input className="input bg-gray-50" readOnly value={form.bmi} />
          </div>
          <div className="col-span-2">
            <label className="label">พลังงาน</label>
            <div className="flex gap-1 items-center">
               <input className="input" type="number" value={form.energyDaily} onChange={e => setForm({...form, energyDaily: Number(e.target.value)})} placeholder="Kcal" />
               <input className="input" type="number" value={form.energyTarget} onChange={e => setForm({...form, energyTarget: Number(e.target.value)})} placeholder="Kcal" />
            </div>
          </div>
        </div>

        {/* Diet History Grid */}
        <div className="grid grid-cols-12 gap-4 mb-4">
           {/* Meals */}
           <div className="col-span-4 space-y-3">
             <Input label="มื้อเช้า" placeholder="เช่น ข้าวต้ม, ขนมปัง" value={form.dietHistory.breakfast} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, breakfast: e.target.value}})} />
             <Input label="มื้อเที่ยง" placeholder="เช่น ข้าวสวย + กับผัก" value={form.dietHistory.lunch} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, lunch: e.target.value}})} />
             <Input label="มื้อเย็น" placeholder="เช่น ต้มจืด" value={form.dietHistory.dinner} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, dinner: e.target.value}})} />
           </div>
           
           {/* Preferences */}
           <div className="col-span-4 space-y-3">
             <Input label="ชอบอาหารประเภท" placeholder="เช่น แป้ง โปรตีน" value={form.dietHistory.preferenceType} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, preferenceType: e.target.value}})} />
             <Input label="ชอบอาหาร" placeholder="ชื่ออาหารที่ชอบ" value={form.dietHistory.preferenceMenu} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, preferenceMenu: e.target.value}})} />
             <Input label="สูบบุหรี่" placeholder="เช่น ไม่สูบ" value={form.dietHistory.smoking} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, smoking: e.target.value}})} />
           </div>

           {/* Snacks */}
           <div className="col-span-4 space-y-3">
             <Input label="อาหารว่าง" placeholder="เช่น ขนมกรุบกริบ" value={form.dietHistory.snack} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, snack: e.target.value}})} />
             <Input label="เครื่องดื่ม" placeholder="เช่น ชา กาแฟ" value={form.dietHistory.drink} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, drink: e.target.value}})} />
             <Input label="อาหารเสริม" placeholder="เช่น วิตามิน" value={form.dietHistory.supplement} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, supplement: e.target.value}})} />
           </div>

           {/* Row 2 Diet */}
           <div className="col-span-4 space-y-3">
             <Input label="แพ้อาหาร" placeholder="เช่น ถั่วลิสง" value={form.dietHistory.allergy} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, allergy: e.target.value}})} />
             <div className="pt-2">
                <label className="label">ทำอาหารทานเอง</label>
                <div className="flex gap-2 mt-1">
                   {['ทำอาหารทานเอง', 'คนอื่นทำ', 'ซื้อ'].map(m => (
                      <label key={m} className="flex items-center gap-1 text-xs cursor-pointer">
                         <input type="checkbox" checked={form.dietHistory.cooking.includes(m)} onChange={() => toggleArrayCheckbox('cooking', m)} /> {m}
                      </label>
                   ))}
                </div>
             </div>
           </div>
           
           <div className="col-span-4 space-y-3">
             <Input label="แอลกอฮอล์" placeholder="เช่น ไม่ดื่ม" value={form.dietHistory.alcohol} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, alcohol: e.target.value}})} />
             <Input label="การออกกำลังกาย" placeholder="เช่น เดิน 30 นาที" value={form.dietHistory.exercise} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, exercise: e.target.value}})} />
           </div>

           <div className="col-span-4 space-y-3">
             <Input label="ไม่ชอบอาหาร" placeholder="เช่น ผักบุ้ง" value={form.dietHistory.dislike} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, dislike: e.target.value}})} />
             <div className="flex gap-2">
                <Input label="อาชีพ" placeholder="เช่น พนักงาน" value={form.dietHistory.occupation} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, occupation: e.target.value}})} containerClass="flex-1" />
                <Input label="การขับถ่าย" placeholder="ปกติ" value={form.dietHistory.excretion} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, excretion: e.target.value}})} containerClass="flex-1" />
             </div>
             <Input label="ยาประจำ" placeholder="เช่น ไม่มียา" value={form.dietHistory.medication} onChange={(e:any) => setForm({...form, dietHistory: {...form.dietHistory, medication: e.target.value}})} />
           </div>
        </div>

        {/* 4. Tabs & Content */}
        <div className="border rounded-lg overflow-hidden mt-6">
           <div className="flex bg-gray-100 border-b overflow-x-auto">
              {[
                { id: 'disease', icon: FileText, label: 'โรค' },
                { id: 'intake', icon: Utensils, label: 'การรับอาหาร' },
                { id: 'status', icon: Activity, label: 'ภาวะโภชนาการ' },
                { id: 'problem', icon: AlertCircle, label: 'ปัญหา' },
                { id: 'plan', icon: List, label: 'Plan' },
                { id: 'recommend', icon: MessageCircle, label: 'แนะนำ' },
                { id: 'followup', icon: Clock, label: 'ติดตาม' },
                { id: 'understanding', icon: Brain, label: 'ความเข้าใจ' }
              ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`
                     flex items-center gap-2 px-4 py-3 text-sm font-medium border-r transition-colors whitespace-nowrap
                     ${activeTab === tab.id ? 'bg-white text-primary border-t-2 border-t-primary' : 'text-gray-600 hover:bg-gray-200'}
                   `}
                 >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                 </button>
              ))}
           </div>
           
           <div className="p-6 bg-white min-h-[150px]">
              {/* Tab: Disease */}
              {activeTab === 'disease' && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['dm', 'ht', 'dlp', 'ckd', 'gout', 'heart', 'stroke', 'bmiRisk', 'critical'].map(d => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer border p-2 rounded hover:bg-gray-50">
                      <input 
                        type="checkbox" 
                        checked={(form.diseases as any)[d]} 
                        onChange={() => setForm({...form, diseases: {...form.diseases, [d]: !(form.diseases as any)[d]}})}
                      />
                      <span className="uppercase text-sm font-semibold">{d === 'bmiRisk' ? 'BMI' : d === 'critical' ? 'Critical Care' : d}</span>
                    </label>
                  ))}
                  <div className="md:col-span-2">
                     <input 
                       className="input w-full" 
                       placeholder="ระบุโรคอื่นๆ" 
                       value={form.diseases.other} 
                       onChange={e => setForm({...form, diseases: {...form.diseases, other: e.target.value}})}
                     />
                  </div>
                </div>
              )}

              {/* Tab: Intake (E Codes) */}
              {activeTab === 'intake' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary mb-2">ภาวะทางโภชนาการ (Nutritional Assessment)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <CheckboxRow label="0-5 คะแนน: มีความเสี่ยงต่อการเกิดภาวะทุพโภชนาการน้อย" checked={form.nutritionStatus.score0_5} onChange={() => setForm({...form, nutritionStatus: {...form.nutritionStatus, score0_5: !form.nutritionStatus.score0_5}})} />
                     <CheckboxRow label="6-10 คะแนน: มีความเสี่ยงปานกลาง ต้องประเมินซ้ำภายใน 48 ชม." checked={form.nutritionStatus.score6_10} onChange={() => setForm({...form, nutritionStatus: {...form.nutritionStatus, score6_10: !form.nutritionStatus.score6_10}})} />
                     <CheckboxRow label=">11 คะแนน: มีความเสี่ยงรุนแรง ต้องประเมินซ้ำภายใน 24 ชม." checked={form.nutritionStatus.scoreGT11} onChange={() => setForm({...form, nutritionStatus: {...form.nutritionStatus, scoreGT11: !form.nutritionStatus.scoreGT11}})} />
                  </div>
                </div>
              )}

              {/* Tab: Nutritional Status (Seems duplicate in UI requirement, merged above, showing Assessment Codes here instead based on standard practice) */}
               {activeTab === 'status' && (
                  <div className="space-y-3">
                     <h3 className="font-semibold text-primary mb-2">รหัสการประเมิน (Assessment Codes)</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['e1', 'e2', 'e3', 'e4', 'e5', 'e6'].map((code, idx) => (
                           <label key={code} className="flex items-center gap-2">
                              <input type="checkbox" checked={(form.assessmentCodes as any)[code]} onChange={() => setForm({...form, assessmentCodes: {...form.assessmentCodes, [code]: !(form.assessmentCodes as any)[code]}})} />
                              <span className="text-sm">E{idx+1} {['Normal', 'NPO', 'Liquid Diet', 'Soft Diet', 'Tube Feeding', 'Parenteral'][idx]}</span>
                           </label>
                        ))}
                     </div>
                  </div>
               )}

              {/* Tab: Problem */}
              {activeTab === 'problem' && (
                 <div className="space-y-2">
                    {['ขาดความเข้าใจเกี่ยวกับการรับประทานอาหาร', 'รับประทานอาหารกลุ่มให้พลังงานสูง', 'รับประทานอาหารไม่หลากหลาย', 'รับประทานอาหารกลุ่มแป้ง/น้ำตาลปริมาณมาก', 'คำแนะนำควบคุมน้ำหนัก', 'รับประทานอาหารแปรรูปมาก', 'อธิบายการอ่านฉลากโภชนาการ'].map((p, i) => (
                       <CheckboxRow key={i} label={p} checked={(form.problems as any)[`p${i+1}`]} onChange={() => setForm({...form, problems: {...form.problems, [`p${i+1}`]: !(form.problems as any)[`p${i+1}`]}})} />
                    ))}
                 </div>
              )}

              {/* Tab: Plan */}
              {activeTab === 'plan' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['ปรับพฤติกรรมการรับประทานอาหาร', 'ลดอาหารกลุ่ม...', 'เพิ่มอาหารกลุ่ม...', 'อธิบายสัดส่วนอาหารและการใช้รายการอาหารแลกเปลี่ยน', 'รับประทานอาหารน้อยลง', 'เคลื่อนไหวร่างกายน้อย', 'แนะนำการดัดแปลงอาหาร', 'แนะนำการเลือกซื้ออาหารนอกบ้าน'].map((p, i) => (
                       <CheckboxRow key={i} label={p} checked={(form.plans as any)[Object.keys(form.plans)[i]]} onChange={() => {
                          const key = Object.keys(form.plans)[i];
                          setForm({...form, plans: {...form.plans, [key]: !(form.plans as any)[key]}});
                       }} />
                    ))}
                 </div>
              )}

              {/* Other Tabs */}
              {activeTab === 'recommend' && (
                 <textarea className="w-full border p-3 rounded h-32 outline-none" placeholder="ระบุคำแนะนำ..." value={form.recommendation} onChange={e => setForm({...form, recommendation: e.target.value})} />
              )}
              {activeTab === 'followup' && (
                 <input className="input w-full" placeholder="ระบุการติดตาม..." value={form.followUp} onChange={e => setForm({...form, followUp: e.target.value})} />
              )}
              {activeTab === 'understanding' && (
                 <div className="space-y-4">
                    <CheckboxRow label="เข้าใจดี คาดว่าจะปฏิบัติตามได้" checked={form.understanding.passed} onChange={() => setForm({...form, understanding: {...form.understanding, passed: !form.understanding.passed}})} />
                    <input className="input w-full" placeholder="รายละเอียดเพิ่มเติม" value={form.understanding.details} onChange={e => setForm({...form, understanding: {...form.understanding, details: e.target.value}})} />
                 </div>
              )}
           </div>
        </div>

        {/* 5. Footer Buttons */}
        <div className="mt-6 flex justify-between items-center">
           <button onClick={handleSave} className="bg-[#1A365D] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2C5282]">
              <Save className="w-4 h-4" /> บันทึกข้อมูล
           </button>
           <button onClick={() => window.print()} className="bg-[#2F855A] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#38A169]">
              <Printer className="w-4 h-4" /> พิมพ์ข้อมูล
           </button>
        </div>

      </div>

      {/* --- PRINT LAYOUT --- */}
      <div className="hidden print:block bg-white p-0 text-xs text-black font-sans leading-tight">
         
         {/* Header */}
         <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
               <div className="w-12 h-12">
                 <img src="https://www.aonanghospital.com/themes/wattanapat2021/images/logo.png" className="w-full object-contain" />
               </div>
               <div>
                  <h1 className="text-base font-bold text-[#1A5C91]">โรงพยาบาลวัฒนแพทย์ อ่าวนาง</h1>
                  <p className="text-[10px] text-gray-600">WATTANAPAT HOSPITAL AO NANG</p>
               </div>
            </div>
            <div className="text-right text-[10px]">
               <p>เอกสารราชการ</p>
               <p>แผนกโภชนาการ โรงพยาบาลวัฒนแพทย์ อ่าวนาง</p>
               <p>555 หมู่ 5 ต.อ่าวนาง อ.เมือง จ.กระบี่ 81180 | โทร. 0-7581-5555</p>
            </div>
         </div>

         <h2 className="text-center font-bold text-lg mb-2 border-b-2 border-gray-800 pb-1">รายงานแบบประเมินภาวะโภชนาการเบื้องต้น Initial Nutritional Assessment</h2>

         {/* Patient Info Table */}
         <table className="w-full border-collapse border border-black mb-2 text-[10px]">
             <tbody>
                <tr>
                   <td className="border border-black p-1 w-20">วันที่บันทึก<br/>{todayFormatted}</td>
                   <td className="border border-black p-1 w-20">เดือน<br/>{form.month}</td>
                   <td className="border border-black p-1 w-20">HN<br/>{patient.hn}</td>
                   <td className="border border-black p-1 w-32">VN/ห้องพัก<br/>{patient.vn}</td>
                   <td className="border border-black p-1" colSpan={2}>บาร์โค้ด HN</td>
                </tr>
                <tr>
                   <td className="border border-black p-1">คำนำหน้า<br/>{patient.prefix}</td>
                   <td className="border border-black p-1">ชื่อ<br/>{patient.firstName}</td>
                   <td className="border border-black p-1">นามสกุล<br/>{patient.lastName}</td>
                   <td className="border border-black p-1">เพศ<br/>{patient.gender}</td>
                   <td className="border border-black p-1" colSpan={2}>BMI<br/>{form.bmi}</td>
                </tr>
                <tr>
                   <td className="border border-black p-1">อายุ<br/>{patient.age}</td>
                   <td className="border border-black p-1">ศาสนา<br/>{patient.religion}</td>
                   <td className="border border-black p-1">น้ำหนัก / kg<br/>{form.weight}</td>
                   <td className="border border-black p-1">ส่วนสูง / cm<br/>{form.height}</td>
                   <td className="border border-black p-1">พลังงาน<br/>{form.energyDaily}</td>
                   <td className="border border-black p-1">Kcal/วัน<br/>{form.energyTarget}</td>
                </tr>
                <tr>
                   <td className="border border-black p-1" colSpan={6}>
                      <span className="font-bold mr-2">ข้อมูลจาก:</span> 
                      {['ผู้ป่วย', 'ญาติ', 'อื่นๆ'].map(s => (
                         <span key={s} className="mr-4 inline-flex items-center">
                            <span className={`w-3 h-3 border border-black mr-1 flex items-center justify-center`}>{form.source.includes(s) && '✓'}</span> {s}
                         </span>
                      ))}
                   </td>
                </tr>
             </tbody>
         </table>

         {/* Understanding */}
         <div className="mb-2">
            <p className="font-bold underline mb-1">การประเมินความเข้าใจผู้ป่วย</p>
            <table className="w-full border-collapse border border-black text-[10px]">
               <thead>
                  <tr>
                     <th className="border border-black p-1 text-left">รายการ</th>
                     <th className="border border-black p-1 w-10 text-center">เลือก</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td className="border border-black p-1">เข้าใจดีคาดว่าจะปฏิบัติตามได้</td>
                     <td className="border border-black p-1 text-center">{form.understanding.passed ? '✓' : ''}</td>
                  </tr>
               </tbody>
            </table>
         </div>

         {/* Diseases */}
         <div className="mb-2">
            <p className="font-bold underline mb-1">ข้อมูลโรคประจำตัว</p>
            <table className="w-full border-collapse border border-black text-[10px] text-center">
               <thead>
                  <tr>
                     <th className="border border-black p-1">DM</th>
                     <th className="border border-black p-1">HT</th>
                     <th className="border border-black p-1">DLP</th>
                     <th className="border border-black p-1">CKD</th>
                     <th className="border border-black p-1">Gout</th>
                     <th className="border border-black p-1">Heart</th>
                     <th className="border border-black p-1">Stroke</th>
                     <th className="border border-black p-1">BMI</th>
                     <th className="border border-black p-1">CriticalCare</th>
                     <th className="border border-black p-1">อื่นๆ</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td className="border border-black p-1">{form.diseases.dm ? '✓' : ''}</td>
                     <td className="border border-black p-1">{form.diseases.ht ? '✓' : ''}</td>
                     <td className="border border-black p-1">{form.diseases.dlp ? '✓' : ''}</td>
                     <td className="border border-black p-1">{form.diseases.ckd ? '✓' : ''}</td>
                     <td className="border border-black p-1">{form.diseases.gout ? '✓' : ''}</td>
                     <td className="border border-black p-1">{form.diseases.heart ? '✓' : ''}</td>
                     <td className="border border-black p-1">{form.diseases.stroke ? '✓' : ''}</td>
                     <td className="border border-black p-1">{form.diseases.bmiRisk ? '✓' : ''}</td>
                     <td className="border border-black p-1">{form.diseases.critical ? '✓' : ''}</td>
                     <td className="border border-black p-1">{form.diseases.other}</td>
                  </tr>
               </tbody>
            </table>
         </div>

         {/* Nutritional Score */}
         <div className="mb-2">
             <p className="font-bold underline mb-1">ภาวะทางโภชนาการ</p>
             <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                   <tr>
                      <th className="border border-black p-1 w-10">เลือก</th>
                      <th className="border border-black p-1 w-20">รายการ</th>
                      <th className="border border-black p-1">รายละเอียด</th>
                   </tr>
                </thead>
                <tbody>
                   <tr>
                      <td className="border border-black p-1 text-center">{form.nutritionStatus.score0_5 ? '✓' : ''}</td>
                      <td className="border border-black p-1">0-5 คะแนน</td>
                      <td className="border border-black p-1">มีความเสี่ยงต่อการเกิดภาวะทุพโภชนาการน้อย</td>
                   </tr>
                   <tr>
                      <td className="border border-black p-1 text-center">{form.nutritionStatus.score6_10 ? '✓' : ''}</td>
                      <td className="border border-black p-1">6-10 คะแนน</td>
                      <td className="border border-black p-1">มีความเสี่ยงต่อการเกิดภาวะทุพโภชนาการปานกลาง ต้องมีการประเมินภาวะทางโภชนาการ ภายใน 48 ชั่วโมง</td>
                   </tr>
                   <tr>
                      <td className="border border-black p-1 text-center">{form.nutritionStatus.scoreGT11 ? '✓' : ''}</td>
                      <td className="border border-black p-1">>11 คะแนน</td>
                      <td className="border border-black p-1">มีความเสี่ยงต่อการเกิดภาวะทุพโภชนาการรุนแรง ต้องมีการประเมินภาวะทางโภชนาการ ภายใน 24 ชั่วโมง</td>
                   </tr>
                </tbody>
             </table>
         </div>

         {/* Diet History Table */}
         <div className="mb-2">
            <p className="font-bold underline mb-1">ประวัติการรับประทานอาหาร</p>
            <table className="w-full border-collapse border border-black text-[10px]">
               <tbody>
                  <tr>
                     <td className="border border-black p-1 font-semibold w-24">มื้อเช้า</td>
                     <td className="border border-black p-1">{form.dietHistory.breakfast}</td>
                     <td className="border border-black p-1 font-semibold w-24">มื้อเที่ยง</td>
                     <td className="border border-black p-1">{form.dietHistory.lunch}</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-1 font-semibold">มื้อเย็น</td>
                     <td className="border border-black p-1">{form.dietHistory.dinner}</td>
                     <td className="border border-black p-1 font-semibold">ชอบอาหาร</td>
                     <td className="border border-black p-1">{form.dietHistory.preferenceMenu}</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-1 font-semibold">อาหารว่าง</td>
                     <td className="border border-black p-1">{form.dietHistory.snack}</td>
                     <td className="border border-black p-1 font-semibold">เครื่องดื่ม</td>
                     <td className="border border-black p-1">{form.dietHistory.drink}</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-1 font-semibold">อาหารเสริม</td>
                     <td className="border border-black p-1">{form.dietHistory.supplement}</td>
                     <td className="border border-black p-1 font-semibold">แพ้อาหาร</td>
                     <td className="border border-black p-1">{form.dietHistory.allergy}</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-1 font-semibold">สูบบุหรี่</td>
                     <td className="border border-black p-1">{form.dietHistory.smoking}</td>
                     <td className="border border-black p-1 font-semibold">แอลกอฮอล์</td>
                     <td className="border border-black p-1">{form.dietHistory.alcohol}</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-1 font-semibold">ปกติ</td>
                     <td className="border border-black p-1">{form.dietHistory.excretion}</td>
                     <td className="border border-black p-1 font-semibold">วิถีชีวิต</td>
                     <td className="border border-black p-1"></td>
                  </tr>
                  <tr>
                     <td className="border border-black p-1 font-semibold">ทำเอง</td>
                     <td className="border border-black p-1">{form.dietHistory.cooking.includes('ทำเอง') ? '✓' : ''}</td>
                     <td className="border border-black p-1 font-semibold">อาชีพ</td>
                     <td className="border border-black p-1">{form.dietHistory.occupation}</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-1 font-semibold">คนอื่น</td>
                     <td className="border border-black p-1">{form.dietHistory.cooking.includes('คนอื่นทำ') ? '✓' : ''}</td>
                     <td className="border border-black p-1 font-semibold">ขับถ่าย</td>
                     <td className="border border-black p-1">{form.dietHistory.excretion}</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-1 font-semibold">ซื้อ</td>
                     <td className="border border-black p-1">{form.dietHistory.cooking.includes('ซื้อ') ? '✓' : ''}</td>
                     <td className="border border-black p-1 font-semibold">ออกกำลังกาย</td>
                     <td className="border border-black p-1">{form.dietHistory.exercise}</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-1 font-semibold"></td>
                     <td className="border border-black p-1"></td>
                     <td className="border border-black p-1 font-semibold">ยา</td>
                     <td className="border border-black p-1">{form.dietHistory.medication}</td>
                  </tr>
               </tbody>
            </table>
         </div>

         {/* Problems & Plan Side by Side */}
         <div className="flex gap-2 mb-4">
             <div className="w-1/2">
                <p className="font-bold underline mb-1">ประเมินปัญหา</p>
                <table className="w-full border-collapse border border-black text-[10px]">
                   <thead>
                      <tr>
                         <th className="border border-black p-1 w-10">เลือก</th>
                         <th className="border border-black p-1">รายการ</th>
                      </tr>
                   </thead>
                   <tbody>
                      {['ขาดความเข้าใจเกี่ยวกับการรับประทานอาหาร', 'รับประทานอาหารกลุ่มให้พลังงานสูง', 'รับประทานอาหารไม่หลากหลาย', 'รับประทานอาหารกลุ่ม(ข้าว,แป้ง,ไขมัน,โปรตีน)ปริมาณมาก', 'คำแนะนำควบคุมน้ำหนัก', 'รับประทานอาหารแปรรูปมาก', 'อธิบายการอ่านฉลากโภชนาการ'].map((p, i) => (
                         <tr key={i}>
                            <td className="border border-black p-1 text-center">{(form.problems as any)[`p${i+1}`] ? '✓' : ''}</td>
                            <td className="border border-black p-1">{p}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             <div className="w-1/2">
                <p className="font-bold underline mb-1">Plan</p>
                <table className="w-full border-collapse border border-black text-[10px]">
                   <thead>
                      <tr>
                         <th className="border border-black p-1 w-10">เลือก</th>
                         <th className="border border-black p-1">รายการ</th>
                      </tr>
                   </thead>
                   <tbody>
                      {['ปรับพฤติกรรมการรับประทานอาหาร', 'ลดอาหารกลุ่ม...', 'เพิ่มอาหารกลุ่ม...', 'อธิบายสัดส่วนอาหารและการใช้รายการอาหารแลกเปลี่ยน', 'รับประทานอาหารน้อยลง', 'เคลื่อนไหวร่างกายน้อย', 'แนะนำการดัดแปลงอาหาร', 'แนะนำการเลือกซื้ออาหารนอกบ้าน'].map((p, i) => (
                         <tr key={i}>
                            <td className="border border-black p-1 text-center">{(form.plans as any)[Object.keys(form.plans)[i]] ? '✓' : ''}</td>
                            <td className="border border-black p-1">{p}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
         </div>

         <div className="border border-black p-2 h-16 mb-4">
            <p className="font-bold">สิ่งที่แนะนำ:</p>
            <p>{form.recommendation}</p>
         </div>

         <div className="flex justify-end mt-8">
            <div className="text-center w-40">
               <div className="border-b border-black border-dotted mb-1"></div>
               <p className="text-[10px]">ลงชื่อ.........................................นักโภชนาการ</p>
            </div>
         </div>
         
         <div className="text-right mt-4 text-[8px] text-gray-500">
            FM-FNT-001 Rev.0 (4 พฤษภาคม 2566)
         </div>

      </div>

    </div>
  );
};

const CheckboxRow: React.FC<{label: string, checked: boolean, onChange: () => void}> = ({ label, checked, onChange }) => (
   <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
      <div className={`w-4 h-4 border rounded flex items-center justify-center ${checked ? 'bg-primary border-primary text-white' : 'border-gray-400'}`}>
         {checked && <CheckSquare className="w-3 h-3" />}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
   </label>
);

const Input: React.FC<any> = ({ label, containerClass, ...props }) => (
   <div className={containerClass}>
     <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
     <input className="input w-full" {...props} />
   </div>
);

export default PatientForm;
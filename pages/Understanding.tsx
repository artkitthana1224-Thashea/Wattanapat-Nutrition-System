import React, { useState } from 'react';
import { Save, Printer, RotateCcw, AlertTriangle, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { DISEASE_QUESTIONS } from '../data/diseaseQuestions';
import { getPatientByHN, saveUnderstandingAssessment } from '../services/mockService';
import { UnderstandingAssessment } from '../types';

const Understanding: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState({
    date: new Date().toISOString().split('T')[0],
    month: 'เลือกเดือน',
    hn: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    room: '',
    otherDiag: '',
    evaluatedFrom: [] as string[]
  });

  const [assessments, setAssessments] = useState<Record<number, { pre: boolean | null, post: boolean | null }>>({});
  const [comments, setComments] = useState('');
  const [signatures, setSignatures] = useState({ preDate: '', preTime: '', postDate: '', postTime: '' });

  const questions = selectedDisease ? (DISEASE_QUESTIONS[selectedDisease] || []) : [];

  const handleAssessmentChange = (idx: number, type: 'pre' | 'post', val: boolean) => {
    setAssessments(prev => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [type]: val
      }
    }));
  };

  const calculateScore = (type: 'pre' | 'post') => {
    if (!questions.length) return 0;
    let score = 0;
    questions.forEach((_, idx) => {
      if (assessments[idx]?.[type] === true) score++;
    });
    return score;
  };

  const preScore = calculateScore('pre');
  const postScore = calculateScore('post');

  const handleHNBlur = async () => {
    if (patientInfo.hn.length > 2) {
      const p = await getPatientByHN(patientInfo.hn);
      if (p) {
        setPatientInfo(prev => ({
          ...prev,
          firstName: p.firstName,
          lastName: p.lastName,
          age: p.age.toString(),
          gender: p.gender,
          room: p.ward || ''
        }));
      }
    }
  };

  const handleSave = async () => {
    if (!patientInfo.hn) {
      Swal.fire('กรุณาระบุ HN', '', 'warning');
      return;
    }
    if (!selectedDisease) {
      Swal.fire('กรุณาเลือกโรคประจำตัว', '', 'warning');
      return;
    }
    
    try {
      const data: UnderstandingAssessment = {
        hn: patientInfo.hn,
        date: patientInfo.date,
        month: patientInfo.month,
        disease: selectedDisease,
        scorePre: preScore,
        scorePost: postScore,
        fullScore: questions.length,
        answers: assessments,
        comments: comments
      };
      await saveUnderstandingAssessment(data);
      Swal.fire('บันทึกข้อมูลสำเร็จ', '', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Save failed', 'error');
    }
  };

  const handleReset = () => {
    setAssessments({});
    setSelectedDisease('');
    setComments('');
    setSignatures({ preDate: '', preTime: '', postDate: '', postTime: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-6">
      
      <div className="flex items-center gap-3 no-print">
         <User className="w-6 h-6 text-[#1A5C91]" />
         <h1 className="text-xl font-display font-bold text-[#1A5C91]">บันทึกการประเมินการรับรู้และเข้าใจ</h1>
      </div>

      <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-r shadow-sm flex items-start gap-3 no-print">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
           <span className="font-bold">คำเตือน!</span> เมื่อกรอกข้อมูลครบถ้วนแล้ว ให้ <span className="font-bold underline">พิมพ์ข้อมูล</span> ก่อน <span className="font-bold underline">บันทึกข้อมูล</span> ทุกครั้ง (หากต้องการ)
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 no-print">
         
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-6">
               <label className="label">วันที่บันทึก</label>
               <input type="date" className="input w-full" value={patientInfo.date} onChange={e => setPatientInfo({...patientInfo, date: e.target.value})} />
            </div>
            <div className="md:col-span-6">
               <label className="label">เดือน</label>
               <select className="input w-full" value={patientInfo.month} onChange={e => setPatientInfo({...patientInfo, month: e.target.value})}>
                  <option>เลือกเดือน</option>
                  {['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'].map(m => <option key={m}>{m}</option>)}
               </select>
            </div>

            <div className="md:col-span-3">
               <label className="label">หมายเลข HN</label>
               <input 
                 className="input w-full" 
                 placeholder="หมายเลข HN" 
                 value={patientInfo.hn} 
                 onChange={e => setPatientInfo({...patientInfo, hn: e.target.value})} 
                 onBlur={handleHNBlur}
               />
            </div>
            <div className="md:col-span-3">
               <label className="label">ชื่อ</label>
               <input className="input w-full bg-gray-50" placeholder="ชื่อ" value={patientInfo.firstName} readOnly />
            </div>
            <div className="md:col-span-3">
               <label className="label">สกุล</label>
               <input className="input w-full bg-gray-50" placeholder="สกุล" value={patientInfo.lastName} readOnly />
            </div>
            <div className="md:col-span-3">
               <label className="label">อายุ</label>
               <input className="input w-full bg-gray-50" placeholder="อายุ" value={patientInfo.age} readOnly />
            </div>

            <div className="md:col-span-3">
               <label className="label">เพศ</label>
               <input className="input w-full bg-gray-50" placeholder="เพศ" value={patientInfo.gender} readOnly />
            </div>
            <div className="md:col-span-3">
               <label className="label">ห้องพัก</label>
               <input className="input w-full bg-gray-50" placeholder="ห้องพัก" value={patientInfo.room} readOnly />
            </div>
            <div className="md:col-span-6">
               <label className="label">Other Diagnostic</label>
               <input className="input w-full" placeholder="Other Diagnostic" value={patientInfo.otherDiag} onChange={e => setPatientInfo({...patientInfo, otherDiag: e.target.value})} />
            </div>

            <div className="md:col-span-12">
               <label className="label">ประเมินจาก</label>
               <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                        type="checkbox" 
                        checked={patientInfo.evaluatedFrom.includes('ผู้ป่วย')}
                        onChange={() => {
                           const newVal = patientInfo.evaluatedFrom.includes('ผู้ป่วย') 
                              ? patientInfo.evaluatedFrom.filter(x => x !== 'ผู้ป่วย')
                              : [...patientInfo.evaluatedFrom, 'ผู้ป่วย'];
                           setPatientInfo({...patientInfo, evaluatedFrom: newVal});
                        }}
                     /> 
                     <span className="text-sm">ผู้ป่วย</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                        type="checkbox" 
                        checked={patientInfo.evaluatedFrom.includes('ญาติ')}
                        onChange={() => {
                           const newVal = patientInfo.evaluatedFrom.includes('ญาติ') 
                              ? patientInfo.evaluatedFrom.filter(x => x !== 'ญาติ')
                              : [...patientInfo.evaluatedFrom, 'ญาติ'];
                           setPatientInfo({...patientInfo, evaluatedFrom: newVal});
                        }}
                     /> 
                     <span className="text-sm">ญาติ</span>
                  </label>
               </div>
            </div>
         </div>

         <div className="mb-6">
            <h3 className="font-semibold text-[#1A5C91] flex items-center gap-2 mb-2">
               <User className="w-5 h-5" /> ข้อมูลโรคประจำตัว
            </h3>
            <select 
               className="w-full p-2 border rounded text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
               value={selectedDisease}
               onChange={e => setSelectedDisease(e.target.value)}
            >
               <option value="">--- กรุณาเลือกโรคประจำตัวเพื่อเริ่มการประเมิน ---</option>
               {Object.keys(DISEASE_QUESTIONS).map(d => (
                  <option key={d} value={d}>{d}</option>
               ))}
            </select>
         </div>

         <div className="mb-6">
            <h3 className="font-semibold text-[#1A5C91] flex items-center gap-2 mb-2">
               <div className="w-5 h-5 bg-[#1A5C91] text-white flex items-center justify-center rounded text-xs">✓</div> 
               บันทึกการประเมิน
            </h3>
            
            <div className="bg-cyan-50 text-cyan-800 p-2 text-xs mb-2 border border-cyan-100 rounded">
               จงระบุเครื่องหมายในช่องที่ได้ทราบจากการสอบถาม และประเมิน ให้ถูกต้องครบถ้วน
            </div>

            <div className="overflow-x-auto border rounded-lg">
               <table className="w-full text-sm">
                  <thead>
                     <tr className="bg-gray-50 border-b">
                        <th rowSpan={2} className="p-2 border-r w-12 text-center">ข้อ</th>
                        <th rowSpan={2} className="p-2 border-r text-left">หัวข้อประเมินพฤติกรรมการบริโภค</th>
                        <th colSpan={2} className="p-2 border-r text-center bg-gray-100">ก่อนให้คำแนะนำ</th>
                        <th colSpan={2} className="p-2 text-center bg-gray-100">หลังให้คำแนะนำ</th>
                     </tr>
                     <tr className="bg-gray-50 border-b text-xs">
                        <th className="p-2 border-r w-24 text-center">ทราบ/<br/>ปฏิบัติได้</th>
                        <th className="p-2 border-r w-24 text-center">ไม่ทราบ/<br/>ไม่ปฏิบัติ</th>
                        <th className="p-2 border-r w-24 text-center">ทราบ/<br/>ปฏิบัติได้</th>
                        <th className="p-2 w-24 text-center">ไม่ทราบ/<br/>ไม่ปฏิบัติ</th>
                     </tr>
                  </thead>
                  <tbody>
                     {questions.length > 0 ? questions.map((q, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                           <td className="p-2 border-r text-center">{idx + 1}</td>
                           <td className="p-2 border-r">{q}</td>
                           <td className="p-2 border-r text-center">
                              <input type="radio" name={`pre-${idx}`} checked={assessments[idx]?.pre === true} onChange={() => handleAssessmentChange(idx, 'pre', true)} />
                           </td>
                           <td className="p-2 border-r text-center">
                              <input type="radio" name={`pre-${idx}`} checked={assessments[idx]?.pre === false} onChange={() => handleAssessmentChange(idx, 'pre', false)} />
                           </td>
                           <td className="p-2 border-r text-center">
                              <input type="radio" name={`post-${idx}`} checked={assessments[idx]?.post === true} onChange={() => handleAssessmentChange(idx, 'post', true)} />
                           </td>
                           <td className="p-2 text-center">
                              <input type="radio" name={`post-${idx}`} checked={assessments[idx]?.post === false} onChange={() => handleAssessmentChange(idx, 'post', false)} />
                           </td>
                        </tr>
                     )) : (
                        <tr>
                           <td colSpan={6} className="p-8 text-center text-gray-400">กรุณาเลือกโรคประจำตัวเพื่อแสดงรายการประเมิน</td>
                        </tr>
                     )}
                     <tr className="bg-gray-50 font-bold text-xs">
                        <td colSpan={2} className="p-2 border-r text-right">รวมคะแนน</td>
                        <td className="p-2 border-r text-center text-green-600">{preScore}</td>
                        <td className="p-2 border-r text-center text-red-500">{questions.length - preScore}</td>
                        <td className="p-2 border-r text-center text-green-600">{postScore}</td>
                        <td className="p-2 text-center text-red-500">{questions.length - postScore}</td>
                     </tr>
                     <tr className="bg-gray-50 font-bold text-xs border-t">
                        <td colSpan={2} className="p-2 border-r text-right">สรุปการประเมิน</td>
                        <td colSpan={2} className="p-2 border-r text-center">
                           {questions.length > 0 && (preScore / questions.length > 0.6 ? 'ผ่าน' : 'ไม่ผ่าน')}
                        </td>
                        <td colSpan={2} className="p-2 text-center">
                           {questions.length > 0 && (postScore / questions.length > 0.6 ? 'ผ่าน' : 'ไม่ผ่าน')}
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
               <h3 className="font-semibold text-[#1A5C91] flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-[#1A5C91] text-white flex items-center justify-center rounded text-xs">💬</div> 
                  บันทึกเพิ่มเติม (ข้อคิดเห็น)
               </h3>
               <textarea 
                  className="w-full border rounded p-3 text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="ระบุข้อคิดเห็น..."
                  value={comments}
                  onChange={e => setComments(e.target.value)}
               ></textarea>
            </div>
            <div>
               <h3 className="font-semibold text-[#1A5C91] flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-[#1A5C91] text-white flex items-center justify-center rounded text-xs">✒️</div> 
                  ลายมือชื่อผู้ประเมิน
               </h3>
               <div className="border rounded p-4 space-y-4">
                  <div className="grid grid-cols-12 gap-2 items-center">
                     <div className="col-span-2 text-xs font-bold text-gray-500">ก่อน</div>
                     <div className="col-span-5">
                        <input className="input w-full text-xs" placeholder="วันที่" value={signatures.preDate} onChange={e => setSignatures({...signatures, preDate: e.target.value})} />
                     </div>
                     <div className="col-span-5">
                        <input className="input w-full text-xs" placeholder="เวลา" value={signatures.preTime} onChange={e => setSignatures({...signatures, preTime: e.target.value})} />
                     </div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center">
                     <div className="col-span-2 text-xs font-bold text-gray-500">หลัง</div>
                     <div className="col-span-5">
                        <input className="input w-full text-xs" placeholder="วันที่" value={signatures.postDate} onChange={e => setSignatures({...signatures, postDate: e.target.value})} />
                     </div>
                     <div className="col-span-5">
                        <input className="input w-full text-xs" placeholder="เวลา" value={signatures.postTime} onChange={e => setSignatures({...signatures, postTime: e.target.value})} />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex justify-between items-center pt-4 border-t">
            <button onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-600 text-sm">
               <RotateCcw className="w-4 h-4" /> ล้างฟอร์ม
            </button>
            <div className="flex gap-2">
               <button onClick={() => window.print()} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 text-sm">
                  <Printer className="w-4 h-4" /> พิมพ์เอกสาร
               </button>
               <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm">
                  <Save className="w-4 h-4" /> บันทึกข้อมูล
               </button>
            </div>
         </div>

      </div>
      
      {/* Print Layout */}
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
                <h2 className="text-sm font-bold">บันทึกการประเมินการรับรู้และเข้าใจ</h2>
                <p className="text-[9px]">แผนกโภชนาการ</p>
             </div>
          </div>

          <div className="grid grid-cols-12 gap-2 mb-4 border p-2 rounded">
              <div className="col-span-6"><span className="font-bold">วันที่:</span> {patientInfo.date}</div>
              <div className="col-span-6"><span className="font-bold">เดือน:</span> {patientInfo.month}</div>
              <div className="col-span-4"><span className="font-bold">HN:</span> {patientInfo.hn}</div>
              <div className="col-span-4"><span className="font-bold">ชื่อ-สกุล:</span> {patientInfo.firstName} {patientInfo.lastName}</div>
              <div className="col-span-2"><span className="font-bold">อายุ:</span> {patientInfo.age}</div>
              <div className="col-span-2"><span className="font-bold">เพศ:</span> {patientInfo.gender}</div>
              <div className="col-span-4"><span className="font-bold">ห้องพัก:</span> {patientInfo.room}</div>
              <div className="col-span-4"><span className="font-bold">ประเมินจาก:</span> {patientInfo.evaluatedFrom.join(', ')}</div>
          </div>

          <div className="mb-2">
             <h3 className="font-bold border-b mb-1">โรคประจำตัว: {selectedDisease}</h3>
          </div>

          <table className="w-full border-collapse border border-black text-[10px] mb-4">
             <thead>
                <tr>
                   <th className="border border-black p-1 w-8 text-center" rowSpan={2}>ข้อ</th>
                   <th className="border border-black p-1 text-left" rowSpan={2}>รายการประเมิน</th>
                   <th className="border border-black p-1 text-center" colSpan={2}>ก่อน</th>
                   <th className="border border-black p-1 text-center" colSpan={2}>หลัง</th>
                </tr>
                <tr>
                   <th className="border border-black p-1 w-10 text-center">ได้</th>
                   <th className="border border-black p-1 w-10 text-center">ไม่ได้</th>
                   <th className="border border-black p-1 w-10 text-center">ได้</th>
                   <th className="border border-black p-1 w-10 text-center">ไม่ได้</th>
                </tr>
             </thead>
             <tbody>
                {questions.map((q, idx) => (
                   <tr key={idx}>
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1">{q}</td>
                      <td className="border border-black p-1 text-center">{assessments[idx]?.pre === true ? '✓' : ''}</td>
                      <td className="border border-black p-1 text-center">{assessments[idx]?.pre === false ? '✓' : ''}</td>
                      <td className="border border-black p-1 text-center">{assessments[idx]?.post === true ? '✓' : ''}</td>
                      <td className="border border-black p-1 text-center">{assessments[idx]?.post === false ? '✓' : ''}</td>
                   </tr>
                ))}
                <tr>
                   <td className="border border-black p-1 text-right font-bold" colSpan={2}>รวมคะแนน</td>
                   <td className="border border-black p-1 text-center">{preScore}</td>
                   <td className="border border-black p-1 text-center">{questions.length - preScore}</td>
                   <td className="border border-black p-1 text-center">{postScore}</td>
                   <td className="border border-black p-1 text-center">{questions.length - postScore}</td>
                </tr>
             </tbody>
          </table>
          
          <div className="border border-black p-2 h-20 mb-4">
             <span className="font-bold">ข้อคิดเห็นเพิ่มเติม:</span>
             <p>{comments}</p>
          </div>
      </div>
    </div>
  );
};

export default Understanding;
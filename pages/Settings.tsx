import React, { useState } from 'react';
import { Save, Database, Copy, RefreshCw, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getCurrentConfig } from '../supabaseClient';

const Settings: React.FC = () => {
  const config = getCurrentConfig();
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);

  const handleSave = () => {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    Swal.fire({
      title: 'บันทึกการตั้งค่าแล้ว',
      text: 'ระบบจะรีโหลดเพื่อเริ่มการเชื่อมต่อใหม่',
      icon: 'success',
    }).then(() => {
      window.location.reload();
    });
  };

  const handleReset = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    window.location.reload();
  };

  const sqlCommand = `
-- 1. Users / Doctors
CREATE TABLE IF NOT EXISTS doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'DOCTOR',
    avatar_url TEXT,
    degree TEXT,
    faculty TEXT,
    major TEXT,
    institute TEXT,
    department TEXT,
    hospital TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Patients
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hn TEXT UNIQUE NOT NULL,
    prefix TEXT,
    first_name TEXT,
    last_name TEXT,
    age INTEGER,
    gender TEXT,
    religion TEXT,
    ward TEXT,
    admit_date DATE,
    diagnosis TEXT,
    weight NUMERIC,
    height NUMERIC,
    bmi NUMERIC,
    diet_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Nutrition Assessments (Comprehensive Form)
CREATE TABLE IF NOT EXISTS nutrition_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hn TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    month TEXT,
    weight NUMERIC,
    height NUMERIC,
    bmi NUMERIC,
    ibw NUMERIC,
    details JSONB, -- Stores the full form structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Nutrition Logs (Food Consumption)
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hn TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    meals JSONB, -- Stores { target:..., breakfast:..., ... }
    total_calories INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Understanding Assessments (Pre/Post Test)
CREATE TABLE IF NOT EXISTS understanding_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hn TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    month TEXT,
    disease TEXT,
    score_pre INTEGER,
    score_post INTEGER,
    full_score INTEGER,
    answers JSONB,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. HN_DB (Imported Legacy Data / Full Record)
CREATE TABLE IF NOT EXISTS "HN_DB" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "record_date" TEXT,      -- วันที่บันทึก (Text because formats vary)
    "month" TEXT,            -- เดือน
    "hn" TEXT,               -- หมายเลข HN
    "prefix" TEXT,           -- คำนำหน้า
    "first_name" TEXT,       -- ชื่อ
    "last_name" TEXT,        -- นามสกุล
    "room" TEXT,             -- ห้องพัก
    "gender" TEXT,           -- เพศ
    "age" INTEGER,           -- อายุ
    "religion" TEXT,         -- ศาสนา
    "current_weight" NUMERIC,-- น้ำหนักปัจจุบัน (kg)
    "ibw" NUMERIC,           -- น้ำหนักมาตรฐาน (kg)
    "height" NUMERIC,        -- ส่วนสูง (cm)
    "bmi" NUMERIC,           -- BMI (Value)
    "energy_daily" TEXT,     -- พลังงาน (Kcal/วัน) (Text to support ranges like 1800-1900)
    "source_info" TEXT,      -- ข้อมูลจาก
    -- Diseases
    "dm" TEXT,
    "ht" TEXT,
    "dlp" TEXT,
    "ckd" TEXT,
    "gout" TEXT,
    "heart" TEXT,
    "stroke" TEXT,
    "bmi_risk" TEXT,         -- BMI (Risk Flag)
    "critical_care" TEXT,    -- Cri
    "other_diseases" TEXT,   -- อื่น (โรคประจำตัว)
    -- Nutrition Score
    "score_0_5" TEXT,
    "score_6_10" TEXT,
    "score_gt_11" TEXT,
    -- Assessment Codes (E)
    "e1" TEXT,
    "e2" TEXT,
    "e3" TEXT,
    "e4" TEXT,
    "e5" TEXT,
    "e6" TEXT,
    "e7" TEXT,
    "e8" TEXT,
    -- Problems (P)
    "p1" TEXT,
    "p2" TEXT,
    "p2_detail" TEXT,
    "p3" TEXT,
    "p3_detail" TEXT,
    "p4" TEXT,
    "p5" TEXT,
    "p6" TEXT,
    "p7" TEXT,
    "p8" TEXT,
    -- Recommendations
    "recommendation" TEXT,   -- (Empty Col 1)
    "follow_up" TEXT,        -- (Empty Col 2)
    -- Diet History
    "breakfast" TEXT,        -- มื้อเช้า
    "lunch" TEXT,            -- มื้อเที่ยง
    "dinner" TEXT,           -- มื้อเย็น
    "preferred_type" TEXT,   -- อาหารที่ชอบประเภท
    "preferred_menu" TEXT,   -- อาหารที่ชอบ
    "smoking" TEXT,          -- สูบบุหรี่
    "snack" TEXT,            -- อาหารว่าง
    "drink" TEXT,            -- เครื่องดื่ม
    "supplement" TEXT,       -- อาหารเสริม
    "dislike" TEXT,          -- อาหารที่ไม่ชอบ
    "allergy" TEXT,          -- แพ้อาหาร
    "alcohol" TEXT,          -- แอลกอฮอล์
    "cooking_self" TEXT,     -- ทำอาหารกินเอง
    "cooking_others" TEXT,   -- คนอื่นทำ
    "cooking_buy" TEXT,      -- ซื้อ
    "occupation" TEXT,       -- อาชีพ
    "excretion" TEXT,        -- การขับถ่าย
    "exercise" TEXT,         -- การออกกำลังกาย
    "medication" TEXT,       -- ยาโรคประจำตัว
    "understanding_level" TEXT, -- การประเมินความเข้าใจของผู้ป่วย
    "understanding_note" TEXT,  -- ความเข้าใจ(อื่นๆ)
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert Default Admin User
INSERT INTO doctors (username, password, full_name, role, hospital)
VALUES ('admin', 'admin', 'Admin User', 'ADMIN', 'Wattanapat Hospital Ao Nang')
ON CONFLICT (username) DO NOTHING;

INSERT INTO doctors (username, password, full_name, role, hospital)
VALUES ('ART', '11111', 'Super Admin ART', 'ADMIN', 'Wattanapat Hospital Ao Nang')
ON CONFLICT (username) DO NOTHING;
  `;

  const copySQL = () => {
    navigator.clipboard.writeText(sqlCommand);
    Swal.fire('คัดลอก SQL แล้ว', 'นำไปวางใน SQL Editor ของ Supabase Dashboard', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gray-800 p-2 rounded-lg">
          <Database className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">ตั้งค่าระบบ (System Settings)</h1>
          <p className="text-sm text-gray-500">จัดการการเชื่อมต่อฐานข้อมูล</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
          <RefreshCw className="w-5 h-5" /> เชื่อมต่อฐานข้อมูล (Supabase Connection)
        </h2>
        
        <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-100 flex gap-3">
           <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
           <p className="text-sm text-yellow-800">
             การตั้งค่านี้จะถูกบันทึกใน Browser เครื่องนี้เท่านั้น หากต้องการเปลี่ยนฐานข้อมูลให้ระบุ Project URL และ API Key ใหม่
           </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Project URL</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Anon Key</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primaryDark shadow-md">
              <Save className="w-4 h-4" /> บันทึกและรีโหลด
            </button>
            <button onClick={handleReset} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
              คืนค่าเริ่มต้น
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
             <Database className="w-5 h-5" /> SQL สำหรับสร้างตาราง (Auto Create Tables)
           </h2>
           <button onClick={copySQL} className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 font-medium">
             <Copy className="w-4 h-4" /> คัดลอก SQL
           </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          นำคำสั่ง SQL ด้านล่างไปรันใน <strong>SQL Editor</strong> บน Dashboard ของ Supabase เพื่อสร้างตารางที่จำเป็นสำหรับระบบนี้
        </p>

        <div className="relative">
          <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-x-auto h-96">
            {sqlCommand}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Settings;
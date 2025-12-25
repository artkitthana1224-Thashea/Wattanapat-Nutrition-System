import { supabase } from '../supabaseClient';
import { Patient, User, Role, NutritionAssessment, NutritionLog, UnderstandingAssessment } from '../types';

// --- MAPPERS ---
const mapUser = (d: any): User => ({
  id: d.id,
  username: d.username,
  fullName: d.full_name,
  role: d.role as Role,
  avatarUrl: d.avatar_url,
  degree: d.degree,
  faculty: d.faculty,
  major: d.major,
  institute: d.institute,
  department: d.department,
  hospital: d.hospital
});

const mapPatient = (p: any): Patient => ({
  id: p.id,
  hn: p.hn,
  prefix: p.prefix,
  firstName: p.first_name,
  lastName: p.last_name,
  age: p.age,
  gender: p.gender,
  religion: p.religion,
  ward: p.ward,
  admitDate: p.admit_date,
  diagnosis: p.diagnosis,
  weight: p.weight,
  height: p.height,
  bmi: p.bmi,
  dietType: p.diet_type
});

// --- AUTH & USERS ---

export const login = async (username: string, password?: string): Promise<User | null> => {
  // Backdoor for development if DB is empty/broken
  if (username === 'ART' && password === '11111') {
    return {
      id: 'super-admin-art', username: 'ART', fullName: 'Super Admin ART', role: Role.ADMIN,
      hospital: 'Wattanapat Hospital Ao Nang', avatarUrl: 'https://ui-avatars.com/api/?name=ART&background=0D8ABC&color=fff&bold=true'
    };
  }

  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('username', username)
    .eq('password', password) // In real app, use hashed passwords!
    .single();

  if (error || !data) return null;
  return mapUser(data);
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await supabase.from('doctors').select('*');
  return data ? data.map(mapUser) : [];
};

// --- PATIENTS ---

export const getPatients = async (): Promise<Patient[]> => {
  const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false }).limit(100);
  return data ? data.map(mapPatient) : [];
};

export const searchPatients = async (query: string): Promise<Patient[]> => {
  if (!query) return [];
  const { data } = await supabase
    .from('patients')
    .select('*')
    .or(`hn.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(10);
  return data ? data.map(mapPatient) : [];
};

export const getPatientByHN = async (hn: string): Promise<Patient | undefined> => {
  const { data } = await supabase.from('patients').select('*').eq('hn', hn).single();
  return data ? mapPatient(data) : undefined;
};

export const savePatient = async (patient: Patient): Promise<void> => {
  const dbPayload = {
    hn: patient.hn,
    prefix: patient.prefix,
    first_name: patient.firstName,
    last_name: patient.lastName,
    age: patient.age,
    gender: patient.gender,
    religion: patient.religion,
    ward: patient.ward,
    admit_date: patient.admitDate,
    diagnosis: patient.diagnosis,
    weight: patient.weight,
    height: patient.height,
    bmi: patient.bmi,
    diet_type: patient.dietType
  };
  // Upsert by HN
  const { error } = await supabase.from('patients').upsert(dbPayload, { onConflict: 'hn' });
  if (error) throw error;
};

// --- NUTRITION ASSESSMENTS ---

export const saveNutritionAssessment = async (assessment: NutritionAssessment): Promise<void> => {
  const payload = {
    hn: assessment.hn,
    date: assessment.date,
    month: assessment.month,
    weight: assessment.weight,
    height: assessment.height,
    bmi: assessment.bmi,
    ibw: assessment.ibw,
    details: assessment // Store the entire object as JSONB for flexibility
  };

  const { error } = await supabase.from('nutrition_assessments').insert([payload]);
  if (error) throw error;

  // Also update patient's latest anthropometry
  await savePatient({
    hn: assessment.hn,
    weight: assessment.weight,
    height: assessment.height,
    bmi: assessment.bmi
  } as any);
};

export const getNutritionAssessments = async (month?: string): Promise<any[]> => {
  let query = supabase.from('nutrition_assessments').select('*, patients(*)');
  if (month) {
    query = query.eq('month', month);
  }
  const { data } = await query.order('date', { ascending: false });
  
  if (!data) return [];

  // Merge JSONB details back for easier consumption in frontend
  return data.map((row: any) => ({
    ...row.details, // Spread JSONB fields
    id: row.id,
    hn: row.hn,
    date: row.date,
    month: row.month,
    patientName: row.patients ? `${row.patients.first_name} ${row.patients.last_name}` : 'Unknown'
  }));
};

// --- NUTRITION LOGS ---

export const saveNutritionLog = async (log: NutritionLog): Promise<void> => {
  const payload = {
    hn: log.hn,
    date: log.date,
    meals: log.meals,
    total_calories: log.totalCalories
  };
  const { error } = await supabase.from('nutrition_logs').insert([payload]);
  if (error) throw error;
};

export const getNutritionLogs = async (hn?: string): Promise<NutritionLog[]> => {
  let query = supabase.from('nutrition_logs').select('*');
  if (hn) {
    query = query.eq('hn', hn);
  }
  const { data } = await query.order('date', { ascending: false });
  return data ? data.map((l: any) => ({
    id: l.id,
    hn: l.hn,
    date: l.date,
    meals: l.meals,
    totalCalories: l.total_calories
  })) : [];
};

// --- UNDERSTANDING ASSESSMENTS ---

export const saveUnderstandingAssessment = async (ua: UnderstandingAssessment): Promise<void> => {
  const payload = {
    hn: ua.hn,
    date: ua.date,
    month: ua.month,
    disease: ua.disease,
    score_pre: ua.scorePre,
    score_post: ua.scorePost,
    full_score: ua.fullScore,
    answers: ua.answers,
    comments: ua.comments
  };
  const { error } = await supabase.from('understanding_assessments').insert([payload]);
  if (error) throw error;
};

export const getUnderstandingAssessments = async (month?: string): Promise<any[]> => {
  let query = supabase.from('understanding_assessments').select('*, patients(*)');
  if (month) {
    query = query.eq('month', month);
  }
  const { data } = await query;
  return data || [];
};

// --- UTILS ---

export const calculateBMI = (weight: number, heightCm: number): number => {
  if (!weight || !heightCm) return 0;
  const h = heightCm / 100;
  return parseFloat((weight / (h * h)).toFixed(2));
};

export const calculateIBW = (heightCm: number, gender: string): number => {
  if (!heightCm) return 0;
  const isMale = gender === 'Male' || gender === 'ชาย';
  return isMale ? heightCm - 100 : heightCm - 105;
};
export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  DOCTOR = 'DOCTOR'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
  degree?: string;
  faculty?: string;
  major?: string;
  institute?: string;
  department?: string;
  hospital?: string;
}

export interface Patient {
  id?: string;
  hn: string;
  vn?: string; 
  prefix: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female';
  religion?: string;
  ward?: string;
  admitDate?: string;
  diagnosis?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  dietType?: string;
}

// Comprehensive Assessment Form
export interface NutritionAssessment {
  id?: string;
  hn: string;
  date: string;
  month?: string;
  vn?: string;
  assessor?: string;
  
  // Anthropometry
  weight: number;
  height: number;
  bmi: number;
  ibw: number; 
  energyDaily: number; 
  energyTarget?: number; 
  source: string[]; 

  diseases: {
    dm: boolean;
    ht: boolean;
    dlp: boolean;
    ckd: boolean;
    gout: boolean;
    heart: boolean;
    stroke: boolean;
    bmiRisk: boolean;
    critical: boolean;
    other: string;
  };

  dietHistory: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
    drink: string;
    supplement: string;
    preferenceType: string;
    preferenceMenu: string;
    dislike: string;
    allergy: string;
    cooking: string[]; 
    alcohol: string;
    smoking: string;
    exercise: string;
    excretion: string;
    sleep: string;
    medication: string;
    occupation: string;
  };
  
  assessmentCodes: {
    e1: boolean;
    e2: boolean;
    e3: boolean;
    e4: boolean;
    e5: boolean;
    e6: boolean;
    [key: string]: boolean;
  };

  nutritionStatus: {
    score0_5: boolean;
    score6_10: boolean;
    scoreGT11: boolean;
  };
  
  problems: {
    p1: boolean; p2: boolean; p3: boolean; p4: boolean; p5: boolean; p6: boolean; p7: boolean;
    [key: string]: boolean;
  };
  
  plans: {
    behavior: boolean; reduce: boolean; increase: boolean; exchange: boolean;
    portion: boolean; mobility: boolean; modification: boolean; shopping: boolean;
    [key: string]: boolean;
  };
  
  recommendation: string;
  followUp: string;
  
  understanding: {
    passed: boolean;
    details: string;
  };
}

export interface NutritionLog {
  id?: string;
  patientId?: string; // Optional if using HN
  hn: string;
  date: string;
  meals: {
    target: FoodRow;
    breakfast: FoodRow;
    lunch: FoodRow;
    snack: FoodRow;
    dinner: FoodRow;
  };
  totalCalories: number;
}

export interface FoodRow {
  rice: number; 
  meat: number; 
  veg: number; 
  fruit: number; 
  milk: number; 
  fat: number; 
  sugar: number; 
}

export interface UnderstandingAssessment {
  id?: string;
  hn: string;
  date: string;
  month: string;
  disease: string;
  scorePre: number;
  scorePost: number;
  fullScore: number;
  answers: Record<number, { pre: boolean | null, post: boolean | null }>;
  comments: string;
  assessorPre?: string;
  assessorPost?: string;
}
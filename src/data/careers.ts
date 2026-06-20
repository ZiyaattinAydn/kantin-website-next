export type CareerDepartmentId = "service" | "kitchen" | "bar" | "cashier";
export type CareerShiftId = "morning" | "evening";

export type CareerShiftOption = {
  id: CareerShiftId;
  label: string;
  hours: string;
};

export type CareerDepartment = {
  id: CareerDepartmentId;
  label: string;
  description: string;
  shifts: CareerShiftOption[];
};

export const careersContactEmail = "hello@kantin.pub";

export const careerBranches = [
  { id: "alsancak", label: "Alsancak" },
  { id: "atakent", label: "Atakent" },
  { id: "either", label: "Fark etmez" },
] as const;

export const careerEmploymentTypes = [
  { id: "full-time", label: "Tam zamanlı" },
  { id: "part-time", label: "Part-time" },
] as const;

export const careerDepartments: CareerDepartment[] = [
  {
    id: "service",
    label: "Servis",
    description: "Misafir akışı, masa düzeni ve hızlı self-servis deneyimi.",
    shifts: [
      { id: "morning", label: "Sabah vardiyası", hours: "09.30–17.30" },
      { id: "evening", label: "Akşam vardiyası", hours: "16.00–00.00" },
    ],
  },
  {
    id: "kitchen",
    label: "Mutfak",
    description: "Hazırlık, üretim ve servis temposunun mutfak tarafı.",
    shifts: [
      { id: "morning", label: "Sabah vardiyası", hours: "09.00–17.00" },
      { id: "evening", label: "Akşam vardiyası", hours: "15.30–23.30" },
    ],
  },
  {
    id: "bar",
    label: "Bar",
    description: "İçecek servisi, düzen ve akşam vardiyasının ritmi.",
    shifts: [
      { id: "evening", label: "Akşam vardiyası", hours: "16.00–00.00" },
    ],
  },
  {
    id: "cashier",
    label: "Kasa",
    description: "Sipariş akışı, ödeme ve misafir karşılama.",
    shifts: [
      { id: "evening", label: "Akşam vardiyası", hours: "16.00–00.00" },
    ],
  },
];

export const careerAvailabilityDays = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
] as const;

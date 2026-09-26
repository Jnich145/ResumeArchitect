export interface ResumeData {
  personalInfo: PersonalInfoData;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  certifications: CertificationItem[];
  memberships: MembershipItem[];
}

export interface PersonalInfoData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  profileImage: string | undefined;
  title: string;
  website: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isPresent: boolean;
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isPresent: boolean;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
}

export interface MembershipItem {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
}

// Shared profile types used by the editor, the AI prompts, and the renderer.

export type ProfileBasics = {
  full_name: string | null;
  email: string | null;
  headline: string | null;
  location: string | null;
  summary: string | null;
  linkedin_url: string | null;
};

export type ProfileExperience = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  description: string | null;
  achievements: string[];
  order_index: number;
};

export type ProfileEducation = {
  id: string;
  school: string;
  degree: string | null;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  order_index: number;
};

export type ProfileSkill = {
  id: string;
  name: string;
  category: string | null;
  level: string | null;
};

export type ProfileLink = {
  id: string;
  label: string;
  url: string;
};

export type FullProfile = {
  basics: ProfileBasics;
  experiences: ProfileExperience[];
  education: ProfileEducation[];
  skills: ProfileSkill[];
  links: ProfileLink[];
};

export function isProfileComplete(p: FullProfile): boolean {
  return (
    !!p.basics.full_name &&
    !!p.basics.email &&
    p.experiences.length > 0 &&
    p.skills.length >= 3
  );
}

export function profileCompleteness(p: FullProfile): number {
  const checks = [
    !!p.basics.full_name,
    !!p.basics.headline,
    !!p.basics.summary,
    p.experiences.length > 0,
    p.education.length > 0,
    p.skills.length >= 3,
    p.links.length > 0,
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export interface SiteInfo {
  name: string;
  role: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  links: {
    github: string;
    linkedin: string;
    portfolio: string;
    playstore: string;
  };
  availability: string;
  resumeUrl: string;
}

export interface HeroContent {
  eyebrow: string;
  roles: string[];
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface StatusStat {
  id: string;
  value: string;
  label: string;
  detail: string;
}

export interface StatusContent {
  label: string;
  stats: StatusStat[];
}

export interface AboutContent {
  heading: string;
  paragraphs: string[];
  focusAreas: string[];
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export interface SkillsContent {
  heading: string;
  groups: SkillGroup[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  current: boolean;
  points: string[];
}

export interface ExperienceContent {
  heading: string;
  items: ExperienceItem[];
}

export interface ProjectItem {
  id: string;
  name: string;
  tag: string;
  description: string;
  stack: string[];
  highlights: string[];
  link: string;
}

export interface ProjectsContent {
  heading: string;
  items: ProjectItem[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
}

export interface CertificationsContent {
  heading: string;
  items: CertificationItem[];
}

export interface LeadershipItem {
  role: string;
  org: string;
  period: string;
  points: string[];
}

export interface LeadershipContent {
  heading: string;
  items: LeadershipItem[];
}

export interface EducationItem {
  degree: string;
  school: string;
  period: string;
}

export interface EducationContent {
  heading: string;
  items: EducationItem[];
}

export interface ContactContent {
  heading: string;
  message: string;
  email: string;
  phone: string;
  location: string;
}

export interface PortfolioContent {
  site: SiteInfo;
  hero: HeroContent;
  status: StatusContent;
  about: AboutContent;
  skills: SkillsContent;
  experience: ExperienceContent;
  projects: ProjectsContent;
  certifications: CertificationsContent;
  leadership: LeadershipContent;
  education: EducationContent;
  contact: ContactContent;
}

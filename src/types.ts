// Filter state types
export type CompanySize = 'small' | 'medium' | 'large' | 'enterprise' | 'faang';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'director' | '';
export type RemoteOption = 'remote' | 'hybrid' | 'onsite' | 'remote-first' | '';
export type TimePosted = 'past-hour' | 'past-24h' | 'past-week' | 'past-month' | 'any';
export type SearchEngine = 'google' | 'duckduckgo';

export interface FilterState {
  role: string;
  languages: string[];
  excludeLanguages: string[];
  location: string;
  industry: string[];
  excludeIndustries: string[];
  companySize: CompanySize[];
  experience: ExperienceLevel[];
  remote: RemoteOption;
  timePosted: TimePosted;
}

// Job board types
export type JobBoardCategory =
  | 'ats'
  | 'major'
  | 'tech-focused'
  | 'niche'
  | 'career-subdomains';

export interface JobBoard {
  id: string;
  name: string;
  category: JobBoardCategory;
  baseUrl: string;
  buildUrl: (filters: FilterState) => string;
  supportsDateSort: boolean;
  supportsRemote: boolean;
  description?: string;
  faviconDomain?: string;
}

export interface GeneratedLink {
  board: JobBoard;
  url: string;
  selected: boolean;
}

// Preset types
export interface Preset {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: number;
  updatedAt: number;
}

export interface PresetExport {
  version: string;
  exportedAt: number;
  presets: Preset[];
}

// Role category definitions
export interface RoleCategory {
  name: string;
  roles: string[];
}

// Filter option definitions
export interface FilterOption {
  value: string;
  label: string;
}

export interface CompanySizeOption extends FilterOption {
  value: CompanySize;
  range: string;
  examples?: string;
}

// URL state for shareable links
export interface UrlState {
  filters: FilterState;
  selectedBoards?: string[];
}

// Storage keys
export const STORAGE_KEYS = {
  PRESETS: 'baansearch_presets',
  LAST_FILTERS: 'baansearch_last_filters',
  SELECTED_BOARDS: 'baansearch_selected_boards',
  THEME: 'baansearch_theme',
  CLICKED_BOARDS: 'baansearch_clicked_boards',
  SEARCH_ENGINE: 'baansearch_search_engine',
} as const;

// Default filter state
export const DEFAULT_FILTER_STATE: FilterState = {
  role: '',
  languages: [],
  excludeLanguages: [],
  location: '',
  industry: [],
  excludeIndustries: [],
  companySize: [],
  experience: [],
  remote: '',
  timePosted: 'any',
};

// Role categories
export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    name: 'Engineering',
    roles: [
      'Software Engineer',
      'Frontend Engineer',
      'Backend Engineer',
      'Full Stack Engineer',
      'DevOps Engineer',
      'SRE',
      'Mobile Engineer',
      'Data Engineer',
      'Security Engineer',
      'Embedded Engineer',
    ],
  },
  {
    name: 'Data & AI',
    roles: [
      'Data Scientist',
      'ML Engineer',
      'Data Analyst',
      'AI Engineer',
      'Research Scientist',
    ],
  },
  {
    name: 'Design',
    roles: [
      'UX Designer',
      'UI Designer',
      'Product Designer',
      'UX Researcher',
    ],
  },
  {
    name: 'Product & Management',
    roles: [
      'Product Manager',
      'Product Owner',
      'Business Analyst',
      'Project Manager',
      'Technical Program Manager',
      'Engineering Manager',
      'Scrum Master',
    ],
  },
  {
    name: 'Other Tech-Adjacent',
    roles: [
      'QA Engineer',
      'DevRel',
      'Solutions Engineer',
      'Technical Writer',
      'Support Engineer',
    ],
  },
];

// Technologies
export const TECHNOLOGIES: FilterOption[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript/TypeScript' },
  { value: 'react', label: 'React' },
  { value: 'react-native', label: 'React Native' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'java', label: 'Java' },
  { value: 'spring', label: 'Spring Boot' },
  { value: 'dotnet', label: '.NET' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C/C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'flutter', label: 'Flutter' },
  { value: 'mobile', label: 'Mobile (iOS/Android)' },
  { value: 'scala', label: 'Scala' },
  { value: 'django', label: 'Django' },
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'docker', label: 'Docker' },
  { value: 'graphql', label: 'GraphQL' },
];

// Keep alias for backwards compatibility
export const PROGRAMMING_LANGUAGES = TECHNOLOGIES;

// Industries
export const INDUSTRIES: FilterOption[] = [
  { value: 'ai-ml', label: 'AI/ML' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'healthtech', label: 'Healthcare Tech' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'saas', label: 'SaaS/B2B' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'climate', label: 'Climate Tech' },
  { value: 'web3', label: 'Blockchain/Web3' },
];

// Company sizes
export const COMPANY_SIZES: CompanySizeOption[] = [
  { value: 'small', label: 'Small', range: '1-50 employees', examples: 'e.g., Basecamp, Fly.io, Render' },
  { value: 'medium', label: 'Medium', range: '51-200 employees', examples: 'e.g., Notion, Figma, Vercel' },
  { value: 'large', label: 'Large', range: '201-1000 employees', examples: 'e.g., Stripe, Datadog, Cloudflare' },
  { value: 'enterprise', label: 'Enterprise', range: '1000+ employees', examples: 'e.g., IBM, Cisco, Oracle' },
  { value: 'faang', label: 'FAANG / Big Tech', range: 'Top tech companies', examples: 'e.g., Google, Apple, Meta, Amazon' },
];

// Experience levels
export const EXPERIENCE_LEVELS: FilterOption[] = [
  { value: 'entry', label: 'Entry Level / Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior / Lead' },
  { value: 'director', label: 'Director / Executive' },
];

// Remote options
export const REMOTE_OPTIONS: FilterOption[] = [
  { value: 'remote', label: 'Fully Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site Only' },
  { value: 'remote-first', label: 'Remote-first Companies' },
];

// Time posted options
export const TIME_POSTED_OPTIONS: FilterOption[] = [
  { value: 'past-hour', label: 'Past Hour' },
  { value: 'past-24h', label: 'Past 24 Hours' },
  { value: 'past-week', label: 'Past Week' },
  { value: 'past-month', label: 'Past Month' },
  { value: 'any', label: 'Any Time' },
];

import type { FilterState } from './types';

// Example preset configurations (not applied by default, but available for reference)
export const EXAMPLE_PRESETS: { name: string; description: string; filters: Partial<FilterState> }[] = [
  {
    name: 'Remote Frontend',
    description: 'Remote frontend engineering positions',
    filters: {
      role: 'Frontend Engineer',
      languages: ['javascript'],
      remote: 'remote',
      timePosted: 'past-week',
    },
  },
  {
    name: 'Senior Backend',
    description: 'Senior backend engineering roles',
    filters: {
      role: 'Backend Engineer',
      experience: 'senior',
      timePosted: 'past-week',
    },
  },
  {
    name: 'ML Engineer',
    description: 'Machine learning engineering positions',
    filters: {
      role: 'ML Engineer',
      languages: ['python'],
      industry: ['ai-ml'],
      timePosted: 'past-week',
    },
  },
  {
    name: 'Startup Jobs',
    description: 'Jobs at early-stage startups',
    filters: {
      companySize: ['small', 'medium'],
      timePosted: 'past-week',
    },
  },
  {
    name: 'Big Tech',
    description: 'FAANG and major tech company positions',
    filters: {
      companySize: ['faang'],
      experience: 'mid',
    },
  },
  {
    name: 'DevOps Remote',
    description: 'Remote DevOps and SRE roles',
    filters: {
      role: 'DevOps Engineer',
      remote: 'remote',
      timePosted: 'past-week',
    },
  },
  {
    name: 'Data Science',
    description: 'Data scientist positions',
    filters: {
      role: 'Data Scientist',
      languages: ['python'],
      timePosted: 'past-week',
    },
  },
  {
    name: 'Climate Tech',
    description: 'Tech jobs at climate-focused companies',
    filters: {
      industry: ['climate'],
      timePosted: 'past-month',
    },
  },
];

// Helper to get full filter state from partial preset
export function applyPresetToFilters(
  preset: Partial<FilterState>,
  base: FilterState
): FilterState {
  return {
    ...base,
    ...preset,
  };
}

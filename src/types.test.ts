import { describe, it, expect } from 'vitest';
import {
  DEFAULT_FILTER_STATE,
  ROLE_CATEGORIES,
  PROGRAMMING_LANGUAGES,
  INDUSTRIES,
  COMPANY_SIZES,
  EXPERIENCE_LEVELS,
  REMOTE_OPTIONS,
  TIME_POSTED_OPTIONS,
  STORAGE_KEYS,
} from './types';

describe('DEFAULT_FILTER_STATE', () => {
  it('should have all required fields', () => {
    expect(DEFAULT_FILTER_STATE).toHaveProperty('role');
    expect(DEFAULT_FILTER_STATE).toHaveProperty('languages');
    expect(DEFAULT_FILTER_STATE).toHaveProperty('excludeLanguages');
    expect(DEFAULT_FILTER_STATE).toHaveProperty('location');
    expect(DEFAULT_FILTER_STATE).toHaveProperty('industry');
    expect(DEFAULT_FILTER_STATE).toHaveProperty('excludeIndustries');
    expect(DEFAULT_FILTER_STATE).toHaveProperty('companySize');
    expect(DEFAULT_FILTER_STATE).toHaveProperty('experience');
    expect(DEFAULT_FILTER_STATE).toHaveProperty('remote');
    expect(DEFAULT_FILTER_STATE).toHaveProperty('timePosted');
  });

  it('should have empty defaults for text fields', () => {
    expect(DEFAULT_FILTER_STATE.role).toBe('');
    expect(DEFAULT_FILTER_STATE.location).toBe('');
    expect(DEFAULT_FILTER_STATE.experience).toEqual([]);
    expect(DEFAULT_FILTER_STATE.remote).toBe('');
  });

  it('should have empty arrays for multi-select fields', () => {
    expect(DEFAULT_FILTER_STATE.languages).toEqual([]);
    expect(DEFAULT_FILTER_STATE.excludeLanguages).toEqual([]);
    expect(DEFAULT_FILTER_STATE.industry).toEqual([]);
    expect(DEFAULT_FILTER_STATE.excludeIndustries).toEqual([]);
    expect(DEFAULT_FILTER_STATE.companySize).toEqual([]);
  });

  it('should default timePosted to "any"', () => {
    expect(DEFAULT_FILTER_STATE.timePosted).toBe('any');
  });
});

describe('ROLE_CATEGORIES', () => {
  it('should have 5 categories', () => {
    expect(ROLE_CATEGORIES).toHaveLength(5);
  });

  it('should have Engineering category with roles', () => {
    const engineering = ROLE_CATEGORIES.find(c => c.name === 'Engineering');
    expect(engineering).toBeDefined();
    expect(engineering!.roles.length).toBeGreaterThan(0);
    expect(engineering!.roles).toContain('Frontend Engineer');
    expect(engineering!.roles).toContain('Backend Engineer');
  });

  it('should have Data & AI category', () => {
    const dataAI = ROLE_CATEGORIES.find(c => c.name === 'Data & AI');
    expect(dataAI).toBeDefined();
    expect(dataAI!.roles).toContain('Data Scientist');
    expect(dataAI!.roles).toContain('ML Engineer');
  });

  it('should have Design category', () => {
    const design = ROLE_CATEGORIES.find(c => c.name === 'Design');
    expect(design).toBeDefined();
    expect(design!.roles).toContain('UX Designer');
    expect(design!.roles).toContain('Product Designer');
  });

  it('should have Product & Management category', () => {
    const pm = ROLE_CATEGORIES.find(c => c.name === 'Product & Management');
    expect(pm).toBeDefined();
    expect(pm!.roles).toContain('Product Manager');
    expect(pm!.roles).toContain('Engineering Manager');
  });

  it('should have unique roles across all categories', () => {
    const allRoles = ROLE_CATEGORIES.flatMap(c => c.roles);
    const uniqueRoles = new Set(allRoles);
    expect(uniqueRoles.size).toBe(allRoles.length);
  });
});

describe('PROGRAMMING_LANGUAGES', () => {
  it('should have at least 10 languages', () => {
    expect(PROGRAMMING_LANGUAGES.length).toBeGreaterThanOrEqual(10);
  });

  it('should have value and label for each language', () => {
    for (const lang of PROGRAMMING_LANGUAGES) {
      expect(lang.value).toBeDefined();
      expect(lang.label).toBeDefined();
      expect(lang.value.length).toBeGreaterThan(0);
      expect(lang.label.length).toBeGreaterThan(0);
    }
  });

  it('should include common languages', () => {
    const values = PROGRAMMING_LANGUAGES.map(l => l.value);
    expect(values).toContain('python');
    expect(values).toContain('javascript');
    expect(values).toContain('java');
    expect(values).toContain('go');
  });

  it('should have unique values', () => {
    const values = PROGRAMMING_LANGUAGES.map(l => l.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});

describe('INDUSTRIES', () => {
  it('should have at least 8 industries', () => {
    expect(INDUSTRIES.length).toBeGreaterThanOrEqual(8);
  });

  it('should include key tech sectors', () => {
    const values = INDUSTRIES.map(i => i.value);
    expect(values).toContain('ai-ml');
    expect(values).toContain('fintech');
    expect(values).toContain('healthtech');
    expect(values).toContain('cybersecurity');
  });
});

describe('COMPANY_SIZES', () => {
  it('should have 5 size options', () => {
    expect(COMPANY_SIZES).toHaveLength(5);
  });

  it('should have value, label, and range for each size', () => {
    for (const size of COMPANY_SIZES) {
      expect(size.value).toBeDefined();
      expect(size.label).toBeDefined();
      expect(size.range).toBeDefined();
    }
  });

  it('should include FAANG option', () => {
    const faang = COMPANY_SIZES.find(s => s.value === 'faang');
    expect(faang).toBeDefined();
    expect(faang!.label).toContain('FAANG');
  });
});

describe('EXPERIENCE_LEVELS', () => {
  it('should have 4 levels', () => {
    expect(EXPERIENCE_LEVELS).toHaveLength(4);
  });

  it('should have entry, mid, senior, and director', () => {
    const values = EXPERIENCE_LEVELS.map(e => e.value);
    expect(values).toContain('entry');
    expect(values).toContain('mid');
    expect(values).toContain('senior');
    expect(values).toContain('director');
  });
});

describe('REMOTE_OPTIONS', () => {
  it('should have 4 options', () => {
    expect(REMOTE_OPTIONS).toHaveLength(4);
  });

  it('should include key remote options', () => {
    const values = REMOTE_OPTIONS.map(r => r.value);
    expect(values).toContain('remote');
    expect(values).toContain('hybrid');
    expect(values).toContain('onsite');
    expect(values).toContain('remote-first');
  });
});

describe('TIME_POSTED_OPTIONS', () => {
  it('should have 5 options', () => {
    expect(TIME_POSTED_OPTIONS).toHaveLength(5);
  });

  it('should have expected time ranges', () => {
    const values = TIME_POSTED_OPTIONS.map(t => t.value);
    expect(values).toContain('past-hour');
    expect(values).toContain('past-24h');
    expect(values).toContain('past-week');
    expect(values).toContain('past-month');
    expect(values).toContain('any');
  });
});

describe('STORAGE_KEYS', () => {
  it('should have all required keys', () => {
    expect(STORAGE_KEYS.PRESETS).toBeDefined();
    expect(STORAGE_KEYS.LAST_FILTERS).toBeDefined();
    expect(STORAGE_KEYS.SELECTED_BOARDS).toBeDefined();
    expect(STORAGE_KEYS.THEME).toBeDefined();
  });

  it('should have unique key values', () => {
    const values = Object.values(STORAGE_KEYS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('should have baansearch prefix', () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      expect(key).toMatch(/^baansearch_/);
    }
  });
});

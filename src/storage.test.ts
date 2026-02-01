import { describe, it, expect, beforeEach } from 'vitest';
import {
  serializeToUrl,
  parseFromUrl,
  exportPresets,
  importPresets,
  getPresets,
  savePreset,
  deletePreset,
  getLastFilters,
  saveLastFilters,
  getSelectedBoards,
  saveSelectedBoards,
  getTheme,
  saveTheme,
} from './storage';
import { DEFAULT_FILTER_STATE, STORAGE_KEYS } from './types';
import type { FilterState, PresetExport } from './types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('URL Serialization', () => {
  describe('serializeToUrl', () => {
    it('should return empty string for default filters', () => {
      const result = serializeToUrl({ filters: DEFAULT_FILTER_STATE });
      expect(result).toBe('');
    });

    it('should serialize role', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Frontend Engineer' };
      const result = serializeToUrl({ filters });
      expect(result).toContain('role=Frontend+Engineer');
    });

    it('should serialize location', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, location: 'San Francisco' };
      const result = serializeToUrl({ filters });
      expect(result).toContain('loc=San+Francisco');
    });

    it('should serialize languages as comma-separated', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, languages: ['python', 'javascript'] };
      const result = serializeToUrl({ filters });
      expect(result).toContain('langs=python%2Cjavascript');
    });

    it('should serialize excluded languages', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, excludeLanguages: ['php', 'ruby'] };
      const result = serializeToUrl({ filters });
      expect(result).toContain('exLangs=php%2Cruby');
    });

    it('should serialize industries', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, industry: ['ai-ml', 'fintech'] };
      const result = serializeToUrl({ filters });
      expect(result).toContain('ind=ai-ml%2Cfintech');
    });

    it('should serialize excluded industries', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, excludeIndustries: ['web3', 'gaming'] };
      const result = serializeToUrl({ filters });
      expect(result).toContain('exInd=web3%2Cgaming');
    });

    it('should serialize company size', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, companySize: ['small', 'medium'] };
      const result = serializeToUrl({ filters });
      expect(result).toContain('size=small%2Cmedium');
    });

    it('should serialize experience level', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, experience: 'senior' };
      const result = serializeToUrl({ filters });
      expect(result).toContain('exp=senior');
    });

    it('should serialize remote option', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, remote: 'remote' };
      const result = serializeToUrl({ filters });
      expect(result).toContain('remote=remote');
    });

    it('should serialize time posted (except "any")', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, timePosted: 'past-week' };
      const result = serializeToUrl({ filters });
      expect(result).toContain('time=past-week');
    });

    it('should not include timePosted when set to "any"', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, timePosted: 'any' };
      const result = serializeToUrl({ filters });
      expect(result).not.toContain('time=');
    });

    it('should serialize selected boards', () => {
      const result = serializeToUrl({
        filters: DEFAULT_FILTER_STATE,
        selectedBoards: ['linkedin', 'indeed'],
      });
      expect(result).toContain('boards=linkedin%2Cindeed');
    });

    it('should handle complex filter combinations', () => {
      const filters: FilterState = {
        role: 'Backend Engineer',
        languages: ['python', 'go'],
        excludeLanguages: [],
        location: 'New York',
        industry: ['fintech'],
        excludeIndustries: [],
        companySize: ['large', 'enterprise'],
        experience: 'mid',
        remote: 'hybrid',
        timePosted: 'past-24h',
      };
      const result = serializeToUrl({ filters, selectedBoards: ['linkedin'] });

      expect(result).toContain('role=Backend+Engineer');
      expect(result).toContain('langs=python%2Cgo');
      expect(result).toContain('loc=New+York');
      expect(result).toContain('ind=fintech');
      expect(result).toContain('size=large%2Centerprise');
      expect(result).toContain('exp=mid');
      expect(result).toContain('remote=hybrid');
      expect(result).toContain('time=past-24h');
      expect(result).toContain('boards=linkedin');
    });
  });

  describe('parseFromUrl', () => {
    it('should return null for empty search', () => {
      expect(parseFromUrl('')).toBeNull();
    });

    it('should return null for search with no relevant params', () => {
      expect(parseFromUrl('?foo=bar&baz=qux')).toBeNull();
    });

    it('should parse role', () => {
      const result = parseFromUrl('?role=Frontend+Engineer');
      expect(result?.filters.role).toBe('Frontend Engineer');
    });

    it('should parse location', () => {
      const result = parseFromUrl('?loc=San+Francisco');
      expect(result?.filters.location).toBe('San Francisco');
    });

    it('should parse languages', () => {
      const result = parseFromUrl('?langs=python,javascript');
      expect(result?.filters.languages).toEqual(['python', 'javascript']);
    });

    it('should parse excluded languages', () => {
      const result = parseFromUrl('?exLangs=php,ruby');
      expect(result?.filters.excludeLanguages).toEqual(['php', 'ruby']);
    });

    it('should parse industries', () => {
      const result = parseFromUrl('?ind=ai-ml,fintech');
      expect(result?.filters.industry).toEqual(['ai-ml', 'fintech']);
    });

    it('should parse excluded industries', () => {
      const result = parseFromUrl('?exInd=web3,gaming');
      expect(result?.filters.excludeIndustries).toEqual(['web3', 'gaming']);
    });

    it('should parse company size', () => {
      const result = parseFromUrl('?size=small,medium');
      expect(result?.filters.companySize).toEqual(['small', 'medium']);
    });

    it('should parse experience', () => {
      const result = parseFromUrl('?exp=senior');
      expect(result?.filters.experience).toBe('senior');
    });

    it('should parse remote option', () => {
      const result = parseFromUrl('?remote=remote');
      expect(result?.filters.remote).toBe('remote');
    });

    it('should parse time posted', () => {
      const result = parseFromUrl('?time=past-week');
      expect(result?.filters.timePosted).toBe('past-week');
    });

    it('should default timePosted to "any" when not provided', () => {
      const result = parseFromUrl('?role=Engineer');
      expect(result?.filters.timePosted).toBe('any');
    });

    it('should parse selected boards', () => {
      const result = parseFromUrl('?boards=linkedin,indeed,glassdoor');
      expect(result?.selectedBoards).toEqual(['linkedin', 'indeed', 'glassdoor']);
    });

    it('should handle empty arrays', () => {
      const result = parseFromUrl('?role=Engineer&langs=');
      expect(result?.filters.languages).toEqual([]);
    });

    it('should round-trip complex filters', () => {
      const original: FilterState = {
        role: 'ML Engineer',
        languages: ['python', 'rust'],
        excludeLanguages: [],
        location: 'Remote',
        industry: ['ai-ml'],
        excludeIndustries: [],
        companySize: ['faang'],
        experience: 'senior',
        remote: 'remote',
        timePosted: 'past-week',
      };
      const boards = ['linkedin', 'wellfound', 'ycombinator'];

      const serialized = serializeToUrl({ filters: original, selectedBoards: boards });
      const parsed = parseFromUrl('?' + serialized);

      expect(parsed?.filters).toEqual(original);
      expect(parsed?.selectedBoards).toEqual(boards);
    });

    it('should round-trip filters with exclusions', () => {
      const original: FilterState = {
        role: 'Frontend Engineer',
        languages: ['javascript', 'typescript'],
        excludeLanguages: ['php', 'ruby'],
        location: 'San Francisco',
        industry: ['saas'],
        excludeIndustries: ['web3', 'gaming'],
        companySize: ['medium', 'large'],
        experience: 'mid',
        remote: 'hybrid',
        timePosted: 'past-24h',
      };
      const boards = ['linkedin', 'indeed'];

      const serialized = serializeToUrl({ filters: original, selectedBoards: boards });
      const parsed = parseFromUrl('?' + serialized);

      expect(parsed?.filters).toEqual(original);
      expect(parsed?.selectedBoards).toEqual(boards);
    });
  });
});

describe('Preset Management', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getPresets', () => {
    it('should return empty array when no presets saved', () => {
      expect(getPresets()).toEqual([]);
    });

    it('should return saved presets', () => {
      const presets = [
        { id: '1', name: 'Test', filters: DEFAULT_FILTER_STATE, createdAt: Date.now(), updatedAt: Date.now() },
      ];
      localStorageMock.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
      expect(getPresets()).toEqual(presets);
    });
  });

  describe('savePreset', () => {
    it('should save a new preset', () => {
      const preset = savePreset('My Preset', DEFAULT_FILTER_STATE);

      expect(preset.id).toBeDefined();
      expect(preset.name).toBe('My Preset');
      expect(preset.filters).toEqual(DEFAULT_FILTER_STATE);
      expect(preset.createdAt).toBeDefined();
      expect(preset.updatedAt).toBeDefined();
    });

    it('should add preset to existing list', () => {
      savePreset('First', DEFAULT_FILTER_STATE);
      savePreset('Second', DEFAULT_FILTER_STATE);

      const presets = getPresets();
      expect(presets).toHaveLength(2);
      expect(presets[0].name).toBe('First');
      expect(presets[1].name).toBe('Second');
    });

    it('should generate unique IDs', () => {
      const preset1 = savePreset('One', DEFAULT_FILTER_STATE);
      const preset2 = savePreset('Two', DEFAULT_FILTER_STATE);

      expect(preset1.id).not.toBe(preset2.id);
    });
  });

  describe('deletePreset', () => {
    it('should delete existing preset', () => {
      const preset = savePreset('To Delete', DEFAULT_FILTER_STATE);
      expect(getPresets()).toHaveLength(1);

      const result = deletePreset(preset.id);

      expect(result).toBe(true);
      expect(getPresets()).toHaveLength(0);
    });

    it('should return false for non-existent preset', () => {
      const result = deletePreset('non-existent-id');
      expect(result).toBe(false);
    });

    it('should only delete the specified preset', () => {
      const preset1 = savePreset('Keep', DEFAULT_FILTER_STATE);
      const preset2 = savePreset('Delete', DEFAULT_FILTER_STATE);

      deletePreset(preset2.id);

      const remaining = getPresets();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(preset1.id);
    });
  });

  describe('exportPresets', () => {
    it('should export all presets', () => {
      savePreset('One', DEFAULT_FILTER_STATE);
      savePreset('Two', DEFAULT_FILTER_STATE);

      const exported = exportPresets();

      expect(exported.version).toBe('1.0');
      expect(exported.exportedAt).toBeDefined();
      expect(exported.presets).toHaveLength(2);
    });

    it('should export specific presets when IDs provided', () => {
      const preset1 = savePreset('One', DEFAULT_FILTER_STATE);
      savePreset('Two', DEFAULT_FILTER_STATE);

      const exported = exportPresets([preset1.id]);

      expect(exported.presets).toHaveLength(1);
      expect(exported.presets[0].name).toBe('One');
    });

    it('should return empty presets array when none exist', () => {
      const exported = exportPresets();
      expect(exported.presets).toEqual([]);
    });
  });

  describe('importPresets', () => {
    it('should import valid presets', () => {
      const data: PresetExport = {
        version: '1.0',
        exportedAt: Date.now(),
        presets: [
          { id: 'imported-1', name: 'Imported', filters: DEFAULT_FILTER_STATE, createdAt: Date.now(), updatedAt: Date.now() },
        ],
      };

      const result = importPresets(data);

      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(getPresets()).toHaveLength(1);
    });

    it('should merge with existing presets by default', () => {
      savePreset('Existing', DEFAULT_FILTER_STATE);

      const data: PresetExport = {
        version: '1.0',
        exportedAt: Date.now(),
        presets: [
          { id: 'imported-1', name: 'Imported', filters: DEFAULT_FILTER_STATE, createdAt: Date.now(), updatedAt: Date.now() },
        ],
      };

      importPresets(data, true);

      expect(getPresets()).toHaveLength(2);
    });

    it('should replace presets when merge is false', () => {
      savePreset('Existing', DEFAULT_FILTER_STATE);

      const data: PresetExport = {
        version: '1.0',
        exportedAt: Date.now(),
        presets: [
          { id: 'imported-1', name: 'Imported', filters: DEFAULT_FILTER_STATE, createdAt: Date.now(), updatedAt: Date.now() },
        ],
      };

      importPresets(data, false);

      const presets = getPresets();
      expect(presets).toHaveLength(1);
      expect(presets[0].name).toBe('Imported');
    });

    it('should reject invalid format', () => {
      const result = importPresets({} as PresetExport);

      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should skip presets with missing required fields', () => {
      const data: PresetExport = {
        version: '1.0',
        exportedAt: Date.now(),
        presets: [
          { id: 'valid', name: 'Valid', filters: DEFAULT_FILTER_STATE, createdAt: Date.now(), updatedAt: Date.now() },
          { id: 'invalid', name: '', filters: DEFAULT_FILTER_STATE, createdAt: Date.now(), updatedAt: Date.now() } as any,
        ],
      };

      const result = importPresets(data);

      expect(result.imported).toBe(1);
    });

    it('should generate new IDs when merging', () => {
      const originalId = 'original-id';
      const data: PresetExport = {
        version: '1.0',
        exportedAt: Date.now(),
        presets: [
          { id: originalId, name: 'Test', filters: DEFAULT_FILTER_STATE, createdAt: Date.now(), updatedAt: Date.now() },
        ],
      };

      importPresets(data, true);

      const presets = getPresets();
      expect(presets[0].id).not.toBe(originalId);
      expect(presets[0].id).toMatch(/^imported_/);
    });
  });
});

describe('Filter Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getLastFilters', () => {
    it('should return default filters when none saved', () => {
      expect(getLastFilters()).toEqual(DEFAULT_FILTER_STATE);
    });

    it('should return saved filters', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Test Role' };
      localStorageMock.setItem(STORAGE_KEYS.LAST_FILTERS, JSON.stringify(filters));

      expect(getLastFilters()).toEqual(filters);
    });
  });

  describe('saveLastFilters', () => {
    it('should save filters to localStorage', () => {
      const filters: FilterState = { ...DEFAULT_FILTER_STATE, location: 'NYC' };
      saveLastFilters(filters);

      expect(getLastFilters()).toEqual(filters);
    });
  });
});

describe('Board Selection Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getSelectedBoards', () => {
    it('should return empty array when none saved', () => {
      expect(getSelectedBoards()).toEqual([]);
    });

    it('should return saved board IDs', () => {
      const boards = ['linkedin', 'indeed'];
      localStorageMock.setItem(STORAGE_KEYS.SELECTED_BOARDS, JSON.stringify(boards));

      expect(getSelectedBoards()).toEqual(boards);
    });
  });

  describe('saveSelectedBoards', () => {
    it('should save board IDs', () => {
      const boards = ['greenhouse', 'lever', 'ashby'];
      saveSelectedBoards(boards);

      expect(getSelectedBoards()).toEqual(boards);
    });
  });
});

describe('Theme Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getTheme', () => {
    it('should return "system" by default', () => {
      expect(getTheme()).toBe('system');
    });

    it('should return saved theme', () => {
      localStorageMock.setItem(STORAGE_KEYS.THEME, JSON.stringify('dark'));
      expect(getTheme()).toBe('dark');
    });
  });

  describe('saveTheme', () => {
    it('should save theme preference', () => {
      saveTheme('light');
      expect(getTheme()).toBe('light');

      saveTheme('dark');
      expect(getTheme()).toBe('dark');
    });
  });
});

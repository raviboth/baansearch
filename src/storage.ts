import type { FilterState, Preset, PresetExport, UrlState, SearchEngine } from './types';
import { STORAGE_KEYS, DEFAULT_FILTER_STATE } from './types';

// LocalStorage helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Preset management
export function getPresets(): Preset[] {
  return getItem<Preset[]>(STORAGE_KEYS.PRESETS, []);
}

export function savePreset(name: string, filters: FilterState): Preset {
  const presets = getPresets();
  const now = Date.now();
  const preset: Preset = {
    id: `preset_${now}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    filters,
    createdAt: now,
    updatedAt: now,
  };
  presets.push(preset);
  setItem(STORAGE_KEYS.PRESETS, presets);
  return preset;
}

export function updatePreset(id: string, updates: Partial<Pick<Preset, 'name' | 'filters'>>): Preset | null {
  const presets = getPresets();
  const index = presets.findIndex(p => p.id === id);
  if (index === -1) return null;

  presets[index] = {
    ...presets[index],
    ...updates,
    updatedAt: Date.now(),
  };
  setItem(STORAGE_KEYS.PRESETS, presets);
  return presets[index];
}

export function deletePreset(id: string): boolean {
  const presets = getPresets();
  const filtered = presets.filter(p => p.id !== id);
  if (filtered.length === presets.length) return false;
  setItem(STORAGE_KEYS.PRESETS, filtered);
  return true;
}

export function getPresetById(id: string): Preset | undefined {
  return getPresets().find(p => p.id === id);
}

// Export presets to JSON
export function exportPresets(presetIds?: string[]): PresetExport {
  let presets = getPresets();
  if (presetIds && presetIds.length > 0) {
    presets = presets.filter(p => presetIds.includes(p.id));
  }
  return {
    version: '1.0',
    exportedAt: Date.now(),
    presets,
  };
}

// Import presets from JSON
export function importPresets(data: PresetExport, merge = true): { imported: number; errors: string[] } {
  const errors: string[] = [];

  // Validate structure
  if (!data.version || !Array.isArray(data.presets)) {
    errors.push('Invalid preset file format');
    return { imported: 0, errors };
  }

  const validPresets: Preset[] = [];
  for (const preset of data.presets) {
    if (!preset.id || !preset.name || !preset.filters) {
      errors.push(`Invalid preset: missing required fields`);
      continue;
    }

    // Validate filters structure
    if (typeof preset.filters !== 'object') {
      errors.push(`Invalid preset "${preset.name}": invalid filters`);
      continue;
    }

    // Ensure all filter fields exist with defaults
    const normalizedFilters: FilterState = {
      role: preset.filters.role || '',
      languages: Array.isArray(preset.filters.languages) ? preset.filters.languages : [],
      excludeLanguages: Array.isArray(preset.filters.excludeLanguages) ? preset.filters.excludeLanguages : [],
      location: preset.filters.location || '',
      industry: Array.isArray(preset.filters.industry) ? preset.filters.industry : [],
      excludeIndustries: Array.isArray(preset.filters.excludeIndustries) ? preset.filters.excludeIndustries : [],
      companySize: Array.isArray(preset.filters.companySize) ? preset.filters.companySize : [],
      experience: Array.isArray(preset.filters.experience) ? preset.filters.experience : (preset.filters.experience ? [preset.filters.experience] : []),
      remote: preset.filters.remote || '',
      timePosted: preset.filters.timePosted || 'any',
    };

    validPresets.push({
      ...preset,
      filters: normalizedFilters,
      id: merge ? `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : preset.id,
    });
  }

  if (validPresets.length === 0) {
    return { imported: 0, errors };
  }

  if (merge) {
    const existing = getPresets();
    setItem(STORAGE_KEYS.PRESETS, [...existing, ...validPresets]);
  } else {
    setItem(STORAGE_KEYS.PRESETS, validPresets);
  }

  return { imported: validPresets.length, errors };
}

// Last used filters
export function getLastFilters(): FilterState {
  const saved = getItem<Partial<FilterState>>(STORAGE_KEYS.LAST_FILTERS, {});
  // Merge with defaults to ensure all fields exist (handles old saved data)
  return {
    ...DEFAULT_FILTER_STATE,
    ...saved,
    // Ensure arrays exist even if saved data is old
    languages: saved.languages || [],
    excludeLanguages: saved.excludeLanguages || [],
    industry: saved.industry || [],
    excludeIndustries: saved.excludeIndustries || [],
    companySize: saved.companySize || [],
    experience: Array.isArray(saved.experience) ? saved.experience : (saved.experience ? [saved.experience] : []),
  };
}

export function saveLastFilters(filters: FilterState): void {
  setItem(STORAGE_KEYS.LAST_FILTERS, filters);
}

// Selected boards
export function getSelectedBoards(): string[] {
  return getItem<string[]>(STORAGE_KEYS.SELECTED_BOARDS, []);
}

export function saveSelectedBoards(boardIds: string[]): void {
  setItem(STORAGE_KEYS.SELECTED_BOARDS, boardIds);
}

// Theme
export function getTheme(): 'light' | 'dark' | 'system' {
  return getItem<'light' | 'dark' | 'system'>(STORAGE_KEYS.THEME, 'system');
}

export function saveTheme(theme: 'light' | 'dark' | 'system'): void {
  setItem(STORAGE_KEYS.THEME, theme);
}

// Clicked boards tracking
export function getClickedBoards(): Set<string> {
  return new Set(getItem<string[]>(STORAGE_KEYS.CLICKED_BOARDS, []));
}

export function saveClickedBoards(boardIds: Set<string>): void {
  setItem(STORAGE_KEYS.CLICKED_BOARDS, Array.from(boardIds));
}

export function clearClickedBoards(): void {
  setItem(STORAGE_KEYS.CLICKED_BOARDS, []);
}

// Search engine preference
export function getSearchEngine(): SearchEngine {
  return getItem<SearchEngine>(STORAGE_KEYS.SEARCH_ENGINE, 'google');
}

export function saveSearchEngine(engine: SearchEngine): void {
  setItem(STORAGE_KEYS.SEARCH_ENGINE, engine);
}

// URL state serialization for shareable links
export function serializeToUrl(state: UrlState): string {
  const params = new URLSearchParams();

  if (state.filters.role) {
    params.set('role', state.filters.role);
  }
  if (state.filters.languages.length > 0) {
    params.set('langs', state.filters.languages.join(','));
  }
  if (state.filters.excludeLanguages.length > 0) {
    params.set('exLangs', state.filters.excludeLanguages.join(','));
  }
  if (state.filters.location) {
    params.set('loc', state.filters.location);
  }
  if (state.filters.industry.length > 0) {
    params.set('ind', state.filters.industry.join(','));
  }
  if (state.filters.excludeIndustries.length > 0) {
    params.set('exInd', state.filters.excludeIndustries.join(','));
  }
  if (state.filters.companySize.length > 0) {
    params.set('size', state.filters.companySize.join(','));
  }
  if (state.filters.experience.length > 0) {
    params.set('exp', state.filters.experience.join(','));
  }
  if (state.filters.remote) {
    params.set('remote', state.filters.remote);
  }
  if (state.filters.timePosted && state.filters.timePosted !== 'any') {
    params.set('time', state.filters.timePosted);
  }
  if (state.selectedBoards && state.selectedBoards.length > 0) {
    params.set('boards', state.selectedBoards.join(','));
  }

  return params.toString();
}

export function parseFromUrl(search: string): UrlState | null {
  if (!search) return null;

  const params = new URLSearchParams(search);

  // Check if any relevant params exist
  const hasParams = ['role', 'langs', 'exLangs', 'loc', 'ind', 'exInd', 'size', 'exp', 'remote', 'time', 'boards']
    .some(key => params.has(key));

  if (!hasParams) return null;

  const filters: FilterState = {
    role: params.get('role') || '',
    languages: params.get('langs')?.split(',').filter(Boolean) || [],
    excludeLanguages: params.get('exLangs')?.split(',').filter(Boolean) || [],
    location: params.get('loc') || '',
    industry: params.get('ind')?.split(',').filter(Boolean) || [],
    excludeIndustries: params.get('exInd')?.split(',').filter(Boolean) || [],
    companySize: (params.get('size')?.split(',').filter(Boolean) || []) as FilterState['companySize'],
    experience: (params.get('exp')?.split(',').filter(Boolean) || []) as FilterState['experience'],
    remote: (params.get('remote') || '') as FilterState['remote'],
    timePosted: (params.get('time') || 'any') as FilterState['timePosted'],
  };

  const selectedBoards = params.get('boards')?.split(',').filter(Boolean);

  return { filters, selectedBoards };
}

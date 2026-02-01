import type { FilterState, CompanySize, ExperienceLevel, RemoteOption, TimePosted } from './types';
import {
  DEFAULT_FILTER_STATE,
  ROLE_CATEGORIES,
  TECHNOLOGIES,
  INDUSTRIES,
  COMPANY_SIZES,
  EXPERIENCE_LEVELS,
  REMOTE_OPTIONS,
  TIME_POSTED_OPTIONS,
} from './types';
import { JOB_BOARDS, BOARD_CATEGORIES, getBoardsByCategory } from './jobboards';
import { cycleCheckboxState, updateTristateCheckbox } from './tristate';
import {
  getPresets,
  savePreset,
  deletePreset,
  exportPresets,
  importPresets,
  getLastFilters,
  saveLastFilters,
  getSelectedBoards,
  saveSelectedBoards,
  getTheme,
  saveTheme,
  serializeToUrl,
  parseFromUrl,
} from './storage';

import type { CheckboxState } from './tristate';

// App state
export let currentFilters: FilterState = { ...DEFAULT_FILTER_STATE };
let selectedBoardIds: Set<string> = new Set();
let generatedUrls: Map<string, string> = new Map();

// Tri-state tracking for languages and industries
export let languageStates: Map<string, CheckboxState> = new Map();
export let industryStates: Map<string, CheckboxState> = new Map();

// DOM Elements
let roleSelect: HTMLSelectElement;
let locationInput: HTMLInputElement;
let languageCheckboxes: HTMLInputElement[];
let industryCheckboxes: HTMLInputElement[];
let companySizeCheckboxes: HTMLInputElement[];
let experienceRadios: HTMLInputElement[];
let remoteRadios: HTMLInputElement[];
let timePostedSelect: HTMLSelectElement;
let resultsContainer: HTMLElement;
let presetSelect: HTMLSelectElement;
let presetNameInput: HTMLInputElement;
let boardCategoryCheckboxes: Map<string, HTMLInputElement[]> = new Map();
let statusRegion: HTMLElement;

// Initialize the application
function init(): void {
  // Check for URL state first
  const urlState = parseFromUrl(window.location.search);
  if (urlState) {
    currentFilters = urlState.filters;
    if (urlState.selectedBoards) {
      selectedBoardIds = new Set(urlState.selectedBoards);
    }
  } else {
    // Load last used filters
    currentFilters = getLastFilters();
    const savedBoards = getSelectedBoards();
    selectedBoardIds = new Set(savedBoards);
  }

  // Initialize theme
  initTheme();

  // Build the UI
  buildFilterUI();
  buildBoardSelectionUI();
  buildPresetUI();

  // Populate filters from state
  populateFiltersFromState();

  // Generate initial results
  generateResults();

  // Set up event listeners
  setupEventListeners();

  // Clear URL params after loading (optional - keeps URL clean)
  if (urlState) {
    history.replaceState(null, '', window.location.pathname);
  }
}

function initTheme(): void {
  const theme = getTheme();
  applyTheme(theme);

  // Set up theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = getTheme();
      const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
      saveTheme(next);
      applyTheme(next);
      updateThemeButton(next);
    });
    updateThemeButton(theme);
  }
}

function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

function updateThemeButton(theme: 'light' | 'dark' | 'system'): void {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const icons = { light: '☀️', dark: '🌙', system: '💻' };
    const labels = { light: 'Light', dark: 'Dark', system: 'System' };
    const iconEl = themeToggle.querySelector('.theme-icon');
    const textEl = themeToggle.querySelector('.theme-text');
    if (iconEl) iconEl.textContent = icons[theme];
    if (textEl) textEl.textContent = labels[theme];
    themeToggle.setAttribute('aria-label', `Current: ${labels[theme]} theme. Click to change.`);
  }
}

function buildFilterUI(): void {
  // Role select
  roleSelect = document.getElementById('role-select') as HTMLSelectElement;
  roleSelect.innerHTML = '<option value="">Select a role...</option>';
  for (const category of ROLE_CATEGORIES) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category.name;
    for (const role of category.roles) {
      const option = document.createElement('option');
      option.value = role;
      option.textContent = role;
      optgroup.appendChild(option);
    }
    roleSelect.appendChild(optgroup);
  }

  // Location input
  locationInput = document.getElementById('location-input') as HTMLInputElement;

  // Technologies (tri-state checkboxes)
  const languagesContainer = document.getElementById('languages-container') as HTMLElement;
  languagesContainer.innerHTML = '';
  languageCheckboxes = [];
  for (const lang of TECHNOLOGIES) {
    const label = document.createElement('label');
    label.className = 'checkbox-label tristate-label';
    label.setAttribute('data-state', 'none');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'language';
    checkbox.value = lang.value;
    checkbox.id = `lang-${lang.value}`;
    checkbox.className = 'tristate-checkbox';
    label.appendChild(checkbox);
    const textSpan = document.createElement('span');
    textSpan.className = 'tristate-text';
    textSpan.textContent = ` ${lang.label}`;
    label.appendChild(textSpan);
    languagesContainer.appendChild(label);
    languageCheckboxes.push(checkbox);
    languageStates.set(lang.value, 'none');
  }

  // Industries (tri-state checkboxes)
  const industriesContainer = document.getElementById('industries-container') as HTMLElement;
  industriesContainer.innerHTML = '';
  industryCheckboxes = [];
  for (const ind of INDUSTRIES) {
    const label = document.createElement('label');
    label.className = 'checkbox-label tristate-label';
    label.setAttribute('data-state', 'none');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'industry';
    checkbox.value = ind.value;
    checkbox.id = `ind-${ind.value}`;
    checkbox.className = 'tristate-checkbox';
    label.appendChild(checkbox);
    const textSpan = document.createElement('span');
    textSpan.className = 'tristate-text';
    textSpan.textContent = ` ${ind.label}`;
    label.appendChild(textSpan);
    industriesContainer.appendChild(label);
    industryCheckboxes.push(checkbox);
    industryStates.set(ind.value, 'none');
  }

  // Company size
  const companySizeContainer = document.getElementById('company-size-container') as HTMLElement;
  companySizeContainer.innerHTML = '';
  companySizeCheckboxes = [];
  for (const size of COMPANY_SIZES) {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.title = size.range;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'companySize';
    checkbox.value = size.value;
    checkbox.id = `size-${size.value}`;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${size.label}`));
    companySizeContainer.appendChild(label);
    companySizeCheckboxes.push(checkbox);
  }

  // Experience level
  const experienceContainer = document.getElementById('experience-container') as HTMLElement;
  experienceContainer.innerHTML = '';
  experienceRadios = [];
  // Add "Any" option
  const anyLabel = document.createElement('label');
  anyLabel.className = 'radio-label';
  const anyRadio = document.createElement('input');
  anyRadio.type = 'radio';
  anyRadio.name = 'experience';
  anyRadio.value = '';
  anyRadio.id = 'exp-any';
  anyRadio.checked = true;
  anyLabel.appendChild(anyRadio);
  anyLabel.appendChild(document.createTextNode(' Any'));
  experienceContainer.appendChild(anyLabel);
  experienceRadios.push(anyRadio);

  for (const exp of EXPERIENCE_LEVELS) {
    const label = document.createElement('label');
    label.className = 'radio-label';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'experience';
    radio.value = exp.value;
    radio.id = `exp-${exp.value}`;
    label.appendChild(radio);
    label.appendChild(document.createTextNode(` ${exp.label}`));
    experienceContainer.appendChild(label);
    experienceRadios.push(radio);
  }

  // Remote options
  const remoteContainer = document.getElementById('remote-container') as HTMLElement;
  remoteContainer.innerHTML = '';
  remoteRadios = [];
  // Add "Any" option
  const anyRemoteLabel = document.createElement('label');
  anyRemoteLabel.className = 'radio-label';
  const anyRemoteRadio = document.createElement('input');
  anyRemoteRadio.type = 'radio';
  anyRemoteRadio.name = 'remote';
  anyRemoteRadio.value = '';
  anyRemoteRadio.id = 'remote-any';
  anyRemoteRadio.checked = true;
  anyRemoteLabel.appendChild(anyRemoteRadio);
  anyRemoteLabel.appendChild(document.createTextNode(' Any'));
  remoteContainer.appendChild(anyRemoteLabel);
  remoteRadios.push(anyRemoteRadio);

  for (const remote of REMOTE_OPTIONS) {
    const label = document.createElement('label');
    label.className = 'radio-label';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'remote';
    radio.value = remote.value;
    radio.id = `remote-${remote.value}`;
    label.appendChild(radio);
    label.appendChild(document.createTextNode(` ${remote.label}`));
    remoteContainer.appendChild(label);
    remoteRadios.push(radio);
  }

  // Time posted
  timePostedSelect = document.getElementById('time-posted-select') as HTMLSelectElement;
  timePostedSelect.innerHTML = '';
  for (const time of TIME_POSTED_OPTIONS) {
    const option = document.createElement('option');
    option.value = time.value;
    option.textContent = time.label;
    timePostedSelect.appendChild(option);
  }

  // Status region for screen readers
  statusRegion = document.getElementById('status-region') as HTMLElement;
}

function buildBoardSelectionUI(): void {
  const boardsContainer = document.getElementById('boards-container') as HTMLElement;
  boardsContainer.innerHTML = '';

  for (const category of BOARD_CATEGORIES) {
    const categorySection = document.createElement('div');
    categorySection.className = 'board-category';

    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'board-category-header';

    const categoryLabel = document.createElement('label');
    categoryLabel.className = 'checkbox-label category-toggle';
    const categoryCheckbox = document.createElement('input');
    categoryCheckbox.type = 'checkbox';
    categoryCheckbox.id = `category-${category.value}`;
    categoryCheckbox.setAttribute('data-category', category.value);
    categoryLabel.appendChild(categoryCheckbox);
    categoryLabel.appendChild(document.createTextNode(` ${category.label}`));
    categoryHeader.appendChild(categoryLabel);

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'category-expand-btn';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', `boards-${category.value}`);
    toggleBtn.textContent = '▶';
    categoryHeader.appendChild(toggleBtn);

    categorySection.appendChild(categoryHeader);

    const boardsList = document.createElement('div');
    boardsList.className = 'boards-list collapsed';
    boardsList.id = `boards-${category.value}`;

    const boards = getBoardsByCategory(category.value);
    const checkboxes: HTMLInputElement[] = [];

    for (const board of boards) {
      const label = document.createElement('label');
      label.className = 'checkbox-label board-checkbox';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'board';
      checkbox.value = board.id;
      checkbox.id = `board-${board.id}`;
      checkbox.checked = selectedBoardIds.has(board.id);
      label.appendChild(checkbox);
      const nameSpan = document.createElement('span');
      nameSpan.className = 'board-name';
      nameSpan.textContent = ` ${board.name}`;
      label.appendChild(nameSpan);
      if (board.description) {
        label.title = board.description;
      }
      boardsList.appendChild(label);
      checkboxes.push(checkbox);
    }

    boardCategoryCheckboxes.set(category.value, checkboxes);
    categorySection.appendChild(boardsList);
    boardsContainer.appendChild(categorySection);

    // Toggle expand/collapse
    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      toggleBtn.textContent = expanded ? '▶' : '▼';
      boardsList.classList.toggle('collapsed', expanded);
    });

    // Category checkbox toggles all boards in category
    categoryCheckbox.addEventListener('change', () => {
      for (const cb of checkboxes) {
        cb.checked = categoryCheckbox.checked;
        if (categoryCheckbox.checked) {
          selectedBoardIds.add(cb.value);
        } else {
          selectedBoardIds.delete(cb.value);
        }
      }
      saveSelectedBoards(Array.from(selectedBoardIds));
      generateResults();
    });

    // Individual board checkboxes
    for (const cb of checkboxes) {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          selectedBoardIds.add(cb.value);
        } else {
          selectedBoardIds.delete(cb.value);
        }
        // Update category checkbox state
        const allChecked = checkboxes.every(c => c.checked);
        const someChecked = checkboxes.some(c => c.checked);
        categoryCheckbox.checked = allChecked;
        categoryCheckbox.indeterminate = someChecked && !allChecked;
        saveSelectedBoards(Array.from(selectedBoardIds));
        generateResults();
      });
    }

    // Update initial category checkbox state
    const allChecked = checkboxes.every(c => c.checked);
    const someChecked = checkboxes.some(c => c.checked);
    categoryCheckbox.checked = allChecked;
    categoryCheckbox.indeterminate = someChecked && !allChecked;
  }

  // Select/Deselect all buttons
  const selectAllBtn = document.getElementById('select-all-boards') as HTMLButtonElement;
  const deselectAllBtn = document.getElementById('deselect-all-boards') as HTMLButtonElement;

  selectAllBtn?.addEventListener('click', () => {
    for (const board of JOB_BOARDS) {
      selectedBoardIds.add(board.id);
    }
    updateAllBoardCheckboxes();
    saveSelectedBoards(Array.from(selectedBoardIds));
    generateResults();
  });

  deselectAllBtn?.addEventListener('click', () => {
    selectedBoardIds.clear();
    updateAllBoardCheckboxes();
    saveSelectedBoards(Array.from(selectedBoardIds));
    generateResults();
  });
}

function updateAllBoardCheckboxes(): void {
  for (const [categoryValue, checkboxes] of boardCategoryCheckboxes) {
    const categoryCheckbox = document.getElementById(`category-${categoryValue}`) as HTMLInputElement;
    for (const cb of checkboxes) {
      cb.checked = selectedBoardIds.has(cb.value);
    }
    const allChecked = checkboxes.every(c => c.checked);
    const someChecked = checkboxes.some(c => c.checked);
    categoryCheckbox.checked = allChecked;
    categoryCheckbox.indeterminate = someChecked && !allChecked;
  }
}

function buildPresetUI(): void {
  presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
  presetNameInput = document.getElementById('preset-name-input') as HTMLInputElement;

  refreshPresetList();

  // Save preset
  const savePresetBtn = document.getElementById('save-preset-btn') as HTMLButtonElement;
  savePresetBtn?.addEventListener('click', () => {
    const name = presetNameInput.value.trim();
    if (!name) {
      announce('Please enter a preset name');
      presetNameInput.focus();
      return;
    }
    savePreset(name, currentFilters);
    presetNameInput.value = '';
    refreshPresetList();
    announce(`Preset "${name}" saved`);
  });

  // Load preset
  presetSelect?.addEventListener('change', () => {
    const presetId = presetSelect.value;
    if (!presetId) return;

    const presets = getPresets();
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      currentFilters = { ...preset.filters };
      populateFiltersFromState();
      generateResults();
      announce(`Preset "${preset.name}" loaded`);
    }
    presetSelect.value = '';
  });

  // Delete preset
  const deletePresetBtn = document.getElementById('delete-preset-btn') as HTMLButtonElement;
  deletePresetBtn?.addEventListener('click', () => {
    const presetId = presetSelect.value;
    if (!presetId) {
      announce('Please select a preset to delete');
      return;
    }
    const presets = getPresets();
    const preset = presets.find(p => p.id === presetId);
    if (preset && confirm(`Delete preset "${preset.name}"?`)) {
      deletePreset(presetId);
      refreshPresetList();
      announce(`Preset "${preset.name}" deleted`);
    }
  });

  // Export presets
  const exportBtn = document.getElementById('export-presets-btn') as HTMLButtonElement;
  exportBtn?.addEventListener('click', () => {
    const data = exportPresets();
    if (data.presets.length === 0) {
      announce('No presets to export');
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baansearch-presets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    announce(`Exported ${data.presets.length} presets`);
  });

  // Import presets
  const importBtn = document.getElementById('import-presets-btn') as HTMLButtonElement;
  const importInput = document.getElementById('import-file-input') as HTMLInputElement;

  importBtn?.addEventListener('click', () => {
    importInput.click();
  });

  importInput?.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = importPresets(data);
      if (result.errors.length > 0) {
        alert(`Import completed with errors:\n${result.errors.join('\n')}`);
      }
      if (result.imported > 0) {
        refreshPresetList();
        announce(`Imported ${result.imported} presets`);
      }
    } catch {
      alert('Failed to import presets. Invalid file format.');
    }
    importInput.value = '';
  });
}

function refreshPresetList(): void {
  const presets = getPresets();
  presetSelect.innerHTML = '<option value="">Load a preset...</option>';
  for (const preset of presets) {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.name;
    presetSelect.appendChild(option);
  }
}

function populateFiltersFromState(): void {
  // Role
  roleSelect.value = currentFilters.role;

  // Location
  locationInput.value = currentFilters.location;

  // Languages (tri-state)
  for (const cb of languageCheckboxes) {
    let state: CheckboxState = 'none';
    if (currentFilters.languages.includes(cb.value)) {
      state = 'include';
    } else if (currentFilters.excludeLanguages.includes(cb.value)) {
      state = 'exclude';
    }
    languageStates.set(cb.value, state);
    updateTristateCheckbox(cb, state);
  }

  // Industries (tri-state)
  for (const cb of industryCheckboxes) {
    let state: CheckboxState = 'none';
    if (currentFilters.industry.includes(cb.value)) {
      state = 'include';
    } else if (currentFilters.excludeIndustries.includes(cb.value)) {
      state = 'exclude';
    }
    industryStates.set(cb.value, state);
    updateTristateCheckbox(cb, state);
  }

  // Company size
  for (const cb of companySizeCheckboxes) {
    cb.checked = currentFilters.companySize.includes(cb.value as CompanySize);
  }

  // Experience
  for (const radio of experienceRadios) {
    radio.checked = radio.value === currentFilters.experience;
  }

  // Remote
  for (const radio of remoteRadios) {
    radio.checked = radio.value === currentFilters.remote;
  }

  // Time posted
  timePostedSelect.value = currentFilters.timePosted;
}

export { cycleCheckboxState, updateTristateCheckbox };

export function collectFiltersFromUI(): FilterState {
  // Collect languages from tri-state map
  const languages: string[] = [];
  const excludeLanguages: string[] = [];
  
  // Process regular language checkboxes
  for (const [value, state] of languageStates) {
    if (state === 'include') {
      languages.push(value);
    } else if (state === 'exclude') {
      excludeLanguages.push(value);
    }
  }

  // Process custom technology
  const customTechCheckbox = document.getElementById('custom-technology-checkbox') as HTMLInputElement;
  const customTechValue = customTechCheckbox?.value.trim();
  if (customTechValue) {
    const customTechState = languageStates.get(customTechValue);
    if (customTechState === 'include') {
      languages.push(customTechValue);
    } else if (customTechState === 'exclude') {
      excludeLanguages.push(customTechValue);
    }
  }

  // Collect industries from tri-state map
  const industry: string[] = [];
  const excludeIndustries: string[] = [];
  
  // Process regular industry checkboxes
  for (const [value, state] of industryStates) {
    if (state === 'include') {
      industry.push(value);
    } else if (state === 'exclude') {
      excludeIndustries.push(value);
    }
  }

  // Process custom industry
  const customIndustryCheckbox = document.getElementById('custom-industry-checkbox') as HTMLInputElement;
  const customIndustryValue = customIndustryCheckbox?.value.trim();
  if (customIndustryValue) {
    const customIndustryState = industryStates.get(customIndustryValue);
    if (customIndustryState === 'include') {
      industry.push(customIndustryValue);
    } else if (customIndustryState === 'exclude') {
      excludeIndustries.push(customIndustryValue);
    }
  }

  return {
    role: roleSelect.value,
    location: locationInput.value.trim(),
    languages,
    excludeLanguages,
    industry,
    excludeIndustries,
    companySize: companySizeCheckboxes.filter(cb => cb.checked).map(cb => cb.value) as CompanySize[],
    experience: (experienceRadios.find(r => r.checked)?.value || '') as ExperienceLevel,
    remote: (remoteRadios.find(r => r.checked)?.value || '') as RemoteOption,
    timePosted: (timePostedSelect.value || 'any') as TimePosted,
  };
}

function setupEventListeners(): void {
  // Filter changes
  const filterChangeHandler = () => {
    currentFilters = collectFiltersFromUI();
    saveLastFilters(currentFilters);
    generateResults();
  };

  roleSelect.addEventListener('change', filterChangeHandler);
  locationInput.addEventListener('input', debounce(filterChangeHandler, 300));
  timePostedSelect.addEventListener('change', filterChangeHandler);

  // Tri-state language checkboxes - prevent default to take full control of state
  for (const cb of languageCheckboxes) {
    const label = cb.closest('.tristate-label');
    if (label) {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        const currentState = languageStates.get(cb.value) || 'none';
        const newState = cycleCheckboxState(currentState);
        languageStates.set(cb.value, newState);
        updateTristateCheckbox(cb, newState);
        filterChangeHandler();
      });
    }
  }

  // Tri-state industry checkboxes - prevent default to take full control of state
  for (const cb of industryCheckboxes) {
    const label = cb.closest('.tristate-label');
    if (label) {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        const currentState = industryStates.get(cb.value) || 'none';
        const newState = cycleCheckboxState(currentState);
        industryStates.set(cb.value, newState);
        updateTristateCheckbox(cb, newState);
        filterChangeHandler();
      });
    }
  }
  for (const cb of companySizeCheckboxes) {
    cb.addEventListener('change', filterChangeHandler);
  }
  for (const radio of experienceRadios) {
    radio.addEventListener('change', filterChangeHandler);
  }
  for (const radio of remoteRadios) {
    radio.addEventListener('change', filterChangeHandler);
  }

  // Custom technology checkbox with input
  const customTechCheckbox = document.getElementById('custom-technology-checkbox') as HTMLInputElement;
  const customTechInput = document.getElementById('custom-technology-input') as HTMLInputElement;
  const customTechLabel = customTechCheckbox?.closest('.tristate-label');

  if (customTechLabel && customTechCheckbox && customTechInput) {
    // Handle label click for tri-state (but not when clicking input)
    customTechLabel.addEventListener('click', (e) => {
      if (e.target === customTechInput) return; // Don't cycle when clicking input
      e.preventDefault();

      const value = customTechInput.value.trim();
      if (!value) return; // Don't cycle if no value entered

      const currentState = getTristateLabelState(customTechLabel);
      const newState = cycleCheckboxState(currentState);
      customTechCheckbox.value = value;
      languageStates.set(value, newState);
      updateTristateCheckbox(customTechCheckbox, newState);
      filterChangeHandler();
    });

    // Update value when input changes
    customTechInput.addEventListener('input', () => {
      customTechCheckbox.value = customTechInput.value.trim();
      const currentState = getTristateLabelState(customTechLabel);
      if (currentState !== 'none') {
        filterChangeHandler();
      }
    });
  }

  // Custom industry checkbox with input
  const customIndustryCheckbox = document.getElementById('custom-industry-checkbox') as HTMLInputElement;
  const customIndustryInput = document.getElementById('custom-industry-input') as HTMLInputElement;
  const customIndustryLabel = customIndustryCheckbox?.closest('.tristate-label');

  if (customIndustryLabel && customIndustryCheckbox && customIndustryInput) {
    // Track custom industry state separately
    let customIndustryState: CheckboxState = 'none';

    // Handle label click for tri-state (but not when clicking input)
    customIndustryLabel.addEventListener('click', (e) => {
      if (e.target === customIndustryInput) return; // Don't cycle when clicking input
      e.preventDefault();

      const value = customIndustryInput.value.trim();
      if (!value) return; // Don't cycle if no value entered

      customIndustryState = cycleCheckboxState(customIndustryState);
      customIndustryCheckbox.value = value;
      updateTristateCheckbox(customIndustryCheckbox, customIndustryState);
      filterChangeHandler();
    });

    // Update value when input changes
    customIndustryInput.addEventListener('input', () => {
      customIndustryCheckbox.value = customIndustryInput.value.trim();
      if (customIndustryState !== 'none') {
        filterChangeHandler();
      }
    });
  }

  // Clear filters
  const clearFiltersBtn = document.getElementById('clear-filters-btn') as HTMLButtonElement;
  clearFiltersBtn?.addEventListener('click', () => {
    currentFilters = { ...DEFAULT_FILTER_STATE };
    populateFiltersFromState();
    saveLastFilters(currentFilters);
    generateResults();
    announce('Filters cleared');
  });

  // Clear technologies
  const clearTechnologiesBtn = document.getElementById('clear-technologies-btn') as HTMLButtonElement;
  clearTechnologiesBtn?.addEventListener('click', () => {
    // Reset all known technology checkboxes
    for (const cb of languageCheckboxes) {
      languageStates.set(cb.value, 'none');
      updateTristateCheckbox(cb, 'none');
    }

    // Reset custom technology
    if (customTechCheckbox && customTechInput) {
      const prevValue = customTechInput.value.trim();
      if (prevValue) {
        languageStates.delete(prevValue);
      }
      customTechInput.value = '';
      customTechCheckbox.value = '';
      updateTristateCheckbox(customTechCheckbox, 'none');
    }

    currentFilters = collectFiltersFromUI();
    saveLastFilters(currentFilters);
    generateResults();
    announce('Technologies cleared');
  });

  // Clear industries button
  const clearIndustriesBtn = document.getElementById('clear-industries-btn') as HTMLButtonElement;
  clearIndustriesBtn?.addEventListener('click', () => {
    // Reset all known industry checkboxes
    for (const cb of industryCheckboxes) {
      industryStates.set(cb.value, 'none');
      updateTristateCheckbox(cb, 'none');
    }

    // Reset custom industry
    const customIndCheckbox = document.getElementById('custom-industry-checkbox') as HTMLInputElement;
    const customIndInput = document.getElementById('custom-industry-input') as HTMLInputElement;
    if (customIndCheckbox && customIndInput) {
      const prevValue = customIndInput.value.trim();
      if (prevValue) {
        industryStates.delete(prevValue);
      }
      customIndInput.value = '';
      customIndCheckbox.value = '';
      updateTristateCheckbox(customIndCheckbox, 'none');
    }

    currentFilters = collectFiltersFromUI();
    saveLastFilters(currentFilters);
    generateResults();
    announce('Industries cleared');
  });

  // Copy shareable link
  const copyLinkBtn = document.getElementById('copy-link-btn') as HTMLButtonElement;
  copyLinkBtn?.addEventListener('click', async () => {
    const state = {
      filters: currentFilters,
      selectedBoards: Array.from(selectedBoardIds),
    };
    const params = serializeToUrl(state);
    const url = `${window.location.origin}${window.location.pathname}?${params}`;

    try {
      await navigator.clipboard.writeText(url);
      announce('Link copied to clipboard');
      copyLinkBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyLinkBtn.textContent = 'Copy Link';
      }, 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      announce('Link copied to clipboard');
    }
  });

  // Open all selected
  const openAllBtn = document.getElementById('open-all-btn') as HTMLButtonElement;
  openAllBtn?.addEventListener('click', () => {
    const urlsToOpen = Array.from(selectedBoardIds)
      .map(id => generatedUrls.get(id))
      .filter((url): url is string => !!url);

    if (urlsToOpen.length === 0) {
      announce('No boards selected');
      return;
    }

    // Warn if opening many tabs
    if (urlsToOpen.length > 10) {
      if (!confirm(`This will open ${urlsToOpen.length} tabs. Continue?`)) {
        return;
      }
    }

    for (const url of urlsToOpen) {
      window.open(url, '_blank', 'noopener');
    }
    announce(`Opened ${urlsToOpen.length} job boards`);
  });

  // Keyboard navigation for results
  resultsContainer = document.getElementById('results-container') as HTMLElement;
  resultsContainer.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('result-link')) {
      const links = Array.from(resultsContainer.querySelectorAll('.result-link')) as HTMLElement[];
      const currentIndex = links.indexOf(target);

      if (e.key === 'ArrowDown' && currentIndex < links.length - 1) {
        e.preventDefault();
        links[currentIndex + 1].focus();
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        links[currentIndex - 1].focus();
      }
    }
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') {
      applyTheme('system');
    }
  });
}

function generateResults(): void {
  resultsContainer = document.getElementById('results-container') as HTMLElement;
  generatedUrls.clear();

  // Generate URLs for all boards
  for (const board of JOB_BOARDS) {
    const url = board.buildUrl(currentFilters);
    generatedUrls.set(board.id, url);
  }

  // Build results HTML
  const selectedCount = selectedBoardIds.size;
  const hasFilters = currentFilters.role ||
    currentFilters.languages.length > 0 ||
    currentFilters.excludeLanguages.length > 0 ||
    currentFilters.location ||
    currentFilters.industry.length > 0 ||
    currentFilters.excludeIndustries.length > 0;

  if (!hasFilters && selectedCount === 0) {
    resultsContainer.innerHTML = `
      <div class="results-empty">
        <p>Select some filters and job boards to get started.</p>
        <p class="hint">Tip: Use the category checkboxes to quickly select groups of job boards.</p>
      </div>
    `;
    return;
  }

  if (selectedCount === 0) {
    resultsContainer.innerHTML = `
      <div class="results-empty">
        <p>Select one or more job boards above to see search links.</p>
      </div>
    `;
    return;
  }

  let html = '<div class="results-list" role="list">';

  for (const category of BOARD_CATEGORIES) {
    const boards = getBoardsByCategory(category.value).filter(b => selectedBoardIds.has(b.id));
    if (boards.length === 0) continue;

    html += `<div class="results-category">
      <h3 class="results-category-title">${category.label}</h3>
      <div class="results-category-links">`;

    for (const board of boards) {
      const url = generatedUrls.get(board.id) || '#';
      html += `
        <a href="${escapeHtml(url)}"
           target="_blank"
           rel="noopener noreferrer"
           class="result-link"
           data-board="${board.id}">
          <span class="result-name">${escapeHtml(board.name)}</span>
          <span class="result-arrow">→</span>
        </a>`;
    }

    html += '</div></div>';
  }

  html += '</div>';
  resultsContainer.innerHTML = html;

  // Update count
  const countEl = document.getElementById('selected-count');
  if (countEl) {
    countEl.textContent = `${selectedCount} board${selectedCount !== 1 ? 's' : ''} selected`;
  }
}

// Utility functions
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

function getTristateLabelState(label: Element | null): CheckboxState {
  const state = label?.getAttribute('data-state');
  return (state === 'include' || state === 'exclude' || state === 'none') ? state : 'none';
}

function announce(message: string): void {
  if (statusRegion) {
    statusRegion.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      statusRegion.textContent = '';
    }, 1000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

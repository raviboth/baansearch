import { describe, it, expect, beforeEach } from 'vitest';
// Import the functions we want to test
import {
  cycleCheckboxState,
  updateTristateCheckbox,
} from './tristate';

// Mock the DOM elements and functions
const mockCheckbox = document.createElement('input');
const mockLabel = document.createElement('label');
mockLabel.className = 'tristate-label';
mockLabel.appendChild(mockCheckbox);

describe('Tri-state Checkbox Functions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.appendChild(mockLabel);
  });

  describe('cycleCheckboxState', () => {
    it('should cycle through states in order: none -> include -> exclude -> none', () => {
      expect(cycleCheckboxState('none')).toBe('include');
      expect(cycleCheckboxState('include')).toBe('exclude');
      expect(cycleCheckboxState('exclude')).toBe('none');
    });
  });

  describe('updateTristateCheckbox', () => {
    it('should update checkbox state to none', () => {
      updateTristateCheckbox(mockCheckbox, 'none');
      expect(mockCheckbox.checked).toBe(false);
      expect(mockCheckbox.indeterminate).toBe(false);
      expect(mockLabel.getAttribute('data-state')).toBe('none');
    });

    it('should update checkbox state to include', () => {
      updateTristateCheckbox(mockCheckbox, 'include');
      expect(mockCheckbox.checked).toBe(true);
      expect(mockCheckbox.indeterminate).toBe(false);
      expect(mockLabel.getAttribute('data-state')).toBe('include');
    });

    it('should update checkbox state to exclude', () => {
      updateTristateCheckbox(mockCheckbox, 'exclude');
      expect(mockCheckbox.checked).toBe(false);
      expect(mockCheckbox.indeterminate).toBe(true);
      expect(mockLabel.getAttribute('data-state')).toBe('exclude');
    });
  });
});

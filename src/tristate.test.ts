import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cycleCheckboxState, updateTristateCheckbox } from './tristate';

describe('tristate', () => {
  let checkbox: HTMLInputElement;
  let label: HTMLLabelElement;

  beforeEach(() => {
    checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    label = document.createElement('label');
    label.className = 'tristate-label';
    label.appendChild(checkbox);
    document.body.appendChild(label);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('cycleCheckboxState', () => {
    it('cycles none -> include -> exclude -> none', () => {
      expect(cycleCheckboxState('none')).toBe('include');
      expect(cycleCheckboxState('include')).toBe('exclude');
      expect(cycleCheckboxState('exclude')).toBe('none');
    });
  });

  describe('updateTristateCheckbox', () => {
    it('sets none state', () => {
      updateTristateCheckbox(checkbox, 'none');
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(false);
      expect(label.getAttribute('data-state')).toBe('none');
    });

    it('sets include state', () => {
      updateTristateCheckbox(checkbox, 'include');
      expect(checkbox.checked).toBe(true);
      expect(checkbox.indeterminate).toBe(false);
      expect(label.getAttribute('data-state')).toBe('include');
    });

    it('sets exclude state', () => {
      updateTristateCheckbox(checkbox, 'exclude');
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(true);
      expect(label.getAttribute('data-state')).toBe('exclude');
    });

    it('is a no-op if checkbox is not inside a .tristate-label', () => {
      const orphan = document.createElement('input');
      orphan.type = 'checkbox';

      updateTristateCheckbox(orphan, 'include');

      expect(orphan.checked).toBe(false);
      expect(orphan.indeterminate).toBe(false);
    });
  });
});

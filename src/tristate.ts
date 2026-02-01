export type CheckboxState = 'none' | 'include' | 'exclude';

export function updateTristateCheckbox(checkbox: HTMLInputElement, state: CheckboxState): void {
  const label = checkbox.closest('.tristate-label');
  if (!label) return;

  label.setAttribute('data-state', state);

  if (state === 'none') {
    checkbox.checked = false;
    checkbox.indeterminate = false;
  } else if (state === 'include') {
    checkbox.checked = true;
    checkbox.indeterminate = false;
  } else if (state === 'exclude') {
    checkbox.checked = false;
    checkbox.indeterminate = true;
  }
}

export function cycleCheckboxState(current: CheckboxState): CheckboxState {
  if (current === 'none') return 'include';
  if (current === 'include') return 'exclude';
  return 'none';
}

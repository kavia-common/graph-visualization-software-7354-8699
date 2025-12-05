import { isUndoEvent, isRedoEvent, isDeleteEvent, isAddNodeEvent } from './keyboard';

function evt(overrides = {}) {
  return {
    key: '',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  };
}

describe('keyboard utils', () => {
  test('isUndoEvent detects Ctrl+Z', () => {
    expect(isUndoEvent(evt({ key: 'z', ctrlKey: true }))).toBe(true);
    expect(isUndoEvent(evt({ key: 'Z', ctrlKey: true }))).toBe(true);
    expect(isUndoEvent(evt({ key: 'z' }))).toBe(false);
  });

  test('isRedoEvent detects Ctrl+Y or Shift+Cmd+Z variants', () => {
    expect(isRedoEvent(evt({ key: 'y', ctrlKey: true }))).toBe(true);
    expect(isRedoEvent(evt({ key: 'z', metaKey: true, shiftKey: true }))).toBe(true);
    expect(isRedoEvent(evt({ key: 'z', metaKey: true }))).toBe(false);
  });

  test('isDeleteEvent detects Delete/Backspace without modifiers', () => {
    expect(isDeleteEvent(evt({ key: 'Delete' }))).toBe(true);
    expect(isDeleteEvent(evt({ key: 'Backspace' }))).toBe(true);
    expect(isDeleteEvent(evt({ key: 'Backspace', ctrlKey: true }))).toBe(false);
  });

  test('isAddNodeEvent detects N', () => {
    expect(isAddNodeEvent(evt({ key: 'n' }))).toBe(true);
    expect(isAddNodeEvent(evt({ key: 'N' }))).toBe(true);
    expect(isAddNodeEvent(evt({ key: 'n', ctrlKey: true }))).toBe(false);
  });
});

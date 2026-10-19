/** Joins CSS class names and skips falsy values: cx('a', isActive && 'b') → "a b". */
export function cx(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

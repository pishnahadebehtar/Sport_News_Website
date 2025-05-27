export function debounce<Args extends unknown[], R>(
  func: (...args: Args) => R,
  wait: number
): (...args: Args) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

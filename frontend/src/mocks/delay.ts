/** Simulates network latency so loading states can be seen in the UI. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

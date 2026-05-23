// Backward-compatible seed helpers after Firebase removal.

export async function isSeedingComplete(): Promise<boolean> {
  return true;
}

export async function seedDatabase(
  onProgress?: (step: string) => void,
  _currentUserId?: string
): Promise<{ success: boolean; errors: string[] }> {
  onProgress?.('No client-side seeding required (Firebase removed).');
  return { success: true, errors: [] };
}

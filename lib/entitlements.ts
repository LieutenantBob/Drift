import type { Theme, Entitlement } from '../types';

export async function getEntitlement(): Promise<Entitlement> {
  return 'free';
}

export function canAccessTheme(theme: Theme, entitlement: Entitlement): boolean {
  const order: Record<string, number> = { free: 0, plus: 1, pro: 2, gallery: 1 };
  if (theme.tier === 'gallery') {
    return false;
  }
  return order[entitlement] >= order[theme.tier];
}

export function canPurchaseGalleryTheme(_themeId: string): boolean {
  return true;
}

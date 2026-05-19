/**
 * Platform commission configuration.
 * Change COMMISSION_RATE after the free period ends (2026-08-01).
 */
export const COMMISSION_RATE = 0; // 0% during free period
export const COMMISSION_FREE_UNTIL = "2026-08-01";

/** Calculate creator earnings after platform commission. */
export function getCreatorAmount(totalAmount: number): number {
  return Math.round(totalAmount * (1 - COMMISSION_RATE) * 100) / 100;
}

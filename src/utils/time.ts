export function currentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export function generateExpiryTime(ttlInSeconds: number): number {
  return currentTimestamp() + ttlInSeconds;
}
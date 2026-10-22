export function getContactPairKey(firstId: string, secondId: string) {
  return [firstId.toLowerCase(), secondId.toLowerCase()].sort().join(":");
}

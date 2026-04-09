const units: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export const parseDelay = (delay: string): number => {
  const match = delay.match(/^(\d+)([smhd])$/);
  if (!match)
    throw new Error(`Invalid delay format: "${delay}". Use e.g. "30s", "5m", "1h", "2d".`);
  return parseInt(match[1]) * units[match[2]];
};

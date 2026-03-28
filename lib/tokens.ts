/* ═══════════════════════════════════════════════════════════
   WELKINRIM TECHNOLOGIES — ADMIN PORTAL DESIGN TOKENS
   Aligned with client project (Well/src/lib/tokens.ts)
   ═══════════════════════════════════════════════════════════ */

export const colors = {
  /* ── GOLD — primary accent ───────────────────────────────── */
  gold: '#E8A800',
  goldLight: '#F5BC1A',
  goldDark: '#C48E00',
  goldGlow: 'rgba(232, 168, 0, 0.12)',
  goldGhost: 'rgba(232, 168, 0, 0.06)',
  goldLine: 'rgba(232, 168, 0, 0.25)',

  /* ── WHITE SCALE ─────────────────────────────────────────── */
  whitePure: '#FFFFFF',
  whiteWarm: '#FAFAF8',
  whiteGrey: '#F4F4F2',
  whiteBorder: '#E8E8E6',
  whiteDeep: '#D8D8D6',

  /* ── NEAR-BLACK ──────────────────────────────────────────── */
  ink: '#0E0E0F',
  inkMid: '#3A3A40',
  inkSoft: '#6B6B72',

  /* ── DOMAIN ACCENT COLOURS ───────────────────────────────── */
  air: '#2B7FE8',
  water: '#009DC4',
  land: '#E8A800',
  robotics: '#7B5CD4',

  /* ── SEMANTIC COLORS ─────────────────────────────────────── */
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const domainColors = {
  air: '#2B7FE8',
  water: '#009DC4',
  land: '#E8A800',
  robotics: '#7B5CD4',
} as const;

export const geometry = {
  skewDeg: '-10deg',
  slashDeg: '72deg',
} as const;

export const motion = {
  easeMotor: [0.16, 1, 0.3, 1] as const,
  easePrecise: [0.45, 0, 0.55, 1] as const,
  easeReveal: [0.25, 0.46, 0.45, 0.94] as const,
  durationFast: 200,
  durationBase: 400,
  durationSlow: 700,
  durationReveal: 1000,
} as const;

export const stagger = {
  overline: 0,
  headline: 80,
  domainSelector: 160,
  body: 240,
  badges: 320,
  badgeIncrement: 25,
  cta: 460,
  matrix: 120,
  matrixCellIncrement: 40,
} as const;

export const layout = {
  maxWidth: 1400,
  gutter: 80,
  gutterMd: 40,
  gutterSm: 24,
  navHeight: 64,
  navHeightMobile: 56,
  sidebarWidth: 260,
  sidebarWidthCollapsed: 64,
} as const;

export const fonts = {
  display: 'Michroma',
  body: 'Lexend',
  mono: 'Space Mono',
} as const;

export type Domain = 'air' | 'water' | 'land' | 'robotics';
export type ProductCategory = 'motor' | 'esc' | 'fc' | 'ips';

/**
 * The design system's single source of truth. Every color, size and space in
 * the app comes from here. Colors are the app's existing palette only; tints
 * are those colors at an opacity, never new hues.
 */

export const color = {
  bg: '#000', // level 0: screens
  surface: '#141414', // level 1: cards, fields, sheets, placeholders
  raised: '#222', // level 2: toasts; also the tonal fill of secondary buttons and chips
  divider: '#2a2a2a',
  text: '#fff',
  textSecondary: '#999',
  textTertiary: '#777',
  inverse: '#000',
  gold: '#ffd700', // ratings only
  danger: '#ff3b30', // errors and destructive actions only
  scrim: 'rgba(0,0,0,0.4)', // black at 40%: sheet backdrop
  mediaScrim: 'rgba(0,0,0,0.5)', // black at 50%: controls over posters
  shimmer: 'rgba(255,255,255,0.06)', // white at 6%: skeleton sweep
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

/** Side padding, identical on every screen. */
export const gutter = space.lg;

export const radius = {
  control: 999, // buttons, fields, chips, segmented controls: always fully rounded
  container: 12, // cards, sheets, posters, thumbnails
} as const;

export const font = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  section: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const;

export const weight = { regular: '400', bold: '700' } as const;

export const icon = { nav: 24, action: 24, inline: 16 } as const;

export const size = {
  control: 52, // buttons and fields
  chip: 44,
  chipImage: 28, // logos inside chips: chip height minus 8 on each side
  iconButton: 44, // the minimum touch target
  avatar: 44,
  avatarLarge: 64,
  thumbWidth: 56,
  thumbHeight: 84,
  posterWidth: 112,
  rowAction: 88, // a list row's swipe-to-reveal action: two touch targets wide
} as const;

export const hairline = 1;

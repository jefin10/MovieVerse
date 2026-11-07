import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { color, font, weight } from './tokens';

export type TextVariant = keyof typeof font;
export type Tone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'danger' | 'gold';

export const toneColor: Record<Tone, string> = {
  primary: color.text,
  secondary: color.textSecondary,
  tertiary: color.textTertiary,
  inverse: color.inverse,
  danger: color.danger,
  gold: color.gold,
};

type Props = TextProps & { variant?: TextVariant; tone?: Tone; bold?: boolean; center?: boolean };

/** The only text component: one of five sizes, two weights, one family. */
export const Text = ({ variant = 'body', tone = 'primary', bold, center, style, ...rest }: Props) => (
  <RNText
    {...rest}
    style={[
      font[variant],
      { color: toneColor[tone] },
      bold && { fontWeight: weight.bold },
      center && { textAlign: 'center' },
      style,
    ]}
  />
);

export default Text;

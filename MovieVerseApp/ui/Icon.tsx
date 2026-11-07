import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import featherGlyphs from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Feather.json';
import fontAwesomeGlyphs from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/FontAwesome.json';
import { color as palette, icon as iconSize } from './tokens';

export type IconName = keyof typeof featherGlyphs;

/**
 * The app's one icon set (Feather, one stroke weight). It draws from the font
 * that app.json embeds in the native build, so nothing loads at runtime and
 * icons never pop in after launch.
 */
export const Icon = ({
  name,
  size = iconSize.inline,
  color = palette.text,
  style,
  accessibilityLabel,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}) => (
  <Text
    allowFontScaling={false}
    accessibilityLabel={accessibilityLabel}
    accessibilityElementsHidden={!accessibilityLabel}
    importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    style={[{ fontFamily: 'Feather', fontSize: size, lineHeight: size, color, includeFontPadding: false }, style]}
  >
    {String.fromCodePoint(featherGlyphs[name])}
  </Text>
);

/** Google's mark for "Continue with Google". Brand rules require their logo, which Feather doesn't have. */
export const GoogleMark = ({ size = iconSize.inline, color = palette.text }: { size?: number; color?: string }) => (
  <Text allowFontScaling={false} style={{ fontFamily: 'FontAwesome', fontSize: size, lineHeight: size, color, includeFontPadding: false }}>
    {String.fromCodePoint(fontAwesomeGlyphs.google)}
  </Text>
);

export default Icon;

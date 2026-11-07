import { Icon, type IconName } from './Icon';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Image from '@/app/components/CachedImage';
import { Text } from './Text';
import { Touchable } from './Touchable';
import { color, icon, radius, size, space } from './tokens';

type RowProps = {
  title: string;
  subtitle?: React.ReactNode;
  meta?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Show a chevron when the row opens another screen. */
  chevron?: boolean;
  emphasis?: boolean;
  /** Sign out and other destructive rows: title in the danger color. */
  destructive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** One list row: leading, text block, trailing. Rows are separated by dividers, not boxes. */
export const ListRow = ({ title, subtitle, meta, leading, trailing, chevron, emphasis, destructive, onPress, onLongPress, style }: RowProps) => {
  const body = (
    <>
      {leading}
      <View style={styles.text}>
        <Text bold={emphasis} tone={destructive ? 'danger' : 'primary'} numberOfLines={1}>
          {title}
        </Text>
        {typeof subtitle === 'string' ? (
          <Text variant="label" tone="secondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : (
          subtitle ?? null
        )}
        {meta ? (
          <Text variant="caption" tone="tertiary" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {trailing}
      {chevron ? <Icon name="chevron-right" size={icon.inline} color={color.textTertiary} /> : null}
    </>
  );
  return onPress || onLongPress ? (
    <Touchable feedback="opacity" onPress={onPress} onLongPress={onLongPress} accessibilityRole="button" style={[styles.row, style]}>
      {body}
    </Touchable>
  ) : (
    <View style={[styles.row, style]}>{body}</View>
  );
};

export const Thumb = ({ uri }: { uri?: string | null }) => (
  <View style={styles.thumb}>{uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} /> : null}</View>
);

export const Avatar = ({ name, large }: { name: string; large?: boolean }) => (
  <View style={[styles.avatar, large && styles.avatarLarge]}>
    <Text variant={large ? 'section' : 'body'} bold>
      {name?.[0]?.toUpperCase() ?? '?'}
    </Text>
  </View>
);

/** An icon in the same circle an avatar uses. */
export const IconBadge = ({ name, tone = 'default' }: { name: IconName; tone?: 'default' | 'danger' }) => (
  <View style={styles.avatar}>
    <Icon name={name} size={icon.inline} color={tone === 'danger' ? color.danger : color.text} />
  </View>
);

/** Shows a 0-5 rating. */
export const Stars = ({ value, label }: { value: number; label?: string }) => {
  const filled = Math.round(value);
  return (
    <View style={styles.stars} accessibilityLabel={label ?? `${filled} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={icon.inline} color={n <= filled ? color.gold : color.divider} />
      ))}
    </View>
  );
};

/** Sets a 1-5 rating. Each star is a 44px target. */
export const StarInput = ({ value, onChange }: { value: number | null; onChange: (rating: number) => void }) => (
  <View style={styles.starInput} accessibilityRole="adjustable" accessibilityLabel="Your rating" accessibilityValue={{ min: 0, max: 5, now: value ?? 0 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Touchable
        key={n}
        style={styles.starTarget}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onChange(n);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
      >
        <Icon name="star" size={icon.action} color={value !== null && n <= value ? color.gold : color.textTertiary} />
      </Touchable>
    ))}
  </View>
);

/** IMDb-style score: a gold star and the number. */
export const Score = ({ value }: { value?: number | null }) =>
  value ? (
    <View style={styles.score}>
      <Icon name="star" size={icon.inline} color={color.gold} />
      <Text variant="label" tone="secondary">
        {Number(value).toFixed(1)}
      </Text>
    </View>
  ) : null;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, minHeight: size.control + space.xs },
  text: { flex: 1, gap: space.xs },
  thumb: { width: size.thumbWidth, height: size.thumbHeight, borderRadius: radius.container, backgroundColor: color.surface, overflow: 'hidden' },
  avatar: {
    width: size.avatar,
    height: size.avatar,
    borderRadius: radius.control,
    backgroundColor: color.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLarge: { width: size.avatarLarge, height: size.avatarLarge },
  stars: { flexDirection: 'row', gap: space.xs },
  starInput: { flexDirection: 'row', gap: space.xs, marginLeft: -((size.iconButton - icon.action) / 2) },
  starTarget: { width: size.iconButton, height: size.iconButton, alignItems: 'center', justifyContent: 'center' },
  score: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
});

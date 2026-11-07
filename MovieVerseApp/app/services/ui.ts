import { StyleSheet } from 'react-native';

export const timeAgo = (iso: string) => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// Shared look for the newer screens: black, white and one level of grey cards.
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 22, fontWeight: '700' },
  link: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { color: '#999', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 48, paddingHorizontal: 32 },
  card: { backgroundColor: '#141414', borderRadius: 18, padding: 14, marginBottom: 10 },
  cardUnread: { backgroundColor: '#222' },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cardBody: { color: '#aaa', fontSize: 13, lineHeight: 18, marginTop: 2 },
  meta: { color: '#777', fontSize: 12, marginTop: 4 },
  thumb: { width: 46, height: 66, borderRadius: 8, backgroundColor: '#222' },
  iconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 18, marginBottom: 10 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  button: { backgroundColor: '#fff', borderRadius: 26, paddingVertical: 14, paddingHorizontal: 22, alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 15, fontWeight: '700' },
  buttonGhost: { backgroundColor: '#1f1f1f' },
  buttonGhostText: { color: '#fff' },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff' },
  pillText: { color: '#000', fontSize: 13, fontWeight: '700' },
  pillOff: { backgroundColor: '#222' },
  pillOffText: { color: '#fff' },
});

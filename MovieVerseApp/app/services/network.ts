import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

/** False only when we know there's no connection, so an unknown state doesn't block anything. */
export const useOnline = () => {
  const { isConnected, isInternetReachable } = useNetInfo();
  return isConnected !== false && isInternetReachable !== false;
};

export const subscribeToReconnect = (onReconnect: () => void) => {
  let offline = false;
  return NetInfo.addEventListener(({ isConnected, isInternetReachable }) => {
    const online = isConnected !== false && isInternetReachable !== false;
    if (online && offline) onReconnect();
    offline = !online;
  });
};

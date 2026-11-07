import { duration } from '@/ui/motion';
import { Image as ExpoImage, ImageBackground as ExpoImageBackground } from 'expo-image';
import React from 'react';

// Posters saved to disk, so they still show with no connection. They fade in over 150ms.
const Image = ({ resizeMode = 'cover', ...props }: any) => (
  <ExpoImage cachePolicy="disk" contentFit={resizeMode} transition={duration.fast} {...props} />
);

export const ImageBackground = ({ resizeMode = 'cover', ...props }: any) => (
  <ExpoImageBackground cachePolicy="disk" contentFit={resizeMode} {...props} />
);

export default Image;

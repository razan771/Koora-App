import { useThemeColor } from '@/hooks/useThemeColor';
import React, { forwardRef } from 'react';
import { View, ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export const ThemedView = forwardRef<View, ThemedViewProps>(({
  style, lightColor, darkColor, ...rest
}, ref) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  return (
    <View
      ref={ref}
      style={[{ backgroundColor }, style]}
      {...rest}
    />
  );
});

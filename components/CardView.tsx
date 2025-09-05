import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type CardViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function CardView({ style, lightColor, darkColor, ...otherProps }: CardViewProps) {
  const backgroundColor = useThemeColor({ light: "#fff9f7", dark: "#979290" }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

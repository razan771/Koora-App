import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle } from 'react';
import { ThemedText } from './ThemedText';

const HEADER_HEIGHT = 170;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  onMenuPress?: () => void;
  onLangChange?: () => void;
}>;

// إنشاء interface للـ ref methods
export interface ParallaxScrollViewRef {
  scrollToPosition: (y: number) => void;
}

const ParallaxScrollView = forwardRef<ParallaxScrollViewRef, Props>(({
  children,
  headerImage,
  onMenuPress,
  onLangChange,
}, ref) => {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  
  // استخدام useImperativeHandle لتوفير الـ methods للـ parent component
  useImperativeHandle(ref, () => ({
    scrollToPosition: (y: number) => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [2, 1, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const topBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollOffset.value,
      [0, HEADER_HEIGHT / 2],
      [1, 0.9],
      Extrapolation.CLAMP
    ),
  }));

  
  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          {headerImage}
          <Animated.View style={[styles.topBar, topBarAnimatedStyle]}>
            {/* زر القائمة */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={onMenuPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="menu"
                size={24}
                color={colorScheme === 'dark' ? '#000' : '#000'}
              />
            </TouchableOpacity>

            {/* زر تبديل اللغة */}
            <TouchableOpacity
              style={styles.lanButton}
              onPress={onLangChange}
              activeOpacity={0.7}
            >
              <Ionicons
                name="globe-outline"
                size={24}
                color={colorScheme === 'dark' ? '#000' : '#000'}
              />
              <ThemedText style={styles.lanText}>EN/AR</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
});

// إضافة displayName للـ component
ParallaxScrollView.displayName = 'ParallaxScrollView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: 70,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lanButton: {
    width: 44,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'column',
  },
  lanText: {
    fontSize: 11,
    marginTop: 2,
    writingDirection: 'ltr',
    color: '#000',
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});

export default ParallaxScrollView;
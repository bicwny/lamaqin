import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
  style?: any;
}

export const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  marginBottom = 0,
  style
}: SkeletonLoaderProps) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: DesignSystem.colors.border,
          borderRadius,
          marginBottom,
          opacity,
        },
        style
      ]}
    />
  );
};

interface CourseSkeletonProps {
  count?: number;
}

export const CourseSkeleton = ({ count = 3 }: CourseSkeletonProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.courseCard}>
          {/* Class header */}
          <SkeletonLoader width={120} height={24} marginBottom={12} />
          
          {/* Course name */}
          <SkeletonLoader width="80%" height={20} marginBottom={8} />
          
          {/* Course info */}
          <SkeletonLoader width="60%" height={16} marginBottom={12} />
          
          {/* Progress text */}
          <View style={styles.progressRow}>
            <SkeletonLoader width="40%" height={14} marginBottom={0} />
            <SkeletonLoader width="35%" height={14} marginBottom={0} />
          </View>
          
          {/* Progress bar */}
          <SkeletonLoader width="100%" height={8} borderRadius={4} marginBottom={8} />
          
          {/* Continue button */}
          <SkeletonLoader width="100%" height={40} borderRadius={8} marginBottom={0} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: DesignSystem.spacing.md,
  },
  courseCard: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export default SkeletonLoader;

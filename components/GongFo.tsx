import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated,
  Text,
  Image as RNImage,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path, G } from 'react-native-svg';
import { DesignSystem } from '@/constants/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

type OfferingType = 'light' | 'water' | 'flower' | 'fruit' | 'incense' | 'mandala';

interface OfferingState {
  light: boolean;
  water: boolean;
  flower: boolean;
  fruit: boolean;
  incense: boolean;
  mandala: boolean;
}

const OFFERING_POSITIONS = {
  // Top stair - lamps on left and right
  lightLeft: { left: '2%', top: '-5%', width: '13%' },
  lightRight: { left: '85%', top: '-5%', width: '13%', flip: true },
  // Middle stair - fruit on left, mandala center, incense on right
  fruit: { left: '20%', top: '50%', width: '13%' },
  mandala: { left: '40%', top: '48%', width: '13%' },
  incense: { left: '63%', top: '50%', width: '13%' },
  // Bottom stair - flowers on left/right, water bowls in center
  flowerLeft: { left: '2%', top: '10%', width: '13%' },
  flowerRight: { left: '84%', top: '78%', width: '13%', flip: true },
  water: { left: '25%', top: '88%', width: '13%' },
};

const ICON_FILL = '#665d52';
const ICON_FILL_HOVER = '#80524f';
const BUTTON_BG = '#9c9a97';
const BUTTON_BG_HOVER = '#bdbcba';

const useNativeDriver = Platform.OS !== 'web';

export default function GongFo() {
  const [offerings, setOfferings] = useState<OfferingState>({
    light: false,
    water: false,
    flower: false,
    fruit: false,
    incense: false,
    mandala: false,
  });

  const [containerWidth, setContainerWidth] = useState(screenWidth - 32);
  const fadeAnims = useRef<{ [key in OfferingType]: Animated.Value }>({
    light: new Animated.Value(0),
    water: new Animated.Value(0),
    flower: new Animated.Value(0),
    fruit: new Animated.Value(0),
    incense: new Animated.Value(0),
    mandala: new Animated.Value(0),
  }).current;

  const bgGlowAnim = useRef(new Animated.Value(0)).current;
  const altarOpacity = useRef(new Animated.Value(1)).current;

  const allOfferingsComplete = Object.values(offerings).every(v => v);

  useEffect(() => {
    if (allOfferingsComplete) {
      Animated.timing(bgGlowAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver,
      }).start();
    }
  }, [allOfferingsComplete]);

  const handleOffering = useCallback((type: OfferingType) => {
    if (offerings[type]) return;

    setOfferings(prev => ({ ...prev, [type]: true }));
    
    if (type === 'light') {
      Animated.timing(altarOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver,
      }).start();
    }

    Animated.timing(fadeAnims[type], {
      toValue: 1,
      duration: 700,
      useNativeDriver,
    }).start();
  }, [offerings, fadeAnims, altarOpacity]);

  const handleReset = useCallback(() => {
    setOfferings({
      light: false,
      water: false,
      flower: false,
      fruit: false,
      incense: false,
      mandala: false,
    });

    Object.values(fadeAnims).forEach(anim => {
      anim.setValue(0);
    });
    bgGlowAnim.setValue(0);
    altarOpacity.setValue(1);
  }, [fadeAnims, bgGlowAnim, altarOpacity]);

  const onLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const renderOfferingItem = (
    type: OfferingType,
    position: typeof OFFERING_POSITIONS.lightLeft,
    imageSrc: any
  ) => {
    const flip = 'flip' in position && position.flip;
    return (
      <Animated.View
        style={[
          styles.offeringItem,
          {
            left: position.left as `${number}%`,
            top: position.top as `${number}%`,
            width: position.width as `${number}%`,
            opacity: fadeAnims[type],
            transform: flip ? [{ scaleX: -1 }] : [],
          },
        ]}
      >
        <RNImage source={imageSrc} style={styles.offeringImage} resizeMode="contain" />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.mainLayout}>
        <View style={styles.altarContainer}>
          <RNImage
            source={require('../assets/images/bg.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />

          <Animated.View style={[styles.glowOverlay, { opacity: bgGlowAnim }]}>
            <RNImage
              source={require('../assets/images/bg1.jpg')}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          </Animated.View>

          {renderOfferingItem('light', OFFERING_POSITIONS.lightLeft, require('../assets/images/gd.png'))}
          {renderOfferingItem('light', OFFERING_POSITIONS.lightRight, require('../assets/images/gd.png'))}
          {renderOfferingItem('flower', OFFERING_POSITIONS.flowerLeft, require('../assets/images/gh.png'))}
          {renderOfferingItem('flower', OFFERING_POSITIONS.flowerRight, require('../assets/images/gh.png'))}
          {renderOfferingItem('mandala', OFFERING_POSITIONS.mandala, require('../assets/images/mcl.png'))}
          {renderOfferingItem('fruit', OFFERING_POSITIONS.fruit, require('../assets/images/gg.png'))}
          {renderOfferingItem('water', OFFERING_POSITIONS.water, require('../assets/images/gs.png'))}
          {renderOfferingItem('incense', OFFERING_POSITIONS.incense, require('../assets/images/gx.png'))}
        </View>

        <View style={styles.buttonsContainer}>
          <OfferingButton 
            type="light" 
            title="供灯" 
            onPress={() => handleOffering('light')} 
            disabled={offerings.light}
          />
          <OfferingButton 
            type="water" 
            title="供水" 
            onPress={() => handleOffering('water')} 
            disabled={offerings.water}
          />
          <OfferingButton 
            type="flower" 
            title="供花" 
            onPress={() => handleOffering('flower')} 
            disabled={offerings.flower}
          />
          <OfferingButton 
            type="fruit" 
            title="供食子" 
            onPress={() => handleOffering('fruit')} 
            disabled={offerings.fruit}
          />
          <OfferingButton 
            type="incense" 
            title="供香" 
            onPress={() => handleOffering('incense')} 
            disabled={offerings.incense}
          />
          <OfferingButton 
            type="mandala" 
            title="供曼达" 
            onPress={() => handleOffering('mandala')} 
            disabled={offerings.mandala}
          />
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface OfferingButtonProps {
  type: OfferingType;
  title: string;
  onPress: () => void;
  disabled: boolean;
}

function OfferingButton({ type, title, onPress, disabled }: OfferingButtonProps) {
  const iconColor = disabled ? '#81817e' : ICON_FILL;
  
  const renderIcon = () => {
    const size = 38;
    switch (type) {
      case 'light':
        return (
          <Svg width={size} height={size} viewBox="0 0 300 300">
            <G transform="translate(0, 511) scale(0.1, -0.1)">
              <Path
                fill={iconColor}
                d="M1480.9,4995.8c-102.3-119.3-199.8-256.4-240.7-337.5c-10.9-21.8-29.3-67.5-40.9-102.3c-19.8-57.3-21.1-68.2-18.4-128.9c2.7-57.9,6.1-71.6,27.9-117.9c96.8-202.5,360-248.8,518.2-91.4c133.7,133.6,124.1,325.2-27.9,555c-49.8,76.4-187.5,242.7-199.1,241.4C1497.9,5014.2,1489.8,5006,1480.9,4995.8z"
              />
              <Path
                fill={iconColor}
                d="M1397.7,3954.7v-71.6H744.5H90.7l-30-15.7C22.5,3846.9,0,3809.4,0,3765.8c0-59.3,101.6-324.5,207.9-540.7c118.7-242.1,244.1-433,369.6-563.2l58.6-60.7H1500h863.9l58.6,60.7c171.2,177.3,352.5,486.8,492.9,840.7c57.9,145.9,84.6,229.1,84.6,263.8c0,42.9-23.2,81.1-60.7,100.9l-30,15.7h-653.9h-653.2v71.6v71.6H1500h-102.3V3954.7z"
              />
              <Path
                fill={iconColor}
                d="M500.5,2463.5c-49.8-47.1-84.6-116.6-89.3-178.6c-3.4-40.9-2-47.1,11.6-62.1l15.7-17H1500h1061.6l15.7,17c13.6,15,15,21.1,11.6,62.1c-4.8,62.1-39.5,131.6-89.3,178.6L2462,2499h-962H538L500.5,2463.5z"
              />
            </G>
          </Svg>
        );
      case 'water':
        return (
          <Svg width={size} height={size} viewBox="0 0 300 300">
            <G transform="translate(0, 511) scale(0.1, -0.1)">
              <Path
                fill={iconColor}
                d="M1274.7,4701.8c-513.7-28.7-821.9-94.4-957.1-203.9c-64.2-52.9-74.1-107.3-47.6-262.9c97.5-571.8,392-971.4,821.1-1114.1c142.7-48.4,206.2-56.6,410.2-56.6c163.9,0,194.1,1.5,264.4,16.6c160.2,34.8,282.5,85.4,399.6,163.2c291.6,195.6,491,543.1,567.2,991c19.6,114.1,19.6,163.2-0.8,204.7c-60.4,124.6-346.7,211.5-830.2,251.5C1805.7,4699.5,1363.8,4707.1,1274.7,4701.8z M1807.2,4600.6c472.8-29.5,806.7-113.3,840.7-210.7c32.5-93.6-184.3-180.5-565-226.6c-191.1-23.4-335.4-31-581.6-31s-390.5,7.5-581.6,31c-308.2,37-517.4,103.5-561.2,178.3c-12.1,21.1-12.9,26.4-3,49.9c6,14.3,21.9,33.2,34.8,42.3c110.3,78.6,410.2,142,782.5,166.2C1315.5,4608.9,1667.5,4608.9,1807.2,4600.6z"
              />
              <Path
                fill={iconColor}
                d="M368.3,3420c-120.9-46.8-202.5-94.4-265.1-156.4C17,3178.2-14,3094.4,5.7,2997c21.9-114.1,101.2-199.4,253.8-275.7c547.7-274.2,1940.6-272.7,2487.5,2.3c173,86.9,254.5,192.6,253,329.3c-1.5,125.4-86.9,233.4-252.3,316.5c-77,38.5-181.3,76.3-196.4,71.8c-15.2-4.5-45.3-41.6-45.3-55.9c0-4.5,19.6-18.1,43.8-30.2c92.9-46.8,152.6-113.3,152.6-170c0-105-197.2-217.5-487.2-279.5c-224.3-46.8-435.1-67.2-713.8-67.2s-489.5,20.4-713.8,67.2c-290,62-487.2,174.5-487.2,279.5c0,56.6,52.9,117.1,144.3,165.4c28.7,15.1,52.1,31.7,52.1,37c0,14.4-41.6,57.4-54.4,57.4C437,3444.1,403.8,3432.8,368.3,3420z"
              />
            </G>
          </Svg>
        );
      case 'flower':
        return (
          <Svg width={size} height={size} viewBox="0 0 300 300">
            <G>
              <Path fill={iconColor} d="M159,33.4c3-41.9-28.3-32.6-28.3-32.6s-21.2,5.3-15.6,28c7.8,19.1,37,53.8,37,53.8S156,75.4,159,33.4z" />
              <Path fill={iconColor} d="M249.4,70.5c0,0-4.6-21.4-27.5-16.4c-19.3,7.2-54.9,35.3-54.9,35.3s7.1,4.1,48.9,8.4C257.8,102.1,249.4,70.5,249.4,70.5z" />
              <Path fill={iconColor} d="M201.9,7.4c0,0-19.3-10.4-30.3,10.2c-7.1,19.4-8.9,64.6-8.9,64.6s7.7-2.8,38.2-31.7S201.9,7.4,201.9,7.4z" />
              <Path fill={iconColor} d="M170.2,97.5c0,0,1.8,8,26.9,41.7c25.1,33.7,42.7,6.1,42.7,6.1s12.6-17.9-6.5-31.3C215,104.6,170.2,97.5,170.2,97.5z" />
              <Path fill={iconColor} d="M198,159.4c-7.3-19.3-35.6-54.7-35.6-54.7s-3.2,9.1-8.2,49c-5.2,41.7,27.4,33.3,27.4,33.3S203.1,182.2,198,159.4z" />
              <Path fill={iconColor} d="M70.5,46.1c0,0-11.3,18.7,8.6,30.8C98.2,85,143.3,89,143.3,89s-2.4-7.9-29.8-39.7C86.1,17.4,70.5,46.1,70.5,46.1z" />
              <Path fill={iconColor} d="M61.6,124.6c0,0,6.9,20.8,29,13.5c18.5-9.1,50.9-40.8,50.9-40.8S134,93.9,92,94C49.9,94.1,61.6,124.6,61.6,124.6z" />
              <Path fill={iconColor} d="M155.5,300h19.1c0,0-60.2-47.3-50.8-123.5c4.3-1.1,8-2.7,12.2-8.4c9.9-18.1,15.2-65.6,15.2-65.6s-10,5.9-39.3,29.3c-35.5,28.4-7.4,42.6-7.4,42.6s6.8,3.4,15.9,2.7C114.4,201.7,107.6,263.5,155.5,300z" />
              <Path fill={iconColor} d="M50.9,233.8C47.2,246,54.6,264,54.6,264c21.2,45.6,70.6,26,70.6,26C102.4,242.8,53.7,224.7,50.9,233.8z" />
            </G>
          </Svg>
        );
      case 'fruit':
        return (
          <Svg width={size} height={size} viewBox="0 0 300 300">
            <G transform="translate(0, 511) scale(0.1, -0.1)">
              <Path
                fill={iconColor}
                d="M2202.9,5105.7c-136-15.3-244.3-44.1-341.5-91.3c-176.6-84.8-298.5-229.6-352.6-417.4c-22.9-79.5-24.2-77.1,30-76c450.9,14.1,787.1,117.7,971.3,300.8c71.8,71.2,126.6,163.7,140.1,237.8l4.1,21.2l-31.8,6.5C2528.5,5106.3,2298.9,5116.3,2202.9,5105.7z"
              />
              <Path
                fill={iconColor}
                d="M1221,4817.2c-31.2-24.7-25.9-54.1,18.2-101.9c74.2-79.5,129.5-200.8,156-342l8.2-44.1l-33-3.5c-279.6-28.8-496.3-126.6-685.8-309.1c-558-538.7-405.5-1465.9,296.8-1800.9c178.4-85.4,385-120.7,582.8-100.1c349.7,35.3,656.4,229.6,840.1,530.4c231.9,380.9,208.4,875.4-59.5,1233.9c-189,252.5-462.1,408-777.1,442.7c-31.8,3.5-60.1,7.1-62.4,8.8c-2.4,1.2-5.9,16.5-8.2,33.5c-6.5,48.9-31.8,143.6-54.2,201.9c-35.3,91.8-94.8,184.3-151.3,237.2c-31.8,29.4-56.5,47.6-56.5,41.2z"
              />
            </G>
          </Svg>
        );
      case 'incense':
        return (
          <Svg width={size} height={size} viewBox="0 0 300 300">
            <G>
              <Path fill={iconColor} d="M145,5 L155,5 L155,180 L145,180 Z" />
              <Path fill={iconColor} d="M140,180 L160,180 L165,200 L135,200 Z" />
              <Path fill={iconColor} d="M130,200 L170,200 L175,220 L125,220 Z" />
              <Path fill={iconColor} d="M120,220 L180,220 Q190,260 150,290 Q110,260 120,220 Z" />
              <Path fill={iconColor} opacity="0.6" d="M147,0 Q140,-20 150,-30 Q160,-20 153,0 Q160,15 150,25 Q140,15 147,0" />
            </G>
          </Svg>
        );
      case 'mandala':
        return (
          <Svg width={size} height={size} viewBox="0 0 300 300">
            <G>
              <Path fill={iconColor} d="M150,20 L180,100 L260,100 L195,150 L220,230 L150,185 L80,230 L105,150 L40,100 L120,100 Z" />
              <Path fill={iconColor} d="M150,70 L165,115 L210,115 L175,145 L190,190 L150,165 L110,190 L125,145 L90,115 L135,115 Z" opacity="0.7" />
              <Path fill={iconColor} d="M150,250 L160,250 L160,290 L140,290 L140,250 Z" />
              <Path fill={iconColor} d="M120,285 L180,285 L185,295 L115,295 Z" />
            </G>
          </Svg>
        );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.offeringButton, disabled && styles.offeringButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {renderIcon()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    padding: 8,
  },
  mainLayout: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  altarContainer: {
    width: '100%',
    aspectRatio: 1170 / 1197,
    position: 'relative',
    borderRadius: DesignSystem.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#f0e6d6',
  },
  backgroundWrapper: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  offeringItem: {
    position: 'absolute',
  },
  offeringImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  offeringButton: {
    width: 48,
    height: 48,
    backgroundColor: BUTTON_BG,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offeringButtonDisabled: {
    opacity: 0.5,
  },
  resetButton: {
    width: 48,
    height: 48,
    backgroundColor: BUTTON_BG,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 24,
    color: ICON_FILL,
  },
});

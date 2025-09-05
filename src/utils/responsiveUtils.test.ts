import {
  DEVICE_SIZES,
  BREAKPOINTS,
  TOUCH_TARGETS,
  getDeviceType,
  DEVICE_INFO,
  scaleSize,
  verticalScale,
  moderateScale,
  getFontSize,
  getResponsiveSpacing,
  getSafeAreaPadding,
  isBreakpoint,
  getBreakpoint,
  getGridColumns,
  getContainerPadding,
  getTouchableArea,
  isLandscape,
  isPortrait,
  hp,
  wp,
  createResponsiveStyle,
  RESPONSIVE_VALUES,
  screenWidth,
  screenHeight,
} from './responsiveUtils';

// Mock react-native modules
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({
      width: 375, // iPhone 12 size
      height: 812,
      scale: 3,
    })),
  },
  PixelRatio: {
    get: jest.fn(() => 3),
    roundToNearestPixel: jest.fn((pixel: number) => Math.round(pixel)),
    getFontScale: jest.fn(() => 1),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('responsiveUtils', () => {
  const mockDimensions = require('react-native').Dimensions;
  const mockPixelRatio = require('react-native').PixelRatio;
  const mockPlatform = require('react-native').Platform;

  beforeEach(() => {
    // Reset to default iPhone 12 size
    mockDimensions.get.mockReturnValue({
      width: 375,
      height: 812,
      scale: 3,
    });
    mockPixelRatio.get.mockReturnValue(3);
    mockPixelRatio.getFontScale.mockReturnValue(1);
    mockPlatform.OS = 'ios';
  });

  describe('DEVICE_SIZES constants', () => {
    it('should have correct device size breakpoints', () => {
      expect(DEVICE_SIZES.SMALL_PHONE).toBe(320);
      expect(DEVICE_SIZES.MEDIUM_PHONE).toBe(375);
      expect(DEVICE_SIZES.LARGE_PHONE).toBe(414);
      expect(DEVICE_SIZES.EXTRA_LARGE_PHONE).toBe(428);
      expect(DEVICE_SIZES.TABLET).toBe(768);
      expect(DEVICE_SIZES.LARGE_TABLET).toBe(1024);
    });
  });

  describe('getDeviceType', () => {
    it('should detect small phone', () => {
      mockDimensions.get.mockReturnValue({ width: 320, height: 568, scale: 2 });
      expect(getDeviceType()).toBe('small-phone');
    });

    it('should detect medium phone', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812, scale: 3 });
      expect(getDeviceType()).toBe('medium-phone');
    });

    it('should detect large phone', () => {
      mockDimensions.get.mockReturnValue({ width: 414, height: 896, scale: 3 });
      expect(getDeviceType()).toBe('large-phone');
    });

    it('should detect extra large phone', () => {
      mockDimensions.get.mockReturnValue({ width: 428, height: 926, scale: 3 });
      expect(getDeviceType()).toBe('extra-large-phone');
    });

    it('should detect tablet', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024, scale: 2 });
      expect(getDeviceType()).toBe('tablet');
    });

    it('should detect large tablet', () => {
      mockDimensions.get.mockReturnValue({ width: 1024, height: 1366, scale: 2 });
      expect(getDeviceType()).toBe('large-tablet');
    });
  });

  describe('DEVICE_INFO', () => {
    it('should provide correct device information', () => {
      expect(DEVICE_INFO.width).toBe(375);
      expect(DEVICE_INFO.height).toBe(812);
      expect(DEVICE_INFO.scale).toBe(3);
      expect(DEVICE_INFO.pixelDensity).toBe(3);
      expect(DEVICE_INFO.type).toBe('medium-phone');
      expect(DEVICE_INFO.isSmallDevice).toBe(false);
      expect(DEVICE_INFO.isTablet).toBe(false);
      expect(DEVICE_INFO.isPhone).toBe(true);
      expect(DEVICE_INFO.hasNotch).toBe(true); // iPhone X+ detection
    });

    it('should detect small device', () => {
      mockDimensions.get.mockReturnValue({ width: 320, height: 568, scale: 2 });
      // Need to re-import to get updated values
      jest.resetModules();
      const { DEVICE_INFO: updatedInfo } = require('./responsiveUtils');
      expect(updatedInfo.isSmallDevice).toBe(true);
    });
  });

  describe('scaling functions', () => {
    describe('scaleSize', () => {
      it('should scale size based on screen width', () => {
        const scaledSize = scaleSize(16);
        const expectedScale = 375 / DEVICE_SIZES.MEDIUM_PHONE; // 1.0
        expect(scaledSize).toBe(16); // No scaling for base size
      });

      it('should clamp scaling between 0.85 and 1.3', () => {
        // Test with very small screen
        mockDimensions.get.mockReturnValue({ width: 200, height: 400, scale: 2 });
        jest.resetModules();
        const { scaleSize: smallScaleSize } = require('./responsiveUtils');
        
        const scaledSize = smallScaleSize(16);
        const minScale = 0.85;
        expect(scaledSize).toBe(Math.round(16 * minScale));
      });
    });

    describe('verticalScale', () => {
      it('should scale based on height', () => {
        const scaledHeight = verticalScale(100);
        const expectedScale = 812 / 812; // 1.0 for base height
        expect(scaledHeight).toBe(100);
      });

      it('should clamp vertical scaling between 0.8 and 1.2', () => {
        mockDimensions.get.mockReturnValue({ width: 375, height: 600, scale: 3 });
        jest.resetModules();
        const { verticalScale: smallVerticalScale } = require('./responsiveUtils');
        
        const scaledHeight = smallVerticalScale(100);
        const minScale = 0.8;
        expect(scaledHeight).toBe(Math.round(100 * minScale));
      });
    });

    describe('moderateScale', () => {
      it('should apply moderate scaling with default factor', () => {
        const moderateScaled = moderateScale(16);
        const scaledSize = scaleSize(16);
        const expected = 16 + (scaledSize - 16) * 0.5;
        expect(moderateScaled).toBe(expected);
      });

      it('should apply custom scaling factor', () => {
        const moderateScaled = moderateScale(16, 0.25);
        const scaledSize = scaleSize(16);
        const expected = 16 + (scaledSize - 16) * 0.25;
        expect(moderateScaled).toBe(expected);
      });
    });

    describe('getFontSize', () => {
      it('should scale font with accessibility support', () => {
        mockPixelRatio.getFontScale.mockReturnValue(1.2);
        const fontSize = getFontSize(16);
        const scaledSize = scaleSize(16);
        const accessibleSize = scaledSize * 1.2;
        const maxSize = scaledSize * 1.3;
        expect(fontSize).toBe(Math.min(accessibleSize, maxSize));
      });

      it('should limit maximum font size for readability', () => {
        mockPixelRatio.getFontScale.mockReturnValue(2.0); // Very large font scale
        const fontSize = getFontSize(16);
        const scaledSize = scaleSize(16);
        const maxSize = scaledSize * 1.3;
        expect(fontSize).toBe(maxSize);
      });
    });
  });

  describe('getResponsiveSpacing', () => {
    it('should return base spacing for medium devices', () => {
      expect(getResponsiveSpacing(16)).toBe(16);
    });

    it('should reduce spacing for small devices', () => {
      mockDimensions.get.mockReturnValue({ width: 320, height: 568, scale: 2 });
      jest.resetModules();
      const { getResponsiveSpacing: smallSpacing } = require('./responsiveUtils');
      
      expect(smallSpacing(16)).toBe(Math.max(16 * 0.75, 4));
    });

    it('should increase spacing for tablets', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024, scale: 2 });
      jest.resetModules();
      const { getResponsiveSpacing: tabletSpacing } = require('./responsiveUtils');
      
      expect(tabletSpacing(16)).toBe(16 * 1.25);
    });

    it('should ensure minimum spacing of 4', () => {
      mockDimensions.get.mockReturnValue({ width: 320, height: 568, scale: 2 });
      jest.resetModules();
      const { getResponsiveSpacing: smallSpacing } = require('./responsiveUtils');
      
      expect(smallSpacing(2)).toBe(4); // Should be clamped to minimum 4
    });
  });

  describe('getSafeAreaPadding', () => {
    it('should return iOS safe area padding', () => {
      const padding = getSafeAreaPadding();
      expect(padding.top).toBe(44);
      expect(padding.bottom).toBe(34); // iPhone X+ with notch
      expect(padding.left).toBe(0);
      expect(padding.right).toBe(0);
    });

    it('should return Android safe area padding', () => {
      mockPlatform.OS = 'android';
      jest.resetModules();
      const { getSafeAreaPadding: androidPadding } = require('./responsiveUtils');
      
      const padding = androidPadding();
      expect(padding.top).toBe(24);
      expect(padding.bottom).toBe(0);
    });

    it('should adjust padding for tablets', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024, scale: 2 });
      jest.resetModules();
      const { getSafeAreaPadding: tabletPadding } = require('./responsiveUtils');
      
      const padding = tabletPadding();
      expect(padding.top).toBe(44 + 10);
      expect(padding.bottom).toBe(34 + 10);
    });

    it('should adjust padding for small devices', () => {
      mockDimensions.get.mockReturnValue({ width: 320, height: 568, scale: 2 });
      jest.resetModules();
      const { getSafeAreaPadding: smallPadding } = require('./responsiveUtils');
      
      const padding = smallPadding();
      expect(padding.top).toBe(Math.max(44 - 8, 20));
    });
  });

  describe('breakpoint utilities', () => {
    describe('isBreakpoint', () => {
      it('should check if current width meets breakpoint', () => {
        expect(isBreakpoint('sm')).toBe(true); // 375 >= 320
        expect(isBreakpoint('md')).toBe(true); // 375 >= 375
        expect(isBreakpoint('lg')).toBe(false); // 375 < 414
        expect(isBreakpoint('xl')).toBe(false); // 375 < 768
      });
    });

    describe('getBreakpoint', () => {
      it('should return current breakpoint', () => {
        expect(getBreakpoint()).toBe('md'); // 375px = medium phone
      });

      it('should return correct breakpoint for different sizes', () => {
        mockDimensions.get.mockReturnValue({ width: 1024, height: 1366, scale: 2 });
        jest.resetModules();
        const { getBreakpoint: tabletBreakpoint } = require('./responsiveUtils');
        expect(tabletBreakpoint()).toBe('xxl');
      });

      it('should return xs for very small screens', () => {
        mockDimensions.get.mockReturnValue({ width: 200, height: 400, scale: 2 });
        jest.resetModules();
        const { getBreakpoint: smallBreakpoint } = require('./responsiveUtils');
        expect(smallBreakpoint()).toBe('xs');
      });
    });
  });

  describe('layout utilities', () => {
    describe('getGridColumns', () => {
      it('should return 2 columns for medium phones', () => {
        expect(getGridColumns()).toBe(2);
      });

      it('should return 1 column for small devices', () => {
        mockDimensions.get.mockReturnValue({ width: 320, height: 568, scale: 2 });
        jest.resetModules();
        const { getGridColumns: smallGrid } = require('./responsiveUtils');
        expect(smallGrid()).toBe(1);
      });

      it('should return 3 columns for tablets', () => {
        mockDimensions.get.mockReturnValue({ width: 768, height: 1024, scale: 2 });
        jest.resetModules();
        const { getGridColumns: tabletGrid } = require('./responsiveUtils');
        expect(tabletGrid()).toBe(3);
      });

      it('should return 4 columns for large tablets', () => {
        mockDimensions.get.mockReturnValue({ width: 1024, height: 1366, scale: 2 });
        jest.resetModules();
        const { getGridColumns: largeTabletGrid } = require('./responsiveUtils');
        expect(largeTabletGrid()).toBe(4);
      });
    });

    describe('getContainerPadding', () => {
      it('should return 16 for medium phones', () => {
        expect(getContainerPadding()).toBe(16);
      });

      it('should return 12 for small devices', () => {
        mockDimensions.get.mockReturnValue({ width: 320, height: 568, scale: 2 });
        jest.resetModules();
        const { getContainerPadding: smallPadding } = require('./responsiveUtils');
        expect(smallPadding()).toBe(12);
      });

      it('should return 24 for tablets', () => {
        mockDimensions.get.mockReturnValue({ width: 768, height: 1024, scale: 2 });
        jest.resetModules();
        const { getContainerPadding: tabletPadding } = require('./responsiveUtils');
        expect(tabletPadding()).toBe(24);
      });
    });

    describe('getTouchableArea', () => {
      it('should return minimum touch target size', () => {
        expect(getTouchableArea(20)).toBe(TOUCH_TARGETS.MIN_SIZE);
        expect(getTouchableArea(50)).toBe(50);
      });
    });
  });

  describe('orientation utilities', () => {
    it('should detect portrait orientation', () => {
      expect(isPortrait()).toBe(true); // 812 > 375
      expect(isLandscape()).toBe(false);
    });

    it('should detect landscape orientation', () => {
      mockDimensions.get.mockReturnValue({ width: 812, height: 375, scale: 3 });
      jest.resetModules();
      const { isLandscape: landscapeCheck, isPortrait: portraitCheck } = require('./responsiveUtils');
      
      expect(landscapeCheck()).toBe(true);
      expect(portraitCheck()).toBe(false);
    });
  });

  describe('percentage utilities', () => {
    it('should calculate height percentage', () => {
      expect(hp(50)).toBe((50 * 812) / 100);
      expect(hp(100)).toBe(812);
    });

    it('should calculate width percentage', () => {
      expect(wp(50)).toBe((50 * 375) / 100);
      expect(wp(100)).toBe(375);
    });
  });

  describe('createResponsiveStyle', () => {
    it('should return style for current breakpoint', () => {
      const styles = {
        xs: { fontSize: 12 },
        sm: { fontSize: 14 },
        md: { fontSize: 16 },
        lg: { fontSize: 18 },
      };

      expect(createResponsiveStyle(styles)).toEqual({ fontSize: 16 }); // md breakpoint
    });

    it('should fallback to available styles', () => {
      const styles = {
        xs: { fontSize: 12 },
        lg: { fontSize: 18 },
      };

      expect(createResponsiveStyle(styles)).toEqual({ fontSize: 18 }); // fallback to lg
    });

    it('should return undefined if no styles match', () => {
      const styles = {
        xxl: { fontSize: 20 },
      };

      expect(createResponsiveStyle(styles)).toBeUndefined();
    });
  });

  describe('TOUCH_TARGETS constants', () => {
    it('should have correct touch target sizes', () => {
      expect(TOUCH_TARGETS.MIN_SIZE).toBe(44);
      expect(TOUCH_TARGETS.COMFORTABLE_SIZE).toBe(48);
      expect(TOUCH_TARGETS.LARGE_SIZE).toBe(56);
      expect(TOUCH_TARGETS.ICON_BUTTON).toBe(44);
      expect(TOUCH_TARGETS.PRIMARY_BUTTON).toBe(48);
      expect(TOUCH_TARGETS.FAB).toBe(56);
      expect(TOUCH_TARGETS.MODAL_BUTTON).toBe(52);
    });
  });

  describe('RESPONSIVE_VALUES', () => {
    it('should provide responsive values for medium phone', () => {
      expect(RESPONSIVE_VALUES.headerHeight).toBe(70);
      expect(RESPONSIVE_VALUES.buttonHeight).toBe(44);
      expect(RESPONSIVE_VALUES.fabSize).toBe(56);
      expect(RESPONSIVE_VALUES.gridGap).toBe(12);
      expect(RESPONSIVE_VALUES.borderRadius).toBe(8);
      expect(RESPONSIVE_VALUES.iconSize).toBe(24);
      expect(RESPONSIVE_VALUES.largeIconSize).toBe(32);
    });

    it('should calculate modal sizes correctly', () => {
      expect(RESPONSIVE_VALUES.modalWidth).toBe(Math.min(375 * 0.9, 400));
      expect(RESPONSIVE_VALUES.modalMaxHeight).toBe(812 * 0.8);
    });
  });

  describe('exported dimensions', () => {
    it('should export correct screen dimensions', () => {
      expect(screenWidth).toBe(375);
      expect(screenHeight).toBe(812);
    });
  });
});
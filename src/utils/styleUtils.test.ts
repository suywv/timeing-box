import {
  createTextStyle,
  createContainerStyle,
  createCardStyle,
  createButtonStyle,
  textStyles,
  spacing,
  layout,
  colors,
  styles,
} from './styleUtils';

// Mock constants
jest.mock('../constants', () => ({
  TYPOGRAPHY: {
    size: {
      xs: 10,
      sm: 12,
      base: 14,
      lg: 16,
      xl: 18,
      '2xl': 20,
    },
    weight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
    },
  },
  COLORS: {
    text: {
      primary: '#000000',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#FFFFFF',
      disabled: '#CCCCCC',
    },
    surface: {
      primary: '#FFFFFF',
    },
    primary: '#007AFF',
    secondary: '#34C759',
  },
  LAYOUT: {
    borderRadius: {
      none: 0,
      sm: 4,
      base: 8,
      lg: 12,
      full: 9999,
    },
    shadow: {
      none: {},
      base: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    },
  },
  SPACING: {
    xs: 4,
    sm: 8,
    base: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
}));

describe('styleUtils', () => {
  describe('createTextStyle', () => {
    it('should create basic text style with defaults', () => {
      const style = createTextStyle({});
      
      expect(style).toEqual({
        fontSize: 14, // base
        fontWeight: '400', // regular
        color: '#000000', // primary text
        lineHeight: 14 * 1.4, // base * normal
        letterSpacing: 0, // normal
        textAlign: 'left',
      });
    });

    it('should apply custom options', () => {
      const style = createTextStyle({
        size: 'lg',
        weight: 'bold',
        color: '#FF0000',
        lineHeight: 'relaxed',
        letterSpacing: 'wide',
        textAlign: 'center',
        fontFamily: 'Arial',
      });
      
      expect(style).toEqual({
        fontSize: 16,
        fontWeight: '700',
        color: '#FF0000',
        lineHeight: 16 * 1.6,
        letterSpacing: 0.5,
        textAlign: 'center',
        fontFamily: 'Arial',
      });
    });

    it('should handle edge cases', () => {
      const style = createTextStyle({
        size: '2xl',
        weight: 'light',
        lineHeight: 'tight',
        letterSpacing: 'tight',
      });
      
      expect(style.fontSize).toBe(20);
      expect(style.fontWeight).toBe('300');
      expect(style.lineHeight).toBe(20 * 1.2);
      expect(style.letterSpacing).toBe(-0.5);
    });
  });

  describe('textStyles presets', () => {
    it('should have correct title style', () => {
      expect(textStyles.title.fontSize).toBe(20);
      expect(textStyles.title.fontWeight).toBe('700');
    });

    it('should have correct subtitle style', () => {
      expect(textStyles.subtitle.fontSize).toBe(14);
      expect(textStyles.subtitle.fontWeight).toBe('600');
    });

    it('should have correct body style', () => {
      expect(textStyles.body.fontSize).toBe(12);
      expect(textStyles.body.fontWeight).toBe('400');
    });

    it('should have correct secondary style', () => {
      expect(textStyles.secondary.fontSize).toBe(12);
      expect(textStyles.secondary.color).toBe('#666666');
    });

    it('should have correct caption style', () => {
      expect(textStyles.caption.fontSize).toBe(10);
      expect(textStyles.caption.color).toBe('#999999');
    });

    it('should have correct button style', () => {
      expect(textStyles.button.fontWeight).toBe('600');
      expect(textStyles.button.color).toBe('#FFFFFF');
    });
  });

  describe('createContainerStyle', () => {
    it('should create basic container style', () => {
      const style = createContainerStyle({});
      expect(style).toEqual({});
    });

    it('should apply spacing options', () => {
      const style = createContainerStyle({
        padding: 'md',
        paddingHorizontal: 'lg',
        paddingVertical: 'sm',
        margin: 'base',
        marginHorizontal: 'xl',
        marginVertical: 'xs',
      });
      
      expect(style).toEqual({
        padding: 16,
        paddingHorizontal: 20,
        paddingVertical: 8,
        margin: 12,
        marginHorizontal: 24,
        marginVertical: 4,
      });
    });

    it('should apply visual options', () => {
      const style = createContainerStyle({
        backgroundColor: '#FF0000',
        borderRadius: 'lg',
        shadow: 'base',
        borderColor: '#00FF00',
        borderWidth: 2,
      });
      
      expect(style).toEqual({
        backgroundColor: '#FF0000',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderColor: '#00FF00',
        borderWidth: 2,
      });
    });
  });

  describe('createCardStyle', () => {
    it('should create default card style', () => {
      const style = createCardStyle();
      
      expect(style.backgroundColor).toBe('#FFFFFF');
      expect(style.padding).toBe(16); // md
      expect(style.margin).toBe(8); // sm
      expect(style.borderRadius).toBe(8); // base
      expect(style.shadowColor).toBe('#000'); // base shadow
    });

    it('should create card without elevation', () => {
      const style = createCardStyle({ elevated: false });
      expect(style.shadowColor).toBeUndefined();
      expect(style.shadowOffset).toBeUndefined();
    });

    it('should apply custom options', () => {
      const style = createCardStyle({
        padding: 'lg',
        margin: 'xl',
        borderRadius: 'full',
      });
      
      expect(style.padding).toBe(20);
      expect(style.margin).toBe(24);
      expect(style.borderRadius).toBe(9999);
    });
  });

  describe('createButtonStyle', () => {
    it('should create default primary button', () => {
      const style = createButtonStyle();
      
      expect(style.backgroundColor).toBe('#007AFF');
      expect(style.borderRadius).toBe(9999);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
      expect(style.paddingHorizontal).toBe(16); // md
      expect(style.paddingVertical).toBe(8); // sm
      expect(style.minHeight).toBe(44);
    });

    it('should create secondary button', () => {
      const style = createButtonStyle({ variant: 'secondary' });
      expect(style.backgroundColor).toBe('#34C759');
    });

    it('should create outline button', () => {
      const style = createButtonStyle({ variant: 'outline' });
      
      expect(style.backgroundColor).toBe('transparent');
      expect(style.borderWidth).toBe(1);
      expect(style.borderColor).toBe('#007AFF');
    });

    it('should create ghost button', () => {
      const style = createButtonStyle({ variant: 'ghost' });
      expect(style.backgroundColor).toBe('transparent');
      expect(style.borderWidth).toBeUndefined();
    });

    it('should handle different sizes', () => {
      const smallStyle = createButtonStyle({ size: 'sm' });
      const largeStyle = createButtonStyle({ size: 'lg' });
      
      expect(smallStyle.paddingHorizontal).toBe(8); // sm
      expect(smallStyle.minHeight).toBe(32);
      
      expect(largeStyle.paddingHorizontal).toBe(20); // lg
      expect(largeStyle.minHeight).toBe(52);
    });

    it('should handle full width option', () => {
      const style = createButtonStyle({ fullWidth: true });
      expect(style.width).toBe('100%');
    });

    it('should handle disabled state', () => {
      const style = createButtonStyle({ disabled: true });
      
      expect(style.backgroundColor).toBe('#CCCCCC');
      expect(style.opacity).toBe(0.6);
    });

    it('should handle disabled outline button', () => {
      const style = createButtonStyle({ variant: 'outline', disabled: true });
      
      expect(style.backgroundColor).toBe('transparent');
      expect(style.borderColor).toBe('#CCCCCC');
      expect(style.opacity).toBe(0.6);
    });
  });

  describe('spacing utilities', () => {
    it('should create padding utilities', () => {
      expect(spacing.p('md')).toEqual({ padding: 16 });
      expect(spacing.px('lg')).toEqual({ paddingHorizontal: 20 });
      expect(spacing.py('sm')).toEqual({ paddingVertical: 8 });
      expect(spacing.pt('xs')).toEqual({ paddingTop: 4 });
      expect(spacing.pb('base')).toEqual({ paddingBottom: 12 });
      expect(spacing.pl('xl')).toEqual({ paddingLeft: 24 });
      expect(spacing.pr('md')).toEqual({ paddingRight: 16 });
    });

    it('should create margin utilities', () => {
      expect(spacing.m('md')).toEqual({ margin: 16 });
      expect(spacing.mx('lg')).toEqual({ marginHorizontal: 20 });
      expect(spacing.my('sm')).toEqual({ marginVertical: 8 });
      expect(spacing.mt('xs')).toEqual({ marginTop: 4 });
      expect(spacing.mb('base')).toEqual({ marginBottom: 12 });
      expect(spacing.ml('xl')).toEqual({ marginLeft: 24 });
      expect(spacing.mr('md')).toEqual({ marginRight: 16 });
    });
  });

  describe('layout utilities', () => {
    it('should create flex utilities', () => {
      expect(layout.flex()).toEqual({ flex: 1 });
      expect(layout.flex(2)).toEqual({ flex: 2 });
      expect(layout.flexRow()).toEqual({ flexDirection: 'row' });
      expect(layout.flexCol()).toEqual({ flexDirection: 'column' });
    });

    it('should create alignment utilities', () => {
      expect(layout.itemsCenter()).toEqual({ alignItems: 'center' });
      expect(layout.itemsStart()).toEqual({ alignItems: 'flex-start' });
      expect(layout.itemsEnd()).toEqual({ alignItems: 'flex-end' });
      
      expect(layout.justifyCenter()).toEqual({ justifyContent: 'center' });
      expect(layout.justifyStart()).toEqual({ justifyContent: 'flex-start' });
      expect(layout.justifyEnd()).toEqual({ justifyContent: 'flex-end' });
      expect(layout.justifyBetween()).toEqual({ justifyContent: 'space-between' });
      expect(layout.justifyAround()).toEqual({ justifyContent: 'space-around' });
    });

    it('should create position utilities', () => {
      expect(layout.absolute()).toEqual({ position: 'absolute' });
      expect(layout.relative()).toEqual({ position: 'relative' });
    });

    it('should create size utilities', () => {
      expect(layout.wFull()).toEqual({ width: '100%' });
      expect(layout.hFull()).toEqual({ height: '100%' });
      expect(layout.square(50)).toEqual({ width: 50, height: 50 });
    });

    it('should create border radius utilities', () => {
      expect(layout.rounded('base')).toEqual({ borderRadius: 8 });
      expect(layout.rounded('full')).toEqual({ borderRadius: 9999 });
    });

    it('should create shadow utilities', () => {
      const shadow = layout.shadow('base');
      expect(shadow.shadowColor).toBe('#000');
      expect(shadow.elevation).toBe(2);
    });
  });

  describe('colors utilities', () => {
    it('should create color utilities', () => {
      expect(colors.bg('#FF0000')).toEqual({ backgroundColor: '#FF0000' });
      expect(colors.text('#00FF00')).toEqual({ color: '#00FF00' });
      expect(colors.border('#0000FF')).toEqual({ borderColor: '#0000FF' });
    });
  });

  describe('combined styles object', () => {
    it('should include all utilities', () => {
      expect(styles.p).toBeDefined();
      expect(styles.flex).toBeDefined();
      expect(styles.bg).toBeDefined();
      expect(styles.text).toBeDefined();
      expect(styles.card).toBeDefined();
      expect(styles.button).toBeDefined();
      expect(styles.container).toBeDefined();
    });

    it('should work as expected', () => {
      expect(styles.p('md')).toEqual({ padding: 16 });
      expect(styles.flex(2)).toEqual({ flex: 2 });
      expect(styles.bg('#FF0000')).toEqual({ backgroundColor: '#FF0000' });
      
      expect(styles.text.title.fontSize).toBe(20);
      expect(typeof styles.card).toBe('function');
      expect(typeof styles.button).toBe('function');
      expect(typeof styles.container).toBe('function');
    });
  });
});
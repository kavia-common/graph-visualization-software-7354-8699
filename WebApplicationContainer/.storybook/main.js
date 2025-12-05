/**
 * Storybook v8 configuration.
 * Uses the @storybook/react-vite framework to avoid legacy webpack preset errors.
 */
export default {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
  ],
  docs: {
    autodocs: true,
  },
};

module.exports = {
  stories: ['../src/components/**/*.stories.@(js|jsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-links', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react',
    options: {},
  },
};

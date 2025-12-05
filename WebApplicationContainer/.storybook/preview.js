/**
 * Global Storybook parameters and decorators (v8).
 * Keep defaults minimal; users can expand as needed.
 */
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
  },
};

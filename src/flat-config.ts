import requireMemoRule from "./require-memo";
import requireUseMemoRule from "./require-usememo/index";
import requireUseMemoChildrenRule from "./require-usememo-children";

/**
 * Plugin definition for ESLint flat config format (v9)
 */
export const flatConfig = {
  meta: {
    name: '@arthurgeron/eslint-plugin-react-usememo',
    version: '2.5.0'
  },
  rules: {
    'require-memo': requireMemoRule,
    'require-usememo': requireUseMemoRule,
    'require-usememo-children': requireUseMemoChildrenRule,
  }
};

// Add configs after defining the plugin to reference the plugin itself
Object.defineProperty(flatConfig, 'configs', {
  value: {
    recommended: {
      plugins: {
        '@arthurgeron/react-usememo': flatConfig
      },
      rules: {
        '@arthurgeron/react-usememo/require-usememo': 'error',
        '@arthurgeron/react-usememo/require-memo': 'error',
        '@arthurgeron/react-usememo/require-usememo-children': 'error',
      },
    },
  }
}); 
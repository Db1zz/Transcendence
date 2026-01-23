import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ ignores: ["dist", "build", "node_modules"] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["**/*.{js,jsx,ts,tsx"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOption: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		rules: {
			"react/react-in-jsx-scope": "off",
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},

	prettier,
];
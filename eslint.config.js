import { default as defaultConfig } from '@epic-web/config/eslint'

/** @type {import("eslint").Linter.Config} */
export default [
	...defaultConfig,
	// add custom config objects here:
	{
        parserOptions: {
            projectService: {
                maximumDefaultProjectFileMatchCount: 20 // Adjust this value as needed
            }
        }
    }
]

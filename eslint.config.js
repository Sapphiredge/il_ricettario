import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'error',
            'no-console': 'off',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single']
        },
        languageOptions: {
            globals: {
                // Browser and node globals
                require: 'readonly',
                module: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                console: 'readonly',
                Buffer: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                exports: 'readonly',
                fetch: 'readonly',
                window: 'readonly',
                document: 'readonly',
                alert: 'readonly',
                confirm: 'readonly',
                prompt: 'readonly',
                location: 'readonly',
                history: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                navigator: 'readonly',
                parseInt: 'readonly',
                isNaN: 'readonly',

                // Third-party libraries
                bootstrap: 'readonly',
                AOS: 'readonly',
                Swal: 'readonly',
                page: 'readonly',
                DOMParser: 'readonly'
            }
        }
    }
];

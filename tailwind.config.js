import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    gold: '#F5B800',
                    'gold-dark': '#D4A000',
                    black: '#1A1A1A',
                    cream: '#FFF8E7',
                    'cream-dark': '#FFF0CC',
                },
            },
            boxShadow: {
                brutal: '4px 4px 0 0 #1A1A1A',
                'brutal-sm': '2px 2px 0 0 #1A1A1A',
            },
            borderWidth: {
                3: '3px',
            },
        },
    },

    plugins: [forms],
};

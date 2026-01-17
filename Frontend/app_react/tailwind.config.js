/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				'brand-green': '#9E9D89',
				'brand-beige': '#E4D3CF',
				'brand-peach': '#E2BCB7',
				'brand-brick': '#B67162'
			},
			boxShadow: {
				'sharp': '15px 20px 0px rgba(0, 0, 0, 1)',
				'sharp-button': '5px 6px 0px rgba(0, 0, 0, 1)',
				'sharp-md': '8px 10px 0px rgba(0, 0, 0, 1)',
				'sharp-xs': '2px 2px 0px rgba(0, 0, 0, 1)'
			},
			fontFamily: {
				'ananias': ['ananias', 'sans-serif'],
				'roboto': ['Roboto', 'sans-serif'],
			},
			keyframes: {
				'slide-up': {
					'0%': { opacity: '0', transform: 'translate(-50%, -40%)' },
					'100%': { opacity: '1', transform: 'translate(-50%, -50%)' },
				},
				'expand': {
					'0%': { transform: 'translate(-50%, -50%) scale(0.95)' },
					'100%': { transform: 'translate(-50%, -50%) scale(1)' }, 
				},
				'enter': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				}
			},
			animation: {
				'slide-up': 'slide-up 0.3s ease-out',
				'expand': 'expand 0.3s ease-out',
				'enter': 'enter 0.3s ease-out forwards',
			}
		},
	},
	plugins: [],
}

//border-2 border-gray-800 -- for borders

//border-2 border-gray-800 -- for borders
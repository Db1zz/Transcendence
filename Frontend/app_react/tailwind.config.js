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
				'sharp-button': '5px 6px 0px rgba(0, 0, 0, 1)'
			},
			fontFamily: {
				'ananias': ['ananias', 'sans-serif'],
			}
		},
	},
	plugins: [],
}

//border-2 border-gray-800 -- for borders
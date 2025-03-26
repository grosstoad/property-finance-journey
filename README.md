# Property Finance Journey

A comprehensive property finance calculator that helps users understand their borrowing power and explore loan options.

## Features

- **Affordability Calculator**
  - Real-time borrowing power calculation
  - Dynamic LVR-based interest rates
  - Personalized improvement suggestions
  - Interactive slider for loan amount exploration

- **Financial Assessment**
  - Income shading based on income type
  - HEM (Household Expenditure Measure) integration
  - Credit commitment assessment
  - Buffered serviceability calculation

- **Deposit Calculator**
  - Stamp duty calculation by state
  - First home buyer concessions
  - Upfront costs estimation
  - LVR band optimization

- **Loan Options**
  - Product matching based on LVR
  - Interest rate customization
  - Repayment calculation
  - Feature comparison

## Technical Documentation

For detailed information about the core calculations and logic, see:
- [Technical Calculations Documentation](docs/TECHNICAL_CALCULATIONS.md)

## Project Structure

```
src/
├── components/          # React components
│   ├── AffordabilityCalculator/
│   ├── FinancialsModal/
│   └── PropertyFinanceJourney/
├── logic/              # Business logic
│   ├── maxBorrow/      # Borrowing calculations
│   ├── hemService.ts   # HEM calculations
│   └── taxService.ts   # Tax calculations
├── types/              # TypeScript types
├── constants/          # Configuration
└── contexts/           # React contexts
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Technology Stack

- React + TypeScript
- Material UI
- Vite
- Jest + React Testing Library

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## React + TypeScript + Vite

This project uses React with TypeScript and Vite for fast development.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## PropTrack API Setup

To use the PropTrack API integration:

1. Create a `.env` file in the project root
2. Add your PropTrack API credentials:
```
VITE_PROPTRACK_API_KEY=your_api_key_here
VITE_PROPTRACK_API_SECRET=your_api_secret_here
VITE_PROPTRACK_API_URL=https://data.proptrack.com
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

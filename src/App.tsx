import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './constants/theme';
import { PropertyProvider } from './contexts/PropertyContext';
import { LoanProvider } from './contexts/LoanContext';
import { HomePage } from './pages/HomePage';
import { PropTrackTestPage } from './pages/PropTrackTestPage';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <PropertyProvider>
              <LoanProvider>
                <HomePage />
              </LoanProvider>
            </PropertyProvider>
          } />
          <Route path="/proptrack-test" element={<PropTrackTestPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

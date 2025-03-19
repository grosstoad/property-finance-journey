import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { theme } from "./constants/theme";
import { PropertyProvider } from "./contexts/PropertyContext";
import { LoanProvider } from "./contexts/LoanContext";
import { HomePage } from "./pages/HomePage";
import { PropTrackTestPage } from "./pages/PropTrackTestPage";
import { PropTrackHooksPage } from "./pages/PropTrackHooksPage";

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PropertyProvider>
                <LoanProvider>
                  <HomePage />
                </LoanProvider>
              </PropertyProvider>
            }
          />
          <Route path="/test" element={<PropTrackTestPage />} />
          <Route path="/hooks" element={<PropTrackHooksPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

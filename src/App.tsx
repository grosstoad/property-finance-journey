import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { theme } from "./constants/theme";
import { PropertyProvider } from "./contexts/PropertyContext";
import { LoanProvider } from "./contexts/LoanContext";
import { FinancialsProvider } from "./contexts/FinancialsContext";
import { AffordabilityProvider } from "./contexts/AffordabilityContext";
import { HomePage } from "./pages/HomePage";
import { PropTrackTestPage } from "./pages/PropTrackTestPage";
import { PropTrackHooksPage } from "./pages/PropTrackHooksPage";
import { DepositCalculatorPage } from "./pages/DepositCalculatorPage";
import { YourFinancialsTest } from "./pages/YourFinancialsTest";
import { NavBar } from "./components/NavBar";
import { Box } from "@mui/material";

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar />
          <Box sx={{ flexGrow: 1 }}>
            <Routes>
              <Route
                path="/"
                element={
                  <PropertyProvider>
                    <LoanProvider>
                      <FinancialsProvider>
                        <AffordabilityProvider>
                          <HomePage />
                        </AffordabilityProvider>
                      </FinancialsProvider>
                    </LoanProvider>
                  </PropertyProvider>
                }
              />
              <Route path="/test" element={<PropTrackTestPage />} />
              <Route path="/hooks" element={<PropTrackHooksPage />} />
              <Route path="/calculator" element={<DepositCalculatorPage />} />
              <Route path="/components-test" element={<YourFinancialsTest />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

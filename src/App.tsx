import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeProvider from '@mui/material/styles/ThemeProvider';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import theme from './theme';
import ContextProviders from './providers';
import { HomePage, NotFoundPage, SettingsPage } from './pages';
import LoginPage from './pages/Login/LoginPage';

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                <ContextProviders>
                    <Routes>
                        <Route index element={<HomePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </ContextProviders>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;

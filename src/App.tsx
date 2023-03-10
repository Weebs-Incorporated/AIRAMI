import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import ContextProviders from './providers';
import {
    HomePage,
    NotFoundPage,
    SettingsPage,
    LoginPage,
    ProfilePage,
    UsersPage,
    SubmissionsPage,
    SingleSubmissionPage,
    SinglePostPage,
} from './pages';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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
                        <Route path="users" element={<UsersPage />} />
                        <Route path="users/:id" element={<ProfilePage />} />
                        <Route path="submissions" element={<SubmissionsPage />} />
                        <Route path="submissions/:id" element={<SingleSubmissionPage />} />
                        <Route path="posts/:id" element={<SinglePostPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </ContextProviders>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;

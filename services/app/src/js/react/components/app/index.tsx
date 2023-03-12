import { CssBaseline, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SendNotificationButton from '../send-notification-button';

export default function App() {
  const useLightTheme = useMediaQuery('(prefers-color-scheme: light)');
  const theme = createTheme({
    palette: {
      mode: useLightTheme ? 'light' : 'dark',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SendNotificationButton />
    </ThemeProvider>
  );
}

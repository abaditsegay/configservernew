import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Import components
import Navigation from './components/Navigation';
import Home from './pages/Home';
import ConfigurationRetrieval from './pages/ConfigurationRetrieval';
import UpdateProperty from './pages/UpdateProperty';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/config-retrieval" element={<ConfigurationRetrieval />} />
            <Route path="/update-property" element={<UpdateProperty />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

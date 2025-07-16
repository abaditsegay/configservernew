import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  ContentCopy,
  Download
} from '@mui/icons-material';
import ConfigService from '../services/ConfigService';

function ConfigurationRetrieval() {
  const [application, setApplication] = useState('');
  const [environment, setEnvironment] = useState('LOCAL');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Available applications
  const applications = ['myapp', 'app2'];
  
  // Available environments
  const environments = ['LOCAL', 'DIF'];

  const handleRetrieveDbProperties = async () => {
    if (!application) {
      setError('Please select an application');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Retrieve properties from client applications in the selected environment
      const result = await ConfigService.getClientApplicationProperties(application, environment);
      setConfig(result);
    } catch (err) {
      setError(err.message || 'Failed to retrieve properties from client applications');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadConfig = () => {
    if (!config) return;
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${application || 'app'}-${environment}-client-config.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderPropertiesAsText = () => {
    if (!config || !config.propertySources) return '';

    let propertiesText = '';
    
    config.propertySources.forEach((source, index) => {
      if (source.source && Object.keys(source.source).length > 0) {
        propertiesText += `# ${source.name || `Property Source ${index + 1}`}\n`;
        propertiesText += `# Properties: ${Object.keys(source.source).length}\n\n`;
        
        Object.entries(source.source).forEach(([key, value]) => {
          const displayValue = typeof value === 'object' 
            ? JSON.stringify(value) 
            : String(value);
          propertiesText += `${key}=${displayValue}\n`;
        });
        
        propertiesText += '\n';
      }
    });
    
    return propertiesText.trim();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" component="h1">
            Configuration Retrieval
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Retrieve and explore configuration properties from client applications
        </Typography>
      </Paper>

      {/* Configuration Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Configuration Parameters
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Application Name</InputLabel>
              <Select
                value={application}
                label="Application Name"
                onChange={(e) => setApplication(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Select Application</em>
                </MenuItem>
                {applications.map((app) => (
                  <MenuItem key={app} value={app}>
                    {app}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Environment</InputLabel>
              <Select
                value={environment}
                label="Environment"
                onChange={(e) => setEnvironment(e.target.value)}
              >
                {environments.map((env) => (
                  <MenuItem key={env} value={env}>
                    {env}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="info"
            startIcon={loading ? <CircularProgress size={20} /> : null}
            onClick={handleRetrieveDbProperties}
            disabled={loading || !application}
            size="large"
          >
            {loading ? 'Retrieving...' : 'Retrieve Client Properties'}
          </Button>
          
          {config && (
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadConfig}
              size="large"
            >
              Download JSON
            </Button>
          )}
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Configuration Result */}
      {config && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Configuration Result</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={`App: ${config.name || 'N/A'}`} color="primary" />
              <Chip label={`Environment: ${environment}`} color="secondary" />
              <Chip label={`Label: ${config.label || 'N/A'}`} color="default" />
            </Box>
          </Box>
          
          {/* Properties Display */}
          <Typography variant="h6" gutterBottom>
            Properties
          </Typography>
          <TextField
            multiline
            fullWidth
            rows={20}
            value={renderPropertiesAsText()}
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                backgroundColor: '#f8f9fa'
              }
            }}
            variant="outlined"
            placeholder="Properties will appear here..."
          />
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={() => copyToClipboard(renderPropertiesAsText())}
              size="small"
            >
              Copy All Properties
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadConfig}
              size="small"
            >
              Download JSON
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default ConfigurationRetrieval;

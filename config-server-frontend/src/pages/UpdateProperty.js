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
  Chip,
  Divider
} from '@mui/material';
import {
  Save,
  Refresh,
  Info
} from '@mui/icons-material';
import ConfigService from '../services/ConfigService';

function UpdateProperty() {
  const [application, setApplication] = useState('');
  const [environment, setEnvironment] = useState('LOCAL');
  const [propertyKey, setPropertyKey] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [availableProperties, setAvailableProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Application options
  const applications = ['myapp', 'app2'];
  const environments = ['LOCAL', 'DIF'];

  /**
   * Fetch available properties from client applications
   */
  const handleFetchProperties = async () => {
    if (!application) {
      setError('Please select an application first');
      return;
    }

    setLoadingProperties(true);
    setError('');
    setAvailableProperties([]);
    setPropertyKey('');
    setCurrentValue('');
    setPropertyValue('');

    try {
      const config = await ConfigService.getClientApplicationProperties(application, environment);
      
      // Extract all unique property keys from all property sources
      const propertyKeys = new Set();
      config.propertySources.forEach(source => {
        if (source.source) {
          Object.keys(source.source).forEach(key => {
            propertyKeys.add(key);
          });
        }
      });

      const sortedKeys = Array.from(propertyKeys).sort();
      setAvailableProperties(sortedKeys);
      
      if (sortedKeys.length === 0) {
        setError('No properties found for this application and environment');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(`Failed to fetch properties: ${error.message}`);
    } finally {
      setLoadingProperties(false);
    }
  };

  /**
   * Handle property key selection - automatically get current value
   */
  const handlePropertyKeyChange = async (selectedKey) => {
    setPropertyKey(selectedKey);
    setCurrentValue('');
    setPropertyValue('');
    setError('');

    if (!selectedKey) return;

    try {
      const config = await ConfigService.getClientApplicationProperties(application, environment);
      
      // Search for the property in all property sources
      let foundValue = null;
      config.propertySources.forEach(source => {
        if (source.source && source.source[selectedKey] !== undefined) {
          foundValue = source.source[selectedKey];
        }
      });

      if (foundValue !== null) {
        setCurrentValue(foundValue);
        setPropertyValue(foundValue); // Pre-fill the new value field
      } else {
        setCurrentValue('Property not found');
        setPropertyValue('');
      }
    } catch (error) {
      console.error('Error retrieving property value:', error);
      setError(`Failed to retrieve property value: ${error.message}`);
    }
  };

  /**
   * Update property value in the config server database
   */
  const handleUpdateProperty = async () => {
    if (!application || !propertyKey || propertyValue === '') {
      setError('Please fill in all required fields');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      // Determine the profile based on environment
      // For this example, we'll use 'dev' for LOCAL and 'prod' for DIF
      const profile = environment === 'LOCAL' ? 'dev' : 'prod';
      
      // Update property in the config server database
      console.log(`Updating property ${propertyKey} for ${application}/${profile}/master`);
      
      // Try comprehensive property update (tries multiple methods)
      const updateResult = await ConfigService.updatePropertyComprehensive(
        application, 
        profile, 
        propertyKey, 
        propertyValue, 
        'master'
      );
      
      console.log('Property update result:', updateResult);
      
      setSuccess(
        `Property '${propertyKey}' has been ${updateResult.data?.operation || 'updated'} in the database using ${updateResult.method}.`
      );
      
      // Update the current value display
      setCurrentValue(propertyValue);
      
    } catch (error) {
      console.error('Error updating property:', error);
      setError(`Failed to update property: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Clear all fields
   */
  const handleClear = () => {
    setApplication('');
    setEnvironment('LOCAL');
    setPropertyKey('');
    setPropertyValue('');
    setCurrentValue('');
    setAvailableProperties([]);
    setError('');
    setSuccess('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Save />
          Update Property
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Update configuration properties in the database.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Configuration Form */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Application</InputLabel>
              <Select
                value={application}
                onChange={(e) => setApplication(e.target.value)}
                label="Application"
              >
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
                onChange={(e) => setEnvironment(e.target.value)}
                label="Environment"
              >
                {environments.map((env) => (
                  <MenuItem key={env} value={env}>
                    {env}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleFetchProperties}
                disabled={loadingProperties || !application}
                startIcon={loadingProperties ? <CircularProgress size={16} /> : <Refresh />}
                sx={{ minWidth: 200 }}
              >
                {loadingProperties ? 'Fetching...' : 'Fetch Properties'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                Click to load available properties for the selected application and environment
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Property Key</InputLabel>
              <Select
                value={propertyKey}
                onChange={(e) => handlePropertyKeyChange(e.target.value)}
                label="Property Key"
                disabled={availableProperties.length === 0}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>{availableProperties.length === 0 ? 'No properties available - click Fetch Properties first' : 'Select a property key'}</em>
                </MenuItem>
                {availableProperties.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
              {availableProperties.length > 0 && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {availableProperties.length} properties available
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Value"
              value={currentValue}
              InputProps={{
                readOnly: true,
                sx: {
                  backgroundColor: '#f5f5f5'
                }
              }}
              placeholder="Select a property key to see its current value"
              helperText="This field shows the current value of the selected property"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="New Property Value"
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              placeholder="Enter the new value for this property"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleUpdateProperty}
            disabled={updating || !application || !propertyKey || propertyValue === ''}
            startIcon={updating ? <CircularProgress size={16} /> : <Save />}
            size="large"
          >
            {updating ? 'Updating...' : 'Update Property'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={loading || updating}
            size="large"
          >
            Clear All
          </Button>
        </Box>

        {/* Status Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {success}
          </Alert>
        )}

        {/* Information Box */}
        <Paper sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info />
            How to Use Update Property
          </Typography>
          <Typography variant="body2" component="div">
            <ol>
              <li><strong>Select Application & Environment:</strong> Choose the target application and environment</li>
              <li><strong>Fetch Properties:</strong> Click "Fetch Properties" to load all available configuration keys</li>
              <li><strong>Select Property Key:</strong> Choose the property you want to update from the dropdown</li>
              <li><strong>Review Current Value:</strong> The current value will be displayed automatically</li>
              <li><strong>Set New Value:</strong> Enter the new value for the property</li>
              <li><strong>Update Property:</strong> Apply the change to the database</li>
            </ol>
            <Typography variant="caption" display="block" sx={{ mt: 2, fontStyle: 'italic' }}>
              <strong>Important:</strong> Property updates require the config server to have admin/database access endpoints enabled. 
              The system will try multiple update methods (admin API, SQL direct, H2 database) to ensure the property is updated. 
              Changes are persisted to the configuration database only.
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'warning.main' }}>
              <strong>Note:</strong> If database updates fail, you may need to manually update properties in the H2 console 
              at http://localhost:8888/h2-console (JDBC URL: jdbc:h2:mem:configdb, User: sa, Password: password).
            </Typography>
          </Typography>
        </Paper>
      </Paper>
    </Container>
  );
}

export default UpdateProperty;

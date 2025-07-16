import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Psychology,
  Refresh,
  Dashboard,
  Computer
} from '@mui/icons-material';
import ConfigService from '../services/ConfigService';
import RefreshResultDisplay from '../components/RefreshResultDisplay';

function Home() {
  const [environment, setEnvironment] = useState('LOCAL');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshResult, setRefreshResult] = useState(null);

  const environments = [
    { value: 'LOCAL', label: 'LOCAL' },
    { value: 'DIF', label: 'DIF' }
  ];

  // Get hosts for the selected environment
  const getSelectedEnvironmentHosts = () => {
    const envConfig = ConfigService.getEnvironments();
    return envConfig[environment] || [];
  };

  // Generate hosts display text with status indicators
  const getHostsDisplayText = () => {
    const hosts = getSelectedEnvironmentHosts();
    if (hosts.length === 0) {
      return 'No hosts configured for this environment';
    }

    return hosts.map(host => {
      const wasSuccessful = refreshResult?.results?.some(r => r.host === host);
      const hadError = refreshResult?.errors?.some(e => e.host === host);
      
      let status = '';
      if (wasSuccessful) {
        status = ' ✓ SUCCESS';
      } else if (hadError) {
        const error = refreshResult.errors.find(e => e.host === host);
        status = ` ✗ FAILED - ${error?.error || 'Unknown error'}`;
      } else {
        status = ' ⏳ PENDING';
      }
      
      return `${host}${status}`;
    }).join('\n');
  };

  // Get refresh status for a specific host
  const getHostRefreshStatus = (host) => {
    if (!refreshResult) return '';
    
    const wasSuccessful = refreshResult.results?.some(r => r.host === host);
    const hadError = refreshResult.errors?.some(e => e.host === host);
    
    if (wasSuccessful) {
      return '✓ SUCCESS';
    } else if (hadError) {
      const error = refreshResult.errors.find(e => e.host === host);
      return `✗ FAILED - ${error?.error || 'Unknown error'}`;
    }
    return '';
  };

  const handleRefreshProperties = async () => {
    if (!environment) {
      setError('Please select an environment');
      return;
    }

    setRefreshing(true);
    setError('');
    setRefreshResult(null);
    
    try {
      const result = await ConfigService.refreshClientProperties(environment);
      setRefreshResult(result);
    } catch (err) {
      setError(err.message || 'Failed to refresh client properties');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Dashboard color="primary" fontSize="large" />
          <Typography variant="h4" component="h1">
            Spring Cloud Config Server Dashboard
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor your Spring Cloud Config Server and client applications
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Psychology color="secondary" />
                <Typography variant="h5">
                  Client Properties Refresh
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Trigger configuration reload on client applications without restarting them.
                Select an environment and refresh properties instantly.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Note: Refresh returns only the keys of properties that have actually changed. 
                If you see "0 changed", it means all configuration is already up-to-date.
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={environment}
                  label="Environment"
                  onChange={(e) => setEnvironment(e.target.value)}
                  size="small"
                >
                  {environments.map((env) => (
                    <MenuItem key={env.value} value={env.value}>
                      {env.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="secondary"
                startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
                onClick={handleRefreshProperties}
                disabled={refreshing}
                fullWidth
              >
                {refreshing ? 'Refreshing...' : 'Refresh Properties'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Hosts Display Panel */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Computer color="primary" />
                <Typography variant="h5">
                  {environment} Environment Hosts
                </Typography>
                <Chip 
                  label={`${getSelectedEnvironmentHosts().length} hosts`}
                  color="primary"
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hosts that will be refreshed:
              </Typography>

              <TableContainer 
                component={Paper} 
                sx={{ 
                  maxHeight: 400, 
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0'
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Host
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Refresh Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getSelectedEnvironmentHosts().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 3, fontStyle: 'italic', color: 'text.secondary' }}>
                          No hosts configured for this environment
                        </TableCell>
                      </TableRow>
                    ) : (
                      getSelectedEnvironmentHosts().map((host, index) => {
                        const status = getHostRefreshStatus(host);
                        const wasSuccessful = refreshResult?.results?.some(r => r.host === host);
                        const hadError = refreshResult?.errors?.some(e => e.host === host);
                        
                        return (
                          <TableRow 
                            key={index}
                            sx={{
                              backgroundColor: wasSuccessful ? '#f3f9f3' : hadError ? '#fff3f3' : 'transparent',
                              '&:hover': {
                                backgroundColor: wasSuccessful ? '#e8f5e8' : hadError ? '#ffe8e8' : '#f5f5f5'
                              }
                            }}
                          >
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {host}
                            </TableCell>
                            <TableCell sx={{ 
                              fontFamily: 'monospace', 
                              fontSize: '0.875rem',
                              color: wasSuccessful ? 'success.main' : hadError ? 'error.main' : 'text.secondary'
                            }}>
                              {status}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Refresh Response Panel */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Refresh color="success" />
                <Typography variant="h5">
                  Refresh Response
                </Typography>
                {refreshResult && (
                  <Chip 
                    label={`${refreshResult.successfulRefreshes}/${refreshResult.totalHosts} successful`}
                    color={refreshResult.failedRefreshes === 0 ? "success" : "warning"}
                    size="small"
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {refreshResult ? 'Response from last refresh operation:' : 'No refresh performed yet'}
              </Typography>

              <Paper 
                elevation={1}
                sx={{ 
                  maxHeight: 400, 
                  overflow: 'auto',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  p: 2
                }}
              >
                {refreshResult ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Summary:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, fontFamily: 'monospace' }}>
                      Environment: {refreshResult.environment}<br/>
                      Total Hosts: {refreshResult.totalHosts}<br/>
                      Successful: {refreshResult.successfulRefreshes}<br/>
                      Failed: {refreshResult.failedRefreshes}
                    </Typography>

                    {refreshResult.results && refreshResult.results.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="success.main" gutterBottom>
                          Updated Properties:
                        </Typography>
                        {(() => {
                          // Collect all updated property keys from all hosts
                          const allUpdatedKeys = [];
                          refreshResult.results.forEach(result => {
                            if (result.data && Array.isArray(result.data)) {
                              allUpdatedKeys.push(...result.data);
                            }
                          });
                          
                          // Remove duplicates
                          const uniqueKeys = [...new Set(allUpdatedKeys)];
                          
                          if (uniqueKeys.length === 0) {
                            return (
                              <Box sx={{ p: 1, backgroundColor: '#f3f9f3', borderRadius: 1, fontStyle: 'italic' }}>
                                <Typography variant="body2" color="text.secondary">
                                  All properties are up-to-date (no changes detected)
                                </Typography>
                              </Box>
                            );
                          }
                          
                          return (
                            <Box sx={{ p: 1, backgroundColor: '#f3f9f3', borderRadius: 1 }}>
                              {uniqueKeys.map((key, index) => (
                                <Typography 
                                  key={index} 
                                  variant="body2" 
                                  sx={{ fontFamily: 'monospace', mb: 0.5 }}
                                >
                                  • {key}
                                </Typography>
                              ))}
                            </Box>
                          );
                        })()}
                      </Box>
                    )}

                    {refreshResult.errors && refreshResult.errors.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="error.main" gutterBottom>
                          Error Responses:
                        </Typography>
                        {refreshResult.errors.map((error, index) => (
                          <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: '#fff3f3', borderRadius: 1 }}>
                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                              {error.host}
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'error.main' }}>
                              {error.error}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Click "Refresh Properties" to see the response details here
                    </Typography>
                  </Box>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}

export default Home;

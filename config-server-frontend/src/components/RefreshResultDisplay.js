import React from 'react';
import {
  Alert,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  Error,
  ExpandMore,
  ExpandLess,
  Computer,
  Refresh
} from '@mui/icons-material';

function RefreshResultDisplay({ refreshResult, onClose }) {
  const [expanded, setExpanded] = React.useState(false);

  if (!refreshResult) return null;

  const hasErrors = refreshResult.errors && refreshResult.errors.length > 0;
  const severity = hasErrors ? 'warning' : 'success';

  return (
    <Alert 
      severity={severity} 
      onClose={onClose}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          {hasErrors ? 'Properties refresh completed with issues' : 'Properties refreshed successfully!'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<Computer />}
            label={`Environment: ${refreshResult.environment}`}
            color="primary"
            size="small"
          />
          <Chip
            icon={<CheckCircle />}
            label={`${refreshResult.successfulRefreshes}/${refreshResult.totalHosts} successful`}
            color="success"
            size="small"
          />
          {hasErrors && (
            <Chip
              icon={<Error />}
              label={`${refreshResult.failedRefreshes} failed`}
              color="error"
              size="small"
            />
          )}
        </Box>

        {/* Expandable Details */}
        <Box>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            size="small"
            sx={{ p: 0, mb: 1 }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {expanded ? 'Hide' : 'Show'} details
            </Typography>
          </IconButton>

          <Collapse in={expanded}>
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
              {/* Successful Refreshes */}
              {refreshResult.results && refreshResult.results.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    Successful Refreshes:
                  </Typography>
                  <List dense>
                    {refreshResult.results.map((result, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={result.host}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Status: {result.status}
                              </Typography>
                              {result.data && Array.isArray(result.data) && (
                                <Typography variant="caption" display="block">
                                  {result.data.length === 0 
                                    ? 'No properties changed (all up-to-date)' 
                                    : `Properties changed: ${result.data.length} (${result.data.join(', ')})`
                                  }
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Failed Refreshes */}
              {refreshResult.errors && refreshResult.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    Failed Refreshes:
                  </Typography>
                  <List dense>
                    {refreshResult.errors.map((error, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Error color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={error.host}
                          secondary={
                            <Typography variant="caption" color="error.main">
                              {error.error}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Collapse>
        </Box>
      </Box>
    </Alert>
  );
}

export default RefreshResultDisplay;

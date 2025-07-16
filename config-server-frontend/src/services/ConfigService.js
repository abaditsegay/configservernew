import axios from 'axios';

const CONFIG_SERVER_URL = process.env.REACT_APP_CONFIG_SERVER_URL || 'http://localhost:8888';
const CONFIG_SERVER_USERNAME = process.env.REACT_APP_CONFIG_SERVER_USERNAME || 'admin';
const CONFIG_SERVER_PASSWORD = process.env.REACT_APP_CONFIG_SERVER_PASSWORD || 'secret';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: CONFIG_SERVER_URL,
  auth: {
    username: CONFIG_SERVER_USERNAME,
    password: CONFIG_SERVER_PASSWORD
  },
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

class ConfigService {
  /**
   * Fetch configuration for a specific application, profile, and label
   * @param {string} application - The application name
   * @param {string} profile - The profile (e.g., dev, prod)
   * @param {string} label - The label/branch (e.g., main, master)
   * @returns {Promise} Configuration data
   */
  static async getConfig(application, profile = 'default', label = 'main') {
    try {
      const url = `/${application}/${profile}/${label}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching configuration:', error);
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        
        switch (status) {
          case 401:
            throw new Error('Authentication failed. Check your credentials.');
          case 404:
            throw new Error(`Configuration not found for ${application}/${profile}/${label}`);
          case 500:
            throw new Error('Config server internal error. Check server logs.');
          default:
            throw new Error(`Server error (${status}): ${message}`);
        }
      } else if (error.request) {
        // Network error
        throw new Error('Unable to connect to config server. Is it running?');
      } else {
        // Other error
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Get health status of the config server
   * @returns {Promise} Health status
   */
  static async getHealth() {
    try {
      const response = await apiClient.get('/actuator/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw new Error('Unable to check config server health');
    }
  }

  /**
   * Refresh configuration
   * @returns {Promise} Refresh result
   */
  static async refresh() {
    try {
      const response = await apiClient.post('/actuator/refresh');
      return response.data;
    } catch (error) {
      console.error('Error refreshing configuration:', error);
      throw new Error('Unable to refresh configuration');
    }
  }

  /**
   * Get environment configuration
   * @returns {Object} Environment mappings
   */
  static getEnvironments() {
    return {
      LOCAL: ['localhost:9090', 'localhost:9091'],
      DIF: ['localhost:9091'] // DIF environment using localhost:9091
    };
  }

  /**
   * Refresh configuration properties on client applications
   * @param {string} environment - The environment name (LOCAL or DIF)
   * @returns {Promise} Refresh results from all clients in the environment
   */
  static async refreshClientProperties(environment) {
    const environments = this.getEnvironments();
    const hosts = environments[environment];
    
    if (!hosts) {
      throw new Error(`Unknown environment: ${environment}. Available environments: ${Object.keys(environments).join(', ')}`);
    }

    // Create a separate axios instance for client communication (no auth needed typically)
    const clientApiClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const results = [];
    const errors = [];

    // Loop through all hosts in the environment
    for (const host of hosts) {
      try {
        const clientUrl = `http://${host}/actuator/refresh`;
        console.log(`Refreshing properties for ${host}...`);
        
        const response = await clientApiClient.post(clientUrl);
        results.push({
          host: host,
          success: true,
          data: response.data,
          status: response.status
        });
      } catch (error) {
        console.error(`Error refreshing client properties for ${host}:`, error);
        
        let errorMessage = 'Unknown error';
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.statusText;
          
          switch (status) {
            case 404:
              errorMessage = `Client application not found. Make sure the application is running and has actuator endpoints enabled.`;
              break;
            case 405:
              errorMessage = `Refresh endpoint not available. Make sure the client application has Spring Boot Actuator and refresh endpoint enabled.`;
              break;
            case 500:
              errorMessage = `Client application error: ${message}`;
              break;
            default:
              errorMessage = `Client error (${status}): ${message}`;
          }
        } else if (error.request) {
          errorMessage = `Unable to connect to client application. Is it running?`;
        } else {
          errorMessage = 'An unexpected error occurred while refreshing client properties';
        }

        errors.push({
          host: host,
          success: false,
          error: errorMessage
        });
      }
    }

    // Return results and errors
    const response = {
      environment: environment,
      totalHosts: hosts.length,
      successfulRefreshes: results.length,
      failedRefreshes: errors.length,
      results: results,
      errors: errors
    };

    // If all failed, throw an error
    if (results.length === 0) {
      throw new Error(`Failed to refresh properties on all hosts in ${environment} environment. Errors: ${errors.map(e => `${e.host}: ${e.error}`).join('; ')}`);
    }

    return response;
  }

  /**
   * Get configuration properties from client applications filtered by profile
   * @param {string} application - The application name
   * @param {string} profile - The profile (e.g., dev, prod)
   * @param {string} environment - The environment name (LOCAL or DIF)
   * @returns {Promise} Configuration properties from client applications for the specified profile
   */
  static async getClientProperties(application, profile, environment) {
    const environments = this.getEnvironments();
    const hosts = environments[environment];
    
    if (!hosts) {
      throw new Error(`Unknown environment: ${environment}. Available environments: ${Object.keys(environments).join(', ')}`);
    }

    // Create a separate axios instance for client communication (no auth needed typically)
    const clientApiClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const results = [];
    const errors = [];

    // Loop through all hosts in the environment
    for (const host of hosts) {
      try {
        // Get environment properties from client application
        const clientUrl = `http://${host}/actuator/env`;
        console.log(`Getting environment properties from ${host} for profile ${profile}...`);
        
        const response = await clientApiClient.get(clientUrl);
        
        // Filter properties by profile
        const filteredProperties = this.filterPropertiesByProfile(response.data, profile, application);
        
        results.push({
          host: host,
          success: true,
          data: filteredProperties,
          status: response.status,
          originalData: response.data // Keep original for debugging
        });
      } catch (error) {
        console.error(`Error getting client properties from ${host}:`, error);
        
        let errorMessage = 'Unknown error';
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.statusText;
          
          switch (status) {
            case 404:
              errorMessage = `Client application not found. Make sure the application is running and has actuator endpoints enabled.`;
              break;
            case 405:
              errorMessage = `Environment endpoint not available. Make sure the client application has Spring Boot Actuator enabled.`;
              break;
            case 500:
              errorMessage = `Client application error: ${message}`;
              break;
            default:
              errorMessage = `Client error (${status}): ${message}`;
          }
        } else if (error.request) {
          errorMessage = `Unable to connect to client application. Is it running?`;
        } else {
          errorMessage = 'An unexpected error occurred while getting client properties';
        }

        errors.push({
          host: host,
          success: false,
          error: errorMessage
        });
      }
    }

    // If all failed, throw an error
    if (results.length === 0) {
      throw new Error(`Failed to get properties from all hosts in ${environment} environment. Errors: ${errors.map(e => `${e.host}: ${e.error}`).join('; ')}`);
    }

    // Return combined results in a format similar to config server response
    return {
      name: application,
      profiles: [profile],
      label: 'master',
      version: null,
      state: null,
      propertySources: this.combinePropertySources(results, application, profile),
      // Additional metadata
      clientResults: {
        application: application,
        profile: profile,
        environment: environment,
        totalHosts: hosts.length,
        successfulHosts: results.length,
        failedHosts: errors.length,
        results: results,
        errors: errors
      }
    };
  }

  /**
   * Filter properties from /actuator/env response by profile and application
   * @param {Object} envData - The environment data from /actuator/env
   * @param {string} profile - The profile to filter by
   * @param {string} application - The application name to filter by
   * @returns {Object} Filtered properties
   */
  static filterPropertiesByProfile(envData, profile, application) {
    const filteredSources = [];
    
    if (envData.propertySources) {
      envData.propertySources.forEach(source => {
        const sourceName = source.name || '';
        
        // Only include config server sources and application-specific property files
        if (
          sourceName.includes(`configserver:${application}-${profile}`) ||
          sourceName.includes(`configserver:${application}/${profile}`) ||
          sourceName.includes(`Config resource`) && (
            sourceName.includes(`${application}-${profile}.properties`) ||
            sourceName.includes(`application-${profile}.properties`) ||
            sourceName.includes('application.properties')
          )
        ) {
          filteredSources.push(source);
        }
      });
    }
    
    return {
      activeProfiles: envData.activeProfiles || [profile],
      propertySources: filteredSources
    };
  }

  /**
   * Combine property sources from multiple client results
   * @param {Array} results - Results from client applications
   * @param {string} application - Application name
   * @param {string} profile - Profile name
   * @returns {Array} Combined property sources
   */
  static combinePropertySources(results, application, profile) {
    const combinedSources = [];
    
    results.forEach((result, index) => {
      if (result.success && result.data.propertySources) {
        result.data.propertySources.forEach(source => {
          combinedSources.push({
            name: `${source.name} (from ${result.host})`,
            source: source.properties || source.source || {}
          });
        });
      }
    });
    
    // If no profile-specific sources found, create a summary
    if (combinedSources.length === 0) {
      combinedSources.push({
        name: `No ${profile} profile properties found for ${application}`,
        source: {
          'info': `No properties found for profile '${profile}' and application '${application}'. Check if the application is configured with this profile.`
        }
      });
    }
    
    return combinedSources;
  }

  /**
   * Get configuration properties from client applications using /api/properties endpoint
   * @param {string} application - The application name
   * @param {string} environment - The environment name (LOCAL or DIF)
   * @returns {Promise} Configuration properties from client applications
   */
  static async getClientApplicationProperties(application, environment) {
    const environments = this.getEnvironments();
    const hosts = environments[environment];
    
    if (!hosts) {
      throw new Error(`Unknown environment: ${environment}. Available environments: ${Object.keys(environments).join(', ')}`);
    }

    // Create a separate axios instance for client communication (no auth needed typically)
    const clientApiClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const results = [];
    const errors = [];

    // Loop through all hosts in the environment
    for (const host of hosts) {
      try {
        // Get properties from client application's /api/properties endpoint
        const clientUrl = `http://${host}/api/properties`;
        console.log(`Getting properties from ${host}...`);
        
        const response = await clientApiClient.get(clientUrl);
        
        results.push({
          host: host,
          success: true,
          data: response.data,
          status: response.status
        });
      } catch (error) {
        console.error(`Error getting properties from ${host}:`, error);
        
        let errorMessage = 'Unknown error';
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.statusText;
          
          switch (status) {
            case 404:
              errorMessage = `Client application not found or /api/properties endpoint not available. Make sure the application is running.`;
              break;
            case 500:
              errorMessage = `Client application error: ${message}`;
              break;
            default:
              errorMessage = `Client error (${status}): ${message}`;
          }
        } else if (error.request) {
          errorMessage = `Unable to connect to client application. Is it running?`;
        } else {
          errorMessage = 'An unexpected error occurred while getting client properties';
        }

        errors.push({
          host: host,
          success: false,
          error: errorMessage
        });
      }
    }

    // If all failed, throw an error
    if (results.length === 0) {
      throw new Error(`Failed to get properties from all hosts in ${environment} environment. Errors: ${errors.map(e => `${e.host}: ${e.error}`).join('; ')}`);
    }

    // Transform results into property sources format
    const propertySources = [];
    results.forEach((result, index) => {
      if (result.success && result.data) {
        // Convert the flat properties object into property source format
        const properties = {};
        Object.keys(result.data).forEach(key => {
          if (key !== 'timestamp' && key !== 'configSource') {
            properties[key] = result.data[key];
          }
        });
        
        propertySources.push({
          name: `${application} properties (from ${result.host})`,
          source: properties
        });
      }
    });

    // If no successful results, create a summary
    if (propertySources.length === 0) {
      propertySources.push({
        name: `No properties found for ${application}`,
        source: {
          'info': `No properties found for application '${application}' in ${environment} environment.`
        }
      });
    }

    // Return in config server format
    return {
      name: application,
      profiles: [],
      label: 'master',
      version: null,
      state: null,
      propertySources: propertySources,
      // Additional metadata
      clientResults: {
        application: application,
        environment: environment,
        totalHosts: hosts.length,
        successfulHosts: results.length,
        failedHosts: errors.length,
        results: results,
        errors: errors
      }
    };
  }

  /**
   * Update a property in the config server database
   * @param {string} application - The application name
   * @param {string} profile - The profile (e.g., dev, prod)
   * @param {string} propertyKey - The property key to update
   * @param {string} propertyValue - The new property value
   * @param {string} label - The label/branch (defaults to 'master')
   * @returns {Promise} Update result
   */
  static async updateProperty(application, profile, propertyKey, propertyValue, label = 'master') {
    try {
      // Update property via config server API
      // This assumes the config server has an endpoint for updating properties
      const updateData = {
        application: application,
        profile: profile,
        label: label,
        key: propertyKey,
        value: propertyValue
      };

      const response = await apiClient.post('/api/properties/update', updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating property:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        
        switch (status) {
          case 401:
            throw new Error('Authentication failed. Check your credentials.');
          case 403:
            throw new Error('Permission denied. You may not have rights to update properties.');
          case 404:
            throw new Error('Property update endpoint not found. Config server may not support property updates.');
          case 500:
            throw new Error('Config server internal error while updating property.');
          default:
            throw new Error(`Server error (${status}): ${message}`);
        }
      } else if (error.request) {
        throw new Error('Unable to connect to config server for property update.');
      } else {
        throw new Error('An unexpected error occurred while updating property');
      }
    }
  }

  /**
   * Update property using SQL direct update (alternative approach)
   * @param {string} application - The application name
   * @param {string} profile - The profile (e.g., dev, prod)
   * @param {string} propertyKey - The property key to update
   * @param {string} propertyValue - The new property value
   * @param {string} label - The label/branch (defaults to 'master')
   * @returns {Promise} Update result
   */
  static async updatePropertySQL(application, profile, propertyKey, propertyValue, label = 'master') {
    try {
      // Direct SQL update via config server admin endpoint
      const updateData = {
        sql: `UPDATE PROPERTIES SET VALUE = ? WHERE APPLICATION = ? AND PROFILE = ? AND LABEL = ? AND KEY = ?`,
        parameters: [propertyValue, application, profile, label, propertyKey]
      };

      const response = await apiClient.post('/api/sql', updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating property via SQL:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        
        switch (status) {
          case 401:
            throw new Error('Authentication failed. Check your credentials.');
          case 403:
            throw new Error('Permission denied. SQL updates may not be allowed.');
          case 404:
            throw new Error('SQL update endpoint not found.');
          case 500:
            throw new Error('Database error while updating property.');
          default:
            throw new Error(`Server error (${status}): ${message}`);
        }
      } else if (error.request) {
        throw new Error('Unable to connect to config server for SQL update.');
      } else {
        throw new Error('An unexpected error occurred during SQL update');
      }
    }
  }

  /**
   * Insert or update a property in the config server database
   * @param {string} application - The application name
   * @param {string} profile - The profile (e.g., dev, prod)
   * @param {string} propertyKey - The property key to update
   * @param {string} propertyValue - The new property value
   * @param {string} label - The label/branch (defaults to 'master')
   * @returns {Promise} Update result
   */
  static async upsertProperty(application, profile, propertyKey, propertyValue, label = 'master') {
    try {
      // Use SQL MERGE or INSERT/UPDATE approach
      const upsertData = {
        sql: `MERGE INTO PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) 
              KEY (APPLICATION, PROFILE, LABEL, KEY) 
              VALUES (?, ?, ?, ?, ?)`,
        parameters: [application, profile, label, propertyKey, propertyValue]
      };

      const response = await apiClient.post('/api/sql', upsertData);
      return response.data;
    } catch (error) {
      console.error('Error upserting property:', error);
      
      // If MERGE doesn't work, try separate INSERT/UPDATE approach
      try {
        // First try to update
        await this.updatePropertySQL(application, profile, propertyKey, propertyValue, label);
        return { success: true, operation: 'update' };
      } catch (updateError) {
        try {
          // If update fails, try to insert
          const insertData = {
            sql: `INSERT INTO PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES (?, ?, ?, ?, ?)`,
            parameters: [application, profile, label, propertyKey, propertyValue]
          };
          
          const insertResponse = await apiClient.post('/api/sql', insertData);
          return { success: true, operation: 'insert', data: insertResponse.data };
        } catch (insertError) {
          throw new Error(`Failed to insert or update property: ${insertError.message}`);
        }
      }
    }
  }

  /**
   * Update property using H2 database direct access (for development/demo)
   * @param {string} application - The application name
   * @param {string} profile - The profile (e.g., dev, prod)
   * @param {string} propertyKey - The property key to update
   * @param {string} propertyValue - The new property value
   * @param {string} label - The label/branch (defaults to 'master')
   * @returns {Promise} Update result
   */
  static async updatePropertyH2(application, profile, propertyKey, propertyValue, label = 'master') {
    try {
      // Try to use H2 console endpoint or direct database access
      // This approach works if the config server exposes database management endpoints
      
      // First, try to check if the property exists
      const checkData = {
        sql: `SELECT COUNT(*) as count FROM PROPERTIES WHERE APPLICATION = ? AND PROFILE = ? AND LABEL = ? AND KEY = ?`,
        parameters: [application, profile, label, propertyKey]
      };

      let exists = false;
      try {
        const checkResponse = await apiClient.post('/h2-console/query', checkData);
        exists = checkResponse.data && checkResponse.data.length > 0 && checkResponse.data[0].count > 0;
      } catch (checkError) {
        console.log('Could not check if property exists, will try insert/update:', checkError.message);
      }

      // Update or Insert based on existence
      let sql, operation;
      if (exists) {
        sql = `UPDATE PROPERTIES SET VALUE = ? WHERE APPLICATION = ? AND PROFILE = ? AND LABEL = ? AND KEY = ?`;
        operation = 'update';
      } else {
        sql = `INSERT INTO PROPERTIES (VALUE, APPLICATION, PROFILE, LABEL, KEY) VALUES (?, ?, ?, ?, ?)`;
        operation = 'insert';
      }

      const updateData = {
        sql: sql,
        parameters: [propertyValue, application, profile, label, propertyKey]
      };

      const response = await apiClient.post('/h2-console/execute', updateData);
      
      return { 
        success: true, 
        operation: operation,
        rowsAffected: response.data?.rowsAffected || 1,
        data: response.data 
      };

    } catch (error) {
      console.error('Error updating property in H2:', error);
      throw new Error(`H2 database update failed: ${error.message}`);
    }
  }

  /**
   * Comprehensive property update method that tries multiple approaches
   * @param {string} application - The application name
   * @param {string} profile - The profile (e.g., dev, prod)
   * @param {string} propertyKey - The property key to update
   * @param {string} propertyValue - The new property value
   * @param {string} label - The label/branch (defaults to 'master')
   * @returns {Promise} Update result
   */
  static async updatePropertyComprehensive(application, profile, propertyKey, propertyValue, label = 'master') {
    // Try primary method: Our REST API endpoint
    try {
      const result = await this.updateProperty(application, profile, propertyKey, propertyValue, label);
      return { 
        success: true, 
        method: 'rest-api', 
        data: result,
        message: 'Property updated successfully via REST API'
      };
    } catch (error) {
      console.error('REST API update failed:', error);
      
      // If the primary method fails, provide helpful error message
      const errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('Network Error') || errorMessage.includes('CORS')) {
        throw new Error('Unable to connect to config server. Please check that the config server is running on port 8888 and CORS is properly configured.');
      } else if (errorMessage.includes('404')) {
        throw new Error('Property update endpoint not found. Please check config server configuration.');
      } else {
        throw new Error(`Property update failed: ${errorMessage}`);
      }
    }
  }
}

export default ConfigService;

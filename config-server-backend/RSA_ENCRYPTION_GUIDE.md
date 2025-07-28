# RSA Encryption for Spring Cloud Config Server

This guide explains how RSA encryption has been configured for your Spring Cloud Config Server to secure sensitive configuration properties.

## Overview

RSA encryption provides asymmetric encryption for your configuration properties, offering better security than symmetric keys. The config server can encrypt and decrypt properties using RSA key pairs stored in a Java keystore.

## Configuration

### 1. Keystore Setup

A Java keystore has been created with RSA key pairs:
- **Location**: `src/main/resources/config-server.jks`
- **Key Algorithm**: RSA 2048-bit
- **Alias**: `config-server-key`
- **Store Password**: `mypassword`
- **Key Password**: `mypassword`

### 2. Application Properties

The following configuration enables RSA encryption:

```properties
# RSA Encryption Configuration using Keystore
encrypt.key-store.location=classpath:config-server.jks
encrypt.key-store.password=mypassword
encrypt.key-store.alias=config-server-key
encrypt.key-store.secret=mypassword

# Enable encrypt/decrypt endpoints for RSA
management.endpoints.web.exposure.include=health,info,refresh,env,encrypt,decrypt
endpoints.encrypt.enabled=true
endpoints.decrypt.enabled=true
```

## Usage

### Encrypting Values

#### Method 1: Using the Helper Script
```bash
./encrypt-value.sh "your-secret-value"
```

#### Method 2: Using curl directly
```bash
curl -X POST http://localhost:8888/encrypt -d "your-secret-value" -H "Content-Type: text/plain"
```

### Using Encrypted Values in Configuration

#### YAML Format
```yaml
datasource:
  password: '{cipher}AQBgFJapodSkQc4KqqWMaMZwFLdaC3pS3ztFTwXX2CT6tSmb...'
api:
  secret-key: '{cipher}AQB/NqJMAw2yW7e64dX1cd9VF544N5jqSH6jgFxyw3uBiOtB...'
```

#### Properties Format
```properties
spring.datasource.password={cipher}AQBgFJapodSkQc4KqqWMaMZwFLdaC3pS3ztFTwXX2CT6tSmb...
api.secret-key={cipher}AQB/NqJMAw2yW7e64dX1cd9VF544N5jqSH6jgFxyw3uBiOtB...
```

### Decryption

The config server automatically decrypts properties with the `{cipher}` prefix when serving them to client applications. You can also manually decrypt values:

```bash
curl -X POST http://localhost:8888/decrypt -d "AQBgFJapodSkQc4KqqWMaMZwFLdaC3pS3ztFTwXX2CT6tSmb..." -H "Content-Type: text/plain"
```

## Security Benefits

1. **Asymmetric Encryption**: Uses public/private key pairs for enhanced security
2. **Key Separation**: Private key stays on the config server, public key can be distributed
3. **No Shared Secrets**: Unlike symmetric encryption, no shared secret key needed
4. **Secure Storage**: Sensitive values encrypted at rest in configuration files
5. **Runtime Decryption**: Values automatically decrypted when served to applications

## Best Practices

### 1. Keystore Security
- Store the keystore file securely
- Use strong passwords for keystore and key
- Consider using HSM or external key management systems for production
- Rotate keys periodically

### 2. Production Considerations
- Use different keystores for different environments
- Consider using environment-specific key aliases
- Implement proper backup and recovery procedures for keystores
- Monitor and audit encryption/decryption operations

### 3. What to Encrypt
Encrypt sensitive configuration such as:
- Database passwords
- API keys and secrets
- JWT signing keys
- Third-party service credentials
- OAuth client secrets
- Encryption keys for other services

### 4. What NOT to Encrypt
Don't encrypt:
- Non-sensitive configuration (URLs, timeouts, feature flags)
- Values that need to be searchable
- Configuration used for routing or discovery

## Testing

### Automated Testing
Run the test script to verify encryption/decryption:
```bash
./test-rsa-encryption.sh
```

### Manual Testing
1. **Health Check**: `curl http://localhost:8888/actuator/health`
2. **Encrypt**: `curl -X POST http://localhost:8888/encrypt -d "test-value"`
3. **Decrypt**: `curl -X POST http://localhost:8888/decrypt -d "[encrypted-value]"`

## Troubleshooting

### Common Issues

1. **"Cannot decrypt" errors**
   - Verify keystore file exists and is readable
   - Check keystore passwords are correct
   - Ensure key alias exists in keystore

2. **Encryption endpoint not available**
   - Verify management endpoints are exposed
   - Check that encrypt/decrypt endpoints are enabled

3. **Wrong decrypted values**
   - Ensure using the same keystore that encrypted the values
   - Verify the cipher text is complete and not truncated

### Debug Configuration
Add these properties for debugging:
```properties
logging.level.org.springframework.cloud.config=DEBUG
logging.level.org.springframework.security=DEBUG
```

## Files Created

- `config-server.jks` - RSA keystore
- `test-rsa-encryption.sh` - Automated test script
- `encrypt-value.sh` - Helper script for encrypting values
- `myapp-prod-encrypted.yml` - Example configuration with encrypted values

## Migration from Symmetric Key

If migrating from symmetric key encryption:
1. Re-encrypt all existing encrypted values using the new RSA keystore
2. Update configuration files with new encrypted values
3. Remove the old `encrypt.key` property
4. Deploy and test thoroughly

## Environment-Specific Keystores

For production environments, consider creating separate keystores:

```bash
# Production keystore
keytool -genkeypair -alias config-server-prod-key -keyalg RSA -keysize 4096 \
        -keystore config-server-prod.jks -storepass prodpassword \
        -keypass prodpassword -dname "CN=Config Server Prod,OU=IT,O=Company,L=City,S=State,C=US"
```

Then use environment-specific properties:
```properties
# application-prod.properties
encrypt.key-store.location=classpath:config-server-prod.jks
encrypt.key-store.password=${KEYSTORE_PASSWORD}
encrypt.key-store.alias=config-server-prod-key
encrypt.key-store.secret=${KEY_PASSWORD}
```

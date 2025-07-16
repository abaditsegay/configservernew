# Production-Ready Encryption Guide for Spring Cloud Config Server

## 🔐 Security Improvements for Production

### 1. **Asymmetric Encryption (RSA)**
- **Current**: Symmetric encryption with shared key
- **Production**: RSA key pairs with public/private key separation
- **Benefit**: Private key stays on config server, public key can be distributed

### 2. **Key Management Best Practices**

#### A. External Key Store Management
```bash
# Generate production RSA keystore with stronger encryption
keytool -genkeypair -alias config-server-key -keyalg RSA -keysize 4096 \
        -keystore config-server.jks -storepass ${KEYSTORE_PASSWORD} \
        -keypass ${KEY_PASSWORD} -dname "CN=Config Server,OU=IT,O=YourCompany,C=US" \
        -validity 3650 -storetype JKS
```

#### B. Environment-Based Configuration
```properties
# Use environment variables instead of hardcoded passwords
encrypt.key-store.location=file:/etc/config-server/keystore/config-server.jks
encrypt.key-store.password=${KEYSTORE_PASSWORD}
encrypt.key-store.alias=${KEY_ALIAS:config-server-key}
encrypt.key-store.secret=${KEY_PASSWORD}
```

### 3. **Vault Integration (Recommended for Enterprise)**

#### A. HashiCorp Vault Setup
```properties
# application.yml for Vault integration
spring:
  cloud:
    vault:
      host: vault.company.com
      port: 8200
      scheme: https
      authentication: AWS_IAM  # or KUBERNETES, LDAP, etc.
      kv:
        enabled: true
        backend: secret
        profile-separator: '/'
```

#### B. AWS KMS Integration
```properties
# Use AWS KMS for encryption keys
encrypt.key-store.type=aws-kms
encrypt.key-store.alias=arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012
```

### 4. **Key Rotation Strategy**

#### A. Blue-Green Key Rotation
1. **Preparation Phase**:
   - Generate new keystore
   - Deploy new config server with new keys
   - Test decryption of existing values

2. **Migration Phase**:
   - Re-encrypt all sensitive values with new key
   - Update configuration database
   - Validate all applications can decrypt

3. **Cleanup Phase**:
   - Remove old keystore after migration
   - Update monitoring and alerts

#### B. Automated Key Rotation Script
```bash
#!/bin/bash
# Key rotation automation
OLD_ALIAS="config-server-key-v1"
NEW_ALIAS="config-server-key-v2"

# Generate new keystore
keytool -genkeypair -alias $NEW_ALIAS -keyalg RSA -keysize 4096 \
        -keystore config-server-new.jks -storepass $KEYSTORE_PASSWORD

# Re-encrypt all values (pseudo-code)
for value in $(get_all_encrypted_values); do
    decrypted=$(decrypt_with_old_key $value)
    new_encrypted=$(encrypt_with_new_key $decrypted)
    update_database $value $new_encrypted
done
```

### 5. **Security Headers and Network Protection**

#### A. HTTPS Only Configuration
```properties
# Force HTTPS
server.ssl.enabled=true
server.ssl.key-store=classpath:server-ssl.p12
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12

# Security headers
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
```

#### B. Network Security
```yaml
# Docker/Kubernetes network policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: config-server-policy
spec:
  podSelector:
    matchLabels:
      app: config-server
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: authorized-client
    ports:
    - protocol: TCP
      port: 8888
```

### 6. **Monitoring and Auditing**

#### A. Encryption Metrics
```properties
# Enable metrics for encryption operations
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.metrics.enable.spring.cloud.config=true
```

#### B. Audit Logging
```properties
# Enable audit logging
logging.level.org.springframework.cloud.config.server=INFO
logging.level.org.springframework.security=INFO

# Custom audit configuration
audit.encryption.enabled=true
audit.encryption.log-failed-attempts=true
audit.encryption.log-successful-decryptions=false
```

### 7. **Multi-Environment Key Management**

#### A. Environment-Specific Keystores
```
config-server/
├── keystores/
│   ├── dev-keystore.jks
│   ├── staging-keystore.jks
│   └── prod-keystore.jks
└── application-{env}.properties
```

#### B. Spring Profiles for Key Configuration
```properties
# application-dev.properties
encrypt.key-store.location=classpath:keystores/dev-keystore.jks

# application-prod.properties  
encrypt.key-store.location=file:/secure/prod-keystore.jks
```

### 8. **Client-Side Decryption (Advanced)**

#### A. Client Library Integration
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-client</artifactId>
</dependency>
```

#### B. Client-Side Configuration
```properties
# Client application.properties
encrypt.key-store.location=classpath:client-keystore.jks
encrypt.key-store.password=${CLIENT_KEYSTORE_PASSWORD}
spring.cloud.config.server.encrypt.enabled=false  # Server doesn't decrypt
```

### 9. **Compliance and Governance**

#### A. FIPS 140-2 Compliance
```properties
# Use FIPS-compliant algorithms
encrypt.key-store.type=FIPS
encrypt.algorithm=AES/GCM/NoPadding
encrypt.key-length=256
```

#### B. Key Escrow and Recovery
- Store key recovery information in secure offline storage
- Implement key escrow procedures for regulatory compliance
- Document key lifecycle management processes

### 10. **Testing and Validation**

#### A. Encryption Test Suite
```java
@Test
public void testEncryptionDecryption() {
    String plaintext = "sensitive-data";
    String encrypted = configServer.encrypt(plaintext);
    String decrypted = configServer.decrypt(encrypted);
    assertEquals(plaintext, decrypted);
}

@Test
public void testKeyRotation() {
    // Test that new keys can decrypt old values during transition
}
```

#### B. Performance Testing
- Load test encryption/decryption endpoints
- Monitor memory usage with large encrypted configurations
- Test with realistic configuration sizes

## 🚀 Quick Production Checklist

- [ ] Switch to RSA asymmetric encryption
- [ ] Use environment variables for all passwords
- [ ] Store keystore outside application JAR
- [ ] Enable HTTPS with proper certificates
- [ ] Implement key rotation procedures
- [ ] Set up monitoring and alerting
- [ ] Document key management procedures
- [ ] Test disaster recovery scenarios
- [ ] Configure audit logging
- [ ] Review network security policies

## 📋 Implementation Priority

1. **High Priority**: RSA encryption, external keystore, HTTPS
2. **Medium Priority**: Environment variables, monitoring, audit logging
3. **Long-term**: Vault integration, automated key rotation, compliance features

Remember: Security is a layered approach. Implement these improvements incrementally while maintaining service availability.

# Spring Cloud Config Server - Encryption Key Configuration Guide

## Current Configuration
Your Config Server supports multiple encryption options. Here are the different ways to configure encryption keys:

## Option 1: Symmetric Encryption (Current - ACTIVE)
**Current setting in application.properties:**
```properties
encrypt.key=SuperSecureConfigServerKey2024!@#$%^&*
```

### Pros:
- Simple to set up and use
- Fast encryption/decryption
- Good for development and testing

### Cons:
- Same key used for encryption and decryption
- Less secure than asymmetric encryption
- Key must be kept secret

---

## Option 2: Asymmetric Encryption (RSA KeyStore)
**To switch to asymmetric encryption, update application.properties:**

```properties
# Comment out the symmetric key
# encrypt.key=SuperSecureConfigServerKey2024!@#$%^&*

# Enable asymmetric encryption
encrypt.key-store.location=classpath:server.jks
encrypt.key-store.password=storepwd123
encrypt.key-store.alias=config-server-key
encrypt.key-store.secret=storepwd123
```

### Pros:
- More secure (public/private key pair)
- Can share public key for encryption
- Private key stays on server for decryption

### Cons:
- More complex setup
- Slower than symmetric encryption
- Requires keystore management

---

## Option 3: Environment Variable (Production Recommended)
**For production, use environment variables:**

```bash
# Set encryption key via environment variable
export ENCRYPT_KEY="YourProductionEncryptionKey2024!"

# Or for keystore:
export ENCRYPT_KEYSTORE_LOCATION="file:/path/to/production-keystore.jks"
export ENCRYPT_KEYSTORE_PASSWORD="production-password"
export ENCRYPT_KEYSTORE_ALIAS="prod-config-key"
export ENCRYPT_KEYSTORE_SECRET="production-key-password"
```

**Then in application.properties:**
```properties
encrypt.key=${ENCRYPT_KEY}
# or
encrypt.key-store.location=${ENCRYPT_KEYSTORE_LOCATION}
encrypt.key-store.password=${ENCRYPT_KEYSTORE_PASSWORD}
encrypt.key-store.alias=${ENCRYPT_KEYSTORE_ALIAS}
encrypt.key-store.secret=${ENCRYPT_KEYSTORE_SECRET}
```

---

## How to Change Keys

### Method 1: Update application.properties
1. Stop the config server
2. Change the `encrypt.key` value in application.properties
3. Restart the server
4. Re-encrypt all existing encrypted values with new key

### Method 2: Use Environment Variables
```bash
# Set new key
export ENCRYPT_KEY="NewEncryptionKey2024!"

# Restart server
java -jar config-server-1.0.0.jar
```

### Method 3: Command Line Arguments
```bash
java -jar config-server-1.0.0.jar --encrypt.key="NewEncryptionKey2024!"
```

---

## Important Notes

### ⚠️ **Key Rotation Impact**
When you change the encryption key:
1. **Existing encrypted values become invalid**
2. **You must re-encrypt all {cipher} values**
3. **Database needs to be updated with new encrypted values**

### 🔄 **Key Rotation Process**
1. Generate/encrypt values with NEW key
2. Update database with new encrypted values
3. Deploy with new key
4. Verify all configurations work

---

## Testing Your New Key

After changing the encryption key, test it:

```bash
# 1. Test encryption with new key
curl -X POST -d "test-value" "http://localhost:8888/encrypt"

# 2. Test decryption
curl -X POST -d "ENCRYPTED_VALUE_FROM_STEP_1" "http://localhost:8888/decrypt"

# 3. Test config retrieval
curl "http://localhost:8888/myapp/dev/main"
```

---

## Key Security Best Practices

1. **Never commit keys to version control**
2. **Use environment variables in production**
3. **Rotate keys regularly**
4. **Use strong, random keys (32+ characters)**
5. **Consider using Cloud Key Management Services**
6. **Restrict access to keystore files**

---

## Current Status
- ✅ Symmetric encryption enabled with strong key
- ✅ RSA keystore generated and ready for use
- ✅ Both options configured in application.properties
- ⚠️ Existing encrypted values need re-encryption if key changes

-- Insert sample configuration data (Hibernate will create the table structure)
INSERT INTO PROPERTIES (APPLICATION, PROFILE, LABEL, PROP_KEY, PROP_VALUE) VALUES
-- myapp-dev configuration
('myapp', 'dev', 'main', 'server.port', '8080'),
('myapp', 'dev', 'main', 'spring.datasource.url', 'jdbc:h2:mem:devdb'),
('myapp', 'dev', 'main', 'spring.datasource.username', 'sa'),
('myapp', 'dev', 'main', 'spring.datasource.password', 'password'),
('myapp', 'dev', 'main', 'logging.level.com.example', 'DEBUG'),
('myapp', 'dev', 'main', 'app.name', 'My Application - Development'),
('myapp', 'dev', 'main', 'app.version', '1.0.0-SNAPSHOT'),
('myapp', 'dev', 'main', 'app.features.feature1', 'enabled'),
('myapp', 'dev', 'main', 'app.features.feature2', 'disabled'),

-- myapp-prod configuration
('myapp', 'prod', 'main', 'server.port', '8080'),
('myapp', 'prod', 'main', 'spring.datasource.url', 'jdbc:postgresql://prod-db:5432/myapp'),
('myapp', 'prod', 'main', 'spring.datasource.username', 'myapp_user'),
('myapp', 'prod', 'main', 'spring.datasource.password', '${DB_PASSWORD}'),
('myapp', 'prod', 'main', 'logging.level.com.example', 'INFO'),
('myapp', 'prod', 'main', 'app.name', 'My Application - Production'),
('myapp', 'prod', 'main', 'app.version', '1.0.0'),
('myapp', 'prod', 'main', 'app.features.feature1', 'enabled'),
('myapp', 'prod', 'main', 'app.features.feature2', 'enabled'),

-- Another app configuration
('userservice', 'dev', 'main', 'server.port', '8081'),
('userservice', 'dev', 'main', 'spring.datasource.url', 'jdbc:h2:mem:userdb'),
('userservice', 'dev', 'main', 'app.name', 'User Service'),
('userservice', 'dev', 'main', 'app.cache.enabled', 'false'),

('userservice', 'prod', 'main', 'server.port', '8081'),
('userservice', 'prod', 'main', 'spring.datasource.url', 'jdbc:postgresql://prod-db:5432/userservice'),
('userservice', 'prod', 'main', 'app.name', 'User Service'),
('userservice', 'prod', 'main', 'app.cache.enabled', 'true');

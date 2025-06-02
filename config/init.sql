
CREATE DATABASE IF NOT EXISTS restaurante_app;
USE restaurante_app;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    preferences JSON,
    role ENUM('user', 'admin', 'restaurant_owner') DEFAULT 'user',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Tabla de restaurantes
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    price_range ENUM('$', '$$', '$$$', '$$$$') NOT NULL,
    opening_hours JSON,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cuisine_type (cuisine_type),
    INDEX idx_city (city),
    INDEX idx_price_range (price_range),
    INDEX idx_average_rating (average_rating),
    INDEX idx_location (latitude, longitude)
);

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    visit_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_restaurant (user_id, restaurant_id),
    INDEX idx_restaurant_rating (restaurant_id, rating),
    INDEX idx_user_reviews (user_id),
    INDEX idx_rating (rating)
);

-- Tabla de menús
CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    allergens JSON,
    nutritional_info JSON,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_category (restaurant_id, category),
    INDEX idx_price (price),
    INDEX idx_available (is_available)
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    max_capacity INT NOT NULL,
    current_bookings INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_event (restaurant_id, event_date),
    INDEX idx_event_date (event_date),
    INDEX idx_active (is_active)
);

-- Tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    ticket_code VARCHAR(100) UNIQUE NOT NULL,
    qr_code_path VARCHAR(500),
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_id VARCHAR(255),
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_user_tickets (user_id),
    INDEX idx_ticket_code (ticket_code),
    INDEX idx_payment_status (payment_status)
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('review', 'ticket', 'promotion', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notifications (user_id, is_read),
    INDEX idx_type (type)
);

-- Tabla de favoritos de usuarios
CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, restaurant_id)
);

-- Triggers para actualizar calificaciones automáticamente
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS update_restaurant_rating_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants 
    SET 
        average_rating = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE restaurant_id = NEW.restaurant_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE restaurant_id = NEW.restaurant_id
        )
    WHERE id = NEW.restaurant_id;
END$$

CREATE TRIGGER IF NOT EXISTS update_restaurant_rating_after_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants 
    SET 
        average_rating = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE restaurant_id = NEW.restaurant_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE restaurant_id = NEW.restaurant_id
        )
    WHERE id = NEW.restaurant_id;
END$$

CREATE TRIGGER IF NOT EXISTS update_restaurant_rating_after_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants 
    SET 
        average_rating = COALESCE((
            SELECT AVG(rating) 
            FROM reviews 
            WHERE restaurant_id = OLD.restaurant_id
        ), 0),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE restaurant_id = OLD.restaurant_id
        )
    WHERE id = OLD.restaurant_id;
END$$

CREATE TRIGGER IF NOT EXISTS update_event_bookings_after_ticket_insert
AFTER INSERT ON tickets
FOR EACH ROW
BEGIN
    UPDATE events 
    SET current_bookings = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM tickets 
        WHERE event_id = NEW.event_id 
        AND payment_status = 'paid'
    )
    WHERE id = NEW.event_id;
END$$

CREATE TRIGGER IF NOT EXISTS update_event_bookings_after_ticket_update
AFTER UPDATE ON tickets
FOR EACH ROW
BEGIN
    UPDATE events 
    SET current_bookings = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM tickets 
        WHERE event_id = NEW.event_id 
        AND payment_status = 'paid'
    )
    WHERE id = NEW.event_id;
END$$

DELIMITER ;

-- Insertar datos de ejemplo
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Brayan Restaurante', 'brayan@restaurante.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9kKQJqEQDy', 'user'),
('Brayan Prueba', 'brayanpru@restaurante.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9kKQJqEQDy', 'user'),
('Administrador', 'admin@gastroapi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9kKQJqEQDy', 'admin');

INSERT IGNORE INTO restaurants (name, description, cuisine_type, address, city, phone, email, price_range, latitude, longitude) VALUES 
('La Terraza Gourmet', 'Restaurante de alta cocina con vista panorámica de la ciudad', 'Internacional', 'Av. Principal 123, Piso 15', 'Bogotá', '+57 1 234-5678', 'info@laterraza.com', '$$$', 4.6097, -74.0817),
('Sabores de Mi Tierra', 'Comida tradicional colombiana en ambiente familiar', 'Colombiana', 'Calle 45 #12-34', 'Medellín', '+57 4 987-6543', 'contacto@saborestierra.com', '$$', 6.2442, -75.5812),
('Sushi Zen', 'Auténtica cocina japonesa con ingredientes frescos', 'Japonesa', 'Carrera 11 #85-42', 'Bogotá', '+57 1 555-7890', 'pedidos@sushizen.com', '$$$', 4.6751, -74.0486),
('Pasta & Amore', 'Trattoria italiana con recetas familiares', 'Italiana', 'Zona Rosa, Local 45', 'Bogotá', '+57 1 333-4455', 'hola@pastaamore.com', '$$', 4.6533, -74.0636),
('El Asador Criollo', 'Carnes a la parrilla y platos típicos', 'Parrilla', 'Calle 70 #8-15', 'Cali', '+57 2 222-3344', 'reservas@asadorcriollo.com', '$$$', 3.4516, -76.5320);

INSERT IGNORE INTO menus (restaurant_id, category, name, description, price, allergens, nutritional_info) VALUES 
(1, 'Entradas', 'Ceviche de Camarones', 'Camarones frescos marinados en limón con cebolla morada', 28000, '["mariscos"]', '{"calorias": 180, "proteinas": 25}'),
(1, 'Platos Principales', 'Salmón Grillado', 'Salmón atlántico con vegetales asados', 45000, '["pescado"]', '{"calorias": 380, "proteinas": 35}'),
(2, 'Platos Principales', 'Bandeja Paisa', 'Plato típico con frijoles, arroz, carne, chorizo y más', 32000, '[]', '{"calorias": 850, "proteinas": 45}'),
(3, 'Entradas', 'Edamame', 'Vainas de soya cocidas con sal marina', 15000, '["soya"]', '{"calorias": 120, "proteinas": 11}'),
(3, 'Platos Principales', 'Ramen Tonkotsu', 'Caldo de cerdo con fideos y chashu', 38000, '["huevo", "gluten"]', '{"calorias": 450, "proteinas": 25}');

INSERT IGNORE INTO events (restaurant_id, name, description, event_date, price, max_capacity) VALUES 
(1, 'Cena Maridaje', 'Cena de 5 tiempos con maridaje de vinos', '2024-02-15 19:00:00', 150000, 40),
(2, 'Festival de Arepas', 'Degustación de arepas tradicionales', '2024-02-20 18:00:00', 25000, 100),
(3, 'Clase de Sushi', 'Aprende a hacer sushi con nuestro chef', '2024-02-25 16:00:00', 80000, 15);


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    price_range ENUM('$', '$$', '$$$', '$$$$') NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    image_url VARCHAR(500),
    average_rating DECIMAL(2,1) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_restaurant (user_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    qr_code TEXT,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'used', 'expired') DEFAULT 'pending',
    payment_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cuisine_type VARCHAR(50) NOT NULL,
    preference_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_cuisine (user_id, cuisine_type)
);

INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Brayan Admin', 'brayan@restaurante.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Brayan User', 'brayanpru@restaurante.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

INSERT IGNORE INTO restaurants (name, description, cuisine_type, location, city, price_range, phone, email) VALUES 
('La Bella Italia', 'Auténtica comida italiana en el corazón de la ciudad', 'Italiana', 'Centro Histórico', 'Bogotá', '$$$', '123-456-7890', 'info@bellaitalia.com'),
('Sushi Zen', 'Experiencia japonesa única con los mejores ingredientes', 'Japonesa', 'Zona Rosa', 'Bogotá', '$$$$', '123-456-7891', 'info@sushizen.com'),
('Tacos El Primo', 'Los mejores tacos mexicanos de la ciudad', 'Mexicana', 'Chapinero', 'Bogotá', '$', '123-456-7892', 'info@tacoselprimo.com'),
('Burger Palace', 'Hamburguesas gourmet para todos los gustos', 'Americana', 'Zona T', 'Bogotá', '$$', '123-456-7893', 'info@burgerpalace.com'),
('Mariscos del Pacífico', 'Frescos mariscos del océano Pacífico', 'Mariscos', 'La Candelaria', 'Bogotá', '$$$', '123-456-7894', 'info@mariscospacifico.com');

DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_restaurant_rating 
AFTER INSERT ON reviews 
FOR EACH ROW 
BEGIN
    UPDATE restaurants 
    SET average_rating = (
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
END//

CREATE TRIGGER IF NOT EXISTS update_restaurant_rating_on_update
AFTER UPDATE ON reviews 
FOR EACH ROW 
BEGIN
    UPDATE restaurants 
    SET average_rating = (
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
END//

CREATE TRIGGER IF NOT EXISTS update_restaurant_rating_on_delete
AFTER DELETE ON reviews 
FOR EACH ROW 
BEGIN
    UPDATE restaurants 
    SET average_rating = COALESCE((
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
END//

DELIMITER ;

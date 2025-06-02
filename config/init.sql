CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_cocina VARCHAR(100) NOT NULL,
    direccion VARCHAR(500) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    rango_precio ENUM('$', '$$', '$$$', '$$$$') NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    sitio_web VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    restaurante_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comentario TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id INT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100),
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    restaurante_id INT,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    estado ENUM('activo', 'usado', 'expirado') DEFAULT 'activo',
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE
);

INSERT IGNORE INTO usuarios (nombre, email, password) VALUES
('Brayan Admin', 'brayan@restaurante.com', '$2b$10$mF8WPgLHxHzlrCpHjPJ.EuG6DGqKw2wOkJyA.kIJ3QOzf1XtJVLaC'),
('Brayan Prueba', 'brayanpru@restaurante.com', '$2b$10$mF8WPgLHxHzlrCpHjPJ.EuG6DGqKw2wOkJyA.kIJ3QOzf1XtJVLaC');

INSERT IGNORE INTO restaurantes (nombre, descripcion, tipo_cocina, direccion, ciudad, rango_precio, telefono, email) VALUES
('Brabus Gourmet', 'Restaurante de alta cocina con los mejores ingredientes', 'Internacional', 'Av. Principal 123', 'Bogotá', '$$$$', '1234567890', 'info@brabusgourmet.com'),
('Pizza Roma', 'Auténtica pizza italiana en horno de leña', 'Italiana', 'Calle 45 #23-12', 'Medellín', '$$', '0987654321', 'pizza@roma.com'),
('Sushi Tokyo', 'Experiencia japonesa tradicional', 'Japonesa', 'Carrera 15 #67-89', 'Cali', '$$$', '1122334455', 'sushi@tokyo.com'),
('Taco Mexicano', 'Los mejores tacos mexicanos', 'Mexicana', 'Calle 12 #34-56', 'Barranquilla', '$', '5566778899', 'tacos@mexicano.com'),
('Burger House', 'Hamburguesas gourmet artesanales', 'Americana', 'Av. Santander 789', 'Cartagena', '$$', '3344556677', 'burger@house.com');

INSERT IGNORE INTO resenas (usuario_id, restaurante_id, rating, comentario) VALUES
(1, 1, 5, 'Excelente comida y servicio impecable'),
(2, 1, 4, 'Muy buena experiencia, recomendado'),
(1, 2, 4, 'La pizza estaba deliciosa'),
(2, 3, 5, 'El mejor sushi de la ciudad'),
(1, 4, 3, 'Buenos tacos pero el servicio podría mejorar'),
(2, 5, 4, 'Hamburguesas muy sabrosas');

INSERT IGNORE INTO menus (restaurante_id, nombre, descripcion, precio, categoria) VALUES
(1, 'Filete Wellington', 'Filete de res envuelto en hojaldre con champiñones', 45000, 'Platos Principales'),
(1, 'Risotto de Mariscos', 'Cremoso risotto con camarones y calamares', 38000, 'Platos Principales'),
(2, 'Pizza Margherita', 'Tomate, mozzarella y albahaca fresca', 25000, 'Pizzas'),
(2, 'Pizza Pepperoni', 'Pepperoni y mozzarella en salsa de tomate', 28000, 'Pizzas'),
(3, 'Sashimi Variado', 'Selección de pescados frescos', 35000, 'Sashimi'),
(3, 'Roll California', 'Aguacate, pepino y cangrejo', 18000, 'Rolls'),
(4, 'Tacos al Pastor', 'Carne de cerdo marinada con piña', 15000, 'Tacos'),
(4, 'Quesadillas', 'Tortilla con queso y pollo', 12000, 'Antojitos'),
(5, 'Burger Clásica', 'Carne, lechuga, tomate y queso', 18000, 'Hamburguesas'),
(5, 'Burger BBQ', 'Carne con salsa BBQ y cebolla caramelizada', 22000, 'Hamburguesas');
const API_BASE_URL = window.location.origin + '/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadRestaurants();
    setupEventListeners();
});

function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const searchInput = document.getElementById('searchInput');
    const cuisineFilter = document.getElementById('cuisineFilter');
    const priceFilter = document.getElementById('priceFilter');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterRestaurants, 300));
    }

    if (cuisineFilter) {
        cuisineFilter.addEventListener('change', filterRestaurants);
    }

    if (priceFilter) {
        priceFilter.addEventListener('change', filterRestaurants);
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.data.user;
            updateAuthUI(true);
        } else {
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        updateAuthUI(false);
    }
}

function updateAuthUI(isAuthenticated) {
    const authSection = document.getElementById('authSection');

    if (isAuthenticated && currentUser) {
        authSection.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user me-2"></i>${currentUser.name}
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" onclick="showProfile()">
                        <i class="fas fa-user me-2"></i>Mi Perfil
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()">
                        <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                    </a></li>
                </ul>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">
                Iniciar Sesión
            </button>
        `;
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.data.user;
            updateAuthUI(true);
            closeModal('loginModal');
            showToast('Inicio de sesión exitoso', 'success');
        } else {
            showToast(data.message || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showToast('Error de conexión', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.data.user;
            updateAuthUI(true);
            closeModal('registerModal');
            showToast('Registro exitoso', 'success');
        } else {
            showToast(data.message || 'Error al registrarse', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showToast('Error de conexión', 'error');
    }
}

async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            currentUser = null;
            updateAuthUI(false);
            showToast('Sesión cerrada exitosamente', 'success');
        }
    } catch (error) {
        console.error('Error en logout:', error);
        showToast('Error al cerrar sesión', 'error');
    }
}

async function loadRestaurants() {
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants`);

        if (response.ok) {
            const data = await response.json();
            displayRestaurants(data.data || []);
        } else {
            displayRestaurants([]);
            showToast('Error cargando restaurantes', 'error');
        }
    } catch (error) {
        console.error('Error cargando restaurantes:', error);
        displayRestaurants([]);
        showToast('Error de conexión', 'error');
    }
}

function displayRestaurants(restaurants) {
    const container = document.getElementById('restaurantsContainer');

    if (!restaurants || restaurants.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="card p-5">
                    <i class="fas fa-utensils fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No hay restaurantes disponibles</h4>
                    <p class="text-muted">Intenta cambiar los filtros de búsqueda</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = restaurants.map(restaurant => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card restaurant-card h-100">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-utensils text-primary me-2"></i>
                        ${restaurant.name || 'Restaurante'}
                    </h5>
                    <p class="card-text">
                        <small class="text-muted">
                            <i class="fas fa-map-marker-alt me-1"></i>
                            ${restaurant.city || 'Ciudad'} | 
                            <i class="fas fa-tags me-1"></i>
                            ${restaurant.cuisine_type || 'Cocina'}
                        </small>
                    </p>
                    <p class="card-text">${restaurant.description || 'Descripción no disponible'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="rating">
                            ${generateStars(restaurant.average_rating || 0)}
                            <small class="text-muted">(${restaurant.total_reviews || 0})</small>
                        </div>
                        <span class="badge bg-primary">${restaurant.price_range || '$'}</span>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-outline-primary btn-sm w-100" 
                            onclick="viewRestaurant(${restaurant.id})">
                        <i class="fas fa-eye me-2"></i>Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

function filterRestaurants() {
    loadRestaurants();
}

function viewRestaurant(id) {
    showToast(`Viendo restaurante ID: ${id}`, 'info');
}

function showRegisterModal() {
    closeModal('loginModal');
    setTimeout(() => {
        const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
        registerModal.show();
    }, 300);
}

function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) modal.hide();
}

function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    const toastId = 'toast-' + Date.now();

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    setTimeout(() => {
        if (toastElement) toastElement.remove();
    }, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.viewRestaurant = viewRestaurant;
window.showRegisterModal = showRegisterModal;
window.logout = logout;
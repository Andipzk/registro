document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. SELECTORES DE ELEMENTOS DEL DOM
    // -------------------------------------------------------------
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authAlertContainer = document.getElementById('authAlertContainer');

    // -------------------------------------------------------------
    // 2. FUNCIÓN PARA MOSTRAR ALERTAS DE AUTENTICACIÓN
    // -------------------------------------------------------------
    function showAuthAlert(message, type = 'danger') {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        authAlertContainer.innerHTML = ''; // Limpia alertas anteriores
        authAlertContainer.appendChild(alertDiv);

        // Ocultar la alerta automáticamente después de 5 segundos
        setTimeout(() => {
            if (alertDiv) {
                const bsAlert = bootstrap.Alert.getInstance(alertDiv) || new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }
        }, 5000);
    }

    // -------------------------------------------------------------
    // 3. FUNCIÓN PARA HASHEAR LA CONTRASEÑA (Simplificado para Cliente)
    //    En un entorno real, esto se haría en el servidor y de forma más robusta.
    //    Aquí solo es para demostrar un "control de clave" básico.
    // -------------------------------------------------------------
    function hashPassword(password) {
        // Una forma muy básica de "hashear" para un proyecto simple de demostración
        // En producción, usarías librerías robustas y salting/peppering.
        return btoa(password); // Codificación Base64
    }

    // -------------------------------------------------------------
    // 4. MANEJO DEL REGISTRO DE USUARIOS
    // -------------------------------------------------------------
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();

        registerForm.classList.remove('was-validated'); // Resetear validación

        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        let isValid = true;

        // Validar nombre de usuario
        if (username.length === 0) {
            document.getElementById('registerUsername').classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('registerUsername').classList.remove('is-invalid');
        }

        // Validar contraseña
        if (password.length < 6) {
            document.getElementById('registerPassword').classList.add('is-invalid');
            document.getElementById('registerPassword').nextElementSibling.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            isValid = false;
        } else {
            document.getElementById('registerPassword').classList.remove('is-invalid');
            document.getElementById('registerPassword').nextElementSibling.textContent = '';
        }

        // Validar confirmación de contraseña
        if (confirmPassword !== password || confirmPassword.length === 0) {
            document.getElementById('confirmPassword').classList.add('is-invalid');
            document.getElementById('confirmPassword').nextElementSibling.textContent = 'Las contraseñas no coinciden.';
            isValid = false;
        } else {
            document.getElementById('confirmPassword').classList.remove('is-invalid');
            document.getElementById('confirmPassword').nextElementSibling.textContent = '';
        }

        if (!isValid) {
            registerForm.classList.add('was-validated');
            showAuthAlert('Por favor, complete todos los campos y corrija los errores.', 'danger');
            return;
        }

        // Verificar si el usuario ya existe
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.username === username) {
            document.getElementById('registerUsername').classList.add('is-invalid');
            document.getElementById('registerUsername').nextElementSibling.textContent = 'Este nombre de usuario ya está registrado.';
            registerForm.classList.add('was-validated');
            showAuthAlert('El nombre de usuario ya existe. Por favor, elija otro.', 'danger');
            return;
        }

        // Registrar el nuevo usuario
        const hashedPassword = hashPassword(password);
        const newUser = {
            username: username,
            password: hashedPassword // Almacena la contraseña "hasheada"
        };
        localStorage.setItem('user', JSON.stringify(newUser));

        showAuthAlert('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
        registerForm.reset();
        registerForm.classList.remove('was-validated');

        // Cambiar a la pestaña de inicio de sesión automáticamente
        const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
        loginTab.show();
    });

    // -------------------------------------------------------------
    // 5. MANEJO DEL INICIO DE SESIÓN
    // -------------------------------------------------------------
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();

        loginForm.classList.remove('was-validated'); // Resetear validación

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        let isValid = true;

        // Validar campos vacíos
        if (username.length === 0) {
            document.getElementById('loginUsername').classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('loginUsername').classList.remove('is-invalid');
        }

        if (password.length === 0) {
            document.getElementById('loginPassword').classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('loginPassword').classList.remove('is-invalid');
        }

        if (!isValid) {
            loginForm.classList.add('was-validated');
            showAuthAlert('Por favor, ingrese su nombre de usuario y contraseña.', 'danger');
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem('user'));

        // Verificar credenciales
        if (storedUser && storedUser.username === username && storedUser.password === hashPassword(password)) {
            // Credenciales correctas, establecer sesión y redirigir
            localStorage.setItem('loggedIn', 'true'); // Marca al usuario como logueado
            window.location.href = 'index.html'; // Redirige a la página principal
        } else {
            // Credenciales incorrectas
            document.getElementById('loginUsername').classList.add('is-invalid');
            document.getElementById('loginPassword').classList.add('is-invalid');
            loginForm.classList.add('was-validated');
            showAuthAlert('Nombre de usuario o contraseña incorrectos.', 'danger');
        }
    });

    // -------------------------------------------------------------
    // 6. VERIFICAR SESIÓN AL CARGAR login.html
    //    Si ya está logueado, redirigir a index.html
    // -------------------------------------------------------------
    const loggedIn = localStorage.getItem('loggedIn');
    if (loggedIn === 'true') {
        window.location.href = 'index.html';
    }
});
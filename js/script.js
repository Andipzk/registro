document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 0. VERIFICAR SESIÓN (Redirección si no está logueado)
    // -------------------------------------------------------------
    const loggedIn = localStorage.getItem('loggedIn');
    if (loggedIn !== 'true') {
        window.location.href = 'login.html'; // Redirigir a la página de login
        // No necesitamos 'return;' aquí porque la redirección ya detiene la ejecución del script en esta página.
    }

    // -------------------------------------------------------------
    // 1. SELECTORES DE ELEMENTOS DEL DOM
    // -------------------------------------------------------------
    const patientForm = document.getElementById('patientForm');
    const patientsTableBody = document.getElementById('patientsTableBody');
    const alertContainer = document.getElementById('alertContainer');
    const logoutButton = document.getElementById('logoutButton'); // Selecciona el botón de cerrar sesión si existe en HTML

    // Selectores para los contadores de gravedad
    const countCritico = document.getElementById('countCritico');
    const countUrgente = document.getElementById('countUrgente');
    const countModerado = document.getElementById('countModerado');
    const countLeve = document.getElementById('countLeve');

    // -------------------------------------------------------------
    // 2. LÓGICA DEL BOTÓN CERRAR SESIÓN
    // -------------------------------------------------------------
    if (logoutButton) { // Asegúrate de que el botón exista antes de añadir el listener
        logoutButton.classList.remove('d-none'); // Mostrar el botón si está logueado (asumiendo que inicia oculto)
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedIn'); // Eliminar la bandera de sesión
            // Opcional: limpiar también los datos del usuario si lo deseas
            // localStorage.removeItem('user');
            window.location.href = 'login.html'; // Redirigir a la página de login
        });
    } else {
        // Si no tienes el botón en el HTML, puedes crearlo dinámicamente.
        // Esto solo es un ejemplo, se recomienda tenerlo en el HTML para claridad.
        const dynamicLogoutBtn = document.createElement('button');
        dynamicLogoutBtn.id = 'logoutButton'; // Dale un ID si lo creas dinámicamente
        dynamicLogoutBtn.classList.add('btn', 'btn-danger', 'float-end', 'mb-3');
        dynamicLogoutBtn.textContent = 'Cerrar Sesión';
        dynamicLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedIn');
            window.location.href = 'login.html';
        });
        // Si decides crearlo dinámicamente, deberías insertarlo en algún lugar del DOM, por ejemplo:
        // document.querySelector('.container').prepend(dynamicLogoutBtn);
    }


    // -------------------------------------------------------------
    // 3. ALMACENAMIENTO DE PACIENTES
    //    Usamos localStorage para persistir los datos
    // -------------------------------------------------------------
    let patients = JSON.parse(localStorage.getItem('patients')) || [];

    // -------------------------------------------------------------
    // 4. FUNCIÓN PARA MOSTRAR ALERTAS (OPCIONAL: Alerta Crítico)
    // -------------------------------------------------------------
    function showAlert(message, type = 'danger') {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.innerHTML = ''; // Limpia alertas anteriores
        alertContainer.appendChild(alertDiv);

        // Ocultar la alerta automáticamente después de 5 segundos
        setTimeout(() => {
            if (alertDiv) {
                // Asegúrate de que bootstrap.Alert esté disponible (ya lo está si Bootstrap JS se carga)
                const bsAlert = bootstrap.Alert.getInstance(alertDiv) || new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }
        }, 5000);
    }

    // -------------------------------------------------------------
    // 5. FUNCIÓN PARA ACTUALIZAR LOS CONTADORES POR GRAVEDAD
    // -------------------------------------------------------------
    function updateSeverityCounts() {
        const counts = {
            critico: 0,
            urgente: 0,
            moderado: 0,
            leve: 0
        };

        patients.forEach(patient => {
            // Asegurarse de que patient.severity exista antes de acceder a counts
            if (patient.severity && counts.hasOwnProperty(patient.severity)) {
                counts[patient.severity]++;
            }
        });

        // Asegurarse de que los elementos HTML de los contadores existen antes de actualizar
        if (countCritico) countCritico.textContent = counts.critico;
        if (countUrgente) countUrgente.textContent = counts.urgente;
        if (countModerado) countModerado.textContent = counts.moderado;
        if (countLeve) countLeve.textContent = counts.leve;
    }

    // -------------------------------------------------------------
    // 6. FUNCIÓN PARA RENDERIZAR LA TABLA DE PACIENTES
    // -------------------------------------------------------------
    function renderPatientsTable() {
        // Definir el orden de gravedad para la clasificación
        const severityOrder = {
            'critico': 1,
            'urgente': 2,
            'moderado': 3,
            'leve': 4
        };

        // Clonar el array de pacientes para no modificar el original al ordenar
        // y luego ordenar por nivel de gravedad
        const sortedPatients = [...patients].sort((a, b) => {
            const orderA = severityOrder[a.severity] || 99; // Asignar un valor alto si la gravedad no está definida
            const orderB = severityOrder[b.severity] || 99;
            return orderA - orderB;
        });

        patientsTableBody.innerHTML = ''; // Limpiar la tabla antes de renderizar

        if (sortedPatients.length === 0) {
            patientsTableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted py-4">No hay pacientes registrados aún.</td>
                </tr>
            `;
            updateSeverityCounts(); // Asegurar que los contadores se actualicen a 0
            return;
        }

        sortedPatients.forEach(patient => {
            const row = patientsTableBody.insertRow(); // Crea una nueva fila <tr>

            // Añadir clase de color de gravedad a la fila completa
            row.classList.add(`severity-${patient.severity}`);

            // Insertar celdas <td> con los datos del paciente
            row.insertCell().textContent = patient.fullName;
            row.insertCell().textContent = patient.age;
            row.insertCell().textContent = patient.gender;
            row.insertCell().textContent = patient.documentId;
            row.insertCell().textContent = patient.symptoms;
            // Capitalizar la primera letra del nivel de gravedad
            row.insertCell().textContent = patient.severity ? patient.severity.charAt(0).toUpperCase() + patient.severity.slice(1) : 'N/A';
            row.insertCell().textContent = patient.treatment || 'N/A';
            row.insertCell().textContent = patient.medications || 'N/A';
            row.insertCell().textContent = patient.exams || 'N/A';

            // Celda para acciones (botón eliminar)
            const actionsCell = row.insertCell();
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
            deleteButton.textContent = 'Eliminar';
            deleteButton.addEventListener('click', () => {
                deletePatient(patient.documentId); // Eliminar por documento de identidad (ID único)
            });
            actionsCell.appendChild(deleteButton);
        });

        // Actualizar los contadores después de renderizar la tabla
        updateSeverityCounts();
    }

    // -------------------------------------------------------------
    // 7. FUNCIÓN PARA ELIMINAR UN PACIENTE (Punto Extra)
    // -------------------------------------------------------------
    function deletePatient(documentId) {
        // Filtrar el array de pacientes para eliminar el que coincide con el ID
        patients = patients.filter(patient => patient.documentId !== documentId);
        localStorage.setItem('patients', JSON.stringify(patients)); // Actualizar localStorage
        renderPatientsTable(); // Volver a renderizar la tabla
        showAlert('Paciente eliminado correctamente.', 'success');
    }

    // -------------------------------------------------------------
    // 8. MANEJO DEL ENVÍO DEL FORMULARIO Y VALIDACIÓN
    // -------------------------------------------------------------
    patientForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitar el envío predeterminado del formulario
        event.stopPropagation(); // Evitar que el evento burbujee

        // Resetear la validación visual de Bootstrap en cada intento
        patientForm.classList.remove('was-validated');

        // Validar todos los campos
        let isValid = true;
        const patientData = {};

        // Función auxiliar para obtener el valor del campo y validar si está vacío
        const getFieldValue = (id, errorMessage) => {
            const input = document.getElementById(id);
            const value = input.value.trim();
            if (value === '') {
                input.classList.add('is-invalid');
                input.nextElementSibling.textContent = errorMessage;
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
                // Limpiar mensaje de error si era válido
                if (input.nextElementSibling) { // Asegurarse de que exista el nextElementSibling
                    input.nextElementSibling.textContent = '';
                }
            }
            patientData[id] = value;
            return value;
        };

        // Validar Nombre Completo
        getFieldValue('fullName', 'El nombre completo es requerido.');

        // Validar Documento de Identidad
        const documentIdValue = getFieldValue('documentId', 'El documento de identidad es requerido y debe tener al menos 5 caracteres.');
        if (documentIdValue.length < 5) {
            const docIdInput = document.getElementById('documentId');
            docIdInput.classList.add('is-invalid');
            if (docIdInput.nextElementSibling) {
                docIdInput.nextElementSibling.textContent = 'El documento debe tener al menos 5 caracteres.';
            }
            isValid = false;
        } else {
            // Validar que el documento de identidad no esté duplicado
            if (patients.some(p => p.documentId === documentIdValue)) {
                const docIdInput = document.getElementById('documentId');
                docIdInput.classList.add('is-invalid');
                if (docIdInput.nextElementSibling) {
                    docIdInput.nextElementSibling.textContent = 'Este documento de identidad ya está registrado.';
                }
                isValid = false;
            }
        }

        // Validar Edad
        const ageInput = document.getElementById('age');
        const ageValue = parseInt(ageInput.value);
        if (isNaN(ageValue) || ageValue <= 0) {
            ageInput.classList.add('is-invalid');
            if (ageInput.nextElementSibling) {
                ageInput.nextElementSibling.textContent = 'La edad debe ser un número mayor a 0.';
            }
            isValid = false;
        } else {
            ageInput.classList.remove('is-invalid');
            if (ageInput.nextElementSibling) {
                ageInput.nextElementSibling.textContent = '';
            }
        }
        patientData.age = ageValue;

        // Validar Género (radio buttons)
        const genderMale = document.getElementById('genderMale');
        const genderFemale = document.getElementById('genderFemale');
        const genderContainer = genderMale.closest('.col-md-4'); // Contenedor para el feedback
        const genderFeedback = genderContainer.querySelector('.invalid-feedback');

        if (!genderMale.checked && !genderFemale.checked) {
            genderMale.classList.add('is-invalid'); // Marca el primer radio para visualización
            if (genderFeedback) {
                genderFeedback.textContent = 'El género es requerido.';
            }
            isValid = false;
        } else {
            genderMale.classList.remove('is-invalid');
            if (genderFeedback) {
                genderFeedback.textContent = '';
            }
            patientData.gender = genderMale.checked ? genderMale.value : genderFemale.value;
        }

        // Validar Nivel de Gravedad
        const severitySelect = document.getElementById('severity');
        if (severitySelect.value === '') {
            severitySelect.classList.add('is-invalid');
            if (severitySelect.nextElementSibling) {
                severitySelect.nextElementSibling.textContent = 'El nivel de gravedad es requerido.';
            }
            isValid = false;
        } else {
            severitySelect.classList.remove('is-invalid');
            if (severitySelect.nextElementSibling) {
                severitySelect.nextElementSibling.textContent = '';
            }
            patientData.severity = severitySelect.value;
        }

        // Validar Síntomas
        getFieldValue('symptoms', 'Los síntomas son requeridos.');

        // Otros campos (opcionales para validación de llenado)
        patientData.treatment = document.getElementById('treatment').value.trim();
        patientData.medications = document.getElementById('medications').value.trim();
        patientData.exams = document.getElementById('exams').value;

        // Si la validación falla, aplicar clase de Bootstrap y salir
        if (!isValid) {
            patientForm.classList.add('was-validated');
            showAlert('Por favor, complete todos los campos obligatorios y corrija los errores.', 'danger');
            return;
        }

        // Si todo es válido, crear el objeto paciente
        const newPatient = {
            fullName: patientData.fullName,
            age: patientData.age,
            gender: patientData.gender,
            documentId: patientData.documentId, // Usamos este como identificador único
            symptoms: patientData.symptoms,
            severity: patientData.severity,
            treatment: patientData.treatment,
            medications: patientData.medications,
            exams: patientData.exams
        };

        patients.push(newPatient); // Añadir el nuevo paciente al array
        localStorage.setItem('patients', JSON.stringify(patients)); // Guardar en localStorage

        renderPatientsTable(); // Volver a renderizar la tabla con el nuevo paciente
        patientForm.reset(); // Limpiar el formulario
        patientForm.classList.remove('was-validated'); // Quitar la validación de Bootstrap

        // Mostrar alerta si es un paciente crítico
        if (newPatient.severity === 'critico') {
            showAlert('¡ATENCIÓN! Paciente en estado CRÍTICO registrado.', 'danger');
        } else {
            showAlert('Paciente registrado exitosamente.', 'success');
        }
    });

    // -------------------------------------------------------------
    // 9. INICIALIZACIÓN: Renderizar la tabla y contadores al cargar la página
    // -------------------------------------------------------------
    renderPatientsTable();
    updateSeverityCounts();
});
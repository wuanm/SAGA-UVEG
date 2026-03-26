//comentada esta seguridad para ver el frontend
//  const user = JSON.parse(localStorage.getItem('user') || '{}');


// if (user.rol !== 'maestro') window.location.href = '/';

// document.getElementById('userName').textContent = user.nombre;
// document.getElementById('userEmail').textContent = user.email;

// Navegación
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));

        this.classList.add('active');
        const page = this.dataset.page;
        document.getElementById(page).classList.add('active');
        document.getElementById('pageTitle').textContent = this.textContent;

        if (page === 'dashboard') loadDashboard();
        if (page === 'carrera') loadCarrera();
        if (page === 'alumnos') loadAlumnos();
        if (page === 'tareas') loadTareas();
        
    });
});

//mensajero
async function apiCall(url, options = {}) {
    try {

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error en respuesta:', data);
        }

        return data;
    } catch (error) {

        return { error: 'Error de conexión' };
    }
};

//Trear datos principales
async function loadDashboard() {
    try {
        const carrera = await apiCall('/api/auth/maestro/carrera');

        const alumnos = await apiCall('/api/auth/maestro/alumnos');

        document.getElementById('dashboardInfo').innerHTML = `
            <div class="info-row">
                <div class="info-label">Carrera:</div>
                <div class="info-value">${carrera.nombre || 'No asignada'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Total Alumnos:</div>
                <div class="info-value">${alumnos.length || 'N/A'} </div>
            </div>
        `;
    } catch (error) {
        console.error('Error en loadDashboard:', error);
    }
};

// Traer los datos de la carrera
async function loadCarrera() {
    try {

        const data = await apiCall('/api/auth/maestro/carrera');

        document.getElementById('carreraInfo').innerHTML = `
            <div class="info-row">
                <div class="info-label">Carrera:</div>
                <div class="info-value">${data.nombre || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Descripción:</div>
                <div class="info-value">${data.descripcion || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Duración:</div>
                <div class="info-value">${data.duracion_semestres || 'N/A'} semestres</div>
            </div>
        `;
    } catch (error) {
        console.error('Error en loadCarrera:', error);
        document.getElementById('carreraInfo').innerHTML = '<p style="color: red;">Error al cargar carrera</p>';
    }
};

//Traer los alumnos
async function loadAlumnos() {
    try {
        const data = await apiCall('/api/auth/maestro/alumnos');

        const tbody = document.querySelector('#alumnosTable tbody');

        if (data.length === 0 || !data || !Array.isArray(data)) {
            tbody.innerHTML = `     
            <tr>
                <td colspan="5" style="text-align: center;">No hay alumnos en esta carrera</td>
            </tr>`;
            return;
        };

        tbody.innerHTML = data.map(a => `
        <tr>
            <td>${a.nombre}</td>
            <td>${a.matricula}</td>
            <td>${a.email}</td>
            <td>${a.semestre_actual}</td>
            <td>${a.telefono || '-'}</td>
        </tr>
    `).join('');
    } catch (error) {
        console.error(' Error en loadAlumnos:', error);
    }
};

//Traer las tareas
async function loadTareas() {
    try {
        const data = await apiCall('/api/auth/maestro/tareas');

        const tbody = document.querySelector('#tareasTable tbody');

        if (data.length === 0 || !data || !Array.isArray(data)) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay tareas creadas</td></tr>';
            return;
        };

        tbody.innerHTML = data.map(t => `
        <tr>
            <td>${t.titulo}</td>
            <td>${t.descripcion || '-'}</td>
            <td>${t.link_drive ? `<a href="${t.link_drive}" target="_blank">Ver Drive</a>` : '-'}</td>
            <td>${new Date(t.created_at).toLocaleDateString()}</td>
            <td>
                <button onclick="irAEntregas(${t.id}, '${t.titulo}')" class="btn" style="background:#3498db; font-size: clamp(0.7rem, 0.8vw, 0.85rem);">
                        Ver Entregas
                </button>
            </td>   
        </tr>
    `).join('');
    } catch (error) {
        console.error('Error en loadTareas:', error);
    }
};

// Crear tarea
document.getElementById('tareaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const result = await apiCall('/api/auth/maestro/tareas', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (result.success) {
            showMessage('messageT', 'Tarea creada exitosamente', 'success');
            e.target.reset();
            loadTareas();

    } else {
        showMessage('messageT', result.error, 'error');
    };

       } catch (error) {
        
    }
   
});

//obtener tareas enviadas por alumnos
async function verEntregas(tareaId) {
    try {
        const data = await apiCall(`/api/auth/maestro/tareas/${tareaId}/entregas`);
        const contenedor = document.querySelector('#listaEntregas');

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="padding: 20px; text-align: center;">Nadie ha entregado todavía.</p>';
            return;
        };

        
        contenedor.innerHTML = data.map(entrega => `
            <div class="entrega-card" style="padding: clamp(10px, 2vh, 15px); border-bottom: 1px solid #eee; margin-bottom: 10px; background: #fff; border-radius: 8px;">
                <p>
                    <strong style="font-size: clamp(0.9rem, 1.1vw, 1.1rem); color: #2c3e50;">
                            ${entrega.alumno_nombre}
                    </strong>
                </p>
                <a href="${entrega.link_respuesta_alumno}" target="_blank" class="link-drive" style="color: #27ae60; text-decoration: none; font-weight: bold;">
                    📂 Ver Tarea 
                </a>
                <br>
                <small style="font-size: clamp(0.7rem, 0.8vw, 0.85rem); color: #888;">
                    Enviado: ${new Date(entrega.fecha_envio).toLocaleString()}
                </small>
            </div>
        `).join('');
        
        // Desplazar automáticamente a la sección 
        document.getElementById('entregas').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error al obtener entregas:', error);
    }
};

//funcion para cambiar de pantalla a  ver entregas
function irAEntregas(id, titulo) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));


    const seccionEntregas = document.getElementById('entregas');
    if (seccionEntregas) {
        seccionEntregas.classList.add('active');
    };


    document.getElementById('pageTitle').textContent = 'Entregas: ' + titulo;


    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navEntregas = document.querySelector('.nav-item[data-page="entregas"]');
    if (navEntregas) {
        navEntregas.classList.add('active');
    };

    verEntregas(id);
};
//mensages
function showMessage(id, msg, type) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.className = `message ${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
};
//salir
function logout() {
    localStorage.clear(); //borra todo
    window.location.href = '/';
};

loadDashboard();
window.logout = logout;
window.irAEntregas = irAEntregas;
window.verEntregas = verEntregas;
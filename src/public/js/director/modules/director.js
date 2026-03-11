import { apiCall, token, user } from './api.js';
import { loadMaestros, loadCarrerasMaestroSelect } from './maestro.js';
import { loadAlumnos,loadCarrerasAlumnoSelect} from './alumno.js';
import { loadCarreras } from './carreras.js';



document.getElementById('userName').textContent = user.nombre;
document.getElementById('userEmail').textContent = user.email;


// Cargar estadísticas
async function loadStats() {

    try {
        const maestros = await apiCall('/api/auth/director/maestros');
        const alumnos = await apiCall('/api/auth/director/alumnos');
        const carreras = await apiCall('/api/auth/director/carreras');

        document.getElementById('totalMaestros').textContent = maestros.length || '0';
        document.getElementById('totalAlumnos').textContent = alumnos.length || '0';
        document.getElementById('totalCarreras').textContent = carreras.length ||'0';
    } catch (error) { console.error('Error cargando estadísticas:', error); }
}

window.loadStats = loadStats;

//Navegar entre vistas
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        this.classList.add('active');
        const page = this.dataset.page;
        document.getElementById(page).classList.add('active');
        document.getElementById('pageTitle').textContent = this.textContent;
        
        //navegar en paginas, si no es una es otra.
        if (page === 'maestros') { loadMaestros(); loadCarrerasMaestroSelect(); }
        if (page === 'alumnos') { loadAlumnos(); loadCarrerasAlumnoSelect(); }
        if (page === 'carreras') loadCarreras();
        if (page === 'dashboard') loadStats();
    });
});

loadStats();

import { apiCall } from './api.js';
import { showMessage } from './utils.js';

// Traer maestros registrados
export async function loadMaestros() {

    try {
        const data = await apiCall('/api/auth/director/maestros');
        const tbody = document.querySelector('#maestrosTable tbody');


        if (!data || !Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `     
        <tr>
            <td colspan="5" style="text-align: center; padding: 20px;">
                No hay maestros registrados en este momento.
            </td>
        </tr>`;
        return;
    };

        tbody.innerHTML = data.map(m => `
            <tr>
                <td>${m.nombre}</td>
                <td>${m.email}</td>
                <td>${m.especialidad || '-'}</td>
                <td>${m.titulo || '-'}</td>
                <td>${m.activo ? 'Activo' : 'Inactivo'}</td>
                <td>
                    <div class="actions-container">
                        <button class="btn-edit" onclick="editarMaestro(${m.id})" title="Editar">
                            <i>✎</i>
                        </button>
                        <button class="btn-delete" onclick="eliminarMaestro(${m.id})" title="Eliminar">
                            <i>🗑</i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        } catch (error) {
            console.error('Error al cargar maestros:', error);
            
    }
};

//eliminar maestro
async function eliminarMaestro(id) {
    if (!confirm('¿Estás seguro de eliminar permanentemente a este maestro?')) return;
    try {
        const result = await apiCall(`/api/auth/director/maestros/${id}`, 
            { method: 'DELETE' 

            });

        if (result.success) {
            showMessage('messageM', result.message, 'success');
            loadMaestros(); 
            if (window.loadStats) window.loadStats();    
        } else {
            showMessage('messageM', result.error || 'Error al eliminar', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar maestro:', error);
        showMessage('messageM', 'Error de conexión con el servidor', 'error');
    }
};

//editar maestro
async function editarMaestro(id) {
    const modal = document.getElementById('editModal');
    const maestros = await apiCall('/api/auth/director/maestros');
    const maestro = maestros.find(m => m.id === id);
    if (!maestro) return alert("No se encontró al maestro");

    const form = document.getElementById('editMaestroForm');
    form.nombre.value = maestro.nombre;
    form.email.value = maestro.email;
    form.especialidad.value = maestro.especialidad || '';
    form.titulo.value = maestro.titulo || '';
    form.telefono.value = maestro.telefono || '';
    form.carrera_id.value = maestro.carrera_id;
    form.dataset.idMaestro = id;
    modal.style.display = 'flex';
};

//traer carreras al form maestro
export async function loadCarrerasMaestroSelect() {
    const data = await apiCall('/api/auth/director/carreras');
    const select = document.getElementById('carreraMaestroSelect');
    const selectEdicion = document.getElementById('editCarreraMaestroSelect');
    const opciones = '<option value="">Seleccionar carrera...</option>' + 
        data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    if(select) select.innerHTML = opciones;
    if(selectEdicion) selectEdicion.innerHTML = opciones;
};

// obtenemos los datos de la base de datos para el formulario
document.getElementById('maestroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    const result = await apiCall('/api/auth/director/maestros', 
        { 
        method: 'POST', 
        body: JSON.stringify(data) 
    });

    if (result.success) {
        showMessage('messageM', 'Maestro creado exitosamente', 'success');
        e.target.reset();
        loadMaestros();
    } else { showMessage('messageM', result.error, 'error'); }
});

//actualizamos datos 
document.getElementById('editMaestroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.dataset.idMaestro; 
    const data = Object.fromEntries(new FormData(e.target));
    
    try {
        const result = await apiCall(`/api/auth/director/maestros/${id}`, 
            { 
                method: 'PUT',
                 body: JSON.stringify(data) 
            });



        if (result.success) {
            alert("Maestro actualizado exitosamente");
            cerrarModal(); 
            loadMaestros(); 
        } else { alert("Error: " + (result.error || "No se pudo actualizar")); }
   
    } catch (error) { 
        console.error("Error al actualizar:", error); 
    }
});

// variables globales para encontrar el onclick eliminar y editar
window.eliminarMaestro = eliminarMaestro;
window.editarMaestro = editarMaestro;
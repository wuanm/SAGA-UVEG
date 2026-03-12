import { apiCall } from  "./api.js";
import {showMessage,cerrarModal} from "./utils.js";



  // traer carreras      
export async function loadCarreras(){
    try {
        const data = await apiCall('/api/auth/director/carreras');
        const tbody = document.querySelector('#carrerasTable tbody');

        if (!data || !Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `     
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">
                    No hay materias registradas en este momento.
                </td>
            </tr>`;
            return;
        };
        tbody.innerHTML = data.map(c => `
            <tr>
                <td>${c.nombre}</td>
                <td >${c.descripcion || '-'}</td>
                <td>${c.duracion_semestres} semestres</td>
                <td>
                    <div class="actions-container">
                        <button class="btn-edit" onclick="editarCarrera(${c.id})" title="Editar">
                            <i>✎</i>
                        </button>
                        <button class="btn-delete" onclick="eliminarCarrera(${c.id})" title="Eliminar">
                            <i>🗑</i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al cargar carreras:', error);
    }
};

//eliminar carrera  
async function eliminarCarrera(id) {
    if (!confirm('¿Estás seguro de eliminar permanentemente esta carrera?')) return;

    try {
        const result = await apiCall(`/api/auth/director/carreras/${id}`,
        {
            method :'DELETE'
        });

        if(result.success){
            showMessage('messageC',result.messsage, 'success');
            alert('Carrera eliminado exitosamente');
            loadCarreras();


            if(window.loadStats) window.loadStats();

        }else {
            showMessage('messageC',result.error || 'Error al eliminar', 'error');
        }
        
    } catch (error) {
        console.error('Error al eliminar Carrera:', error);
        showMessage('messageA', 'Error de conexión con el servidor', 'error');
    };
    
};

//editar carrera
async function editarCarrera(id) {
    const modal = document.getElementById('editModalCarrera'); // ID del modal de Carrera
    const form = document.getElementById('editCarreraForm'); // ID del form dentro del modal
    
    try {
        const carreras = await apiCall('/api/auth/director/carreras');
        
        const carrera = carreras.find(c => c.id === id);
        
        if (!carrera) {
            return alert("No se encontró la Carrera");
        }
      
        form.nombre.value = carrera.nombre;
        form.descripcion.value = carrera.descripcion || '';
        form.duracion_semestres.value = carrera.duracion_semestres || ''
        
        //Guardamos el ID en el dataset para saber qué ID enviar al servidor al guardar
        form.dataset.idCarrera = id;

        modal.style.display = 'flex';

    } catch (error) {
        console.error("Error al cargar datos del alumno:", error);
        alert("Error al conectar con el servidor");
    }
};


//actualizar carrera
document.getElementById('editCarreraForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
   
  //traemos el id que guardamos en el dataset.
  const id = e.target.dataset.idCarrera;
 
  //traemos los datos del formulario
  const data  = Object.fromEntries(new FormData(e.target));

  try {
    const result = await apiCall(`/api/auth/director/carreras/${id}`,
        {
            method: 'PUT',
            body: JSON.stringify(data)
        
        });

        if (result.success){
            alert('Carrera actualizado exitosamente');
            cerrarModal();
            loadAlumnos();
        }else{
            alert('Error: ' + (result.error || 'No se pudo actualizar'));
        }
    
  } catch (error) {
    console.error('Error al actualizar:', error);
  }
    
});

 //crear carrera
document.getElementById('carreraForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    //Obtener todos los datos del formulario
    const formData = new FormData(e.target);
    console.log(formData);


    //Convertir FormData a objeto JavaScript
    const data = Object.fromEntries(formData);
    


    try {
        const result = await apiCall('/api/auth/director/carreras', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (result.success) {
            showMessage('messageC', 'Carrera creada exitosamente', 'success');
            e.target.reset();
            loadCarreras();
        } else {
            showMessage('messageC', result.error, 'error');
        }
        } catch (error) {
        console.error('Error al crear Carrera:', error);
        showMessage('messageC', 'Error de conexión con el servidor', 'error');
    }
});






window.eliminarCarrera = eliminarCarrera;
window.editarCarrera = editarCarrera;
window.loadCarreras = loadCarreras;




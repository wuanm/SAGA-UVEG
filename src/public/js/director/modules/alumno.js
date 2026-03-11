import { apiCall } from  "./api.js";
import {showMessage} from "./utils.js";

//Función traer alumnos
export  async function loadAlumnos() {
    const data = await apiCall('/api/auth/director/alumnos');

    const tbody = document.querySelector('#alumnosTable tbody');

     if (!data || !Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `     
        <tr>
            <td colspan="5" style="text-align: center; padding: 20px;">
                No hay alumnos registrados en este momento.
            </td>
        </tr>`;
        return;
    };

    tbody.innerHTML = data.map( a =>`
        <tr>
            <td>${a.nombre}</td>
            <td>${a.matricula}</td>
            <td>${a.email}</td>
            <td>${a.carrera}</td>
            <td>${a.semestre_actual}</td>
            <td>
                <div class="actions-container">
                    <button class="btn-edit" onclick="editarAlumno(${a.id})" title="Editar">
                        <i>✎</i>
                    </button>
                    <button class="btn-delete" onclick="eliminarAlumno(${a.id})" title="Eliminar">
                        <i>🗑</i>
                    </button>
                </div>
            </td>
        </tr>  
    `).join('');
    
};

//traer carreras al form alumno
export async function loadCarrerasAlumnoSelect() {
    const data = await apiCall('/api/auth/director/carreras');

    const select = document.getElementById('editCarreraAlumnoSelect');
    const select2 = document.getElementById('crearCarreraAlumnoSelect');
    
    select.innerHTML ='<option value="">Seleccionar...</option>' + 
        data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    
    select2.innerHTML ='<option value="">Seleccionar...</option>' + 
        data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    
};


//funcion eliminar alumno
export async function eliminarAlumno(id) {
    if (!confirm('¿Estás seguro de eliminar permanentemente a este alumno?')) return;

    try {
        const result = await apiCall(`/api/auth/director/alumnos/${id}`,
        {
            method :'DELETE'
        });

        if(result.success){
            showMessage('messageA',result.messsage, 'success');
            alert('Alumno eliminado exitosamente');
            loadAlumnos();

            if(window.loadStats) window.loadStats();

        }else {
            showMessage('messageA',result.error || 'Error al eliminar', 'error');

        }
        
    } catch (error) {
        console.error('Error al eliminar alumno:', error);
        showMessage('messageA', 'Error de conexión con el servidor', 'error');
        
    }
    
};

//editar alumno
async function editarAlumno(id) {
    //1.referencias a los elementos del DOM
    const modal = document.getElementById('editModalAlumno'); // ID del modal de alumno
    const form = document.getElementById('editAlumnoForm'); // ID del form dentro del modal
    
    try {
        await loadCarrerasAlumnoSelect();
        //2.obtener la lista actualizada de alumnos
        const alumnos = await apiCall('/api/auth/director/alumnos');
        
        //3.buscar el alumno específico por ID
        const alumno = alumnos.find(a => a.id === id);
        
        if (!alumno) {
            return alert("No se encontró al alumno");
        }
      
        //4.llenar el formulario con los datos del alumno encontrado
        form.nombre.value = alumno.nombre;
        form.email.value = alumno.email;
        form.matricula.value = alumno.matricula || '';
        form.telefono.value = alumno.telefono || '';
        form.carrera_id.value = alumno.carrera_id;
    

       
        
        //Guardamos el ID en el dataset para saber qué ID enviar al servidor al guardar
        form.dataset.idAlumno = id;

        //5.mostrar el modal
        modal.style.display = 'flex';

    } catch (error) {
        console.error("Error al cargar datos del alumno:", error);
        alert("Error al conectar con el servidor");
    }
};


//obtemos datos del form de la  base de datos alumno
document.getElementById('alumnoForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const result = await apiCall('/api/auth/director/alumnos',{
        method: 'POST',
        body: JSON.stringify(data)
    });

    if(result.success){
        showMessage('messageA','Alumno creado exitosamente','success');
        e.target.reset();
        loadAlumnos();
    }else{
        showMessage('messageA',result.error,'error');
    }
});

//actualizar datos
document.getElementById('editAlumnoForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
   
  //traemos el id que guardamos en el dataset.
  const id = e.target.dataset.idAlumno;
 
  //traemos los datos del formulario
  const data  = Object.fromEntries(new FormData(e.target));

  try {
    const result = await apiCall(`/api/auth/director/alumnos/${id}`,
        {
            method: 'PUT',
            body: JSON.stringify(data)
        
        });

        if (result.success){
            alert('Alumno actualizado exitosamente');
            cerrarModal();
            loadAlumnos();
        }else{
            alert('Error: ' + (result.error || 'No se pudo actualizar'));
        }
    
    
  } catch (error) {
    console.error('Error al actualizar:', error);
  }
    
});



//Damos variable global para encontrar los onclick
window.eliminarAlumno = eliminarAlumno;
window.editarAlumno = editarAlumno;
        
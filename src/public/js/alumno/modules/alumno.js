const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');


if (!token || user.rol !== 'alumno') window.location.href = '/';

document.getElementById('userName').textContent = user.nombre;
document.getElementById('userEmail').textContent = user.email;



// Navegación
document.querySelectorAll('.nav-item').forEach(item =>{
      item.addEventListener('click',function(){
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));

        item.classList.add('active');
        const page = item.dataset.page;//traemos nuestra variable para abrir las pagina seleccionada
        document.getElementById(page).classList.add('active');
         document.getElementById('pageTitle').textContent = this.textContent;


        if(page === 'dashboard')loadDashboard();

        if(page === 'carrera')loadCarrera();

        if(page === 'materias')loadMaterias() ;

        if(page === 'companeros')loadCompaneros();


    })
});

//función con fetch empaquetado
async function apiCall (url,options={}){
    try {
        const response = await fetch(url,{
            ...options,
            headers:{
                'Content-type' : 'application/json',
                'Authorization' : `Bearer ${token}`,
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok){
            console.log('Error en respuesta:',data);
        };

        return data;
        
    } catch (error) {
        return {error: 'Error de conexión'}  
    }
};

//Datos principales
async function loadDashboard() {
    try {
        const carrera = await apiCall('/api/auth/alumno/carrera');
        const materias = await apiCall('/api/auth/alumno/materias');

        document.getElementById('dashboardInfo').innerHTML= `   
            <div class="info-row">
                <div class="info-label">Nombre :</div>
                <div class="info-value">${user.nombre || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Matricula</div>
                <div class="info-value">${carrera.matricula || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Carrera</div>
                <div class="info-value">${carrera.nombre || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Semestre Actual :</div>
                <div class="info-value">${carrera.semestre_actual || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Actividades :</div>
                <div class="info-value">${materias.length ||'N/A'} </div>
            
            </div>
        `;
        } catch (error) {
            console.log(error, 'Error al cargar los datos principales');
        
    }
};


//Obtener carreras
async function loadCarrera() {
    try{
    const data = await apiCall('/api/auth/alumno/carrera');

    if(!data || data.error){
        throw new Error('Error al cargar la carrera');
    };

    document.getElementById('carreraInfo').innerHTML =`
           <div class="info-row">
                <div class="info-label">Carrera:</div>
                <div class="info-value">${data.nombre}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Descripción:</div>
                <div class="info-value">${data.descripcion || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Duración:</div>
                <div class="info-value">${data.duracion_semestres}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Semestre Actual:</div>
                <div class="info-value">${data.semestre_actual}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Matrícula:</div>
                <div class="info-value">${data.matricula}</div>
            </div>
    `;  
    }catch (error){
        console.log(error, 'Error al cargar la carrera');
    }
};

//Obtener compañeros
async function loadCompaneros() {
    try {
        const data = await apiCall('/api/auth/alumno/companeros');
        const tbody = document.querySelector('#companerosTable tbody');

        if(!data || data.length ===0){
            tbody.innerHTML =`
            '<tr><td colspan="5" style="text-align: center;">No hay tareas creadas</td></tr>';
            `;
            return;
        };

        tbody.innerHTML = data.map(c => `
            <tr>
                <td>${c.nombre}</td>
                <td>${c.matricula}</td>
                <td>${c.email}</td>
                <td>${c.semestre_actual}</td>
            </tr>
        `).join('');
        

        } catch (error) {
            console.log(error, 'Error al cargar los compañeros');
    }
};

//Obtener actividades
async function loadMaterias() {
    try {
        const data = await apiCall('/api/auth/alumno/materias');
        const tbody = document.querySelector('#actividadesTable tbody');

        if(!data || data.length ===0){
            tbody.innerHTML = 
                `<tr>
                    <td colspan="5" style="text-align: center;">No hay actividades</td>
                </tr>`;
            return;
        };

        tbody.innerHTML = data.map(t => `
              <tr>
                    <td>
                        <b style="font-size: clamp(0.9rem,1.1vw,1.1rem);">${t.titulo}</b><br>
                        <small>${t.descripcion ||''}</small>
                    </td>
                    <td>
                        <a href="${t.link_drive }" target="_blank">📂 Abrir Material</a>
                    </td>
                    <td>
                        <div class="entrega-group" >
                            <input type="url"  id="input-${t.id}"
                                    value="${t.ya_enviado || ''}"
                                    placeholder="Pega tu link aquí"
                                    class="input-fluido">
                            <button type="button" onclick="subirTarea(${t.id},this)" class="btn-accion" style="background: #3498db; font-size: clamp(0.7rem, 0.8vw, 0.85rem);">
                                ${t.ya_enviado ? 'Actualizar' : 'Enviar'}
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

     } catch (error) {
        console.log(error, 'Error al cargar las actividades');
        
    };        
};

//Enviar tarea
async function subirTarea(id,btnEvn) {

    const linkInput = document.getElementById(`input-${id}`);

    if(!linkInput){
        console.error("Elemento de entrada no encontrado",`input-${id}`);
        return;
    };

    const linkValue = linkInput.value.trim();

    if(!linkValue){
        alert("Por favor, Ingresa un enlace")
        return;
    };

    const textoOriginal =btnEvn.textContent; //se guarda el texto original

    try {
        // --- BLOQUEO AQUÍ ---
        btnEvn.disabled = true;
        btnEvn.textContent = 'Enviando...';
        linkInput.disabled = true;
   


        const res = await apiCall(`/api/auth/alumno/entregar`, {
            method: 'POST',
            body: JSON.stringify({ 
                tarea_id: id, 
                link_respuesta: linkValue 
            })
        });
            
           if (res.success) {
                alert("¡Tarea enviada con éxito!");

                btnEvn.textContent ='Eviado';
                btnEvn.style.backgroundColor='#28a745';
                linkInput.value = linkValue;
            } else {
                alert("Error: " + (res.error || res.message || "Error al enviar"));

                btnEvn.disabled = false;
                btnEvn.textContent = textoOriginal;
                linkInput.disabled = false;
            }


    } catch (error) {
        console.log(error, 'Error al cargar las actividades');

        btnEvn.disabled = false;
        btnEvn.textContent = 'Reintentar';
        linkInput.disabled = false;
        
    }
    
};


export async function logout() {
    try{
        await apiCall('/api/auth/logout',
            {method: 'POST'
            });

        localStorage.clear();
        window.location.href = '/';
    }catch(error )
    {console.error('Error al cerrar sesión:', error);
         localStorage.clear();
        window.location.href = '/';
    }

};




//Funciones de inicio
loadDashboard();
window.subirTarea = subirTarea;
window.logout = logout;



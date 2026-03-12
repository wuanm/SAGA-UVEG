import { apiCall } from './api.js';



export function showMessage(id, msg, type) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.className = `message ${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
}

export function cerrarModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';

    document.getElementById('editModalAlumno').style.display='none';

    document.getElementById('editModalCarrera').style.display='none';
}

// export function logout() {
//     localStorage.clear();
//     window.location.href = '/';
// 

export async function logout(){
    try{
        await apiCall('/api/auth/logout',{method: 'POST'});
        localStorage.clear();
        window.location.href = '/';
    }catch(error )
    {console.error('Error al cerrar sesión:', error);
         localStorage.clear();
        window.location.href = '/';
    }

};
// Puentes para el HTML
window.cerrarModal = cerrarModal;
window.logout = logout;
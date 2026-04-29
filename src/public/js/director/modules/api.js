
export const user = JSON.parse(localStorage.getItem('user') || '{}');


// Validar acceso
if (user.rol !== 'director') {
    window.location.href = '/';
}



export async function apiCall(url, options = {}) {
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

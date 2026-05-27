export const token = localStorage.getItem('token');
export const user = JSON.parse(localStorage.getItem('user') || '{}');

// Validar acceso
if (!token || user.rol !== 'director') {
    window.location.href = '/';
}
export async function apiCall(url, options = {}) {
    try {

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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

// Codigo auxiliar-----------------
// const storedUser = localStorage.getItem('user');
// export const user = storedUser ? JSON.parse(storedUser) : {};
// export  const user = localStorage.getItem('user');





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

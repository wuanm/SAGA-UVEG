document.getElementById('loginForm').addEventListener('submit', async (e)=>{
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');

    try {
        const response = await fetch('/api/auth/login',{
            method:'POST',
            headers:{'Content-Type': 'application/json'},
            body:JSON.stringify({email,password})
        });

        //traer lo que respondio e3l servidor
        const data= await response.json();
     
            //creamos  nuestro localstorage
        if(response.ok){
            localStorage.setItem('token',data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario ));

            //dirigiendo el rol
            if(data.usuario.rol === 'director'){
                window.location.replace('/director');
            }else if(data.usuario.rol === 'maestro'){
                window.location.replace('/maestro');
            }else {
                window.location.replace('/alumno');
            }

        }else{
            errorDiv.textContent=data.error || "Error al iniciar sesión ";
            errorDiv.style.display="block";
        
        }
    } catch (error) {
        errorDiv.textContent="Error de conexión";
        errorDiv.style.display="block"; 
    }

});
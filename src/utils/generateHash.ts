import bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'TuContraseñaSegura'; // <-----------------------
  const hash = await bcrypt.hash(password, 10);
  console.log('Contraseña:', password);
  console.log('Hash generado:', hash);
}

generateHash();


// Herramienta auxiliar para generar contraseña
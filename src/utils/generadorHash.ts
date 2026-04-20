import bcrypt from 'bcrypt';

//hash de contraseña para la base de datos del director
async function generateHash() {
  const password = 'Colocar contraseña ejem: -juanLopes123-';
  const hash = await bcrypt.hash(password, 10);
  console.log('Contraseña:', password);
  console.log('Hash generado:', hash);
}

generateHash();
const bcrypt = require('bcryptjs');

async function test() {
  const tempPassword = 'mysecretpass';
  const hashed = await bcrypt.hash(tempPassword, 12);
  const isValid = await bcrypt.compare(tempPassword, hashed);
  console.log('IsValid:', isValid);
}
test();
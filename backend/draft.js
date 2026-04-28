import bcrypt from 'bcryptjs';
console.log(await bcrypt.hash('5a58e6214198bd9f9415ccab54eb5ecc', 10));

console.log(await bcrypt.hash('phoebe', 10));

console.log(await bcrypt.hash('monica', 10));


const bcrypt = require('bcryptjs');
bcrypt.hash('admin', 10).then(console.log);
bcrypt.hash('user', 10).then(console.log);

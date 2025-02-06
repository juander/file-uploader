require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Configurar trust proxy para funcionar no Render
app.set('trust proxy', 1);

// Definir limite de requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: "Muitas requisições, tente novamente mais tarde.",
});
app.use(limiter);

// Configuração de usuário fixo para testes
const userDB = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('seguro123@', 10), // Senha segura criptografada
};

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  if (username !== userDB.username || !bcrypt.compareSync(password, userDB.passwordHash)) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ username: userDB.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
  return res.json({ token });
});

// Rota para upload de arquivos
const upload = multer({ dest: 'uploads/' });
app.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  res.json({ message: 'Arquivo enviado com sucesso.', fileName: req.file.originalname });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000...');
});

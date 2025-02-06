require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Configuração necessária para funcionar no Render
app.set('trust proxy', 1); // Evita erro de X-Forwarded-For no Render

// Verifica a SECRET_KEY
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error('Erro: SECRET_KEY não definida.');
  process.exit(1);
}

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Criação da pasta 'uploads'
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuração Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Tipo de arquivo não suportado!'));
  },
});

// Rota de Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Credenciais inválidas' });
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente ou mal formatado' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Rota Upload
app.post('/upload', authenticateToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError || err.message) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Erro ao processar o upload' });
    }
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    res.json({ message: 'Upload realizado!', file: req.file });
  });
});

// Rota para deletar arquivo
app.delete('/delete/:filename', authenticateToken, (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar arquivo' });
    res.json({ message: 'Arquivo deletado com sucesso!' });
  });
});

// Rota principal para evitar erro de Cannot GET /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota não encontrada
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

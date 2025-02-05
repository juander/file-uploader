require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { unlink } = require('fs');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Verifica se a SECRET_KEY está definida
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error('Erro: SECRET_KEY não definida.');
  process.exit(1);
}

// Middlewares
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']); // Configuração segura para o Render
app.use(helmet());
app.use(cors({
  origin: 'https://file-uploader-t76a.onrender.com', // Substitua pelo domínio do seu front-end
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
});
app.use(limiter);

// Cria a pasta 'uploads' se não existir
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Adiciona um timestamp ao nome do arquivo
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado!'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // Limite de 5MB

// Rota de Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verificação básica das credenciais (sem banco de dados)
  if (username === 'usuarioSeguro' && password === 'SenhaForte2025') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Middleware de Autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Rota de Upload de Arquivo
app.post('/upload', authenticateToken, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'O arquivo excede o limite de 5MB' });
        }
        if (err.message === 'Tipo de arquivo não suportado!') {
          return res.status(400).json({ error: 'Tipo de arquivo não suportado' });
        }
        if (err.code === 'Unexpected field') {
          return res.status(400).json({ error: 'O campo do arquivo deve ser chamado "file"' });
        }
        console.error('Erro no upload:', err); // Log do erro no console
        return res.status(500).json({ error: 'Erro ao processar o arquivo' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }
      res.json({ message: 'Arquivo enviado com sucesso!', file: req.file });
    });
  });

// Rota para Listar Arquivos
app.get('/files', authenticateToken, (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao listar arquivos' });
    }
    res.json(files);
  });
});

// Rota para Deletar Arquivo
app.delete('/delete/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);

  unlink(filePath, (err) => {
    if (err) {
      console.error(`Erro ao deletar arquivo ${filename}:`, err);
      return res.status(500).json({ error: 'Erro ao deletar o arquivo' });
    }
    res.json({ message: 'Arquivo deletado com sucesso!' });
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { unlink } = require('fs');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const SECRET_KEY = process.env.SECRET_KEY;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado!'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Credenciais inválidas');
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).send('Token não fornecido');

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Token inválido');
    req.user = user;
    next();
  });
};

app.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  res.send('Arquivo enviado com sucesso!');
});

app.get('/files', authenticateToken, (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) {
      res.status(500).send('Erro ao listar arquivos');
    } else {
      res.json(files);
    }
  });
});

app.delete('/delete/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);

  unlink(filePath, (err) => {
    if (err) {
      console.error(`Erro ao deletar arquivo ${filename}:`, err);
      return res.status(500).send('Erro ao deletar o arquivo');
    }
    res.send('Arquivo deletado com sucesso!');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
const express = require('express');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet'); // Segurança

const app = express();

app.use(helmet());
app.use(express.static('public'));

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Filtro para tipos de arquivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado!'));
  }
};

// Configurar o upload com filtro
const upload = multer({ storage, fileFilter });

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('Arquivo enviado com sucesso!');
});

app.get('/files', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

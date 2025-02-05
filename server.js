const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet'); // Segurança

const app = express();

app.use(helmet());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Certifique-se de que o diretório "uploads" existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

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
  fs.readdir('uploads/', (err, files) => {
    if (err) {
      res.status(500).send('Erro ao listar arquivos');
    } else {
      res.json(files);
    }
  });
});

// Porta dinâmica para compatibilidade com o Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('file-input');
  if (!fileInput.files.length) {
    showMessage('Escolha um arquivo antes de enviar!', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  const loading = document.getElementById('loading');
  loading.classList.remove('d-none');

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Erro ao enviar o arquivo. Tente novamente mais tarde.');
    }

    const message = await response.text();
    showMessage(message, 'success');
    fileInput.value = '';  // Limpa o campo de arquivo
    await loadFiles();  // Recarrega a lista de arquivos
  } catch (err) {
    console.error('Erro no upload:', err);
    showMessage(err.message || 'Erro ao enviar o arquivo', 'error');
  } finally {
    loading.classList.add('d-none');
  }
});

async function loadFiles() {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';

  try {
    const response = await fetch('/files');

    if (!response.ok) {
      throw new Error('Erro ao carregar arquivos');
    }

    const files = await response.json();

    if (files.length === 0) {
      fileList.innerHTML = '<li class="list-group-item">Nenhum arquivo encontrado.</li>';
      return;
    }

    files.forEach(file => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

      const link = document.createElement('a');
      link.href = `/uploads/${file}`;
      link.textContent = file;
      link.target = '_blank';

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Excluir';
      deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
      deleteButton.addEventListener('click', async () => {
        try {
          const deleteResponse = await fetch(`/delete/${file}`, {
            method: 'DELETE',
          });

          if (!deleteResponse.ok) {
            const errorMessage = await deleteResponse.text();
            throw new Error(errorMessage || 'Erro ao excluir o arquivo');
          }

          const deleteMessage = await deleteResponse.text();
          showMessage(deleteMessage, 'success');
          await loadFiles();
        } catch (err) {
          console.error('Erro ao excluir arquivo:', err);
          showMessage(err.message || 'Erro ao excluir o arquivo', 'error');
        }
      });

      li.appendChild(link);
      li.appendChild(deleteButton);
      fileList.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao carregar a lista de arquivos:', err);
    showMessage(err.message || 'Erro ao carregar a lista de arquivos', 'error');
  }
}

function showMessage(message, type = 'info') {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
  messageElement.className = `alert alert-${type}`;
  messageElement.style.display = 'block';

  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 5000);
}

// Função para permitir arrastar e soltar
const dropArea = document.getElementById('drop-area');

// Evita o comportamento padrão e destaca a área ao arrastar arquivos sobre ela
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();  // Impede o comportamento padrão de "abrir" o arquivo
  dropArea.classList.add('border-primary');  // Destaca a área de arraste
  dropArea.classList.remove('border');  // Remove a borda original
});

// Remove o destaque da borda quando o arquivo sai da área de arraste
dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('border-primary');  // Remove o destaque da borda
  dropArea.classList.add('border');  // Restaura a borda original
});

// Quando o arquivo for solto na área de arraste, faz o upload automaticamente
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();  // Impede o comportamento padrão (que pode causar refresh ou abrir o arquivo)
  dropArea.classList.remove('border-primary');  // Remove o destaque da borda
  dropArea.classList.add('border');  // Restaura a borda original

  const files = e.dataTransfer.files;  // Obtém os arquivos arrastados

  if (files.length > 0) {
    const fileInput = document.getElementById('file-input');
    fileInput.files = files;  // Define os arquivos no input

    document.getElementById('upload-form').submit();  // Submete o formulário automaticamente
  }
});

// Carrega a lista de arquivos ao carregar a página
loadFiles();

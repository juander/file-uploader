document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
  
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Erro ao enviar o arquivo. Tente novamente mais tarde.');
      }
  
      const message = await response.text();
      showMessage(message, 'success');
      fileInput.value = '';
      await loadFiles();
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
  
    const token = localStorage.getItem('token');
    if (!token) {
      showMessage('Token de autenticação não encontrado. Faça login novamente.', 'error');
      window.location.href = 'login.html'; // Redireciona para a página de login
      return;
    }
  
    try {
  
      const response = await fetch('/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
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
              headers: {
                'Authorization': `Bearer ${token}`,
              },
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
  
  // Carrega a lista de arquivos ao carregar a página
  loadFiles();
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files.length) return alert('Escolha um arquivo!');
  
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
  
    const loading = document.getElementById('loading');
    loading.classList.remove('d-none');
  
    try {
      const token = localStorage.getItem('token'); // Obtenha o token do localStorage
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const message = await response.text();
      document.getElementById('message').innerText = message;
  
      fileInput.value = '';
      loadFiles();
    } catch (err) {
      console.error(err);
    } finally {
      loading.classList.add('d-none');
    }
  });
  
  async function loadFiles() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
  
    try {
      const token = localStorage.getItem('token'); // Obtenha o token do localStorage
      const response = await fetch('/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar arquivos');
  
      const files = await response.json();
  
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
            const deleteMessage = await deleteResponse.text();
            alert(deleteMessage);
            loadFiles();
          } catch (err) {
            console.error('Erro ao excluir arquivo:', err);
          }
        });
  
        li.appendChild(link);
        li.appendChild(deleteButton);
        fileList.appendChild(li);
      });
    } catch (err) {
      console.error('Erro ao carregar a lista de arquivos:', err);
    }
  }
  
  loadFiles();
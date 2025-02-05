document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Erro ao fazer login');
      }
  
      const { token } = await response.json();
      localStorage.setItem('token', token); // Armazena o token no localStorage
      window.location.href = 'index.html'; // Redireciona para a página de upload
    } catch (err) {
      console.error('Erro no login:', err);
      showMessage(err.message || 'Erro ao fazer login', 'error');
    }
  });
  
  function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `alert alert-${type}`;
    messageElement.style.display = 'block';
  
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
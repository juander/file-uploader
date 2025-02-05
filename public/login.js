document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showMessage('Por favor, preencha todos os campos.', 'error');
    return;
  }

  const loginButton = document.getElementById('login-button');
  loginButton.disabled = true;
  loginButton.textContent = 'Carregando...';

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

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = 'index.html';
    } else {
      throw new Error('Token não recebido do servidor');
    }
  } catch (err) {
    console.error('Erro no login:', err);
    showMessage(err.message || 'Erro ao fazer login', 'error');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Login';
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
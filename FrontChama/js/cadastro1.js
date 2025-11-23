document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm');
  const btn = form.querySelector('button[type="submit"]');

  // Campos do formulário
  const campos = {
    nome: form.querySelector('#nome'),
    funcional: form.querySelector('#funcional'),
    senha: form.querySelector('#senha'),
    confirmar: form.querySelector('#confirmarSenha'),
    termos: form.querySelector('#termos')
  };

  // Modal
  const modal = document.getElementById('modalTermos');
  const abrirTermos = document.getElementById('abrirTermos');
  const fecharModal = document.getElementById('fecharModal');
  const btnCancelarTermos = document.getElementById('btnCancelarTermos');
  const btnAceitarTermos = document.getElementById('btnAceitarTermos');

  // Função para mostrar erro
  function mostrarErro(input, mensagem) {
    input.classList.add('input-error');
    const erroMsg = input.dataset.error ? document.getElementById(input.dataset.error) : input.nextElementSibling;
    if (erroMsg) {
      erroMsg.textContent = mensagem;
      erroMsg.classList.remove('hidden');
    }
  }

  // Função para limpar erros
  function limparErros() {
    Object.values(campos).forEach(input => input.classList.remove('input-error'));
    document.querySelectorAll('.error-message').forEach(msg => {
      msg.textContent = '';
      msg.classList.add('hidden');
    });
  }

  // Limpar erro ao digitar
  Object.values(campos).forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const erroMsg = input.dataset.error ? document.getElementById(input.dataset.error) : input.nextElementSibling;
      if (erroMsg) erroMsg.textContent = '';
    });
  });

  // Modal dos termos
  abrirTermos.addEventListener('click', e => {
    e.preventDefault();
    modal.classList.remove('hidden');
  });
  [fecharModal, btnCancelarTermos].forEach(btn => btn.addEventListener('click', () => modal.classList.add('hidden')));
  btnAceitarTermos.addEventListener('click', () => {
    campos.termos.checked = true;
    modal.classList.add('hidden');
  });

  // Validação do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparErros();

    let erro = false;

    if (!campos.nome.value.trim()) {
      mostrarErro(campos.nome, 'Este campo é obrigatório.');
      erro = true;
    }

    if (!campos.funcional.value.trim()) {
      mostrarErro(campos.funcional, 'Este campo é obrigatório.');
      erro = true;
    }

    if (campos.senha.value.length < 6) {
      mostrarErro(campos.senha, 'A senha deve ter pelo menos 6 dígitos.');
      erro = true;
    }

    if (campos.senha.value !== campos.confirmar.value) {
      mostrarErro(campos.confirmar, 'As senhas não coincidem.');
      erro = true;
    }
    // Campo Confirmar Senha obrigatório
if (!campos.confirmar.value.trim()) {
  mostrarErro(campos.confirmar, 'Este campo é obrigatório.');
  erro = true;
}

// Depois verifica se senhas conferem (só se o confirmar tiver valor)
if (campos.confirmar.value.trim() && campos.senha.value !== campos.confirmar.value) {
  mostrarErro(campos.confirmar, 'As senhas não coincidem.');
  erro = true;
}


    if (!campos.termos.checked) {
      const msg = document.getElementById('erroTermos');
      if (msg) {
        msg.textContent = 'Você precisa concordar com os Termos.';
        msg.classList.remove('hidden');
      }
      erro = true;
    }

    if (erro) return;

    // Bloqueia botão enquanto cadastra
    btn.disabled = true;
    btn.textContent = "Cadastrando...";
    btn.classList.add("opacity-60", "cursor-not-allowed");

    try {
      const response = await fetch("https://localhost:7271/api/v1/Usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nome_usuario: campos.nome.value.trim(),
          Funcional: campos.funcional.value.trim(),
          Senha: campos.senha.value
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      btn.textContent = "Sucesso!";
      btn.classList.add("bg-green-600");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);

    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
      btn.disabled = false;
      btn.textContent = "CADASTRAR";
      btn.classList.remove("opacity-60", "cursor-not-allowed");
    }
  });

  // Limite de 6 dígitos e apenas números na senha
  campos.senha.addEventListener('input', () => {
    campos.senha.value = campos.senha.value.replace(/\D/g, '').slice(0, 6);
  });
});
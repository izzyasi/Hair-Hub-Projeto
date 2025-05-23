import { auth, db } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
function senhaEhForte(senha) {
  // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 símbolo
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(senha);
}
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

window.addEventListener('DOMContentLoaded', () => {
  const modalLogin = document.getElementById('modalLogin');
  const modalCadastro = document.getElementById('modalCadastro');
  const reservaModal = document.getElementById('reservaModal');
  const btnFecharReserva = reservaModal.querySelector('.btn-fechar');
  const btnEntrar = document.getElementById('btnEntrar');
  const btnCriarConta = document.getElementById('btnCriarConta');
  const btnSair = document.getElementById('btnSair');
  const perfil = document.getElementById('perfil');

  const btnEntrarLogin = document.getElementById('btnEntrarLogin');

  // Cadastro (exemplo básico, mantém sua validação de senha)
  const btnCadastrar = document.getElementById('btnCadastrar');
  btnCadastrar.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailCadastro').value.trim();
    const senha = document.getElementById('senhaCadastro').value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      alert('Login realizado com sucesso!');
      modalLogin.style.display = 'none';
      // O onAuthStateChanged já vai atualizar a UI automaticamente
    } catch (error) {
      // Verifica erros específicos para mensagem melhor
      if (error.code === 'auth/wrong-password') {
        alert('Senha incorreta. Tente novamente.');
      } else if (error.code === 'auth/user-not-found') {
        alert('Usuário não encontrado. Verifique o email.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Email inválido.');
      } else {
        alert('Erro ao fazer login: ' + error.message);
      }

    // Sua função senhaEhForte permanece aqui...
    if (!senhaEhForte(senha)) {
      alert("Senha fraca.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      alert("Conta criada com sucesso!");
      modalCadastro.style.display = 'none';
      modalLogin.style.display = 'flex';
    } catch (error) {
      alert("Erro ao criar conta: " + error.message);
    }
    }
  });

  // Botão sair
  btnSair.addEventListener('click', async () => {
    try {
      await auth.signOut();
      alert("Você saiu da conta.");
    } catch (error) {
      alert("Erro ao sair: " + error.message);
    }
  });

  // Ícone perfil clicável
  perfil.addEventListener('click', () => {
    alert("Aqui você pode abrir o menu do perfil.");
  });

  // Atualizar UI conforme estado do usuário
  onAuthStateChanged(auth, (user) => {
    console.log("Estado do usuário mudou:", user);

    if (user) {
      // Logado
      btnEntrar.style.display = 'none';
      btnCriarConta.style.display = 'none';
      btnSair.style.display = 'inline-block';
      perfil.style.display = 'inline-block';

      // Opcional: fechar modais login/cadastro ao logar
      modalLogin.style.display = 'none';
      modalCadastro.style.display = 'none';

    } else {
      // Deslogado
      btnEntrar.style.display = 'inline-block';
      btnCriarConta.style.display = 'inline-block';
      btnSair.style.display = 'none';
      perfil.style.display = 'none';
    }
  });

  // Botões abrir modais de login/cadastro
  btnEntrar.addEventListener('click', () => {
    modalLogin.style.display = 'flex';
    modalCadastro.style.display = 'none';
    reservaModal.style.display = 'none';
  });

  btnCriarConta.addEventListener('click', () => {
    modalCadastro.style.display = 'flex';
    modalLogin.style.display = 'none';
    reservaModal.style.display = 'none';
  });

  // Fechar Login
  btnFecharLogin.addEventListener('click', () => {
    modalLogin.style.display = 'none';
  });

  // Fechar Cadastro
  btnFecharCadastro.addEventListener('click', () => {
    modalCadastro.style.display = 'none';
  });

  // Fechar Reserva
  btnFecharReserva.addEventListener('click', () => {
    reservaModal.style.display = 'none';
  });

let usuarioLogado = null;
onAuthStateChanged(auth, (user) => {
   console.log("Estado do usuário mudou:", user);
  usuarioLogado = user;
});


  if (user) {
    // Usuário está logado
    btnEntrar.style.display = 'none';
    btnCriarConta.style.display = 'none';
    btnSair.style.display = 'inline-block';
    perfil.style.display = 'inline-block';
  } else {
    // Usuário não está logado
    btnEntrar.style.display = 'inline-block';
    btnCriarConta.style.display = 'inline-block';
    btnSair.style.display = 'none';
    perfil.style.display = 'none';
  }

btnSair.addEventListener('click', async () => {
  try {
    await auth.signOut();
    alert("Você saiu da conta.");
    // Aqui o onAuthStateChanged será disparado e a UI atualizada
  } catch (error) {
    alert("Erro ao sair: " + error.message);
  }
});
perfil.addEventListener('click', () => {
  alert("Aqui você pode abrir um menu ou página de perfil.");
});

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();

    if (!usuarioLogado) {
      alert("Você precisa estar logado para fazer uma reserva.");
      modalLogin.style.display = 'flex';
      modalCadastro.style.display = 'none';
      reservaModal.style.display = 'none';
      return;
    }
      // Mostrar modal reserva, esconder outros
      reservaModal.style.display = 'flex';
      modalLogin.style.display = 'none';
      modalCadastro.style.display = 'none';

      // Atualiza texto do serviço na modal
      const servicoSelecionado = document.getElementById('servicoSelecionado');
      const servico = btn.previousElementSibling.textContent;
      servicoSelecionado.textContent = servico;

      // Limpar campos do modal reserva
      document.getElementById('data').value = '';
      const selectHorario = document.getElementById('horario');
      selectHorario.innerHTML = '';
    });
  });

  // Fecha o modal se clicar fora da área modal-content
  window.addEventListener('click', (e) => {
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalCadastro) modalCadastro.style.display = 'none';
    if (e.target === reservaModal) reservaModal.style.display = 'none';
  });

const datePicker = document.getElementById('data');
const timePicker = document.getElementById('horario');

// Lista de horários disponíveis
const horarios = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// 🚫 Bloquear datas anteriores a hoje
const hoje = new Date().toISOString().split('T')[0];
datePicker.min = hoje;

// Evento de mudança na data
datePicker.addEventListener('input', async () => {
  const dataSelecionada = datePicker.value;

  if (!dataSelecionada) return;

  const diaDaSemana = new Date(dataSelecionada).getDay();

  // Segunda-feira = 1
  if (diaDaSemana === 1) {
    alert("A barbearia não funciona às segundas-feiras.");
    datePicker.value = '';
    timePicker.innerHTML = '';
    return;
  }

  timePicker.innerHTML = '';

  // Busca no Firestore
  try {
    const reservasRef = collection(db, "reservas");
    const q = query(reservasRef, where("data", "==", dataSelecionada));
    const snapshot = await getDocs(q);

    const horariosReservados = snapshot.docs.map(doc => doc.data().horario);

    // Preenche seletor de horários
    horarios.forEach(horario => {
      const option = document.createElement('option');
      option.value = horario;
      option.textContent = horario;

      if (horariosReservados.includes(horario)) {
        option.disabled = true;
        option.textContent += ' (Reservado)';
      }

      timePicker.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    alert("Erro ao carregar horários. Tente novamente.");
  }
});
    });
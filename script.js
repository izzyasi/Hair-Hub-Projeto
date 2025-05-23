import { auth, db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

window.addEventListener('DOMContentLoaded', () => {
  // Botões header
  const btnEntrar = document.getElementById('btnEntrar');
  const btnCriarConta = document.getElementById('btnCriarConta');

  const btnIrCadastro = document.getElementById('btnIrCadastro');

  btnIrCadastro.addEventListener('click', () => {
  // Esconde modal de login e abre modal de cadastro
  modalLogin.style.display = 'none';
  modalCadastro.style.display = 'flex';
  });

  // Modais
  const modalLogin = document.getElementById('modalLogin');
  const modalCadastro = document.getElementById('modalCadastro');
  const reservaModal = document.getElementById('reservaModal');

  // Botões fechar dos modais
  const btnFecharLogin = document.getElementById('btnFecharLogin');
  const btnFecharCadastro = document.getElementById('btnFecharCadastro');
  const btnFecharReserva = reservaModal.querySelector('.btn-fechar');

  // Abrir Login
  btnEntrar.addEventListener('click', () => {
    modalLogin.style.display = 'flex';
    modalCadastro.style.display = 'none';
    reservaModal.style.display = 'none';
  });

  // Abrir Cadastro
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
  usuarioLogado = user;
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
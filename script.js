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

  // Abrir Modal Reserva e mostrar serviço selecionado
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();

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
});

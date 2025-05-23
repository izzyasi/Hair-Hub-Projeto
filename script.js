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

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

function senhaEhForte(senha) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(senha);
}

window.addEventListener('DOMContentLoaded', () => {
  let usuarioLogado = null;  // ✅ Declarado no topo!

  const modalLogin = document.getElementById('modalLogin');
  const modalCadastro = document.getElementById('modalCadastro');
  const reservaModal = document.getElementById('reservaModal');
  const btnFecharReserva = reservaModal.querySelector('.btn-fechar');
  const btnEntrar = document.getElementById('btnEntrar');
  const btnCriarConta = document.getElementById('btnCriarConta');
  const btnSair = document.getElementById('btnSair');
  const perfil = document.getElementById('perfil');

  const btnCadastrar = document.getElementById('btnCadastrar');
  btnCadastrar.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailCadastro').value.trim();
    const senha = document.getElementById('senhaCadastro').value;

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
  });

  const btnEntrarLogin = document.getElementById('btnEntrarLogin');
  btnEntrarLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailLogin').value.trim();
    const senha = document.getElementById('senhaLogin').value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      alert('Login realizado com sucesso!');
      modalLogin.style.display = 'none';
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        alert('Senha incorreta. Tente novamente.');
      } else if (error.code === 'auth/user-not-found') {
        alert('Usuário não encontrado. Verifique o email.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Email inválido.');
      } else {
        alert('Erro ao fazer login: ' + error.message);
      }
    }
  });

  btnSair.addEventListener('click', async () => {
    try {
      await auth.signOut();
      alert("Você saiu da conta.");
    } catch (error) {
      alert("Erro ao sair: " + error.message);
    }
  });

  perfil.addEventListener('click', () => {
    alert("Aqui você pode abrir o menu do perfil.");
  });

  onAuthStateChanged(auth, (user) => {
    console.log("Estado do usuário mudou:", user);
    usuarioLogado = user;

    if (user) {
      btnEntrar.style.display = 'none';
      btnCriarConta.style.display = 'none';
      btnSair.style.display = 'inline-block';
      perfil.style.display = 'inline-block';
      modalLogin.style.display = 'none';
      modalCadastro.style.display = 'none';
    } else {
      btnEntrar.style.display = 'inline-block';
      btnCriarConta.style.display = 'inline-block';
      btnSair.style.display = 'none';
      perfil.style.display = 'none';
    }
  });

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

  const btnFecharLogin = document.getElementById('btnFecharLogin');
  btnFecharLogin.addEventListener('click', () => {
    modalLogin.style.display = 'none';
  });

  const btnFecharCadastro = document.getElementById('btnFecharCadastro');
  btnFecharCadastro.addEventListener('click', () => {
    modalCadastro.style.display = 'none';
  });

  btnFecharReserva.addEventListener('click', () => {
    reservaModal.style.display = 'none';
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
    });
      reservaModal.style.display = 'flex';
      modalLogin.style.display = 'none';
      modalCadastro.style.display = 'none';


      const confirmarReserva = document.getElementById('confirmarReserva');

confirmarReserva.addEventListener('click', async () => {
  if (!usuarioLogado) {
    alert("Você precisa estar logado para confirmar a reserva.");
    return;
  }

  const servico = document.getElementById('servicoSelecionado').textContent;
  document.getElementById('data').value = '';
      const selectHorario = document.getElementById('horario');
      selectHorario.innerHTML = '';

  if (!data || !horario) {
    alert("Por favor, selecione a data e o horário.");
    return;
  }

  try {
    await addDoc(collection(db, "reservas"), {
      uid: usuarioLogado.uid,
      email: usuarioLogado.email,
      servico,
      data,
      horario,
      timestamp: serverTimestamp()
    });
    alert("Reserva confirmada com sucesso!");
    document.getElementById('data').value = '';
    document.getElementById('horario').innerHTML = '';
    reservaModal.style.display = 'none';
  } 
  
  catch (error) {
    console.error("Erro ao confirmar reserva: ", error);
    alert("Erro ao confirmar a reserva. Tente novamente.");
  }
});
    }); 

  window.addEventListener('click', (e) => {
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalCadastro) modalCadastro.style.display = 'none';
    if (e.target === reservaModal) reservaModal.style.display = 'none';
  });

  const datePicker = document.getElementById('data');
  const timePicker = document.getElementById('horario');

  const horarios = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const hoje = new Date().toISOString().split('T')[0];
  datePicker.min = hoje;

  datePicker.addEventListener('input', async () => {
    const dataSelecionada = datePicker.value;

    if (!dataSelecionada) return;

    const diaDaSemana = new Date(dataSelecionada).getDay();

    if (diaDaSemana === 1) {
      alert("A barbearia não funciona às segundas-feiras.");
      datePicker.value = '';
      timePicker.innerHTML = '';
      return;
    }

    timePicker.innerHTML = '';

    try {
      const reservasRef = collection(db, "reservas");
      const q = query(reservasRef, where("data", "==", dataSelecionada));
      const snapshot = await getDocs(q);

      const horariosReservados = snapshot.docs.map(doc => doc.data().horario);

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

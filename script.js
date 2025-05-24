import { auth, db } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc
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
  const perfilModal = document.getElementById('perfilModal');
  const listaReservas = document.getElementById('listaReservas');
  const btnFecharPerfil = document.querySelector('.closePerfil');
  const btnCadastrar = document.getElementById('btnCadastrar');

  const botoesReservar = document.querySelectorAll('.reservar-btn');
const servicoSelecionado = document.getElementById('servicoSelecionado');

botoesReservar.forEach(botao => {
  botao.addEventListener('click', (event) => {
    event.preventDefault();
    const servico = botao.dataset.servico;
    servicoSelecionado.textContent = `Serviço selecionado: ${servico}`;
  });
});

  function mostrarNotificacao(mensagem, tempo = 3000) {
  const notificacao = document.getElementById("notificacao");
  notificacao.textContent = mensagem;
  notificacao.style.display = "block";

  setTimeout(() => {
    notificacao.style.display = "none";
  }, tempo);
}

  btnCadastrar.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailCadastro').value.trim();
    const senha = document.getElementById('senhaCadastro').value;

    if (!senhaEhForte(senha)) {
      mostrarNotificacao("Senha fraca.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      mostrarNotificacao("Conta criada com sucesso!");
      modalCadastro.style.display = 'none';
      modalLogin.style.display = 'flex';
    } catch (error) {
      mostrarNotificacao("Erro ao criar conta: " + error.message);
    }
  });

  const btnEntrarLogin = document.getElementById('btnEntrarLogin');
  btnEntrarLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailLogin').value.trim();
    const senha = document.getElementById('senhaLogin').value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      mostrarNotificacao('Login realizado com sucesso!');
      modalLogin.style.display = 'none';
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        mostrarNotificacao('Senha incorreta. Tente novamente.');
      } else if (error.code === 'auth/user-not-found') {
        mostrarNotificacao('Usuário não encontrado. Verifique o email.');
      } else if (error.code === 'auth/invalid-email') {
        mostrarNotificacao('Email inválido.');
      } else {
        mostrarNotificacao('Erro ao fazer login: ' + error.message);
      }
    }
  });

  btnSair.addEventListener('click', async () => {
    try {
      await auth.signOut();
      mostrarNotificacao("Você saiu da conta.");
    } catch (error) {
      mostrarNotificacao("Erro ao sair: " + error.message);
    }
  });


  perfil.addEventListener('click', async () => {
  if (!usuarioLogado) {
    mostrarNotificacao("Você precisa estar logado.");
    return;
  }

  perfilModal.style.display = 'flex';
  listaReservas.innerHTML = ''; // ✅ Limpa antes de adicionar

  try {
    const q = query(collection(db, "reservas"), where("uid", "==", usuarioLogado.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      listaReservas.innerHTML = "<p>Você ainda não fez nenhuma reserva.</p>";
      return;
    }

    querySnapshot.forEach(doc => {
      const reserva = doc.data();
      const div = document.createElement('div');
      div.classList.add('reserva-item');
      div.setAttribute('data-id', doc.id);
      div.innerHTML = `
        <p><strong>Serviço:</strong> ${reserva.servico}</p>
        <p><strong>Data:</strong> ${reserva.data} - <strong>Horário:</strong> ${reserva.horario}</p>
        <button class="cancelarReserva" style="margin-top:5px;" data-id="${doc.id}">Cancelar</button>
      `;
      listaReservas.appendChild(div);
    });

    document.querySelectorAll('.cancelarReserva').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const confirmar = confirm("Tem certeza que deseja cancelar esta reserva?");
        if (!confirmar) return;

        try {
          await deleteDoc(doc(db, "reservas", id));
          mostrarNotificacao("Reserva cancelada com sucesso.");
          document.querySelector(`[data-id="${id}"]`).remove();
        } catch (error) {
          console.error("Erro ao cancelar reserva:", error);
          mostrarNotificacao("Erro ao cancelar a reserva. Tente novamente.");
        }
      });
    });

  } catch (error) {
    mostrarNotificacao("Erro ao carregar suas reservas.");
    console.error(error);
  }
});

btnFecharPerfil.addEventListener('click', () => {
  perfilModal.style.display = 'none';
  if (e.target === perfilModal) perfilModal.style.display = 'none';
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
        mostrarNotificacao("Você precisa estar logado para fazer uma reserva.");
        modalLogin.style.display = 'flex';
        modalCadastro.style.display = 'none';
        reservaModal.style.display = 'none';
        return;
      }
      reservaModal.style.display = 'flex';
      modalLogin.style.display = 'none';
      modalCadastro.style.display = 'none';
});
});

const confirmarReserva = document.getElementById('confirmarReserva');

confirmarReserva.addEventListener('click', async () => {
  if (!usuarioLogado) {
    mostrarNotificacao("Você precisa estar logado para confirmar a reserva.");
    return;
  }

  const servico = document.getElementById('servicoSelecionado').textContent;
   const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;

  if (!data || !horario) {
    mostrarNotificacao("Por favor, selecione a data e o horário.");
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
    mostrarNotificacao("Reserva confirmada com sucesso!");

    document.getElementById('data').value = '';
    document.getElementById('horario').innerHTML = '';
    reservaModal.style.display = 'none';
  } catch (error) {
    console.error("Erro ao confirmar reserva: ", error);
    mostrarNotificacao("Erro ao confirmar a reserva. Tente novamente.");
  }
});

  window.addEventListener('click', (e) => {
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalCadastro) modalCadastro.style.display = 'none';
    if (e.target === reservaModal) reservaModal.style.display = 'none';
  });

  const datePicker = document.getElementById('data');
  const timePicker = document.getElementById('horario');

  const horarios = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const hoje = new Date().toISOString().split('T')[0];
  datePicker.min = hoje;

  
  datePicker.addEventListener('change', async () => {
    const dataSelecionada = datePicker.value;
    if (!dataSelecionada) return;

    const diaDaSemana = new Date(dataSelecionada + 'T00:00:00').getDay();

    if (diaDaSemana === 1) {
      mostrarNotificacao("A barbearia não funciona às segundas-feiras.");
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
      mostrarNotificacao("Erro ao carregar horários. Tente novamente.");
    }
  });
});

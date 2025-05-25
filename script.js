import { auth, db } from './firebase-config.js';
import { signOut, 
  deleteUser,  
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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

// Função para verificar se a senha é forte
function senhaEhForte(senha) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(senha);
}

window.addEventListener('DOMContentLoaded', () => {
  let usuarioLogado = null;  // Declarado no topo!

  const abaPerfil = document.getElementById('abaPerfil');
  const btnReservas = document.getElementById('btnReservas');
  const areaReservas = document.getElementById('areaReservas');
  const userEmail = document.getElementById('emailUsuario').textContent;


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
  const btnFecharLogin = document.getElementById('btnFecharLogin');
  const btnFecharCadastro = document.getElementById('btnFecharCadastro');
  const botoesReservar = document.querySelectorAll('.reservar-btn');
  const servicoSelecionado = document.getElementById('servicoSelecionado');
  const btnIrCadastro = document.getElementById('btnIrCadastro');
  const btnIrEntrar = document.getElementById('btnIrEntrar');
  const btnEntrarLogin = document.getElementById('btnEntrarLogin');
  const confirmarReserva = document.getElementById('confirmarReserva');
  const btnDeletarConta = document.getElementById('btnDeletarConta')

  const form = document.getElementById('form-contato');

modalLogin.style.display = 'none';
modalCadastro.style.display = 'none';

/* Função para mostrar notificações */
function mostrarNotificacao(mensagem, tempo = 3000) {
  const notificacao = document.getElementById("notificacao");
  notificacao.textContent = mensagem;
  notificacao.style.display = "block";

  setTimeout(() => {
    notificacao.style.display = "none";
  }, tempo);
}

botoesReservar.forEach(botao => {
  botao.addEventListener('click', (event) => {
    event.preventDefault();
    const servico = botao.dataset.servico;
    servicoSelecionado.textContent = `Serviço selecionado: ${servico}`;
  });
});

/* Botão/função de cadastro */
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

  //Botões para alternar entre login e cadastro(possui conta?)
  btnIrCadastro.addEventListener('click', () => {
  // Esconde modal de login e abre modal de cadastro
  modalLogin.style.display = 'none';
  modalCadastro.style.display = 'flex';
  });

  btnIrEntrar.addEventListener('click', () => {
  // Esconde modal de cadastro e abre modal de login
  modalLogin.style.display = 'flex';
  modalCadastro.style.display = 'none';
  });

  // Botões para fechar os modais login e cadastro
btnFecharLogin.addEventListener('click', (e) => {
  e.preventDefault();
  modalLogin.style.display = 'none';
});

btnFecharCadastro.addEventListener('click', (e) => {
  e.preventDefault();
  modalCadastro.style.display = 'none';
});

/* Botão de login */
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

  // Botão de sair
  btnSair.addEventListener('click', async () => {
    try {
      await signOut(auth);
      mostrarNotificacao("Você saiu da conta.");
    } catch (error) {
      mostrarNotificacao("Erro ao sair: " + error.message);
    }
  });

// Botão de perfil
 perfil.addEventListener('click', async () => {
  if (!usuarioLogado) return mostrarNotificacao("Você precisa estar logado.");

  document.getElementById('userEmail').textContent = usuarioLogado.email;
  perfilModal.style.display = 'flex';
  await carregarReservas();
});

btnFecharPerfil.addEventListener('click', () => {
  perfilModal.style.display = 'none';
});




 btnReservas.addEventListener('click', () => {
  console.log("Botão Reservas clicado!");
  areaReservas.classList.toggle('hidden');
  carregarReservas();
});

async function carregarReservas() {
  console.log("Função carregarReservas chamada!");
  areaReservas.innerHTML = 'Carregando...';

  try {
    const reservasRef = collection(db, "reservas");
    const q = query(reservasRef, where("email", "==", userEmail));

    const querySnapshot = await getDocs(q);

    console.log("Reservas encontradas:", querySnapshot.size);

    areaReservas.innerHTML = '';

    if (querySnapshot.empty) {
      areaReservas.innerHTML = 'Nenhuma reserva encontrada.';
    } else {
      querySnapshot.forEach(doc => {
        const r = doc.data();
        const docId = doc.id;  // ID do documento no Firestore

        const divReserva = document.createElement('div');
        divReserva.style.marginBottom = '10px';

        const texto = document.createElement('span');
        texto.textContent = `${r.servico} - ${r.data} às ${r.horario} `;

        const btnCancelar = document.createElement('button');
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.style.marginLeft = '10px';
        btnCancelar.style.color = 'white';
        btnCancelar.style.backgroundColor = 'red';
        btnCancelar.style.border = 'none';
        btnCancelar.style.padding = '5px';
        btnCancelar.style.cursor = 'pointer';

        // Evento de cancelar
        btnCancelar.addEventListener('click', async () => {
          const confirmar = confirm('Tem certeza que deseja cancelar esta reserva?');
          if (confirmar) {
            await cancelarReserva(docId);
          }
        });

        divReserva.appendChild(texto);
        divReserva.appendChild(btnCancelar);

        areaReservas.appendChild(divReserva);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar reservas:", error);
    areaReservas.innerHTML = 'Erro ao carregar reservas.';
  }
}

async function cancelarReserva(idReserva) {
  try {
    await deleteDoc(doc(db, "reservas", idReserva));
    console.log(`Reserva ${idReserva} cancelada com sucesso.`);
    alert('Reserva cancelada com sucesso!');
    carregarReservas();  // Recarrega a lista após cancelar
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    alert('Erro ao cancelar reserva.');
  }
}

async function deletarReservasDoUsuario(emailUsuario) {
  try {
    const reservasRef = collection(db, "reservas");
    const q = query(reservasRef, where("email", "==", emailUsuario));
    const querySnapshot = await getDocs(q);

    console.log(`Encontradas ${querySnapshot.size} reservas para deletar.`);

    const batch = writeBatch(db);

    querySnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log('Todas as reservas do usuário foram deletadas.');
  } catch (error) {
    console.error('Erro ao deletar reservas:', error);
  }
}

//botão deletar a conta

const btnDeletar = document.getElementById('btnDeletar');

btnDeletar.addEventListener('click', () => {
  const confirmar = confirm('Tem certeza que deseja deletar sua conta? Esta ação é irreversível!');
  if (confirmar) {
    deletarConta();
  }
});

async function deletarConta() {
  const user = auth.currentUser;

  if (user) {
    try {
      // (Opcional) Deletar as reservas do usuário antes:
      await deletarReservasDoUsuario(user.email);

      // Deleta o usuário da autenticação:
      await deleteUser(user);

      alert('Conta deletada com sucesso!');
      console.log('Usuário deletado.');

      // Redirecionar ou atualizar a interface:
      window.location.href = '/login.html';  // ou qualquer página apropriada
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      alert('Erro ao deletar conta. Faça login novamente e tente de novo.');
    }
  } else {
    alert('Nenhum usuário autenticado.');
  }
}

/* Botão de deletar conta;
  btnDeletarConta.addEventListener('click', async () => await deleteAccount());

  async function carregarReservas() {
    if (!usuarioLogado) return;
    listaReservas.innerHTML = '';

    try {
      const q = query(collection(db, "reservas"), where("uid", "==", usuarioLogado.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        listaReservas.innerHTML = "<p>Você ainda não fez nenhuma reserva.</p>";
        return;
      }

      // Preencher a lista de reservas no perfil
      querySnapshot.forEach(docItem => {
        const reserva = docItem.data();
        const div = document.createElement('div');
        div.classList.add('reserva-item');
        div.setAttribute('data-id', docItem.id);
        div.innerHTML = `
          <p><strong>Serviço:</strong> ${reserva.servico}</p>
          <p><strong>Data:</strong> ${reserva.data} - <strong>Horário:</strong> ${reserva.horario}</p>
          <button class="cancelarReserva" data-id="${docItem.id}">Cancelar</button>
        `;
        listaReservas.appendChild(div);
      });

      // Adicionar evento de cancelamento para cada reserva
      document.querySelectorAll('.cancelarReserva').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;

          try {
            await deleteDoc(doc(db, "reservas", id));
            mostrarNotificacao("Reserva cancelada com sucesso.");
            document.querySelector(`[data-id="${id}"]`).remove();
          } catch (error) {
            mostrarNotificacao("Erro ao cancelar a reserva. Tente novamente.");
          }
        });
      });
    } catch (error) {
      mostrarNotificacao("Erro ao carregar suas reservas.");
    }
  }

  window.deleteAccount = async function() {
    const user = auth.currentUser;
    if (user && confirm('Tem certeza que deseja deletar sua conta?')) {
      try {
        await deleteDoc(doc(db, 'usuarios', user.uid));
        await deleteUser(user);
        alert('Conta deletada com sucesso!');
        window.location.reload();
      } catch (error) {
        alert('Erro ao deletar a conta: ' + error.message);
      }
    }
  };
  */

  // Verifica se o usuário está logado
  // e atualiza a interface de acordo
  onAuthStateChanged(auth, (user) => {
    usuarioLogado = user;
    btnEntrar.style.display = user ? 'none' : 'inline-block';
    btnCriarConta.style.display = user ? 'none' : 'inline-block';
    btnSair.style.display = user ? 'inline-block' : 'none';
    perfil.style.display = user ? 'inline-block' : 'none';
    if (!user) listaReservas.innerHTML = '';
    if (user) carregarReservas();
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

  btnFecharReserva.addEventListener('click', () => {
    reservaModal.style.display = 'none';
  });

  //login obrigatório para reservar
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

// Evento para confirmar a reserva
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

  // Fechar modais ao clicar fora deles
  window.addEventListener('click', (e) => {
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalCadastro) modalCadastro.style.display = 'none';
    if (e.target === reservaModal) reservaModal.style.display = 'none';
  });

  // inicialização do DatePicker e TimePicker reservas
  const datePicker = document.getElementById('data');
  const timePicker = document.getElementById('horario');

  const horarios = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const hoje = new Date().toISOString().split('T')[0];
  datePicker.min = hoje;

  // preencher o TimePicker com horários disponíveis
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


/*formulário de contato */
form.addEventListener('submit', async e => {
  e.preventDefault();

  const nome = document.getElementById('nomemensagem').value;
  const email = document.getElementById('emailmensagem').value;
  const mensagem = document.getElementById('mensagem').value;

  try {
    await addDoc(collection(db, 'mensagens'), {
      nome,
      email,
      mensagem,
      data: new Date().toISOString()
    });
    mostrarNotificacao('Mensagem enviada com sucesso!');
    form.reset();
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    mostrarNotificacao('Erro ao enviar. Tente novamente.');
  }
});
});

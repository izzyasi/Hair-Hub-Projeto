import { auth, db } from './firebase-config.js';
import { signOut, 
  deleteUser,  
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential
 } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Função para verificar se a senha é forte
function senhaEhForte(senha) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(senha);
}

window.addEventListener('DOMContentLoaded', () => {
  let usuarioLogado = null;  // Declarado no topo!

  //const abaPerfil = document.getElementById('abaPerfil');
  const btnReservas = document.getElementById('btnReservas');
  const areaReservas = document.getElementById('areaReservas');
  //const userEmail = document.getElementById('emailUsuario').textContent;


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
  const btnDeletar = document.getElementById('btnDeletar')

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

  if (areaReservas) {
    areaReservas.classList.add('hidden');
  }

// Botão de perfil
 perfil.addEventListener('click', () => { // Removido async pois carregarReservas foi movido
    if (!usuarioLogado) {
      mostrarNotificacao("Você precisa estar logado.");
      return;
    }

  const emailUsuarioSpan = document.getElementById('emailUsuario');
    if (emailUsuarioSpan) {
      emailUsuarioSpan.textContent = usuarioLogado.email;
    } else {
      console.error("Elemento 'emailUsuario' não encontrado no modal de perfil!");
    }

    perfilModal.style.display = 'flex'; // Mostra o modal de perfil

     if (areaReservas) {
        areaReservas.classList.add('hidden'); // Garante que está escondida ao abrir o modal
        areaReservas.innerHTML = ''; // Limpa conteúdo antigo, se houver
    }
  });


btnFecharPerfil.addEventListener('click', () => {
  perfilModal.style.display = 'none';
});




 btnReservas.addEventListener('click', () => {
    console.log("Botão Reservas clicado!");
    if (!usuarioLogado) {
      mostrarNotificacao("Erro: Usuário não está logado para carregar reservas.");
      return;
    }

    if (areaReservas.classList.contains('hidden')) {
      // Se estava escondida, carrega as reservas e mostra
      carregarReservas(); // Chama a função para buscar e popular as reservas
      areaReservas.classList.remove('hidden');
    } else {
      // Se estava visível, esconde
      areaReservas.classList.add('hidden');
    }
  });

async function carregarReservas() {
  console.log("Função carregarReservas chamada!");

  // Adicionar verificação de usuarioLogado aqui também, por segurança
  if (!usuarioLogado) {
    areaReservas.innerHTML = 'Você precisa estar logado para ver suas reservas.';
    console.log("carregarReservas: Tentativa de carregar sem usuário logado.");
    if(!areaReservas.classList.contains('hidden')) areaReservas.classList.add('hidden');
    return;
  }

  areaReservas.innerHTML = 'Carregando...';

  
  try {
    const reservasRef = collection(db, "reservas");
    // CORREÇÃO: Usar o email do usuarioLogado dinamicamente
    const q = query(reservasRef, where("email", "==", usuarioLogado.email));

    const querySnapshot = await getDocs(q);

    console.log("Reservas encontradas:", querySnapshot.size, "para o email:", usuarioLogado.email);
    areaReservas.innerHTML = ''; // Limpa o "Carregando..."

    if (querySnapshot.empty) {
      areaReservas.innerHTML = '<p>Nenhuma reserva encontrada.</p>';
    } else {
      querySnapshot.forEach(doc => {
        const r = doc.data();
        const docId = doc.id;

        const divReserva = document.createElement('div');
        divReserva.style.marginBottom = '10px';
        divReserva.style.padding = '10px';
        divReserva.style.border = '1px solid #eee';
        divReserva.style.borderRadius = '4px';

        const texto = document.createElement('p'); // Usar <p> pode ser melhor para texto
        texto.textContent = `Serviço: ${r.servico} - Data: ${r.data} às ${r.horario}`;
        texto.style.margin = '0 0 10px 0';

        const btnCancelar = document.createElement('button');
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.style.marginLeft = '10px';
        btnCancelar.style.color = 'white';
        btnCancelar.style.backgroundColor = 'red';
        btnCancelar.style.border = 'none';
        btnCancelar.style.padding = '5px 10px';
        btnCancelar.style.cursor = 'pointer';
        btnCancelar.style.borderRadius = '3px';

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
    areaReservas.innerHTML = '<p>Erro ao carregar reservas. Tente novamente.</p>';
  }
}

async function cancelarReserva(idReserva) {
    try {
      await deleteDoc(doc(db, "reservas", idReserva));
      console.log(`Reserva ${idReserva} cancelada com sucesso.`);
      mostrarNotificacao('Reserva cancelada com sucesso!', 2000); // Usei sua função mostrarNotificacao
      await carregarReservas(); // Recarrega a lista após cancelar
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      mostrarNotificacao('Erro ao cancelar reserva.', 3000); // Usei sua função mostrarNotificacao
    }
  }

  async function deletarReservasDoUsuario(emailUsuario) {
    try {
      const reservasRef = collection(db, "reservas");
      const q = query(reservasRef, where("email", "==", emailUsuario));
      const querySnapshot = await getDocs(q);

      console.log(`Encontradas ${querySnapshot.size} reservas para deletar.`);

      // Corrigido: Firestore v9 usa writeBatch() como uma função importada, não um método do db.
      const batch = writeBatch(db); // 'db' é o seu objeto Firestore inicializado

      querySnapshot.forEach(docRef => { // Renomeado 'doc' para 'docRef' para clareza
        batch.delete(docRef.ref);
      });

      await batch.commit();
      console.log('Todas as reservas do usuário foram deletadas.');
    } catch (error) {
      console.error('Erro ao deletar reservas:', error);
      // Adicione uma notificação para o usuário, se desejar
      // mostrarNotificacao('Erro ao deletar reservas associadas.', 3000);
    }
  }

  // Botão deletar a conta (listener)
  // A variável 'btnDeletar' já foi definida no topo do DOMContentLoaded
  if (btnDeletar) { // Boa prática verificar se o elemento existe
      btnDeletar.addEventListener('click', () => {
      if (!usuarioLogado) {
        mostrarNotificacao("Nenhum usuário logado para deletar.");
        return;
      }
      const confirmar = confirm('Tem certeza que deseja deletar sua conta? Todas as suas reservas também serão removidas. Esta ação é irreversível!');
      if (confirmar) {
        deletarConta();
      }
    });
  } else {
      console.error("Botão 'btnDeletar' não foi encontrado no DOM.");
  }

async function deletarConta() {
  const user = auth.currentUser;

  if (user) {
    try {
      // 1. Tenta deletar as reservas do usuário primeiro.
      // Esta operação geralmente não exige reautenticação recente.
      await deletarReservasDoUsuario(user.email);

      // 2. Tenta deletar a conta do usuário.
      await deleteUser(user);
      mostrarNotificacao('Conta deletada com sucesso!', 3000);
      console.log('Usuário deletado.');
      if (perfilModal) perfilModal.style.display = 'none'; // Fecha o modal do perfil

    } catch (error) {
      console.error('Erro ao deletar conta:', error);

      if (error.code === 'auth/requires-recent-login') {
        mostrarNotificacao('Para sua segurança, por favor, confirme sua senha para deletar a conta.', 4000);
        
        // Pede a senha ao usuário (você pode substituir por um modal mais elegante depois)
        const senha = prompt("Por favor, insira sua senha para confirmar a exclusão da conta:");

        if (senha) { // Se o usuário inseriu uma senha e não clicou em "Cancelar" no prompt
          try {
            // Cria a credencial para reautenticação
            const credential = EmailAuthProvider.credential(user.email, senha);
            
            // Tenta reautenticar o usuário
            await reauthenticateWithCredential(user, credential);
            
            // Reautenticação bem-sucedida!
            // Agora, tente deletar o usuário novamente.
            // As reservas já foram deletadas na primeira tentativa do bloco 'try' principal.
            await deleteUser(user);
            mostrarNotificacao('Conta deletada com sucesso após reautenticação!', 3000);
            console.log('Usuário deletado após reautenticação.');
            if (perfilModal) perfilModal.style.display = 'none';

          } catch (reauthError) {
            console.error('Erro na reautenticação ou na segunda tentativa de deletar:', reauthError);
            let msgErroReauth = 'Falha ao reautenticar.';
            if (reauthError.code === 'auth/wrong-password') {
              msgErroReauth = 'Senha incorreta. A conta não foi deletada.';
            } else if (reauthError.code === 'auth/user-mismatch') {
              msgErroReauth = 'Erro de credencial. A conta não foi deletada.';
            } else if (reauthError.code === 'auth/too-many-requests') {
                msgErroReauth = 'Muitas tentativas. Tente novamente mais tarde.';
            } else {
              msgErroReauth = 'Não foi possível confirmar sua identidade. A conta não foi deletada.';
            }
            mostrarNotificacao(msgErroReauth, 5000);
          }
        } else {
          // Usuário cancelou o prompt de senha
          mostrarNotificacao('Exclusão da conta cancelada. Senha não fornecida.', 3000);
        }
      } else {
        // Outros erros que não são 'auth/requires-recent-login'
        mostrarNotificacao('Erro ao deletar conta: ' + error.message, 5000);
      }
    }
  } else {
    mostrarNotificacao('Nenhum usuário autenticado para deletar.', 3000);
  }
}

  // Verifica se o usuário está logado
  // e atualiza a interface de acordo
 onAuthStateChanged(auth, (user) => {
    usuarioLogado = user; // Atualiza a variável global com o estado do usuário

    // Atualiza a visibilidade dos botões de login/logout e perfil
    if (btnEntrar) btnEntrar.style.display = user ? 'none' : 'inline-block';
    if (btnCriarConta) btnCriarConta.style.display = user ? 'none' : 'inline-block';
    if (btnSair) btnSair.style.display = user ? 'inline-block' : 'none';
    if (perfil) perfil.style.display = user ? 'inline-block' : 'none';

    if (!user) {
      // Se o usuário deslogou
      if (perfilModal) perfilModal.style.display = 'none'; // Esconde o modal de perfil
      if (areaReservas) {
        areaReservas.innerHTML = ''; // Limpa a área de reservas
        areaReservas.classList.add('hidden'); // Garante que está escondida
      }
    } else {
      // Se o usuário está logado o email será atualizado ao abrir o modal de perfil
       }
  });

  // Adiciona evento de clique para abrir o modal de login
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

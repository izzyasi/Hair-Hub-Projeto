import { auth, db } from './firebase-config.js';
import { signOut, 
  deleteUser,  
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
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

window.addEventListener('DOMContentLoaded', () => {
     let usuarioLogado = null;
     const servicosDisponiveis = [
    {
      nomePrincipal: "Corte de Cabelo",
      idHtmlBase: "servicoCorte",
      descricaoGeral: "Estilos modernos e clássicos para todos os gostos.",
      tiposDeVariante: [
        {
          nomeTipo: "Simples (Máquina ou Social Básico)",
          subVariantes: [
            { nomeSubVariante: "Cabelo Curto", preco: 40, duracaoMinutos: 30 },
            { nomeSubVariante: "Cabelo Médio", preco: 45, duracaoMinutos: 40 }
          ]
        },
        {
          nomeTipo: "Elaborado (Tesoura, Degradê, Modernos)",
          subVariantes: [
            { nomeSubVariante: "Cabelo Curto", preco: 60, duracaoMinutos: 50 },
            { nomeSubVariante: "Cabelo Médio", preco: 70, duracaoMinutos: 60 },
            { nomeSubVariante: "Cabelo Comprido (Masculino)", preco: 90, duracaoMinutos: 80 }
          ]
        }
      ]
    },
    {
      nomePrincipal: "Pézinho",
      idHtmlBase: "servicoPezinho",
      descricaoGeral: "Acabamento perfeito para seu corte.",
      tiposDeVariante: [
        { nomeTipo: "Simples (Nuca)", precoFixoVariante: 15, duracaoFixaVarianteMinutos: 10 },
        { nomeTipo: "Completo (Nuca e Frontal)", precoFixoVariante: 20, duracaoFixaVarianteMinutos: 15 }
      ]
    },
    {
      nomePrincipal: "Barba",
      idHtmlBase: "servicoBarba",
      descricaoGeral: "Aparos e cuidados para um visual impecável.",
      tiposDeVariante: [
        {nomeTipo: "Barba Simples", precoFixoVariante: 40, duracaoFixaVarianteMinutos: 30 },
        {nomeTipo: "Barba Desenhada", precoFixoVariante: 55, duracaoFixaVarianteMinutos: 45 },
        {nomeTipo: "Barba Completa/Premium", precoFixoVariante: 60, duracaoFixaVarianteMinutos: 45 }
          ]
    },
   {
      nomePrincipal: "Sobrancelhas",
      idHtmlBase: "servicoSobrancelhas",
      descricaoGeral: "Realce seu olhar com um design perfeito.",
      tiposDeVariante: [
        { nomeTipo: "Limpeza Simples", precoFixoVariante: 20, duracaoFixaVarianteMinutos: 15 },
        { nomeTipo: "Design de Sobrancelhas", precoFixoVariante: 35, duracaoFixaVarianteMinutos: 25 }
      ]
    },
    {
      nomePrincipal: "Coloração",
      idHtmlBase: "servicoColoracao",
      descricaoGeral: "Transforme sua cor de cabelo com produtos de alta qualidade.",
      tiposDeVariante: [
        {
          nomeTipo: "Retoque de Raiz (até 2 cm)",
          precoFixoVariante: 85,
          duracaoFixaVarianteMinutos: 75
        },
        {
          nomeTipo: "Global Padrão",
          subVariantes: [
            { nomeSubVariante: "Cabelo Curto", preco: 105, duracaoMinutos: 90 },
            { nomeSubVariante: "Cabelo Médio", preco: 140, duracaoMinutos: 120 },
            { nomeSubVariante: "Cabelo Comprido", preco: 170, duracaoMinutos: 150 }
          ]
        },
        {
          nomeTipo: "Global Cores Fantasia",
          subVariantes: [
            { nomeSubVariante: "Cabelo Curto", preco: 150, duracaoMinutos: 120 },
            { nomeSubVariante: "Cabelo Médio", preco: 210, duracaoMinutos: 165 },
            { nomeSubVariante: "Cabelo Comprido", preco: 265, duracaoMinutos: 210 }
          ]
        }
      ]
    },
    {
      nomePrincipal: "Luzes",
      idHtmlBase: "servicoLuzes",
      descricaoGeral: "Realce seu visual com técnicas de iluminação.",
      tiposDeVariante: [
        {
          nomeTipo: "Luzes Tradicionais",
          subVariantes: [
            { nomeSubVariante: "Cabelo Curto", preco: 140, duracaoMinutos: 120 },
            { nomeSubVariante: "Cabelo Médio", preco: 190, duracaoMinutos: 165 },
            { nomeSubVariante: "Cabelo Comprido", preco: 240, duracaoMinutos: 210 }
          ]
        },
      ]
    },
     {
      nomePrincipal: "Progressiva",
      idHtmlBase: "servicoProgressiva",
      descricaoGeral: "Alisamento duradouro com tecnologia avançada.",
      tiposDeVariante: [
        {
          nomeTipo: "Progressiva sem Formol",
          subVariantes: [
            { nomeSubVariante: "Cabelo Curto", preco: 110, duracaoMinutos: 120 },
            { nomeSubVariante: "Cabelo Médio", preco: 165, duracaoMinutos: 165 },
            { nomeSubVariante: "Cabelo Comprido", preco: 225, duracaoMinutos: 225 }
          ]
        },
      ]
    },
     {
      nomePrincipal: "Permanente Ondulado/Cacheado",
      idHtmlBase: "servicoPermanente",
      descricaoGeral: "Transforme seu cabelo com ondas ou cachos duradouros.",
      tiposDeVariante: [
        {
          nomeTipo: "Permanente Ondulado",
          subVariantes: [
            { nomeSubVariante: "Cabelo Curto", preco: 140, duracaoMinutos: 120 },
            { nomeSubVariante: "Cabelo Médio", preco: 180, duracaoMinutos: 150 },
            { nomeSubVariante: "Cabelo Comprido", preco: 240, duracaoMinutos: 210 }
          ]
        },
        {
          nomeTipo: "Permanente Cacheado",
          subVariantes: [
            { nomeSubVariante: "Cabelo Curto", preco: 165, duracaoMinutos: 150 },
            { nomeSubVariante: "Cabelo Médio", preco: 230, duracaoMinutos: 210 },
            { nomeSubVariante: "Cabelo Comprido", preco: 300, duracaoMinutos: 270 }
          ]
        }
      ]
    },
    {
      nomePrincipal: "Hidratação",
      idHtmlBase: "servicoHidratação",
      descricaoGeral: "Revitalize seus fios com nossos tratamentos de hidratação.",
      tiposDeVariante: [
        {
          nomeTipo: "Hidratação",
          subVariantes: [
            { nomeSubVariante: "Cabelo Curto", preco: 35, duracaoMinutos: 30 },
            { nomeSubVariante: "Cabelo Médio", preco: 50, duracaoMinutos: 30 },
            { nomeSubVariante: "Cabelo Comprido", preco: 70, duracaoMinutos: 30 }
          ]
        }
      ]
    },
    {
      nomePrincipal: "Massagem Capilar",
      idHtmlBase: "servicoMassagem",
      descricaoGeral: "Relaxe e revitalize seu couro cabeludo.",
      tiposDeVariante: [
        { nomeTipo: "Padrão", precoFixoVariante: 40, duracaoFixaVarianteMinutos: 30 }
      ]
    }
  ];
    const horariosBase = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
  ];
    let servicosSelecionadosParaAgendar = [];

    //constantes
    const modalLogin = document.getElementById('modalLogin');
    const modalCadastro = document.getElementById('modalCadastro');
    const btnEntrar = document.getElementById('btnEntrar');
    const btnCriarConta = document.getElementById('btnCriarConta');
    const btnSair = document.getElementById('btnSair');
    const perfil = document.getElementById('perfil');
    const perfilModal = document.getElementById('perfilModal');
    const areaReservas = document.getElementById('areaReservas');
    const btnReservas = document.getElementById('btnReservas');
    const btnFecharPerfil = document.querySelector('.closePerfil');
    const btnDeletar = document.getElementById('btnDeletar');
    const notificacao = document.getElementById("notificacao");
    const btnCadastrar = document.getElementById('btnCadastrar');
    const btnFecharLogin = document.getElementById('btnFecharLogin');
    const btnFecharCadastro = document.getElementById('btnFecharCadastro');
    const botoesReservar = document.querySelectorAll('.reservar-btn');
    const servicoSelecionado = document.getElementById('servicoSelecionado');
    const btnIrCadastro = document.getElementById('btnIrCadastro');
    const btnIrEntrar = document.getElementById('btnIrEntrar');
    const btnEntrarLogin = document.getElementById('btnEntrarLogin');
    const confirmarReserva = document.getElementById('confirmarReserva');
    const containerListaServicosModal = document.getElementById('containerListaServicosModal');
    const form = document.getElementById('form-contato');

    // Modais de seleção de serviços
    const btnAbrirModalServicos = document.getElementById('btnAbrirModalServicos');
    const modalSelecionarServicos = document.getElementById('modalSelecionarServicos');
    const btnFecharModalServicos = document.getElementById('btnFecharModalServicos');
    const dropdownServicoPrincipal = document.getElementById('dropdownServicoPrincipal');
    const containerTipoVariante = document.getElementById('containerTipoVariante');
    const dropdownTipoVariante = document.getElementById('dropdownTipoVariante');
    const containerSubVariante = document.getElementById('containerSubVariante');
    const dropdownSubVariante = document.getElementById('dropdownSubVariante');
    const infoServicoAtual = document.getElementById('infoServicoAtual');
    const btnAdicionarServicoAtual = document.getElementById('btnAdicionarServicoAtual');
    const listaServicosJaAdicionadosUI = document.getElementById('listaServicosJaAdicionados');
    const btnMostrarSelecaoNovoServico = document.getElementById('btnMostrarSelecaoNovoServico');
    const precoTotalModalServicos = document.getElementById('preco-total-modal-servicos');
    const duracaoTotalModalServicos = document.getElementById('duracao-total-modal-servicos');
    const btnProsseguirReservaNoModalServicos = document.getElementById('btnProsseguirReservaNoModalServicos');

    // Modal de reservafinal
    const reservaModal = document.getElementById('reservaModal');
    const btnFecharReserva = reservaModal.querySelector('.btn-fechar');
    const resumoServicosModal = document.getElementById('resumoServicosModal'); 
    const dataInputModal = document.getElementById('dataReserva');
    const horarioSelectModal = document.getElementById('horarioReserva');
    const observacoesModalInput = document.getElementById('observacoesReservaModal');
    const btnConfirmarReservaModal = document.getElementById('btnConfirmarReservaModal');

     console.log("LOG: Verificando elementos do modal de seleção de serviços:", { /* ... seu log ... */ });

    // FUNÇÕES
    function mostrarNotificacao(mensagem, tempo = 3000) {
        notificacao.textContent = mensagem;
        notificacao.style.display = "block";
        setTimeout(() => { notificacao.style.display = "none"; }, tempo);
    }

    function horarioParaMinutos(horarioStr) {
        if (!horarioStr || !horarioStr.includes(':')) { console.error('Formato inválido:', horarioStr); return NaN; }
        const partes = horarioStr.split(':');
        if (partes.length !== 2) { console.error('Formato inválido (partes):', horarioStr); return NaN; }
        const horas = parseInt(partes[0], 10);
        const minutos = parseInt(partes[1], 10);
        if (isNaN(horas) || isNaN(minutos) || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) { console.error('Valores inválidos:', horarioStr); return NaN;}
        return (horas * 60) + minutos;
    }

    function senhaEhForte(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
    }

    function popularDropdownServicoPrincipal() {
        if (!dropdownServicoPrincipal || !servicosDisponiveis) return;
        dropdownServicoPrincipal.innerHTML = '<option value="">-- Selecione um Serviço --</option>';
        servicosDisponiveis.forEach((servico, index) => {
            const option = document.createElement('option');
            option.value = index; 
            option.textContent = servico.nomePrincipal;
            dropdownServicoPrincipal.appendChild(option);
        });
    }

    function handleSelecaoServicoPrincipal() {
    console.log("LOG: >> Função handleSelecaoServicoPrincipal FOI CHAMADA <<");

    if (!dropdownServicoPrincipal || 
      !dropdownTipoVariante || 
      !containerTipoVariante || 
      !dropdownSubVariante || 
      !containerSubVariante || 
      !infoServicoAtual) {

     console.error("LOG: ERRO FATAL! Um ou mais elementos essenciais do DOM (dropdowns, containers, infoServicoAtual) não foram encontrados ao executar handleSelecaoServicoPrincipal. Verifique os IDs no HTML e no JavaScript (getElementById). A função não pode continuar.");
     console.log({
        dropdownServicoPrincipal,
        dropdownTipoVariante,
        containerTipoVariante,
        dropdownSubVariante,
        containerSubVariante,
        infoServicoAtual
    });
    return;
  }
  console.log("LOG: Todos os elementos do DOM para handleSelecaoServicoPrincipal foram encontrados com sucesso.");

  const servicoIndex = dropdownServicoPrincipal.value;
  console.log("LOG: Valor selecionado no dropdownServicoPrincipal (servicoIndex):", servicoIndex);
  dropdownTipoVariante.innerHTML = ''; 
  containerTipoVariante.style.display = 'none'; 
  dropdownSubVariante.innerHTML = ''; 
  containerSubVariante.style.display = 'none'; 
  infoServicoAtual.textContent = ''; 

  if (servicoIndex === "" || servicoIndex === null) { 
    console.log("LOG: Nenhuma opção válida selecionada no dropdownServicoPrincipal (valor vazio ou null).");
    return; 
  }

  const servicoSelecionado = servicosDisponiveis[parseInt(servicoIndex, 10)];
  console.log("LOG: Objeto do serviço principal selecionado:", servicoSelecionado);

  if (servicoSelecionado && servicoSelecionado.tiposDeVariante && servicoSelecionado.tiposDeVariante.length > 0) {
    console.log("LOG: Populando dropdownTipoVariante para o serviço:", servicoSelecionado.nomePrincipal);

    dropdownTipoVariante.innerHTML = '<option value="">-- Selecione o Tipo --</option>'; 
    servicoSelecionado.tiposDeVariante.forEach((tipo, tipoIndex) => {
      const option = document.createElement('option');
      option.value = tipoIndex;
      option.textContent = tipo.nomeTipo;
      dropdownTipoVariante.appendChild(option);
    });
    containerTipoVariante.style.display = 'block'; 
    console.log("LOG: dropdownTipoVariante populado e container tornado visível.");
  } else {
    console.warn("LOG: O serviço selecionado não possui 'tiposDeVariante' definidos ou a lista está vazia.", servicoSelecionado);
    infoServicoAtual.textContent = "Este serviço não possui opções de tipo configuradas.";
  }
}

  function mostrarInfoServicoAtualSendoMontado() {
    if (!dropdownServicoPrincipal || !dropdownTipoVariante || !dropdownSubVariante || !infoServicoAtual) return;

    const servicoIndex = dropdownServicoPrincipal.value;
    if (servicoIndex === "") {
        infoServicoAtual.textContent = '';
        return;
    }
    const servico = servicosDisponiveis[parseInt(servicoIndex)];

    const tipoIndex = dropdownTipoVariante.value;
    if (tipoIndex === "") {
        infoServicoAtual.textContent = `Selecione o tipo para ${servico.nomePrincipal}.`;
        return;
    }
    const tipoSelecionado = servico.tiposDeVariante[parseInt(tipoIndex)];

    let precoFinal = 0;
    let duracaoFinal = 0;
    let nomeFinal = `${servico.nomePrincipal} - ${tipoSelecionado.nomeTipo}`;

    if (tipoSelecionado.subVariantes && tipoSelecionado.subVariantes.length > 0) {
        if (containerSubVariante.style.display === 'block' && dropdownSubVariante.value !== "") {
            const subVarianteIndex = dropdownSubVariante.value;
            const subVarianteSelecionada = tipoSelecionado.subVariantes[parseInt(subVarianteIndex)];
            precoFinal = subVarianteSelecionada.preco;
            duracaoFinal = subVarianteSelecionada.duracaoMinutos;
            nomeFinal += ` - ${subVarianteSelecionada.nomeSubVariante}`;
        } else {
            infoServicoAtual.textContent = `Selecione o detalhe para ${tipoSelecionado.nomeTipo}.`;
            return;
        }
    } else {
        precoFinal = tipoSelecionado.precoFixoVariante;
        duracaoFinal = tipoSelecionado.duracaoFixaVarianteMinutos;
    }
    infoServicoAtual.innerHTML = `<span class="math-inline">${nomeFinal}</span>: R$${precoFinal}, ${duracaoFinal} min`;
}
  function atualizarTotaisResumoModalServicos() {
    if (!precoTotalModalServicos || !duracaoTotalModalServicos) {
    console.error("Elementos de total no modal de serviços não encontrados!");
    return;
  }
    let precoTotal = 0;
    let duracaoTotal = 0;

    servicosSelecionadosParaAgendar.forEach(item => {
    precoTotal += item.preco;
    duracaoTotal += item.duracaoMinutos;
  });

    precoTotalModalServicos.textContent = `R$ ${precoTotal}`;
    duracaoTotalModalServicos.textContent = `${duracaoTotal} min`;
}
  function renderizarServicosJaAdicionados() {
   if (!listaServicosJaAdicionadosUI) {
    console.error("Elemento da lista de serviços já adicionados (ul) não encontrado!");
    return;
  }
   listaServicosJaAdicionadosUI.innerHTML = ''; 

   servicosSelecionadosParaAgendar.forEach((servicoAdicionado, index) => {
    const li = document.createElement('li');
    li.style.marginBottom = '5px'; 
    li.innerHTML = `<span class="math-inline">${servicoAdicionado.textoExibicao}</span> - R$${servicoAdicionado.preco}, ${servicoAdicionado.duracaoMinutos} min `; 
    
    const btnRemover = document.createElement('button');
    btnRemover.textContent = 'X';
    btnRemover.classList.add('btn-remover-servico-item');
    btnRemover.style.marginLeft = '10px';
    btnRemover.style.color = 'red';
    btnRemover.style.cursor = 'pointer';
    btnRemover.dataset.indiceRemover = index;
    btnRemover.addEventListener('click', (e) => {
      const indiceParaRemover = parseInt(e.target.dataset.indiceRemover, 10);
      removerServicoDaLista(indiceParaRemover);
    });

    li.appendChild(btnRemover);
    listaServicosJaAdicionadosUI.appendChild(li);
  });
   atualizarTotaisResumoModalServicos(); 
  }

  function removerServicoDaLista(indice) {
   if (indice >= 0 && indice < servicosSelecionadosParaAgendar.length) {
    servicosSelecionadosParaAgendar.splice(indice, 1); 
    renderizarServicosJaAdicionados();
    console.log("Serviço removido. Lista atual:", servicosSelecionadosParaAgendar);
  }
}
  function adicionarListenersServicos() {
        if (dropdownServicoPrincipal) {
            dropdownServicoPrincipal.addEventListener('change', () => {
                console.log("LOG: Evento 'change' no dropdownServicoPrincipal disparado.");
                handleSelecaoServicoPrincipal(); 
                mostrarInfoServicoAtualSendoMontado(); 
            });
            console.log("LOG: Listener para dropdownServicoPrincipal adicionado.");
        } else { console.error("LOG CRÍTICO: dropdownServicoPrincipal não encontrado!"); }

    
        if (dropdownTipoVariante) {
            dropdownTipoVariante.addEventListener('change', () => {
                console.log("LOG: Evento 'change' no dropdownTipoVariante disparado.");
                const servicoIndex = dropdownServicoPrincipal.value;
                const tipoIndex = dropdownTipoVariante.value;
                dropdownSubVariante.innerHTML = '';
                containerSubVariante.style.display = 'none';

                 if (servicoIndex === "" || tipoIndex === "") {
                 console.log("LOG: Seleção inválida no dropdownServicoPrincipal ou dropdownTipoVariante.");
                 mostrarInfoServicoAtualSendoMontado(); return;
                 }
                 const servico = servicosDisponiveis[parseInt(servicoIndex, 10)];
                 const tipoSelecionado = servico.tiposDeVariante[parseInt(tipoIndex, 10)];
                 console.log("LOG: Tipo de Variante selecionado:", tipoSelecionado);

                 if (tipoSelecionado.subVariantes && tipoSelecionado.subVariantes.length > 0) {
                 console.log("LOG: Populando dropdownSubVariante para o tipo:", tipoSelecionado.nomeTipo);
                 dropdownSubVariante.innerHTML = '<option value="">-- Selecione o Detalhe --</option>';
                 tipoSelecionado.subVariantes.forEach((subVar, subVarIndex) => {
                    const option = document.createElement('option');
                    option.value = subVarIndex;
                    option.textContent = subVar.nomeSubVariante;
                    dropdownSubVariante.appendChild(option);
                 });
                
                 const labelSubVariante = containerSubVariante.querySelector('label');
                 if (labelSubVariante) labelSubVariante.textContent = "Detalhe específico:"; 
                
                containerSubVariante.style.display = 'block'; 
                console.log("LOG: dropdownSubVariante populado e container tornado visível.");
                } else {
                console.log("LOG: Tipo de Variante selecionado não possui sub-variantes.");
                containerSubVariante.style.display = 'none'; 
             }
             mostrarInfoServicoAtualSendoMontado(); 
             });
            console.log("LOG: Listener para dropdownTipoVariante adicionado.");
        } else { console.error("LOG CRÍTICO: dropdownTipoVariante não encontrado!"); }

        if (dropdownSubVariante) {
            dropdownSubVariante.addEventListener('change', () => {
                console.log("LOG: Evento 'change' no dropdownSubVariante disparado.");
                mostrarInfoServicoAtualSendoMontado(); 
            });
            console.log("LOG: Listener para dropdownSubVariante adicionado.");
        } else { console.error("LOG CRÍTICO: dropdownSubVariante não encontrado!"); }

        if (btnAdicionarServicoAtual) {
            btnAdicionarServicoAtual.addEventListener('click', () => {
                console.log("LOG: Botão 'Adicionar este Serviço' clicado.");
                const servicoIndex = dropdownServicoPrincipal.value;
    if (servicoIndex === "") {
      mostrarNotificacao("Por favor, selecione um serviço principal.", 2000);
      return;
    }
    const servicoBase = servicosDisponiveis[parseInt(servicoIndex, 10)];

    const tipoIndex = dropdownTipoVariante.value;
    if (tipoIndex === "") {
      mostrarNotificacao(`Por favor, selecione o tipo para ${servicoBase.nomePrincipal}.`, 2000);
      return;
    }
    const tipoSelecionado = servicoBase.tiposDeVariante[parseInt(tipoIndex, 10)];

    let precoFinal = 0;
    let duracaoFinal = 0;
    let nomeVarianteFinal = tipoSelecionado.nomeTipo;

    if (tipoSelecionado.subVariantes && tipoSelecionado.subVariantes.length > 0) {
      if (containerSubVariante.style.display !== 'block' || dropdownSubVariante.value === "") {
        mostrarNotificacao(`Por favor, selecione o detalhe para ${tipoSelecionado.nomeTipo}.`, 2000);
        return;
      }
      const subVarianteIndex = dropdownSubVariante.value;
      const subVarianteSelecionada = tipoSelecionado.subVariantes[parseInt(subVarianteIndex, 10)];
      precoFinal = subVarianteSelecionada.preco;
      duracaoFinal = subVarianteSelecionada.duracaoMinutos;
      nomeVarianteFinal += ` - ${subVarianteSelecionada.nomeSubVariante}`;
    } else {
      precoFinal = tipoSelecionado.precoFixoVariante;
      duracaoFinal = tipoSelecionado.duracaoFixaVarianteMinutos;
    }
    
        const servicoParaAdicionar = {
         nomePrincipal: servicoBase.nomePrincipal,
         varianteDetalhe: nomeVarianteFinal, 
         textoExibicao: `${servicoBase.nomePrincipal} (${nomeVarianteFinal})`,
         preco: precoFinal,
         duracaoMinutos: duracaoFinal,
         servicoIndex: parseInt(servicoIndex, 10),
         tipoIndex: parseInt(tipoIndex, 10),
         subVarianteIndex: (tipoSelecionado.subVariantes && tipoSelecionado.subVariantes.length > 0) ? parseInt(dropdownSubVariante.value, 10) : -1
        };

            servicosSelecionadosParaAgendar.push(servicoParaAdicionar);
            console.log("Serviço adicionado:", servicoParaAdicionar);
            console.log("Lista atual de serviços para agendar:", servicosSelecionadosParaAgendar);

            renderizarServicosJaAdicionados();

            dropdownServicoPrincipal.value = "";
            handleSelecaoServicoPrincipal();    
            mostrarInfoServicoAtualSendoMontado(); 
            });
            console.log("LOG: Listener para btnAdicionarServicoAtual adicionado.");
        } else { console.error("LOG CRÍTICO: btnAdicionarServicoAtual não encontrado!"); }

        if (btnMostrarSelecaoNovoServico) {
         btnMostrarSelecaoNovoServico.addEventListener('click', () => {
         console.log("LOG: Botão '+ Adicionar Outro Serviço' clicado.");
  
         const areaSelecao = document.querySelector('.area-selecao-servico-atual');
         if (areaSelecao) areaSelecao.style.display = 'block'; 

         dropdownServicoPrincipal.value = ""; 
         handleSelecaoServicoPrincipal(); 
    
         dropdownServicoPrincipal.focus(); 
        });

        } else { console.error("LOG: btnMostrarSelecaoNovoServico NÃO FOI ENCONTRADO."); }
    
        if (btnProsseguirReservaNoModalServicos) {
            btnProsseguirReservaNoModalServicos.addEventListener('click', () => {
            console.log("LOG: Botão 'Prosseguir para Reserva de Horário' (no modal de serviços) clicado.");
            if (servicosSelecionadosParaAgendar.length === 0) {
                mostrarNotificacao("Por favor, adicione pelo menos um serviço.", 3000);
                return;
            }
            if (modalSelecionarServicos) {
                modalSelecionarServicos.style.display = 'none';
            }
            abrirModalDeReservaComServicos(); 
            });
            console.log("LOG: Listener para btnMostrarSelecaoNovoServico adicionado.");
        } else { console.error("LOG CRÍTICO: btnMostrarSelecaoNovoServico não encontrado!"); }
    }

    //FUNÇÔES MODAL FINAL DE RESERVA

    function abrirModalDeReservaComServicos() {
  if (servicosSelecionadosParaAgendar.length === 0) {
    mostrarNotificacao("Por favor, selecione pelo menos um serviço.", 3000);
    return;
  }

  const reservaModalElement = document.getElementById('reservaModal');
  const resumoServicosDiv = document.getElementById('resumoServicosModal'); 
  const dataInputModal = document.getElementById('dataReserva'); 
  const horarioSelectModal = document.getElementById('horarioReserva');

  let htmlResumo = '<h4>Serviços Escolhidos:</h4><ul>';
  servicosSelecionadosParaAgendar.forEach(s => {
    htmlResumo += `<li>${s.nomePrincipal} (${s.varianteDetalhe}) - R$${s.preco}, ${s.duracaoMinutos} min</li>`;
  });
  htmlResumo += '</ul>';

  let precoTotal = servicosSelecionadosParaAgendar.reduce((sum, s) => sum + s.preco, 0);
  let duracaoTotal = servicosSelecionadosParaAgendar.reduce((sum, s) => sum + s.duracaoMinutos, 0);

  htmlResumo += `<p><strong>Preço Total: R$ ${precoTotal}</strong></p>`;
  htmlResumo += `<p><strong>Duração Total Estimada: ${duracaoTotal} min</strong></p>`;
  
  if (resumoServicosDiv) resumoServicosDiv.innerHTML = htmlResumo;
  
  if (dataInputModal) dataInputModal.value = '';
  if (horarioSelectModal) horarioSelectModal.innerHTML = '<option value="">Escolha uma data primeiro</option>';
  const observacoesModalInput = document.getElementById('observacoesReservaModal');
  if (observacoesModalInput) observacoesModalInput.value = '';

  // --- BLOQUEAR DATAS PASSADAS ---
  if (dataInputModal) {
    const hoje = new Date(); 
    hoje.setHours(0, 0, 0, 0); 

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); 
    const dia = String(hoje.getDate()).padStart(2, '0');
    
    const dataMinimaFormatada = `${ano}-${mes}-${dia}`;
    
    dataInputModal.min = dataMinimaFormatada;
    console.log(`Data mínima para seleção no modal: ${dataMinimaFormatada}`); 
  } else {
    console.warn("Elemento 'dataReserva' não encontrado para definir data mínima.");
  }

  if (dataInputModal) {
    const novoDataInputModal = dataInputModal.cloneNode(true);
    dataInputModal.parentNode.replaceChild(novoDataInputModal, dataInputModal);
    
    novoDataInputModal.addEventListener('change', async () => {
      const dataSelecionada = novoDataInputModal.value;
      const timePickerModal = document.getElementById('horarioReserva'); // Usar o ID correto
      timePickerModal.innerHTML = '';

      if (!dataSelecionada) {
        timePickerModal.innerHTML = '<option value="">Escolha uma data</option>';
        return;
      }
      const diaDaSemana = new Date(dataSelecionada + 'T00:00:00-03:00').getDay();
      if (diaDaSemana === 1) {
        mostrarNotificacao("A barbearia não funciona às segundas-feiras.", 3000);
        timePickerModal.innerHTML = '<option value="">Dia não disponível</option>';
        return;
      }

      const duracaoTotalAgendamentoMinutos = servicosSelecionadosParaAgendar.reduce((sum, s) => sum + s.duracaoMinutos, 0);
      if (duracaoTotalAgendamentoMinutos <= 0) { /* ... */ return; }
      const slotsDe30MinNecessarios = Math.ceil(duracaoTotalAgendamentoMinutos / 30);

      timePickerModal.disabled = true;
      timePickerModal.innerHTML = '<option value="">Carregando horários...</option>';
      
      try {
        const reservasRef = collection(db, "reservas");
        const q = query(reservasRef, where("data", "==", dataSelecionada));
        const snapshot = await getDocs(q);
        const agendamentosDoDiaOcupados = [];
        snapshot.forEach(doc => {
          const r = doc.data();
          if (r.horario && typeof r.duracaoTotalMinutos === 'number') {
            const inicioMin = horarioParaMinutos(r.horario);
            agendamentosDoDiaOcupados.push({ inicio: inicioMin, fim: inicioMin + r.duracaoTotalMinutos });
          }
        });

        const horariosDisponiveisParaSelecao = [];
        for (let i = 0; i <= horariosBase.length - slotsDe30MinNecessarios; i++) {
          const horarioInicioPotencialStr = horariosBase[i];
          const inicioMinutosPotencial = horarioParaMinutos(horarioInicioPotencialStr);
          const fimMinutosPotencial = inicioMinutosPotencial + duracaoTotalAgendamentoMinutos;
          let slotDisponivel = true;
          for (const ocupado of agendamentosDoDiaOcupados) {
            if (Math.max(inicioMinutosPotencial, ocupado.inicio) < Math.min(fimMinutosPotencial, ocupado.fim)) {
              slotDisponivel = false;
              break;
            }
          }
          if (slotDisponivel) horariosDisponiveisParaSelecao.push(horarioInicioPotencialStr);
        }

        timePickerModal.innerHTML = '';
        if (horariosDisponiveisParaSelecao.length > 0) {
          horariosDisponiveisParaSelecao.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h;
            opt.textContent = h;
            timePickerModal.appendChild(opt);
          });
        } else {
          timePickerModal.innerHTML = '<option value="">Nenhum horário disponível</option>';
        }
      } catch (error) {
        console.error("Erro ao carregar horários no modal:", error);
        timePickerModal.innerHTML = '<option value="">Erro ao carregar</option>';
      } finally {
        timePickerModal.disabled = false;
      }
    });
  }

  if(reservaModalElement) reservaModalElement.style.display = 'flex';
 }

 // Funções

 //---------FUNÇÂO DE CADASTRO-------------
  btnCadastrar.addEventListener('click', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('emailCadastro').value.trim();
    const senha = document.getElementById('senhaCadastro').value;

    if (!senhaEhForte(senha)) {
      mostrarNotificacao("Senha fraca. Requisitos: 8+ caracteres, maiúscula, minúscula, número e símbolo.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      await sendEmailVerification(userCredential.user);
      mostrarNotificacao("Conta criada com sucesso! Um e-mail de verificação foi enviado para " + email + ". Por favor, verifique sua caixa de entrada.", 5000);
      modalCadastro.style.display = 'none';
      modalLogin.style.display = 'flex';
      }  catch (error) {
      if (error.code === 'auth/email-already-in-use') {
      mostrarNotificacao("Este e-mail já está cadastrado.");
     } else if (error.code === 'auth/invalid-email') {
      mostrarNotificacao("O formato do e-mail é inválido.");
     } else {
      mostrarNotificacao("Erro ao criar conta: " + error.message);
     }
     console.error("Erro ao criar conta:", error);
  }
});

  //FUNÇÂO LOGIN
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
    // FUNÇÃO DE SAIR
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

 // FUNÇÂO PERFIL
 perfil.addEventListener('click', () => {
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

    perfilModal.style.display = 'flex'; 

     if (areaReservas) {
        areaReservas.classList.add('hidden');
        areaReservas.innerHTML = ''; 
    }
  });

 btnFecharPerfil.addEventListener('click', () => {
  perfilModal.style.display = 'none';
 });

  //PERFIL RESERVAS E CANCELAR
 btnReservas.addEventListener('click', () => {
    console.log("Botão Reservas clicado!");
    if (!usuarioLogado) {
      mostrarNotificacao("Erro: Usuário não está logado para carregar reservas.");
      return;
    }

    if (areaReservas.classList.contains('hidden')) {
      carregarReservas();
      areaReservas.classList.remove('hidden');
    } else {
      areaReservas.classList.add('hidden');
    }
   });

   async function carregarReservas() {
   console.log("Função carregarReservas chamada!");


   if (!usuarioLogado) {
    areaReservas.innerHTML = 'Você precisa estar logado para ver suas reservas.';
    console.log("carregarReservas: Tentativa de carregar sem usuário logado.");
    if(!areaReservas.classList.contains('hidden')) areaReservas.classList.add('hidden');
    return;
  }

  areaReservas.innerHTML = 'Carregando...';

  
  try {
    const reservasRef = collection(db, "reservas");
    const q = query(reservasRef, where("email", "==", usuarioLogado.email));

    const querySnapshot = await getDocs(q);

    console.log("Reservas encontradas:", querySnapshot.size, "para o email:", usuarioLogado.email);
    areaReservas.innerHTML = '';

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

        const texto = document.createElement('p');

        let servicosHtmlString = "Serviço não especificado"; 
          if (r.servicosAgendados && r.servicosAgendados.length > 0) {
             servicosHtmlString = r.servicosAgendados.map(servico => {
             return `${servico.nomePrincipal}: ${servico.varianteDetalhe}`;
             }).join('<br>');
          }

        texto.innerHTML = `<strong>Serviço:</strong><br>${servicosHtmlString}<br><br><strong>Data:</strong> ${r.data} às ${r.horario}`;
        texto.style.margin = '0 0 10px 0';
        texto.style.lineHeight = '1.5';

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
      mostrarNotificacao('Reserva cancelada com sucesso!', 2000);
      await carregarReservas(); 
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      mostrarNotificacao('Erro ao cancelar reserva.', 3000);
    }
  }

  async function deletarReservasDoUsuario(emailUsuario) {
    try {
      const reservasRef = collection(db, "reservas");
      const q = query(reservasRef, where("email", "==", emailUsuario));
      const querySnapshot = await getDocs(q);

      console.log(`Encontradas ${querySnapshot.size} reservas para deletar.`);

      const batch = writeBatch(db);

      querySnapshot.forEach(docRef => { 
        batch.delete(docRef.ref);
      });

      await batch.commit();
      console.log('Todas as reservas do usuário foram deletadas.');
    } catch (error) {
      console.error('Erro ao deletar reservas:', error);
      mostrarNotificacao('Erro ao deletar reservas associadas.', 3000);
    }
  }

  //FUNÇÂO DELETAR CONTA
  if (btnDeletar) { 
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
      await deletarReservasDoUsuario(user.email);
      await deleteUser(user);
      mostrarNotificacao('Conta deletada com sucesso!', 3000);
      console.log('Usuário deletado.');
      if (perfilModal) perfilModal.style.display = 'none'; 

    } catch (error) {
      console.error('Erro ao deletar conta:', error);

      if (error.code === 'auth/requires-recent-login') {
        mostrarNotificacao('Para sua segurança, por favor, confirme sua senha para deletar a conta.', 4000);
        
        const senha = prompt("Por favor, insira sua senha para confirmar a exclusão da conta:");

        if (senha) {
          try {
            const credential = EmailAuthProvider.credential(user.email, senha);

            await reauthenticateWithCredential(user, credential);
            
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
          mostrarNotificacao('Exclusão da conta cancelada. Senha não fornecida.', 3000);
        }
      } else {
        mostrarNotificacao('Erro ao deletar conta: ' + error.message, 5000);
      }
    }
  } else {
    mostrarNotificacao('Nenhum usuário autenticado para deletar.', 3000);
  }
 }

  //atualiza a interface do perfil com o usuário logado
  onAuthStateChanged(auth, (user) => {
    usuarioLogado = user; 
    const notificacaoEmailNaoVerificado = document.getElementById('notificacaoEmailNaoVerificado');

    if (user) {
        console.log("Usuário logado:", user.email, "Email verificado:", user.emailVerified);
        if (btnEntrar) btnEntrar.style.display = 'none';
        if (btnCriarConta) btnCriarConta.style.display = 'none';
        if (btnSair) btnSair.style.display = 'inline-block';
        if (perfil) perfil.style.display = 'inline-block';

        if (!user.emailVerified) {
            if (notificacaoEmailNaoVerificado) {
                notificacaoEmailNaoVerificado.innerHTML = `Seu e-mail ainda não foi verificado. Por favor, verifique sua caixa de entrada. <button id='btnReenviarVerificacaoGlobal' style='margin-left: 10px; padding: 5px 8px; cursor:pointer;'>Reenviar e-mail</button>`;
                notificacaoEmailNaoVerificado.style.display = 'block';

                const btnReenviarGlobal = document.getElementById('btnReenviarVerificacaoGlobal');
                if (btnReenviarGlobal) {
                    const novoBtnReenviar = btnReenviarGlobal.cloneNode(true);
                    btnReenviarGlobal.parentNode.replaceChild(novoBtnReenviar, btnReenviarGlobal);
                    
                    novoBtnReenviar.addEventListener('click', async () => {
                        try {
                            await sendEmailVerification(auth.currentUser);
                            mostrarNotificacao("E-mail de verificação reenviado com sucesso!", 4000);
                        } catch (error) {
                            mostrarNotificacao("Erro ao reenviar e-mail de verificação: " + error.message, 4000);
                            console.error("Erro ao reenviar e-mail de verificação:", error);
                        }
                    });
                }
            }
        } else {
            if (notificacaoEmailNaoVerificado) {
                notificacaoEmailNaoVerificado.style.display = 'none';
            }
        }
    } else {
        if (btnEntrar) btnEntrar.style.display = 'inline-block';
        if (btnCriarConta) btnCriarConta.style.display = 'inline-block';
        if (btnSair) btnSair.style.display = 'none';
        if (perfil) perfil.style.display = 'none';
        if (perfilModal) perfilModal.style.display = 'none';
        if (notificacaoEmailNaoVerificado) {
            notificacaoEmailNaoVerificado.style.display = 'none';
        }
    }
});

    function atualizarDetalhesServicoUI(servicoIndex) {
    const servico = servicosDisponiveis[servicoIndex];
    const tipoDropdown = document.getElementById(`dropdown_tipo_${servico.idHtmlBase}`);
    const tipoSelecionadoIndex = parseInt(tipoDropdown.value);
    const tipoSelecionado = servico.tiposDeVariante[tipoSelecionadoIndex];

    const subVarianteContainer = document.getElementById(`container_sub_${servico.idHtmlBase}`);
    const subVarianteDropdown = document.getElementById(`dropdown_sub_${servico.idHtmlBase}`);
    const labelSubVariante = subVarianteContainer.querySelector('label');

    let precoFinal = 0;
    let duracaoFinal = 0;

    if (tipoSelecionado.subVariantes && tipoSelecionado.subVariantes.length > 0) {
      subVarianteDropdown.innerHTML = '';
      tipoSelecionado.subVariantes.forEach((subVar, subVarIndex) => {
        const option = document.createElement('option');
        option.value = subVarIndex;
        option.textContent = `${subVar.nomeSubVariante} (R$${subVar.preco}, ${subVar.duracaoMinutos} min)`;
        option.dataset.preco = subVar.preco;
        option.dataset.duracao = subVar.duracaoMinutos;
        subVarianteDropdown.appendChild(option);
      });
      labelSubVariante.textContent = "Opção específica: "; 
      subVarianteContainer.style.display = 'block';

      const subVarianteSelecionadaIndex = parseInt(subVarianteDropdown.value);
      const subVarianteSelecionada = tipoSelecionado.subVariantes[subVarianteSelecionadaIndex];
      precoFinal = subVarianteSelecionada.preco;
      duracaoFinal = subVarianteSelecionada.duracaoMinutos;

    } else {
      subVarianteContainer.style.display = 'none';
      precoFinal = tipoSelecionado.precoFixoVariante;
      duracaoFinal = tipoSelecionado.duracaoFixaVarianteMinutos;
    }

    document.getElementById(`preco_${servico.idHtmlBase}`).textContent = `R$ ${precoFinal}`;
    document.getElementById(`duracao_${servico.idHtmlBase}`).textContent = `${duracaoFinal} min`;

    const checkboxPrincipal = document.getElementById(`checkbox_${servico.idHtmlBase}`);
    if (checkboxPrincipal.checked) {
        atualizarServicosSelecionadosEResumo();
    }
  }

    function atualizarResumoAgendamento() {
    let precoTotal = 0;
    let duracaoTotal = 0;
    const listaResumoUI = document.getElementById('lista-servicos-selecionados-resumo');
    listaResumoUI.innerHTML = ''; 

    servicosSelecionadosParaAgendar.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.nomePrincipal} (${item.varianteDetalhe}) - R$${item.preco}, ${item.duracaoMinutos} min`;
      listaResumoUI.appendChild(li);
      precoTotal += item.preco;
      duracaoTotal += item.duracaoMinutos;
    });

    document.getElementById('preco-total-resumo').textContent = `R$ ${precoTotal}`;
    document.getElementById('duracao-total-resumo').textContent = `${duracaoTotal} min`;
  }

  function atualizarServicosSelecionadosEResumo() {
    servicosSelecionadosParaAgendar = [];
    servicosDisponiveis.forEach((servico, servicoIndex) => {
        const checkbox = document.getElementById(`checkbox_${servico.idHtmlBase}`);
        if (checkbox.checked) {
            const tipoDropdown = document.getElementById(`dropdown_tipo_${servico.idHtmlBase}`);
            const tipoSelecionado = servico.tiposDeVariante[parseInt(tipoDropdown.value)];
            let varianteDetalhe = tipoSelecionado.nomeTipo;
            let preco = 0;
            let duracao = 0;

            if (tipoSelecionado.subVariantes && tipoSelecionado.subVariantes.length > 0) {
                const subVarianteDropdown = document.getElementById(`dropdown_sub_${servico.idHtmlBase}`);
                const subVarianteSelecionada = tipoSelecionado.subVariantes[parseInt(subVarianteDropdown.value)];
                varianteDetalhe += ` - ${subVarianteSelecionada.nomeSubVariante}`;
                preco = subVarianteSelecionada.preco;
                duracao = subVarianteSelecionada.duracaoMinutos;
            } else {
                preco = tipoSelecionado.precoFixoVariante;
                duracao = tipoSelecionado.duracaoFixaVarianteMinutos;
            }
            servicosSelecionadosParaAgendar.push({
                nomePrincipal: servico.nomePrincipal,
                varianteDetalhe: varianteDetalhe,
                preco: preco,
                duracaoMinutos: duracao,
                servicoIndex: servicoIndex,
                tipoIndex: parseInt(tipoDropdown.value),
                subVarianteIndex: (tipoSelecionado.subVariantes && tipoSelecionado.subVariantes.length > 0) ? parseInt(document.getElementById(`dropdown_sub_${servico.idHtmlBase}`).value) : -1
            });
        }
    });
    atualizarResumoAgendamento();
  }

    //EVENT LISTENERS 
    if(modalLogin) modalLogin.style.display = 'none';
    if(modalSelecionarServicos) modalSelecionarServicos.style.display = 'none';
    if(reservaModal) reservaModal.style.display = 'none';
    if(perfilModal) perfilModal.style.display = 'none';

    popularDropdownServicoPrincipal(); 
    adicionarListenersServicos(); 

    if (btnAbrirModalServicos && modalSelecionarServicos) {
        btnAbrirModalServicos.addEventListener('click', () => {
          if (!usuarioLogado) {
            mostrarNotificacao("Você precisa estar logado para agendar um serviço.", 3000);
            modalLogin.style.display = 'flex';
            return;
        }
        if (!usuarioLogado.emailVerified) {
            mostrarNotificacao("Por favor, verifique seu e-mail antes de fazer um agendamento. Um link de verificação foi enviado para sua caixa de entrada.", 6000);
            const elNotificacao = document.getElementById('notificacaoEmailNaoVerificado');
            if (elNotificacao) elNotificacao.scrollIntoView({ behavior: 'smooth' });
            return;
        }
            servicosSelecionadosParaAgendar = [];
            renderizarServicosJaAdicionados(); 
            atualizarTotaisResumoModalServicos();
            dropdownServicoPrincipal.value = ""; 
            handleSelecaoServicoPrincipal();  
            
            const areaSelecao = document.querySelector('.area-selecao-servico-atual');
            if (areaSelecao) areaSelecao.style.display = 'block';

            modalSelecionarServicos.style.display = 'flex';
        });
    }
    if (btnFecharModalServicos && modalSelecionarServicos) {
        btnFecharModalServicos.addEventListener('click', () => {
            modalSelecionarServicos.style.display = 'none';
        });
    }

     btnFecharLogin.addEventListener('click', (e) => {
     e.preventDefault();
     modalLogin.style.display = 'none';
     });

     btnFecharCadastro.addEventListener('click', (e) => {
     e.preventDefault();
     modalCadastro.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modalLogin) modalLogin.style.display = 'none';
        if (e.target === modalCadastro) modalCadastro.style.display = 'none';
        if (e.target === reservaModal) reservaModal.style.display = 'none';
        if (e.target === modalSelecionarServicos) modalSelecionarServicos.style.display = 'none';
        if (e.target === perfilModal) perfilModal.style.display = 'none';
    });


// eventos de modais
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

    //Botões para alternar entre login e cadastro(possui conta?)
  btnIrCadastro.addEventListener('click', () => {
  modalLogin.style.display = 'none';
  modalCadastro.style.display = 'flex';
  });

  btnIrEntrar.addEventListener('click', () => {
  modalLogin.style.display = 'flex';
  modalCadastro.style.display = 'none';
  });


   //confirmar reserva
   if (btnConfirmarReservaModal) { 
    btnConfirmarReservaModal.addEventListener('click', async () => {
        if (!usuarioLogado) {
            mostrarNotificacao("Você precisa estar logado para confirmar a reserva.", 3000);
            return;
        }

        const dataSelecionada = document.getElementById('dataReserva').value;
        const horarioSelecionado = document.getElementById('horarioReserva').value;
        const observacoesInput = document.getElementById('observacoesReservaModal');
        const observacoes = observacoesInput ? observacoesInput.value.trim() : "";

        if (!dataSelecionada || !horarioSelecionado || horarioSelecionado === "") {
            mostrarNotificacao("Por favor, selecione a data e um horário válido.", 3000);
            return;
        }

        if (servicosSelecionadosParaAgendar.length === 0) {
            mostrarNotificacao("Nenhum serviço foi selecionado para a reserva.", 3000);
            return;
        }

        const precoTotalCalculado = servicosSelecionadosParaAgendar.reduce((sum, s) => sum + s.preco, 0);
        const duracaoTotalCalculadaMinutos = servicosSelecionadosParaAgendar.reduce((sum, s) => sum + s.duracaoMinutos, 0);

        const dadosReserva = {
            uid: usuarioLogado.uid,
            email: usuarioLogado.email,
            data: dataSelecionada,
            horario: horarioSelecionado,
            servicosAgendados: servicosSelecionadosParaAgendar.map(s => ({
                nomePrincipal: s.nomePrincipal,
                varianteDetalhe: s.varianteDetalhe,
                preco: s.preco,
                duracaoMinutos: s.duracaoMinutos
            })),
            precoTotal: precoTotalCalculado,
            duracaoTotalMinutos: duracaoTotalCalculadaMinutos,
            observacoes: observacoes,
            timestamp: serverTimestamp()
        };

        console.log("Dados da reserva que serão salvos no Firestore:", dadosReserva);

        try {
            await addDoc(collection(db, "reservas"), dadosReserva);
            mostrarNotificacao("Reserva confirmada com sucesso!", 3000);

            document.getElementById('dataReserva').value = '';
            document.getElementById('horarioReserva').innerHTML = '<option value="">Escolha uma data primeiro</option>';
            if (observacoesInput) observacoesInput.value = '';

            const reservaModalElement = document.getElementById('reservaModal');
            if (reservaModalElement) reservaModalElement.style.display = 'none';

        } catch (error) {
            console.error("Erro ao confirmar reserva: ", error);
            mostrarNotificacao("Erro ao confirmar a reserva. Tente novamente.", 3000);
        }
    });
 } else {
    console.error("Botão 'btnConfirmarReservaModal' não encontrado!");
 }

    // Form de contato
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
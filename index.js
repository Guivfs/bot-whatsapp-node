const venom = require('venom-bot');
const axios = require('axios');

const userSessions = {}; // Objeto para armazenar dados temporários dos usuários

venom
  .create(
    'sessionName', // Nome da sessão
    (base64Qr, asciiQR) => {
      console.log(asciiQR); // Mostrar QR Code no terminal
      // Para exibir o QR Code em um navegador, você pode gerar uma página HTML com a imagem base64
    },
    (statusSession) => {
      console.log('Status da sessão:', statusSession); // Receber status da sessão (é útil para debugging)
    },
    { folderNameToken: 'tokens', mkdirFolderToken: '' } // Configurações adicionais da sessão
  )
  .then((client) => start(client))
  .catch((error) => {
    console.log(error);
  });

function start(client) {
  client.onMessage((message) => {
    if (message.isGroupMsg === false) {
      const userId = message.from;
      const userName = message.notifyName || message.sender.pushname || ""; // Verificar notifyName ou pushname
      console.log(`Nome do usuário capturado: ${userName}`);
      
      if (!userSessions[userId]) {
        // Iniciar nova sessão de cadastro
        userSessions[userId] = { step: 0 };
        client.sendText(userId, `Olá ${userName}, meu nome é Guilherme, sou o assistente virtual. Digite o número do que você necessita:\n1 - Cadastro.\n2 - Ajuda.`);
        return;
      }

      const session = userSessions[userId];

      if (session.step === 0) {
        if (message.body === '1') {
          session.step++;
          client.sendText(userId, 'Qual é o seu nome?');
        } else if (message.body === '2') {
          client.sendText(userId, 'Como posso ajudar você?');
          delete userSessions[userId];
        } else {
          client.sendText(userId, 'Opção inválida. Digite o número do que você necessita:\n1 - Cadastro.\n2 - Ajuda.');
        }
      } else if (session.step === 1) {
        session.nomeUsuario = message.body;
        session.step++;
        client.sendText(userId, 'Qual é o seu nome de usuário?');
      } else if (session.step === 2) {
        session.userUsuario = message.body;
        session.step++;
        client.sendText(userId, 'Qual é o seu email?');
      } else if (session.step === 3) {
        session.emailUsuario = message.body;
        session.step++;
        client.sendText(userId, 'Qual é o seu CEP?');
      } else if (session.step === 4) {
        session.cepUsuario = message.body;
        session.step++;
        client.sendText(userId, 'Qual é a sua senha?');
      } else if (session.step === 5) {
        session.senhaUsuario = message.body;

        const userData = {
          nomeUsuario: session.nomeUsuario,
          userUsuario: session.userUsuario,
          emailUsuario: session.emailUsuario,
          cepUsuario: session.cepUsuario,
          senhaUsuario: session.senhaUsuario,
        };

        sendToApi(userData)
          .then((response) => {
            client.sendText(userId, 'Cadastro realizado com sucesso!');
            delete userSessions[userId]; // Limpar sessão do usuário
          })
          .catch((error) => {
            client.sendText(userId, 'Erro ao realizar cadastro.');
            delete userSessions[userId]; // Limpar sessão do usuário
          });
      }
    }
  });
}

function sendToApi(userData) {
  console.log(userData);
  return axios.post('http://localhost:8080/registro-usuario', userData);
}

// Integração com Telegram para notificações
// Utiliza as variáveis de ambiente configuradas no .env

export interface TelegramMessage {
  protocolo: string;
  titulo: string;
  status: string;
  usuario?: string;
  acao: string;
}

export const enviarNotificacaoTelegram = async (message: TelegramMessage): Promise<boolean> => {
  try {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('⚠️ Configurações do Telegram não encontradas. Notificação não enviada.');
      return false;
    }

    // Log da tentativa de envio
    console.log('📱 Enviando notificação Telegram:', {
      protocolo: message.protocolo,
      acao: message.acao,
      chat_id: chatId
    });

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatarMensagemTelegram(message),
        parse_mode: 'HTML'
      })
    });

    if (response.ok) {
      console.log('✅ Notificação Telegram enviada com sucesso');
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Erro ao enviar notificação Telegram:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar notificação Telegram:', error);
    return false;
  }
};

const formatarMensagemTelegram = (message: TelegramMessage): string => {
  const statusEmoji = {
    'sem-categoria': '🔍',
    'pendente': '⏳',
    'em-andamento': '🔄',
    'concluida': '✅'
  };

  const emoji = statusEmoji[message.status as keyof typeof statusEmoji] || '📋';

  return `
${emoji} <b>Solicitação Atualizada</b>

<b>Protocolo:</b> ${message.protocolo}
<b>Título:</b> ${message.titulo}
<b>Status:</b> ${message.status.replace('-', ' ').toUpperCase()}
<b>Ação:</b> ${message.acao}
${message.usuario ? `<b>Por:</b> ${message.usuario}` : ''}

<i>Sistema Kanban - ${new Date().toLocaleString('pt-BR')}</i>
  `.trim();
};
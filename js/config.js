/*
 * MIRAI — dados editáveis da página.
 * Tudo que muda de um lançamento/corretor para outro está aqui.
 */
window.MIRAI_CONFIG = {
  corretor: {
    nome: "Ailton Souto",
    titulo: "Corretor de imóveis",
    creci: "CRECI 7536F",

    // WhatsApp com DDI + DDD, só números. Ex.: "5583999998888"
    // Enquanto estiver vazio, o botão abre o WhatsApp com a mensagem pronta,
    // mas a pessoa precisa escolher o contato.
    whatsapp: "5583987705579",

    // Caminho da foto do corretor. Ex.: "assets/img/ailton.jpg"
    // Enquanto estiver vazio, aparece um espaço reservado com as iniciais.
    foto: "assets/img/ailton-souto.jpg",

    texto:
      "Fale direto com o Ailton para ver valores, unidades disponíveis e as condições de pagamento do Mirai.",
  },

  // Mensagem que já chega escrita na conversa do WhatsApp.
  mensagemWhatsApp:
    "Olá, quero começar a realizar o meu sonho. Pode me informar sobre o Mirai?",

  // Parâmetros da estimativa de aprovação.
  // valorImovel: menor valor anunciado para o Mirai na pesquisa de 15/11/2026.
  // ATENÇÃO: taxaAnual e prazoMeses ainda são PROVISÓRIOS; confirme com o banco.
  simulador: {
    valorImovel: 327846, // R$ — valor de referência do apartamento
    taxaAnual: 0.105, // juros ao ano do financiamento (10,5%)
    prazoMeses: 420, // 35 anos
    comprometimentoRenda: 0.3, // parcela pode usar até 30% da renda familiar
    entradaMinima: 0.2, // banco costuma financiar até 80%
  },
};

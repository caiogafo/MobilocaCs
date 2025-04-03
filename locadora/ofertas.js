// Aguarda o DOM (toda a estrutura HTML) ser completamente carregado e interpretado.
document.addEventListener('DOMContentLoaded', function() {

    // Tenta selecionar o botão de reservar usando seu ID único.
    const botaoReservar = document.getElementById('botaoReservar');

    // Verifica se o botão foi realmente encontrado no DOM.
    if (botaoReservar) {
        // Se o botão existe, adiciona um 'listener' que espera por um evento de 'click'.
        botaoReservar.addEventListener('click', function() {
            // Dentro desta função, 'this' se refere ao elemento que disparou o evento (o botão).

            // Tenta encontrar o elemento pai mais próximo que tenha a classe '.economico'.
            // Isso ajuda a garantir que estamos pegando dados da seção correta.
            const secaoEconomico = this.closest('.economico');

            // Verifica se a seção pai foi encontrada.
            if (secaoEconomico) {
                // Dentro da seção encontrada, procura pelo primeiro elemento <p> (assume ser o nome do carro).
                const elementoNomeCarro = secaoEconomico.querySelector('p');
                // Dentro da seção, procura pelo elemento com a classe '.grupo' dentro de '.detalhes'.
                const elementoGrupoCarro = secaoEconomico.querySelector('.detalhes .grupo');

                // Verifica se ambos os elementos (nome e grupo) foram encontrados.
                if (elementoNomeCarro && elementoGrupoCarro) {
                    // Extrai o texto contido nos elementos e remove espaços em branco extras (inicio/fim).
                    const nomeCarro = elementoNomeCarro.textContent.trim(); // Ex: "FIAT CRONOS"
                    const grupoTexto = elementoGrupoCarro.textContent.trim(); // Ex: "GRUPO B"

                    // Processa o texto do grupo para extrair apenas o código (Ex: "B").
                    // Assume o formato "PALAVRA CODIGO". Pega a segunda parte (índice 1) após dividir por espaço.
                    // Se não houver espaço, usa o texto inteiro como fallback.
                    const grupoCarro = grupoTexto.split(' ')[1] || grupoTexto;

                    // Codifica os valores de nome e grupo para serem usados de forma segura em uma URL.
                    // Isso substitui caracteres especiais (como espaços) por códigos %xx.
                    const nomeCarroCodificado = encodeURIComponent(nomeCarro);
                    const grupoCarroCodificado = encodeURIComponent(grupoCarro);

                    // Monta a URL da página de destino (reservasData.html) adicionando
                    // os dados do carro e grupo como parâmetros de consulta (query parameters).
                    const urlDestino = `reservasData.html?carro=${nomeCarroCodificado}&grupo=${grupoCarroCodificado}`;

                    // Log (mensagem no console do navegador) para fins de depuração. Mostra para onde vai redirecionar.
                    console.log(`Redirecionando para: ${urlDestino}`);

                    // Redireciona o navegador do usuário para a URL construída.
                    window.location.href = urlDestino;

                } else {
                    // Se não encontrou o elemento do nome ou do grupo, exibe um erro no console.
                    console.error("Erro: Não foi possível encontrar os elementos de nome ou grupo do carro dentro da seção '.economico'.");
                    // Poderia adicionar um alert para o usuário aqui, ou redirecionar sem os dados.
                    // Exemplo: alert("Erro ao obter detalhes do carro. Tente novamente.");
                }
            } else {
                // Se não encontrou a seção pai '.economico', exibe um erro no console.
                 console.error("Erro: Não foi possível encontrar a seção pai '.economico' para o botão clicado.");
            }
        }); // Fim do addEventListener
    } else {
        // Se o botão com ID 'botaoReservar' não foi encontrado na página, exibe um erro no console.
        console.error("Erro: Botão com ID 'botaoReservar' não encontrado no DOM.");
    }

}); // Fim do DOMContentLoaded listener
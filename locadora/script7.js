document.addEventListener('DOMContentLoaded', function() {
    // --- Funções auxiliares (Copie/cole as mesmas de script6.js para consistência) ---
    function formatarData(dataString) {
        if (!dataString) return '--/--/----';
        try {
            let dataObj; let horaFormatada = '';
            // ... (código completo da função formatarData) ...
            if (dataString.includes('T')) { dataObj = new Date(dataString); horaFormatada = `${String(dataObj.getHours()).padStart(2, '0')}:${String(dataObj.getMinutes()).padStart(2, '0')}`; }
            else if (dataString.includes(' ')) { const partes = dataString.split(' '); const dataPart = partes[0]; const horaPart = partes.length > 1 ? partes[1] : ''; if (dataPart.includes('-')) { dataObj = new Date(dataPart + 'T00:00:00Z'); } else if (dataPart.includes('/')) { const [dia, mes, ano] = dataPart.split('/'); dataObj = new Date(Date.UTC(ano, mes - 1, dia)); } else { dataObj = new Date(dataPart + 'T00:00:00Z'); } horaFormatada = horaPart; }
            else if (dataString.includes('-')) { dataObj = new Date(dataString + 'T00:00:00Z'); } else if (dataString.includes('/')) { const [dia, mes, ano] = dataString.split('/'); dataObj = new Date(Date.UTC(ano, mes - 1, dia)); }
            else { dataObj = new Date(dataString); }
            if (isNaN(dataObj.getTime())) { if (dataString.includes('/')) { const [dia, mes, ano] = dataString.split('/'); if(dia && mes && ano) { dataObj = new Date(`${ano}-${mes}-${dia}T00:00:00`); if (isNaN(dataObj.getTime())) { throw new Error("Data inválida"); } } else { throw new Error("Formato DD/MM/YYYY incompleto"); } } else { throw new Error("Data inválida"); } }
            const dia = String(dataObj.getUTCDate()).padStart(2, '0'); const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0'); const ano = dataObj.getUTCFullYear();
            const horaOriginal = dataString.match(/\d{1,2}:\d{2}/); if (horaOriginal && horaOriginal[0] !== '00:00') { return `${dia}/${mes}/${ano} às ${horaOriginal[0]}`; } else if (horaFormatada && horaFormatada !== '00:00') { return `${dia}/${mes}/${ano} às ${horaFormatada}`; } else { return `${dia}/${mes}/${ano}`; }
        } catch (e) { console.error("Erro ao formatar data:", dataString, e); return '--/--/----'; }
    }

    function calcularDiarias(dataRetiradaStr, dataDevolucaoStr) {
         try { const parseDateOnly = (d) => { if (!d) return null; let p = d.split(' ')[0]; let y, m, day; if (p.includes('/')) { [day, m, y] = p.split('/'); } else if (p.includes('-')) { [y, m, day] = p.split('-'); } else return null; const dt = new Date(Date.UTC(y, m - 1, day)); return isNaN(dt.getTime()) ? null : dt; }; const dR = parseDateOnly(dataRetiradaStr); const dD = parseDateOnly(dataDevolucaoStr); if (dR && dD && dD >= dR) { const diff = dD.getTime() - dR.getTime(); const dias = Math.ceil(diff / 86400000); return dias === 0 ? 1 : dias; } else if (dR && dD && dD < dR) { console.error("Devolução antes da retirada."); return 1;} } catch (e) { console.error("Erro cálculo diárias:", e); } return 1;
    }

    function formatarMoeda(valor) {
        const v = parseFloat(valor);
        return isNaN(v) ? '0,00' : v.toFixed(2).replace('.', ',');
    }

    // --- Recuperar dados do sessionStorage ---
    const nomeCarro = sessionStorage.getItem('nomeCarro') || 'N/D';
    const precoDiariaCarro = parseFloat(sessionStorage.getItem('precoCarro')) || 0; // Necessário para subtotal
    const urlImagemCarro = sessionStorage.getItem('urlImagemCarro') || 'placeholder_car.png';
    const dataRetirada = sessionStorage.getItem('dataRetirada');
    const dataDevolucao = sessionStorage.getItem('dataDevolucao');
    const retiradaLocal = sessionStorage.getItem('retiradaLocal') || 'N/D';
    const devolucaoLocal = sessionStorage.getItem('devolucaoLocal') || 'N/D';
    const protecaoValor = parseFloat(sessionStorage.getItem('protecaoValor')) || 0;
    const condutorAdicionalValor = parseFloat(sessionStorage.getItem('condutorAdicionalValor')) || 0;
    const cadeiraBebeValor = parseFloat(sessionStorage.getItem('cadeiraBebeValor')) || 0;
    const gpsValor = parseFloat(sessionStorage.getItem('gpsValor')) || 0;
    const descontosValor = parseFloat(sessionStorage.getItem('finalDescontos')) || parseFloat(sessionStorage.getItem('descontosValor')) || 0; // Pega o 'finalDescontos' se existir
    const metodoPagamento = sessionStorage.getItem('metodoPagamentoEscolhido') || 'pix';

    // --- Pega o VALOR TOTAL FINAL que foi salvo pela página de pagamento ---
    const valorTotalFinal = parseFloat(sessionStorage.getItem('valorTotalFinal')) || 0;
    // --- FIM ---

    // Calcular/Recuperar componentes para exibição do detalhamento
    const diarias = calcularDiarias(dataRetirada, dataDevolucao);
    const subtotalValor = precoDiariaCarro * diarias;
    const opcionaisTotalValor = (condutorAdicionalValor || 0) + (cadeiraBebeValor || 0) + (gpsValor || 0);
    // Recalcula a taxa apenas para exibição no detalhamento (baseado nos componentes lidos)
    const baseTaxaRecalc = subtotalValor + protecaoValor + opcionaisTotalValor - descontosValor;
    const taxaConvenienciaRecalc = baseTaxaRecalc > 0 ? (baseTaxaRecalc * 0.12) : 0;

    // Gerar código de reserva aleatório (ou pegar um real se vier de algum lugar)
    const codigoReserva = sessionStorage.getItem('codigoReserva') || ('P' + Math.floor(10000 + Math.random() * 90000));
    sessionStorage.setItem('codigoReserva', codigoReserva); // Salva caso não exista
    const codigoReservaEl = document.getElementById('codigoReserva');
    if(codigoReservaEl) codigoReservaEl.textContent = codigoReserva;


    // Atualizar informações de pagamento com base no método escolhido
    const metodoPagamentoInfo = document.getElementById('metodoPagamentoInfo');
    if (metodoPagamentoInfo) {
         if (metodoPagamento === 'pix') {
             metodoPagamentoInfo.innerHTML = `
                 <p>Use o QR Code ou Copie o código PIX abaixo para efetuar o pagamento.</p>
                 <p><strong>QR CODE AQUI</strong></p> <p><strong>CÓDIGO PIX AQUI</strong></p> <p>Após a confirmação do pagamento a reserva será efetivada!</p>
             `;
         } else if (metodoPagamento === 'cartao_credito') {
             metodoPagamentoInfo.innerHTML = `
                 <p>Pagamento via Cartão de Crédito processado com sucesso.</p>
                 <p>Você receberá um e-mail com os detalhes da sua reserva.</p>
             `;
         } else { // balcao
             metodoPagamentoInfo.innerHTML = `
                 <p>Você optou por pagar no balcão da locadora.</p>
                 <p>Apresente este código na retirada do veículo: <strong>${codigoReserva}</strong></p>
                 <p>O valor total a ser pago será de <strong>R$ ${formatarMoeda(valorTotalFinal)}</strong>.</p>
             `;
         }
    }


    // Preencher resumo
    const el = (id) => document.getElementById(id);
    if(el('resumoImagemCarro')) { el('resumoImagemCarro').src = urlImagemCarro; el('resumoImagemCarro').alt = `Imagem ${nomeCarro}`; }
    if(el('nomeCarro')) el('nomeCarro').textContent = nomeCarro;
    if(el('dataEntrega')) el('dataEntrega').textContent = formatarData(dataRetirada) + (retiradaLocal !== 'N/D' ? ` - ${retiradaLocal}` : '');
    if(el('dataDevolucao')) el('dataDevolucao').textContent = formatarData(dataDevolucao) + (devolucaoLocal !== 'N/D' ? ` - ${devolucaoLocal}` : '');
    // Preenche detalhamento com valores lidos/recalculados
    if(el('subtotal')) el('subtotal').textContent = formatarMoeda(subtotalValor);
    if(el('valorProtecao')) el('valorProtecao').textContent = formatarMoeda(protecaoValor);
    if(el('valorOpcionais')) el('valorOpcionais').textContent = formatarMoeda(opcionaisTotalValor);
    if(el('taxaConveniencia')) el('taxaConveniencia').textContent = formatarMoeda(taxaConvenienciaRecalc); // Exibe taxa recalculada
    if(el('descontos')) el('descontos').textContent = descontosValor > 0 ? `-${formatarMoeda(descontosValor)}` : '0,00'; // Exibe desconto lido

    // --- CORREÇÃO: Usa o VALOR TOTAL FINAL lido do sessionStorage ---
    if(el('total')) el('total').textContent = formatarMoeda(valorTotalFinal);
    // --- FIM DA CORREÇÃO ---

    // Botão de compartilhar
    const btnShare = document.querySelector('.btn-compartilhar');
    if (btnShare) {
         btnShare.addEventListener('click', function() {
             const textoCompartilhamento = `Minha reserva na Mobiloca: ${nomeCarro} de ${formatarData(dataRetirada)} até ${formatarData(dataDevolucao)}. Código: ${codigoReserva}. Valor: R$ ${formatarMoeda(valorTotalFinal)}`;
             if (navigator.share) {
                 navigator.share({ title: 'Minha Reserva Mobiloca', text: textoCompartilhamento, url: window.location.href })
                     .catch(err => { console.error('Erro ao compartilhar:', err); alert('Não foi possível usar o compartilhamento nativo.'); });
             } else {
                 // Fallback para navegadores sem API de compartilhamento (copiar para área de transferência)
                 navigator.clipboard.writeText(textoCompartilhamento)
                     .then(() => alert('Detalhes da reserva copiados para a área de transferência!'))
                     .catch(err => { console.error('Erro ao copiar:', err); alert('Erro ao copiar detalhes.'); });
             }
         });
    }


    // Botão de imprimir
    const btnPrint = document.querySelector('.btn-imprimir');
    if(btnPrint) {
        btnPrint.addEventListener('click', function() {
             window.print();
        });
    }
});

// Coloque esta função e a chamada dela dentro do: document.addEventListener('DOMContentLoaded', function() { ... });
// em script5.js, script6.js, script7.js (ou em um script separado)

async function fetchWeather() {
    // --- Configuração ---
    const location = 'santo amaro'; // Ou 'Santo Amaro, São Paulo, Brazil' para mais especificidade
    const apiKey = '4UHF6RU7LPLQU73J9SR5REXX6'; // Sua chave API

    // --- URL da API (Sua URL, com unitGroup=metric) ---
    const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${apiKey}&contentType=json&lang=pt`; // Adicionado lang=pt

    // --- Elementos do DOM ---
    const tempElement = document.getElementById('weather-temp');
    const descElement = document.getElementById('weather-desc');

    // Estado inicial
    if(tempElement) tempElement.textContent = '--';
    if(descElement) descElement.textContent = 'Carregando...';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.text(); // Tenta ler corpo do erro
            throw new Error(`Erro da API: ${response.statusText} (Status: ${response.status}). Resposta: ${errorData}`);
        }
        const data = await response.json();

        console.log("Resposta da API Visual Crossing:", data); // LOG para verificar estrutura

        // --- Processamento da Resposta (Adaptado para Visual Crossing) ---
        if (data.currentConditions) {
            const current = data.currentConditions;
            const temperature = current.temp; // Temperatura em Celsius
            const description = current.conditions; // Descrição do tempo

            // Atualiza o HTML
            if (temperature !== undefined && temperature !== null && tempElement) {
                tempElement.textContent = Math.round(temperature);
            } else if (tempElement) {
                tempElement.textContent = 'N/A';
            }

            if (description && descElement) {
                // A API já deve retornar em português com lang=pt
                // Apenas garante a primeira letra maiúscula se necessário
                descElement.textContent = description.charAt(0).toUpperCase() + description.slice(1);
            } else if (descElement) {
                descElement.textContent = 'N/A';
            }

             // Opcional: Atualizar o ícone se você tiver um elemento para isso
             // const iconCode = current.icon; // Ex: 'partly-cloudy-day'
             // Atualizar src de um <img> ou classe de um <i> com base no iconCode

        } else {
            console.warn("Objeto 'currentConditions' não encontrado na resposta.");
            if(tempElement) tempElement.textContent = 'N/A';
            if(descElement) descElement.textContent = 'Indisponível';
        }
        // -----------------------------------------------------------------

    } catch (error) {
        console.error("Falha ao buscar/processar dados de tempo:", error);
        if(tempElement) tempElement.textContent = 'N/A';
        if(descElement) descElement.textContent = 'Erro';
    }
}

// --- Chamar a função para buscar o tempo ---
fetchWeather();
document.addEventListener('DOMContentLoaded', function() {
    // --- Funções auxiliares (formatarData, calcularDiarias, formatarMoeda) ---
    function formatarData(dataString) {
        if (!dataString) return '--/--/----';
        try {
            let dataObj; let horaFormatada = '';
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
    function formatarMoeda(valor) { const v = parseFloat(valor); return isNaN(v) ? '0,00' : v.toFixed(2).replace('.', ','); }

    // --- Recuperar/Calcular Valores ---
    let totalValorComDesconto = parseFloat(sessionStorage.getItem('finalTotal'));
    let subtotalValor = parseFloat(sessionStorage.getItem('finalSubtotal'));
    let opcionaisTotalValor = parseFloat(sessionStorage.getItem('finalOpcionais'));
    let descontosValor = parseFloat(sessionStorage.getItem('finalDescontos'));
    let taxaConvenienciaComDesconto = parseFloat(sessionStorage.getItem('finalTaxa'));
    let protecaoValor = parseFloat(sessionStorage.getItem('protecaoValor')) || 0;

    const nomeCarro = sessionStorage.getItem('nomeCarro') || 'N/D';
    const urlImagemCarro = sessionStorage.getItem('urlImagemCarro') || 'placeholder_car.png';
    const dataRetirada = sessionStorage.getItem('dataRetirada');
    const dataDevolucao = sessionStorage.getItem('dataDevolucao');
    const retiradaLocal = sessionStorage.getItem('retiradaLocal') || 'N/D';
    const devolucaoLocal = sessionStorage.getItem('devolucaoLocal') || 'N/D';
    const precoDiariaCarro = parseFloat(sessionStorage.getItem('precoCarro')) || 0;
    const condutorAdicionalValor = parseFloat(sessionStorage.getItem('condutorAdicionalValor')) || 0;
    const cadeiraBebeValor = parseFloat(sessionStorage.getItem('cadeiraBebeValor')) || 0;
    const gpsValor = parseFloat(sessionStorage.getItem('gpsValor')) || 0;

    // Recalcula se o total final lido for inválido (NaN)
    if (isNaN(totalValorComDesconto)) {
        console.warn("Total final (com desc) não encontrado/inválido. Recalculando...");
        const diarias = calcularDiarias(dataRetirada, dataDevolucao);
        subtotalValor = precoDiariaCarro * diarias;
        opcionaisTotalValor = (condutorAdicionalValor || 0) + (cadeiraBebeValor || 0) + (gpsValor || 0);
        let tempDesconto = parseFloat(sessionStorage.getItem('descontosValor'));
        descontosValor = !isNaN(tempDesconto) ? tempDesconto : (subtotalValor * 0.25); // Default
        const baseTaxaComDesconto = subtotalValor + protecaoValor + opcionaisTotalValor - descontosValor;
        taxaConvenienciaComDesconto = baseTaxaComDesconto > 0 ? (baseTaxaComDesconto * 0.12) : 0;
        totalValorComDesconto = baseTaxaComDesconto + taxaConvenienciaComDesconto;
    } else {
        // Garante que componentes sejam números válidos se lidos de 'final*'
         subtotalValor = isNaN(subtotalValor) ? 0 : subtotalValor;
         opcionaisTotalValor = isNaN(opcionaisTotalValor) ? 0 : opcionaisTotalValor;
         descontosValor = isNaN(descontosValor) ? 0 : descontosValor;
         taxaConvenienciaComDesconto = isNaN(taxaConvenienciaComDesconto) ? 0 : taxaConvenienciaComDesconto;
    }

    // --- Calcular Total SEM Desconto ---
    const baseSemDesconto = (subtotalValor || 0) + (protecaoValor || 0) + (opcionaisTotalValor || 0);
    const taxaConvenienciaSemDesconto = baseSemDesconto > 0 ? (baseSemDesconto * 0.12) : 0;
    const totalValorSemDesconto = baseSemDesconto + taxaConvenienciaSemDesconto;

    // --- Elementos do DOM ---
    const el = (id) => document.getElementById(id);
    const resumoImagemCarroElement = el('resumoImagemCarro'); const nomeCarroElement = el('nomeCarro'); const subtotalElement = el('subtotal'); const valorProtecaoElement = el('valorProtecao'); const valorOpcionaisElement = el('valorOpcionais'); const taxaConvenienciaElement = el('taxaConveniencia'); const descontosElement = el('descontos'); const totalElement = el('total'); const dataEntregaElement = el('dataEntrega'); const dataDevolucaoElement = el('dataDevolucao');
    const valorPixEl = document.querySelector('.valor-pix'); const valorCreditEl = document.querySelector('.valor-credit'); const valorPayLaterEl = document.querySelector('.valor-pay-later');
    const pixOption = el('pix'); const payLaterOption = el('pay-later'); const creditCardOption = el('credit-card');
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    const pixForm = el('pix-form'); const payLaterForm = el('pay-later-form'); const creditCardForm = el('credit-card-form'); const payButton = document.querySelector('.pay-button');

    // --- Preencher Detalhamento do Resumo ---
    if (resumoImagemCarroElement) { resumoImagemCarroElement.src = urlImagemCarro; resumoImagemCarroElement.alt = `Imagem ${nomeCarro}`; }
    if (nomeCarroElement) nomeCarroElement.textContent = nomeCarro;
    if (dataEntregaElement) dataEntregaElement.textContent = formatarData(dataRetirada) + (retiradaLocal !== 'N/D' ? ` - ${retiradaLocal}` : '');
    if (dataDevolucaoElement) dataDevolucaoElement.textContent = formatarData(dataDevolucao) + (devolucaoLocal !== 'N/D' ? ` - ${devolucaoLocal}` : '');
    if (subtotalElement) subtotalElement.textContent = formatarMoeda(subtotalValor);
    if (valorProtecaoElement) valorProtecaoElement.textContent = formatarMoeda(protecaoValor);
    if (valorOpcionaisElement) valorOpcionaisElement.textContent = formatarMoeda(opcionaisTotalValor);
    if (taxaConvenienciaElement) taxaConvenienciaElement.textContent = formatarMoeda(taxaConvenienciaComDesconto);
    if (descontosElement) descontosElement.textContent = (descontosValor || 0) > 0 ? `-${formatarMoeda(descontosValor)}` : '0,00';

    // --- Função para ATUALIZAR TOTAIS EXIBIDOS ---
    function atualizarTotaisExibidos() {
        const valorComDescontoF = `R$ ${formatarMoeda(totalValorComDesconto || 0)}`;
        const valorSemDescontoF = `R$ ${formatarMoeda(totalValorSemDesconto || 0)}`;

        if (valorPixEl) valorPixEl.textContent = valorComDescontoF;
        if (valorCreditEl) valorCreditEl.textContent = valorComDescontoF;
        if (valorPayLaterEl) valorPayLaterEl.textContent = valorSemDescontoF;

        if (totalElement) {
            if (payLaterOption?.checked) {
                totalElement.textContent = formatarMoeda(totalValorSemDesconto || 0);
            } else {
                totalElement.textContent = formatarMoeda(totalValorComDesconto || 0);
            }
        }
    }

    // --- Atualizar Totais e Configurar Listeners ---
    atualizarTotaisExibidos(); // Estado inicial

    paymentRadios.forEach(radio => { // Listener para mudanças
        radio.addEventListener('change', atualizarTotaisExibidos);
    });

    // --- Lógica de exibição dos forms de pagamento ---
    function setupPaymentForms() {
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if(pixForm) pixForm.style.display = (this.id === 'pix' && this.checked) ? 'block' : 'none';
                if(creditCardForm) creditCardForm.style.display = (this.id === 'credit-card' && this.checked) ? 'block' : 'none';
                if(payLaterForm) payLaterForm.style.display = (this.id === 'pay-later' && this.checked) ? 'block' : 'none';
            });
        });
         if (pixOption?.checked && pixForm) pixForm.style.display = 'block'; else if(pixForm) pixForm.style.display = 'none';
         if (creditCardOption?.checked && creditCardForm) creditCardForm.style.display = 'block'; else if(creditCardForm) creditCardForm.style.display = 'none';
         if (payLaterOption?.checked && payLaterForm) payLaterForm.style.display = 'block'; else if(payLaterForm) payLaterForm.style.display = 'none';
    }
    if(pixForm || creditCardForm || payLaterForm) { setupPaymentForms(); }

    // --- Formatação Inputs Cartão ---
    const cardNumberInput = el('card-number'); const expiryDateInput = el('expiry-date'); const securityCodeInput = el('security-code');
    cardNumberInput?.addEventListener('input', function(e) { let v = e.target.value.replace(/\D/g, '').substring(0, 16); let f = ''; for (let i = 0; i < v.length; i++) { if (i > 0 && i % 4 === 0) f += ' '; f += v[i]; } e.target.value = f; });
    expiryDateInput?.addEventListener('input', function(e) { let v = e.target.value.replace(/\D/g, '').substring(0, 4); let f = ''; if (v.length > 0) f += v.substring(0, 2); if (v.length >= 2) f += '/' + v.substring(2); e.target.value = f; });
    securityCodeInput?.addEventListener('input', function(e) { e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3); });

    // --- Evento do botão Pagar ---
    payButton?.addEventListener('click', function(event) {
        let isValid = true; let formSelecionado = false; let termsAccepted = false;

        if (pixOption?.checked) { formSelecionado = true; termsAccepted = pixForm?.querySelector('input[name="terms-pix"]')?.checked; if (!termsAccepted) alert('Aceite os termos para pagar com Pix.'); }
        else if (payLaterOption?.checked) { formSelecionado = true; termsAccepted = payLaterForm?.querySelector('input[name="terms-pay-later"]')?.checked; if (!termsAccepted) alert('Aceite os termos para pagar no balcão.'); }
        else if (creditCardOption?.checked) { formSelecionado = true; termsAccepted = validateCreditCardForm(); isValid = termsAccepted; }
        else { alert('Selecione uma forma de pagamento.'); isValid = false; }

        if((pixOption?.checked || payLaterOption?.checked) && !termsAccepted) isValid = false;

        if (isValid && formSelecionado) {
            const metodoPagamento = pixOption.checked ? 'pix' : (creditCardOption.checked ? 'cartao_credito' : 'balcao');
            sessionStorage.setItem('metodoPagamentoEscolhido', metodoPagamento);
            let valorFinalParaSalvar = payLaterOption.checked ? totalValorSemDesconto : totalValorComDesconto;
            sessionStorage.setItem('valorTotalFinal', (valorFinalParaSalvar || 0).toFixed(2)); // Salva o total correto
            console.log("Pagamento validado, redirecionando para confirmação...");
            window.location.href = "reservasConfirmacao.html";
        } else { console.log("Falha na validação do pagamento/termos."); }
    });

    // --- Funções de validação do Cartão de Crédito ---
    function validateCreditCardForm() { const cardNameInput=el('card-name'), cardNumberInput=el('card-number'), expiryDateInput=el('expiry-date'), securityCodeInput=el('security-code'), termsCheckbox=creditCardForm?.querySelector('input[name="terms"]'); const cardName=cardNameInput?.value.trim(), cardNumber=cardNumberInput?.value.trim(), expiryDate=expiryDateInput?.value.trim(), securityCode=securityCodeInput?.value.trim(), termsOk=termsCheckbox?.checked; let isValid=true, message=''; if (!cardName) message='Insira o nome no cartão.'; else if (!validateCardNumber(cardNumber)) message='Número do cartão inválido (16 dígitos).'; else if (!validateExpiryDate(expiryDate)) message='Data de validade inválida (MM/AA, não vencida).'; else if (!validateSecurityCode(securityCode)) message='CVV inválido (3 dígitos).'; else if (!termsOk) message='Aceite os termos e condições.'; if (message) { alert(message); isValid = false; } return isValid; }
    function validateCardNumber(num) { const cleaned = num?.replace(/\s/g, ''); return /^\d{16}$/.test(cleaned); }
    function validateExpiryDate(date) { if (!date) return false; const m = date.match(/^(0[1-9]|1[0-2])\/?(\d{2})$/); if (!m) return false; const month = parseInt(m[1]); const year = parseInt(`20${m[2]}`); const now = new Date(); const cY = now.getFullYear(); const cM = now.getMonth() + 1; return year > cY || (year === cY && month >= cM); }
    function validateSecurityCode(code) { return /^\d{3}$/.test(code); }

}); // Fim do DOMContentLoaded

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
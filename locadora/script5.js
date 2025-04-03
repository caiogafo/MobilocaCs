// Executa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script 5 (Condutor) iniciado - Versão Resumo Alinhada com Script 6.");

    // --- Funções Auxiliares (Mantidas como antes) ---

    /**
     * Formata data/hora para exibição no resumo.
     * @param {string|null} dataString Data (YYYY-MM-DD ou DD/MM/YYYY).
     * @param {string|null} horaString Hora (HH:MM).
     * @returns {string} Data/Hora formatada ou placeholder.
     */
    function formatarData(dataString, horaString = null) {
        // ...(código mantido)...
        if (!dataString) return '--/--/----'; try { let dO; if (dataString.includes('T')) { dO = new Date(dataString); } else if (dataString.includes('-')) { dO = new Date(dataString.replace(/-/g, '/') + 'T00:00:00Z'); } else if (dataString.includes('/')) { const [d, m, a] = dataString.split('/'); if (d && m && a) { dO = new Date(Date.UTC(a, m - 1, d)); } else { throw new Error("Incompleto"); } } else { dO = new Date(dataString); } if (!dO || isNaN(dO.getTime())) { throw new Error("Inválida"); } const dia = String(dO.getUTCDate()).padStart(2, '0'); const mes = String(dO.getUTCMonth() + 1).padStart(2, '0'); const ano = dO.getUTCFullYear(); let df = `${dia}/${mes}/${ano}`; if (horaString && horaString.match(/^\d{1,2}:\d{2}$/) && horaString !== '00:00') { let [h, m] = horaString.split(':'); df += ` às ${h.padStart(2, '0')}:${m.padStart(2, '0')}`; } return df; } catch (e) { console.error("Erro formatarData:", dataString, horaString, e); return '--/--/----'; }
    }

     /**
     * Calcula o número de diárias entre duas datas (strings).
     * (Usado internamente se 'numeroDiarias' não estiver no storage)
     * @param {string | null} dataRetiradaStr - Data de retirada.
     * @param {string | null} dataDevolucaoStr - Data de devolução.
     * @returns {number} Número de diárias (mínimo 1).
     */
    function calcularDiarias(dataRetiradaStr, dataDevolucaoStr) {
       // ...(código mantido)...
        try { const p = (d) => { if (!d) return null; let pt = d.split(' ')[0]; let y, m, day; if (pt.includes('/')) { [day, m, y] = pt.split('/'); } else if (pt.includes('-')) { [y, m, day] = pt.split('-'); } else return null; if (!y || !m || !day) return null; const dt = new Date(Date.UTC(y, m - 1, day)); return isNaN(dt.getTime()) ? null : dt; }; const dR = p(dataRetiradaStr); const dD = p(dataDevolucaoStr); if (dR && dD && dD >= dR) { const diff = dD.getTime() - dR.getTime(); const dias = Math.ceil(diff / 86400000); return dias === 0 ? 1 : dias; } else if (dR && dD && dD < dR) { console.error("Devolução < Retirada."); return 1; } } catch (e) { console.error("Erro diárias:", e); } return 1;
    }

    /**
     * Formata valor numérico como moeda BRL.
     * @param {number|string} valor Valor.
     * @returns {string} Moeda formatada ou '0,00'.
     */
    function formatarMoeda(valor) {
        // ...(código mantido)...
         const v = parseFloat(valor); return isNaN(v) ? '0,00' : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // --- Inicialização das Máscaras (Mantido) ---
    try { if (typeof $ === 'function' && typeof $.fn.inputmask === 'function') { $('#nascimento').inputmask('99/99/9999', { placeholder: "dd/mm/aaaa", clearIncomplete: true }); $('#cpf').inputmask('999.999.999-99', { placeholder: "___.___.___-__", clearIncomplete: true }); $('#cep').inputmask('99999-999', { placeholder: "_____-___", clearIncomplete: true }); $('#telefone').inputmask('(99) 9999[9]-9999', { placeholder: "(__) _____-____", clearIncomplete: true }); } else { console.error("jQuery/Inputmask não carregado."); } } catch(e) { console.error("Erro Inputmask:", e); }

    // --- Funções de Validação (Mantidas) ---
    function validarCPF(cpf) { /* ...código mantido... */ cpf=cpf.replace(/[^\d]+/g,''); if(cpf==='')return false; if(cpf.length!==11||/^(.)\1+$/.test(cpf))return false; let a=0;for(let i=0;i<9;i++)a+=parseInt(cpf.charAt(i))*(10-i);let r=11-(a%11);if(r===10||r===11)r=0;if(r!==parseInt(cpf.charAt(9)))return false;a=0;for(let i=0;i<10;i++)a+=parseInt(cpf.charAt(i))*(11-i);r=11-(a%11);if(r===10||r===11)r=0;if(r!==parseInt(cpf.charAt(10)))return false;return true;}
    function validarEmail(email) { /* ...código mantido... */ const re=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; return re.test(String(email).toLowerCase());}
    async function validarCEP(cep) { /* ...código mantido... */ cep=cep.replace(/\D/g,''); if(cep.length!==8)return{valido:false,erro:'CEP 8 dígitos.'}; try{ const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`); if(!r.ok)throw new Error(`API falhou (Status: ${r.status})`); const d=await r.json(); if(d.erro)return{valido:false,erro:'CEP não encontrado.'}; return{valido:true,data:d}; }catch(e){ console.error("Erro ViaCEP:",e); return{valido:false,erro:'Erro consulta CEP.'}; }}
    function mostrarErro(cId,msg){ const i=document.getElementById(cId); const e=document.getElementById(`${cId}-error`); if(i)i.classList.add('input-error'); if(e){e.textContent=msg; e.style.display='block';}}
    function limparErro(cId){ const i=document.getElementById(cId); const e=document.getElementById(`${cId}-error`); if(i)i.classList.remove('input-error'); if(e){e.textContent=''; e.style.display='none';}}

    // --- Validação Nascimento (Blur - Mantido) ---
     const nascInput = document.getElementById('nascimento'); nascInput?.addEventListener('blur',function(){ const v=this.value; const cId='nascimento'; limparErro(cId); if(!v||v.includes('_'))return; const rgx=/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19\d{2}|20\d{2})$/; if(!rgx.test(v)){mostrarErro(cId,'Formato dd/mm/aaaa'); return;} const[d,m,a]=v.split('/'); const dN=parseInt(d), mN=parseInt(m), aN=parseInt(a); const dtNasc=new Date(aN,mN-1,dN); if(!(dtNasc.getFullYear()===aN && dtNasc.getMonth()+1===mN && dtNasc.getDate()===dN)){mostrarErro(cId,'Data inválida'); return;} const hoje=new Date(); const dtMin=new Date(hoje.getFullYear()-18,hoje.getMonth(),hoje.getDate()); const dtNascSH=new Date(dtNasc.getFullYear(),dtNasc.getMonth(),dtNasc.getDate()); const dtMinSH=new Date(dtMin.getFullYear(),dtMin.getMonth(),dtMin.getDate()); if(dtNascSH>dtMinSH){mostrarErro(cId,'Mínimo 18 anos');}else{limparErro(cId);}});

    // --- Validação outros campos (Blur - Mantido) ---
    document.getElementById('cpf')?.addEventListener('blur',function(){ const v=this.value; if(v.trim()&&!v.includes('_')){ if(!validarCPF(v)){mostrarErro('cpf','CPF inválido');}else{limparErro('cpf');}}else if(!v.trim()){limparErro('cpf');}});
    document.getElementById('email')?.addEventListener('blur',function(){ const v=this.value; if(v.trim()){ if(!validarEmail(v)){mostrarErro('email','E-mail inválido');}else{limparErro('email'); const cI=document.getElementById('email-confirm'); if(cI&&cI.value.trim()&&cI.value!==v){mostrarErro('email-confirm','E-mails não coincidem');}else if(cI&&cI.value===v){limparErro('email-confirm');}}}else{limparErro('email');}});
    document.getElementById('email-confirm')?.addEventListener('blur',function(){ const vC=this.value; if(vC.trim()){ const vP=document.getElementById('email')?.value; if(vC!==vP){mostrarErro('email-confirm','E-mails não coincidem');}else{limparErro('email-confirm');}}else{limparErro('email-confirm');}});
    document.getElementById('cep')?.addEventListener('blur',async function(){ const v=this.value; if(v.trim()&&!v.includes('_')){ const res=await validarCEP(v); if(!res.valido){mostrarErro('cep',res.erro||'CEP inválido');}else{limparErro('cep');}}else if(!v.trim()){limparErro('cep');}});


    // --- Preenchimento do Resumo ---
    /**
     * Busca dados FINAIS do sessionStorage (salvos por script4.js)
     * e atualiza os elementos do resumo.
     * *** ALINHADO COM A LÓGICA DE script6.js ***
     */
    function preencherResumo() {
        console.log("--- Iniciando preencherResumo (script5 - versão alinhada) ---");

        // --- Recupera dados FINAIS e básicos do sessionStorage ---
        const nomeCarro = sessionStorage.getItem('nomeCarro') || 'N/D';
        const urlImagemCarro = sessionStorage.getItem('urlImagemCarro') || 'placeholder_car.png';
        const dataRetirada = sessionStorage.getItem('dataRetirada');
        const horaRetirada = sessionStorage.getItem('horaRetirada'); // Pega hora
        const dataDevolucao = sessionStorage.getItem('dataDevolucao');
        const horaDevolucao = sessionStorage.getItem('horaDevolucao'); // Pega hora
        const retiradaLocal = sessionStorage.getItem('retiradaLocal') || '';
        const devolucaoLocal = sessionStorage.getItem('devolucaoLocal') || '';

        // Pega os valores TOTAIS calculados e salvos pela etapa anterior (Opcionais - script4.js)
        // Usando as chaves que script4.js supostamente salvou ('final*' e outras)
        const subtotalValor = parseFloat(sessionStorage.getItem('finalSubtotal')) || 0; // << Busca valor final
        const protecaoValor = parseFloat(sessionStorage.getItem('protecaoValor')) || 0; // << Busca valor final
        const opcionaisTotalValor = parseFloat(sessionStorage.getItem('valorOpcionaisTotal')) || 0; // << Busca valor final
        const taxaConvenienciaValor = parseFloat(sessionStorage.getItem('finalTaxa')) || 0; // << Busca valor final
        const descontosValor = parseFloat(sessionStorage.getItem('finalDescontos')) || 0; // << Busca valor final
        const totalValor = parseFloat(sessionStorage.getItem('finalTotal')) || 0; // << Busca valor final

        console.log("Valores FINAIS recuperados do sessionStorage:", { subtotalValor, protecaoValor, opcionaisTotalValor, taxaConvenienciaValor, descontosValor, totalValor });
        console.log("Datas/Horas recuperadas:", { dataRetirada, horaRetirada, dataDevolucao, horaDevolucao });

        // --- Seletores dos elementos do resumo ---
        const el = (id) => document.getElementById(id);
        const resumoImagemCarroElement = el('resumoImagemCarro');
        const nomeCarroElement = el('nomeCarro');
        const dataEntregaElement = el('dataEntrega');
        const dataDevolucaoElement = el('dataDevolucao');
        const subtotalElement = el('subtotal'); // Span para valor
        const valorProtecaoElement = el('valorProtecao'); // Span para valor
        const valorOpcionaisElement = el('valorOpcionais'); // Span para valor
        const taxaConvenienciaElement = el('taxaConveniencia'); // Span para valor
        const descontosElement = el('descontos'); // Span para valor
        const totalElement = el('total'); // Span para valor

        // --- Função Auxiliar para Atualizar Texto ---
        const setElementText = (element, text) => {
            if (element) {
                element.textContent = text;
                // console.log(`-> Elemento #${element.id || 'N/A'} atualizado para: "${text}"`);
            } else {
                // console.warn(`!!! Elemento do resumo não encontrado para setar texto: "${text}"`);
            }
        };

        // --- Atualiza os Elementos do Resumo ---
        if (resumoImagemCarroElement) { resumoImagemCarroElement.src = urlImagemCarro; resumoImagemCarroElement.alt = `Imagem ${nomeCarro}`; }
        setElementText(nomeCarroElement, nomeCarro + ' ou similar');

        // Atualiza Datas e Horas (usando a função auxiliar formatarData)
        setElementText(dataEntregaElement, formatarData(dataRetirada, horaRetirada) + (retiradaLocal ? ` - ${retiradaLocal}` : ''));
        setElementText(dataDevolucaoElement, formatarData(dataDevolucao, horaDevolucao) + (devolucaoLocal ? ` - ${devolucaoLocal}` : ''));

        // Atualiza Custos (usando a função auxiliar formatarMoeda)
        setElementText(subtotalElement, formatarMoeda(subtotalValor));
        setElementText(valorProtecaoElement, formatarMoeda(protecaoValor));
        setElementText(valorOpcionaisElement, formatarMoeda(opcionaisTotalValor));
        setElementText(taxaConvenienciaElement, formatarMoeda(taxaConvenienciaValor));
        setElementText(descontosElement, descontosValor > 0 ? `-${formatarMoeda(descontosValor)}` : '0,00');
        setElementText(totalElement, formatarMoeda(totalValor));

        console.log("--- Finalizando preencherResumo ---");
    }


    // --- Processamento do Formulário no Envio (Submit) ---
    const rentalForm = document.getElementById('rental-form');
    rentalForm?.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede envio padrão
        let formValido = true;
        const camposObrigatorios = ['nome', 'ultimo-nome', 'nascimento', 'telefone', 'cpf', 'cep', 'email', 'email-confirm'];

        // Limpa erros anteriores
        camposObrigatorios.forEach(cId => limparErro(cId));

        // 1. Validação de campos obrigatórios e máscaras
        // ...(código de validação mantido)...
        camposObrigatorios.forEach(cId => { const i = document.getElementById(cId); let empty = !i || !i.value.trim(); let maskInc = false; if (i && typeof $ === 'function' && typeof $.fn.inputmask === 'function') { try { if (i.value.trim() && (!$(i).inputmask('isComplete') || i.value.includes('_'))) { maskInc = true; } } catch (err) { console.warn(`Err check mask ${cId}:`, err); if (i.value.trim() && i.value.includes('_')) { maskInc = true; } } } else if (i && i.value.includes('_')) { maskInc = true; } if (empty) { mostrarErro(cId, 'Obrigatório'); formValido = false; } else if (maskInc) { mostrarErro(cId, 'Incompleto'); formValido = false; } });


        // 2. Revalidação das regras específicas
        if (formValido) {
            // ...(código de revalidação mantido)...
            const cpfIn = document.getElementById('cpf'); if (cpfIn && !validarCPF(cpfIn.value)) { mostrarErro('cpf', 'Inválido'); formValido = false; } const emailIn = document.getElementById('email'); if (emailIn && !validarEmail(emailIn.value)) { mostrarErro('email', 'Inválido'); formValido = false; } const emailCIn = document.getElementById('email-confirm'); if (emailIn && emailCIn && emailIn.value !== emailCIn.value) { mostrarErro('email-confirm', 'Não coincidem'); formValido = false; } const cepIn = document.getElementById('cep'); if (cepIn) { const resCep = await validarCEP(cepIn.value); if (!resCep.valido) { mostrarErro('cep', resCep.erro || 'Inválido'); formValido = false; } } const nascErr = document.getElementById('nascimento-error'); if (nascErr && nascErr.style.display === 'block') { if (nascErr.textContent.includes('18 anos') || nascErr.textContent.includes('inválida')) { formValido = false; } }
        }

        // 3. Processamento Final
        if (formValido) {
            console.log("Formulário Condutor VÁLIDO. Salvando dados e redirecionando.");

            // Coleta dados do formulário do condutor
            const formData = {
                nome: document.getElementById('nome')?.value || '',
                ultimoNome: document.getElementById('ultimo-nome')?.value || '',
                nascimento: document.getElementById('nascimento')?.value || '',
                nacionalidade: document.getElementById('nacionalidade')?.value || '',
                ddi: document.getElementById('ddi')?.value || '',
                telefone: document.getElementById('telefone')?.value || '',
                cpf: document.getElementById('cpf')?.value || '',
                cep: document.getElementById('cep')?.value || '',
                email: document.getElementById('email')?.value || '',
                receberOfertas: document.getElementById('ofertas')?.checked || false
            };

            // Salva dados do condutor no sessionStorage
            try {
                sessionStorage.setItem('condutorData', JSON.stringify(formData));
                console.log("Dados do condutor salvos:", formData);
            } catch (e) {
                console.error("Erro ao salvar dados do condutor no sessionStorage:", e);
                alert("Ocorreu um erro ao salvar suas informações. Por favor, tente novamente.");
                return; // Interrompe
            }

            // Verifica se os dados essenciais da reserva (calculados antes) existem
            if (!sessionStorage.getItem('finalTotal') || !sessionStorage.getItem('nomeCarro')) {
                 console.error("ERRO CRÍTICO: Dados da reserva (Total ou Carro) ausentes antes de ir para Pagamento.");
                 alert("Ocorreu um erro com os dados da sua reserva. Por favor, comece novamente.");
                 window.location.href = 'index.html'; // Volta ao início
                 return; // Interrompe
            }

            // Redireciona para a página de Pagamento
            window.location.href = 'reservasPagamento.html'; // <<< CONFIRME O NOME

        } else {
            console.log("Formulário INVÁLIDO. Verifique os erros indicados.");
            // Scroll para o primeiro erro
            const firstErrorField = document.querySelector('.input-error');
            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // --- Inicialização da Página ---
    console.log("Chamando preencherResumo na inicialização...");
    preencherResumo(); // Preenche o resumo lateral com dados das etapas anteriores

    // Busca o clima (se a função estiver disponível)
    if (typeof fetchWeather === "function") {
        console.log("Chamando fetchWeather na inicialização...");
        fetchWeather();
    } else {
        console.warn("Função fetchWeather não definida.");
    }

}); // Fim do DOMContentLoaded


// --- Função de Clima (Definida Globalmente ou Importada - Mantida) ---
async function fetchWeather() {
     // ...(código fetchWeather mantido)...
    console.log("fetchWeather iniciada."); const location = 'santo amaro, sao paulo, br'; const apiKey = '4UHF6RU7LPLQU73J9SR5REXX6'; const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${apiKey}&contentType=json&lang=pt`; const tempElement = document.getElementById('weather-temp'); const descElement = document.getElementById('weather-desc'); if(tempElement) tempElement.textContent = '--'; if(descElement) descElement.textContent = 'Carregando...'; try { const response = await fetch(apiUrl); if (!response.ok) { let errorBody = ''; try { errorBody = await response.text(); } catch(_) {} throw new Error(`Erro HTTP ${response.status}: ${response.statusText}. ${errorBody}`); } const data = await response.json(); /*console.log("Resposta Clima API:", data);*/ if (data && data.currentConditions) { const current = data.currentConditions; const temperature = current.temp; const description = current.conditions; if (tempElement) { tempElement.textContent = (temperature !== undefined && temperature !== null) ? Math.round(temperature) : 'N/A'; } if (descElement) { descElement.textContent = description ? (description.charAt(0).toUpperCase() + description.slice(1)) : 'N/A'; } console.log("Clima atualizado."); } else { throw new Error("Formato inesperado da resposta da API de clima."); } } catch (error) { console.error("Falha ao buscar/processar dados de tempo:", error); if(tempElement) tempElement.textContent = 'N/A'; if(descElement) descElement.textContent = 'Erro'; }
}
// Chama a função de clima ao carregar a página
fetchWeather();
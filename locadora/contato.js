document.addEventListener('DOMContentLoaded', function() {

    const form = document.getElementById('contatoForm');
    const statusDiv = document.getElementById('form-status');
    const cpfInput = document.getElementById('cpf');
    const emailInput = document.getElementById('email');
    const confirmarEmailInput = document.getElementById('confirmar-email');
    const telefoneInput = document.getElementById('telefone');
    const anexoInput = document.getElementById('anexo');
    const cpfErrorSpan = document.getElementById('cpf-error-message');
    const confirmarEmailErrorSpan = document.getElementById('confirmar-email-error-message');
    const anexoLabel = document.getElementById('anexo-label');
    const defaultAnexoLabelText = 'ANEXAR ARQUIVO';

    function validaCPF(cpf) {
        if (typeof cpf !== 'string') return false;
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        cpf = cpf.split('').map(el => +el);
        const rest = (count) => (cpf.slice(0, count-12).reduce((soma, el, index) => soma + el * (count - index), 0) * 10) % 11 % 10;
        return rest(10) === cpf[9] && rest(11) === cpf[10];
    }

    function formatarCPF(input) {
        let value = input.value.replace(/\D/g, '');
        value = value.substring(0, 11);
        let formattedValue = value;
        if (value.length > 9) {
            formattedValue = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            formattedValue = value.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
        } else if (value.length > 3) {
            formattedValue = value.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
        }
        input.value = formattedValue;
    }

    function formatarTelefone(input) {
        let value = input.value.replace(/\D/g, '');
        value = value.substring(0, 11);
        let formattedValue = value;
        if (value.length > 6) {
            formattedValue = value.replace(/^(\d{2})(\d{5})(\d{1,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            formattedValue = value.replace(/^(\d{2})(\d{1,5}).*/, '($1) $2');
        } else if (value.length > 0) {
            formattedValue = value.replace(/^(\d*)/, '($1');
        }
        input.value = formattedValue;
    }

    function validaEmailsCoincidem() {
        if (!emailInput || !confirmarEmailInput) return true;
        return emailInput.value.trim() === confirmarEmailInput.value.trim();
    }

    function aplicarFeedbackEmails() {
         if (!emailInput || !confirmarEmailInput || !confirmarEmailErrorSpan) return;
         const email1 = emailInput.value.trim();
         const email2 = confirmarEmailInput.value.trim();

         if (email1 === '' && email2 === '') {
             emailInput.classList.remove('input-valid', 'input-invalid');
             confirmarEmailInput.classList.remove('input-valid', 'input-invalid');
             confirmarEmailErrorSpan.style.display = 'none';
             return;
         }

        if (validaEmailsCoincidem()) {
             if(email1 !== '' && email2 !== '') {
                emailInput.classList.remove('input-invalid');
                confirmarEmailInput.classList.remove('input-invalid');
                emailInput.classList.add('input-valid');
                confirmarEmailInput.classList.add('input-valid');
             } else {
                 emailInput.classList.remove('input-invalid', 'input-valid');
                 confirmarEmailInput.classList.remove('input-invalid', 'input-valid');
             }
            confirmarEmailErrorSpan.style.display = 'none';
        } else {
             if (email2 !== '') {
                emailInput.classList.remove('input-valid');
                confirmarEmailInput.classList.remove('input-valid');
                emailInput.classList.add('input-invalid');
                confirmarEmailInput.classList.add('input-invalid');
                confirmarEmailErrorSpan.style.display = 'block';
             } else {
                 emailInput.classList.remove('input-invalid', 'input-valid');
                 confirmarEmailInput.classList.remove('input-invalid', 'input-valid');
                 confirmarEmailErrorSpan.style.display = 'none';
             }
        }
    }

    if (cpfInput && cpfErrorSpan) {
        cpfInput.addEventListener('input', function() {
            formatarCPF(this);
            this.classList.remove('input-valid', 'input-invalid');
            cpfErrorSpan.style.display = 'none';
        });
        cpfInput.addEventListener('blur', function() {
            const cpfLimpo = this.value.replace(/\D/g, '');
            if (cpfLimpo.trim() === '') {
                 this.classList.remove('input-valid', 'input-invalid');
                 cpfErrorSpan.style.display = 'none';
                 return;
            }
            if (validaCPF(cpfLimpo)) {
                this.classList.remove('input-invalid');
                this.classList.add('input-valid');
                cpfErrorSpan.style.display = 'none';
            } else {
                this.classList.remove('input-valid');
                this.classList.add('input-invalid');
                cpfErrorSpan.style.display = 'block';
            }
        });
    }

    if (emailInput && confirmarEmailInput) {
        emailInput.addEventListener('blur', aplicarFeedbackEmails);
        confirmarEmailInput.addEventListener('blur', aplicarFeedbackEmails);
        const clearEmailFeedback = () => {
             emailInput.classList.remove('input-valid', 'input-invalid');
             confirmarEmailInput.classList.remove('input-valid', 'input-invalid');
             if(confirmarEmailErrorSpan) confirmarEmailErrorSpan.style.display = 'none';
        };
        emailInput.addEventListener('input', clearEmailFeedback);
        confirmarEmailInput.addEventListener('input', clearEmailFeedback);
    }

    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            formatarTelefone(this);
            this.classList.remove('input-valid', 'input-invalid');
        });
    }

    if (anexoInput && anexoLabel) {
         anexoInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                anexoLabel.textContent = this.files[0].name;
                anexoLabel.classList.add('file-selected'); // Opcional: Adiciona classe
            } else {
                anexoLabel.textContent = defaultAnexoLabelText;
                anexoLabel.classList.remove('file-selected'); // Opcional: Remove classe
            }
        });
    }


    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            let formValido = true;

            const cpfLimpoParaEnvio = cpfInput ? cpfInput.value.replace(/\D/g, '') : '';
            if (cpfInput && !validaCPF(cpfLimpoParaEnvio)) {
                statusDiv.innerHTML = 'Erro: CPF inválido. Por favor, corrija.';
                statusDiv.className = 'error';
                cpfInput.classList.add('input-invalid');
                cpfInput.classList.remove('input-valid');
                if(cpfErrorSpan) cpfErrorSpan.style.display = 'block';
                if (formValido) cpfInput.focus();
                formValido = false;
            }

            if (!validaEmailsCoincidem()) {
                 statusDiv.innerHTML = 'Erro: Os e-mails não coincidem.';
                 statusDiv.className = 'error';
                 emailInput?.classList.add('input-invalid');
                 confirmarEmailInput?.classList.add('input-invalid');
                 emailInput?.classList.remove('input-valid');
                 confirmarEmailInput?.classList.remove('input-valid');
                 if(confirmarEmailErrorSpan) confirmarEmailErrorSpan.style.display = 'block';
                 if (formValido) confirmarEmailInput?.focus();
                 formValido = false;
            }

            const telefoneLimpoParaEnvio = telefoneInput ? telefoneInput.value.replace(/\D/g, '') : '';
            if (telefoneInput && telefoneLimpoParaEnvio.length !== 11) {
                 statusDiv.innerHTML = 'Erro: Telefone celular inválido. Use o formato (XX) XXXXX-XXXX.';
                 statusDiv.className = 'error';
                 telefoneInput.classList.add('input-invalid');
                 telefoneInput.classList.remove('input-valid');
                 if (formValido) telefoneInput.focus();
                 formValido = false;
            } else if (telefoneInput) {
                 telefoneInput.classList.remove('input-invalid');
            }

            if (!formValido) {
                return;
            }

            statusDiv.innerHTML = 'Enviando...';
            statusDiv.className = '';
            statusDiv.style.color = '#555';
            if(cpfErrorSpan) cpfErrorSpan.style.display = 'none';
            if(confirmarEmailErrorSpan) confirmarEmailErrorSpan.style.display = 'none';

            const formData = new FormData(form);
            if (cpfInput) {
                 formData.set('cpf', cpfLimpoParaEnvio);
            }
            if (telefoneInput) {
                 formData.set('telefone', telefoneLimpoParaEnvio);
            }

            const emailDestino = "cahpesgafo@gmail.com";
            const formSubmitURL = `https://formsubmit.co/${emailDestino}`;
            formData.append('_subject', 'Novo Contato Recebido pelo Site!');
            formData.append('_template', 'table');

            try {
                const response = await fetch(formSubmitURL, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Sucesso:', result);
                    statusDiv.innerHTML = 'Mensagem enviada com sucesso!';
                    statusDiv.className = 'success';
                    form.reset();
                    cpfInput?.classList.remove('input-valid', 'input-invalid');
                    emailInput?.classList.remove('input-valid', 'input-invalid');
                    confirmarEmailInput?.classList.remove('input-valid', 'input-invalid');
                    telefoneInput?.classList.remove('input-valid', 'input-invalid');
                    if (anexoLabel) anexoLabel.textContent = defaultAnexoLabelText; // Reseta texto do label do anexo
                    if (anexoLabel) anexoLabel.classList.remove('file-selected'); // Opcional: Remove classe
                    if(cpfErrorSpan) cpfErrorSpan.style.display = 'none';
                    if(confirmarEmailErrorSpan) confirmarEmailErrorSpan.style.display = 'none';

                } else {
                    const errorResult = await response.json();
                    console.error('Erro do Servidor FormSubmit:', errorResult);
                    statusDiv.innerHTML = `Erro ao enviar: ${errorResult.message || 'Tente novamente.'}`;
                    statusDiv.className = 'error';
                }

            } catch (error) {
                console.error('Erro de Rede/Fetch:', error);
                statusDiv.innerHTML = 'Erro ao enviar. Verifique sua conexão ou tente mais tarde.';
                statusDiv.className = 'error';
            }
        });
    } else {
        console.error("Erro: Formulário com ID 'contatoForm' não encontrado.");
    }

});


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
// Arquivo JavaScript para a calculadora de juros compostos

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar formulários da calculadora
    initCalculatorForms();
    
    // Inicializar tabs da calculadora
    initCalculatorTabs();
});

// Inicializar tabs da calculadora
function initCalculatorTabs() {
    const tabs = document.querySelectorAll('.calculator-tab');
    const panels = document.querySelectorAll('.calculator-panel');
    
    if (tabs.length > 0 && panels.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remover classe ativa de todas as tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Adicionar classe ativa à tab clicada
                this.classList.add('active');
                
                // Esconder todos os painéis
                panels.forEach(panel => panel.classList.remove('active'));
                
                // Mostrar o painel correspondente
                const panelId = this.getAttribute('data-panel');
                const targetPanel = document.getElementById(panelId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }
}

// Inicializar formulários da calculadora
function initCalculatorForms() {
    // Formulário de Juros Compostos
    const jurosCompostosForm = document.getElementById('juros-compostos-form');
    if (jurosCompostosForm) {
        jurosCompostosForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calcularJurosCompostos();
        });
    }
    
    // Formulário de Aporte Mensal
    const aporteForm = document.getElementById('aporte-mensal-form');
    if (aporteForm) {
        aporteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calcularAporteMensal();
        });
    }
    
    // Formulário de Objetivo Financeiro
    const objetivoForm = document.getElementById('objetivo-financeiro-form');
    if (objetivoForm) {
        objetivoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calcularTempoObjetivo();
        });
    }
}

// Função para calcular juros compostos
function calcularJurosCompostos() {
    // Obter valores do formulário
    const capitalInicial = parseFloat(document.getElementById('capital-inicial').value) || 0;
    const taxaJuros = parseFloat(document.getElementById('taxa-juros').value) || 0;
    const periodo = parseInt(document.getElementById('periodo').value) || 0;
    const aporteMensal = parseFloat(document.getElementById('aporte-mensal').value) || 0;
    
    // Converter taxa de juros anual para mensal
    const taxaMensal = (taxaJuros / 100) / 12;
    
    // Calcular montante final
    let montante = capitalInicial;
    let totalInvestido = capitalInicial;
    let dadosMensais = [];
    
    // Adicionar ponto inicial
    dadosMensais.push({
        mes: 0,
        montante: montante,
        investido: totalInvestido,
        juros: 0
    });
    
    // Calcular mês a mês
    for (let i = 1; i <= periodo * 12; i++) {
        // Adicionar aporte mensal
        montante += aporteMensal;
        totalInvestido += aporteMensal;
        
        // Aplicar juros
        const jurosMes = montante * taxaMensal;
        montante += jurosMes;
        
        // Armazenar dados para o gráfico (a cada 12 meses)
        if (i % 12 === 0) {
            dadosMensais.push({
                mes: i,
                montante: montante,
                investido: totalInvestido,
                juros: montante - totalInvestido
            });
        }
    }
    
    // Exibir resultados
    document.getElementById('valor-total').textContent = formatarMoeda(montante);
    document.getElementById('resultado-capital').textContent = formatarMoeda(capitalInicial);
    document.getElementById('resultado-investido').textContent = formatarMoeda(totalInvestido);
    document.getElementById('resultado-juros').textContent = formatarMoeda(montante - totalInvestido);
    
    // Mostrar resultados
    document.getElementById('resultado-juros-compostos').style.display = 'block';
    document.getElementById('resultado-detalhes').style.display = 'block';
    
    // Gerar gráfico
    gerarGraficoJurosCompostos(dadosMensais, periodo);
}

// Função para calcular aporte mensal necessário
function calcularAporteMensal() {
    // Obter valores do formulário
    const valorDesejado = parseFloat(document.getElementById('objetivo-valor').value) || 0;
    const taxaJuros = parseFloat(document.getElementById('objetivo-taxa').value) || 0;
    const periodo = parseInt(document.getElementById('objetivo-periodo').value) || 0;
    const capitalInicial = parseFloat(document.getElementById('objetivo-inicial').value) || 0;
    
    // Converter taxa de juros anual para mensal
    const taxaMensal = (taxaJuros / 100) / 12;
    const meses = periodo * 12;
    
    // Calcular aporte mensal necessário
    // Fórmula: PMT = (FV - PV * (1 + r)^n) / (((1 + r)^n - 1) / r)
    const fatorJuros = Math.pow(1 + taxaMensal, meses);
    const valorFuturoCapitalInicial = capitalInicial * fatorJuros;
    const aporteMensal = (valorDesejado - valorFuturoCapitalInicial) / ((fatorJuros - 1) / taxaMensal);
    
    // Exibir resultado
    document.getElementById('valor-aporte-mensal').textContent = formatarMoeda(aporteMensal);
    document.getElementById('resultado-aporte').style.display = 'block';
    
    // Gerar dados para o gráfico
    let dadosMensais = [];
    let montante = capitalInicial;
    
    // Adicionar ponto inicial
    dadosMensais.push({
        mes: 0,
        montante: montante
    });
    
    // Calcular mês a mês
    for (let i = 1; i <= meses; i++) {
        // Adicionar aporte mensal
        montante += aporteMensal;
        
        // Aplicar juros
        montante += montante * taxaMensal;
        
        // Armazenar dados para o gráfico (a cada 12 meses)
        if (i % 12 === 0) {
            dadosMensais.push({
                mes: i,
                montante: montante
            });
        }
    }
    
    // Gerar gráfico
    gerarGraficoAporteMensal(dadosMensais, periodo);
}

// Função para calcular tempo necessário para atingir objetivo
function calcularTempoObjetivo() {
    // Obter valores do formulário
    const valorMeta = parseFloat(document.getElementById('meta-valor').value) || 0;
    const aporteMensal = parseFloat(document.getElementById('meta-aporte').value) || 0;
    const taxaJuros = parseFloat(document.getElementById('meta-taxa').value) || 0;
    const capitalInicial = parseFloat(document.getElementById('meta-inicial').value) || 0;
    
    // Converter taxa de juros anual para mensal
    const taxaMensal = (taxaJuros / 100) / 12;
    
    // Calcular tempo necessário
    let montante = capitalInicial;
    let meses = 0;
    let dadosMensais = [];
    
    // Adicionar ponto inicial
    dadosMensais.push({
        mes: 0,
        montante: montante
    });
    
    // Calcular mês a mês até atingir o objetivo
    while (montante < valorMeta && meses < 600) { // Limite de 50 anos
        meses++;
        
        // Adicionar aporte mensal
        montante += aporteMensal;
        
        // Aplicar juros
        montante += montante * taxaMensal;
        
        // Armazenar dados para o gráfico (a cada 12 meses)
        if (meses % 12 === 0) {
            dadosMensais.push({
                mes: meses,
                montante: montante
            });
        }
    }
    
    // Calcular anos e meses
    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    
    // Exibir resultado
    document.getElementById('tempo-anos').textContent = anos;
    document.getElementById('tempo-meses').textContent = mesesRestantes;
    document.getElementById('resultado-tempo').style.display = 'block';
    
    // Adicionar último ponto se não for múltiplo de 12
    if (meses % 12 !== 0) {
        dadosMensais.push({
            mes: meses,
            montante: montante
        });
    }
    
    // Gerar gráfico
    gerarGraficoObjetivoFinanceiro(dadosMensais);
}

// Função para gerar gráfico de juros compostos
function gerarGraficoJurosCompostos(dados, periodo) {
    const ctx = document.getElementById('chart-juros-compostos').getContext('2d');
    
    // Destruir gráfico existente se houver
    if (window.jurosCompostosChart) {
        window.jurosCompostosChart.destroy();
    }
    
    // Preparar dados para o gráfico
    const labels = dados.map(item => `Ano ${item.mes / 12}`);
    const montanteData = dados.map(item => item.montante);
    const investidoData = dados.map(item => item.investido);
    const jurosData = dados.map(item => item.juros);
    
    // Criar novo gráfico
    window.jurosCompostosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Capital Investido',
                    data: investidoData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Juros Acumulados',
                    data: jurosData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Período'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': R$ ' + context.raw.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                },
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Evolução do Investimento ao Longo do Tempo'
                }
            }
        }
    });
}

// Função para gerar gráfico de aporte mensal
function gerarGraficoAporteMensal(dados, periodo) {
    const ctx = document.getElementById('chart-aporte-mensal').getContext('2d');
    
    // Destruir gráfico existente se houver
    if (window.aporteChart) {
        window.aporteChart.destroy();
    }
    
    // Preparar dados para o gráfico
    const labels = dados.map(item => `Ano ${item.mes / 12}`);
    const montanteData = dados.map(item => item.montante);
    
    // Criar novo gráfico
    window.aporteChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Montante Acumulado',
                    data: montanteData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Período'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': R$ ' + context.raw.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            }
        }
    });
}

// Função para gerar gráfico de objetivo financeiro
function gerarGraficoObjetivoFinanceiro(dados) {
    const ctx = document.getElementById('chart-objetivo-financeiro').getContext('2d');
    
    // Destruir gráfico existente se houver
    if (window.objetivoChart) {
        window.objetivoChart.destroy();
    }
    
    // Preparar dados para o gráfico
    const labels = dados.map(item => item.mes === 0 ? 'Início' : `Mês ${item.mes}`);
    const montanteData = dados.map(item => item.montante);
    
    // Criar novo gráfico
    window.objetivoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Evolução do Patrimônio',
                    data: montanteData,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Período'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': R$ ' + context.raw.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            }
        }
    });
}

// Função para formatar valores monetários
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

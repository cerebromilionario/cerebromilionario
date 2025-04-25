document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('calculatorForm');
    const initialValueInput = document.getElementById('initialValue');
    const monthlyValueInput = document.getElementById('monthlyValue');
    const interestRateInput = document.getElementById('interestRate');
    const periodInput = document.getElementById('period');
    const interestTypeSelect = document.getElementById('interestType');
    const periodTypeSelect = document.getElementById('periodType');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultContainer = document.getElementById('resultContainer');
    
    // Elementos de resultado
    const totalInvestedElement = document.getElementById('totalInvested');
    const totalInterestElement = document.getElementById('totalInterest');
    const finalAmountElement = document.getElementById('finalAmount');
    const monthlyIncomeElement = document.getElementById('monthlyIncome');
    
    // Inicializar gráfico
    let myChart = null;
    
    // Formatar valores monetários
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    // Calcular juros compostos
    function calculateCompoundInterest() {
        // Obter valores do formulário
        const initialValue = parseFloat(initialValueInput.value) || 0;
        const monthlyValue = parseFloat(monthlyValueInput.value) || 0;
        const interestRate = parseFloat(interestRateInput.value) || 0;
        const period = parseInt(periodInput.value) || 0;
        const interestType = interestTypeSelect.value;
        const periodType = periodTypeSelect.value;
        
        // Converter taxa de juros para mensal se for anual
        const monthlyRate = interestType === 'annual' ? interestRate / 12 / 100 : interestRate / 100;
        
        // Converter período para meses se for em anos
        const totalMonths = periodType === 'years' ? period * 12 : period;
        
        // Arrays para armazenar dados para o gráfico
        const labels = [];
        const investedData = [];
        const totalData = [];
        
        let currentValue = initialValue;
        let totalInvested = initialValue;
        
        // Calcular valor para cada mês
        for (let i = 1; i <= totalMonths; i++) {
            // Adicionar aporte mensal
            currentValue += monthlyValue;
            totalInvested += monthlyValue;
            
            // Aplicar juros
            currentValue *= (1 + monthlyRate);
            
            // Adicionar dados para o gráfico a cada 12 meses ou no último mês
            if (i % 12 === 0 || i === totalMonths) {
                const yearLabel = Math.ceil(i / 12);
                labels.push(yearLabel + (yearLabel === 1 ? ' ano' : ' anos'));
                investedData.push(totalInvested);
                totalData.push(currentValue);
            }
        }
        
        // Calcular juros totais
        const totalInterest = currentValue - totalInvested;
        
        // Calcular renda mensal estimada (considerando 0.5% ao mês de rendimento)
        const monthlyIncome = currentValue * 0.005;
        
        // Atualizar elementos de resultado
        totalInvestedElement.textContent = formatCurrency(totalInvested);
        totalInterestElement.textContent = formatCurrency(totalInterest);
        finalAmountElement.textContent = formatCurrency(currentValue);
        
        // Se o elemento de renda mensal existir, atualize-o
        if (monthlyIncomeElement) {
            monthlyIncomeElement.textContent = formatCurrency(monthlyIncome);
        }
        
        // Mostrar container de resultados
        resultContainer.style.display = 'block';
        
        // Atualizar gráfico
        updateChart(labels, investedData, totalData);
        
        // Criar tabela de evolução anual
        createEvolutionTable(labels, investedData, totalData);
        
        return false; // Evitar envio do formulário
    }
    
    // Atualizar gráfico
    function updateChart(labels, investedData, totalData) {
        const ctx = document.getElementById('resultChart').getContext('2d');
        
        // Destruir gráfico existente se houver
        if (myChart) {
            myChart.destroy();
        }
        
        // Criar novo gráfico
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Valor Investido',
                        data: investedData,
                        backgroundColor: 'rgba(52, 152, 219, 0.5)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Valor Total',
                        data: totalData,
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.raw);
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Evolução do Investimento'
                    }
                }
            }
        });
    }
    
    // Criar tabela de evolução anual
    function createEvolutionTable(labels, investedData, totalData) {
        const tableContainer = document.getElementById('evolutionTable');
        if (!tableContainer) return;
        
        // Limpar conteúdo anterior
        tableContainer.innerHTML = '';
        
        // Criar tabela
        const table = document.createElement('table');
        table.className = 'evolution-table';
        
        // Criar cabeçalho
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Período', 'Valor Investido', 'Juros Acumulados', 'Montante Total'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Criar corpo da tabela
        const tbody = document.createElement('tbody');
        
        for (let i = 0; i < labels.length; i++) {
            const row = document.createElement('tr');
            
            // Período
            const periodCell = document.createElement('td');
            periodCell.textContent = labels[i];
            row.appendChild(periodCell);
            
            // Valor Investido
            const investedCell = document.createElement('td');
            investedCell.textContent = formatCurrency(investedData[i]);
            row.appendChild(investedCell);
            
            // Juros Acumulados
            const interestCell = document.createElement('td');
            const interest = totalData[i] - investedData[i];
            interestCell.textContent = formatCurrency(interest);
            row.appendChild(interestCell);
            
            // Montante Total
            const totalCell = document.createElement('td');
            totalCell.textContent = formatCurrency(totalData[i]);
            row.appendChild(totalCell);
            
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }
    
    // Resetar formulário
    function resetForm() {
        form.reset();
        resultContainer.style.display = 'none';
        
        // Destruir gráfico se existir
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }
        
        // Limpar tabela de evolução
        const tableContainer = document.getElementById('evolutionTable');
        if (tableContainer) {
            tableContainer.innerHTML = '';
        }
    }
    
    // Event listeners
    calculateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        calculateCompoundInterest();
    });
    
    resetBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
    });
    
    // Inicializar com valores padrão
    initialValueInput.value = '1000';
    monthlyValueInput.value = '100';
    interestRateInput.value = '8';
    periodInput.value = '10';
});

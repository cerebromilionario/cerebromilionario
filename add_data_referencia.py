#!/usr/bin/env python3
"""
Add 'data de referência' and specific product page source links
to ETF, IR, renda fixa, and market posts.
"""

import re
import os

POSTS_DIR = "/home/user/cerebromilionario/posts"

# Map each file to its specific product page and category data
# Format: filename -> (product_url, product_label, data_referencia_text, extra_sources)
ETF_PRODUCT_PAGES = {
    # iShares ETFs
    "agg-etf-ishares-core-us-aggregate-bond-guia-completo.html": (
        "https://www.ishares.com/us/products/239458/",
        "iShares Core U.S. Aggregate Bond ETF (AGG) — página oficial BlackRock",
        "Dados quantitativos (taxa de administração: 0,03% a.a., AUM, yield, duration e retornos históricos) com referência em <strong>maio de 2026</strong>. Esses valores são atualizados diariamente pela BlackRock — consulte a página oficial do ETF antes de tomar decisões.",
        []
    ),
    "bnd-etf-vanguard-total-bond-market-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/bnd",
        "Vanguard Total Bond Market ETF (BND) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,03% a.a., AUM, yield, duration e retornos históricos) com referência em <strong>maio de 2026</strong>. Esses valores são atualizados regularmente pela Vanguard — consulte a página oficial do ETF antes de tomar decisões.",
        []
    ),
    "dgs-wisdomtree-emerging-markets-small-cap-dividend-guia-completo.html": (
        "https://www.wisdomtree.com/investments/etfs/equity/dgs",
        "WisdomTree Emerging Markets SmallCap Dividend ETF (DGS) — página oficial WisdomTree",
        "Dados quantitativos (taxa de administração: 0,58% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "gld-etf-spdr-gold-shares-guia-completo.html": (
        "https://www.spdrgoldshares.com/usa/",
        "SPDR Gold Shares (GLD) — página oficial SPDR/State Street",
        "Dados quantitativos (taxa de administração: 0,40% a.a., AUM, preço do ouro em USD/oz e retornos históricos) com referência em <strong>maio de 2026</strong>. O preço do ouro oscila diariamente — consulte a página oficial antes de investir.",
        [("https://www.lbma.org.uk/prices-and-data/precious-metal-prices", "LBMA — London Bullion Market Association, preços de referência do ouro")]
    ),
    "iefa-etf-ishares-core-msci-eafe-guia-completo.html": (
        "https://www.ishares.com/us/products/245905/",
        "iShares Core MSCI EAFE ETF (IEFA) — página oficial BlackRock",
        "Dados quantitativos (taxa de administração: 0,07% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "iemg-etf-ishares-core-msci-emerging-markets-guia-completo.html": (
        "https://www.ishares.com/us/products/244050/",
        "iShares Core MSCI Emerging Markets ETF (IEMG) — página oficial BlackRock",
        "Dados quantitativos (taxa de administração: 0,09% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "ivlu-etf-ishares-msci-international-value-guia-completo.html": (
        "https://www.ishares.com/us/products/275404/",
        "iShares MSCI Intl Value Factor ETF (IVLU) — página oficial BlackRock",
        "Dados quantitativos (taxa de administração: 0,30% a.a., AUM, P/L, P/VP e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "ivv-etf-ishares-core-sp500-guia-completo.html": (
        "https://www.ishares.com/us/products/239726/",
        "iShares Core S&P 500 ETF (IVV) — página oficial BlackRock",
        "Dados quantitativos (taxa de administração: 0,03% a.a., AUM, P/L, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "iwf-etf-ishares-russell-1000-growth-guia-completo.html": (
        "https://www.ishares.com/us/products/239706/",
        "iShares Russell 1000 Growth ETF (IWF) — página oficial BlackRock",
        "Dados quantitativos (taxa de administração: 0,19% a.a., AUM, P/L, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "iyr-etf-ishares-us-real-estate-guia-completo.html": (
        "https://www.ishares.com/us/products/239520/",
        "iShares U.S. Real Estate ETF (IYR) — página oficial BlackRock",
        "Dados quantitativos (taxa de administração: 0,38% a.a., AUM ~US$ 3,9 bi, dividend yield ~2,3% e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "nobl-etf-proshares-sp500-dividend-aristocrats-guia-completo.html": (
        "https://www.proshares.com/our-etfs/equity/nobl",
        "ProShares S&P 500 Dividend Aristocrats ETF (NOBL) — página oficial ProShares",
        "Dados quantitativos (taxa de administração: 0,35% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "qqq-etf-invesco-nasdaq100-guia-completo.html": (
        "https://www.invesco.com/qqq-etf/en/home.html",
        "Invesco QQQ Trust (QQQ) — página oficial Invesco",
        "Dados quantitativos (taxa de administração: 0,20% a.a., AUM ~US$ 230 bi, P/L e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "rwr-etf-spdr-dow-jones-reit-guia-completo.html": (
        "https://www.ssga.com/us/en/intermediary/etfs/funds/spdr-dow-jones-reit-etf-rwr",
        "SPDR Dow Jones REIT ETF (RWR) — página oficial State Street SPDR",
        "Dados quantitativos (taxa de administração: 0,25% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "schh-etf-schwab-us-reit-guia-completo.html": (
        "https://www.schwabassetmanagement.com/products/schh",
        "Schwab U.S. REIT ETF (SCHH) — página oficial Schwab Asset Management",
        "Dados quantitativos (taxa de administração: 0,07% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "slyv-etf-spdr-sp600-small-cap-value-guia-completo.html": (
        "https://www.ssga.com/us/en/intermediary/etfs/funds/spdr-sp-600-small-cap-value-etf-slyv",
        "SPDR S&P 600 Small Cap Value ETF (SLYV) — página oficial State Street SPDR",
        "Dados quantitativos (taxa de administração: 0,15% a.a., AUM, P/VP, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "spy-etf-spdr-sp500-guia-completo.html": (
        "https://www.ssga.com/us/en/intermediary/etfs/funds/spdr-sp-500-etf-trust-spy",
        "SPDR S&P 500 ETF Trust (SPY) — página oficial State Street SPDR",
        "Dados quantitativos (taxa de administração: 0,0945% a.a., AUM ~US$ 540 bi, P/L, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "vea-etf-vanguard-mercados-desenvolvidos-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/vea",
        "Vanguard FTSE Developed Markets ETF (VEA) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,06% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "vgt-etf-vanguard-information-technology-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/vgt",
        "Vanguard Information Technology ETF (VGT) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,10% a.a., AUM, P/L e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "vlue-etf-ishares-msci-usa-value-factor-guia-completo.html": (
        "https://www.ishares.com/us/products/251616/",
        "iShares MSCI USA Value Factor ETF (VLUE) — página oficial BlackRock",
        "Dados quantitativos (taxa de administração: 0,15% a.a., AUM, P/L, P/VP e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "vnq-etf-vanguard-real-estate-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/vnq",
        "Vanguard Real Estate ETF (VNQ) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,13% a.a., AUM ~US$ 30 bi, dividend yield ~3,6% e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "voo-etf-vanguard-sp500-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/voo",
        "Vanguard S&P 500 ETF (VOO) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,03% a.a., AUM ~US$ 550 bi, P/L, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "vt-etf-vanguard-total-world-stock-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/vt",
        "Vanguard Total World Stock ETF (VT) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,07% a.a., AUM, P/L, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "vti-etf-vanguard-total-stock-market-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/vti",
        "Vanguard Total Stock Market ETF (VTI) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,03% a.a., AUM ~US$ 430 bi, P/L, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "vtv-etf-vanguard-value-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/vtv",
        "Vanguard Value ETF (VTV) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,04% a.a., AUM, P/L, P/VP, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "vwo-etf-vanguard-mercados-emergentes-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/vwo",
        "Vanguard FTSE Emerging Markets ETF (VWO) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,08% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "vxus-etf-vanguard-total-international-stock-guia-completo.html": (
        "https://investor.vanguard.com/investment-products/etfs/profile/vxus",
        "Vanguard Total International Stock ETF (VXUS) — página oficial Vanguard",
        "Dados quantitativos (taxa de administração: 0,08% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
    "xlre-etf-real-estate-select-sector-spdr-guia-completo.html": (
        "https://www.ssga.com/us/en/intermediary/etfs/funds/real-estate-select-sector-spdr-fund-xlre",
        "Real Estate Select Sector SPDR Fund (XLRE) — página oficial State Street SPDR",
        "Dados quantitativos (taxa de administração: 0,09% a.a., AUM, dividend yield e retornos históricos) com referência em <strong>maio de 2026</strong>. Consulte a página oficial do ETF para valores atualizados.",
        []
    ),
}

# ETF masterclass and thematic ETF posts (generic ETF sources)
ETF_GENERIC_POSTS = {
    "etf-masterclass-carteira-global-parte-1.html": (
        "Dados de composição de carteira, expense ratios e retornos históricos citados com referência em <strong>maio de 2026</strong>. ETFs são instrumentos dinâmicos — TER, AUM e yield mudam; verifique nas páginas oficiais dos emissores antes de investir.",
        [
            ("https://investor.vanguard.com/investment-products/etfs/profile/voo", "Vanguard S&P 500 ETF (VOO) — página oficial"),
            ("https://investor.vanguard.com/investment-products/etfs/profile/vt", "Vanguard Total World Stock ETF (VT) — página oficial"),
            ("https://investor.vanguard.com/investment-products/etfs/profile/bnd", "Vanguard Total Bond Market ETF (BND) — página oficial"),
        ]
    ),
    "etf-masterclass-carteira-global-parte-2.html": (
        "Dados de alocação, expense ratios e simulações com referência em <strong>maio de 2026</strong>. Verifique nas páginas oficiais dos emissores antes de tomar decisões de alocação.",
        [
            ("https://investor.vanguard.com/investment-products/etfs/profile/vxus", "Vanguard Total International Stock ETF (VXUS) — página oficial"),
            ("https://investor.vanguard.com/investment-products/etfs/profile/vwo", "Vanguard FTSE Emerging Markets ETF (VWO) — página oficial"),
        ]
    ),
    "etf-masterclass-carteira-global-parte-3.html": (
        "Dados de rebalanceamento, expense ratios e retornos históricos com referência em <strong>maio de 2026</strong>. Verifique nas páginas oficiais dos emissores antes de tomar decisões de investimento.",
        [
            ("https://investor.vanguard.com/investment-products/etfs/profile/vtv", "Vanguard Value ETF (VTV) — página oficial"),
            ("https://investor.vanguard.com/investment-products/etfs/profile/vgt", "Vanguard Information Technology ETF (VGT) — página oficial"),
        ]
    ),
    "etf-masterclass-carteira-global-parte-4.html": (
        "Dados de performance, correlação e simulações de carteira com referência em <strong>maio de 2026</strong>. Verifique nas páginas oficiais dos emissores antes de tomar decisões de investimento.",
        [
            ("https://www.ishares.com/us/products/239458/", "iShares Core U.S. Aggregate Bond ETF (AGG) — página oficial"),
            ("https://www.ishares.com/us/products/244050/", "iShares Core MSCI Emerging Markets ETF (IEMG) — página oficial"),
        ]
    ),
    "etfs-alocacao-global-guia-2026_CFA.html": (
        "Dados de expense ratio, AUM e retornos históricos dos ETFs citados com referência em <strong>maio de 2026</strong>. Verifique nas páginas oficiais dos emissores (Vanguard, BlackRock/iShares, SPDR) antes de investir.",
        [
            ("https://investor.vanguard.com/investment-products/etfs/profile/voo", "Vanguard S&P 500 ETF (VOO) — página oficial"),
            ("https://investor.vanguard.com/investment-products/etfs/profile/vt", "Vanguard Total World Stock ETF (VT) — página oficial"),
            ("https://investor.vanguard.com/investment-products/etfs/profile/bnd", "Vanguard Total Bond Market ETF (BND) — página oficial"),
        ]
    ),
    "etfs-como-escolher-3-para-vida-inteira.html": (
        "Dados de expense ratio e retornos dos ETFs mencionados com referência em <strong>maio de 2026</strong>. Os critérios de seleção (TER, AUM, liquidez) são estruturais e tendem a ser estáveis, mas verifique nas páginas oficiais antes de investir.",
        [
            ("https://investor.vanguard.com/investment-products/etfs/profile/voo", "Vanguard S&P 500 ETF (VOO) — página oficial"),
            ("https://investor.vanguard.com/investment-products/etfs/profile/vt", "Vanguard Total World Stock ETF (VT) — página oficial"),
            ("https://investor.vanguard.com/investment-products/etfs/profile/bnd", "Vanguard Total Bond Market ETF (BND) — página oficial"),
        ]
    ),
}

# Renda fixa and IR posts
RENDA_FIXA_POSTS = {
    "cdb-vs-lci-lca-quando-compensa.html": (
        "Simulação com <strong>Selic 14,75% a.a. e CDI ~14,65% a.a.</strong> conforme decisão do Copom de maio de 2026. A tabela de IR regressivo (22,5%→15%) e as regras de carência da Res. CMN 5.118/2023 são estruturais e vigentes na data de referência. Taxas de mercado (% CDI oferecido por bancos) variam diariamente — consulte sua corretora para cotações atualizadas.",
        [
            ("https://www.bcb.gov.br/controleinflacao/taxaselic", "Banco Central — Taxa Selic atual"),
            ("https://www.bcb.gov.br/detalhenoticia/17816/nota", "Banco Central — Comunicado Copom maio 2026"),
            ("https://www.fgc.org.br/", "FGC — Fundo Garantidor de Créditos"),
            ("https://normas.bcb.gov.br/norma/show/0/5118", "Resolução CMN 5.118/2023 — carência LCI/LCA"),
        ]
    ),
    "renda-fixa-guia-completo-2026.html": (
        "Taxas de mercado (Selic, CDI, IPCA) com referência em <strong>maio de 2026</strong> (Selic 14,75% a.a., Copom). O IPCA acumulado 12 meses é divulgado mensalmente pelo IBGE. Consulte as fontes abaixo para valores atualizados antes de investir.",
        [
            ("https://www.bcb.gov.br/controleinflacao/taxaselic", "Banco Central — Taxa Selic atual"),
            ("https://www.ibge.gov.br/explica/inflacao.php", "IBGE — Inflação (IPCA)"),
            ("https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm", "Tesouro Direto — preços e taxas em tempo real"),
            ("https://www.fgc.org.br/", "FGC — Fundo Garantidor de Créditos"),
        ]
    ),
    "renda-fixa-ir-regressivo-entenda.html": (
        "Tabela de IR regressivo vigente desde 2005 (Lei 11.033/2004): 22,5% até 180 dias, 20% de 181 a 360 dias, 17,5% de 361 a 720 dias, 15% acima de 720 dias. IOF regressivo para resgates antes de 30 dias. Essas alíquotas são estruturais e não dependem do cenário de juros — atualize a Selic/CDI de referência conforme o mercado.",
        [
            ("https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda", "Receita Federal — Meu Imposto de Renda"),
            ("https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm", "Lei 11.033/2004 — IR regressivo sobre renda fixa"),
            ("https://www.bcb.gov.br/controleinflacao/taxaselic", "Banco Central — Taxa Selic atual"),
        ]
    ),
    "renda-fixa-quando-ipca-mais-faz-sentido.html": (
        "Taxas de IPCA+ no Tesouro Direto com referência em <strong>maio de 2026</strong>. As taxas do Tesouro IPCA+ são atualizadas diariamente — consulte o site oficial do Tesouro Direto para preços em tempo real antes de comprar.",
        [
            ("https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm", "Tesouro Direto — preços e taxas em tempo real"),
            ("https://www.ibge.gov.br/explica/inflacao.php", "IBGE — Inflação (IPCA) acumulada"),
            ("https://www.bcb.gov.br/controleinflacao/taxaselic", "Banco Central — Taxa Selic atual"),
        ]
    ),
    "selic-em-queda-o-que-fazer-com-renda-fixa.html": (
        "Cenário de Selic com referência em <strong>maio de 2026</strong> (14,75% a.a., ciclo de alta encerrado com estabilidade projetada). O Copom se reúne a cada 45 dias — acompanhe as atas para atualizações de política monetária.",
        [
            ("https://www.bcb.gov.br/controleinflacao/taxaselic", "Banco Central — Taxa Selic atual"),
            ("https://www.bcb.gov.br/publicacoes/atascopom", "Banco Central — Atas do Copom"),
            ("https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm", "Tesouro Direto — preços e taxas em tempo real"),
        ]
    ),
    "tesouro-direto-para-iniciantes-guia-completo-2026.html": (
        "Taxas dos títulos do Tesouro Direto com referência em <strong>maio de 2026</strong> (Selic 14,75% a.a.; Tesouro IPCA+ com taxas reais acima de 7% a.a.). As taxas são atualizadas diariamente — consulte o simulador oficial antes de comprar.",
        [
            ("https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm", "Tesouro Direto — preços e taxas em tempo real"),
            ("https://www.tesourodireto.com.br/investindo/simulador.htm", "Tesouro Direto — Simulador oficial"),
            ("https://www.bcb.gov.br/controleinflacao/taxaselic", "Banco Central — Taxa Selic atual"),
            ("https://www.ibge.gov.br/explica/inflacao.php", "IBGE — Inflação (IPCA) acumulada"),
        ]
    ),
    "tesouro-selic-vs-cdb-liquidez-diaria.html": (
        "Comparativo com <strong>Selic 14,75% a.a.</strong> e CDI ~14,65% a.a. (maio de 2026). A taxa Selic e as ofertas de CDB com liquidez diária variam com o ciclo de juros — verifique nas fontes abaixo antes de decidir.",
        [
            ("https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm", "Tesouro Direto — preços e taxas em tempo real"),
            ("https://www.bcb.gov.br/controleinflacao/taxaselic", "Banco Central — Taxa Selic atual"),
            ("https://www.fgc.org.br/", "FGC — Fundo Garantidor de Créditos"),
        ]
    ),
    "fiis-dividend-yield-alto-armadilha.html": (
        "Dados de dividend yield de FIIs com referência em <strong>maio de 2026</strong>. O DY de FIIs muda mês a mês conforme distribuições e oscilação de cotas — consulte o portal da B3 ou sua corretora para dados atualizados.",
        [
            ("https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/fundos-de-investimentos-imobiliarios-fii.htm", "B3 — Fundos de Investimentos Imobiliários (FIIs)"),
            ("https://www.bcb.gov.br/controleinflacao/taxaselic", "Banco Central — Taxa Selic (referência para DY)"),
        ]
    ),
    "guia-institucional-de-dividendos-mitos-matematica-estrategia.html": (
        "Dados de dividend yield, payout e retorno total com referência em <strong>maio de 2026</strong>. Yields e distribuições mudam com os resultados das empresas — consulte as páginas de relações com investidores (RI) para dados atualizados.",
        [
            ("https://www.b3.com.br/pt_br/produtos-e-servicos/", "B3 — Produtos e serviços para investidores"),
            ("https://www.gov.br/cvm/pt-br", "CVM — Comissão de Valores Mobiliários"),
            ("https://www.bcb.gov.br/controleinflacao/taxaselic", "Banco Central — Taxa Selic (custo de oportunidade)"),
        ]
    ),
}

# IR posts
IR_POSTS = {
    "biblia-imposto-de-renda-investidor-parte-1.html": (
        "Regras de IR para investidores com referência em <strong>maio de 2026</strong> (ano-calendário 2025, declaração IRPF 2026). Alíquotas e deduções podem ser alteradas por legislação — consulte a Receita Federal para as normas vigentes no momento da declaração.",
        [
            ("https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda", "Receita Federal — Meu Imposto de Renda 2026"),
            ("https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm", "Lei 11.033/2004 — IR regressivo sobre aplicações financeiras"),
        ]
    ),
    "biblia-imposto-de-renda-investidor-parte-2.html": (
        "Regras de IR sobre ações e FIIs com referência em <strong>maio de 2026</strong>. Isenção de IR para vendas mensais de ações até R$20.000 (Res. CVM, Lei 11.033/2004). Confirme valores e regras na Receita Federal antes da declaração.",
        [
            ("https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda", "Receita Federal — Meu Imposto de Renda 2026"),
            ("https://www.gov.br/cvm/pt-br", "CVM — Comissão de Valores Mobiliários"),
            ("https://www.b3.com.br/pt_br/produtos-e-servicos/", "B3 — Informe de rendimentos"),
        ]
    ),
    "biblia-imposto-de-renda-investidor-parte-3.html": (
        "Regras de IR sobre FIIs, renda fixa e fundos com referência em <strong>maio de 2026</strong>. Confirme alíquotas e isenções na Receita Federal antes da declaração do IRPF 2026.",
        [
            ("https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda", "Receita Federal — Meu Imposto de Renda 2026"),
            ("https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm", "Lei 11.033/2004 — IR regressivo sobre aplicações financeiras"),
        ]
    ),
    "biblia-imposto-de-renda-investidor-parte-4.html": (
        "Regras de IR sobre BDRs, ETFs e ativos internacionais com referência em <strong>maio de 2026</strong>. Tributação de ativos no exterior é área de atualização frequente — confirme na Receita Federal e consulte um contador especializado.",
        [
            ("https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda", "Receita Federal — Meu Imposto de Renda 2026"),
            ("https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/agosto/receita-federal-regulamenta-tributacao-de-fundos-offshores-e-trusts", "Receita Federal — Tributação de ativos no exterior"),
            ("https://www.irs.gov/individuals/international-taxpayers/nonresident-aliens", "IRS — Nonresident aliens (withholding tax EUA)"),
        ]
    ),
    "como-declarar-acoes-imposto-de-renda-2026.html": (
        "Guia para declaração IRPF <strong>2026</strong> (ano-calendário 2025). Prazos e regras de declaração são definidos anualmente pela Receita Federal — confirme o calendário oficial antes de declarar.",
        [
            ("https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda", "Receita Federal — Meu Imposto de Renda 2026"),
            ("https://www.b3.com.br/pt_br/produtos-e-servicos/", "B3 — Informe de rendimentos de ações e FIIs"),
            ("https://www.gov.br/cvm/pt-br", "CVM — Comissão de Valores Mobiliários"),
        ]
    ),
}


def make_data_referencia_html(text):
    return (
        f'<p class="data-referencia" style="background:#f0f7ff;border-left:3px solid #2563eb;'
        f'padding:0.75rem 1rem;border-radius:4px;font-size:0.9rem;margin-bottom:1rem;">'
        f'<strong>Data de referência:</strong> {text}'
        f'</p>'
    )


def make_specific_source_li(url, label):
    return f'<li><a href="{url}" target="_blank" rel="noopener">{label}</a></li>'


def process_etf_product_post(filepath, product_url, product_label, data_ref_text, extra_sources):
    """Replace generic provider link with specific product page + add data referencia."""
    with open(filepath, encoding="utf-8") as f:
        html = f.read()

    if 'data-referencia' in html:
        print(f"  SKIP (already has data-referencia): {os.path.basename(filepath)}")
        return False

    # Build the data de referencia paragraph
    data_ref_html = make_data_referencia_html(data_ref_text)

    # Build specific product page li
    specific_li = make_specific_source_li(product_url, product_label)

    # Build extra sources lis
    extra_lis = "\n".join(make_specific_source_li(u, l) for u, l in extra_sources)

    # Insert data-referencia after sources-note paragraph
    # Pattern: <p class="sources-note">...</p>
    sources_note_pattern = r'(<p class="sources-note">[^<]*(?:<[^/][^>]*>[^<]*</[^>]+>[^<]*)*</p>)'

    def insert_after_note(m):
        return m.group(0) + "\n" + data_ref_html

    html_new = re.sub(sources_note_pattern, insert_after_note, html, count=1)

    if html_new == html:
        # Fallback: try simpler insertion after <p class="sources-note">...</p>
        html_new = html.replace(
            '<p class="sources-note">',
            data_ref_html + '\n<p class="sources-note">',
            1
        )

    # Replace generic provider link with specific product page
    # Common generic patterns:
    generic_patterns = [
        # iShares generic
        ('https://www.ishares.com/us/products/etf-investments', 'BlackRock/iShares — informações oficiais de ETFs'),
        # Vanguard generic
        ('https://investor.vanguard.com/investment-products/etfs', 'Vanguard — informações oficiais de ETFs'),
        # SPDR generic
        ('https://www.ssga.com/us/en/intermediary/etfs"', 'SPDR/State Street Global Advisors — informações oficiais de ETFs'),
        # Schwab generic
        ('https://www.schwabassetmanagement.com/products/etfs', 'Schwab Asset Management — informações oficiais de ETFs'),
        # ProShares generic
        ('https://www.proshares.com/our-etfs"', 'ProShares — informações oficiais de ETFs'),
        # WisdomTree generic
        ('https://www.wisdomtree.com/investments/etfs"', 'WisdomTree — informações oficiais de ETFs'),
        # SPDR Gold
        ('https://www.spdrgoldshares.com/usa/"', 'SPDR Gold Shares (GLD) — página oficial SPDR/State Street'),
    ]

    for old_url, old_label in generic_patterns:
        if old_url in html_new:
            # Replace the whole <li><a href="OLD_URL"...>OLD_LABEL</a></li>
            old_li_pattern = rf'<li><a href="{re.escape(old_url)}"[^>]*>[^<]*</a></li>'
            html_new = re.sub(old_li_pattern, specific_li, html_new, count=1)
            break

    # If specific URL already in the file (e.g. QQQ which has specific URL), just add ref date
    # and add the specific li if not already there
    if product_url not in html_new:
        # Add specific li as first item in the <ul>
        html_new = html_new.replace('<ul>\n<li>', f'<ul>\n{specific_li}\n<li>', 1)

    # Add extra sources before </ul> in sources-section
    if extra_lis and '</ul>' in html_new:
        # Find the sources-section ul and append before its closing tag
        # Simple approach: find sources-section, then its </ul>
        sec_start = html_new.find('class="sources-section"')
        if sec_start != -1:
            ul_end = html_new.find('</ul>', sec_start)
            if ul_end != -1:
                html_new = html_new[:ul_end] + extra_lis + "\n" + html_new[ul_end:]

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_new)

    print(f"  OK: {os.path.basename(filepath)}")
    return True


def process_generic_etf_post(filepath, data_ref_text, extra_sources):
    """Add data-referencia + extra sources to ETF masterclass/thematic posts."""
    with open(filepath, encoding="utf-8") as f:
        html = f.read()

    if 'data-referencia' in html:
        print(f"  SKIP (already has data-referencia): {os.path.basename(filepath)}")
        return False

    data_ref_html = make_data_referencia_html(data_ref_text)
    extra_lis = "\n".join(make_specific_source_li(u, l) for u, l in extra_sources)

    # Insert after sources-note
    html_new = html.replace(
        '<p class="sources-note">',
        data_ref_html + '\n<p class="sources-note">',
        1
    )

    # Add extra sources
    if extra_lis:
        sec_start = html_new.find('class="sources-section"')
        if sec_start != -1:
            ul_end = html_new.find('</ul>', sec_start)
            if ul_end != -1:
                html_new = html_new[:ul_end] + extra_lis + "\n" + html_new[ul_end:]

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_new)

    print(f"  OK: {os.path.basename(filepath)}")
    return True


def process_renda_fixa_ir_post(filepath, data_ref_text, extra_sources):
    """Add data-referencia + specific sources to renda fixa/IR posts."""
    with open(filepath, encoding="utf-8") as f:
        html = f.read()

    if 'data-referencia' in html:
        print(f"  SKIP (already has data-referencia): {os.path.basename(filepath)}")
        return False

    data_ref_html = make_data_referencia_html(data_ref_text)
    extra_lis = "\n".join(make_specific_source_li(u, l) for u, l in extra_sources)

    html_new = html.replace(
        '<p class="sources-note">',
        data_ref_html + '\n<p class="sources-note">',
        1
    )

    # Add extra sources before </ul> in sources-section
    if extra_lis:
        sec_start = html_new.find('class="sources-section"')
        if sec_start != -1:
            ul_end = html_new.find('</ul>', sec_start)
            if ul_end != -1:
                html_new = html_new[:ul_end] + extra_lis + "\n" + html_new[ul_end:]

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_new)

    print(f"  OK: {os.path.basename(filepath)}")
    return True


def main():
    changed = 0

    print("\n=== ETF product-specific posts ===")
    for filename, (product_url, product_label, data_ref_text, extra_sources) in ETF_PRODUCT_PAGES.items():
        filepath = os.path.join(POSTS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  MISSING: {filename}")
            continue
        if process_etf_product_post(filepath, product_url, product_label, data_ref_text, extra_sources):
            changed += 1

    print("\n=== ETF masterclass/thematic posts ===")
    for filename, (data_ref_text, extra_sources) in ETF_GENERIC_POSTS.items():
        filepath = os.path.join(POSTS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  MISSING: {filename}")
            continue
        if process_generic_etf_post(filepath, data_ref_text, extra_sources):
            changed += 1

    print("\n=== Renda fixa / IR posts ===")
    for filename, (data_ref_text, extra_sources) in {**RENDA_FIXA_POSTS, **IR_POSTS}.items():
        filepath = os.path.join(POSTS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  MISSING: {filename}")
            continue
        if process_renda_fixa_ir_post(filepath, data_ref_text, extra_sources):
            changed += 1

    print(f"\nTotal files modified: {changed}")


if __name__ == "__main__":
    main()

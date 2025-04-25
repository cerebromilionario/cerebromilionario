// Arquivo para gerenciar anúncios AdSense
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os anúncios AdSense
    initializeAdsense();
});

// Função para inicializar os anúncios AdSense
function initializeAdsense() {
    // Insere anúncios em posições estratégicas
    insertInContentAds();
    
    // Adiciona classe de destaque aos contêineres de anúncios
    highlightAdContainers();
    
    // Verifica se há bloqueadores de anúncios
    detectAdBlockers();
}

// Função para inserir anúncios dentro do conteúdo
function insertInContentAds() {
    // Verifica se estamos em uma página de post
    const postContent = document.querySelector('.post-content');
    if (!postContent) return;
    
    // Seleciona parágrafos para inserir anúncios
    const paragraphs = postContent.querySelectorAll('p');
    if (paragraphs.length < 4) return;
    
    // Insere anúncios após o 4º parágrafo e depois a cada 6 parágrafos
    for (let i = 4; i < paragraphs.length; i += 6) {
        if (paragraphs[i]) {
            const adContainer = createAdContainer('in-content');
            paragraphs[i].parentNode.insertBefore(adContainer, paragraphs[i].nextSibling);
        }
    }
}

// Função para criar um contêiner de anúncio
function createAdContainer(type) {
    const container = document.createElement('div');
    container.className = `ad-container ad-container-${type}`;
    
    const label = document.createElement('div');
    label.className = 'ad-label';
    label.textContent = 'Publicidade';
    
    const adSlot = document.createElement('div');
    adSlot.className = 'ad-slot';
    adSlot.innerHTML = `
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
             data-ad-slot="xxxxxxxxxx"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    `;
    
    container.appendChild(label);
    container.appendChild(adSlot);
    
    return container;
}

// Função para adicionar classe de destaque aos contêineres de anúncios
function highlightAdContainers() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        container.classList.add('ad-container-highlighted');
    });
}

// Função para detectar bloqueadores de anúncios
function detectAdBlockers() {
    setTimeout(function() {
        const adElements = document.querySelectorAll('.adsbygoogle');
        let adsBlocked = true;
        
        for (let i = 0; i < adElements.length; i++) {
            if (adElements[i].clientHeight > 0) {
                adsBlocked = false;
                break;
            }
        }
        
        if (adsBlocked) {
            showAdBlockerMessage();
        }
    }, 2000);
}

// Função para mostrar mensagem sobre bloqueador de anúncios
function showAdBlockerMessage() {
    const adBlockMessage = document.createElement('div');
    adBlockMessage.className = 'ad-block-message';
    adBlockMessage.innerHTML = `
        <div class="ad-block-container">
            <h3>Bloqueador de anúncios detectado</h3>
            <p>Nosso conteúdo é gratuito e dependemos de anúncios para manter o site. Por favor, considere desativar seu bloqueador de anúncios para nos apoiar.</p>
            <button class="ad-block-close">Entendi</button>
        </div>
    `;
    
    document.body.appendChild(adBlockMessage);
    
    // Adiciona evento para fechar a mensagem
    const closeButton = adBlockMessage.querySelector('.ad-block-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            adBlockMessage.style.display = 'none';
        });
    }
}

// Função para criar anúncios nativos
function createNativeAd(title, description, imageUrl, linkUrl) {
    const nativeAd = document.createElement('div');
    nativeAd.className = 'native-ad-card';
    
    nativeAd.innerHTML = `
        <div class="native-ad-image">
            <img src="${imageUrl}" alt="${title}">
        </div>
        <div class="native-ad-content">
            <div class="native-ad-label">Publicidade</div>
            <h3 class="native-ad-title">${title}</h3>
            <p class="native-ad-description">${description}</p>
            <a href="${linkUrl}" class="native-ad-cta" target="_blank">Saiba mais</a>
        </div>
    `;
    
    return nativeAd;
}

// Função para inserir anúncios nativos
function insertNativeAds() {
    const nativeAdContainer = document.querySelector('.native-ad-container');
    if (!nativeAdContainer) return;
    
    // Exemplo de anúncios nativos (em produção, estes viriam de uma API ou do AdSense)
    const nativeAdsData = [
        {
            title: 'Aprenda a investir com segurança',
            description: 'Curso completo sobre investimentos para iniciantes. Comece sua jornada financeira hoje mesmo!',
            imageUrl: '../images/plant-coins.webp',
            linkUrl: '#curso-investimentos'
        },
        {
            title: 'Planejamento financeiro personalizado',
            description: 'Consultoria especializada para organizar suas finanças e alcançar seus objetivos.',
            imageUrl: '../images/financial-analysis.jpeg',
            linkUrl: '#consultoria-financeira'
        }
    ];
    
    // Cria e insere os anúncios nativos
    nativeAdsData.forEach(adData => {
        const nativeAd = createNativeAd(
            adData.title,
            adData.description,
            adData.imageUrl,
            adData.linkUrl
        );
        
        nativeAdContainer.appendChild(nativeAd);
    });
}

# Relatório técnico — SEO, indexação e AdSense

Data da auditoria: 2026-05-08  
Site: https://cerebromilionario.site/

## Diagnóstico inicial

- **Stack:** site estático em HTML, CSS e JavaScript, publicado diretamente pela raiz do repositório via Netlify.
- **Build:** o comando de build configurado é `python3 scripts/seo_build.py`, que valida metadados e gera `sitemap.xml`.
- **Páginas estáticas:** ficam na raiz do projeto (`index.html`, `blog.html`, `ferramentas.html`, páginas institucionais e ferramentas).
- **Posts:** ficam em `posts/*.html`, com índice de metadados em `posts/posts.json`.
- **Ferramentas:** ficam como HTML na raiz e JS específico em `js/`.
- **Sitemap:** era gerado automaticamente a partir de quase todas as páginas HTML indexáveis, incluindo volume alto de posts e uma página `noindex`.
- **Canonical:** a maioria das páginas possui canonical limpo, sem `.html`; aliases apontam para a URL canônica correta.
- **Header/footer:** aplicados diretamente nos HTMLs estáticos, com navegação principal e links de rodapé.
- **URLs limpas vs `.html`:** o padrão público é URL limpa; canonicals apontam para URLs sem `.html`. Não há links internos quebrados detectados.
- **Risco principal encontrado:** sitemap muito amplo para o momento de recuperação/AdSense, com posts seriados/repetitivos e página `obrigado` `noindex` no sitemap.

## Correções aplicadas

1. O gerador de sitemap passou a publicar somente URLs canônicas, indexáveis e selecionadas por prioridade editorial.
2. O sitemap foi reduzido para 72 URLs: páginas institucionais/ferramentas principais + 50 posts mais fortes, excluindo posts seriados `-parte-` e aliases.
3. Páginas `noindex` e aliases não canônicos foram removidos do sitemap gerado.
4. Aliases diretos (`privacy-policy.html`, `politica-de-privacidade.html`, `calculadora-juros-compostos.html`, `simulador-aposentadoria.html`) passaram a usar `noindex, follow` para evitar duplicidade se acessados com `.html`.
5. Páginas que não tinham `meta robots` receberam `index, follow`.
6. A meta `google-adsense-account` foi adicionada às páginas HTML que ainda não a tinham.
7. A descrição Open Graph/Twitter da página de comunidade foi corrigida para não reutilizar texto de calculadora.
8. A validação de SEO agora também acusa ausência de `meta robots`.

## Resultado esperado

- Melhor alinhamento entre sitemap, canonical e páginas realmente prioritárias.
- Menos sinais de conteúdo em lote para o Google durante a fase de recuperação de indexação.
- Menor risco de duplicidade por aliases e URLs alternativas.
- Sinais mais consistentes para aprovação/verificação do AdSense.

## Verificações executadas

- `python3 scripts/seo_build.py --root .`
- `python3 scripts/seo_build.py --root . --strict`
- `python3 scripts/check_internal_links.py --root .`
- `python3 scripts/check_posts_index.py posts/posts.json`

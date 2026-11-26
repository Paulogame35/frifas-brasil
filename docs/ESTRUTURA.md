# Estrutura do projeto FRIFAS BRASIL

## Organização atual

O site é publicado como um projeto estático no GitHub Pages. Por compatibilidade, as páginas HTML e alguns arquivos CSS/JavaScript compartilhados permanecem na raiz: mover tudo de uma vez quebraria caminhos relativos usados por matérias antigas, imagens, links e módulos.

## Convenções para novas alterações

- `assets/img/`: imagens e artes locais do portal.
- `firebase/`: configuração e regras do Firebase/Firestore.
- `tests/`: verificações automatizadas de links, interface, autenticação, chat e campeonatos.
- `.github/workflows/`: validação e publicação contínua.
- `docs/`: documentação técnica e decisões de organização.
- CSS global: `style.css`, `home-polish.css`, `mobile-ux.css` e `app-sidebar.css`.
- CSS de áreas específicas: `auth.css` e `perfil.css`.
- JavaScript compartilhado: `script.js`; módulos de recursos específicos ficam em arquivos separados.

## Regras de manutenção

1. Não mover nem renomear páginas/recursos sem atualizar todos os links, canonicals, sitemap e testes na mesma alteração.
2. Não duplicar cabeçalho ou navegação; o menu comum é normalizado pelo `script.js`.
3. Não inserir estilos extensos em novas páginas; preferir as folhas globais ou uma folha específica de componente.
4. Toda página pública precisa de título, descrição, canonical correto, navegação funcional e layout responsivo.
5. Imagens editoriais devem ser locais, ter texto alternativo e dimensões declaradas quando possível.
6. Não remover recursos de conta, comunidade, moderação ou campeonatos sem decisão explícita.
7. Rodar os testes de links/mídia, JavaScript, editorial, autenticação, chat, perfil, eventos e responsividade antes de publicar.

## Camada visual v5

`site-design.css` concentra os ajustes transversais de tipografia, espaçamento, cartões, formulários, artigos, rodapé e responsividade. Ela é carregada pelo runtime comum com versão de cache própria para evitar que uma página fique com o estilo antigo após uma atualização.

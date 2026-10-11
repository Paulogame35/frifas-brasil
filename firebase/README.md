# Proteção do chat — FRIFAS BRASIL

## Ativação

1. Publique a versão de `comunidade.html` deste mesmo commit e confirme que ela contém `sendMessage` e `writeBatch`.
2. No Firebase, projeto `freefas-d0a9e`, abra Firestore Database → Regras.
3. Guarde uma cópia das regras atuais. Substitua o conteúdo pelo arquivo `firestore.rules` desta pasta e publique.
4. Recarregue o chat. Contas já autenticadas precisam recarregar para ver Denunciar.
5. Confirme um envio e consulte as denúncias no console em `chatReports/{messageId}/reporters/{uid}`. A consulta pelo SDK só é permitida ao UID do dono; acesso administrativo no console continua sujeito ao IAM.

O frontend reconhece as regras antigas pela negação de leitura do documento privado `chatLimits/{uid}`. Com as regras novas, envia mensagem e controle de intervalo no mesmo lote. Se esse lote falhar, não tenta envio legado. Abas antigas precisam ser recarregadas após a ativação.

## Comportamento

- Mensagens públicas, perfis privados, exclusão somente pelo autor ou dono.
- Intervalo mínimo de cinco segundos por UID no servidor, inclusive entre abas.
- Cada lote cria uma única mensagem junto com seu registro de intervalo.
- Foto da mensagem limitada a 300.000 caracteres, compatível com o editor de perfil.
- Uma denúncia por UID e mensagem, intervalo de 30 segundos entre denúncias.
- Denúncias não são públicas, não podem ser editadas e não provocam punição automática.
- As regras existentes de perfis e editorial foram preservadas.

## Limites

Não substitui proteção contra criação massiva de contas, App Check ou moderação humana. A leitura pública do chat permanece como no site atual. Denúncias guardam referência e motivo, não uma cópia do texto; após uma exclusão, o conteúdo original pode não estar mais disponível. Não há aviso automático ao moderador; ele consulta as denúncias no Firebase. Documentos de intervalo não podem ser apagados pelo cliente, pois isso permitiria reiniciar o limite.

As leituras auxiliares das regras e o documento adicional por envio entram no uso do Firestore.

## Testes locais

Instale Firebase CLI, `firebase` e `@firebase/rules-unit-testing` em um ambiente de desenvolvimento. Execute a partir da raiz:

```
firebase emulators:exec --only firestore --project demo-frifas --config firebase/firebase.json 'node firebase/rules-test.cjs'
```

Use apenas o projeto fictício `demo-frifas` no emulador. O teste não escreve em produção.

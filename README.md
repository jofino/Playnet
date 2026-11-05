# Playnet

Aplicativo mobile construído com [Expo](https://expo.dev) (SDK 57), React Native e
TypeScript, usando o template padrão do `create-expo-app`.

## Stack

| Peça | Versão |
|---|---|
| Expo SDK | 57 |
| React Native | 0.86.3 |
| React | 19.2.3 |
| TypeScript | 6.0 (modo `strict`) |
| Navegação | [expo-router](https://docs.expo.dev/router/introduction) (baseada em arquivos, com rotas tipadas) |

## Pré-requisitos

- **Node.js 20 ou superior** (`node --version`)
- O app **Expo Go** instalado no celular:
  - [Android — Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS — App Store](https://apps.apple.com/app/expo-go/id982107779)

## Instalação

```bash
npm install
```

## Rodando no Expo Go

1. Suba o servidor de desenvolvimento:

   ```bash
   npx expo start
   ```

2. Um **QR code** aparece no terminal.

   - **Android:** abra o Expo Go e use a opção *Scan QR code*.
   - **iOS:** aponte a **câmera** do sistema para o QR code e toque na notificação.

3. O celular e o computador precisam estar na **mesma rede Wi-Fi**. Se não estiverem, ou se
   a rede bloquear a conexão (Wi-Fi corporativo, universitário, etc.), use o modo túnel:

   ```bash
   npx expo start --tunnel
   ```

O Expo Go da loja roda apenas o SDK mais recente. Como este projeto está no SDK 57 (o atual),
ele abre direto, sem build nativo.

### Atalhos no terminal do Metro

| Tecla | Ação |
|---|---|
| `a` | abrir no emulador Android |
| `i` | abrir no simulador iOS (requer macOS) |
| `w` | abrir no navegador |
| `r` | recarregar o app |
| `j` | abrir o debugger |
| `Ctrl+C` | encerrar o servidor |

## Estrutura

```
src/
  app/            # rotas (expo-router) — cada arquivo vira uma tela
    _layout.tsx   # layout raiz, define a navegação por abas
    index.tsx     # tela inicial  →  rota "/"
    explore.tsx   # segunda aba   →  rota "/explore"
  components/     # componentes reutilizáveis
  constants/      # tema (cores, fontes)
  hooks/          # hooks customizados
  global.css
assets/           # imagens, ícones e splash screen
scripts/          # utilitários de manutenção do projeto
app.json          # configuração do app (nome, ícone, plugins, scheme)
```

O alias `@/` aponta para `src/`, e `@/assets/` para `assets/` — configurado em
[`tsconfig.json`](tsconfig.json).

Arquivos com sufixo `.web.tsx` são variantes específicas para web; o bundler escolhe a
versão certa por plataforma automaticamente.

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | inicia o servidor de desenvolvimento |
| `npm run android` | inicia e abre no emulador/dispositivo Android |
| `npm run ios` | inicia e abre no simulador iOS (requer macOS) |
| `npm run web` | inicia e abre no navegador |
| `npm run lint` | roda o linter |
| `npm run reset-project` | move o código de exemplo para `app-example/` e cria um `src/app` limpo |

Para checar os tipos sem gerar build:

```bash
npx tsc --noEmit
```

## Observações

- `expo-env.d.ts` e `.expo/` são gerados automaticamente no primeiro `npx expo start` e não
  são versionados.
- As pastas `ios/` e `android/` não existem: este é um projeto gerenciado pelo Expo. Elas só
  são criadas se você rodar `npx expo prebuild`.

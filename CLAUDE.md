@AGENTS.md

## Playnet: contexto do projeto
- App mobile de matchmaking para esportes de rede
- Desenvolvedor único, vibe coding com Claude Code.
- Stack: Expo (SDK 58) com expo-router, React Native, TypeScript estrito, Supabase (projeto na região sa-east-1). Testado no Expo Go; development build só quando entrarem Google Maps e login com Google.
- Interface sempre em português do Brasil. Identidade visual: laranja e branco; reutilize os componentes e cores existentes em src/components em vez de criar novos estilos.
- Abas, da esquerda para a direita: Loja, Comunidade, Jogar, Ranking, Perfil.

## Estrutura
- Telas em src/app (expo-router), componentes em src/components, utilitários em src/utils, cliente do Supabase e autenticação em src/lib.
- Migrations SQL em supabase/migrations/. Eu executo o SQL manualmente no Supabase; nunca tente executá-lo por conta própria.
- app.json usa web.output "static": acesso a AsyncStorage ou window só dentro de efeitos ou handlers. A exceção é a checagem `typeof window` em src/lib/supabase.ts, necessária porque o createClient lê o storage ao ser criado.

## Como trabalhar
- Antes de implementar, liste suas suposições. Se algo for ambíguo, pare e pergunte.
- Faça o mínimo necessário para o pedido. Não adicione funcionalidades, bibliotecas ou abstrações que não foram pedidas.
- Altere apenas o que a mudança exige. Não apague nem reescreva código que você não entendeu; pergunte antes.
- Para bugs: reproduza primeiro (teste ou passos claros), depois corrija e confirme.
- Ao terminar, rode npx tsc --noEmit e liste os arquivos criados e alterados.
- Não faça commit nem push, a menos que eu peça.

## Segurança
- Nunca commitar arquivos .env*, exceto o .env.example, que fica sem valores. Variáveis ficam em .env.local (EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_KEY).
- Nunca usar a chave secret/service_role no app nem em arquivos do repositório.
- Toda tabela nova deve ter RLS ativado e policies explícitas, nunca políticas abertas sem comentário explicando que são temporárias.
- Toda tabela e sequência nova deve revogar explicitamente os privilégios de anon e authenticated, e toda função nova deve revogar de public, anon e authenticated. Depois, conceder só o necessário, sem confiar nos privilégios padrão do Supabase.

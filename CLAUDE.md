# CLAUDE.md — App de Estudos "Pomodoro BB"

## Contexto do projeto

Este é um aplicativo web pessoal para apoiar os estudos de um usuário que está se
preparando para o **concurso do Banco do Brasil (cargo Escriturário)**. O app deve
funcionar como uma central de estudos: cronômetro Pomodoro + organização do
cronograma semanal + acompanhamento de questões e revisões.

Uso pessoal (uma pessoa só), mas o código deve ser limpo e organizado como se
pudesse, no futuro, virar um produto para outros concurseiros.

## Stack sugerida

- **Next.js 14+ (App Router) com TypeScript**
- **TailwindCSS** para estilo
- **LocalStorage / IndexedDB** para persistência dos dados (não precisa de backend
  nem banco de dados nessa primeira fase — é um app pessoal rodando no navegador)
- **PWA (Progressive Web App)**: manifest + service worker, para poder ser
  "instalado" na tela inicial do celular e usado como app nativo
- Deploy futuro na Vercel (mesma stack já usada em outro projeto do usuário)

Se o Claude Code avaliar que outra biblioteca resolve melhor algum ponto
específico (ex: `use-sound`, `date-fns`, `recharts` para gráficos), pode sugerir,
mas mantendo a stack principal acima.

## Funcionalidades obrigatórias

### 1. Cronômetro Pomodoro

- Ciclo configurável: tempo de foco (padrão 25 min), pausa curta (padrão 5 min) e
  pausa longa (padrão 15–30 min) a cada X ciclos (padrão a cada 4 pomodoros)
- Usuário deve poder editar esses tempos livremente nas configurações
- Timer visual grande e claro (ex: círculo de progresso), com play/pause/reset
- Contador de "pomodoros completados" no dia

### 2. Alertas sonoros

- Som distinto ao **finalizar o tempo de estudo** (avisando que é hora da pausa)
- Som distinto ao **finalizar o tempo de descanso** (avisando que é hora de voltar
  a estudar)
- Usar a Web Audio API ou arquivos de áudio curtos (sem depender de download de
  terceiros pesados)
- Também disparar uma **notificação do navegador** (Notification API) quando a
  aba estiver em segundo plano, para o usuário não perder o aviso

### 3. Cronograma semanal de estudos

- Uma visão de semana (segunda a domingo) onde o usuário monta blocos de estudo:
  matéria, horário previsto e duração
- Deve ser editável (criar, editar, apagar blocos)
- Ideal marcar visualmente o que já foi cumprido no dia vs. o que está pendente

### 4. Matéria do dia / sessão de estudo

- Ao iniciar um pomodoro, o usuário pode indicar qual matéria/assunto está
  estudando naquele bloco (ex: "Matemática Financeira — juros compostos")
- Campo de anotação rápida ao final da sessão (o que foi estudado, dificuldades,
  pontos a revisar)

### 5. Questões

- Área para registrar questões resolvidas por matéria: total de questões, acertos
  e erros
- Cálculo automático de taxa de acerto por matéria
- Possibilidade de marcar uma questão como "revisar depois" (útil para os erros)

### 6. Revisões (repetição espaçada)

- Quando o usuário registra que estudou uma matéria, o sistema sugere
  automaticamente datas de revisão (ex: 1 dia, 7 dias e 30 dias depois — lógica
  de repetição espaçada simples)
- Uma tela de "Revisões de hoje" mostrando o que precisa ser revisado no dia

### 7. Dashboard / estatísticas

- Total de horas estudadas (geral e por matéria)
- Gráfico simples de evolução (dias estudados, pomodoros por dia)
- Streak de dias seguidos estudando, como reforço motivacional

## Funcionalidades extras sugeridas pelo Claude (não citadas pelo usuário, mas relevantes)

- **Metas diárias/semanais** de horas ou pomodoros, com barra de progresso
- **Modo escuro**, já que o app provavelmente será usado à noite após o trabalho
- **Exportar/importar dados** em JSON, como backup manual (já que os dados ficam
  só no navegador)
- **Modo "não perturbe" visual**: enquanto o timer de foco está rodando, esconder
  distrações da tela
- **Histórico/calendário de estudos** (visão tipo "heatmap" no estilo GitHub,
  mostrando dias com mais ou menos estudo)
- Título da aba do navegador mudando dinamicamente com o tempo restante (ex:
  "23:45 — Estudando"), útil quando o usuário está em outra aba

## Estrutura de telas sugerida

1. **Início / Timer** — cronômetro Pomodoro + matéria atual + botão de iniciar
2. **Cronograma semanal** — grade da semana com os blocos de estudo
3. **Questões** — registro e histórico de questões por matéria
4. **Revisões** — lista de revisões pendentes/agendadas
5. **Dashboard** — estatísticas gerais e gráficos
6. **Configurações** — tempos do Pomodoro, sons, metas, exportar/importar dados

## Diretrizes de código

- TypeScript em modo estrito, tipos explícitos para os dados (sessões de estudo,
  matérias, questões, revisões)
- Componentização clara (evitar componentes gigantes; separar lógica do
  cronômetro em um hook próprio, ex: `useTimer`)
- Persistência centralizada em um único módulo (ex: `lib/storage.ts`), para
  facilitar trocar de LocalStorage para um banco de dados no futuro
- Responsivo mobile-first, já que o uso principal deve ser pelo celular
- Comentários em português nas partes mais importantes da lógica

## Roadmap sugerido de desenvolvimento

1. Setup do projeto (Next.js + TS + Tailwind + estrutura de pastas)
2. Cronômetro Pomodoro funcional (sem persistência ainda) + sons de alerta
3. Persistência local dos dados (sessões, matérias)
4. Cronograma semanal
5. Questões e taxa de acerto
6. Sistema de revisões espaçadas
7. Dashboard e estatísticas
8. PWA (manifest, ícones, funcionamento offline básico)
9. Revisão geral, responsividade e ajustes finais

Ao trabalhar neste projeto, siga o roadmap por fases, entregando cada etapa
funcional antes de avançar para a próxima, e pergunte ao usuário sempre que uma
decisão de design ou funcionalidade não estiver clara neste documento.

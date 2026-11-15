# Mirai — landing page de lançamento

Página de vendas do Mirai para o corretor Ailton Souto (CRECI 7536F).
Site estático: HTML, CSS e JavaScript puro, sem etapa de build.

## Como abrir no VS Code

1. Abra esta pasta no VS Code (`Arquivo > Abrir pasta`).
2. Instale a extensão recomendada **Live Server** (o VS Code sugere sozinho).
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

Também funciona abrindo o `index.html` direto no navegador.

## O que editar

Tudo que muda fica em **`js/config.js`**:

| Campo | O que é |
| --- | --- |
| `corretor.whatsapp` | Número com DDI e DDD, só dígitos (ex.: `5583999998888`) |
| `corretor.foto` | Caminho da foto (ex.: `assets/img/ailton.jpg`) |
| `corretor.texto` | Texto de apresentação |
| `mensagemWhatsApp` | Mensagem que chega pronta na conversa |
| `simulador.valorImovel` | Valor de referência do apartamento (**provisório**) |
| `simulador.taxaAnual`, `prazoMeses` | Condições do financiamento (**provisórias**) |

## Estrutura

```
index.html        página
css/style.css     visual (paleta no topo do arquivo)
js/config.js      dados do corretor e do simulador
js/main.js        animação por scroll, simulador e links do WhatsApp
assets/img/       imagens do empreendimento
assets/fonts/     fontes (Unbounded e Instrument Sans)
```

## Como a animação funciona

A seção `#filme` tem 10 telas de altura e um palco fixo. A posição do scroll
(0 a 1) dirige a câmera em `desenhar()` no `main.js`:

- 0 a 0,33: zoom na fachada até atravessar a varanda acesa;
- 0,33 a 1: os três cômodos são paredes de um cubo visto por dentro, e a câmera
  gira 90° de um para o outro (living, cozinha, suíte).

Os pontos de foco do zoom são `FOCO_1` e `FOCO_2`; os tempos das legendas estão
nos atributos `data-de` e `data-ate` do `index.html`.

## Publicar no GitHub Pages

Depois de enviar para o GitHub: `Settings > Pages > Branch: main / (root)`.

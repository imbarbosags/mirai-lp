(function () {
  "use strict";

  var CFG = window.MIRAI_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var norm = function (v, a, b) { return clamp((v - a) / (b - a), 0, 1); };
  var suave = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var saida = function (t) { return 1 - Math.pow(1 - t, 3); };
  var entrada = function (t) { return t * t * t; };
  var RAD = Math.PI / 180;

  var menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =====================================================
     WHATSAPP
     ===================================================== */
  var cor = CFG.corretor || {};
  var msg = CFG.mensagemWhatsApp || "";
  var numero = String(cor.whatsapp || "").replace(/\D/g, "");
  var linkWhats = "https://wa.me/" + numero + "?text=" + encodeURIComponent(msg);
  $$(".js-whats").forEach(function (a) { a.href = linkWhats; });

  /* =====================================================
     CORRETOR
     ===================================================== */
  if (cor.nome) $("#corNome").textContent = cor.nome;
  if (cor.titulo) $("#corTitulo").textContent = cor.titulo;
  if (cor.creci) $("#corCreci").textContent = cor.creci;
  $("#corTexto").textContent = cor.texto || "";
  $("#corMsg").textContent = msg;
  if (cor.nome) {
    $("#corIniciais").textContent = cor.nome.split(/\s+/).map(function (n) { return n[0]; }).slice(0, 2).join("").toUpperCase();
  }
  if (cor.foto) {
    var foto = $("#corFoto");
    foto.style.backgroundImage = "url('" + cor.foto + "')";
    foto.classList.add("com-foto");
    foto.setAttribute("role", "img");
    foto.setAttribute("aria-label", "Foto de " + (cor.nome || "corretor"));
  }

  /* =====================================================
     FILME — a posição do scroll (0 a 1) dirige a câmera
     ===================================================== */
  var filme = $("#filme");
  var palco = $("#palco");
  var fachada = $("#fachada");
  var perto = $("#fachadaPerto");
  var cena = $("#cena");
  var cubo = $("#cubo");
  var paredes = $$(".parede");
  var luz = $("#luz");
  var legendas = $$(".legenda").map(function (el) {
    return { el: el, de: parseFloat(el.dataset.de), ate: parseFloat(el.dataset.ate) };
  });
  var marcos = $$("#trilho li").map(function (el) {
    return { el: el, de: parseFloat(el.dataset.de), ate: parseFloat(el.dataset.ate) };
  });
  var topo = $("#topo");
  var role = $("#role");
  var flutuante = $("#flutuante");

  // Ponto da imagem para onde a câmera viaja (fração da largura/altura).
  var FOCO_1 = { x: 0.56, y: 0.55 }; // fachada aberta: miolo do prédio
  var FOCO_2 = { x: 0.61, y: 0.765 }; // fachada de perto: a varanda acesa

  var L = 0, A = 0, lado = 0, deriva = 5;

  function medirPalco() {
    L = palco.clientWidth;
    A = palco.clientHeight;
    // Cada cômodo é uma parede de um cubo visto por dentro.
    lado = 1.2 * Math.max(L, 1.5 * A);
    var alturaParede = 1.2 * A;
    paredes.forEach(function (p, i) {
      p.style.width = lado + "px";
      p.style.height = alturaParede + "px";
      p.style.left = -lado / 2 + "px";
      p.style.top = -alturaParede / 2 + "px";
      p.style.transform = "rotateY(" + -90 * i + "deg) translateZ(" + (-lado / 2 + 1) + "px)";
    });
    // Quanto dá para "olhar para os lados" sem ver o cômodo vizinho.
    var meioCampo = Math.atan(L / lado) / RAD;
    deriva = menosMovimento ? 0 : Math.max(2, (45 - meioCampo) * 0.8);
  }

  function zoomCamada(el, foco, escala, centralizar) {
    var w = el.offsetWidth, h = el.offsetHeight;
    var fx = (foco.x - 0.5) * w, fy = (foco.y - 0.5) * h;
    // Escala a imagem e leva o foco para o centro da tela conforme "centralizar" vai a 1.
    var k = 1 - centralizar - escala;
    el.style.transform =
      "translate(-50%, -50%) translate(" + fx * k + "px," + fy * k + "px) scale(" + escala + ")";
  }

  function anguloCamera(p) {
    var d = deriva;
    if (p < 0.5) return lerp(-d, d, norm(p, 0.335, 0.5));
    if (p < 0.58) return lerp(d, 90 - d, suave(norm(p, 0.5, 0.58)));
    if (p < 0.74) return lerp(90 - d, 90 + d, norm(p, 0.58, 0.74));
    if (p < 0.82) return lerp(90 + d, 180 - d, suave(norm(p, 0.74, 0.82)));
    return lerp(180 - d, 180 + d * 0.6, norm(p, 0.82, 1));
  }

  function desenhar(p) {
    /* 1. fachada aberta */
    var a1 = suave(norm(p, 0, 0.17));
    var op1 = 1 - norm(p, 0.125, 0.18);
    fachada.style.opacity = op1;
    fachada.style.visibility = op1 > 0 ? "visible" : "hidden";
    if (op1 > 0) zoomCamada(fachada, FOCO_1, lerp(1, 3.3, a1), a1 * 0.6);

    /* 2. fachada de perto, até atravessar a janela */
    var op2 = norm(p, 0.125, 0.18) * (p < 0.345 ? 1 : 0);
    perto.style.opacity = op2;
    perto.style.visibility = op2 > 0 ? "visible" : "hidden";
    if (op2 > 0) {
      var chega = saida(norm(p, 0.125, 0.25));
      var mergulho = entrada(norm(p, 0.235, 0.34));
      zoomCamada(perto, FOCO_2, lerp(1, 1.28, chega) * lerp(1, 9, mergulho), Math.max(chega * 0.25, mergulho));
    }

    /* 3. a luz da varanda toma a tela e vira o interior */
    luz.style.opacity = Math.min(norm(p, 0.285, 0.335), 1 - norm(p, 0.345, 0.405));

    /* 4. interior: câmera gira dentro do cubo */
    var dentro = p >= 0.33;
    cena.style.visibility = dentro ? "visible" : "hidden";
    cena.style.opacity = dentro ? 1 : 0;
    if (dentro) {
      var ang = anguloCamera(p);
      var delta = ((ang % 90) + 90) % 90;
      var s2 = Math.sin(2 * delta * RAD);
      // Fecha um pouco o campo de visão nas quinas, para a imagem nunca faltar.
      var dist = (lado / 2) * (1 + 0.25 * s2 * s2) * lerp(1.45, 1, saida(norm(p, 0.335, 0.44)));
      cena.style.perspective = dist + "px";
      cubo.style.transform = "translateZ(" + dist + "px) rotateY(" + ang + "deg)";
    }

    /* legendas */
    for (var i = 0; i < legendas.length; i++) {
      var l = legendas[i];
      var o = Math.min(norm(p, l.de, l.de + 0.02), 1 - norm(p, l.ate, l.ate + 0.02));
      l.el.style.opacity = o;
      l.el.style.visibility = o > 0.001 ? "visible" : "hidden";
      l.el.style.transform = "translateY(" + (1 - o) * 18 + "px)";
    }
    for (var j = 0; j < marcos.length; j++) {
      marcos[j].el.classList.toggle("ativo", p >= marcos[j].de && p < marcos[j].ate);
    }
    topo.classList.toggle("ativo", p > 0.06);
    role.style.opacity = p > 0.015 ? 0 : 1;
  }

  var alvo = 0, atual = -1;

  function lerScroll() {
    var r = filme.getBoundingClientRect();
    var total = filme.offsetHeight - palco.offsetHeight;
    alvo = clamp(-r.top / total, 0, 1);
    flutuante.classList.toggle("ativo", r.bottom < window.innerHeight * 0.6);
  }

  function quadro() {
    var proximo = menosMovimento || atual < 0 ? alvo : atual + (alvo - atual) * 0.14;
    if (Math.abs(proximo - alvo) < 0.0002) proximo = alvo;
    if (proximo !== atual) {
      atual = proximo;
      desenhar(atual);
    }
    requestAnimationFrame(quadro);
  }

  medirPalco();
  lerScroll();
  window.addEventListener("scroll", lerScroll, { passive: true });
  window.addEventListener("resize", function () {
    medirPalco();
    lerScroll();
    atual = -1;
  });
  requestAnimationFrame(quadro);

  // As imagens do interior são pré-carregadas para a virada não piscar.
  ["fachada-perto", "living", "cozinha", "suite"].forEach(function (n) {
    var im = new Image();
    im.src = "assets/img/" + n + ".jpg";
  });

  /* =====================================================
     SIMULADOR
     ===================================================== */
  var S = CFG.simulador || {};
  var form = $("#sim");
  var passos = $$(".passo", form);
  var ordem = ["renda", "civil", "entrada", "nome", "resultado"];
  var indice = 0;
  var barra = $("#simBarra");
  var btAvancar = $("#simAvancar");
  var btVoltar = $("#simVoltar");
  var acoes = $("#simAcoes");

  var reais = function (v) {
    return "R$ " + Math.round(v).toLocaleString("pt-BR");
  };
  var lerValor = function (id) {
    return parseInt(($("#" + id).value || "").replace(/\D/g, ""), 10) || 0;
  };

  $$(".campo input", form).forEach(function (inp) {
    inp.addEventListener("input", function () {
      var n = inp.value.replace(/\D/g, "").slice(0, 9);
      inp.value = n ? parseInt(n, 10).toLocaleString("pt-BR") : "";
    });
  });
  $$(".atalhos", form).forEach(function (grupo) {
    grupo.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var inp = $("#" + grupo.dataset.para);
      inp.value = parseInt(b.dataset.v, 10).toLocaleString("pt-BR");
      inp.focus();
    });
  });
  $$('input[name="civil"]', form).forEach(function (r) {
    r.addEventListener("change", function () {
      $("#extraConjuge").hidden = r.value !== "casado" || !r.checked;
    });
  });

  function marcado(nome) {
    var el = $('input[name="' + nome + '"]:checked', form);
    return el ? el.value : "";
  }

  function mostrar(i) {
    indice = i;
    passos.forEach(function (p) { p.hidden = p.dataset.passo !== ordem[i]; });
    var fim = ordem[i] === "resultado";
    acoes.hidden = fim;
    btVoltar.hidden = i === 0;
    btAvancar.textContent = i === 3 ? "Ver minha chance" : "Continuar";
    barra.style.width = ((i + 1) / 4) * 100 + "%";
    if (fim) barra.style.width = "100%";
  }

  function validar() {
    var passo = passos[indice];
    var erro = $(".erro", passo);
    var texto = "";
    if (ordem[indice] === "renda" && lerValor("fRenda") <= 0) texto = "Informe sua renda para continuar.";
    if (ordem[indice] === "civil" && !marcado("civil")) texto = "Escolha uma das opções para continuar.";
    if (ordem[indice] === "nome" && !marcado("nome")) texto = "Escolha uma das opções para continuar.";
    if (erro) erro.textContent = texto;
    return !texto;
  }

  function calcular() {
    var valor = S.valorImovel || 300000;
    var n = S.prazoMeses || 420;
    var comp = S.comprometimentoRenda || 0.3;
    var minEntrada = (S.entradaMinima || 0.2) * valor;
    var juroMes = Math.pow(1 + (S.taxaAnual || 0.105), 1 / 12) - 1;

    var renda = lerValor("fRenda");
    var conjuge = marcado("civil") === "casado" ? lerValor("fConjuge") : 0;
    var rendaFamiliar = renda + conjuge;
    var entradaV = Math.min(lerValor("fEntrada"), valor);
    var financiar = valor - entradaV;

    var parcela = financiar > 0 ? (financiar * juroMes) / (1 - Math.pow(1 + juroMes, -n)) : 0;
    var limite = rendaFamiliar * comp;
    var folga = parcela > 0 ? limite / parcela : 2;

    // Quanto a parcela cabe na renda -> pontuação.
    var pontos = [[0, 5], [0.4, 20], [0.7, 50], [1, 80], [1.3, 94], [2, 96]];
    var chance = 96;
    for (var i = 1; i < pontos.length; i++) {
      if (folga <= pontos[i][0]) {
        chance = lerp(pontos[i - 1][1], pontos[i][1], norm(folga, pontos[i - 1][0], pontos[i][0]));
        break;
      }
    }
    if (entradaV < minEntrada) chance *= 1 - 0.25 * (1 - entradaV / minEntrada);
    var nome = marcado("nome");
    if (nome === "restricao") chance *= 0.35;
    if (nome === "naosei") chance *= 0.9;
    chance = Math.round(clamp(chance, 4, 96));

    return {
      chance: chance, nome: nome, rendaFamiliar: rendaFamiliar, parcela: parcela,
      limite: limite, entradaV: entradaV, faltaEntrada: Math.max(0, minEntrada - entradaV),
    };
  }

  function mostrarResultado() {
    var r = calcular();
    var titulo, frase;
    if (r.nome === "restricao") {
      titulo = "O primeiro passo é limpar o nome";
      frase = "Com restrição o banco costuma negar o crédito. O Ailton pode orientar como regularizar e deixar tudo pronto para a análise.";
    } else if (r.chance >= 75) {
      titulo = "Suas chances são altas";
      frase = "A parcela estimada cabe na sua renda. Vale conversar agora para ver as unidades disponíveis.";
    } else if (r.chance >= 45) {
      titulo = "Você está no caminho";
      frase = "Com um ajuste na entrada ou somando renda com outra pessoa, a aprovação fica mais próxima.";
    } else {
      titulo = "Dá para chegar lá com alguns ajustes";
      frase = "Aumentar a entrada, usar o FGTS ou compor renda muda bastante o cenário. O Ailton mostra os caminhos.";
    }
    $("#simTitulo").textContent = titulo;
    $("#simFrase").textContent = frase;

    var linhas = [
      ["Renda considerada", reais(r.rendaFamiliar)],
      ["Parcela estimada", reais(r.parcela) + " por mês"],
      ["Parcela que sua renda comporta", reais(r.limite) + " por mês"],
    ];
    if (r.faltaEntrada > 0) linhas.push(["Entrada que ainda falta", reais(r.faltaEntrada)]);
    var ul = $("#simLinhas");
    ul.textContent = "";
    linhas.forEach(function (l) {
      var li = document.createElement("li");
      var s = document.createElement("span");
      var b = document.createElement("b");
      s.textContent = l[0];
      b.textContent = l[1];
      li.appendChild(s);
      li.appendChild(b);
      ul.appendChild(li);
    });

    mostrar(4);

    var arco = $("#simArco");
    var pct = $("#simPct");
    var volta = 2 * Math.PI * 52;
    arco.style.strokeDashoffset = volta;
    pct.textContent = "0";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        arco.style.strokeDashoffset = volta * (1 - r.chance / 100);
      });
    });
    if (menosMovimento) {
      pct.textContent = r.chance;
    } else {
      var inicio = performance.now();
      (function contar(agora) {
        var t = norm(agora - inicio, 0, 1300);
        pct.textContent = Math.round(r.chance * saida(t));
        if (t < 1) requestAnimationFrame(contar);
      })(inicio);
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validar()) return;
    if (indice === 3) return mostrarResultado();
    mostrar(indice + 1);
    var foco = $("input", passos[indice]);
    if (foco && foco.type === "text") foco.focus({ preventScroll: true });
  });
  btVoltar.addEventListener("click", function () { mostrar(indice - 1); });
  $("#simRefazer").addEventListener("click", function () { mostrar(0); });

  mostrar(0);
})();

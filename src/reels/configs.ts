import type { ReelConfig } from "../ChaReel/engine";
import captions2 from "./reel2/captions.json";
import face2 from "./reel2/face.json";
import captions3 from "./reel3/captions.json";
import face3 from "./reel3/face.json";
import captions4 from "./reel4/captions.json";
import face4 from "./reel4/face.json";
import captions5 from "./reel5/captions.json";
import face5 from "./reel5/face.json";

// Each scene starts at the given cut (segment) and lasts until the next one.
// Panel items appear on the word where she says them.

export const reel2: ReelConfig = {
  id: "ChaPraRestaurar-Posicionamento",
  video: "reel2/cut.mp4",
  captions: captions2,
  face: face2,
  scenes: [
    { seg: 0, layout: "full" },
    {
      seg: 1,
      layout: "split",
      panel: {
        tone: "dark",
        visual: { kind: "pair", mode: "apart" },
        kicker: "isso não é posicionamento",
        title: "Ultimato",
        items: [
          { text: "ou você muda isso", seg: 1, word: "muda", muted: true },
          { text: "ou vai embora", seg: 1, word: "embora", muted: true },
          { text: "ou isso, ou aquilo", seg: 2, word: "aquilo", muted: true },
        ],
      },
    },
    { seg: 3, layout: "full" },
    {
      seg: 4,
      layout: "split",
      panel: {
        tone: "light",
        visual: { kind: "rings", highlight: 0 },
        center: "você",
        kicker: "posicionamento saudável",
        title: "Saber colocar os seus limites",
        items: [
          { text: "seus limites", seg: 5, word: "limites" },
          { text: "aprender a falar", seg: 5, word: "falar" },
          { text: "mudar suas atitudes", seg: 6, word: "atitudes" },
        ],
      },
    },
    { seg: 7, layout: "full" },
    {
      seg: 9,
      layout: "split",
      panel: {
        tone: "dawn",
        visual: { kind: "pair", mode: "together" },
        kicker: "exemplos de posicionamento",
        title: "Isso é importante para mim",
        itemsStyle: "list",
        items: [
          {
            text: "“É importante para mim que eu vá.”",
            seg: 10,
            word: "importante",
          },
          { text: "“…e que você vá junto comigo.”", seg: 10, word: "junto" },
          { text: "“Isso eu consigo sustentar.”", seg: 11, word: "consigo" },
          {
            text: "“Isso eu não consigo mais.”",
            seg: 11,
            word: "consigo",
            nth: 1,
          },
        ],
      },
    },
    {
      seg: 12,
      layout: "split",
      panel: {
        tone: "dark",
        visual: { kind: "flow", dir: "out" },
        kicker: "o que influencia a relação",
        title: "Pequenas escolhas, grande ganho",
        items: [
          { text: "como falamos", seg: 12, word: "falamos" },
          { text: "nossos limites", seg: 12, word: "limites" },
          { text: "nossa presença", seg: 13, word: "presença" },
          { text: "nossas escolhas", seg: 13, word: "escolhas" },
        ],
      },
    },
    { seg: 14, layout: "full" },
  ],
};

export const reel3: ReelConfig = {
  id: "ChaPraRestaurar-BaterFraco",
  video: "reel3/cut.mp4",
  captions: captions3,
  face: face3,
  scenes: [
    { seg: 0, layout: "full" },
    {
      seg: 1,
      layout: "split",
      panel: {
        tone: "dark",
        visual: { kind: "wave" },
        kicker: "bate de frente",
        title: "Troca de ofensas",
        items: [
          { text: "ele fala", seg: 2, word: "fala" },
          { text: "eu respondo", seg: 2, word: "respondo" },
        ],
      },
    },
    { seg: 3, layout: "full" },
    {
      seg: 6,
      layout: "split",
      panel: {
        tone: "dawn",
        visual: { kind: "ripples" },
        center: "eu",
        kicker: "em vez de acusar",
        title: "Fale do que você sente",
        itemsStyle: "list",
        items: [
          { text: "“Isso me machuca muito.”", seg: 6, word: "machuca" },
          { text: "você é um grosso", seg: 8, word: "grosso", muted: true },
          {
            text: "você é insensível",
            seg: 8,
            word: "insensível",
            muted: true,
          },
          { text: "você é ignorante", seg: 8, word: "ignorante", muted: true },
        ],
      },
    },
    { seg: 10, layout: "full" },
    {
      seg: 12,
      layout: "split",
      panel: {
        tone: "light",
        visual: { kind: "pair", mode: "together" },
        kicker: "disponível para construir",
        title: "Eu estou disponível",
        items: [
          { text: "construir algo", seg: 12, word: "construir" },
          { text: "algo diferente", seg: 12, word: "diferente" },
          { text: "fazer isso com você", seg: 12, word: "fazer" },
        ],
      },
    },
    { seg: 13, layout: "full" },
  ],
};

export const reel4: ReelConfig = {
  id: "ChaPraRestaurar-OQueOOutroPensa",
  video: "reel4/cut.mp4",
  captions: captions4,
  face: face4,
  scenes: [
    { seg: 0, layout: "full" },
    {
      seg: 1,
      layout: "split",
      panel: {
        tone: "light",
        visual: { kind: "rings" },
        kicker: "controle ou influência?",
        title: "Controlar ou influenciar?",
        items: [
          { text: "controlar", seg: 1, word: "controlar" },
          { text: "influenciar", seg: 1, word: "influenciar" },
          { text: "modificar o outro", seg: 2, word: "modificar" },
        ],
      },
    },
    { seg: 3, layout: "full" },
    {
      seg: 5,
      layout: "split",
      panel: {
        tone: "dark",
        visual: { kind: "pair", mode: "exchange" },
        kicker: "expectativa",
        title: "Moedinhas de troca",
        itemsStyle: "list",
        items: [
          { text: "“Se eu fizer isso…”", seg: 5, word: "fizer" },
          { text: "“…ele tem que fazer isso.”", seg: 5, word: "fazer" },
          { text: "Já complica tudo.", seg: 5, word: "complica" },
        ],
      },
    },
    { seg: 6, layout: "full" },
    {
      seg: 9,
      layout: "split",
      panel: {
        tone: "dawn",
        visual: { kind: "pair", mode: "question" },
        kicker: "nas sessões",
        title: "Você não sabe o que ele pensa",
        itemsStyle: "list",
        items: [
          { text: "“Ele vai responder isso…”", seg: 10, word: "responder" },
          {
            text: "“…ou vai responder aquilo.”",
            seg: 10,
            word: "responder",
            nth: 1,
          },
          { text: "Ele respondeu outra coisa.", seg: 10, word: "respondeu" },
        ],
      },
    },
    {
      seg: 11,
      layout: "split",
      panel: {
        tone: "dark",
        visual: { kind: "flow", dir: "out" },
        kicker: "no automático",
        title: "Tudo vira controle",
        items: [
          { text: "no automático", seg: 11, word: "automático" },
          { text: "tudo no controle", seg: 11, word: "controle" },
          { text: "do jeito que a gente sonha", seg: 11, word: "sonha" },
        ],
      },
    },
    { seg: 12, layout: "full" },
  ],
};

export const reel5: ReelConfig = {
  id: "ChaPraRestaurar-ExercicioGuiado",
  video: "reel5/cut.mp4",
  captions: captions5,
  face: face5,
  scenes: [
    { seg: 0, layout: "full" },
    {
      seg: 2,
      layout: "split",
      panel: {
        tone: "dawn",
        visual: { kind: "breathe" },
        kicker: "uma pausa para você",
        title: "Toma um gole, respira",
      },
    },
    {
      seg: 4,
      layout: "split",
      panel: {
        tone: "dark",
        visual: { kind: "flow", dir: "out" },
        kicker: "o que consome sua energia",
        title: "Pense nessa situação",
        items: [
          { text: "discussões com o marido", seg: 6, word: "marido" },
          { text: "com o filho", seg: 6, word: "filho" },
          { text: "com a família", seg: 6, word: "família" },
          { text: "no trabalho", seg: 7, word: "trabalho" },
        ],
      },
    },
    { seg: 8, layout: "full" },
    {
      seg: 9,
      layout: "split",
      panel: {
        tone: "light",
        visual: { kind: "rings", highlight: "list" },
        kicker: "pergunte para você",
        title: "Três perguntas",
        itemsStyle: "list",
        items: [
          { text: "O que depende de mim?", seg: 9, word: "depende" },
          { text: "O que eu posso influenciar?", seg: 9, word: "influenciar" },
          { text: "O que eu não controlo?", seg: 9, word: "controlo" },
        ],
      },
    },
    { seg: 10, layout: "full" },
    {
      seg: 11,
      layout: "split",
      panel: {
        tone: "dawn",
        visual: { kind: "ripples" },
        center: "você",
        kicker: "o primeiro círculo",
        title: "Escolha uma atitude",
        items: [
          { text: "conversar", seg: 14, word: "conversar" },
          { text: "parar de insistir", seg: 14, word: "insistir" },
          { text: "estabelecer o limite", seg: 14, word: "limite" },
          { text: "voltar a cuidar de você", seg: 14, word: "cuidar" },
        ],
      },
    },
    { seg: 15, layout: "full" },
  ],
};

export const reels = [reel2, reel3, reel4, reel5];

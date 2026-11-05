# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Thiara: edições

Cada vídeo usa o mesmo estilo de edição (`src/edit/`): legendas brancas com
sombra, palavra a palavra (Montserrat + Times New Roman MT Condensed nas
palavras-chave), nome "Thiara Fumiere" na abertura, zoom em cortes secos,
whoosh + flash dourado nas trocas de cena e pop + zoom nas palavras-chave.

| Composição | Vídeo | Final |
| --- | --- | --- |
| `Thiara` | IMG_7284 (`public/video.mp4`) | tela "Método Viva Melhor" |
| `Thiara-DorLombar` | copy_B2AEF149 (`public/sources/`, original) | sem tela final |

- `src/edit/videos/`: dados de cada vídeo (transcrição, palavras em destaque,
  cortes, tela final opcional). Para um vídeo novo, crie um arquivo aqui e
  registre em `src/edit/videos/index.ts` e `src/Root.tsx`.
- `public/sources/` (fora do git, arquivos grandes): o vídeo original
  `b2aef149.mov` da pasta do Drive e a voz normalizada `b2aef149-voice.wav`
  (−14 LUFS). Renderizar direto do original evita perda de qualidade.
- `src/edit/brand.ts`: cores e fontes da marca (arquivos em `public/fonts/`).
- `scripts/make-sfx.py`: gera os efeitos sonoros em `public/sfx/`.
- Props: `instagram` (ex.: `"@thiara"`), `music` (arquivo em `public/`) e
  `musicVolume`.

```console
npx remotion render Thiara-DorLombar out/thiara-dor-lombar.mp4
```

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

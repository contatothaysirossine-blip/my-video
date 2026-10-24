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

## Thiara: edição do vídeo IMG_7284

A composição `Thiara` (`src/edit/`) aplica a edição no estilo da referência:
legendas palavra a palavra (Montserrat + serifa condensada itálica nas
palavras-chave), zoom em cortes secos, efeitos sonoros discretos e
encerramento com "Método Viva Melhor".

- `public/video.mp4`: vídeo original convertido para H.264.
- `src/edit/words.ts`: transcrição palavra a palavra (corrija textos aqui).
- `src/edit/timeline.ts`: palavras em destaque, cortes e zooms.
- `src/edit/brand.ts`: cores e fontes da marca. Para usar a Times New Roman
  MT Condensed, coloque o arquivo em `public/fonts/` e preencha `SERIF_FILE`.
- `scripts/make-sfx.py`: gera os efeitos sonoros em `public/sfx/`.
- Props: `instagram` (ex.: `"@thiara"`), `music` (arquivo em `public/`) e
  `musicVolume`.

```console
npx remotion render Thiara out/thiara.mp4
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

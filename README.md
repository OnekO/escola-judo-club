# Escola Judo Club

Web del club, al pie del Pico Sacro. Se publica en GitHub Pages con cada push a `main`.

## Estructura

```
src/
  layout/
    head.html      <head> común (fuentes, CSS, idiomas alternativos)
    header.html    cabecera, menú y selector de idioma (+ sprite de iconos)
    footer.html    pie común (contacto, horario, redes) + JS
  i18n/
    es.json        textos de cabecera y pie en castellano
    gl.json        ídem en gallego
  pages/
    es/            una página por sección, en castellano
      index.html            Inicio
      club.html             El club
      que-es-el-judo.html   Qué es el judo
      ventajas.html         Ventajas
      tecnicas.html         Técnicas (animaciones de Kumi y Kata)
      competicion.html      Competición
      contacto.html         Contacto (mapa con los puntos del club)
    gl/            las mismas páginas, en gallego
assets/
  css/styles.css   estilos de toda la web
  js/main.js       menú, pestañas, animaciones y efectos (con sus textos en es/gl)
build.py           une las piezas en _site/
```

Cada página de `src/pages/` empieza con su título y descripción:

```html
<!--
title: Técnicas de judo · Escola Judo Club
description: Texto para buscadores y redes sociales.
-->
```

## Idiomas

- El castellano se publica en la raíz (`/`) y el gallego en `/gl/`. El selector **ES · GL** de la cabecera lleva a la misma página en el otro idioma.
- Al cambiar un texto de una página, cámbialo en `src/pages/es/` **y** en `src/pages/gl/`.
- Los textos de la cabecera y el pie están en `src/i18n/es.json` y `src/i18n/gl.json`. En los archivos de `src/layout/` se usan como `{{t:clave}}`.
- `build.py` avisa si a un idioma le falta alguna página o alguna traducción.

## Páginas nuevas

Crea el archivo con el mismo nombre en `src/pages/es/` y en `src/pages/gl/`. Después añade su enlace en `src/layout/header.html` con `data-page="<nombre-del-archivo>"`, para que el menú la marque como página actual, y el texto del enlace en los dos `.json`.

## Ver la web en local

```bash
python3 build.py
```

Luego abre `_site/index.html` (castellano) o `_site/gl/index.html` (gallego) en el navegador. No hace falta instalar nada más que Python 3.

## Publicación

El workflow `.github/workflows/pages.yml` ejecuta `build.py` y publica `_site/` en GitHub Pages cada vez que se actualiza `main`. Requisito, una sola vez: *Settings → Pages → Source: GitHub Actions*.

# Escola Judo Club

Web del club, al pie del Pico Sacro. Se publica en GitHub Pages con cada push a `main`.

## Estructura

```
src/
  layout/
    head.html      <head> común (fuentes, CSS)
    header.html    cabecera y menú comunes (+ sprite de iconos)
    footer.html    pie común (contacto, horario, redes) + JS
  pages/           una página por sección
    index.html            Inicio
    club.html             El club
    que-es-el-judo.html   Qué es el judo
    ventajas.html         Ventajas
    tecnicas.html         Técnicas (animaciones de Kumi y Kata)
    competicion.html      Competición
assets/
  css/styles.css   estilos de toda la web
  js/main.js       menú, pestañas, animaciones y efectos
build.py           une las piezas en _site/
```

Cada página de `src/pages/` empieza con su título y descripción:

```html
<!--
title: Técnicas de judo · Escola Judo Club
description: Texto para buscadores y redes sociales.
-->
```

Para añadir una página nueva, crea el archivo en `src/pages/` y añade su enlace en `src/layout/header.html` con `data-page="<nombre-del-archivo>"`, para que el menú la marque como página actual.

## Ver la web en local

```bash
python3 build.py
```

Luego abre `_site/index.html` en el navegador. No hace falta instalar nada más que Python 3.

## Publicación

El workflow `.github/workflows/pages.yml` ejecuta `build.py` y publica `_site/` en GitHub Pages cada vez que se actualiza `main`. Requisito, una sola vez: *Settings → Pages → Source: GitHub Actions*.

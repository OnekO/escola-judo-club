#!/usr/bin/env python3
"""Construye la web en _site/ uniendo la cabecera y el pie comunes con cada página de src/pages/<idioma>/.

Uso:
    python3 build.py      # y abre _site/index.html en el navegador

Idiomas: el castellano se publica en la raíz y el gallego en gl/. Cada idioma tiene
sus páginas en src/pages/<idioma>/ (con los mismos nombres de archivo) y los textos
de la cabecera y el pie en src/i18n/<idioma>.json.

Cada página empieza con una cabecera de metadatos:
    <!--
    title: Técnicas de judo · Escola Judo Club
    description: Texto para buscadores y redes sociales.
    -->

Marcadores que se pueden usar en src/layout/:
    {{lang}} {{title}} {{description}} {{root}}   idioma, metadatos y ruta a la raíz ("" o "../")
    {{t:clave}}                                   texto de src/i18n/<idioma>.json
    {{url:es}} {{url:gl}}                         esta misma página en cada idioma (ruta relativa)
    {{abs:es}} {{abs:gl}}                         ídem, con la dirección completa (para buscadores)
    {{current:es}} {{current:gl}}                 aria-current="true" en el idioma actual
El enlace del menú cuyo data-page coincide con el nombre del archivo se marca como página actual.
"""
import html
import json
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "_site"
SITE_URL = "https://oneko.github.io/escola-judo-club/"
LANGS = {"es": "", "gl": "gl/"}  # idioma → carpeta de publicación
FRONT_MATTER = re.compile(r"\A<!--\n(.*?)\n-->\n", re.S)
MARKER = re.compile(r"\{\{(?:(t|url|abs|current):)?(\w+)\}\}")


def read(path):
    return path.read_text(encoding="utf-8")


def parse_page(path):
    text = read(path)
    match = FRONT_MATTER.match(text)
    if not match:
        raise SystemExit(f"{path}: falta la cabecera <!-- title: … description: … -->")
    meta = {}
    for line in match.group(1).splitlines():
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    for key in ("title", "description"):
        if not meta.get(key):
            raise SystemExit(f"{path}: falta «{key}» en la cabecera de metadatos")
    return meta, text[match.end():]


def indent(text, spaces):
    pad = " " * spaces
    return "".join(pad + line if line.strip() else line for line in text.splitlines(True))


def page_urls(lang, page_name):
    """Rutas relativas y absolutas de una página en todos los idiomas, vistas desde `lang`."""
    root = "../" * LANGS[lang].count("/")
    rel = {other: root + folder + page_name for other, folder in LANGS.items()}
    public_name = "" if page_name == "index.html" else page_name
    absolute = {other: SITE_URL + folder + public_name for other, folder in LANGS.items()}
    return root, rel, absolute


def render(template, lang, strings, values, rel, absolute, where):
    def fill(match):
        kind, key = match.groups()
        if kind == "t":
            if key not in strings:
                raise SystemExit(f"{where}: falta la traducción «{key}» en src/i18n/{lang}.json")
            return html.escape(strings[key])
        if kind == "url":
            return rel[key]
        if kind == "abs":
            return absolute[key]
        if kind == "current":
            return ' aria-current="true"' if key == lang else ""
        return values[key]
    return MARKER.sub(fill, template)


def build():
    layout = {name: read(SRC / "layout" / f"{name}.html") for name in ("head", "header", "footer")}

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    shutil.copytree(ROOT / "assets", OUT / "assets")

    names = {lang: sorted(p.name for p in (SRC / "pages" / lang).glob("*.html")) for lang in LANGS}
    reference = names["es"]
    for lang, pages in names.items():
        if pages != reference:
            missing = sorted(set(reference) ^ set(pages))
            raise SystemExit(f"src/pages/{lang}/ no tiene las mismas páginas que src/pages/es/: {', '.join(missing)}")

    total = 0
    for lang, folder in LANGS.items():
        strings = json.loads(read(SRC / "i18n" / f"{lang}.json"))
        (OUT / folder).mkdir(parents=True, exist_ok=True)
        for name in reference:
            page = SRC / "pages" / lang / name
            meta, body = parse_page(page)
            root, rel, absolute = page_urls(lang, name)
            values = {"lang": lang, "root": root,
                      "title": html.escape(meta["title"]), "description": html.escape(meta["description"])}
            parts = [render(layout[part], lang, strings, values, rel, absolute, page) for part in ("head", "header", "footer")]
            stem = page.stem
            parts[1] = parts[1].replace(f'data-page="{stem}"', f'data-page="{stem}" aria-current="page"')
            (OUT / folder / name).write_text(parts[0] + parts[1] + indent(body, 4) + parts[2], encoding="utf-8")
            total += 1

    (OUT / ".nojekyll").touch()  # GitHub Pages: servir los archivos tal cual, sin Jekyll
    print(f"✔ {total} páginas generadas en {OUT.relative_to(ROOT)}/ ({', '.join(LANGS)})")


if __name__ == "__main__":
    build()

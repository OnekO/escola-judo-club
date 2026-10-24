#!/usr/bin/env python3
"""Construye la web en _site/ uniendo la cabecera y el pie comunes con cada página de src/pages/.

Uso:
    python3 build.py      # y abre _site/index.html en el navegador

Cada página de src/pages/ empieza con una cabecera de metadatos:
    <!--
    title: Técnicas de judo · Escola Judo Club
    description: Texto para buscadores y redes sociales.
    -->
El enlace del menú cuyo data-page coincide con el nombre del archivo se marca como página actual.
"""
import html
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "_site"
FRONT_MATTER = re.compile(r"\A<!--\n(.*?)\n-->\n", re.S)


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


def build():
    head, header, footer = (read(SRC / "layout" / name) for name in ("head.html", "header.html", "footer.html"))

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    shutil.copytree(ROOT / "assets", OUT / "assets")

    pages = sorted((SRC / "pages").glob("*.html"))
    for page in pages:
        meta, body = parse_page(page)
        top = (head.replace("{{title}}", html.escape(meta["title"]))
                   .replace("{{description}}", html.escape(meta["description"])))
        nav = header.replace(f'data-page="{page.stem}"', f'data-page="{page.stem}" aria-current="page"')
        (OUT / page.name).write_text(top + nav + indent(body, 4) + footer, encoding="utf-8")

    (OUT / ".nojekyll").touch()  # GitHub Pages: servir los archivos tal cual, sin Jekyll
    print(f"✔ {len(pages)} páginas generadas en {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    build()

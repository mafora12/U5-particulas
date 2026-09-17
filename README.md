# Relevo generacional | Presentación generativa

Presentación web para la charla de Fórum UPB en Future Leaders Forum 2026, construida con
HTML, CSS y JavaScript a partir del diseño de Figma y un sistema de partículas.

## Ver la presentación

**Escritorio (pantalla grande):**
https://mafora12.github.io/U5-particulas/

**Celular:**
https://mafora12.github.io/U5-particulas/movil.html

Desde un celular, el enlace de escritorio redirige solo a la versión móvil; para forzar la
versión de escritorio agrega `?escritorio` a la URL.

## Abrir en local

Doble clic en `index.html`, o con un servidor local:

```bash
py -m http.server 8123
```

y abrir `http://localhost:8123`. Se puede ir directo a una diapositiva con `#número`
(por ejemplo `http://localhost:8123/#7`).

## Controles

- `Espacio`, `→` o `Av Pág`: avanzar.
- `←` o `Re Pág`: volver.
- `F` o botón de esquinas: pantalla completa (funciona en Chrome, Edge y Firefox; si el
  navegador la bloquea aparece un aviso y se puede usar `F11`).
- `H`: mostrar / ocultar ayuda.
- `R`: volver al inicio.
- Engranaje → `Esp` / `Por`: cambiar idioma.
- En pantallas táctiles: deslizar a izquierda o derecha.

## Versión para celular

`movil.html` es la misma presentación adaptada a celulares (vertical y horizontal): mismos
textos, fondos, vidrio y partículas, organizados en una columna. Si alguien abre `index.html`
desde un celular, se redirige solo a la versión móvil (agrega `?escritorio` a la URL para evitarlo).

Publicada con GitHub Pages en:

https://mafora12.github.io/U5-particulas/movil.html

El QR de ese enlace (`assets/qr-movil.png`) aparece en la última diapositiva.

### Activar GitHub Pages (una sola vez)

1. En GitHub abre el repositorio → **Settings** → **Pages**.
2. En *Build and deployment* elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
3. Guarda. En uno o dos minutos quedan disponibles
   `https://mafora12.github.io/U5-particulas/` (escritorio) y `.../movil.html` (celular).

Para cambiar textos o enlaces revisa `GUIA_CAMBIOS_RAPIDOS.md`.
El concepto y la gramática visual están en `DECISIONES_SISTEMA_VISUAL.md`.

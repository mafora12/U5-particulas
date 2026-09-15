# Guía de cambios rápidos

## Textos

Todos los textos están en `slides.js`, separados por idioma:

```js
parts: [{ es: "El impacto sí.", pt: "O impacto, sim." }],
```

Cambia solo lo que está entre comillas. `br: true` fuerza un salto de línea después de ese
fragmento y `color` / `size` cambian el color o tamaño de ese fragmento.

## Idioma inicial

En `config.js`:

```js
defaultLanguage: "es", // o "pt"
```

Durante la charla se puede cambiar con el engranaje (`Esp` / `Por`). La elección queda
guardada en ese navegador.

## QR y enlace de redes

En `config.js`:

```js
qr: {
  socialUrl: "https://www.instagram.com/centrodeeventosupb/",
  socialImage: "./assets/qr-social.png",
},
```

Si cambia el enlace, reemplaza también `assets/qr-social.png` por un QR nuevo con el mismo nombre.

## Fondos

Los fondos están en `assets/slides/` (`bg-01.webp` … `bg-13.webp`). Para reemplazar uno,
guarda una imagen de 1920 × 1080 con el mismo nombre. Las diapositivas 9, 10 y 11 usan
degradados definidos en `slides.js`.

## Partículas

Cada diapositiva tiene una escena en `particles.js` (campo `scene` en `slides.js`).
Los valores más útiles para ajustar están en `link` de cada escena:

- `dist`: distancia máxima para que dos personas se vinculen.
- `grow`: qué tan rápido se fortalece un vínculo.
- `decay`: qué tan rápido se debilita.
- `alpha`: visibilidad de las líneas.

La cantidad de partículas está en `COUNT` al inicio de `particles.js`.

## Sin conexión

La tipografía Rajdhani se carga desde Google Fonts. Sin internet la presentación funciona
igual, pero usa una tipografía de respaldo.

# Pasticceria Marpigi — sito vetrina

Sito statico a file separati, pensato per Cloudflare Pages.
Nessuna build, nessun bundler: quello che vedi è quello che viene servito.

```
index.html            pagina unica
assets/style.css      stile, palette in cima al file
assets/app.js         caricamento offerte + modulo email
data/offerte.json     le offerte: si modifica solo questo per aggiornarle
img/                  logo e fotografie
functions/api/avviso.js   endpoint POST per le email (Cloudflare Pages Function)
wrangler.toml         configurazione Pages + binding KV
_headers              regole di cache
```

## Colori

Campionati dall'insegna, in cima a `assets/style.css`:

| token | hex | dove
|---|---|---|
| `--cacao` | `#45311E` | il marrone del lettering
| `--sabbia` | `#AD935F` | il fondo dell'ovale
| `--sabbia-tenue` | `#C6AE81` | il motivo a cerchi
| `--panna` | `#F7F2E8` | fasce alternate
| `--bianco` | `#FFFFFF` | fondo dominante

Lo sfondo della sezione d'apertura è una sfumatura diagonale sabbia → cacao
dentro la classe `.motivo`, in `assets/style.css`: nessun file immagine,
solo un `linear-gradient` tra i token di colore.

## Cosa manca

- [ ] Telefono: cerca `+390000000000` e sostituisci ovunque (anche in `wa.me`)
- [ ] `INSERIRE-LINK-MAPS`, `INSERIRE-LINK-GOOGLE`, `INSERIRE-INSTAGRAM`
- [ ] Partita IVA nel footer
- [ ] Orari veri (in HTML e nel blocco JSON-LD in `<head>`)
- [ ] Recensioni vere, copiate testuali da Google
- [ ] Foto: sostituire i `<div class="segnaposto">` con `<picture>`

### Foto

Formato consigliato: 1600 px sul lato lungo, WebP a qualità 82 con fallback JPEG.

```bash
for f in originali/*.jpg; do
  n=$(basename "$f" .jpg)
  magick "$f" -resize 1600x1600\> -quality 82 "img/$n.webp"
  magick "$f" -resize 1600x1600\> -quality 80 "img/$n.jpg"
done
```

Nel markup:

```html
<picture>
  <source srcset="img/mignon.webp" type="image/webp">
  <img class="voce__foto" src="img/mignon.jpg" alt="Vassoio di mignon"
       width="1600" height="1280" loading="lazy">
</picture>
```

## Pubblicare su Cloudflare Pages

```bash
npx wrangler pages project create pasticceria-marpigi
npx wrangler kv namespace create AVVISI    # copia l'id in wrangler.toml
npx wrangler pages deploy .
```

In locale, con le Functions attive:

```bash
npx wrangler pages dev .
```

Le email raccolte si rileggono con:

```bash
npx wrangler kv key list --binding AVVISI
```

Se non vuoi la KV, cancella `functions/` e togli il modulo dalla sezione shop:
il resto del sito è statico puro e funziona ovunque.

## Dominio

Registra `pasticceriamarpigi.it` presso un registrar italiano, poi sposta i
nameserver su Cloudflare e collega il dominio al progetto Pages. SSL e
redirect da apex a `www` sono automatici.

# Jonathan IA Systems - Link Hub

Mini landing estatica para el enlace principal de Instagram, TikTok, YouTube y LinkedIn.

## Dominio objetivo

```text
jonathan.omniagsistems.com
```

## Objetivo

Convertir visitas sociales en rutas claras:

1. Pedir auditoria / escribir `AUDITORIA`.
2. Pedir el mapa de fugas / escribir `MAPA`.
3. Ver sistemas por nicho, empezando por MesaFlow.
4. Seguir el contenido en YouTube, TikTok, Instagram y LinkedIn.

## Archivos

- `index.html`: landing principal.
- `styles.css`: estilos responsive.
- `script.js`: tracking local y soporte de rutas `/mapa`, `/auditoria`, `/mesaflow`.
- `vercel.json`: rewrites y headers para Vercel.
- `assets/hero-banner.png`: banner visual usado como fondo.

## Enlaces actuales

| Destino | URL |
|---|---|
| Instagram | `https://www.instagram.com/jonathan.iasistems/` |
| Instagram DM | `https://ig.me/m/jonathan.iasistems` |
| TikTok | `https://www.tiktok.com/@jonathan.iasistems` |
| YouTube | `https://www.youtube.com/@Jonathan.iasistems` |
| LinkedIn | `https://www.linkedin.com/in/jonathan-martinez-cabeo-1b9603137/` |
| MesaFlow | `https://app.mesaflow.es` |

## Deploy recomendado

Estado actual:

- Repo publico GitHub: `https://github.com/jmcabeo-ai/jonathan-ia-systems-linkhub`
- Produccion Vercel: `https://jonathan-ia-systems-linkhub.vercel.app`
- Dominio final pendiente de DNS: `jonathan.omniagsistems.com`

1. Crear repo publico en GitHub:

```text
jonathan-ia-systems-linkhub
```

2. Subir a ese repo el contenido de esta carpeta `linkhub/` como raiz del repo.
3. En Vercel, importar el repo.
4. Framework preset: `Other`.
5. Build command: dejar vacio.
6. Output directory: dejar vacio o `.`.
7. Anadir dominio en Vercel:

```text
jonathan.omniagsistems.com
```

8. En Hostinger DNS, cuando Vercel lo pida, crear normalmente:

```text
Type: CNAME
Name: jonathan
Target: cname.vercel-dns.com
TTL: automatico
```

Importante: confirmar siempre el registro exacto que muestre Vercel antes de guardar DNS.

Nota 2026-07-08:

- El deploy en Vercel ya esta hecho.
- Al intentar asignar `jonathan.omniagsistems.com`, Vercel devuelve falta de acceso/control del dominio.
- Siguiente paso: crear el CNAME `jonathan -> cname.vercel-dns.com` en Hostinger y volver a ejecutar/anadir el dominio en Vercel.

## Rutas preparadas

Estas rutas cargan la misma landing y hacen scroll a la zona correspondiente:

```text
/mapa
/auditoria
/mesaflow
```

## Pendientes

- Sustituir CTA de DM por formulario GHL cuando este definido.
- Anadir pixel/analytics cuando se decida la herramienta de medicion.
- Crear paginas separadas para `MAPA`, `AUDITORIA` y `MESAFLOW` si el trafico lo justifica.

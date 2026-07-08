# Jonathan IA Systems - Link Hub

Link hub simple para el enlace principal de Instagram, TikTok, YouTube y LinkedIn.

No es la web definitiva de Jonathan, OMNIA ni MesaFlow. Su funcion es ordenar el siguiente clic de una persona que llega desde redes.

## Dominio objetivo

```text
jonathan.omniagsistems.com
```

## Objetivo

Convertir visitas sociales en rutas claras, sin convertir esta pagina en una landing larga:

1. Pedir auditoria / escribir `AUDITORIA`.
2. Pedir el mapa de fugas / escribir `MAPA`.
3. Ver MesaFlow como prueba/producto vertical de restaurantes.
4. Seguir el contenido en YouTube, LinkedIn, TikTok o Instagram.

## Criterio de jerarquia

- `AUDITORIA` es el CTA principal.
- `MAPA` es el lead magnet de entrada.
- MesaFlow aparece como caso/producto, no como marca principal.
- YouTube, LinkedIn, TikTok e Instagram son enlaces de confianza y continuidad.
- OMNIA no se enlaza como boton principal por ahora. Vive detras como operacion, CRM y paraguas empresarial; se anadira cuando tenga sentido estrategico y una URL clara.

## Archivos

- `index.html`: link hub principal.
- `styles.css`: estilos responsive.
- `script.js`: tracking local y soporte de rutas `/mapa`, `/auditoria`, `/mesaflow`.
- `vercel.json`: rewrites y headers para Vercel.
- `assets/hero-banner-electric.svg`: banner visual electrico alineado con el avatar.
- `assets/profile-jonathan-ai.jpg`: avatar optimizado para el bloque de perfil.

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

Nota 2026-07-08 posterior:

- DNS verificado desde terminal: `jonathan.omniagsistems.com` ya resuelve como CNAME a `cname.vercel-dns.com`.
- Si aparece `404 DEPLOYMENT_NOT_FOUND`, el problema ya no es el CNAME: Vercel esta recibiendo la peticion, pero el dominio no esta asignado/verificado dentro del proyecto.
- El CLI devuelve `domain_not_owned` para `omniagsistems.com` y `jonathan.omniagsistems.com`.
- Accion recomendada: entrar al dashboard de Vercel del equipo `jmcabeo-6684s-projects`, abrir el proyecto `jonathan-ia-systems-linkhub`, ir a Settings -> Domains, anadir `jonathan.omniagsistems.com` y copiar el TXT de verificacion que Vercel pida. Ese TXT se crea en Hostinger manteniendo el CNAME actual.

## Rutas preparadas

Estas rutas cargan el mismo link hub y hacen scroll a la tarjeta correspondiente:

```text
/mapa
/auditoria
/mesaflow
```

## Pendientes

- Sustituir CTA de DM por formulario GHL cuando este definido.
- Anadir pixel/analytics cuando se decida la herramienta de medicion.
- Crear paginas separadas para `MAPA`, `AUDITORIA` y `MESAFLOW` solo si el trafico lo justifica.
- Decidir si OMNIA tendra enlace visible cuando exista una pagina publica adecuada.

## Estilo visual vigente

- Paleta: negro, navy, azul electrico, cian y glow metalico.
- Referencia visual: avatar IA de Jonathan.
- Evitar naranja/teal en esta landing.
- Banner vigente: `assets/hero-banner-electric.svg`.

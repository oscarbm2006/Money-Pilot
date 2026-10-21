/* ============================================================
   MoneyPilot · Páginas independientes con el diseño nuevo
   (Recursos y libros, Quiénes somos y las páginas del blog).
   - Menú integrado con el fondo: sobre la banda oscura de arriba tiene su mismo color; al pasar a la zona
     clara toma el fondo claro de la página (estatico.js pone <html class="e-menu-claro">).
   - Banda oscura con objetos en 3D hechos solo con CSS (no cargan Three.js: páginas ligeras).
   - Fondo blanco del prototipo y tipografías alojadas en la propia web.
   Todo lleva el prefijo "e-" para no chocar con los estilos propios de cada página.
   ============================================================ */
@font-face{font-family:"Plus Jakarta Sans";font-style:normal;font-weight:200 800;font-display:swap;src:url(/fonts/plus-jakarta-sans-latin.woff2) format("woff2")}
@font-face{font-family:"Instrument Serif";font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/instrument-serif-latin.woff2) format("woff2")}
:root{
  --e-noche:#1E1B4B;--e-marino:#312E81;--e-indigo:#4F46E5;--e-lavanda:#A5B4FC;--e-lavanda-clara:#C7D2FE;
  --e-fondo:#FAFAFA;--e-superficie:#FFFFFF;--e-tinta:#1E1E2E;--e-suave:#4B5563;--e-linea:#E5E7EB;--e-tinte:#EEF2FF;
  --e-fuente:"Plus Jakarta Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --e-cifras:"Instrument Serif",Georgia,"Times New Roman",serif;
}
/* "clip" en vez de "hidden": corta lo que sobresale sin impedir que el menú se quede fijo arriba */
html:root,html body{overflow-x:clip}
body.e-pagina{background:var(--e-fondo)!important;color:var(--e-tinta);font-family:var(--e-fuente);
  /* Las variables tipográficas de cada página pasan a la tipografía nueva */
  --font-sans:var(--e-fuente);--font-serif:var(--e-fuente);--sans:var(--e-fuente);--serif:var(--e-fuente);--bg:var(--e-fondo)}
.e-pagina .bg-aura{display:none}

/* ---------- Menú ---------- */
.e-menu{position:sticky;top:0;z-index:50;background:var(--e-noche);border-bottom:1px solid transparent;transition:background-color .35s ease,border-color .35s ease,box-shadow .35s ease}
.e-menu-fila{max-width:72rem;margin:0 auto;padding:10px 20px;display:flex;align-items:center;flex-wrap:wrap;gap:8px 16px}
.e-logo{flex:0 0 auto;display:inline-flex;align-items:center;background:#fff;border-radius:8px;padding:3px 9px}
.e-logo img{display:block;height:20px;width:auto}
.e-nav{margin-left:auto;display:flex;align-items:center;flex-wrap:wrap;gap:4px;font:700 13px/1 var(--e-fuente)}
.e-nav a,.e-dd>button{display:inline-flex;align-items:center;gap:4px;min-height:38px;padding:0 12px;border:0;border-radius:999px;background:transparent;color:var(--e-lavanda-clara);text-decoration:none;font:inherit;cursor:pointer;transition:color .2s,background-color .2s}
@media (hover: hover) and (pointer: fine){
.e-nav a:hover,.e-dd>button:hover{color:#fff;background:rgba(255,255,255,.08)}}
.e-nav a:focus-visible,.e-dd>button:focus-visible{outline:2px solid var(--e-lavanda);outline-offset:2px}
.e-nav a.e-activo{background:var(--e-indigo);color:#fff;box-shadow:0 6px 16px -8px rgba(79,70,229,.9)}
.e-nav a.e-cta{background:#fff;color:var(--e-marino)}
.e-dd{position:relative}
.e-dd-menu{display:none;position:absolute;left:0;top:100%;z-index:60;min-width:220px;padding-top:6px}
.e-dd-menu>div{background:var(--e-marino);border:1px solid rgba(199,210,254,.22);border-radius:14px;padding:6px;box-shadow:0 18px 40px -16px rgba(0,0,0,.55)}
.e-dd:focus-within .e-dd-menu{display:block}
@media (hover: hover) and (pointer: fine){
.e-dd:hover .e-dd-menu{display:block}}
.e-dd-menu a{display:flex;width:100%;border-radius:10px;color:#fff}
@media (hover: hover) and (pointer: fine){
.e-dd-menu a:hover{background:rgba(255,255,255,.1)}}
/* Zona clara: el menú toma el fondo de la página y el texto pasa a oscuro; lo activo sigue destacando */
html.e-menu-claro .e-menu{background:rgba(250,250,250,.9);-webkit-backdrop-filter:blur(14px) saturate(160%);backdrop-filter:blur(14px) saturate(160%);border-bottom-color:var(--e-linea);box-shadow:0 10px 24px -20px rgba(30,27,75,.45)}
html.e-menu-claro .e-nav a,html.e-menu-claro .e-dd>button{color:var(--e-tinta)}
@media (hover: hover) and (pointer: fine){
html.e-menu-claro .e-nav a:hover,html.e-menu-claro .e-dd>button:hover{color:var(--e-indigo);background:rgba(79,70,229,.08)}}
html.e-menu-claro .e-nav a.e-activo{color:#fff;background:var(--e-indigo)}
html.e-menu-claro .e-nav a.e-cta{color:#fff;background:var(--e-indigo)}
html.e-menu-claro .e-dd-menu a{color:#fff}
@media (hover: hover) and (pointer: fine){
html.e-menu-claro .e-dd-menu a:hover{color:#fff;background:rgba(255,255,255,.1)}}

/* ---------- Banda oscura de arriba, con objetos 3D en CSS ---------- */
.e-cab{position:relative;overflow:hidden;background:var(--e-noche);color:#fff}
.e-cab-luz{position:absolute;right:-100px;top:-220px;width:480px;height:480px;border-radius:50%;background:var(--e-indigo);filter:blur(120px);opacity:.3;pointer-events:none}
.e-cab-texto{position:relative;z-index:1;max-width:72rem;margin:0 auto;padding:56px 20px 52px}
.e-cab-ante{margin:0 0 12px;font:700 14px/1.2 var(--e-fuente);color:var(--e-lavanda);text-transform:none;letter-spacing:0}
.e-cab h1{margin:0;max-width:36rem;font:800 clamp(30px,4.2vw,50px)/1.05 var(--e-fuente);letter-spacing:-.035em;color:#fff;text-align:left}
.e-cab .e-cab-frase{margin:14px 0 0;max-width:40rem;font-size:17px;line-height:1.6;color:var(--e-lavanda-clara);text-align:left}
.e-cab-texto>*{animation:eSube .7s cubic-bezier(.2,.8,.2,1) both}
.e-cab-texto>:nth-child(2){animation-delay:.08s}.e-cab-texto>:nth-child(3){animation-delay:.16s}
@keyframes eSube{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.e-cab-3d{position:absolute;inset:0;pointer-events:none;perspective:900px}
.e-obj{position:absolute;left:var(--x);top:var(--y);animation:eFlota 7s ease-in-out infinite;animation-delay:var(--d,0s)}
@keyframes eFlota{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-14px) rotate(calc(var(--r,0deg) + 5deg))}}
/* Moneda: cara con el € y canto con grosor */
.e-moneda{width:var(--t,88px);height:var(--t,88px);border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 35% 30%,#E0E7FF,#A5B4FC 45%,#6366F1 100%);color:var(--e-marino);font:400 calc(var(--t,88px)*.56)/1 var(--e-cifras);
  box-shadow:inset 0 0 0 calc(var(--t,88px)*.07) rgba(255,255,255,.35),inset 0 0 0 calc(var(--t,88px)*.1) rgba(49,46,129,.25),0 calc(var(--t,88px)*.07) 0 #4338CA,0 22px 40px -18px rgba(0,0,0,.6)}
/* Libro: tapa, lomo y páginas */
.e-libro{width:var(--t,74px);height:calc(var(--t,74px)*1.42);border-radius:3px 9px 9px 3px;
  background:linear-gradient(160deg,var(--c,#4F46E5),#1E1B4B);box-shadow:inset 6px 0 0 rgba(255,255,255,.16),7px 7px 0 -1px #E5E7EB,8px 8px 0 -1px #C7D2FE,0 24px 40px -18px rgba(0,0,0,.6)}
.e-libro::after{content:"";position:absolute;left:18%;right:18%;top:22%;height:4px;border-radius:2px;background:rgba(255,255,255,.55);box-shadow:0 10px 0 rgba(255,255,255,.35)}
@media (max-width:820px){.e-cab-3d{display:none}.e-cab-texto{padding-top:40px;padding-bottom:36px}}

/* ---------- Piel común ---------- */
.e-ancho{max-width:72rem;margin:0 auto;padding:0 20px}
.e-seccion{padding:72px 0}
.e-antetitulo{margin:0 0 12px;font-size:15px;font-weight:700;color:var(--e-indigo)}
.e-h2{margin:0;font:800 clamp(28px,3.6vw,44px)/1.08 var(--e-fuente);letter-spacing:-.03em;color:var(--e-noche)}
.e-sub{margin:16px 0 0;max-width:38rem;font-size:18px;line-height:1.65;color:var(--e-suave)}
.e-boton{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 24px;border-radius:999px;background:#fff;color:var(--e-marino);font:700 15px/1 var(--e-fuente);text-decoration:none;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
@media (hover: hover) and (pointer: fine){
.e-boton:hover{transform:translateY(-2px)}}
.e-pie{border-top:1px solid var(--e-linea);padding:26px 20px;text-align:center;color:var(--e-suave);font-size:13px;background:transparent}
.e-pie a{color:var(--e-suave);margin:0 8px;text-decoration:none}
@media (hover: hover) and (pointer: fine){
.e-pie a:hover{color:var(--e-indigo)}}

/* ---------- Quiénes somos ---------- */
.e-qs-intro{margin:0;max-width:46rem;font-size:clamp(20px,2.3vw,26px);line-height:1.55;letter-spacing:-.01em}
.e-qs-autor{display:flex;align-items:center;gap:18px;max-width:46rem;margin-top:30px;padding:20px 22px;border-radius:22px;background:var(--e-superficie);border:1px solid var(--e-linea)}
.e-qs-autor p{margin:0;font-size:16px;line-height:1.6;color:var(--e-suave)}
.e-qs-autor strong{color:var(--e-tinta)}
.e-qs-avatar{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:68px;height:68px;border-radius:50%;background:var(--e-noche);color:#fff;font-weight:800;font-size:21px;transform:perspective(500px) rotateY(-18deg);box-shadow:8px 10px 0 -2px var(--e-lavanda)}
.e-pilares{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:40px;perspective:1200px}
.e-pilar{position:relative;background:var(--e-superficie);border:1px solid var(--e-linea);border-radius:26px;padding:30px;box-shadow:0 1px 2px rgba(30,27,75,.04),0 24px 48px -34px rgba(49,46,129,.3);transition:transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s}
@media (hover: hover) and (pointer: fine){
.e-pilar:hover{transform:translateY(-6px) rotateX(4deg);box-shadow:0 30px 60px -30px rgba(49,46,129,.45)}}
.e-pilar-num{position:absolute;top:10px;right:20px;font:400 72px/1 var(--e-cifras);color:var(--e-indigo);opacity:.14}
.e-pilar-icono{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:var(--e-tinte);color:var(--e-indigo);margin-bottom:28px}
.e-pilar h3{margin:0 0 8px;font:800 21px/1.25 var(--e-fuente);letter-spacing:-.02em;color:var(--e-noche)}
.e-pilar p{margin:0;color:var(--e-suave);line-height:1.6}
.e-cierre{position:relative;overflow:hidden;border-radius:36px;background:var(--e-marino);color:#fff;padding:64px 44px}
.e-cierre::before{content:"";position:absolute;right:-120px;top:-160px;width:480px;height:480px;border-radius:50%;background:var(--e-indigo);filter:blur(120px);opacity:.5}
.e-cierre>*{position:relative}
.e-cierre .e-h2{color:#fff;font-size:clamp(24px,3vw,36px);line-height:1.2;max-width:28ch}
.e-cierre p{margin:18px 0 28px;max-width:34rem;color:var(--e-lavanda-clara);font-size:17px;line-height:1.6}

/* ---------- Recursos y libros: piel sobre los estilos propios de la página ---------- */
.e-recursos .resources-section{padding-top:24px}
.e-recursos .card{border-radius:22px}
.e-recursos .btn-amazon,.e-recursos .btn-plantillas{border-radius:999px}
.e-recursos .finder input{border-radius:14px}
.e-recursos .featured-card{border-radius:32px;background:var(--e-marino)}
.e-recursos .block-title{letter-spacing:-.025em}

/* ---------- Blog: piel sobre los estilos propios de las páginas generadas ---------- */
.e-blog main{padding-top:36px}
.e-blog .card{border-radius:22px}
.e-blog .tabs a{border-radius:999px}
.e-blog h1,.e-blog h2,.e-blog h3{letter-spacing:-.02em}

@media (prefers-reduced-motion: reduce){.e-obj,.e-cab-texto>*{animation:none}.e-pilar,.e-boton{transition:none}}
.e-cab h1 em{font-style:normal;color:var(--e-lavanda)}

/* ---------- Páginas legales y contacto ---------- */
/* Su estilo propio pinta todas las etiquetas <header>: aquí se anula para el menú y la banda nuevos */
.e-pagina header.e-menu,.e-pagina header.e-cab{padding:0}
.e-legal main{max-width:760px;margin:0 auto;padding:56px 20px 80px;font-size:16px;line-height:1.75;color:var(--e-suave)}
.e-legal main b,.e-legal main strong{color:var(--e-tinta)}
.e-legal main p{margin:0 0 18px}
.e-legal main a{color:var(--e-indigo)}
.e-legal .notice{border-radius:18px;border:1px solid var(--e-linea);background:var(--e-tinte);color:var(--e-tinta);padding:18px 20px}

/* Más ligera: halos con degradado en vez de desenfoque y menú claro sin desenfocar lo de debajo */
.e-cab-luz{width:700px;height:700px;right:-210px;top:-330px;filter:none;opacity:1;background:radial-gradient(closest-side,rgba(79,70,229,.36),rgba(79,70,229,.13) 50%,rgba(79,70,229,0))}
.e-cierre::before{width:760px;height:760px;right:-260px;top:-300px;filter:none;opacity:1;background:radial-gradient(closest-side,rgba(79,70,229,.6),rgba(79,70,229,.22) 50%,rgba(79,70,229,0))}
html.e-menu-claro .e-menu{background:rgba(250,250,250,.97);-webkit-backdrop-filter:none;backdrop-filter:none}

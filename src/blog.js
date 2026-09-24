const { useState, useEffect } = React;

import { BLOG_ADMIN_EMAIL, C, NOMBRES_FASE_BLOG, SECCIONES_BLOG, supa } from './constantes.js';
import { fmtFecha, mdToHtml, slugify } from './calculos.js';
import { Eyebrow } from './ui-basicos.js';
import { AcordeonFase } from './secciones.js';

export function Blog({ user }) {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState('bolsa');
  const [faseAbierta, setFaseAbierta] = useState(1);
  const [slugAbierto, setSlugAbierto] = useState(null);
  const [editando, setEditando] = useState(null);
  const esAdmin = !!(user && user.email && user.email.toLowerCase() === BLOG_ADMIN_EMAIL.toLowerCase());
  window.__abrirPostBlog = setSlugAbierto;
  async function cargar() {
    setCargando(true);
let query = supa
  .from('posts')
  .select('*')
  .order('orden', { ascending: true, nullsFirst: false })
  .order('created_at', { ascending: true });    if (!esAdmin) query = query.eq('published', true);
    const { data } = await query;
    setPosts(data || []);
    setCargando(false);
  }
  useEffect(() => { cargar(); }, [esAdmin]);
  async function guardar(e) {
    e.preventDefault();
    const f = e.target;
    const esGuia = f.categoria_seccion.value === 'guia';
    const faseNueva = esGuia ? (Number(f.fase.value) || null) : null;
    let ordenNuevo = null;

    if (esGuia && faseNueva) {
      const postsDeLaFase = posts.filter(p =>
        p.categoria_seccion === 'guia' &&
        Number(p.fase) === Number(faseNueva) &&
        (!editando || p.id !== editando.id)
      );
      const maxOrden = postsDeLaFase.reduce(
        (max, p) => Math.max(max, Number(p.orden) || 0),
        0
      );

      if (
        editando &&
        Number(editando.fase) === Number(faseNueva) &&
        editando.orden != null
      ) {
        ordenNuevo = editando.orden;
      } else {
        ordenNuevo = maxOrden + 1;
      }
    }

    const payload = {
      title: f.title.value.trim(),
      slug: f.slug.value.trim() || slugify(f.title.value),
      excerpt: f.excerpt.value.trim(),
      content: f.content.value,
      category: f.category.value.trim() || 'General',
      author: f.author.value.trim() || 'Equipo MoneyPilot',
      cover_emoji: f.cover_emoji.value.trim() || '📊',
      published: f.published.checked,
      categoria_seccion: f.categoria_seccion.value,
      fase: faseNueva,
      orden: ordenNuevo,
      updated_at: new Date().toISOString()
    };
    let error;
    if (editando && editando.id) {
      ({ error } = await supa.from('posts').update(payload).eq('id', editando.id));
    } else {
      ({ error } = await supa.from('posts').insert(payload));
    }
    if (error) { alert('Error al guardar: ' + error.message); return; }
    setEditando(null);
    cargar();
  }
async function borrar(id) {
  if (!confirm('¿Borrar este artículo? No se puede deshacer.')) return;
  await supa.from('posts').delete().eq('id', id);
  cargar();
  }
  async function moverPost(post, direccion) {
  const postsFase = posts
    .filter(p =>
      p.categoria_seccion === 'guia' &&
      Number(p.fase) === Number(post.fase)
    )
    .sort((a, b) => {
      const oa = Number(a.orden) || 999999;
      const ob = Number(b.orden) || 999999;
      return oa - ob;
    });

  const indice = postsFase.findIndex(p => p.id === post.id);

  if (indice === -1) return;

  const nuevoIndice =
    direccion === 'arriba'
      ? indice - 1
      : indice + 1;

  if (nuevoIndice < 0 || nuevoIndice >= postsFase.length) return;

  const otroPost = postsFase[nuevoIndice];

  const ordenActual = Number(post.orden);
  const ordenOtro = Number(otroPost.orden);

  const { error: error1 } = await supa
    .from('posts')
    .update({ orden: ordenOtro })
    .eq('id', post.id);

  if (error1) {
    alert('Error al mover el artículo: ' + error1.message);
    return;
  }

  const { error: error2 } = await supa
    .from('posts')
    .update({ orden: ordenActual })
    .eq('id', otroPost.id);

  if (error2) {
    alert('Error al mover el artículo: ' + error2.message);
    return;
  }

  cargar();
}
  const post = slugAbierto ? posts.find(p => p.slug === slugAbierto) : null;
  if (post) {
    return /*#__PURE__*/React.createElement("div", {
      className: "max-w-3xl mx-auto px-4 sm:px-6 py-12"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setSlugAbierto(null),
      className: "text-sm font-bold mb-6",
      style: { color: C.sand }
    }, "← Volver al blog"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold uppercase mb-1",
      style: { color: C.mej, letterSpacing: "0.1em" }
    }, post.category || 'General'), /*#__PURE__*/React.createElement("h1", {
      className: "font-serif text-3xl font-bold mb-2",
      style: { color: C.ink }
    }, post.title), (post.categoria_seccion === 'guia' ? /*#__PURE__*/React.createElement("div", {
  className: "text-xs mb-8",
  style: { color: C.muted }
}, "Por ", post.author || 'Equipo MoneyPilot') : /*#__PURE__*/React.createElement("div", {
  className: "text-xs mb-8",
  style: { color: C.muted }
}, "Por ", post.author || 'Equipo MoneyPilot', " · ", fmtFecha(post.created_at))), /*#__PURE__*/React.createElement("div", {
      className: "prose-blog",
      style: { color: C.ink, lineHeight: 1.75 },
      dangerouslySetInnerHTML: { __html: mdToHtml(post.content) }
    }), /*#__PURE__*/React.createElement("div", {
      className: "mt-10 p-5 rounded-2xl text-sm",
      style: { backgroundColor: C.sandLight, color: C.navy }
    }, "¿Quieres aplicar esto a tu propio caso? Usa el ", /*#__PURE__*/React.createElement("button", {
      onClick: () => setSlugAbierto(null),
      className: "font-bold underline"
    }, "diagnóstico gratuito de MoneyPilot"), " arriba en el menú."));
  }
  const postsTab = posts.filter(p => (p.categoria_seccion || 'actualidad') === tab);
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 py-12"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Educación financiera"), /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-3xl sm:text-4xl font-bold mb-2",
    style: { color: C.ink }
  }, "Blog de finanzas personales"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mb-6",
    style: { color: C.muted }
  }, "Guías claras sobre ahorro, inversión y presupuesto, además de noticias financieras y análisis de empresas cotizadas."),

  /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mb-8"
  }, SECCIONES_BLOG.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.key,
    onClick: () => setTab(s.key),
    className: "px-4 py-2 rounded-full text-xs font-bold border",
    style: {
      borderColor: tab === s.key ? C.sand : C.border,
      backgroundColor: tab === s.key ? C.sand : C.paper,
      color: tab === s.key ? C.white : C.ink
    }
  }, s.label))),

  esAdmin && /*#__PURE__*/React.createElement("div", {
    className: "mb-8 p-4 rounded-2xl border",
    style: { borderColor: C.border, backgroundColor: C.paper }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: { color: C.muted }
  }, "Sesión de administrador — puedes escribir artículos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditando({
      title: '', slug: '', excerpt: '', content: '', category: '',
      author: '', cover_emoji: '📊', published: false,
      categoria_seccion: tab, fase: 1
    }),
    className: "text-xs font-bold px-3 py-1.5 rounded-lg",
    style: { backgroundColor: C.sand, color: C.white }
  }, "+ Nuevo artículo"))),

  editando && /*#__PURE__*/React.createElement("form", {
    onSubmit: guardar,
    className: "mb-10 p-5 rounded-2xl border space-y-3",
    style: { borderColor: C.border, backgroundColor: C.surface }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "font-serif font-bold",
    style: { color: C.ink }
  }, editando.id ? 'Editar artículo' : 'Nuevo artículo'),
  /*#__PURE__*/React.createElement("input", {
    name: "title", defaultValue: editando.title, placeholder: "Título", required: true,
    className: "w-full border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("input", {
    name: "slug", defaultValue: editando.slug, placeholder: "url-del-articulo (opcional, se genera solo)",
    className: "w-full border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("div", { className: "grid grid-cols-2 gap-3" },
    /*#__PURE__*/React.createElement("select", {
      name: "categoria_seccion", defaultValue: editando.categoria_seccion || tab,
      className: "border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
    }, SECCIONES_BLOG.map(s => /*#__PURE__*/React.createElement("option", { key: s.key, value: s.key }, s.label))),
    /*#__PURE__*/React.createElement("select", {
      name: "fase", defaultValue: editando.fase || 1,
      className: "border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
    }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("option", { key: n, value: n }, NOMBRES_FASE_BLOG[n])))
  ),
  /*#__PURE__*/React.createElement("p", {
    className: "text-[11px]", style: { color: C.mutedLight }
  }, "El selector de Fase solo se usa si arriba eliges \"Guía de educación financiera\"."),
  /*#__PURE__*/React.createElement("div", { className: "grid grid-cols-2 gap-3" },
    /*#__PURE__*/React.createElement("input", {
      name: "category", defaultValue: editando.category, placeholder: "Etiqueta (opcional)",
      className: "border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
    }),
    /*#__PURE__*/React.createElement("input", {
      name: "cover_emoji", defaultValue: editando.cover_emoji, placeholder: "Emoji",
      className: "border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
    })
  ),
  /*#__PURE__*/React.createElement("input", {
    name: "author", defaultValue: editando.author, placeholder: "Autor",
    className: "w-full border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("textarea", {
    name: "excerpt", defaultValue: editando.excerpt, placeholder: "Resumen corto", rows: "2",
    className: "w-full border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("textarea", {
    name: "content", defaultValue: editando.content,
    placeholder: "Contenido — usa ## para subtítulos y líneas normales para párrafos", rows: "12",
    className: "w-full border rounded-lg px-3 py-2 text-sm font-mono", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-2 text-sm", style: { color: C.ink }
  }, /*#__PURE__*/React.createElement("input", { type: "checkbox", name: "published", defaultChecked: editando.published }), " Publicado"),
  /*#__PURE__*/React.createElement("div", { className: "flex gap-2" },
    /*#__PURE__*/React.createElement("button", {
      className: "text-xs font-bold px-4 py-2 rounded-lg", style: { backgroundColor: C.sand, color: C.white }
    }, "Guardar"),
    /*#__PURE__*/React.createElement("button", {
      type: "button", onClick: () => setEditando(null),
      className: "text-xs font-bold px-4 py-2 rounded-lg", style: { backgroundColor: C.sandLight, color: C.navy }
    }, "Cancelar")
  )),

  cargando ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm", style: { color: C.muted }
  }, "Cargando artículos…") :

  tab === 'guia' ?
    /*#__PURE__*/React.createElement("div", null, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement(AcordeonFase, {
      key: n,
      numero: n,
      titulo: NOMBRES_FASE_BLOG[n],
      posts: postsTab.filter(p => Number(p.fase) === n),
abiertoPorDefecto: faseAbierta === n,
onAbrir: () => setFaseAbierta(faseAbierta === n ? null : n),
esAdmin: esAdmin,
onEditar: p => setEditando(p),
onBorrar: id => borrar(id),
      onMover: (p, direccion) => moverPost(p, direccion)
})))
  :
    postsTab.length === 0 ?
      /*#__PURE__*/React.createElement("p", {
        className: "text-sm", style: { color: C.muted }
      }, esAdmin ? 'Aún no has publicado ningún artículo aquí. Crea el primero.' : 'Muy pronto publicaremos aquí nuevos artículos.')
    :
      /*#__PURE__*/React.createElement("div", { className: "space-y-4" }, postsTab.map(p => /*#__PURE__*/React.createElement("div", {
        key: p.id,
        className: "border rounded-2xl p-5",
        style: { borderColor: C.border, backgroundColor: C.surface }
      }, /*#__PURE__*/React.createElement("div", { className: "flex items-start gap-4" },
        /*#__PURE__*/React.createElement("div", { className: "text-3xl" }, p.cover_emoji || '📊'),
        /*#__PURE__*/React.createElement("div", { className: "flex-1" },
          /*#__PURE__*/React.createElement("div", {
            className: "text-xs font-bold uppercase mb-1", style: { color: C.mej }
          }, p.category || 'General', !p.published && ' · Borrador'),
          /*#__PURE__*/React.createElement("button", {
            onClick: () => setSlugAbierto(p.slug),
            className: "font-serif font-bold text-lg text-left", style: { color: C.ink }
          }, p.title),
          /*#__PURE__*/React.createElement("p", { className: "text-sm mt-1", style: { color: C.muted } }, p.excerpt),
          /*#__PURE__*/React.createElement("div", {
            className: "text-xs mt-2", style: { color: C.mutedLight }
          }, p.author || 'Equipo MoneyPilot', " · ", fmtFecha(p.created_at)),
          esAdmin && /*#__PURE__*/React.createElement("div", { className: "mt-2 flex gap-3" },
            /*#__PURE__*/React.createElement("button", {
              onClick: () => setEditando(p), className: "text-xs font-bold", style: { color: C.sand }
            }, "Editar"),
            /*#__PURE__*/React.createElement("button", {
              onClick: () => borrar(p.id), className: "text-xs font-bold", style: { color: C.crit }
            }, "Borrar")
          )
        )
      )))));
}
export default Blog;

// Libro recomendado para cada artículo de la guía de educación financiera.
// El emparejamiento se hace por el título (o el slug) del artículo, según la matriz
// "Guía de Referencia Bibliográfica". Si un artículo no encaja con ninguna regla,
// simplemente no muestra tarjeta de libro.

export const LIBROS = {
  babilonia: { titulo: "El hombre más rico de Babilonia", autor: "George S. Clason", url: "https://amzn.to/4AutCuP", motivo: "Es el origen de la idea «págate a ti mismo primero»: la base de cualquier hábito de ahorro." },
  sethi: { titulo: "Te enseñaré a ser rico", autor: "Ramit Sethi", url: "https://amzn.to/4xI6vu2", motivo: "Defiende automatizar el ahorro y centrarse en las grandes victorias, como negociar el sueldo, en vez de recortar cafés." },
  kakebo: { titulo: "Kakebo: el arte japonés de ahorrar dinero", autor: "Fumiko Chiba", url: "https://amzn.to/4yhyke2", motivo: "Sirve para saber en qué gastas de verdad y categorizarlo antes de repartir tu presupuesto." },
  ramsey: { titulo: "La transformación total de su dinero", autor: "Dave Ramsey", url: "https://amzn.to/4jjOSNF", motivo: "Su primer paso es un fondo de emergencia y popularizó el método de la bola de nieve para pagar deudas." },
  samso: { titulo: "El código del dinero", autor: "Raimon Samsó", url: "https://amzn.to/4ykH0jW", motivo: "Explica por qué el dinero parado pierde valor y cambia la mentalidad con la que decides qué hacer con él." },
  padrerico: { titulo: "Padre Rico, Padre Pobre", autor: "Robert T. Kiyosaki", url: "https://amzn.to/4AOv2AL", motivo: "Su distinción entre activos y pasivos es la base para entender qué deuda ayuda y cuál te hunde." },
  bolsa: { titulo: "La bolsa o la vida", autor: "Vicki Robin", url: "https://amzn.to/4d1QQyv", motivo: "Te hace medir las compras en horas de vida y es la referencia fundacional del movimiento FIRE." },
  housel: { titulo: "La psicología del dinero", autor: "Morgan Housel", url: "https://amzn.to/4h9QFDH", motivo: "Muestra por qué el comportamiento pesa más que los ingresos y cómo evitar que tu estilo de vida se coma tu progreso." },
  stanley: { titulo: "El millonario de la puerta de al lado", autor: "Thomas J. Stanley", url: "https://amzn.to/4yWV177", motivo: "Demuestra que la riqueza real no viene de aparentar y analiza cómo transmitir patrimonio a los hijos." },
  lynch: { titulo: "Un paso por delante de Wall Street", autor: "Peter Lynch", url: "https://amzn.to/4xKwJMD", motivo: "Enseña a invertir en lo que ya conoces y es la mejor guía inicial si te planteas comprar acciones sueltas." },
  hardy: { titulo: "El efecto compuesto", autor: "Darren Hardy", url: "https://amzn.to/4yZh0ug", motivo: "Aunque no es puramente financiero, enseña cómo las acciones pequeñas y constantes producen grandes resultados con el tiempo." },
  graham: { titulo: "El inversor inteligente", autor: "Benjamin Graham", url: "https://amzn.to/3T7bkz7", motivo: "Obra maestra del value investing: ayuda a ignorar las fluctuaciones y a fijarte en el valor real." },
  bogle: { titulo: "El pequeño libro de la inversión con sentido común", autor: "John C. Bogle", url: "https://amzn.to/4jlTVNE", motivo: "Bogle creó los fondos indexados: explica por qué la gestión pasiva y los costes bajos ganan a largo plazo." },
  galan: { titulo: "Independízate de Papá Estado", autor: "Carlos Galán", url: "https://amzn.to/4dTrRxu", motivo: "Aterriza la inversión pasiva, los robo-advisors y las pensiones a la realidad y la fiscalidad españolas." },
  malkiel: { titulo: "Un paseo aleatorio por Wall Street", autor: "Burton Malkiel", url: "https://amzn.to/4hcomEL", motivo: "Pilar de la eficiencia de mercado: respalda el núcleo indexado de la cartera y examina otras estrategias." },
  dorsey: { titulo: "El pequeño libro que genera riqueza", autor: "Pat Dorsey", url: "https://amzn.to/4ADdLKH", motivo: "Ayuda a entender qué hace fuerte a una empresa, útil si quieres añadir inversiones temáticas." },
  robbins: { titulo: "Dinero: domina el juego", autor: "Tony Robbins", url: "https://amzn.to/3T7bHtv", motivo: "Reúne lo aprendido de grandes inversores buscando el equilibrio entre los números y la tranquilidad." },
  ninorico: { titulo: "Niño rico, niño listo", autor: "Robert T. Kiyosaki", url: "https://amzn.to/46JIOXl", motivo: "Pensado para madres y padres que quieren completar la escuela con educación financiera práctica." },
  libertad: { titulo: "Libertad financiera", autor: "Sergio Fernández", url: "https://amzn.to/47lItu4", motivo: "Adapta la independencia financiera y la regla del 4 % al contexto y la fiscalidad españoles." }
};

// [palabras que deben aparecer en el título/slug (sin tildes, en minúsculas), libro]
// Se evalúan en orden: la primera regla que encaja gana.
const REGLAS = [
  [["pagate a ti mismo"], "babilonia"],
  [["3 cuentas"], "sethi"],
  [["gastos fijos"], "kakebo"],
  [["bola de nieve"], "ramsey"],
  [["fondo de emergencia"], "ramsey"],
  [["cuentas remuneradas"], "samso"],
  [["deuda buena"], "padrerico"],
  [["tarjetas de credito"], "bolsa"],
  [["inflacion de estilo de vida"], "housel"],
  [["recortar gastos"], "sethi"],
  [["coste de oportunidad"], "stanley"],
  [["circulo de competencia"], "lynch"],
  [["interes compuesto"], "hardy"],
  [["horizonte temporal"], "graham"],
  [["planes de pensiones"], "galan"],
  [["fondos indexados"], "bogle"],
  [["robo advisor"], "galan"],
  [["core satellite"], "malkiel"],
  [["etfs tematicos"], "dorsey"],
  [["acciones sueltas"], "lynch"],
  [["apalancamiento"], "housel"],
  [["hipoteca"], "robbins"],
  [["primera casa"], "babilonia"],
  [["educacion financiera para padres"], "ninorico"],
  [["ciclo vital"], "bogle"],
  [["movimiento fire"], "bolsa"],
  [["regla del 4"], "libertad"],
  [["tranquilidad financiera"], "housel"],
  [["legado familiar"], "stanley"]
];

function normalizar(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function libroParaPost(post) {
  if (!post) return null;
  const texto = " " + normalizar(post.title) + " " + normalizar(post.slug) + " ";
  for (const [palabras, clave] of REGLAS) {
    if (palabras.every(p => texto.includes(p))) return LIBROS[clave];
  }
  return null;
}

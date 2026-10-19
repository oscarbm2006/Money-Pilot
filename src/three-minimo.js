// Solo las piezas de Three.js que usan las escenas 3D. Al importarlas por su nombre, la compilación descarta el
// resto de la librería y el archivo que se descarga pesa bastante menos que con "import * as THREE".
// Si una escena nueva necesita otra pieza, se añade aquí.
export {
  ACESFilmicToneMapping, AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CircleGeometry, Clock,
  Color, CylinderGeometry, DirectionalLight, DoubleSide, ExtrudeGeometry, Group, HemisphereLight, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, PMREMGenerator, PerspectiveCamera, PlaneGeometry, PointLight, Points, PointsMaterial, SRGBColorSpace,
  Scene, Shape, WebGLRenderer,
} from 'three';

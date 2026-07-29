# ✝️ Daat Devotional

**Red social para el estudio y reflexión bíblica**

---

## Información del Proyecto

| Campo | Detalle |
|-------|---------|
| **Nombre del proyecto** | Daat Devotional |
| **Nombre del estudiante** | [Tu nombre completo] |
| **Asignatura** | Fundamentos Web |
| **Periodo académico** | Tercer Parcial |
| **Año** | 2026 |

---

## Descripción

**Daat Devotional** es una red social cristiana diseñada para conectar a creyentes y estudiosos de la Biblia en una plataforma moderna y funcional. Inspirada en la palabra hebrea "Daat" (conocimiento), esta aplicación permite a los usuarios compartir reflexiones bíblicas, participar en foros de discusión, unirse a grupos de estudio y chatear en tiempo real con otros miembros de la comunidad.

El proyecto representa la evolución completa de una página web estática hacia una aplicación web dinámica e interactiva, implementando todas las tecnologías frontend modernas requeridas en el curso de Fundamentos Web.

---

## Objetivo

Desarrollar una aplicación web completa que integre:

- **HTML semántico** con estructura accesible y organizada
- **CSS responsivo** adaptable a dispositivos móviles, tabletas y escritorio
- **JavaScript dinámico** con manipulación del DOM y eventos
- **Persistencia de datos** mediante localStorage
- **Consumo de APIs externas** (países y clima)
- **Librerías funcionales** (SweetAlert2, Toastify, Chart.js)

---

## Funcionalidades

### Autenticación y Usuarios
- Registro de usuarios con validación de campos
- Selección de nacionalidad con bandera desde API de países
- Inicio de sesión con validación de credenciales
- Persistencia de sesión con sessionStorage
- Perfil de usuario con información personalizada

### Feed de Publicaciones
- Visualización dinámica de publicaciones desde JSON
- Búsqueda en tiempo real por título, contenido o autor
- Filtros por categoría y estado
- Ordenamiento por fecha y popularidad
- Creación de publicaciones con imagen, versículo y referencia
- Edición y eliminación de publicaciones propias
- Sistema de "Me gusta" con persistencia local

### Grupos de Estudio
- Visualización de grupos desde categorías
- Filtros por tipo de grupo
- Sistema de unirse/abandonar grupos
- Creación de grupos personalizados

### Foros de Discusión
- Temas de discusión con categorías
- Sistema de comentarios con persistencia
- "Me gusta" en temas del foro
- Búsqueda y filtros por categoría
- Creación de nuevos temas

### Chat en Tiempo Real
- Lista de contactos dinámica
- Mensajes entre usuarios con persistencia
- Indicador de mensajes no leídos
- Marcado de mensajes como leídos
- Actualización automática de mensajes

### Galería de Imágenes
- Grid de imágenes subidas por el usuario
- Vista detallada de publicaciones con SweetAlert2

### Estadísticas y Gráficos
- Panel de indicadores (publicaciones, usuarios, etc.)
- Gráfico de publicaciones por categoría con Chart.js
- Actualización automática de gráficos

### APIs Integradas
- **API de Países** (countries.dev): Selección de nacionalidad con bandera
- **API de Clima** (Open-Meteo): Clima actual de varias ciudades

### Librerías Funcionales
- **SweetAlert2**: Confirmaciones, alertas y modales informativos
- **Toastify**: Notificaciones breves y elegantes
- **Chart.js**: Gráficos estadísticos interactivos

---

## Tecnologías utilizadas

| Tecnología | Descripción |
|------------|-------------|
| **HTML5** | Estructura semántica del proyecto |
| **CSS3** | Estilos personalizados con variables CSS |
| **Bootstrap 5.3** | Framework CSS para diseño responsivo |
| **JavaScript (ES6+)** | Lógica de la aplicación, async/await, fetch |
| **JSON** | Almacenamiento de datos iniciales |
| **localStorage** | Persistencia de datos en el navegador |
| **sessionStorage** | Manejo de sesión de usuario |
| **Git** | Control de versiones |
| **GitHub Pages** | Publicación de la aplicación |

---

## Librerías incorporadas

| Librería | CDN | Uso |
|----------|-----|-----|
| **Bootstrap** | `cdn.jsdelivr.net/npm/bootstrap@5.3.8` | Diseño y componentes UI |
| **Font Awesome** | `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0` | Íconos y elementos visuales |
| **SweetAlert2** | `cdn.jsdelivr.net/npm/sweetalert2@11` | Alertas y modales interactivos |
| **Toastify** | `cdn.jsdelivr.net/npm/toastify-js` | Notificaciones breves |
| **Chart.js** | `cdn.jsdelivr.net/npm/chart.js` | Gráficos estadísticos |

---

## APIs consumidas

| API | Endpoint | Uso |
|-----|----------|-----|
| **Countries.dev** | `https://countries.dev/countries` | Obtener lista de países con banderas |
| **Open-Meteo** | `https://api.open-meteo.com/v1/forecast` | Consultar clima actual por ciudad |

---

## Estructura de carpetas
```
├── css
│   ├── chat.css
│   ├── foros.css
│   ├── general.css
│   ├── grupos.css
│   ├── index.css
│   ├── inicio.css
│   ├── login.css
│   ├── perfil.css
│   └── registro.css
├── imagenes
│   ├── LogoPrincipal.png
│   ├── Logos.png
│   ├── Perfil.png
│   ├── Snoppy.jpg
│   ├── atardecer.jpg
│   ├── atardecer1.jpg
│   ├── biblia.png
│   ├── casita.ico
│   ├── chat.ico
│   ├── estructura-carpetas.png
│   ├── foro.ico
│   ├── grupos.ico
│   ├── login.ico
│   ├── mensaje.png
│   ├── mundito.ico
│   ├── mundo.png
│   ├── noticia.jpg
│   ├── noticia2.jpg
│   ├── noticia3.jpg
│   ├── noticia4.jpg
│   ├── noticia5.jpg
│   ├── perfil.ico
│   ├── registro.ico
│   └── usuarios.png
├── js
│   ├── chat.js
│   ├── common.js
│   ├── foros.js
│   ├── grupos.js
│   ├── inicio.js
│   ├── login.js
│   ├── perfil.js
│   ├── registro.js
│   └── storage.js
├── json
│   ├── categorias.json
│   ├── publicaciones.json
│   └── usuarios.json
├── pages
│   ├── feed
│   │   ├── chat.html
│   │   ├── foros.html
│   │   ├── grupos.html
│   │   └── inicio.html
│   ├── formularios
│   │   ├── login.html
│   │   └── registro.html
│   └── usuario
│       └── perfil.html
├── videos
│   └── noticiaF.mp4
├── README.md
└── index.html
```
---

## Instrucciones para ejecutar el proyecto

### Requisitos previos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor local para cargar archivos JSON (Live Server recomendado)

### Pasos para ejecutar

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/jmherrera11-jpg/HERRERAFIGUEROA_JHONMARCOS_PROYECTO_INTEGRADOR_FUNDAMENTOS_WEB.git
   cd HERRERAFIGUEROA_JHONMARCOS_PROYECTO_INTEGRADOR_FUNDAMENTOS_WEB

2. **Abrir con Live Server**

- En VS Code: Instalar la extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"
- O usar cualquier servidor local (XAMPP, WAMP, etc.)

3. **Iniciar sesión**

Usar credenciales de prueba:

- Correo: `carlos.mendez@email.com`
- Contraseña: `Carlos2026*`

O registrarse como nuevo usuario.

4. **Explorar la aplicación**

- Navegar por las diferentes secciones
- Crear publicaciones, unirse a grupos, participar en foros

---

## Capturas principales

- Página de bienvenida: `imagenes/index.jpg`
- Feed de publicaciones: `imagenes/feed.jpg`
- Perfil de usuario: `imagenes/perfil.jpg`
- Foros de discusión: `imagenes/foros.jpg`
- Chat en tiempo real: `imagenes/chat.jpg`
- Grupos de estudio: `imagenes/grupos.jpg`

---

## Enlaces

| Enlace | URL |
|--------|-----|
| Repositorio GitHub | https://github.com/jmherrera11-jpg/HERRERAFIGUEROA_JHONMARCOS_PROYECTO_INTEGRADOR_FUNDAMENTOS_WEB.git |
| Aplicación publicada | https://github.com/jmherrera11-jpg/DaatDevotional.github.io.git |

---

## Estructura de datos JSON

### usuarios.json (30 registros)

```json
{
"id": 1,
"nombre": "María",
"apellido": "González",
"email": "maria.gonzalez@email.com",
"password": "Maria2026*",
"fechaNacimiento": "1990-05-15",
"nacionalidad": "Ecuador",
"biografia": "Apasionada por el estudio bíblico...",
"avatar": "https://images.unsplash.com/...",
"fechaRegistro": "2026-01-15",
"estado": "activo"
}
```

### publicaciones.json (40 registros)

```json
{
  "id": 1,
  "usuarioId": 1,
  "categoriaId": 1,
  "titulo": "El amor incondicional de Dios",
  "contenido": "Hoy reflexionaba sobre cómo el amor de Dios...",
  "versiculo": "Porque de tal manera amó Dios al mundo...",
  "referencia": "Juan 3:16",
  "imagen": "https://...",
  "fecha": "2026-07-20",
  "likes": 24,
  "comentarios": 8,
  "estado": "publicado"
}
```

### categorias.json (30 registros)

```json
{
  "id": 1,
  "nombre": "Nuevo Testamento",
  "descripcion": "Estudios y reflexiones basados en los libros del Nuevo Testamento",
  "icono": "fa-bible",
  "color": "#2E86AB"
}
```

---

## Autor

| Campo | Detalle |
|-------|---------|
| **Nombre** | [Jhon Marcos Herrera Figueroa] |
| **Asignatura** | Fundamentos Web |
| **Institución** | [Univerdidad de las fuerzas armadas ESPE] |

---

## Licencia

Este proyecto fue desarrollado con fines educativos como parte del curso de Fundamentos Web.

---

## Agradecimientos

- Al docente Geovanny Brito de la asignatura Fundamentos Web
- A la comunidad de desarrolladores de código abierto
- A las APIs gratuitas que hacen posible este proyecto

---

> "Los cielos cuentan la gloria de Dios, y el firmamento anuncia la obra de sus manos." — Salmos 19:1
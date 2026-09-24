# Documentación

# ¿Cómo usar en tu proyecto?

1. Clona este repositorio

```
git clone https://github.com/Flesan-Gestion/template_primevue_ts.git
```

2. Agrega el repositorio remoto de tu proyecto

```
git remote add origin-myproject https://github.com/Flesan-Gestion/myproject.git
```

3. Verifica que se haya guardado el repositorio remoto

```
git remote -v
```

4. Verás un listado como este donde debería figurar tu repositorio

```
> origin  https://github.com/seroven/template_primevue_ts.git (fetch)
> origin  https://github.com/seroven/template_primevue_ts.git (push)
> origin-myproject  https://github.com/seroven/myproject.git (fetch)
> origin-myproject  https://github.com/seroven/myproject.git (push)
```

5. Empuja la rama main a tu repositorio remoto

```
git push -u origin-myproject main
```

6. El template ya se encuentra en tu repositorio remoto. Ahora clona tu proyecto y trabaja sobre él.

```
git clone https://github.com/Flesan-Gestion/myproject.git
```

# Versiones

```
> node -> 18
```

# Dependencias

```
- primevue: 3.43.0
- primeicons: 6.0.1
- primeflex: 3.3.1
- xlsx: 0.18.5 (opcional para reportes en excel)
- pinia: 2.1.7
- vue-router: 4.2.5
```

```
npm install primevue@3.43.0 primeicons@6.0.1 primeflex@3.3.1 xlsx@0.18.5 pinia@2.1.7 vue-router@4.2.5
```

# ¿Cómo está estructurado la plantilla?

### Configuración del main.ts

```
import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'
import router from './routes/router';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Ripple from 'primevue/ripple';
import setGlobalComponents from './components';
import Tooltip from 'primevue/tooltip';
import GoogleSignInPlugin from "vue3-google-signin";

const app = createApp(App);
app.use(createPinia()); // Manejador de store global Pinia
app.use(router); // Vue router
app.use(PrimeVue, { injectLayer: 'primevue' }); // Librería UI PrimeVue
app.use(ToastService); // Service para los toast de PrimeVue
app.use(ConfirmationService); // Service para los confirm dialog de PrimeVue
app.use(GoogleSignInPlugin, {
    clientId: import.meta.env.APP_GOOGLE_CLIENT_ID,
}); // Configuración para la autenticación con Google a través del google client ID
app.directive('ripple', Ripple); // Directiva para la animación ripple de PrimeVue
app.directive('tooltip', Tooltip); // Directiva para los tooltip de PrimeVue
setGlobalComponents(app); // Seteo de componentes globales
app.mount('#app');
```

### Ejemplo de .env
```
APP_API_URL=http://localhost:8000/api
APP_API_HOST_URL=http://localhost:8000

APP_ROLE_01_ID=1
APP_ROLE_02_ID=2
APP_ROLE_03_ID=3

APP_GOOGLE_CLIENT_ID="..."
```

### Estructura del Proyecto

- Modules: Estos módulos serán las diferentes páginas y secciones del proyecto. Estos llevan una estructura.
  - routes.js: Es una configuración de las rutas de ese módulo. Luego importa estas rutas en el `routes.js` principal dentro de la ruta de primer nivel `panel`.
  - pages: **TODO ARCHIVO** que sea una **PÁGINA ENTERA** irá suelto dentro de la carpeta del módulo y terminará en Page como **UserListPage**.
  - components: Esta es una **carpeta** que contendrá componentes que no son una página entera pero que abarcan cierta lógica amplia y por ende no se colocan en una página para evitar sobrecargarla de código.
  - services: Esta es una **carpeta** que contendrá clases con **métodos estáticos** que harán llamadas a la api a través de axios. Esto para **mantener la comunicación con el backend en un solo lugar**. Los nombres de los servicios terminan en **Service** como **UserService**.
  - interfaces: Interfaces para definir la estructura de objetos.
- Layouts: Layout de autenticación y panel principal
- Components: Componentes adicionales y reutilizables. Contiene un `index.ts` que importa los componentes personalizados y los componentes más utilizados de PrimeVue.
- Shared:
  - Classes: Clases personalizadas.
  - Constants: Constantes personalizadas.
  - Services: Servicios con llamados a Apis reutilizables.
  - Enums: Enumerables reutilizables
- Config: Archivos de configuración.
- Guards: Guards para protección de rutas.
- Routes: Router y arreglo de rutas para vue router.
- Store: Almacén de estados globales. Cada archivo es un store distinto.
- Assets: Archivos como imágenes, svg, etc.

### Carpeta Shared y Utilities
- En la carpeta shared hay clases de las cuales las más importantes son 3:
   - EssentialForm: Clase para el manejo de formularios. Contiene métodos documentados.
   - EssentialFormControl: Clase para cada control o elemento del formulario. Contiene métodos documentados.
   - Utilities: Contiene métodos generales como para mostrar el loader, toast, modal de confirmación, navegación entre rutas, obtener archivos de imágenes y formateo de datos.

### Uso del store global
- Pinia, en líneas generales, es una librería que permite manejar variables reactivas a nivel de todo el aplicativo a diferencia de las variables reactivas que generamos en los componentes  que solo se pueden usar dentro del propio componente.
- En la carpeta store hay un store llamado global, este contiene el acceso a la clase Utilities como una propiedad del propio store global. También tiene acceso a constantes como las reglas de formularios, tipos de toast, etc.

### Modulo Base Users
- He elaborado un módulo CRUD simple donde muestro como usar un componente vue con typescript y qué estructura seguir al elaborar el componente para siempre mantener un orden.
- Allí también se ve como utilizo el store de global para casi todo. El objetivo de ese store global era centralizar los usos más comunes de ciertas funciones.
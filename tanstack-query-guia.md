# TanStack Query (React Query v5) — Manual de Referencia

> Manual completo para implementar TanStack Query en cualquier proyecto.
> Todos los ejemplos usan APIs públicas reales y son directamente aplicables.
> Fuente oficial: https://tanstack.com/query/latest

**APIs públicas usadas en los ejemplos:**

| API                  | Base URL                               | Para qué se usa                            |
| -------------------- | -------------------------------------- | ------------------------------------------ |
| **JSONPlaceholder**  | `https://jsonplaceholder.typicode.com` | CRUD completo — posts, users, todos        |
| **GitHub API**       | `https://api.github.com`               | GET de usuarios y repositorios             |
| **Pokémon API**      | `https://pokeapi.co/api/v2`            | Paginación e infinite scroll               |
| **Open-Meteo**       | `https://api.open-meteo.com/v1`        | Polling de datos en tiempo real (sin auth) |
| **Rick & Morty API** | `https://rickandmortyapi.com/api`      | Queries dependientes y paralelas           |

---

## Índice

1. [¿Qué problema resuelve?](#1--qué-problema-resuelve-tanstack-query)
2. [Instalación y configuración](#2--instalación-y-configuración)
3. [Devtools — tu mejor aliado](#3--devtools--tu-mejor-aliado)
4. [useQuery — leer datos](#4--usequery-leer-datos)
5. [queryKey — el identificador del caché · Query Key Factory](#5--querykey-el-identificador-del-caché)
6. [queryFn — la función que hace el fetch](#6--queryfn-la-función-que-hace-el-fetch)
7. [enabled — queries condicionales](#7--enabled-queries-condicionales)
8. [status vs fetchStatus — dos estados distintos](#8--status-vs-fetchstatus-dos-estados-distintos)
9. [useMutation — crear/actualizar/borrar datos](#9--usemutation-crearactualizarborrar-datos)
10. [mutate vs mutateAsync](#10--mutate-vs-mutateasync)
11. [Callbacks — onMutate, onSuccess, onError, onSettled](#11--callbacks-en-usemutation)
12. [Invalidar caché — useQueryClient](#12--invalidar-caché-usequeryclient)
13. [Queries dependientes](#13--queries-dependientes-una-depende-de-otra)
14. [Queries en paralelo — useQueries](#14--queries-en-paralelo-usequeries)
15. [Queries paginadas](#15--queries-paginadas)
16. [Infinite scroll — useInfiniteQuery](#16--infinite-scroll-useinfinitequery)
17. [Actualizaciones optimistas](#17--actualizaciones-optimistas)
18. [Opciones avanzadas de useQuery](#18--opciones-avanzadas-de-usequery)
19. [useMutationState — estado global de mutaciones](#19--usemutationstate-estado-global-de-mutaciones)
20. [Organizar hooks por dominio · `queryOptions()`](#20--organizar-hooks-por-dominio)
21. [Resumen: cuándo usar cada herramienta](#21--resumen-cuándo-usar-cada-herramienta)

---

## 1 — ¿Qué problema resuelve TanStack Query?

Sin TanStack Query, para hacer una llamada a una API necesitas gestionar manualmente el estado:

```tsx
const [posts, setPosts] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setIsLoading(true);
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(res => res.json())
    .then(data => {
      setPosts(data);
      setIsLoading(false);
    })
    .catch(err => {
      setError(err);
      setIsLoading(false);
    });
}, []);
```

Con TanStack Query:

```tsx
const {
  data: posts,
  isLoading,
  error,
} = useQuery({
  queryKey: ['posts'],
  queryFn: () => fetch('https://jsonplaceholder.typicode.com/posts').then(res => res.json()),
});
```

TanStack Query gestiona automáticamente:

| Característica             | Descripción                                                            |
| -------------------------- | ---------------------------------------------------------------------- |
| **Caché**                  | Guarda los datos y no repite peticiones innecesarias                   |
| **Loading / Error states** | `isLoading`, `isError`, `isSuccess` listos para usar                   |
| **Re-fetch automático**    | Al volver a la pestaña, al reconectar, por intervalo...                |
| **Deduplicación**          | Si 3 componentes piden los mismos datos a la vez, solo hace 1 petición |
| **Background updates**     | Actualiza en segundo plano sin bloquear la UI                          |
| **Retry automático**       | Reintenta automáticamente si hay un error de red                       |
| **Stale-while-revalidate** | Muestra datos del caché inmediatamente y actualiza en background       |

---

## 2 — Instalación y configuración

```bash
npm install @tanstack/react-query
```

### Configuración básica

```tsx
// main.tsx o providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}
```

### Configuración con opciones globales (recomendado para producción)

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min antes de considerar los datos obsoletos
      gcTime: 1000 * 60 * 10, // 10 min en caché después de desmontar
      retry: 2, // 2 reintentos si falla
      refetchOnWindowFocus: true, // re-fetch al volver a la pestaña
    },
    mutations: {
      retry: 0, // las mutaciones no reintentan por defecto
    },
  },
});
```

---

## 3 — Devtools — tu mejor aliado

**¿Qué es?** Una herramienta visual que muestra el estado interno de todas las queries y mutations en tiempo real.

**¿Cuándo usarlo?** Siempre en desarrollo. Te ahorra horas de debugging.

### Instalación

```bash
npm install @tanstack/react-query-devtools
```

### Uso en Next.js App Router

```tsx
// providers.tsx
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Opciones del panel

```tsx
<ReactQueryDevtools
  initialIsOpen={false} // empieza cerrado (recomendado)
  buttonPosition="bottom-right" // posición del botón flotante
  position="bottom" // posición del panel: 'top' | 'bottom' | 'left' | 'right'
/>
```

### ¿Qué muestra?

- Estado de cada query: `pending`, `success`, `error`, `stale`, `inactive`
- Cuándo expira el caché de cada query
- El JSON con los datos en caché (inspección completa)
- Las mutations ejecutadas y su estado
- Botones para invalidar o hacer refetch manual de cualquier query

> En producción **NO se incluye** automáticamente (solo si `NODE_ENV === 'development'`).

---

## 4 — `useQuery` — leer datos

**¿Qué es?** El hook principal para **obtener datos** de una API.

**¿Cuándo usarlo?** Cuando necesitas mostrar datos del servidor (peticiones GET).

**Clave:** Se ejecuta **automáticamente** cuando el componente se monta. No necesitas llamarlo explícitamente.

### Estructura básica

```tsx
const resultado = useQuery({
  queryKey: ['identificador-unico'], // clave del caché
  queryFn: () => llamadaAlServidor(), // función que retorna una Promise
});
```

### Todas las propiedades que devuelve

| Propiedad        | Tipo                                | Descripción                                                             |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `data`           | `T \| undefined`                    | Los datos devueltos por `queryFn`. `undefined` hasta que carga          |
| `isPending`      | `boolean`                           | `true` cuando no hay datos todavía (primera carga, sin caché)           |
| `isLoading`      | `boolean`                           | Lo mismo que `isPending && isFetching` — carga inicial activa           |
| `isFetching`     | `boolean`                           | `true` siempre que está haciendo fetch (incluye re-fetch en background) |
| `isError`        | `boolean`                           | `true` si ocurrió un error                                              |
| `error`          | `Error \| null`                     | El objeto de error                                                      |
| `isSuccess`      | `boolean`                           | `true` cuando los datos se cargaron correctamente                       |
| `isStale`        | `boolean`                           | `true` si los datos se consideran obsoletos (pasó el `staleTime`)       |
| `isRefetching`   | `boolean`                           | `true` si está actualizando datos que ya existían en caché              |
| `refetch`        | `function`                          | Fuerza una recarga manual                                               |
| `status`         | `'pending' \| 'error' \| 'success'` | Estado de los datos (ver sección 8)                                     |
| `fetchStatus`    | `'fetching' \| 'paused' \| 'idle'`  | Estado de la red (ver sección 8)                                        |
| `dataUpdatedAt`  | `number`                            | Timestamp de la última actualización exitosa                            |
| `errorUpdatedAt` | `number`                            | Timestamp del último error                                              |
| `failureCount`   | `number`                            | Número de reintentos fallidos consecutivos                              |
| `failureReason`  | `Error \| null`                     | Error del último intento fallido                                        |

### Ejemplo completo con manejo de estados

```tsx
// Tipos
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// Función de servicio (separada del hook)
const getPosts = (): Promise<Post[]> =>
  fetch('https://jsonplaceholder.typicode.com/posts').then(res => {
    if (!res.ok) throw new Error('Error al obtener posts');
    return res.json();
  });

// Hook personalizado
export const usePosts = () =>
  useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

// Componente que lo consume
function ListaDePosts() {
  const { isPending, isError, data: posts, error, isFetching } = usePosts();

  if (isPending) return <Spinner />;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      {isFetching && <span>Actualizando...</span>} {/* re-fetch en background */}
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Obtener un único elemento por ID

```tsx
// GET https://jsonplaceholder.typicode.com/posts/1
const getPost = (id: number): Promise<Post> => fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(res => res.json());

export const usePost = (id: number) =>
  useQuery({
    queryKey: ['posts', id], // clave única por ID
    queryFn: () => getPost(id),
    enabled: !!id, // no ejecuta si id es 0 o undefined
  });
```

### Obtener datos de GitHub

```tsx
interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
}

const getGitHubUser = (username: string): Promise<GitHubUser> =>
  fetch(`https://api.github.com/users/${username}`).then(res => {
    if (!res.ok) throw new Error(`Usuario '${username}' no encontrado`);
    return res.json();
  });

export const useGitHubUser = (username: string) =>
  useQuery({
    queryKey: ['github', 'user', username],
    queryFn: () => getGitHubUser(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 10, // los datos de GitHub no cambian tan seguido
  });

// Uso en componente
function PerfilGitHub({ username }: { username: string }) {
  const { data: user, isPending, isError } = useGitHubUser(username);

  if (isPending) return <Skeleton />;
  if (isError) return <p>Usuario no encontrado</p>;

  return (
    <div>
      <img src={user.avatar_url} alt={user.login} />
      <h2>{user.name}</h2>
      <p>
        {user.public_repos} repositorios · {user.followers} seguidores
      </p>
    </div>
  );
}
```

---

## 5 — `queryKey`: el identificador del caché

**¿Qué es?** El "nombre de la caja" donde TanStack guarda los datos. Debe ser **único** para cada variante de datos.

**Regla clave:** Si el `queryKey` cambia → TanStack hace una nueva petición automáticamente.

### Formas válidas

```tsx
queryKey: ['posts']; // clave simple → todos los posts
queryKey: ['posts', 1]; // post con id=1 → caché propio
queryKey: ['posts', postId]; // varía según el ID
queryKey: ['github', 'user', username]; // namespacing jerárquico
queryKey: ['posts', { status: 'published' }]; // con filtros como objeto
queryKey: ['weather', { lat: 40.4, lon: -3.7 }]; // con coordenadas
```

### ¿Por qué importa el caché compartido?

```tsx
// ComponenteA — página de inicio
useQuery({ queryKey: ['posts'], queryFn: getPosts });

// ComponenteB — sidebar (diferente componente, MISMA clave)
useQuery({ queryKey: ['posts'], queryFn: getPosts });
// ✅ No hace una segunda petición HTTP — reutiliza el caché del ComponenteA
```

```tsx
// Si cambia el parámetro, hace una nueva petición
useQuery({ queryKey: ['posts', 1], queryFn: () => getPost(1) });
useQuery({ queryKey: ['posts', 2], queryFn: () => getPost(2) });
// Cada ID tiene su propio caché independiente
```

### Buenas prácticas: Query Key Factory

En aplicaciones reales, gestionar `queryKey` como strings sueltos es frágil: un typo rompe el caché en silencio y no hay autocompletado. El patrón **Query Key Factory** (recomendado por [TkDodo](https://tkdodo.eu/blog/effective-react-query-keys), maintainer de TanStack) centraliza todas las claves en un objeto jerárquico donde cada función de clave **extiende** a la anterior usando spreads.

```tsx
// api/hooks/postKeys.ts
export const postKeys = {
  /** Raíz — invalida TODO lo relacionado con posts */
  all: ['posts'] as const,

  /** Padre de todas las listas */
  lists: () => [...postKeys.all, 'list'] as const,
  /** Lista con filtros/paginación opcionales */
  list: (params?: object) => [...postKeys.lists(), params] as const,

  /** Padre de todos los detalles */
  details: () => [...postKeys.all, 'detail'] as const,
  /** Detalle de un post concreto */
  detail: (id: number) => [...postKeys.details(), id] as const,
};
```

**Granularidad de invalidación — prefix matching:**

```tsx
// Invalida TODO (listas + detalles)
queryClient.invalidateQueries({ queryKey: postKeys.all });

// Invalida solo listas (no toca los detalles)
queryClient.invalidateQueries({ queryKey: postKeys.lists() });

// Invalida solo el post con id=5
queryClient.invalidateQueries({ queryKey: postKeys.detail(5) });
```

> `invalidateQueries` usa **prefix matching**: invalida cualquier query cuya clave empiece por la clave dada. Gracias a los spreads, `['posts']` es prefijo automático de `['posts', 'list', {...}]` y `['posts', 'detail', 5]`. Al invalidar un nivel padre, todos sus descendientes quedan invalidados en cascada.

---

## 6 — `queryFn` — la función que hace el fetch

**¿Qué es?** La función que TanStack llama para obtener los datos. Debe devolver una `Promise` que resuelva con los datos o lance un error.

```tsx
// Forma 1 — inline con fetch nativo (siempre verifica res.ok)
queryFn: () =>
  fetch('https://jsonplaceholder.typicode.com/posts').then(res => {
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return res.json();
  });

// Forma 2 — con axios (lanza error automáticamente en 4xx/5xx)
queryFn: () => axios.get('/api/posts').then(res => res.data);

// Forma 3 — función async separada (más limpia y testeable)
const getPosts = async (): Promise<Post[]> => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
};

useQuery({ queryKey: ['posts'], queryFn: getPosts });
```

### Acceder al queryKey y a la señal de cancelación dentro de queryFn

```tsx
// TanStack pasa un objeto 'context' a queryFn con queryKey y signal
useQuery({
  queryKey: ['posts', userId],
  queryFn: async ({ queryKey, signal }) => {
    const [, id] = queryKey; // extrae el userId de la clave
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}/posts`,
      { signal }, // ← pasa el signal para cancelación automática
    );
    if (!res.ok) throw new Error('Error al obtener posts');
    return res.json();
  },
});
// Si el componente se desmonta antes de que termine, la petición se cancela
```

### Patrón: servicio separado del hook

```tsx
// api/posts.service.ts — funciones puras, sin TanStack
export const postsService = {
  getAll: (): Promise<Post[]> => fetch('https://jsonplaceholder.typicode.com/posts').then(r => r.json()),

  getById: (id: number): Promise<Post> => fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(r => r.json()),

  create: (post: Omit<Post, 'id'>): Promise<Post> =>
    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    }).then(r => r.json()),

  update: (id: number, post: Partial<Post>): Promise<Post> =>
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    }).then(r => r.json()),

  delete: (id: number): Promise<void> =>
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'DELETE',
    }).then(() => undefined),
};

// api/hooks/usePosts.ts — solo lógica de TanStack
export const usePosts = () => useQuery({ queryKey: ['posts'], queryFn: postsService.getAll });

export const usePost = (id: number) => useQuery({ queryKey: ['posts', id], queryFn: () => postsService.getById(id) });
```

---

## 7 — `enabled`: queries condicionales

**¿Qué es?** Opción booleana que controla si la query debe ejecutarse.

**¿Cuándo usarlo?**

- Cuando necesitas un dato antes de poder hacer la petición (dependencias)
- Cuando la query solo tiene sentido en ciertos estados
- Para evitar llamadas con datos inválidos (id vacío, null, etc.)

```tsx
// Patrón básico
useQuery({
  queryKey: ['posts', postId],
  queryFn: () => getPost(postId),
  enabled: !!postId, // solo ejecuta si postId tiene valor truthy
});

// !!0        → false → NO ejecuta
// !!1        → true  → SÍ ejecuta
// !!null     → false → NO ejecuta
// !!''       → false → NO ejecuta
// !!'hello'  → true  → SÍ ejecuta
```

### Casos de uso comunes

```tsx
// 1. Solo si hay un elemento seleccionado en la UI
const [selectedId, setSelectedId] = useState<number | null>(null);

const { data: post } = useQuery({
  queryKey: ['posts', selectedId],
  queryFn: () => getPost(selectedId!),
  enabled: selectedId !== null,
});

// 2. Solo si el usuario está autenticado
const { isAuthenticated } = useAuth();

const { data: profile } = useQuery({
  queryKey: ['github', 'user', username],
  queryFn: () => getGitHubUser(username),
  enabled: isAuthenticated && !!username,
});

// 3. Solo si una query previa terminó con éxito
const { data: user, isSuccess: userLoaded } = useQuery({
  queryKey: ['github', 'user', 'octocat'],
  queryFn: () => getGitHubUser('octocat'),
});

const { data: repos } = useQuery({
  queryKey: ['github', 'repos', user?.login],
  queryFn: () => getGitHubRepos(user!.login),
  enabled: userLoaded, // espera a que el usuario haya cargado
});
```

### Query deshabilitada manualmente con `refetch`

```tsx
// enabled: false → no ejecuta automáticamente, pero puedes llamar refetch() cuando quieras
const { data, refetch, isFetching } = useQuery({
  queryKey: ['github', 'user', username],
  queryFn: () => getGitHubUser(username),
  enabled: false, // no se ejecuta al montar
});

return (
  <button onClick={() => refetch()} disabled={isFetching}>
    {isFetching ? 'Buscando...' : 'Buscar usuario'}
  </button>
);
```

---

## 8 — `status` vs `fetchStatus`: dos estados distintos

TanStack Query tiene **dos estados independientes** que conviene entender bien:

### `status` — ¿tenemos datos?

```
'pending'  → No hay datos todavía (nunca han llegado o se borró el caché)
'error'    → Ocurrió un error y no hay datos
'success'  → Hay datos disponibles (pueden ser del caché o frescos)
```

### `fetchStatus` — ¿está haciendo petición ahora mismo?

```
'fetching' → Está ejecutando queryFn en este momento
'paused'   → Quiere hacer fetch pero no hay conexión de red
'idle'     → No está haciendo ninguna petición
```

### ¿Por qué dos estados?

Porque pueden darse combinaciones diferentes al mismo tiempo:

| status    | fetchStatus | Situación real                                    |
| --------- | ----------- | ------------------------------------------------- |
| `pending` | `fetching`  | Primera carga — no hay datos y está pidiendo      |
| `pending` | `paused`    | Sin red — esperando reconexión (nunca hubo datos) |
| `pending` | `idle`      | Query deshabilitada (`enabled: false`)            |
| `success` | `idle`      | Tiene datos, no está actualizando — estado normal |
| `success` | `fetching`  | Tiene datos y está actualizando en background     |
| `error`   | `idle`      | Falló y no va a reintentar más                    |
| `error`   | `fetching`  | Falló pero está reintentando                      |

### Cómo usarlos en la UI

```tsx
function PostsPanel() {
  const {
    status,
    fetchStatus,
    data: posts,
    isFetching,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  // status controla lo que muestra el panel principal
  if (status === 'pending') return <SpinnerCentral />;
  if (status === 'error') return <ErrorPanel />;

  // fetchStatus / isFetching controla el indicador de actualización
  return (
    <div>
      {isFetching && <BarraDeProgreso />} {/* actualización en background */}
      <ul>
        {posts.map(p => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Helpers booleanos derivados

```tsx
const {
  isPending,      // status === 'pending'
  isSuccess,      // status === 'success'
  isError,        // status === 'error'
  isLoading,      // isPending && isFetching  (solo primera carga activa)
  isFetching,     // fetchStatus === 'fetching'
  isPaused,       // fetchStatus === 'paused'
  isRefetching,   // isFetching && !isPending (actualiza datos que ya existían)
} = useQuery({ ... });
```

---

## 9 — `useMutation` — crear/actualizar/borrar datos

**¿Qué es?** El hook para operaciones que **modifican datos** en el servidor.

**¿Cuándo usarlo?** Para cualquier acción que cambia algo: POST, PUT, PATCH, DELETE.

**Diferencia clave con `useQuery`:** NO se ejecuta automáticamente. Lo disparas tú con `.mutate()` o `.mutateAsync()`.

### Estructura básica

```tsx
const mutation = useMutation({
  mutationFn: variables => llamadaAPI(variables),
});
```

### Todas las propiedades que devuelve

| Propiedad      | Tipo                                          | Descripción                                              |
| -------------- | --------------------------------------------- | -------------------------------------------------------- |
| `mutate`       | `function`                                    | Dispara la mutación. No devuelve Promise. Usa callbacks. |
| `mutateAsync`  | `async function`                              | Dispara y devuelve una Promise. Usa `await`.             |
| `isPending`    | `boolean`                                     | `true` mientras se está ejecutando                       |
| `isSuccess`    | `boolean`                                     | `true` si terminó sin errores                            |
| `isError`      | `boolean`                                     | `true` si hubo un error                                  |
| `isIdle`       | `boolean`                                     | `true` si todavía no se ha ejecutado (estado inicial)    |
| `data`         | `T \| undefined`                              | El dato que devolvió la mutación si fue exitosa          |
| `error`        | `Error \| null`                               | El error si falló                                        |
| `variables`    | `TVariables \| undefined`                     | Lo que se pasó a `mutate()` en el último llamado         |
| `reset`        | `function`                                    | Limpia el estado — vuelve a `idle`                       |
| `status`       | `'idle' \| 'pending' \| 'success' \| 'error'` | Estado actual                                            |
| `submittedAt`  | `number`                                      | Timestamp de cuándo se llamó a `mutate()`                |
| `failureCount` | `number`                                      | Número de reintentos fallidos                            |

### POST — Crear un post (JSONPlaceholder)

```tsx
interface CreatePostPayload {
  title: string;
  body: string;
  userId: number;
}

const createPost = (payload: CreatePostPayload): Promise<Post> =>
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(res => res.json());

export const useCreatePost = () => useMutation({ mutationFn: createPost });

// Uso en componente
function NuevoPost() {
  const { mutate, isPending, isError, error, isSuccess, reset } = useCreatePost();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate({ title: 'Mi post', body: 'Contenido del post', userId: 1 });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Publicando...' : 'Publicar'}
      </button>

      {isSuccess && <p>Post publicado.</p>}

      {isError && (
        <div>
          <p>Error: {error.message}</p>
          <button type="button" onClick={reset}>
            Cerrar
          </button>
        </div>
      )}
    </form>
  );
}
```

### PUT — Actualizar un post

```tsx
interface UpdatePostPayload {
  id: number;
  title?: string;
  body?: string;
}

const updatePost = ({ id, ...data }: UpdatePostPayload): Promise<Post> =>
  fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json());

export const useUpdatePost = () => useMutation({ mutationFn: updatePost });
```

### DELETE — Borrar un post

```tsx
const deletePost = (id: number): Promise<void> =>
  fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: 'DELETE',
  }).then(() => undefined);

export const useDeletePost = () => useMutation({ mutationFn: deletePost });

// Uso con confirmación
function BotonesPost({ postId }: { postId: number }) {
  const { mutate: deletePost, isPending } = useDeletePost();

  return (
    <button onClick={() => deletePost(postId)} disabled={isPending}>
      {isPending ? 'Borrando...' : 'Borrar'}
    </button>
  );
}
```

### Resetear estado con `reset()`

```tsx
const { mutate, isError, error, reset } = useMutation({ mutationFn: createPost });

// Después de un error, el usuario puede cerrar el mensaje y reintentar
{
  isError && (
    <div className="error-toast">
      <p>{error.message}</p>
      <button onClick={reset}>✕</button> {/* limpia el estado de error */}
    </div>
  );
}
```

### POST con muchos campos — tipando el objeto completo con un `type`

Cuando el formulario tiene muchos campos, lo más limpio es definir el tipo fuera del hook y referenciarlo en `mutationFn`. El hook queda legible sin importar cuántos campos tenga el payload.

> Patrón extraído de `useExport` del proyecto con la API de JSONPlaceholder adaptado a un caso real con 15+ campos.

```ts
// types/post.types.ts — defines todos los campos del payload en un solo lugar
export type CreateFullPostPayload = {
  // Datos principales
  title: string;
  body: string;
  userId: number;

  // Metadatos opcionales
  category?: string;
  subcategory?: string;
  tags?: string[];
  language?: string;
  status?: 'draft' | 'published' | 'archived';

  // SEO
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;

  // Multimedia
  coverImageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;

  // Configuración
  allowComments?: boolean;
  isPinned?: boolean;
};
```

```ts
// service/api.service.ts — la función que arma el body HTTP
import type { CreateFullPostPayload } from '../types/post.types';

export const createFullPost = (payload: CreateFullPostPayload) =>
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), // envía todos los campos de una vez
  }).then(res => res.json());
```

```ts
// hooks/useCreateFullPost.ts — el hook recibe el tipo, no repite la definición
import { useMutation } from '@tanstack/react-query';
import { createFullPost } from '../service/api.service';
import type { CreateFullPostPayload } from '../types/post.types';

export const useCreateFullPost = () =>
  useMutation({
    mutationFn: (variables: CreateFullPostPayload) => createFullPost(variables),
  });
```

```tsx
// Componente — llama a mutate() con todos los campos del formulario
function NuevoArticulo() {
  const { mutate, isPending, isSuccess } = useCreateFullPost();

  const handleSubmit = (formData: CreateFullPostPayload) => {
    mutate({
      title: formData.title,
      body: formData.body,
      userId: 1,
      category: formData.category,
      tags: formData.tags,
      status: 'published',
      slug: formData.slug,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      coverImageUrl: formData.coverImageUrl,
      allowComments: true,
      isPinned: false,
      // ... los que necesites
    });
  };

  return (
    <button onClick={() => handleSubmit(datosDelFormulario)} disabled={isPending}>
      {isPending ? 'Publicando...' : 'Publicar artículo'}
    </button>
  );
}
```

**Ventaja clave:** si mañana añades un campo nuevo, solo lo agregas al `type`. El hook y el service lo recogen automáticamente sin tocar nada más.

| Capa             | Responsabilidad                                     |
| ---------------- | --------------------------------------------------- |
| `types/*.ts`     | Define los campos — la única fuente de verdad       |
| `service/*.ts`   | Construye la petición HTTP con esos campos          |
| `hooks/*.ts`     | Conecta TanStack con el service, tipado por el type |
| `componente.tsx` | Llama a `mutate()` con los valores del formulario   |

### Estilo recomendado — `variables: MiType` en lugar de desestructurar

Cuando el payload tiene muchos campos, en lugar de desestructurar todo en los parámetros, es más limpio recibir el objeto completo tipado y acceder con `variables.campo`. El tipo viene del archivo de types y no se repite en el hook.

```ts
// types/export.types.ts — defines los campos una sola vez
export type ExportRequest = {
  sessionId: string;
  fmt: 'zip';
  file_name?: string;
  folder_name?: string;
  url?: string;
};
```

```ts
// service/api.service.ts — función que construye el body HTTP
export const exportProposal = (sessionId: string, fmt: string, file_name?: string, folder_name?: string, url?: string): Promise<Blob> =>
  apiClient.post(`/export/${sessionId}/${fmt}`, { file_name, folder_name, url }, { responseType: 'blob' }).then(res => res.data);
```

```ts
// hooks/useExport.ts — el hook importa el type, no lo repite
import { useMutation } from '@tanstack/react-query';
import { exportProposal } from '../service/api.service';
import type { ExportRequest } from '../types/export.types';

export const useExport = () =>
  useMutation({
    mutationFn: (variables: ExportRequest) =>
      exportProposal(
        variables.sessionId, // ← accedes con variables.campo
        variables.fmt,
        variables.file_name,
        variables.folder_name,
        variables.url,
      ),
  });
```

```tsx
// Componente — mutate() recibe el objeto completo tipado
const exportProposal = useExport();

exportProposal.mutate({
  sessionId,
  fmt: 'zip',
  file_name: exportFileName.trim(),
  folder_name: exportFolderName.trim(),
  url: exportUrl.trim(),
});
```

**¿Por qué `variables.campo` y no desestructurar?**

```ts
// ❌ Desestructurando — línea muy larga si hay muchos campos
mutationFn: ({ sessionId, fmt, file_name, folder_name, url, campo4, campo5 }: ExportRequest) =>
  exportProposal(sessionId, fmt, file_name, folder_name, url, campo4, campo5)

// ✅ Con variables — más legible, escala bien con muchos campos
mutationFn: (variables: ExportRequest) =>
  exportProposal(variables.sessionId, variables.fmt, variables.file_name ...)
```

Las dos son **idénticas en runtime**, solo difieren en legibilidad.

---

## 10 — `mutate` vs `mutateAsync`

### `mutate` — para acciones simples con callbacks

```tsx
const { mutate } = useCreatePost();

// Argumentos: (variables, { onSuccess, onError, onSettled })
mutate(
  { title: 'Nuevo post', body: 'Contenido', userId: 1 },
  {
    onSuccess: data => {
      console.log('Post creado con ID:', data.id);
      router.push(`/posts/${data.id}`);
    },
    onError: error => {
      toast.error(`No se pudo crear: ${error.message}`);
    },
    onSettled: () => {
      setSubmitting(false);
    },
  },
);
```

### `mutateAsync` — para encadenar operaciones que dependen entre sí

```tsx
const createPost = useCreatePost();
const uploadImage = useUploadImage();
const notifyFollowers = useNotifyFollowers();

const handlePublish = async (formData: FormData) => {
  try {
    // 1. Sube la imagen primero
    const { imageUrl } = await uploadImage.mutateAsync(formData.image);

    // 2. Crea el post con la URL de la imagen
    const post = await createPost.mutateAsync({
      title: formData.title,
      body: formData.body,
      imageUrl,
      userId: 1,
    });

    // 3. Notifica a seguidores con el ID del post recién creado
    await notifyFollowers.mutateAsync({ postId: post.id });

    toast.success('Post publicado y seguidores notificados');
    router.push(`/posts/${post.id}`);
  } catch (error) {
    // Si cualquier paso falla, el catch lo captura aquí
    toast.error('Error en el proceso de publicación');
  }
};
```

### ¿Cuándo usar cada uno?

| Situación                                          | Usa           |
| -------------------------------------------------- | ------------- |
| Acción simple, no necesitas el resultado           | `mutate`      |
| Necesitas el resultado para el siguiente paso      | `mutateAsync` |
| Varias operaciones en secuencia                    | `mutateAsync` |
| Manejar éxito/error solo con `isSuccess`/`isError` | `mutate`      |
| Encadenar operaciones con `async/await`            | `mutateAsync` |

> **Importante:** Con `mutateAsync`, siempre envuelve en `try/catch`. Si no lo haces y la mutación falla, obtendrás un error de Promise no capturada.

---

## 11 — Callbacks en `useMutation`

`useMutation` tiene cuatro callbacks para reaccionar al ciclo de vida de la operación.

### Los cuatro callbacks

```tsx
useMutation({
  mutationFn: createPost,

  onMutate: async variables => {
    // Se ejecuta JUSTO ANTES de llamar a mutationFn
    // variables = los argumentos que se pasaron a mutate()
    // Útil para actualizaciones optimistas (ver sección 17)
    // Lo que devuelvas aquí llega como 'context' a los demás callbacks
    console.log('A punto de crear:', variables);
    return { previousData: caché_guardado }; // context para rollback
  },

  onSuccess: (data, variables, context) => {
    // data      = lo que devolvió mutationFn (el post creado)
    // variables = los argumentos originales de mutate()
    // context   = lo que devolvió onMutate
    console.log('Post creado:', data.id);
  },

  onError: (error, variables, context) => {
    // error     = el error que ocurrió
    // variables = los argumentos originales
    // context   = lo que devolvió onMutate (útil para revertir cambios)
    console.error('Falló crear el post:', error.message);
  },

  onSettled: (data, error, variables, context) => {
    // Se ejecuta SIEMPRE, sea éxito o error
    // data  = resultado (undefined si hubo error)
    // error = el error (null si fue éxito)
    queryClient.invalidateQueries({ queryKey: ['posts'] }); // re-sync con servidor
  },
});
```

### Orden de ejecución

```
mutate(variables) llamado
       ↓
  onMutate(variables)       ← justo antes del fetch, puede actualizar caché optimista
       ↓
  [fetch a la API]
       ↓
  si éxito → onSuccess(data, variables, context)
  si error → onError(error, variables, context)
       ↓
  onSettled(data|undefined, error|null, variables, context)   ← siempre
```

### Callbacks globales (en `useMutation`) vs por llamada (en `mutate`)

```tsx
// Globales — se ejecutan PRIMERO, siempre que se ejecuta la mutación
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => console.log('1. Global: post creado'),
  onError: () => console.log('1. Global: error'),
});

// Por llamada — se ejecutan DESPUÉS de los globales
mutation.mutate(payload, {
  onSuccess: () => console.log('2. Por llamada: post creado'),
  onError: () => console.log('2. Por llamada: error'),
});

// Si tuvo éxito → imprime:
// "1. Global: post creado"
// "2. Por llamada: post creado"
```

> **Nota:** Los callbacks de `mutate()` solo se ejecutan si el componente sigue montado cuando la mutación termina. Los de `useMutation` siempre se ejecutan.

### Ejemplo real — crear todo con notificaciones

```tsx
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (texto: string) =>
      fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: texto, completed: false, userId: 1 }),
      }).then(r => r.json()),

    onSuccess: data => {
      // Invalida la lista después de crear
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success(`Tarea "${data.title}" creada`);
    },

    onError: error => {
      toast.error(`Error al crear tarea: ${error.message}`);
    },
  });
};
```

---

## 12 — Invalidar caché (`useQueryClient`)

**¿Por qué es necesario?** Cuando haces una mutación que crea/modifica/borra datos, el caché de TanStack puede estar desactualizado. `invalidateQueries` marca esas queries como obsoletas y las re-fetcha.

**¿Cuándo usarlo?** Siempre en `onSuccess` o `onSettled` de una mutación que modifica datos que otra `useQuery` está leyendo.

### Obtener el queryClient

```tsx
import { useQueryClient } from '@tanstack/react-query';

function MiComponente() {
  const queryClient = useQueryClient();
  // ...
}
```

### `invalidateQueries` — re-fetcha automáticamente

```tsx
// Invalida UNA query específica: ['posts', 1]
queryClient.invalidateQueries({ queryKey: ['posts', 1] });

// Invalida TODAS las queries que empiecen con ['posts']
// Afecta a: ['posts'], ['posts', 1], ['posts', 2], ['posts', 'list', {...}]
queryClient.invalidateQueries({ queryKey: ['posts'] });

// Invalida TODAS las queries de la app
queryClient.invalidateQueries();

// Con exact: true → solo invalida la clave exacta, no las sub-claves
queryClient.invalidateQueries({ queryKey: ['posts'], exact: true });
// Solo invalida ['posts'], no ['posts', 1]
```

### `setQueryData` — actualizar caché directamente (sin fetch)

```tsx
// Actualiza el caché de una query con una nueva pieza de datos
// Útil para actualizar la UI inmediatamente sin esperar al servidor
queryClient.setQueryData(['posts', newPost.id], newPost);

// Actualizar con función (accede al valor anterior)
queryClient.setQueryData<Post[]>(['posts'], (oldPosts = []) => [...oldPosts, newPost]);
```

### `getQueryData` — leer el caché

```tsx
// Lee los datos actuales del caché sin hacer fetch
const posts = queryClient.getQueryData<Post[]>(['posts']);
const post = queryClient.getQueryData<Post>(['posts', 1]);
```

### `refetchQueries` — fuerza re-fetch aunque no esté stale

```tsx
// Diferencia con invalidateQueries:
// - invalidateQueries: marca como stale → re-fetcha si el componente está montado
// - refetchQueries: fuerza re-fetch inmediatamente aunque los datos sean frescos
queryClient.refetchQueries({ queryKey: ['posts'] });
```

### `removeQueries` — eliminar del caché

```tsx
// Elimina los datos del caché completamente
queryClient.removeQueries({ queryKey: ['posts', userId] });
// La próxima vez que alguien pida esos datos, empezará desde cero
```

### `cancelQueries` — cancelar fetches en curso

```tsx
// Cancela peticiones en vuelo (útil en actualizaciones optimistas)
await queryClient.cancelQueries({ queryKey: ['todos'] });
```

### Patrón completo: crear → invalidar → lista actualizada

```tsx
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postsService.create(payload),

    onSuccess: newPost => {
      // Opción A — invalida y re-fetcha la lista (más simple, +1 request)
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // Opción B — añade directamente al caché (0 requests extra, más rápido)
      queryClient.setQueryData<Post[]>(['posts'], old => [...(old ?? []), newPost]);

      // Opción C — ambas: actualiza el caché Y el detalle del post nuevo
      queryClient.setQueryData(['posts', newPost.id], newPost);
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
    },
  });
};
```

---

## 13 — Queries dependientes (una depende de otra)

**¿Cuándo usarlo?** Cuando el resultado de una query es necesario como parámetro de otra.

### Patrón base — dos queries encadenadas

```tsx
// Rick & Morty API: primero el personaje, luego su episodio
// GET /character/1  →  { episodes: ['https://...episode/1', ...] }
// GET /episode/1    →  { name: 'Pilot', ... }

const getCharacter = (id: number) => fetch(`https://rickandmortyapi.com/api/character/${id}`).then(r => r.json());

const getEpisode = (id: number) => fetch(`https://rickandmortyapi.com/api/episode/${id}`).then(r => r.json());

function DetallesPersonaje({ characterId }: { characterId: number }) {
  // Query 1: obtener el personaje
  const { data: character, isSuccess: characterLoaded } = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => getCharacter(characterId),
  });

  // Extraer el ID del primer episodio del personaje
  const firstEpisodeUrl = character?.episode[0];
  const episodeId = firstEpisodeUrl ? Number(firstEpisodeUrl.split('/').at(-1)) : null;

  // Query 2: obtener el episodio (solo cuando tengamos el ID)
  const { data: episode } = useQuery({
    queryKey: ['episode', episodeId],
    queryFn: () => getEpisode(episodeId!),
    enabled: episodeId !== null, // ← espera a que la primera query tenga datos
  });

  return (
    <div>
      <h2>{character?.name}</h2>
      <p>Primera aparición: {episode?.name}</p>
    </div>
  );
}
```

### Cadena de tres niveles

```tsx
// GitHub: usuario → repos → detalles de un repo específico

const { data: user } = useQuery({
  queryKey: ['github', 'user', username],
  queryFn: () => getGitHubUser(username),
  enabled: !!username,
});

const { data: repos } = useQuery({
  queryKey: ['github', 'repos', user?.login],
  queryFn: () => getGitHubRepos(user!.login),
  enabled: !!user?.login, // espera al usuario
});

const mostStarredRepo = repos?.sort((a, b) => b.stargazers_count - a.stargazers_count)[0];

const { data: repoDetails } = useQuery({
  queryKey: ['github', 'repo', mostStarredRepo?.full_name],
  queryFn: () => getGitHubRepo(mostStarredRepo!.full_name),
  enabled: !!mostStarredRepo?.full_name, // espera al repo más estrellado
});
```

### ¿Qué pasa mientras espera?

```
Query 1 ejecutando:  status='pending', fetchStatus='fetching'
Query 2 esperando:   status='pending', fetchStatus='idle'      ← bloqueada por enabled: false
                                                                (no confundir con error)
Query 1 terminó:     status='success'
Query 2 empieza:     status='pending', fetchStatus='fetching'  ← now enabled: true
```

---

## 14 — Queries en paralelo (`useQueries`)

**¿Cuándo usarlo?** Cuando necesitas hacer varias queries a la vez y el **número de queries varía** (es dinámico, viene de un array).

```tsx
import { useQueries } from '@tanstack/react-query';

// Rick & Morty: cargar varios personajes a la vez por sus IDs
function EquipoPersonajes({ ids }: { ids: number[] }) {
  const results = useQueries({
    queries: ids.map(id => ({
      queryKey: ['character', id],
      queryFn: () => fetch(`https://rickandmortyapi.com/api/character/${id}`).then(r => r.json()),
    })),
  });

  const isLoading = results.some(r => r.isPending);
  const hasError = results.some(r => r.isError);
  const characters = results.map(r => r.data).filter(Boolean);

  if (isLoading) return <Spinner />;
  if (hasError) return <p>Error cargando algún personaje</p>;

  return (
    <ul>
      {characters.map(c => (
        <li key={c.id}>
          {c.name} — {c.status}
        </li>
      ))}
    </ul>
  );
}
```

### Para número **fijo** de queries — simplemente usa varios `useQuery`

```tsx
// Si siempre son exactamente N queries, esto es más simple y legible:
const postsQuery = useQuery({ queryKey: ['posts'], queryFn: getPosts });
const usersQuery = useQuery({ queryKey: ['users'], queryFn: getUsers });
const todosQuery = useQuery({ queryKey: ['todos'], queryFn: getTodos });
// Las 3 se ejecutan en paralelo automáticamente
```

### `useQueries` con `combine` — transformar los resultados en conjunto

```tsx
const { data: characters, isLoading } = useQueries({
  queries: ids.map(id => ({
    queryKey: ['character', id],
    queryFn: () => getCharacter(id),
  })),
  combine: results => ({
    data: results.map(r => r.data).filter(Boolean),
    isLoading: results.some(r => r.isPending),
    isError: results.some(r => r.isError),
  }),
});
// Ahora characters es directamente el array de personajes
```

---

## 15 — Queries paginadas

**¿Cuándo usarlo?** Listas con paginación clásica (Página 1, 2, 3...).

**Truco esencial:** `placeholderData: keepPreviousData` → muestra los datos de la página anterior mientras carga la nueva. Evita el parpadeo.

```tsx
import { useQuery, keepPreviousData } from '@tanstack/react-query';

// Pokémon API: 20 pokémon por página
// GET /pokemon?limit=20&offset=0   → página 1
// GET /pokemon?limit=20&offset=20  → página 2

interface PokemonPage {
  count: number; // total de pokémon
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

const getPokemonPage = (page: number): Promise<PokemonPage> => {
  const offset = (page - 1) * 20;
  return fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`).then(r => r.json());
};

function ListaPokemon() {
  const [page, setPage] = useState(1);

  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['pokemon', 'page', page],
    queryFn: () => getPokemonPage(page),
    placeholderData: keepPreviousData, // ← mantiene la página anterior visible
  });

  const totalPages = data ? Math.ceil(data.count / 20) : 0;
  const hasNextPage = page < totalPages;

  return (
    <div>
      {isPending ? (
        <Spinner />
      ) : (
        <>
          {isPlaceholderData && <span>Cargando página {page}...</span>}
          <ul>
            {data?.results.map(p => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ul>
        </>
      )}

      <div>
        <button disabled={page === 1 || isFetching} onClick={() => setPage(p => p - 1)}>
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button disabled={!hasNextPage || isFetching} onClick={() => setPage(p => p + 1)}>
          {isFetching ? 'Cargando...' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}
```

> **`isPlaceholderData`:** `true` cuando se están mostrando datos de la página anterior mientras carga la nueva. Útil para dar feedback visual sutil (deshabilitar botón, mostrar opacidad reducida, etc.).

### Pre-cargar la siguiente página (prefetching)

```tsx
const queryClient = useQueryClient();

// Mientras el usuario está en la página 3, precarga la 4
useEffect(() => {
  if (!isPlaceholderData && hasNextPage) {
    queryClient.prefetchQuery({
      queryKey: ['pokemon', 'page', page + 1],
      queryFn: () => getPokemonPage(page + 1),
    });
  }
}, [page, isPlaceholderData, hasNextPage, queryClient]);
```

---

## 16 — Infinite scroll (`useInfiniteQuery`)

**¿Qué es?** La variante de `useQuery` para listas de "cargar más" o scroll infinito.

**¿Cuándo usarlo?** Listas largas donde el usuario hace scroll o hace clic en "Cargar más".

**¿Qué diferencia tiene de `useQuery`?**

- `data` tiene forma `{ pages: T[], pageParams: unknown[] }` en vez del dato directo
- Requiere `initialPageParam` y `getNextPageParam`
- Tiene `fetchNextPage()` para pedir más datos
- Tiene `hasNextPage` para saber si quedan más

### Estructura básica

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

// Pokémon API con cursor (offset)
function PokemonInfinitos() {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    queryKey: ['pokemon', 'infinite'],
    queryFn: ({ pageParam }) => fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${pageParam}`).then(r => r.json()),

    initialPageParam: 0, // valor inicial del offset

    getNextPageParam: (lastPage, allPages) => {
      // lastPage.next = 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20'
      // Si no hay 'next', retorna undefined → hasNextPage = false
      if (!lastPage.next) return undefined;
      return allPages.length * 20; // próximo offset
    },

    getPreviousPageParam: (firstPage, allPages) => {
      if (!firstPage.previous) return undefined;
      return Math.max(0, (allPages.length - 1) * 20 - 20);
    },
  });

  if (isPending) return <Spinner />;
  if (isError) return <p>Error cargando pokémon</p>;

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.results.map(pokemon => (
            <div key={pokemon.name}>{pokemon.name}</div>
          ))}
        </div>
      ))}

      <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
        {isFetchingNextPage ? 'Cargando más...' : hasNextPage ? 'Cargar más' : 'No hay más pokémon'}
      </button>
    </div>
  );
}
```

### Con scroll automático (Intersection Observer)

```tsx
function PokemonScrollInfinito() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['pokemon', 'infinite'],
    queryFn: ({ pageParam }) => fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${pageParam}`).then(r => r.json()),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length * 20 : undefined),
  });

  const loaderRef = useRef<HTMLDivElement>(null);

  // Carga automáticamente cuando el usuario llega al final
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.results.map(p => (
            <div key={p.name}>{p.name}</div>
          ))}
        </div>
      ))}
      <div ref={loaderRef}>{isFetchingNextPage ? 'Cargando más...' : ''}</div>
    </div>
  );
}
```

### API con cursor en vez de offset (más común en APIs reales)

```tsx
// GitHub API: GET /users con cursor de pagination
useInfiniteQuery({
  queryKey: ['github', 'users'],
  queryFn: ({ pageParam }) => fetch(`https://api.github.com/users?since=${pageParam}&per_page=30`).then(r => r.json()),

  initialPageParam: 0,

  getNextPageParam: lastPage => {
    // El último usuario de la página es el 'cursor' para la siguiente
    if (lastPage.length < 30) return undefined; // última página
    return lastPage[lastPage.length - 1].id; // ID del último usuario
  },
});
```

### Todas las propiedades de `useInfiniteQuery`

| Propiedad                | Descripción                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `data.pages`             | Array donde cada elemento es el resultado de una llamada a `queryFn`    |
| `data.pageParams`        | Array con los `pageParam` usados en cada llamada                        |
| `fetchNextPage()`        | Pide la siguiente página usando `getNextPageParam`                      |
| `fetchPreviousPage()`    | Pide la página anterior usando `getPreviousPageParam`                   |
| `hasNextPage`            | `true` si `getNextPageParam` devuelve algo distinto de `undefined/null` |
| `hasPreviousPage`        | `true` si `getPreviousPageParam` devuelve algo                          |
| `isFetchingNextPage`     | `true` mientras carga la siguiente página                               |
| `isFetchingPreviousPage` | `true` mientras carga la página anterior                                |

---

## 17 — Actualizaciones optimistas

**¿Qué son?** Actualizar la UI **antes** de que el servidor confirme el cambio. Si el servidor falla, se revierte automáticamente.

**¿Cuándo usarlas?** Cuando quieres que la app se sienta instantánea. Ideal para: likes, checkboxes, reordenamiento, etc.

### Método 1 — Via UI (sin tocar el caché)

El más simple. Solo muestra un elemento temporal desde `variables` mientras la mutación está pendiente. No necesita `onMutate` ni rollback.

```tsx
// JSONPlaceholder: añadir un todo optimistamente
export const useCreateTodo = () =>
  useMutation({
    mutationFn: (title: string) =>
      fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: false, userId: 1 }),
      }).then(r => r.json()),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

// Componente
function ListaTodos() {
  const { data: todos } = useQuery({ queryKey: ['todos'], queryFn: getTodos });
  const { mutate, isPending, isError, variables } = useCreateTodo();

  return (
    <ul>
      {todos?.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}

      {/* Ítem temporal mientras se crea */}
      {isPending && (
        <li style={{ opacity: 0.5 }}>
          {variables} <span>(enviando...)</span>
        </li>
      )}

      {/* Si falló, muestra el ítem en rojo con opción de reintentar */}
      {isError && (
        <li style={{ color: 'red' }}>
          {variables} — <button onClick={() => mutate(variables!)}>Reintentar</button>
        </li>
      )}
    </ul>
  );
}
```

### Método 2 — Via caché (con rollback automático)

Modifica el caché directamente en `onMutate`. Si falla, revierte con el snapshot guardado.

```tsx
function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      }).then(r => r.json()),

    onMutate: async ({ id, completed }) => {
      // 1. Cancela re-fetches en curso para evitar que sobreescriban el optimismo
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // 2. Guarda el estado actual (snapshot para rollback)
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      // 3. Actualiza el caché optimistamente
      queryClient.setQueryData<Todo[]>(['todos'], old => old?.map(todo => (todo.id === id ? { ...todo, completed } : todo)) ?? []);

      // 4. Devuelve el snapshot — llegará como 'context' a onError
      return { previousTodos };
    },

    onError: (error, variables, context) => {
      // Revierte al estado anterior si falló
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },

    onSettled: () => {
      // Re-sincroniza con el servidor siempre al final
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Uso
function TodoItem({ todo }: { todo: Todo }) {
  const { mutate: toggleTodo } = useToggleTodo();

  return (
    <li>
      <input type="checkbox" checked={todo.completed} onChange={e => toggleTodo({ id: todo.id, completed: e.target.checked })} />
      {todo.title}
    </li>
  );
}
```

### ¿Cuándo usar cada método?

| Situación                                            | Método               |
| ---------------------------------------------------- | -------------------- |
| Añadir un nuevo ítem a una lista                     | Via UI (Método 1)    |
| Toggle/checkbox que cambia un ítem existente         | Via caché (Método 2) |
| El cambio se ve en varios componentes a la vez       | Via caché (Método 2) |
| Quieres menos código y no necesitas rollback preciso | Via UI (Método 1)    |
| La operación es crítica y debe revertir limpiamente  | Via caché (Método 2) |

---

## 18 — Opciones avanzadas de `useQuery`

### `staleTime` — cuánto tiempo los datos son "frescos"

Por defecto: `0` — los datos se marcan obsoletos inmediatamente después de recibirlos.

Cuando los datos son frescos, TanStack **no** re-fetcha automáticamente aunque el componente se monte de nuevo o el usuario vuelva a la pestaña.

```tsx
useQuery({
  queryKey: ['github', 'user', username],
  queryFn: () => getGitHubUser(username),

  staleTime: 0, // siempre obsoleto (por defecto)
  staleTime: 1000 * 60 * 5, // 5 minutos frescos
  staleTime: 1000 * 60 * 60, // 1 hora fresca
  staleTime: Infinity, // nunca obsoleto (no re-fetcha automáticamente)
});
```

**Cuándo usar `staleTime` alto:**

- Datos que cambian poco: perfiles, configuración, catálogos estáticos
- APIs con rate-limit (GitHub limita a 60 req/hora sin auth)
- Datos del usuario autenticado (cambian solo si él mismo los edita)

### `gcTime` — cuánto tiempo guardar en caché tras desmontar

Por defecto: `5 minutos`. Tras ese tiempo sin componentes activos que lean esa query, los datos se eliminan del caché.

```tsx
useQuery({
  queryKey: ['posts'],
  queryFn: getPosts,

  gcTime: 0, // elimina del caché inmediatamente al desmontar
  gcTime: 1000 * 60 * 5, // 5 minutos (por defecto)
  gcTime: 1000 * 60 * 30, // 30 minutos
  gcTime: Infinity, // nunca elimina del caché
});
```

### `retry` — reintentos automáticos si falla

Por defecto: `3` reintentos.

```tsx
useQuery({
  queryKey: ['posts'],
  queryFn: getPosts,

  retry: 3, // por defecto
  retry: false, // no reintenta
  retry: 1, // solo 1 reintento
  retry: (failureCount, error) => {
    // Lógica personalizada: no reintenta en errores 4xx (son errores del cliente)
    if (error.status >= 400 && error.status < 500) return false;
    return failureCount < 3;
  },

  retryDelay: 1000, // espera fija 1 seg entre reintentos
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // exponencial
  // intento 0 → 1s, intento 1 → 2s, intento 2 → 4s, ..., máx 30s
});
```

### `refetchOnWindowFocus` — re-fetch al volver a la pestaña

Por defecto: `true`. Cuando el usuario vuelve a la ventana del navegador, las queries obsoletas se re-fetchan.

```tsx
useQuery({
  queryKey: ['settings'],
  queryFn: getSettings,

  refetchOnWindowFocus: true, // por defecto — re-fetcha si está stale
  refetchOnWindowFocus: false, // nunca re-fetcha al enfocar
  refetchOnWindowFocus: 'always', // re-fetcha SIEMPRE al enfocar (aunque esté fresco)
});
```

### `refetchOnMount` — re-fetch al montar el componente

```tsx
useQuery({
  refetchOnMount: true, // por defecto — re-fetcha si está stale
  refetchOnMount: false, // usa el caché siempre, no re-fetcha al montar
  refetchOnMount: 'always', // re-fetcha al montar aunque esté fresco
});
```

### `refetchOnReconnect` — re-fetch al recuperar conexión

```tsx
useQuery({
  refetchOnReconnect: true, // por defecto
  refetchOnReconnect: false,
  refetchOnReconnect: 'always',
});
```

### `refetchInterval` — polling (actualización automática periódica)

```tsx
// Open-Meteo: actualiza el clima cada 60 segundos
useQuery({
  queryKey: ['weather', { lat: 40.4165, lon: -3.7026 }],
  queryFn: () => fetch('https://api.open-meteo.com/v1/forecast?latitude=40.42&longitude=-3.70&current_weather=true').then(r => r.json()),

  refetchInterval: 1000 * 60, // cada 60 segundos
  refetchIntervalInBackground: false, // pausa el polling si el usuario no está en la pestaña
});

// Polling condicional — solo mientras el estado sea 'procesando'
const { data } = useQuery({
  queryKey: ['job', jobId],
  queryFn: () => getJobStatus(jobId),

  refetchInterval: query => {
    // Sigue haciendo polling hasta que el job termine
    if (query.state.data?.status === 'completed') return false;
    if (query.state.data?.status === 'failed') return false;
    return 3000; // cada 3 segundos mientras está 'processing'
  },
});
```

### `select` — transformar datos antes de devolverlos

```tsx
// La API devuelve { results: [...], count: 100 }
// Pero solo quieres el array de pokémon con solo nombre+url
const { data: pokemonNames } = useQuery({
  queryKey: ['pokemon'],
  queryFn: () => fetch('https://pokeapi.co/api/v2/pokemon?limit=20').then(r => r.json()),

  select: data => data.results.map((p: { name: string }) => p.name),
  // data ahora es string[] en vez del objeto completo
});

// Útil también para ordenar/filtrar sin contaminar el caché:
const { data: sortedPosts } = useQuery({
  queryKey: ['posts'],
  queryFn: getPosts,
  select: posts => [...posts].sort((a, b) => b.id - a.id),
  // El caché guarda los posts originales; select transforma solo lo que se devuelve
});
```

### `placeholderData` — datos mientras carga

```tsx
// Datos estáticos de placeholder
const { data: user } = useQuery({
  queryKey: ['github', 'user', username],
  queryFn: () => getGitHubUser(username),
  placeholderData: { login: username, name: 'Cargando...', avatar_url: '/default-avatar.png' },
});

// Usar datos de otra query como placeholder (ej: lista → detalle)
const { data: posts } = useQuery({ queryKey: ['posts'], queryFn: getPosts });

const { data: post } = useQuery({
  queryKey: ['posts', postId],
  queryFn: () => getPost(postId),
  // Mientras carga el detalle, usa el ítem de la lista como placeholder
  placeholderData: () => posts?.find(p => p.id === postId),
});
```

### `throwOnError` — lanzar errores al Error Boundary

```tsx
useQuery({
  queryKey: ['critical-data'],
  queryFn: getCriticalData,
  throwOnError: true, // lanza el error al Error Boundary más cercano
  throwOnError: error => error.status >= 500, // solo en errores del servidor
});
```

### `networkMode` — comportamiento sin conexión

```tsx
useQuery({
  networkMode: 'online', // por defecto — pausa en offline
  networkMode: 'always', // ejecuta siempre, incluido offline
  networkMode: 'offlineFirst', // intenta siempre, pausa solo si falla por red
});
```

---

## 19 — `useMutationState` — estado global de mutaciones

**¿Qué es?** Hook que permite leer el estado de una `useMutation` **desde cualquier componente**, aunque la mutación se definió en otro componente completamente diferente.

**¿Cuándo usarlo?**

- Mostrar un spinner global mientras hay mutaciones pendientes
- Mostrar ítem temporal en una lista mientras se crea en otro componente
- Un componente de notificaciones que sabe qué mutations están en curso

**Requisito:** La mutación debe tener una `mutationKey`.

```tsx
// ComponenteA — donde se define y ejecuta la mutación
function FormularioPost() {
  const { mutate } = useMutation({
    mutationFn: (title: string) => postsService.create({ title, body: '', userId: 1 }),
    mutationKey: ['create-post'], // ← necesario para useMutationState
  });

  return <button onClick={() => mutate('Mi nuevo post')}>Crear</button>;
}

// ComponenteB — en otra parte del árbol de componentes
function ListaDePosts() {
  const { data: posts } = useQuery({ queryKey: ['posts'], queryFn: getPosts });

  // Lee el estado de la mutación desde aquí
  const pendingTitles = useMutationState<string>({
    filters: {
      mutationKey: ['create-post'],
      status: 'pending',
    },
    select: mutation => mutation.state.variables as string,
  });

  return (
    <ul>
      {posts?.map(p => (
        <li key={p.id}>{p.title}</li>
      ))}
      {/* Muestra los posts que se están creando ahora mismo */}
      {pendingTitles.map((title, i) => (
        <li key={i} style={{ opacity: 0.5 }}>
          {title} (enviando...)
        </li>
      ))}
    </ul>
  );
}
```

### Otros usos

```tsx
// Saber si hay ALGUNA mutación pendiente en toda la app (spinner global)
const pendingMutations = useMutationState({
  filters: { status: 'pending' },
});
const isGloballyLoading = pendingMutations.length > 0;

// Ver los datos del último resultado exitoso de una mutación
const [lastCreatedPost] = useMutationState<Post>({
  filters: { mutationKey: ['create-post'], status: 'success' },
  select: mutation => mutation.state.data as Post,
});
// lastCreatedPost → el post que devolvió el servidor en el último éxito
```

---

## 20 — Organizar hooks por dominio

La mejor práctica es separar el servicio (llamadas HTTP) de los hooks (lógica de TanStack).

```
src/
└── api/
    ├── services/
    │   ├── posts.service.ts     ← funciones puras: getPosts, createPost, etc.
    │   ├── users.service.ts
    │   └── github.service.ts
    └── hooks/
        ├── usePosts.ts          ← useQuery / useMutation que llaman al servicio
        ├── useUsers.ts
        └── useGitHub.ts
```

### Ejemplo: dominio de Posts completo

```tsx
// api/services/posts.service.ts
const BASE = 'https://jsonplaceholder.typicode.com';

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}
export type CreatePost = Omit<Post, 'id'>;

export const postsService = {
  getAll: (): Promise<Post[]> => fetch(`${BASE}/posts`).then(r => r.json()),

  getById: (id: number): Promise<Post> => fetch(`${BASE}/posts/${id}`).then(r => r.json()),

  getByUser: (userId: number): Promise<Post[]> => fetch(`${BASE}/users/${userId}/posts`).then(r => r.json()),

  create: (data: CreatePost): Promise<Post> =>
    fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  update: (id: number, data: Partial<CreatePost>): Promise<Post> =>
    fetch(`${BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (id: number): Promise<void> => fetch(`${BASE}/posts/${id}`, { method: 'DELETE' }).then(() => undefined),
};

// api/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsService, type CreatePost } from '../services/posts.service';

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  detail: (id: number) => [...postKeys.all, 'detail', id] as const,
  byUser: (userId: number) => [...postKeys.all, 'user', userId] as const,
};

// Leer todos los posts
export const usePosts = () => useQuery({ queryKey: postKeys.lists(), queryFn: postsService.getAll });

// Leer un post por ID
export const usePost = (id: number) =>
  useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsService.getById(id),
    enabled: !!id,
  });

// Leer posts de un usuario
export const useUserPosts = (userId: number) =>
  useQuery({
    queryKey: postKeys.byUser(userId),
    queryFn: () => postsService.getByUser(userId),
    enabled: !!userId,
  });

// Crear post
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.lists() }),
  });
};

// Actualizar post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CreatePost>) => postsService.update(id, data),
    onSuccess: updatedPost => {
      queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Borrar post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsService.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: postKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};
```

### Alternativa v5: `queryOptions()` — reutilizar la config fuera de hooks

TanStack Query v5 introduce `queryOptions()` como alternativa a los custom hooks cuando necesitas usar la misma configuración (clave + función) **fuera de un componente React**: prefetch en Server Components, loaders de Next.js o React Router, tests, etc.

```tsx
import { queryOptions } from '@tanstack/react-query';
import { postsService } from '../services/posts.service';
import { postKeys } from './postKeys';

// Combina clave + función en un objeto reutilizable con tipado automático
export const postQueryOptions = {
  list: () =>
    queryOptions({
      queryKey: postKeys.lists(),
      queryFn: postsService.getAll,
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: postKeys.detail(id),
      queryFn: () => postsService.getById(id),
      enabled: !!id,
    }),
};
```

**En un componente React (equivale al hook):**

```tsx
function PostList() {
  const { data } = useQuery(postQueryOptions.list());
  // mismo resultado que: useQuery({ queryKey: postKeys.lists(), queryFn: postsService.getAll })
}
```

**En un Server Component de Next.js (prefetch antes de renderizar):**

```tsx
// app/posts/page.tsx (Server Component)
import { getQueryClient } from '@/lib/queryClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { postQueryOptions } from '@/api/hooks/postQueryOptions';

export default async function PostsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(postQueryOptions.list());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList /> {/* ya tiene los datos en caché, sin spinner inicial */}
    </HydrationBoundary>
  );
}
```

> **¿Hooks o `queryOptions()`?** Para queries simples que solo se usan en componentes, los hooks con `useQuery` son suficientes. Usa `queryOptions()` cuando necesites la misma config en varios lugares o en código que corre fuera del ciclo React (loaders, server, tests).

---

## 21 — Resumen: cuándo usar cada herramienta

| ¿Qué quieres hacer?                           | Herramienta                             |
| --------------------------------------------- | --------------------------------------- |
| Obtener datos de una API (GET)                | `useQuery`                              |
| Crear un recurso (POST)                       | `useMutation`                           |
| Actualizar un recurso (PUT/PATCH)             | `useMutation`                           |
| Borrar un recurso (DELETE)                    | `useMutation`                           |
| Ejecutar acción y no necesitas el resultado   | `mutate`                                |
| Encadenar operaciones que dependen entre sí   | `mutateAsync`                           |
| Reaccionar con callbacks (onSuccess, onError) | `mutate` o callbacks en `useMutation`   |
| Query que depende del resultado de otra query | `useQuery` + `enabled`                  |
| Varias queries a la vez (número variable)     | `useQueries`                            |
| Varias queries a la vez (número fijo)         | Varios `useQuery` en paralelo           |
| Lista paginada (página 1, 2, 3...)            | `useQuery` + `keepPreviousData`         |
| Lista de scroll infinito o "cargar más"       | `useInfiniteQuery`                      |
| UI optimista sin tocar caché                  | `variables` + `isPending` en JSX        |
| UI optimista con rollback en caché            | `onMutate` + `onError` + `setQueryData` |
| Forzar recarga de datos                       | `refetch()` o `invalidateQueries()`     |
| Actualizar caché sin nueva petición HTTP      | `queryClient.setQueryData()`            |
| Leer caché desde otro componente              | `queryClient.getQueryData()`            |
| Ver estado de mutation en otro componente     | `useMutationState` + `mutationKey`      |
| Polling (actualización automática por tiempo) | `refetchInterval` en `useQuery`         |
| Datos que casi nunca cambian (sin re-fetch)   | `staleTime: Infinity`                   |
| Queries de búsqueda (disparadas manualmente)  | `enabled: false` + `refetch()`          |
| Precargar datos antes de navegar              | `queryClient.prefetchQuery()`           |
| Reutilizar config (key + fn) fuera de hooks   | `queryOptions()`                        |

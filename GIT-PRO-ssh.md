para ir a la carpeta de SSH 

```tsx
cd ~/.ssh
```

para saber cuantos commit llevo desde develop 

```tsx
git log develop..HEAD --oneline | wc -l
```

## Configuración Inicial

```bash

bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --list

```

## Creación y Clonado

```bash

bash
git init# Inicializar repositorio
git clone <url># Clonar repositorio remoto
git clone --depth 1 <url># Clonar solo el último commit

```

## Estados y Seguimiento

```bash

bash
git status# Ver estado de archivos
git add <archivo># Agregar archivo al staging
git add .# Agregar todos los archivos
git add -p# Agregar interactivamente por partes
git rm <archivo># Eliminar archivo
git mv <origen> <destino># Mover/renombrar archivo

```

## Commits

```bash

bash
git commit -m "mensaje"# Commit con mensaje
git commit -am "mensaje"# Add y commit en uno
git commit --amend# Modificar último commit
git commit --fixup <hash># Crear commit de corrección

```

## Historial y Logs

```bash

bash
git log# Ver historial
git log --oneline# Log compacto
git log --graph --all# Log gráfico con todas las ramas
git log -p# Log con diferencias
git log --since="2 weeks ago"
git show <hash># Ver commit específico
git diff# Ver diferencias no staged
git diff --staged# Ver diferencias staged

```

## Ramas (Branches)

```bash

bash
git branch# Listar ramas
git branch -a # Listar ramas todas
git branch <nombre># Crear rama
git checkout <rama># Cambiar a rama
git switch <rama># Cambiar a rama (comando nuevo)
git checkout -b <rama># Crear y cambiar a rama
git merge <rama># Fusionar rama
git branch -d <rama># Eliminar rama
git branch -D <rama># Forzar eliminación de rama
git branch --merged # Ver qué ramas están mergeadasson seguras de eliminar con -d
git branch --no-merged #Ver qué ramas NO están mergeadas requieren -D para elimin
git fetch -p # Limpia las referencias locales de ramas remotas que ya no existen

Bajar Ramas remotas Modificadas
1 se cambia de rama a develop
2 se actualiza los cambios git fetch origin
3 se elimina la rama local git branch -D feature/payment_method
4 hay dos formas: 

a) git checkout feature/payment_method (sin el -b porque no hace falta crear nada se trae la remota porque el nombre exixte).

b) git checkout -b feature/payment_method origin/feature/payment_method (se crea una rama nueva en local y se llama a la remota )
```

## Remotos

```bash

bash
git remote -v# Ver remotos configurados
git remote add <nombre> <url>
git fetch# Descargar cambios sin fusionar
git pull# Fetch + merge
git push# Subir cambios
git push -u origin <rama># Push y establecer upstream
git push --force-with-lease# Push forzado seguro

```

## Comandos Avanzados

### Rebase

```bash

bash
git rebase <rama># Rebase sobre rama
git rebase -i HEAD~3# Rebase interactivo (últimos 3 commits)
git rebase --continue# Continuar rebase después de resolver conflictos
git rebase --abort# Cancelar rebase
git rebase --onto <base> <desde> <hasta>

```

### Cherry-pick

```bash

bash
git cherry-pick <hash># Aplicar commit específico
git cherry-pick <hash1>..<hash2># Rango de commits
git cherry-pick --no-commit <hash># Cherry-pick sin commit

```

### Reset y Revert

```bash

bash
git reset HEAD~1# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1# Reset suave
git reset --hard HEAD~1# Reset duro (perder cambios)
git revert <hash># Crear commit que deshace otro commit
git revert -m 1 <hash-merge># Revertir merge commit

```

### Bisect (Búsqueda binaria de bugs)

```bash

bash
git bisect start
git bisect bad# Marcar commit actual como malo
git bisect good <hash># Marcar commit como bueno
git bisect reset# Terminar bisect

```

### Reflog

```bash

bash
git reflog# Ver historial de referencias
git reflog expire --expire=now --all
git gc --prune=now# Limpiar referencias expiradas

```

### Comandos de Mantenimiento

```bash

bash
git gc# Garbage collection
git fsck# Verificar integridad
git clean -fd# Limpiar archivos no trackeados
git prune# Eliminar objetos no referenciados
git count-objects -v# Ver estadísticas del repositorio

```

### Filtrado y Búsqueda Avanzada

```bash

bash
git log --grep="patrón"# Buscar en mensajes de commit
git log -S"código"# Buscar cambios en código específico
git log --author="nombre"# Filtrar por autor
git blame <archivo># Ver quién modificó cada línea
git grep "patrón"# Buscar en archivos del repositorio

```

## Rebase básico

```jsx
Para hacer rebase de tu rama actual sobre otra rama (por ejemplo, main):
```

## 🔹 1. Rebase normal

### Flujo

```bash
git checkout feature/switch
git fetch origin
git checkout develop && git pull origin develop      # tener develop actualizado
git checkout feature/switch
git rebase develop
# resolver conflictos si aparecen
git add .
git rebase --continue
git push -f origin feature/switch

```

---

## 🔹 2. Rebase interactivo (para dejar 1 solo commit)

### Flujo

1. Ver commits:
    
    ```bash
    
    git checkout feature/switch
    git log --oneline
    ```
    
    ```
    e5f6g7  fix typo
    d4c3b2  agregar validación
    c3d2a1  WIP estilos
    b2a1c0  crear componente
    a1b0c9  setup inicial
    
    ```
    
2. Lanzar rebase interactivo:
    
    ```bash
    git rebase -i HEAD~5
    
    bab51fcaef5729873cd650907db6ea0c9b06da13
    
    ```
    
3. Editor:
    
    ```
    pick a1b0c9 setup inicial
    s b2a1c0 crear componente
    s c3d2a1 WIP estilos
    s d4c3b2 agregar validación
    s e5f6g7 fix typo
    
    ```
    
4. Unificar mensaje:
    
    ```
    feat: agregar pantalla switch completa
    
    ```
    

1. Push forzado:
    
    ```bash
    git push -f origin feature/switch
    
    ```
    

---

## 🔹 3. Cherry-pick

### Flujo

1. Buscar commit en otra rama:
    
    ```bash
    git checkout feature/switch
    git log --oneline feature/wallet
    ```
    
    Ejemplo: `abc1234 fix: evitar doble navegación`.
    
2. Ir a la rama destino:
    
    ```bash
    git checkout develop 
    git fetch 
    git pull origin develop
    
    git checkout -b feature/switch_v2
    
    (no se usa develop se saca una rama nueva desde develop feature/switch_v2) 
    
    ```
    
3. Aplicar el commit:
    
    ```bash
    git cherry-pick abc1234
    
    ```
    
4. Resolver conflictos si aparecen:
    - Editar archivo.
    - `git add .`
    - `git cherry-pick --continue`
5. 

---

## 🔹 Resolución de conflictos (válido para rebase y cherry-pick)

Formato típico:

```diff
<<<<<<< HEAD
versión en develop
=======
versión en feature
>>>>>>> commit-feature

 
```

👉 Significado:

- **Entre `<<<<<<< HEAD` y `=======`** → versión actual (tu rama base).
- **Entre `=======` y `>>>>>>>`** → versión entrante (lo que intentas aplicar).

### Pasos:

1. Editar y dejar solo lo correcto:
    
    ```jsx
    console.log("Versión final corregida");
    
    ```
    
2. Guardar.
3. `git add archivo`
4. `git rebase --continue` ó `git cherry-pick --continue`

---

# ✅ Resumen final

- **Rebase normal**: poner tu rama encima de la base (historial limpio).
- **Rebase interactivo**: limpiar commits → lo mejor es dejar **1 solo commit** antes de rebasar.
- **Cherry-pick**: traer commits sueltos de otra rama (ej: hotfix).
- Siempre resolver conflictos cuidando qué lado conservar.
- Si reescribes historial, **push con `-force-with-lease`**.

para ver cuantos commit llevo uso git 

`git rev-list --count HEAD ^main`  o develop
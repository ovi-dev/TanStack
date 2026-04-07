🧠 MANUAL DEFINITIVO SSH EN MAC 

# 1️⃣ Ver si ya tienes claves creadas

```bash
ls -la ~/.ssh
```

Busca archivos como:

```
id_ed25519
id_ed25519.pub
id_ed25519_trabajo
id_ed25519_trabajo.pub
```

### 👉 Regla:

- Sin `.pub` → 🔐 privada (NO se comparte)
- Con `.pub` → 📢 pública (esa sí se comparte)

---

# 2️⃣ Ver el contenido de una clave pública

Ejemplo:

```bash
cat ~/.ssh/id_ed25519_trabajo.pub
```

O abrirla en VS Code:

```bash
code ~/.ssh/id_ed25519_trabajo.pub
```

Esa línea que empieza por:

```
ssh-ed25519 AAAA...
```

👉 Esa es la que se pega en GitHub o GitLab.

Nunca compartas la privada (`id_ed25519_trabajo`).

---

# 3️⃣ Probar si ya funciona con GitHub

Antes de crear nada nuevo:

```bash
ssh -T git@github.com
```

Si responde:

```
Hi usuario! You've successfully authenticated
```

Ya tienes una clave funcionando.

---

# 4️⃣ Crear una nueva clave (si no tienes o quieres separarlas)

En Mac lo recomendado es `ed25519`.

### Ejemplo trabajo:

```bash
ssh-keygen -t ed25519 -C"correo@empresa.com" -f ~/.ssh/id_ed25519_trabajo
```

### Ejemplo personal:

```bash
ssh-keygen -t ed25519 -C"correo@personal.com" -f ~/.ssh/id_ed25519_personal
```

Cuando pregunte passphrase:

- Puedes dejar vacío (Enter)
- O poner contraseña para más seguridad

---

# 5️⃣ Iniciar y cargar claves en el agente (Mac)

Primero iniciar:

```bash
eval"$(ssh-agent -s)"
```

Agregar clave:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_trabajo
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_personal
```

Verificar:

```bash
ssh-add -l
```

---

# 6️⃣ Subir la clave pública a GitHub

Ir a:

👉 https://github.com/settings/keys

Pasos:

1. New SSH Key
2. Pegar contenido de:

```bash
cat ~/.ssh/id_ed25519_trabajo.pub
```

1. Guardar

---

# 7️⃣ Configurar múltiples claves con `~/.ssh/config`

Este es el paso clave para orden profesional.

Editar:

```bash
code ~/.ssh/config
```

(O con nano)

```bash
nano ~/.ssh/config
```

---

## Ejemplo limpio para 2 cuentas en GitHub

```bash
# Personal
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnlyyes# Trabajo
Host github-trabajo
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_trabajo
    IdentitiesOnlyyes
```

Guardar y luego:

```bash
chmod 600 ~/.ssh/config
```

---

# 8️⃣ Probar cada alias antes de clonar

Muy importante 👇

```bash
ssh -T git@github-personal
```

```bash
ssh -T git@github-trabajo
```

Si responde correctamente → todo está bien configurado.

---

# 9️⃣ Clonar usando el alias correcto

❌ Incorrecto:

```bash
gitclone git@github.com:usuario/repo.git
```

✅ Correcto (si es personal):

```bash
gitclone git@github-personal:usuario/repo.git
```

✅ Correcto (si es trabajo):

```bash
gitclone git@github-trabajo:empresa/repo.git
```

---

## 1. Subida a GITHUB por primera vez

Cuando tienes varias claves SSH, **NO debes usar `github.com` directamente**.

👉 Tienes que sustituir esa parte por el **Host** que definiste en `~/.ssh/config`.

---

## 2. 📍 Dónde cambiar la URL

### URL original de GitHub:

```
git@github.com:USUARIO/REPO.git
```

### 🔁 Debes cambiar SOLO esto:

```
- git@github.com:USUARIO/REPO.git
+ git@github-ovi:USUARIO/REPO.git
```

👉 Es decir:

- ❌ `github.com`
- ✅ `github-ovi` (tu alias)

---

## 3. 🧩 Ejemplo real

Tu repo:

```
git@github.com:ovi-dev/TanStack.git
```

Convertido para usar tu clave **ovi**:

```
git@github-ovi:ovi-dev/TanStack.git
```

---

## 4. 🚀 Añadir el remote correctamente

```
git remote add origingit@github-ovi:ovi-dev/TanStack.git
```

---

## 5. 🔍 Cómo probar que funciona

Ejecuta:

```
ssh-Tgit@github-ovi
```

### ✅ Resultado esperado:

```
Hi ovi-dev! You've successfully authenticated...
```

---

## 6. 🛠️ Si ya lo hiciste mal

Corrige el remote:

```
git remote set-url origingit@github-ovi:ovi-dev/TanStack.git
```

---

## 7. 🧭 Regla mental (lo más importante)

👉 **“El `Host` del config sustituye a `github.com` en la URL”**

---

## 8. ⚡ Checklist rápido

- [ ]  ¿Usé `github-ovi` en vez de `github.com`?
- [ ]  ¿La clave está en `~/.ssh/config`?
- [ ]  ¿`ssh -T git@github-ovi` funciona?

# 🔟 Ver qué remote está usando un repo

Dentro del proyecto:

```bash
git remote -v
```

Si ves:

```
git@github-trabajo:empresa/repo.git
```

Sabes qué clave está usando.

---

# 1️⃣1️⃣ Cambiar remote si está mal

```bash
git remote set-url origin git@github-trabajo:empresa/repo.git
```

---

# 1️⃣2️⃣ Debug si algo falla

Ver qué clave intenta usar:

```bash
ssh -vT git@github-trabajo
```

Buscar línea:

```
Offeringpublickey: ~/.ssh/id_ed25519_trabajo
```

---

# 🔐 Reglas de Oro

✔ Nunca compartas la privada

✔ Usa nombres descriptivos

✔ Usa alias en config

✔ Siempre prueba con `ssh -T` antes de clonar

✔ En Mac usa `--apple-use-keychain`

---

# 🧩 Estructura ideal en tu Mac

```
~/.ssh/
├── config
├── id_ed25519_personal
├── id_ed25519_personal.pub
├── id_ed25519_trabajo
├── id_ed25519_trabajo.pub
└── known_hosts
```

---

# 🎯 Flujo mental cada vez que configures una nueva clave

1. ¿Ya existe? → `ls ~/.ssh`
2. Si no → `ssh-keygen`
3. Agregar al agente
4. Subir `.pub` a GitHub
5. Crear alias en `config`
6. Probar con `ssh -T`
7. Clonar usando el alias

---

Si quieres, puedo ahora:

- 🔹 Adaptarte este manual EXACTAMENTE a tus claves actuales (`id_ed25519_GR` e `id_ed25519_izertis`)
- 🔹 Hacer versión ultra resumida tipo checklist
- 🔹 Hacer versión profesional para documentación interna de equipo
# ⚙ MantePlanta CMMS v2.1

Sistema de gestión de mantenimiento industrial (CMMS) con módulos de Órdenes de Trabajo, Incidencias de Operarios y autenticación por roles.

## Usuarios y contraseñas por defecto

| Usuario | Login    | Contraseña   | Rol      |
|---------|----------|--------------|----------|
| Juan Martínez  | `juan`   | `Mante2026!` | Jefe     |
| Carlos Méndez  | `carlos` | `Tec2026!`   | Técnico  |
| Luis Rodríguez | `luis`   | `Tec2026!`   | Técnico  |
| Ana Fernández  | `ana`    | `Op2026!`    | Operario |
| Paco Gómez     | `paco`   | `Op2026!`    | Operario |
| Rosa Herrero   | `rosa`   | `Op2026!`    | Operario |

> ⚠️ Cambia las contraseñas antes de poner en producción. Ver instrucciones abajo.

## Instalación local

```bash
npm install
npm run dev
```

## Compilar para producción

```bash
npm run build
# Sube la carpeta dist/ a tu hosting
```

## Despliegue en Netlify (recomendado)

1. Sube este repositorio a GitHub
2. Conecta el repo en [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`

## Cambiar contraseñas

1. Ve a https://emn178.github.io/online-tools/sha256.html
2. Escribe la contraseña nueva → copia el hash
3. En `src/App.jsx` busca `const DEMO_HASHES` dentro de `LoginScreen`
4. Reemplaza el hash del usuario correspondiente
5. Vuelve a compilar con `npm run build`

## Módulos

- ✅ Órdenes de Trabajo (CRUD completo)
- ✅ Incidencias de Operarios con flujo de aprobación
- ✅ Comentarios por incidencia (chat bidireccional)
- ✅ Conversión incidencia → OT
- ✅ Autenticación por roles (Jefe / Técnico / Operario)
- ✅ Sesión persistente 8h
- 🔧 Mantenimiento Preventivo (en desarrollo)
- 🔧 Inventario de Repuestos (en desarrollo)

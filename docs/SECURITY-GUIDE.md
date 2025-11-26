# 🔒 Guía de Seguridad Anti-Redirect

Esta guía documenta las medidas de seguridad implementadas para proteger Bingo Musical contra ataques de redirección maliciosa (SERPS) y otras vulnerabilidades comunes.

## 📋 Tabla de Contenidos

1. [Problema Original](#problema-original)
2. [Solución Implementada](#solución-implementada)
3. [Capas de Seguridad](#capas-de-seguridad)
4. [Herramientas de Validación](#herramientas-de-validación)
5. [Monitoreo Continuo](#monitoreo-continuo)
6. [Respuesta a Incidentes](#respuesta-a-incidentes)

## 🚨 Problema Original

El sitio experimentó redirecciones automáticas a sitios externos (SERPS - Search Engine Results Pages), un problema común de seguridad web. Los síntomas incluyen:

- Usuarios redirigidos automáticamente a sitios desconocidos
- Pérdida de tráfico orgánico
- Daño al posicionamiento SEO
- Posible compromiso de la confianza del usuario

**Referencia**: [Google - Open Redirect URLs](https://developers.google.com/search/blog/2009/01/open-redirect-urls-is-your-site-being)

## ✅ Solución Implementada

### 1. Content Security Policy (CSP)

Archivo: `_headers` (para GitHub Pages)

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://fundingchoicesmessages.google.com https://pagead2.googlesyndication.com; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  img-src 'self' data: https: blob:;
  frame-ancestors 'none';
```

**Protege contra:**
- Inyección de scripts maliciosos
- Iframes no autorizados
- Carga de recursos desde dominios desconocidos

### 2. Security Meta Tags

Agregados a todos los archivos HTML:

```html
<!-- Security Headers -->
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta http-equiv="X-Frame-Options" content="DENY" />
<meta http-equiv="X-XSS-Protection" content="1; mode=block" />
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), payment=(), usb=()" />
```

**Protege contra:**
- MIME-type sniffing
- Clickjacking
- Cross-Site Scripting (XSS)
- Fugas de información de referrer

### 3. robots.txt Mejorado

Bloquea rastreo de URLs con parámetros sospechosos:

```
Disallow: /*?redirect=*
Disallow: /*?url=*
Disallow: /*?goto=*
Disallow: /*?return=*
Disallow: /*?next=*
```

### 4. .gitignore de Seguridad

Previene commit de archivos potencialmente maliciosos:

```
*.exe
*.dll
*.php
*.asp
*.aspx
*.jsp
```

## 🛡️ Capas de Seguridad

### Capa 1: Prevención (Proactiva)

- ✅ CSP headers
- ✅ Security meta tags
- ✅ Input sanitization en JavaScript
- ✅ Whitelist de dominios externos
- ✅ Service Worker con validación de URLs

### Capa 2: Detección (Automática)

- ✅ GitHub Actions security workflow
- ✅ Script de validación de seguridad
- ✅ Análisis de patrones sospechosos
- ✅ Verificación de scripts externos

### Capa 3: Respuesta (Manual)

- ✅ Documentación de procedimientos
- ✅ Scripts de remediación
- ✅ Proceso de reporte de incidentes

## 🔧 Herramientas de Validación

### Security Scanner (Local)

```bash
# Ejecutar validación completa
node scripts/security-check.js

# Salida esperada si no hay problemas:
# ✓ No security issues detected!
```

El scanner detecta:
- Redirecciones sospechosas
- Scripts externos no autorizados
- Uso de funciones peligrosas (eval, document.write)
- Inyecciones potenciales
- Patrones de obfuscación

### GitHub Actions (Automático)

Workflow: `.github/workflows/security-check.yml`

Se ejecuta automáticamente en:
- Cada push a `main` o `develop`
- Cada Pull Request
- Semanalmente (lunes a las 9 AM UTC)
- Manualmente desde la interfaz de GitHub

### Verificación Manual

```bash
# Revisar commits recientes
git log --all --oneline --since="7 days ago"

# Ver cambios en archivos específicos
git diff HEAD~5..HEAD -- "*.html" "*.js"

# Buscar patrones sospechosos
grep -r "window.location.*http" --include="*.js" --include="*.html"

# Verificar archivos sospechosos
find . -type f \( -name "*.php" -o -name "*.asp" -o -name "*.exe" \)
```

## 📊 Monitoreo Continuo

### Checklist Semanal

- [ ] Ejecutar `node scripts/security-check.js`
- [ ] Revisar logs de GitHub Actions
- [ ] Verificar Google Search Console
- [ ] Comprobar tráfico orgánico en Analytics
- [ ] Revisar commits no reconocidos

### Señales de Alerta

🚨 **Actuar inmediatamente si detectas:**

1. **Tráfico sospechoso**: Caída repentina en tráfico orgánico
2. **Reportes de usuarios**: Quejas sobre redirecciones
3. **Google Search Console**: Alertas de seguridad
4. **GitHub Actions**: Fallos en security workflow
5. **Archivos desconocidos**: Commits no realizados por ti

## 🚑 Respuesta a Incidentes

### Paso 1: Detección y Confirmación

```bash
# Ejecutar scanner
node scripts/security-check.js

# Revisar últimos cambios
git log --all --oneline --since="24 hours ago"
```

### Paso 2: Aislamiento

```bash
# Desactivar temporalmente el sitio (opcional)
echo "Maintenance mode" > index.html

# O redirigir a una página de mantenimiento
```

### Paso 3: Análisis

```bash
# Identificar commit problemático
git log --all --oneline --graph

# Ver cambios específicos
git show <commit-hash>

# Comparar con versión limpia
git diff <good-commit> <bad-commit>
```

### Paso 4: Remediación

```bash
# Opción A: Revertir commit específico
git revert <bad-commit>

# Opción B: Restaurar a versión limpia
git reset --hard <good-commit>
git push --force origin main

# Opción C: Crear nuevo commit con correcciones
# (editar archivos manualmente)
git add .
git commit -m "security: remove malicious code"
git push origin main
```

### Paso 5: Validación

```bash
# Ejecutar scanner de nuevo
node scripts/security-check.js

# Verificar en navegador
# - Limpiar cache
# - Desregistrar Service Worker
# - Probar navegación normal
```

### Paso 6: Prevención

```bash
# Activar protección de rama en GitHub:
# Settings > Branches > Branch protection rules
# - Require pull request reviews
# - Require status checks to pass
# - Include administrators

# Habilitar alertas de seguridad:
# Settings > Security & analysis
# - Dependency graph: Enabled
# - Dependabot alerts: Enabled
# - Dependabot security updates: Enabled
```

## 📞 Contacto de Emergencia

**Email de seguridad**: contacto@bingomusicalgratis.es  
**Asunto**: "SEGURIDAD URGENTE: [descripción]"

**Incluir en el reporte:**
1. Fecha y hora del incidente
2. Descripción del problema
3. Capturas de pantalla
4. Commits sospechosos (hashes)
5. Pasos ya tomados

## 📚 Referencias y Recursos

### Documentación del Proyecto
- [SECURITY.md](SECURITY.md) - Política de seguridad completa
- [README.md](README.md) - Documentación general del proyecto

### Recursos Externos
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Webmaster Guidelines](https://developers.google.com/search/docs/advanced/guidelines/webmaster-guidelines)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

### Herramientas Recomendadas
- [Google Safe Browsing](https://transparencyreport.google.com/safe-browsing/search)
- [VirusTotal](https://www.virustotal.com/)
- [Sucuri SiteCheck](https://sitecheck.sucuri.net/)

## 🎯 Resumen de Comandos Rápidos

```bash
# Validación rápida
node scripts/security-check.js

# Revisar cambios recientes
git log --oneline --since="7 days ago"

# Buscar archivos sospechosos
find . -name "*.php" -o -name "*.asp" -o -name "*.exe"

# Restaurar a versión limpia (CUIDADO!)
git reset --hard <commit-hash>

# Limpiar Service Worker cache
# DevTools > Application > Service Workers > Unregister
# DevTools > Application > Clear Storage > Clear site data
```

## ✨ Mantenimiento

Este documento debe actualizarse cuando:
- Se implementen nuevas medidas de seguridad
- Se descubran nuevas vulnerabilidades
- Se cambien procedimientos de respuesta
- Se agreguen nuevas herramientas de monitoreo

**Última actualización**: 2025-11-22  
**Próxima revisión**: 2025-12-22  
**Responsable**: Jesus Angel Señoran

---

**¿Preguntas?** Contacta a: contacto@bingomusicalgratis.es

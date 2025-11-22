# Security Policy

## Protección Contra Redirecciones Maliciosas (SERPS)

Este proyecto implementa múltiples capas de seguridad para prevenir ataques de redirección automática y otros problemas de seguridad comunes.

### Medidas de Seguridad Implementadas

#### 1. Content Security Policy (CSP)
Implementado en `_headers` para GitHub Pages:
- Restringe las fuentes de scripts, estilos e imágenes
- Previene la ejecución de scripts no autorizados
- Bloquea iframes de dominios no confiables
- Fuerza actualizaciones a HTTPS

#### 2. Security Meta Tags
Implementado en todos los archivos HTML:
```html
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta http-equiv="X-Frame-Options" content="DENY" />
<meta http-equiv="X-XSS-Protection" content="1; mode=block" />
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
```

#### 3. Input Sanitization
Todas las entradas de usuario son sanitizadas mediante la función `sanitize()`:
```javascript
const sanitize = s => (typeof s === 'string') ? s.replaceAll('<','&lt;').replaceAll('>','&gt;') : '';
```

Se prefiere el uso de `textContent` sobre `innerHTML` cuando sea posible.

#### 4. Service Worker Security
- Cache solo de recursos propios y dominios confiables
- Validación de URLs antes de cachear
- Lista blanca de dominios externos permitidos

#### 5. Validación Automática
Script de seguridad (`scripts/security-check.js`) que detecta:
- Redirecciones sospechosas
- Scripts externos no autorizados
- Uso de `eval()` y otras funciones peligrosas
- Inyecciones de código potenciales

### Cómo Ejecutar el Scanner de Seguridad

```bash
# Ejecutar el scanner de seguridad
node scripts/security-check.js

# El script retorna código de salida 0 si no hay problemas
# Código de salida 1 si encuentra problemas potenciales
```

### Dominios Externos Autorizados

Solo los siguientes dominios externos están permitidos:
- `bingomusical.com` - Dominio principal
- `bingomusicalgratis.es` - Dominio alternativo
- `open.spotify.com` - Integración de Spotify
- `fonts.googleapis.com` / `fonts.gstatic.com` - Google Fonts
- `pagead2.googlesyndication.com` - Google AdSense
- `fundingchoicesmessages.google.com` - Google CMP
- `www.gstatic.com` - Google Static Resources
- `firebaseio.com` - Firebase (para modo online)
- `schema.org` - Structured Data

### Qué Hacer en Caso de Ataque

Si detectas redirecciones automáticas o comportamiento sospechoso:

1. **Ejecutar Scanner de Seguridad**
   ```bash
   node scripts/security-check.js
   ```

2. **Revisar Commits Recientes**
   ```bash
   git log --all --oneline --since="7 days ago"
   ```

3. **Verificar Archivos Modificados**
   ```bash
   git diff HEAD~5..HEAD
   ```

4. **Restaurar Versión Limpia**
   ```bash
   # Identificar último commit antes del ataque
   git log --oneline
   
   # Revertir a versión segura
   git reset --hard <commit-hash>
   
   # Forzar push (solo si estás seguro)
   # git push --force origin main
   ```

5. **Verificar Service Worker**
   - Abrir DevTools > Application > Service Workers
   - Hacer clic en "Unregister" si hay versiones sospechosas
   - Limpiar cache: DevTools > Application > Clear Storage

6. **Limpiar Cache del Navegador**
   - Usuarios afectados deben limpiar su cache
   - Ctrl+Shift+Delete (Chrome/Edge)
   - Cmd+Shift+Delete (Safari)

7. **Verificar Hosting y DNS**
   - Revisar configuración de GitHub Pages
   - Verificar registros DNS del dominio
   - Confirmar que CNAME apunta a GitHub Pages

### Prevención de Ataques Futuros

#### GitHub Repository Settings
1. Activar "Require branches to be up to date before merging"
2. Activar "Require signed commits" (recomendado)
3. Activar "Include administrators" en branch protection

#### Monitoreo Regular
```bash
# Ejecutar semanalmente
node scripts/security-check.js

# Revisar commits no reconocidos
git log --all --author="!$(git config user.email)" --since="7 days ago"
```

#### Buenas Prácticas
1. **No usar `innerHTML`** con datos no sanitizados
2. **Validar todas las URLs** antes de redireccionar
3. **No usar `eval()`** o funciones similares
4. **Revisar scripts externos** antes de incluirlos
5. **Mantener dependencias actualizadas**
6. **Usar HTTPS siempre**

### Referencias de Seguridad

- [Google: Open Redirect URLs](https://developers.google.com/search/blog/2009/01/open-redirect-urls-is-your-site-being)
- [OWASP: XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [GitHub: Securing Your Repository](https://docs.github.com/en/code-security/getting-started/securing-your-repository)

## Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad:

### Contacto Urgente
- **Email**: contacto@bingomusicalgratis.es
- **Asunto**: "SEGURIDAD: [Descripción breve]"

### Información a Incluir
1. Descripción detallada de la vulnerabilidad
2. Pasos para reproducir el problema
3. Impacto potencial
4. Versión afectada (commit hash o fecha)
5. Capturas de pantalla (si aplica)

### Proceso de Respuesta
1. **Confirmación**: Respuesta en 24-48 horas
2. **Análisis**: Evaluación del problema en 2-5 días
3. **Corrección**: Implementación del fix según severidad
4. **Notificación**: Actualización al reportante
5. **Publicación**: Documentación del incidente (opcional, con tu permiso)

### Severidad de Vulnerabilidades

| Nivel | Descripción | Tiempo de Respuesta |
|-------|-------------|---------------------|
| **CRÍTICO** | Permite ejecución de código o robo de datos | 24 horas |
| **ALTO** | Afecta la seguridad de los usuarios | 48 horas |
| **MEDIO** | Problema de seguridad con impacto limitado | 5 días |
| **BAJO** | Mejora de seguridad o hardening | 14 días |

## Versiones Soportadas

| Versión | Soportada | Notas |
|---------|-----------|-------|
| main (latest) | ✅ | Producción activa |
| develop | ⚠️ | Testing - no usar en producción |
| < 1.0 | ❌ | Versiones antiguas sin soporte |

## Historial de Seguridad

### 2025-11-22: Implementación de Protección Anti-Redirect
- Agregado Content Security Policy (CSP)
- Agregados headers de seguridad en `_headers`
- Creado script de validación `security-check.js`
- Documentación completa de medidas de seguridad
- Meta tags de seguridad en todas las páginas HTML

### Incidentes Reportados
- **2025-11-XX**: Redirecciones a SERPS detectadas y corregidas
  - Causa: [Pendiente de investigación]
  - Solución: Restauración desde backup + hardening de seguridad
  - Estado: ✅ Resuelto

---

**Última actualización**: 2025-11-22  
**Responsable**: Jesus Angel Señoran (contacto@bingomusicalgratis.es)

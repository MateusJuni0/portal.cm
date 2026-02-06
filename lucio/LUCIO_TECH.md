# 🔧 LÚCIO - ARSENAL TÉCNICO

**NÍVEL:** Full Stack Senior (10+ anos)

---

## 🎯 CORE SKILLS

### N8N Avançado
- Function Nodes (JavaScript/TypeScript)
- Error handling + retry logic (exponential backoff)
- Webhooks seguros (HMAC), Merge/Split/Loop nodes
- JSON manipulation, variáveis ambiente

### Infraestrutura
- **Linux:** Ubuntu/Debian - htop, pm2, systemctl, ufw, fail2ban
- **Docker:** Compose, logs, stats, prune, health checks
- **Nginx:** Proxy reverso, SSL, rate limiting, load balancing
- **Monitoramento:** Prometheus, Grafana, Loki, alertas

### APIs & Integrações
- Evolution API (WhatsApp): retry, timeout, validation
- Telegram Bot API: webhooks, inline keyboards
- Google APIs: Sheets, Drive, Calendar
- REST/GraphQL: autenticação, rate limiting, error handling

### Databases
- PostgreSQL: queries otimizadas, indexes, EXPLAIN ANALYZE
- Redis: cache, sessions, feature flags
- Backups automáticos, migrations

### DevOps & CI/CD
- Git Flow: branches semânticos, commits estruturados
- GitHub Actions: test → build → deploy pipeline
- Docker multi-stage builds
- Rollback strategies

---

## 💻 FULL STACK

### Front-End
- React 18+, Next.js 14, Vue 3/Nuxt
- TypeScript, React Query, state management
- Tailwind CSS, Styled Components
- Performance: lazy loading, code splitting, caching

### Back-End
- Node.js: Express, Fastify (3x faster), NestJS
- JWT + Refresh tokens
- Middleware: helmet, cors, compression, rate limiting
- Graceful shutdown, health checks

### SaaS Architecture
- Multi-tenant (subdomain/header/path strategies)
- Stripe billing + webhooks
- Feature flags + A/B testing
- Usage-based metrics

---

## 🐛 TROUBLESHOOTING (O QUE MAIS GOSTO)

### Bug Hunting Proativo
- Scripts automáticos verificando logs/erros a cada hora
- Memory leak detection
- Endpoint health checks
- Data integrity validation

### Root Cause Analysis
1. Reprodução consistente
2. Isolamento (código vs infra)
3. Análise de logs (grep, tail, timestamps)
4. Hipóteses priorizadas
5. Fix + teste + documentação + prevenção

### Gateway & Network
- Nginx debug logs (request_time, upstream_time)
- SSL cert monitoring + auto-renewal
- Backend connectivity checks
- Network latency analysis

### Data Corruption Recovery
- Backup automático antes de qualquer fix
- Detecção: orphaned records, invalid emails, duplicatas, JSON corrupto
- Correção estruturada com rollback plan
- Post-mortem documentation

---

## 🔒 SEGURANÇA

- OWASP Top 10 prevention
- Input validation (Joi schemas)
- SQL injection prevention (prepared statements)
- Rate limiting (API/auth endpoints)
- Secrets management (.env, never hardcoded)
- HTTPS enforced, CORS configured

---

## 📊 PERFORMANCE

- Response time <200ms (p95)
- Memory profiling (Node.js --inspect)
- Query optimization (indexes, no N+1)
- Caching strategies (Redis)
- Load testing (k6, Artillery)
- CDN + compression

---

## ✅ QUALITY CHECKLIST (PRÉ-COMMIT)

- [ ] Função <50 linhas, variáveis descritivas
- [ ] Zero console.log(), zero magic numbers
- [ ] Testes passando (coverage >80%)
- [ ] Input validation + error handling
- [ ] Queries <100ms (EXPLAIN)
- [ ] README/CHANGELOG atualizados
- [ ] Security scan passed

---

## 🛠️ FERRAMENTAS

**CLI:** curl, jq, ngrok, tmux, vim
**Testing:** Jest, Playwright, k6
**Monitoring:** Prometheus, Grafana, Sentry
**IDE:** VS Code (ESLint, Prettier, GitLens)
**Docs:** Swagger, Markdown, Mermaid

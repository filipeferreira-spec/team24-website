# TEAM24 Prospecting API — Documentação para Agente Claude

## Endpoint

```
POST https://team24.pt/api/prospecting/webhook
```

## Autenticação

Incluir em todos os pedidos:

```
x-api-key: <valor da variável de ambiente PROSPECTING_API_KEY>
```

Ou em alternativa:
```
Authorization: Bearer <valor da variável de ambiente PROSPECTING_API_KEY>
```

> **Nota de segurança:** A API key está guardada como secret `PROSPECTING_API_KEY` no Manus. O valor nunca deve aparecer em texto claro em código ou documentação. O agente Claude deve recebê-la como variável de ambiente na tarefa agendada.

---

## Endpoints

### 0. `GET /api/prospecting/leads` — Ler próximas leads a processar

Endpoint de leitura para o agente iniciar o ciclo diário.

```
GET https://team24.pt/api/prospecting/leads?limit=15
x-api-key: <PROSPECTING_API_KEY>
```

**Query params:**
- `limit` — número de leads a devolver (máx. 100, default 15)
- `excluirEstados` — estados a excluir separados por vírgula

**Response:**
```json
{
  "ok": true,
  "total_disponiveis": 7846,
  "devolvidos": 15,
  "leads": [
    {
      "id": 1,
      "nome": "Empresa XYZ",
      "urlLinkedin": null,
      "cargo": null,
      "email": null,
      "empresa": "Empresa XYZ",
      "sector": "Indústria",
      "nFuncionarios": "500",
      "estado": "identificado",
      "duplicado": false,
      "duplicadoTipo": "nenhum",
      "notas": "Fonte: PME Excelência 2016 | Local: Lisboa"
    }
  ]
}
```

**Ordenação automática por prioridade:**
1. `identificado` — ainda não contactado (primeiro a processar)
2. `pedido_enviado` → `ligado` → `mensagem_1/2/3` → `resposta_positiva`

---

## Acções POST disponíveis

### 1. `upsert` — Criar ou actualizar prospecto

Cria um novo prospecto ou actualiza um existente (identificado pelo `urlLinkedin`).

**Request:**
```json
{
  "action": "upsert",
  "nome": "João Silva",
  "urlLinkedin": "https://www.linkedin.com/in/joaosilva",
  "cargo": "Director de Recursos Humanos",
  "email": "joao.silva@empresa.pt",
  "telefone": "+351912345678",
  "empresa": "Empresa XYZ, Lda",
  "sectore": "Tecnologia",
  "nFuncionarios": "50-200",
  "website": "https://empresa.pt",
  "estado": "pedido_enviado",
  "notas": "Encontrado via pesquisa LinkedIn por 'RH Lisboa'",
  "agenteNome": "Agente LinkedIn TEAM24",
  "mensagem": "Olá João, vi o seu perfil e gostaria de apresentar a TEAM24..."
}
```

**Campos obrigatórios:** `nome`

**Estados disponíveis:**
- `identificado` — Pessoa identificada, ainda sem contacto
- `pedido_enviado` — Pedido de ligação enviado no LinkedIn
- `ligado` — Ligação aceite
- `mensagem_1` — 1ª mensagem enviada
- `mensagem_2` — 2ª mensagem enviada
- `mensagem_3` — 3ª mensagem enviada
- `resposta_positiva` — Respondeu com interesse
- `resposta_negativa` — Respondeu sem interesse
- `reuniao_agendada` — Reunião marcada
- `sem_resposta` — Sem resposta após múltiplas tentativas
- `descartado` — Descartado

**Response (novo prospecto):**
```json
{
  "ok": true,
  "action": "created",
  "id": 42,
  "duplicado": false,
  "duplicadoTipo": "nenhum",
  "duplicadoLeadId": null,
  "duplicadoEmpresaId": null,
  "aviso": null
}
```

**Response (duplicado detectado):**
```json
{
  "ok": true,
  "action": "created",
  "id": 43,
  "duplicado": true,
  "duplicadoTipo": "empresa_existente",
  "duplicadoLeadId": null,
  "duplicadoEmpresaId": 127,
  "aviso": "⚠️ DUPLICADO DETECTADO: Esta empresa já existe no CRM"
}
```

**Tipos de duplicado:**
- `nenhum` — Sem duplicados
- `lead_existente` — Esta pessoa já existe como Lead no CRM
- `empresa_existente` — A empresa já existe no CRM
- `ambos` — Pessoa E empresa já existem no CRM

---

### 2. `add_message` — Adicionar mensagem a prospecto existente

```json
{
  "action": "add_message",
  "urlLinkedin": "https://www.linkedin.com/in/joaosilva",
  "conteudo": "Olá João, como está? Gostaria de agendar uma chamada rápida...",
  "tipo": "enviada",
  "canal": "linkedin"
}
```

Ou por ID:
```json
{
  "action": "add_message",
  "id": 42,
  "conteudo": "Obrigado pelo interesse! Podemos falar na próxima semana?",
  "tipo": "recebida",
  "canal": "linkedin"
}
```

**Tipos de mensagem:** `enviada` | `recebida` | `nota_interna`

**Response:**
```json
{
  "ok": true,
  "action": "message_added",
  "prospectId": 42
}
```

---

### 3. `update_estado` — Actualizar estado do prospecto

```json
{
  "action": "update_estado",
  "urlLinkedin": "https://www.linkedin.com/in/joaosilva",
  "estado": "reuniao_agendada"
}
```

**Response:**
```json
{
  "ok": true,
  "action": "estado_updated",
  "prospectId": 42,
  "estado": "reuniao_agendada"
}
```

---

## Fluxo típico do agente LinkedIn

```
1. Identificar pessoa → upsert (estado: "identificado")
2. Enviar pedido de ligação → update_estado (estado: "pedido_enviado")
3. Ligação aceite → update_estado (estado: "ligado")
4. Enviar 1ª mensagem → add_message (tipo: "enviada") + update_estado (estado: "mensagem_1")
5. Receber resposta positiva → add_message (tipo: "recebida") + update_estado (estado: "resposta_positiva")
6. Agendar reunião → update_estado (estado: "reuniao_agendada")
```

---

## Exemplo em Python (para o agente Claude)

```python
import requests
import os

WEBHOOK_URL = "https://team24.pt/api/prospecting/webhook"
API_KEY = os.environ["PROSPECTING_API_KEY"]  # Nunca hardcode — usar variável de ambiente

def ler_proximas_leads(limit=15):
    """Ler as próximas leads a processar"""
    response = requests.get(
        f"https://team24.pt/api/prospecting/leads?limit={limit}",
        headers={"x-api-key": API_KEY}
    )
    return response.json()["leads"]

def criar_prospecto(nome, linkedin_url, empresa, cargo, n_funcionarios=None, mensagem_inicial=None):
    response = requests.post(WEBHOOK_URL, 
        headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
        json={
            "action": "upsert",
            "nome": nome,
            "urlLinkedin": linkedin_url,
            "empresa": empresa,
            "cargo": cargo,
            "nFuncionarios": n_funcionarios,
            "estado": "identificado",
            "agenteNome": "Agente LinkedIn TEAM24",
            "mensagem": mensagem_inicial
        }
    )
    data = response.json()
    if data.get("aviso"):
        print(f"⚠️ {data['aviso']}")
    return data["id"]

def actualizar_estado(linkedin_url, estado):
    requests.post(WEBHOOK_URL,
        headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
        json={"action": "update_estado", "urlLinkedin": linkedin_url, "estado": estado}
    )

def registar_mensagem(linkedin_url, conteudo, tipo="enviada"):
    requests.post(WEBHOOK_URL,
        headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
        json={"action": "add_message", "urlLinkedin": linkedin_url, "conteudo": conteudo, "tipo": tipo}
    )
```

---

## Verificação de funcionamento

```bash
curl https://team24.pt/api/prospecting/webhook
# Resposta: {"status":"ok","info":"TEAM24 Prospecting Webhook — use POST com x-api-key"}
```

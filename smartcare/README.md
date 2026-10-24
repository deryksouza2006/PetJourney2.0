# PetJourney SmartCare

Serviço independente de priorização de acompanhamento de pets definido na Sprint 3. O SmartCare recebe informações já consolidadas sobre um pet e devolve uma prioridade operacional determinística. Ele não acessa banco de dados, não persiste resultados e não utiliza IA generativa ou modelos de Machine Learning.

## Arquitetura

```text
Requisição HTTP
    -> FastAPI / Pydantic
    -> motor de regras em app/service.py
    -> resposta JSON
```

## Regras

- Último atendimento entre 0 e 90 dias: 0 pontos.
- Entre 91 e 180 dias: 10 pontos.
- Entre 181 e 365 dias: 30 pontos.
- Acima de 365 dias: 60 pontos.
- Sem próximo agendamento: 20 pontos.
- Tratamento registrado e sem retorno agendado: 20 pontos.
- Score máximo: 100.
- Prioridade `BAIXA`: 0 a 29; `MEDIA`: 30 a 59; `ALTA`: 60 a 100.

Datas futuras para o último atendimento são rejeitadas com HTTP 422.

## Tecnologias

- Python 3
- FastAPI e Pydantic
- Uvicorn
- pytest e HTTPX para os testes HTTP

## Instalação

Execute a partir do diretório `smartcare`:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Execução

```bash
uvicorn app.main:app --reload --port 8001
```

A documentação Swagger estará disponível em `http://localhost:8001/docs`.

Health check:

```bash
curl http://localhost:8001/health
```

## Testes

```bash
pytest
```

## Exemplo de análise

Requisição:

```bash
curl -X POST http://localhost:8001/smartcare/analisar \
  -H 'Content-Type: application/json' \
  -d '{
    "petId": 123,
    "dataUltimoAtendimento": "2025-08-06",
    "possuiProximoAgendamento": false,
    "possuiTratamentoRegistrado": true
  }'
```

Resposta possível:

```json
{
  "petId": 123,
  "score": 100,
  "prioridade": "ALTA",
  "motivos": [
    "Longo período sem atendimento registrado",
    "Não possui próximo agendamento",
    "Existe tratamento registrado sem retorno agendado"
  ],
  "recomendacao": "Entrar em contato com o tutor para retomar o acompanhamento"
}
```

O SmartCare não realiza diagnóstico veterinário e suas recomendações são exclusivamente operacionais.

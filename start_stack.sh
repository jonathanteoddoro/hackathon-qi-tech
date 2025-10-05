#!/bin/bash
# 🚀 Script para iniciar toda a stack integrada

echo "🔥 Iniciando Stack Completa de Validação de Documentos"
echo "=================================================="

# 1. Iniciar API ML
echo "1. 🤖 Iniciando API ML..."
cd /home/inteli/workspace/hackathon-qi-tech/ml-document-validator
source venv/bin/activate
python3 app_simple.py &
ML_PID=$!
echo "   API ML iniciada (PID: $ML_PID)"

# Esperar API ML inicializar
sleep 5

# 2. Iniciar Backend
echo "2. 🔧 Iniciando Backend..."
cd /home/inteli/workspace/hackathon-qi-tech/backend
npm run start:dev &
BACKEND_PID=$!
echo "   Backend iniciado (PID: $BACKEND_PID)"

# Esperar Backend inicializar
sleep 10

# 3. Iniciar Frontend
echo "3. 🌐 Iniciando Frontend..."
cd /home/inteli/workspace/hackathon-qi-tech/frontend
npm run dev &
FRONTEND_PID=$!
echo "   Frontend iniciado (PID: $FRONTEND_PID)"

# Esperar Frontend inicializar
sleep 5

echo ""
echo "✅ Stack completa iniciada!"
echo ""
echo "📋 URLs dos Serviços:"
echo "🤖 API ML:        http://localhost:8000"
echo "🔧 Backend:       http://localhost:3001"
echo "🌐 Frontend:      http://localhost:5173"
echo ""
echo "📖 Documentação:"
echo "🤖 ML API Docs:   http://localhost:8000/docs"
echo ""
echo "🧪 Para testar a integração:"
echo "python3 teste_integracao_completa.py"
echo ""
echo "⚠️  Para parar todos os serviços:"
echo "kill $ML_PID $BACKEND_PID $FRONTEND_PID"
echo ""
echo "✨ Integração pronta! Use o componente DocumentValidator no frontend."
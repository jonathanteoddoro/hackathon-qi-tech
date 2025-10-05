#!/usr/bin/env python3
"""
🧪 Teste de Integração Completa
Backend + Frontend + ML API
"""

import requests
import json
import time
import os

def test_ml_api():
    """Testa a API ML"""
    print("🤖 Testando API ML...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ API ML funcionando - Modelo: {data.get('model_loaded')}")
            return True
        else:
            print(f"   ❌ API ML erro {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ API ML não disponível: {e}")
        return False

def test_backend_api():
    """Testa a API Backend"""
    print("🔧 Testando Backend...")
    
    try:
        # Testar endpoint de saúde do ML
        response = requests.get("http://localhost:3001/api/ml-health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Backend conectado ao ML - Status: {data.get('success')}")
            return True
        else:
            print(f"   ❌ Backend erro {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Backend não disponível: {e}")
        return False

def test_document_validation():
    """Testa validação de documento via backend"""
    print("📄 Testando validação de documento...")
    
    # Criar um documento de teste
    test_text = """ESCRITURA PÚBLICA DE COMPRA E VENDA
Cartório: 1º Tabelião de Notas
Vendedor: João Silva Santos
Comprador: Maria Oliveira Costa
Imóvel: Lote rural 15, área 1000m²
Valor: R$ 500.000,00
Matrícula: 12345"""
    
    try:
        response = requests.post(
            "http://localhost:3001/api/validate-document-text",
            headers={"Content-Type": "application/json"},
            json={"text": test_text, "proposalId": "test-123"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                result = data.get('data', {})
                print(f"   ✅ Validação OK - Válido: {result.get('isValid')}, Confiança: {result.get('confidence', 0):.1%}")
                return True
            else:
                print(f"   ❌ Validação falhou: {data.get('message')}")
                return False
        else:
            print(f"   ❌ Erro HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erro na validação: {e}")
        return False

def test_proposal_validation():
    """Testa validação para uma proposta específica"""
    print("📋 Testando validação para proposta...")
    
    # Simular um arquivo de texto
    test_content = b"""ESCRITURA DE PROPRIEDADE RURAL
Proprietario: Produtor Agricola
Area: 500 hectares
Localizacao: Zona Rural, Mato Grosso
Cultura: Soja e Milho
Valor: R$ 2.500.000,00
Documentacao: Regular e Atualizada"""
    
    try:
        files = {
            'file': ('documento_propriedade.txt', test_content, 'text/plain')
        }
        
        response = requests.post(
            "http://localhost:3001/api/proposals/test-proposal-456/validate-document",
            files=files,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                result = data.get('data', {})
                print(f"   ✅ Proposta validada - Aprovado: {result.get('approved')}, Risco: {result.get('riskScore', 0):.1f}%")
                return True
            else:
                print(f"   ❌ Validação de proposta falhou: {data.get('message')}")
                return False
        else:
            print(f"   ❌ Erro HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erro na validação de proposta: {e}")
        return False

def main():
    """Executa todos os testes de integração"""
    
    print("🚀 TESTE DE INTEGRAÇÃO COMPLETA")
    print("=" * 50)
    
    tests = [
        ("API ML", test_ml_api),
        ("Backend API", test_backend_api), 
        ("Validação de Documento", test_document_validation),
        ("Validação de Proposta", test_proposal_validation),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        success = test_func()
        results.append((test_name, success))
        time.sleep(1)
    
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES")
    print("=" * 50)
    
    passed = 0
    for test_name, success in results:
        status = "✅ PASSOU" if success else "❌ FALHOU"
        print(f"{test_name:25} | {status}")
        if success:
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"🎯 Resultado: {passed}/{len(tests)} testes passaram")
    
    if passed == len(tests):
        print("🎉 TODOS OS TESTES PASSARAM! Integração funcionando perfeitamente!")
    else:
        print("⚠️  Alguns testes falharam. Verifique os serviços.")
    
    print("\n📝 Para usar no frontend:")
    print("1. Importe o componente DocumentValidator")
    print("2. Use: <DocumentValidator proposalId='sua-proposta' />")
    print("3. O componente se conectará automaticamente aos endpoints")

if __name__ == "__main__":
    main()
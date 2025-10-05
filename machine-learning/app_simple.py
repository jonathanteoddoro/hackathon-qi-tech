from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import joblib
import json
import os
from datetime import datetime
import re

# Importar nossos módulos
from data_generator import SyntheticDataGenerator
from model_trainer import DocumentValidatorTrainer
from ocr_simple import OCRProcessor

app = FastAPI(title="ML Document Validator API", version="1.0.0")

# Variáveis globais simples
ocr_processor = OCRProcessor()
model = None

def load_model():
    """Carrega o modelo treinado"""
    global model
    model_path = "models/document_validator.pkl"
    
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print("✅ Modelo carregado")
        return True
    else:
        print("⚠️ Modelo não encontrado. Execute: python model_trainer.py")
        return False

def extract_features_from_text(text):
    """Extrai features MUITO rigorosas do texto para documentos de propriedade rural"""
    
    # Termos OBRIGATÓRIOS para documentos de terra/propriedade rural
    land_property_terms = [
        'escritura', 'propriedade rural', 'fazenda', 'terreno', 'imóvel rural',
        'matrícula', 'registro de imóvel', 'cartório de registro', 'área rural'
    ]
    
    # Termos OBRIGATÓRIOS para CDA/Armazém
    cda_terms = [
        'certificado de depósito agropecuário', 'cda', 'armazém', 'depositário', 
        'warrant agropecuário', 'wa', 'produto agropecuário', 'safra'
    ]
    
    # Termos técnicos de agricultura
    agro_technical_terms = [
        'hectares', 'toneladas', 'sacas', 'soja', 'milho', 'trigo', 'algodão',
        'bovinos', 'suínos', 'aves', 'cultivo', 'plantio', 'colheita'
    ]
    
    # Termos de documentação oficial
    official_doc_terms = [
        'cartório', 'tabelião', 'oficial público', 'reconhecimento de firma',
        'protocolo', 'livro de registro', 'certidão', 'autenticação'
    ]
    
    # Termos que INVALIDAM completamente o documento
    invalid_terms = [
        'currículo', 'cv', 'curriculum', 'experiência profissional', 'formação acadêmica',
        'habilidades', 'skills', 'trabalhou', 'emprego', 'empresa', 'cargo',
        'universidade', 'faculdade', 'graduação', 'pós-graduação', 'mestrado',
        'doutorado', 'curso', 'disciplina', 'professor', 'aluno', 'estudante',
        'nvidia', 'inteli', 'challenge', 'academy', 'projeto', 'desenvolvedor',
        'software', 'programação', 'python', 'javascript', 'react', 'node'
    ]
    
    text_lower = text.lower()
    
    # Contagens rigorosas
    land_count = sum(1 for term in land_property_terms if term in text_lower)
    cda_count = sum(1 for term in cda_terms if term in text_lower)
    agro_tech_count = sum(1 for term in agro_technical_terms if term in text_lower)
    official_count = sum(1 for term in official_doc_terms if term in text_lower)
    invalid_count = sum(1 for term in invalid_terms if term in text_lower)
    
    # Verificações OBRIGATÓRIAS mais específicas
    has_dates = len(re.findall(r'\d{1,2}[\s]*de[\s]*\w+[\s]*de[\s]*\d{4}|\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}', text_lower))
    has_cpf_cnpj = len(re.findall(r'\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}', text))
    has_money = len(re.findall(r'R\$\s*[\d.,]+|reais|valor|preço', text_lower))
    has_area_measures = len(re.findall(r'\d+[\s]*(?:hectares?|ha|m²|metros?|alqueires?|toneladas?|sacas?)', text_lower))
    has_coordinates = len(re.findall(r'-?\d+\.\d+.*-?\d+\.\d+', text))
    has_registry_numbers = len(re.findall(r'(?:matrícula|registro|protocolo)[\s\n]*n?[ºo°]?\s*[\d\-\.]+', text_lower))
    
    # Comprimento do texto
    text_length = len(text)
    word_count = len(text.split())
    
    # CRITÉRIOS EXTREMAMENTE RIGOROSOS:
    # Para ser válido o documento DEVE ter:
    
    # 1. PELO MENOS UM tipo de documento válido
    is_land_document = land_count >= 2  # Escritura/propriedade rural
    is_cda_document = cda_count >= 2    # CDA/Armazém
    
    # 2. ZERO termos invalidantes (CV, etc)
    has_invalid_terms = invalid_count > 0
    
    # 3. Elementos técnicos obrigatórios (critérios mais flexíveis)
    has_sufficient_agro = agro_tech_count >= 1
    has_sufficient_official = official_count >= 1  
    has_sufficient_dates = has_dates >= 1 or len(re.findall(r'\d{4}', text)) >= 1  # Data ou pelo menos um ano
    has_sufficient_ids = (has_cpf_cnpj >= 1 or has_registry_numbers >= 1)
    has_sufficient_length = text_length >= 200  # Reduzido de 300 para 200
    
    # DECISÃO FINAL RIGOROSA
    is_valid_document_type = is_land_document or is_cda_document
    has_all_requirements = (
        has_sufficient_agro and 
        has_sufficient_official and 
        has_sufficient_dates and 
        has_sufficient_ids and 
        has_sufficient_length
    )
    
    # SÓ É VÁLIDO SE:
    # - É um tipo de documento válido (terra OU CDA)
    # - NÃO tem termos invalidantes
    # - TEM todos os requisitos técnicos
    is_truly_valid = (
        is_valid_document_type and 
        not has_invalid_terms and 
        has_all_requirements
    )
    
    # Features para o modelo ML (mantendo compatibilidade)
    features = [
        land_count + cda_count,      # 0: Documentos válidos
        agro_tech_count,             # 1: Termos técnicos agro
        invalid_count * -10,         # 2: Penalidade por termos inválidos
        has_dates,                   # 3: Datas
        has_cpf_cnpj + has_registry_numbers,  # 4: Identificações
        has_money,                   # 5: Valores
        has_area_measures,           # 6: Medidas de área
        min(text_length/1000, 10),   # 7: Tamanho normalizado
        min(word_count/100, 10),     # 8: Palavras normalizadas
    ]
    
    # Log para debug detalhado
    print(f"🔍 Análise rigorosa:")
    print(f"   📋 Tipo válido: {is_valid_document_type} (Terra: {is_land_document}, CDA: {is_cda_document})")
    print(f"   ❌ Termos inválidos: {has_invalid_terms} ({invalid_count} encontrados)")
    print(f"   🌾 Termos agro suficientes: {has_sufficient_agro} ({agro_tech_count} encontrados)")
    print(f"   📜 Termos oficiais suficientes: {has_sufficient_official} ({official_count} encontrados)")
    print(f"   📅 Datas suficientes: {has_sufficient_dates} ({has_dates} encontradas)")
    print(f"   🆔 IDs suficientes: {has_sufficient_ids} (CPF/CNPJ: {has_cpf_cnpj}, Registros: {has_registry_numbers})")
    print(f"   📏 Tamanho suficiente: {has_sufficient_length} ({text_length} caracteres)")
    print(f"   ✅ Requisitos: {has_all_requirements}")
    print(f"   🎯 Decisão final: {is_truly_valid}")
    
    return features, is_truly_valid

@app.on_event("startup")
async def startup():
    """Inicialização"""
    print("🚀 Iniciando API...")
    os.makedirs("data", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    os.makedirs("uploads", exist_ok=True)
    load_model()

@app.get("/")
async def root():
    """Informações da API"""
    return {
        "message": "ML Document Validator API",
        "status": "running",
        "model_loaded": model is not None,
        "endpoints": ["/validate-document", "/health", "/docs"]
    }

@app.get("/health")
async def health():
    """Status da API"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/validate-document")
async def validate_document(file: UploadFile = File(...)):
    """Valida um documento"""
    if model is None:
        raise HTTPException(status_code=503, detail="Modelo não carregado")
    
    try:
        # Ler arquivo
        file_content = await file.read()
        
        # Processar com OCR
        ocr_result = ocr_processor.process_uploaded_file(file_content, file.filename)
        
        if not ocr_result["success"]:
            return {
                "is_valid": False,
                "confidence": 0.0,
                "error": ocr_result["error"],
                "extracted_text": ""
            }
        
        extracted_text = ocr_result["text"]
        
        # Extrair features com validação rigorosa
        features, is_rigorously_valid = extract_features_from_text(extracted_text)
        
        # Se não passou na validação rigorosa, retorna inválido direto
        if not is_rigorously_valid:
            return {
                "is_valid": False,
                "confidence": 0.0,
                "extracted_text": extracted_text,
                "reason": "Documento não atende critérios rigorosos para propriedade rural/CDA",
                "ocr_method": ocr_result.get("method_used", "tesseract"),
                "processed_at": datetime.now().isoformat()
            }
        
        # Se passou na validação rigorosa, usa o modelo ML como confirmação
        prediction = model.predict([features])[0]
        probabilities = model.predict_proba([features])[0]
        
        return {
            "is_valid": bool(prediction and is_rigorously_valid),
            "confidence": float(max(probabilities)),
            "extracted_text": extracted_text,
            "rigorous_validation": is_rigorously_valid,
            "ocr_method": ocr_result.get("method_used", "tesseract"),
            "processed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@app.post("/train-model")
async def train_model():
    """Treina o modelo"""
    try:
        if not os.path.exists("data/synthetic_data.csv"):
            # Gerar dados primeiro
            generator = SyntheticDataGenerator()
            data = generator.generate_dataset(n_samples=1000)
            generator.save_data(data, "data")
        
        # Treinar
        trainer = DocumentValidatorTrainer()
        df = trainer.load_data("data/synthetic_data.csv")
        X, y, _ = trainer.prepare_features(df)
        results, _, _ = trainer.train_models(X, y)
        model_path = trainer.save_model()
        
        # Recarregar modelo
        load_model()
        
        return {
            "success": True,
            "message": "Modelo treinado",
            "accuracy": max([r["accuracy"] for r in results.values()]),
            "model_path": model_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@app.post("/validate-text")
async def validate_text(request: dict):
    """Valida texto diretamente"""
    if model is None:
        raise HTTPException(status_code=503, detail="Modelo não carregado")
    
    text = request.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Texto é obrigatório")
    
    try:
        # Extrair features do texto com validação rigorosa
        features, is_rigorously_valid = extract_features_from_text(text)
        
        # Se não passou na validação rigorosa, retorna inválido direto  
        if not is_rigorously_valid:
            return {
                "is_valid": False,
                "confidence": 0.0,
                "extracted_text": text,
                "reason": "Documento não atende critérios rigorosos para propriedade rural/CDA",
                "processed_at": datetime.now().isoformat()
            }
        
        # Se passou na validação rigorosa, usa o modelo ML como confirmação
        prediction = model.predict([features])[0]
        probabilities = model.predict_proba([features])[0]
        
        return {
            "is_valid": bool(prediction and is_rigorously_valid),
            "confidence": float(max(probabilities)),
            "extracted_text": text,
            "rigorous_validation": is_rigorously_valid,
            "processed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor em http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
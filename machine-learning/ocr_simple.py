import cv2
import numpy as np
import pytesseract
import re
import os
import base64
from typing import Dict, Any

class OCRProcessor:
    def __init__(self):
        # Configuração simples do Mistral
        self.mistral_api_key = os.getenv('MISTRAL_API_KEY')
        self.use_mistral = bool(self.mistral_api_key and self.mistral_api_key != 'your_mistral_api_key_here')
        
        if self.use_mistral:
            try:
                from mistralai.client import MistralClient
                from mistralai.models.chat_completion import ChatMessage
                self.mistral_client = MistralClient(api_key=self.mistral_api_key)
                self.ChatMessage = ChatMessage
                print("✅ Mistral configurado")
            except ImportError:
                self.use_mistral = False

    def extract_text_tesseract(self, image):
        """OCR com Tesseract"""
        try:
            # Preprocessar
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # OCR
            text = pytesseract.image_to_string(gray, config='--oem 3 --psm 6 -l por')
            return text.strip()
        except Exception as e:
            print(f"Erro Tesseract: {e}")
            return ""

    def extract_text_mistral(self, image_bytes: bytes):
        """OCR com Mistral"""
        if not self.use_mistral:
            return ""
            
        try:
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            messages = [
                self.ChatMessage(
                    role="system",
                    content="Extraia o texto da imagem. Se não for documento de propriedade/terra, responda: DOCUMENTO_INVALIDO"
                ),
                self.ChatMessage(
                    role="user",
                    content=[
                        {"type": "text", "text": "Extraia o texto:"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                    ]
                )
            ]
            
            response = self.mistral_client.chat(
                model="mistral-large-latest",
                messages=messages,
                max_tokens=1000
            )
            
            text = response.choices[0].message.content.strip()
            
            if text.startswith("DOCUMENTO_INVALIDO"):
                return ""
            
            return text
            
        except Exception as e:
            print(f"Erro Mistral: {e}")
            return ""

    def is_valid_document(self, text: str):
        """Validação simples se é documento de terra"""
        if not text.strip():
            return False
            
        # Termos obrigatórios
        required_terms = ["escritura", "propriedade", "imóvel", "terra", "matrícula", "cartório"]
        found_terms = sum(1 for term in required_terms if term.lower() in text.lower())
        
        # Termos inválidos
        invalid_terms = ["nota fiscal", "receita", "curriculum", "cardápio"]
        has_invalid = any(term in text.lower() for term in invalid_terms)
        
        return found_terms >= 2 and not has_invalid

    def process_uploaded_file(self, file_content: bytes, filename: str):
        """Processa arquivo"""
        try:
            # Converter para imagem
            nparr = np.frombuffer(file_content, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return {"success": False, "error": "Imagem inválida", "text": ""}
            
            # Tentar Mistral primeiro
            text = ""
            method = "tesseract"
            
            if self.use_mistral:
                text = self.extract_text_mistral(file_content)
                if text:
                    method = "mistral"
            
            # Fallback para Tesseract
            if not text:
                text = self.extract_text_tesseract(image)
                method = "tesseract"
            
            # Validar se é documento de terra
            if not self.is_valid_document(text):
                return {
                    "success": False,
                    "error": "Documento não é relacionado a propriedade de terra",
                    "text": text
                }
            
            return {
                "success": True,
                "text": text,
                "method_used": method
            }
            
        except Exception as e:
            return {"success": False, "error": f"Erro: {str(e)}", "text": ""}

    def extract_structured_info(self, text: str):
        """Extrai informações básicas"""
        info = {
            "legal_terms": [],
            "dates": re.findall(r'\d{1,2}/\d{1,2}/\d{4}', text),
            "numbers": re.findall(r'\d+', text),
            "document_type": "unknown"
        }
        
        if "escritura" in text.lower():
            info["document_type"] = "escritura"
        elif "certidão" in text.lower():
            info["document_type"] = "certidao"
        
        return info

def test_simple():
    """Teste simples"""
    print("🧪 Teste simples do OCR...")
    
    processor = OCRProcessor()
    
    # Criar imagem de teste
    test_image = np.ones((300, 600, 3), dtype=np.uint8) * 255
    cv2.putText(test_image, "ESCRITURA PUBLICA", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
    cv2.putText(test_image, "Matricula: 12345", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    cv2.putText(test_image, "Propriedade rural", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    
    _, buffer = cv2.imencode('.png', test_image)
    image_bytes = buffer.tobytes()
    
    result = processor.process_uploaded_file(image_bytes, "test.png")
    
    print(f"✅ Sucesso: {result['success']}")
    if result['success']:
        print(f"📝 Texto: {result['text'][:100]}...")
        print(f"🔧 Método: {result.get('method_used')}")
    else:
        print(f"❌ Erro: {result['error']}")

if __name__ == "__main__":
    test_simple()
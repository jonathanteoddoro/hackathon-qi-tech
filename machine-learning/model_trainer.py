import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib
from datetime import datetime
import re

def extract_features_for_training(text):
    """Versão simplificada para treinamento que retorna só features"""
    
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
        'doutorado', 'curso', 'disciplina', 'professor', 'aluno', 'estudante'
    ]
    
    text_lower = text.lower()
    
    # Contagens
    land_count = sum(1 for term in land_property_terms if term in text_lower)
    cda_count = sum(1 for term in cda_terms if term in text_lower)
    agro_tech_count = sum(1 for term in agro_technical_terms if term in text_lower)
    official_count = sum(1 for term in official_doc_terms if term in text_lower)
    invalid_count = sum(1 for term in invalid_terms if term in text_lower)
    
    # Verificações
    has_dates = len(re.findall(r'\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}', text))
    has_cpf_cnpj = len(re.findall(r'\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}', text))
    has_money = len(re.findall(r'R\$\s*[\d.,]+|reais|valor|preço', text))
    has_area_measures = len(re.findall(r'\d+[\s]*(?:hectares?|ha|m²|metros?|alqueires?)', text_lower))
    has_registry_numbers = len(re.findall(r'(?:matrícula|registro|protocolo)[\s\n]*n?[ºo°]?\s*[\d\-\.]+', text_lower))
    
    text_length = len(text)
    word_count = len(text.split())
    
    # Features para o modelo ML
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
    
    return features

class DocumentValidatorTrainer:
    def __init__(self):
        self.models = {
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'logistic_regression': LogisticRegression(random_state=42, max_iter=1000),
            'svm': SVC(probability=True, random_state=42)
        }
        self.best_model = None
        self.scaler = StandardScaler()
        
    def load_data(self, csv_path='data/synthetic_data.csv'):
        """Carrega dados do CSV"""
        print(f"📂 Carregando dados de: {csv_path}")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Arquivo não encontrado: {csv_path}")
        
        df = pd.read_csv(csv_path)
        print(f"✅ Dados carregados: {len(df)} amostras")
        
        return df
    
    def prepare_features(self, df):
        """Prepara features para treinamento"""
        print("🔧 Preparando features...")
        
        # Selecionar apenas colunas numéricas para features
        feature_columns = [
            'legal_terms_count', 'has_dates', 'text_length', 
            'number_count', 'special_chars_count', 'legal_density',
            'keywords_present', 'has_coordinates', 'uppercase_ratio'
        ]
        
        # Verificar se todas as colunas existem
        missing_cols = [col for col in feature_columns if col not in df.columns]
        if missing_cols:
            print(f"⚠️  Colunas faltando: {missing_cols}")
            # Criar colunas faltando com valores padrão
            for col in missing_cols:
                df[col] = 0
        
        X = df[feature_columns].fillna(0)
        y = df['is_valid'].astype(int)
        
        print(f"📊 Features shape: {X.shape}")
        print(f"🎯 Target distribution: {y.value_counts().to_dict()}")
        
        return X, y, feature_columns
    
    def train_models(self, X, y):
        """Treina múltiplos modelos e seleciona o melhor"""
        print("🚀 Iniciando treinamento dos modelos...")
        
        # Dividir dados
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"📈 Dados de treino: {X_train.shape[0]} amostras")
        print(f"📊 Dados de teste: {X_test.shape[0]} amostras")
        
        best_score = 0
        results = {}
        
        for name, model in self.models.items():
            print(f"\n🔄 Treinando {name}...")
            
            # Criar pipeline com normalização
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('classifier', model)
            ])
            
            # Treinar modelo
            pipeline.fit(X_train, y_train)
            
            # Avaliar
            y_pred = pipeline.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            results[name] = {
                'model': pipeline,
                'accuracy': accuracy,
                'predictions': y_pred,
                'y_test': y_test
            }
            
            print(f"✅ {name} - Acurácia: {accuracy:.4f}")
            
            # Salvar melhor modelo
            if accuracy > best_score:
                best_score = accuracy
                self.best_model = pipeline
                self.best_model_name = name
        
        print(f"\n🏆 Melhor modelo: {self.best_model_name} (Acurácia: {best_score:.4f})")
        
        return results, X_test, y_test
    
    def evaluate_model(self, results, X_test, y_test):
        """Avalia o melhor modelo em detalhes"""
        print(f"\n📋 Avaliação detalhada do melhor modelo ({self.best_model_name}):")
        
        best_result = results[self.best_model_name]
        y_pred = best_result['predictions']
        
        # Relatório de classificação
        print("\n📊 Relatório de Classificação:")
        print(classification_report(y_test, y_pred, 
                                  target_names=['Inválido', 'Válido']))
        
        # Matriz de confusão
        print("\n🔍 Matriz de Confusão:")
        cm = confusion_matrix(y_test, y_pred)
        print(cm)
        
        # Importância das features (se disponível)
        if hasattr(self.best_model.named_steps['classifier'], 'feature_importances_'):
            print("\n🎯 Importância das Features:")
            importances = self.best_model.named_steps['classifier'].feature_importances_
            feature_names = [
                'legal_terms_count', 'has_dates', 'text_length', 
                'number_count', 'special_chars_count', 'legal_density',
                'keywords_present', 'has_coordinates', 'uppercase_ratio'
            ]
            
            for name, importance in zip(feature_names, importances):
                print(f"  {name}: {importance:.4f}")
    
    def save_model(self, model_dir='models'):
        """Salva o melhor modelo treinado"""
        os.makedirs(model_dir, exist_ok=True)
        
        model_path = os.path.join(model_dir, 'document_validator.pkl')
        
        # Salvar modelo
        joblib.dump(self.best_model, model_path)
        
        # Salvar metadados
        metadata = {
            'model_type': self.best_model_name,
            'trained_at': datetime.now().isoformat(),
            'feature_names': [
                'legal_terms_count', 'has_dates', 'text_length', 
                'number_count', 'special_chars_count', 'legal_density',
                'keywords_present', 'has_coordinates', 'uppercase_ratio'
            ]
        }
        
        metadata_path = os.path.join(model_dir, 'model_metadata.json')
        import json
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"💾 Modelo salvo em: {model_path}")
        print(f"📋 Metadados salvos em: {metadata_path}")
        
        return model_path
    
    def predict(self, features):
        """Faz predição com o modelo treinado"""
        if self.best_model is None:
            raise ValueError("Modelo não foi treinado ainda!")
        
        # Converter para formato correto se necessário
        if isinstance(features, dict):
            feature_order = [
                'legal_terms_count', 'has_dates', 'text_length', 
                'number_count', 'special_chars_count', 'legal_density',
                'keywords_present', 'has_coordinates', 'uppercase_ratio'
            ]
            features = [[features.get(f, 0) for f in feature_order]]
        
        prediction = self.best_model.predict(features)[0]
        probability = self.best_model.predict_proba(features)[0]
        
        return {
            'is_valid': bool(prediction),
            'confidence': float(max(probability)),
            'probabilities': {
                'invalid': float(probability[0]),
                'valid': float(probability[1])
            }
        }

def main():
    print("🤖 Iniciando treinamento do modelo de validação de documentos...")
    
    trainer = DocumentValidatorTrainer()
    
    try:
        # Carregar dados
        df = trainer.load_data()
        
        # Preparar features
        X, y, feature_columns = trainer.prepare_features(df)
        
        # Treinar modelos
        results, X_test, y_test = trainer.train_models(X, y)
        
        # Avaliar melhor modelo
        trainer.evaluate_model(results, X_test, y_test)
        
        # Salvar modelo
        model_path = trainer.save_model()
        
        print("\n✅ Treinamento concluído com sucesso!")
        print(f"🎯 Modelo final: {trainer.best_model_name}")
        print(f"💾 Arquivo do modelo: {model_path}")
        
        # Teste rápido
        print("\n🧪 Teste rápido do modelo:")
        test_features = {
            'legal_terms_count': 5,
            'has_dates': 1,
            'text_length': 500,
            'number_count': 10,
            'special_chars_count': 0,
            'legal_density': 0.1,
            'keywords_present': 3,
            'has_coordinates': 1,
            'uppercase_ratio': 0.15
        }
        
        prediction = trainer.predict(test_features)
        print(f"Resultado: {prediction}")
        
    except Exception as e:
        print(f"❌ Erro durante o treinamento: {str(e)}")
        raise

if __name__ == "__main__":
    main()
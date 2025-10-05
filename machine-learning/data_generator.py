import pandas as pd
import numpy as np
import json
import random
from datetime import datetime, timedelta
import os

class SyntheticDataGenerator:
    def __init__(self):
        self.legal_terms = [
            "escritura", "propriedade", "imóvel", "registro", "cartório",
            "matrícula", "lote", "quadra", "município", "comarca",
            "hectares", "metros quadrados", "confrontações", "limites",
            "proprietário", "adquirente", "transmitente", "outorgante",
            "certidão", "ônus", "gravame", "hipoteca", "alienação",
            "usucapião", "posse", "domínio", "título", "documento"
        ]
        
        self.document_types = [
            "escritura_publica", "certidao_propriedade", "contrato_compra_venda",
            "registro_imovel", "planta_propriedade", "memorial_descritivo"
        ]
        
        self.locations = [
            "São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Paraná",
            "Rio Grande do Sul", "Goiás", "Mato Grosso", "Ceará", "Pernambuco"
        ]
        
        self.invalid_indicators = [
            "texto_ilegivel", "documento_rasgado", "sem_assinatura",
            "data_invalida", "informacoes_incompletas", "formato_incorreto",
            "sem_carimbo", "texto_sobreposto", "qualidade_ruim"
        ]

    def generate_valid_document_text(self):
        """Gera texto de documento válido"""
        location = random.choice(self.locations)
        doc_type = random.choice(self.document_types)
        
        # Data aleatória nos últimos 50 anos
        start_date = datetime.now() - timedelta(days=50*365)
        random_date = start_date + timedelta(days=random.randint(0, 50*365))
        
        text_templates = [
            f"ESCRITURA PÚBLICA DE COMPRA E VENDA. Saibam quantos este público instrumento virem que no ano de {random_date.year}, aos {random_date.day} dias do mês de {random_date.strftime('%B')}, nesta cidade de {location}, Estado de São Paulo, Brasil, perante mim, Tabelião, compareceram como outorgante vendedor JOÃO DA SILVA, brasileiro, casado, proprietário rural, portador da Cédula de Identidade RG nº 12.345.678-9, inscrito no CPF sob nº 123.456.789-00, residente e domiciliado na propriedade rural denominada 'Fazenda Santa Rita', situada no município de {location}, matrícula nº {random.randint(10000, 99999)}, área de {random.randint(10, 1000)} hectares.",
            
            f"CERTIDÃO DE PROPRIEDADE expedida pelo Cartório de Registro de Imóveis da {random.randint(1, 10)}ª Circunscrição de {location}. Certifico que, revendo os livros de registro desta serventia, neles consta matriculado sob o nº {random.randint(10000, 99999)}, um imóvel rural denominado Sítio Boa Vista, com área de {random.randint(5, 100)} hectares, situado no distrito de {location}, confrontando ao Norte com propriedade de Maria Santos, ao Sul com estrada municipal, ao Leste com córrego das Pedras e ao Oeste com propriedade de José Oliveira.",
            
            f"MEMORIAL DESCRITIVO da propriedade rural situada no município de {location}, comarca de {location}, Estado de São Paulo, com área total de {random.randint(20, 500)} hectares, {random.randint(10, 99)} ares e {random.randint(10, 99)} centiares, registrada sob matrícula nº {random.randint(10000, 99999)} no Cartório de Registro de Imóveis. Inicia-se a descrição no ponto P1, situado nas coordenadas geográficas {random.uniform(-25, -20):.6f}°S e {random.uniform(-50, -45):.6f}°W."
        ]
        
        base_text = random.choice(text_templates)
        
        # Adiciona termos legais aleatórios
        num_terms = random.randint(3, 8)
        selected_terms = random.sample(self.legal_terms, num_terms)
        
        for term in selected_terms:
            if random.random() > 0.5:
                base_text += f" {term.upper()}"
        
        return base_text

    def generate_invalid_document_text(self):
        """Gera texto de documento inválido (currículos, textos aleatórios, etc)"""
        
        invalid_types = [
            self._generate_curriculum_text(),
            self._generate_random_text(),
            self._generate_commercial_text(),
            self._generate_academic_text(),
            self._generate_corrupted_text()
        ]
        
        return random.choice(invalid_types)
    
    def _generate_curriculum_text(self):
        """Gera currículo - documento inválido para AFI"""
        nome = random.choice(['João Silva', 'Maria Santos', 'Pedro Costa'])
        
        return f"""CURRÍCULO PROFISSIONAL

Nome: {nome}
Formação: {random.choice(['Engenharia', 'Administração', 'Contabilidade'])}

EXPERIÊNCIA PROFISSIONAL:
- Analista (2020-2022)
- Coordenador (2022-2024)

EDUCAÇÃO:
- Graduação em {random.choice(['Economia', 'Gestão', 'Tecnologia'])}
- Curso de especialização

HABILIDADES:
- Microsoft Office
- Gestão de equipes
- Liderança"""

    def _generate_random_text(self):
        """Gera texto completamente aleatório"""
        return f"""Texto aleatório sem contexto agrícola.

Este documento fala sobre assuntos urbanos e não tem relação 
com propriedades rurais ou documentação de terra.

Apenas texto comum com números: {random.randint(1000, 9999)}
Data: {random.randint(1, 28)}/{random.randint(1, 12)}/2024

Mais texto irrelevante para agricultura."""

    def _generate_commercial_text(self):
        """Gera documento comercial urbano"""
        return f"""CONTRATO COMERCIAL URBANO

Empresa: Tech Solutions LTDA
CNPJ: 12.345.678/0001-90

Prestação de serviços de consultoria
Valor: R$ {random.randint(5000, 50000):,.2f}

Local: Centro comercial - São Paulo/SP
Sem relação com atividades rurais"""

    def _generate_academic_text(self):
        """Gera documento acadêmico"""
        return f"""CERTIFICADO UNIVERSITÁRIO

Curso de {random.choice(['Engenharia', 'Medicina', 'Direito'])}
Carga horária: {random.randint(3000, 4000)}h
Nota: {random.uniform(7.0, 10.0):.1f}

Formatura: {random.randint(1, 28)}/{random.randint(1, 12)}/2024
Universidade Federal"""

    def _generate_corrupted_text(self):
        """Gera texto corrompido"""
        return random.choice([
            "texto ilegível ######### @@@@@@ $$$$$$",
            "doc*mento danific#do sem inf$rmaçõ&s",
            "DOCUMENTO SEM DATA 99/99/9999",
            "qualidade ruim ### não é possível ler",
            "informações incompletas: ___ ___ ___"
        ])

    def generate_features(self, text, is_valid):
        """Extrai features do texto para o modelo ML"""
        features = {}
        
        # Contagem de termos legais
        legal_count = sum(1 for term in self.legal_terms if term.lower() in text.lower())
        features['legal_terms_count'] = legal_count
        
        # Presença de datas
        import re
        date_patterns = [r'\d{1,2}/\d{1,2}/\d{4}', r'\d{4}', r'(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)']
        has_dates = any(re.search(pattern, text.lower()) for pattern in date_patterns)
        features['has_dates'] = int(has_dates)
        
        # Comprimento do texto
        features['text_length'] = len(text)
        
        # Presença de números (matrículas, CPF, etc.)
        features['number_count'] = len(re.findall(r'\d+', text))
        
        # Presença de caracteres especiais (pode indicar documento danificado)
        special_chars = len(re.findall(r'[#@$%&*|]', text))
        features['special_chars_count'] = special_chars
        
        # Densidade de termos legais
        words = text.split()
        features['legal_density'] = legal_count / max(len(words), 1)
        
        # Presença de palavras-chave específicas
        keywords = ['escritura', 'propriedade', 'matrícula', 'cartório', 'registro']
        features['keywords_present'] = sum(1 for kw in keywords if kw.lower() in text.lower())
        
        # Presença de coordenadas geográficas
        coord_pattern = r'-?\d{1,2}\.\d+°[NS]?\s*-?\d{1,2}\.\d+°[WE]?'
        features['has_coordinates'] = int(bool(re.search(coord_pattern, text)))
        
        # Razão maiúsculas/minúsculas (documentos legais têm padrão específico)
        if len(text) > 0:
            features['uppercase_ratio'] = sum(1 for c in text if c.isupper()) / len(text)
        else:
            features['uppercase_ratio'] = 0
        
        return features

    def generate_dataset(self, n_samples=1000):
        """Gera dataset completo"""
        data = []
        
        # 70% documentos válidos, 30% inválidos
        n_valid = int(n_samples * 0.7)
        n_invalid = n_samples - n_valid
        
        print(f"Gerando {n_valid} documentos válidos...")
        for i in range(n_valid):
            text = self.generate_valid_document_text()
            features = self.generate_features(text, True)
            
            sample = {
                'id': f'doc_{i+1:04d}',
                'text': text,
                'is_valid': True,
                'document_type': random.choice(self.document_types),
                'generated_at': datetime.now().isoformat(),
                **features
            }
            data.append(sample)
        
        print(f"Gerando {n_invalid} documentos inválidos...")
        for i in range(n_invalid):
            text = self.generate_invalid_document_text()
            features = self.generate_features(text, False)
            
            sample = {
                'id': f'doc_{n_valid+i+1:04d}',
                'text': text,
                'is_valid': False,
                'document_type': 'invalid',
                'generated_at': datetime.now().isoformat(),
                **features
            }
            data.append(sample)
        
        return data

    def save_data(self, data, base_path='data'):
        """Salva dados em CSV e JSON"""
        os.makedirs(base_path, exist_ok=True)
        
        # Converter para DataFrame
        df = pd.DataFrame(data)
        
        # Salvar CSV
        csv_path = os.path.join(base_path, 'synthetic_data.csv')
        df.to_csv(csv_path, index=False, encoding='utf-8')
        print(f"Dados salvos em: {csv_path}")
        
        # Salvar JSON
        json_path = os.path.join(base_path, 'synthetic_data.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Dados salvos em: {json_path}")
        
        return df

def main():
    print("🔄 Iniciando geração de dados sintéticos...")
    
    generator = SyntheticDataGenerator()
    
    # Gerar dataset
    data = generator.generate_dataset(n_samples=2000)
    
    # Salvar dados
    df = generator.save_data(data)
    
    # Estatísticas
    print("\n📊 Estatísticas do Dataset:")
    print(f"Total de amostras: {len(df)}")
    print(f"Documentos válidos: {df['is_valid'].sum()}")
    print(f"Documentos inválidos: {len(df) - df['is_valid'].sum()}")
    print(f"Tipos de documento: {df['document_type'].value_counts().to_dict()}")
    
    print("\n✅ Geração de dados concluída!")

if __name__ == "__main__":
    main()
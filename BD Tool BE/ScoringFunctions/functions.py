import pandas as pd
from fuzzywuzzy import fuzz
from PreprocessingFunctions.functions import preprocess_company_name, preprocess_person_name

def score_leads(data_json, icp_json, scoring_weights):
    data = pd.DataFrame(data_json)
    data = data.fillna("N/A")
    icp_data = pd.DataFrame(icp_json, index=[0])
    scores = []
    column_scores = {col: [] for col in scoring_weights}
    
    data["Company Name"] = data["Company Name"].apply(preprocess_company_name)
    data["Contact Full Name"] = data["Contact Full Name"].apply(preprocess_person_name)

    for index, row in data.iterrows():
        total_score = 0
        for col, weight in scoring_weights.items():
            score = round((fuzz.ratio(str(row[col]), str(icp_data[col][0])) * weight), 2)
            total_score += score
            column_scores[col].append(score)

        scores.append(round(total_score, 2))

    data['total_score'] = scores
    for col in scoring_weights:
        data[f'{col}_score'] = column_scores[col]

    min_score = data['total_score'].min()
    max_score = data['total_score'].max()

    data['normalized_score'] = round((data['total_score'] - min_score) / (max_score - min_score), 2) * 100
    sorted_data = data.sort_values(by='normalized_score', ascending=False).head(1000)  # Limit to top 1000 records

    return sorted_data.to_dict(orient='records')

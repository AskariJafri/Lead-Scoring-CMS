import re

def map_company_size(size):
    try:
        if size == "":
            return "Unknown"
        size = int(size)
        if size >= 1 and size <= 10:
            return "1-10"
        elif size >= 11 and size <= 50:
            return "11-50"
        elif size >= 51 and size <= 200:
            return "51-200"
        elif size >= 201 and size <= 500:
            return "201-500"
        elif size >= 501 and size <= 1000:
            return "501-1000"
        elif size >= 1001 and size <= 5000:
            return "1001-5000"
        elif size >= 5001 and size <= 10000:
            return "5001-10000"
        elif size >= 10001 and size <= 20000:
            return "10001-20000"
        elif size >= 20001:
            return "20001+"
        else:
            return "Unknown"
    except Exception:
        return "Unknown"
    
    
def preprocess_person_name(name):
    if isinstance(name, str):
        # Remove common titles such as "Mr.", "Mrs.", "Ms.", "Dr.", etc.
        title_pattern = r'\b(?:Mr|Mrs|Ms|Miss|Dr|Doctor|Professor|Prof)\b\.?\s*'
        name = re.sub(title_pattern, '', name, flags=re.IGNORECASE)
        return name.strip()  # Remove leading and trailing whitespace
    else:
        return name
    
def preprocess_company_name(name):
    if isinstance(name, str):
        return name.split(",")[0].strip()  
    else:
        return name
    
def preprocess_field(value, field_name):
    if field_name.lower() == "company name":
        return preprocess_company_name(value)
    elif field_name.lower() == "contact full name":
        return preprocess_person_name(value)
    else:
        return value
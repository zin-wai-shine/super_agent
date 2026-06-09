import json

cache_path = "frontend/node_modules/.cache/babel-loader/d929e6519c4feb23ed385011ef3aa69597464b49cbc06f621a3c5a75c3f92afb.json"

with open(cache_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

code = data.get('code')
if code:
    with open('/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_compiled.js', 'w', encoding='utf-8') as out:
        out.write(code)
    print(f"Extracted compiled code of length {len(code)} characters.")
else:
    print("No code field found in json.")

import json
import re

log_path = "/Users/zinwaishine/.gemini/antigravity-ide/brain/3f7f8c89-83ca-47fe-a8dd-090c6265f047/.system_generated/logs/transcript.jsonl"

views = []

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get('step_index')
            # Check if this is a view_file output
            if data.get('type') == 'VIEW_FILE' or 'Showing lines' in data.get('content', ''):
                content = data.get('content', '') or ''
                if 'AIAssistant.js' in content:
                    # Parse lines
                    matches = list(re.finditer(r'^(\d+): (.*)$', content, re.MULTILINE))
                    if matches:
                        first = int(matches[0].group(1))
                        last = int(matches[-1].group(1))
                        views.append({
                            'step': step_idx,
                            'first': first,
                            'last': last,
                            'lines': {int(m.group(1)): m.group(2) for m in matches}
                        })
                        print(f"Step {step_idx}: lines {first} to {last}")
        except Exception as e:
            pass

# Now reconstruct the file from the views
reconstructed = {}
# Sort views by step index, later steps overwrite earlier steps
views.sort(key=lambda x: x['step'])
for v in views:
    for line_num, line_content in v['lines'].items():
        reconstructed[line_num] = line_content

if reconstructed:
    max_line = max(reconstructed.keys())
    print(f"Reconstructed {len(reconstructed)} lines, max line number: {max_line}")
    # Write to a draft file
    with open('/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_reconstructed.js', 'w', encoding='utf-8') as f:
        for i in range(1, max_line + 1):
            f.write(reconstructed.get(i, '') + '\n')
    print("Saved to scratch/AIAssistant_reconstructed.js")
else:
    print("No views found.")

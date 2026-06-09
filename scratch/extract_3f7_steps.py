import json
import re

# Extract the specific view_file outputs from 3f7f8c89 at steps 333, 335, 337
# These cover lines 1-800, 801-1547, 1601-1799

log_path = "/Users/zinwaishine/.gemini/antigravity-ide/brain/3f7f8c89-83ca-47fe-a8dd-090c6265f047/.system_generated/logs/transcript.jsonl"

target_steps = {333, 335, 337}
views = {}

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get('step_index')
            if step_idx not in target_steps:
                continue
            content = data.get('content', '') or ''
            if 'AIAssistant.js' not in content:
                continue
            matches = list(re.finditer(r'^(\d+): (.*)$', content, re.MULTILINE))
            if matches:
                first = int(matches[0].group(1))
                last = int(matches[-1].group(1))
                line_dict = {int(m.group(1)): m.group(2) for m in matches}
                views[step_idx] = {
                    'first': first,
                    'last': last,
                    'lines': line_dict
                }
                print(f"Step {step_idx}: lines {first}-{last} ({len(matches)} lines)")
        except Exception as e:
            print(f"Error: {e}")

# Reconstruct
reconstructed = {}
for step in sorted(views.keys()):
    for line_num, line_content in views[step]['lines'].items():
        reconstructed[line_num] = line_content

if reconstructed:
    max_line = max(reconstructed.keys())
    print(f"\nReconstructed {len(reconstructed)} lines, max line: {max_line}")
    missing = [i for i in range(1, max_line + 1) if i not in reconstructed]
    print(f"Missing lines: {len(missing)}")
    if missing:
        print(f"Missing line numbers: {missing[:30]}")
    
    with open('/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_3f7_steps.js', 'w', encoding='utf-8') as f:
        for i in range(1, max_line + 1):
            f.write(reconstructed.get(i, '') + '\n')
    print("Saved to scratch/AIAssistant_3f7_steps.js")

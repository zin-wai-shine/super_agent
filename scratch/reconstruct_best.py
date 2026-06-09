import json
import re

# Scan ALL available logs for best reconstruction
logs = [
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/3f7f8c89-83ca-47fe-a8dd-090c6265f047/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/da3b78d2-f3d2-4284-b513-8c110485f3c0/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/90cdb5c2-ad46-467c-9147-8b779849b224/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/ad79d185-c5bd-451d-bd6d-9d99413c94c8/.system_generated/logs/transcript.jsonl",
]

all_views = []

for log_path in logs:
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                content = data.get('content', '') or ''
                step_idx = data.get('step_index')
                if 'AIAssistant.js' not in content:
                    continue
                matches = list(re.finditer(r'^(\d+): (.*)$', content, re.MULTILINE))
                if len(matches) < 5:
                    continue
                nums = [int(m.group(1)) for m in matches]
                all_views.append((step_idx, min(nums), max(nums), {int(m.group(1)): m.group(2) for m in matches}))
            except:
                pass

# Sort by step to apply in order
all_views.sort(key=lambda x: x[0])

reconstructed = {}
for step_idx, first, last, lines in all_views:
    for line_num, line_content in lines.items():
        reconstructed[line_num] = line_content

max_line = max(reconstructed.keys())
missing = [i for i in range(1, max_line + 1) if i not in reconstructed]
print(f"Reconstructed {len(reconstructed)} / {max_line} lines")
print(f"Missing: {len(missing)}")
# Group missing
groups = []
if missing:
    start = prev = missing[0]
    for m in missing[1:]:
        if m != prev + 1:
            groups.append((start, prev))
            start = m
        prev = m
    groups.append((start, prev))
    print(f"Missing groups: {groups}")

# Write reconstructed
with open('/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_best.js', 'w', encoding='utf-8') as f:
    for i in range(1, max_line + 1):
        f.write(reconstructed.get(i, '') + '\n')
print("Saved to scratch/AIAssistant_best.js")

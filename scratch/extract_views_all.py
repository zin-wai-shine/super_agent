import json
import os
import re

logs = [
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/4ea5d3cd-d466-4104-964e-954f42aa11c8/.system_generated/logs/transcript.jsonl", "4ea5d3cd"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/b8ec3f0f-d587-459e-a736-81a5ec6a1981/.system_generated/logs/transcript.jsonl", "b8ec3f0f"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/b02ddcc4-314c-4738-9902-d1dc1d651608/.system_generated/logs/transcript.jsonl", "b02ddcc4"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/eb2474ec-92ca-4ba1-b76e-6e787bde84dc/.system_generated/logs/transcript.jsonl", "eb2474ec"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/181f1c0a-5f7c-4846-ae3c-15f3c52a624b/.system_generated/logs/transcript.jsonl", "181f1c0a"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/3f7f8c89-83ca-47fe-a8dd-090c6265f047/.system_generated/logs/transcript.jsonl", "3f7f8c89"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/90cdb5c2-ad46-467c-9147-8b779849b224/.system_generated/logs/transcript.jsonl", "90cdb5c2"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/ad79d185-c5bd-451d-bd6d-9d99413c94c8/.system_generated/logs/transcript.jsonl", "ad79d185"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/da3b78d2-f3d2-4284-b513-8c110485f3c0/.system_generated/logs/transcript.jsonl", "da3b78d2"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/a5b7b8b8-c6d6-4dd3-9abf-4df7f737df05/.system_generated/logs/transcript.jsonl", "a5b7b8b8")
]

reconstructed = {}

for log_path, log_name in logs:
    if not os.path.exists(log_path):
        print(f"Log path {log_path} does not exist.")
        continue
    
    # Read and parse
    step_views = []
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                step_idx = data.get('step_index')
                content = data.get('content', '') or ''
                if 'AIAssistant.js' in content and ('Showing lines' in content or 'Total Lines:' in content):
                    matches = list(re.finditer(r'^(\d+): (.*)$', content, re.MULTILINE))
                    if matches:
                        first = int(matches[0].group(1))
                        last = int(matches[-1].group(1))
                        step_views.append({
                            'step': step_idx,
                            'first': first,
                            'last': last,
                            'lines': {int(m.group(1)): m.group(2) for m in matches}
                        })
            except Exception as e:
                pass
    
    # Sort views in this log by step index
    step_views.sort(key=lambda x: x['step'])
    for v in step_views:
        print(f"Log {log_name} Step {v['step']}: lines {v['first']}-{v['last']}")
        for line_num, line_content in v['lines'].items():
            reconstructed[line_num] = line_content

if reconstructed:
    max_line = max(reconstructed.keys())
    print(f"\nReconstructed {len(reconstructed)} lines out of max line number {max_line}")
    missing = [i for i in range(1, max_line + 1) if i not in reconstructed]
    print(f"Missing lines count: {len(missing)}")
    if missing:
        print(f"First 20 missing lines: {missing[:20]}")
    
    with open('/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_reconstructed_all.js', 'w', encoding='utf-8') as f:
        for i in range(1, max_line + 1):
            f.write(reconstructed.get(i, '') + '\n')
    print("Saved to scratch/AIAssistant_reconstructed_all.js")
else:
    print("No lines reconstructed.")

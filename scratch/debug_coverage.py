import json
import re

log_path = "/Users/zinwaishine/.gemini/antigravity-ide/brain/3f7f8c89-83ca-47fe-a8dd-090c6265f047/.system_generated/logs/transcript.jsonl"

# The issue is the content is truncated in transcript - let's look at all views near that step index
# to get more coverage.

# Strategy: collect ALL view file outputs from the transcript and reconstruct best coverage

reconstructed = {}
all_views = []

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
        except Exception as e:
            pass

# Sort by step index (to apply later edits last)
all_views.sort(key=lambda x: x[0])

# Apply all views in order
for step_idx, first, last, lines in all_views:
    for line_num, line_content in lines.items():
        reconstructed[line_num] = line_content

if reconstructed:
    max_line = max(reconstructed.keys())
    missing = [i for i in range(1, max_line + 1) if i not in reconstructed]
    print(f"Total lines reconstructed: {len(reconstructed)}, max line: {max_line}")
    print(f"Missing: {len(missing)} lines")
    if missing[:50]:
        # Group consecutive missing lines
        groups = []
        start = missing[0]
        prev = missing[0]
        for m in missing[1:]:
            if m != prev + 1:
                groups.append((start, prev))
                start = m
            prev = m
        groups.append((start, prev))
        print(f"Missing line groups (first 20): {groups[:20]}")

import json
import os
import re

logs = [
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/4ea5d3cd-d466-4104-964e-954f42aa11c8/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/b8ec3f0f-d587-459e-a736-81a5ec6a1981/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/b02ddcc4-314c-4738-9902-d1dc1d651608/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/eb2474ec-92ca-4ba1-b76e-6e787bde84dc/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/181f1c0a-5f7c-4846-ae3c-15f3c52a624b/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/3f7f8c89-83ca-47fe-a8dd-090c6265f047/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/90cdb5c2-ad46-467c-9147-8b779849b224/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/ad79d185-c5bd-451d-bd6d-9d99413c94c8/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/da3b78d2-f3d2-4284-b513-8c110485f3c0/.system_generated/logs/transcript.jsonl",
    "/Users/zinwaishine/.gemini/antigravity-ide/brain/a5b7b8b8-c6d6-4dd3-9abf-4df7f737df05/.system_generated/logs/transcript.jsonl"
]

# We will collect all views that are verified to be outputs of view_file
# and associate them with a timestamp/step index so we can resolve conflicts.
views = []

for log_path in logs:
    if not os.path.exists(log_path):
        continue
    
    log_name = os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(log_path))))
    
    # We will read steps
    steps = []
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                steps.append(json.loads(line))
            except:
                pass
                
    # Now trace: find a step with a view_file call for AIAssistant.js, and look at the response (usually the next step or two)
    for i, step in enumerate(steps):
        tool_calls = step.get('tool_calls', []) or []
        called = False
        for tc in tool_calls:
            if tc.get('name') == 'view_file':
                args = tc.get('args', {})
                # args can be a string or a dict
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except:
                        pass
                path = args.get('AbsolutePath', '')
                if 'AIAssistant.js' in path:
                    called = True
                    break
        
        if called:
            # Look at subsequent steps for the tool output of view_file
            # The tool output will contain the file contents
            for j in range(i + 1, min(i + 4, len(steps))):
                next_step = steps[j]
                content = next_step.get('content', '') or ''
                if not content:
                    continue
                # A valid view_file output contains "File Path: " or "Showing lines" or matching pattern
                if 'File Path: ' in content or 'Showing lines ' in content:
                    matches = list(re.finditer(r'^(\d+): (.*)$', content, re.MULTILINE))
                    if matches:
                        first = int(matches[0].group(1))
                        last = int(matches[-1].group(1))
                        views.append({
                            'log': log_name,
                            'step': step.get('step_index', 0),
                            'created_at': step.get('created_at', ''),
                            'first': first,
                            'last': last,
                            'lines': {int(m.group(1)): m.group(2) for m in matches}
                        })
                        print(f"Verified view from {log_name} Step {step.get('step_index')}: lines {first}-{last}")
                        break

# Sort views by created_at or log/step sequence to get the most recent version of each line
# For our reconstruction, we'll sort such that later views overwrite earlier ones.
# We will parse ISO timestamps. If created_at is empty, use 0.
def get_time(v):
    return v['created_at'] or ''

views.sort(key=get_time)

reconstructed = {}
for v in views:
    # Print the source of each overwrite if it's interesting
    for line_num, line_content in v['lines'].items():
        reconstructed[line_num] = line_content

if reconstructed:
    max_line = max(reconstructed.keys())
    print(f"\nReconstructed {len(reconstructed)} lines out of max {max_line}")
    missing = [i for i in range(1, max_line + 1) if i not in reconstructed]
    print(f"Missing lines count: {len(missing)}")
    if missing:
        print(f"First 50 missing lines: {missing[:50]}")
    
    with open('/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_only_views.js', 'w', encoding='utf-8') as f:
        for i in range(1, max_line + 1):
            f.write(reconstructed.get(i, '') + '\n')
    print("Saved to scratch/AIAssistant_only_views.js")
else:
    print("No lines reconstructed.")

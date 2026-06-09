import json
import re

log_path = "/Users/zinwaishine/.gemini/antigravity-ide/brain/3f7f8c89-83ca-47fe-a8dd-090c6265f047/.system_generated/logs/transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get('step_index')
            if step_idx != 333:
                continue
            content = data.get('content', '') or ''
            # Count numbered lines vs empty lines
            matches = list(re.finditer(r'^(\d+): (.*)$', content, re.MULTILINE))
            all_lines = content.split('\n')
            print(f"Step 333 content length: {len(content)}")
            print(f"Total \n-split lines: {len(all_lines)}")
            print(f"Numbered lines: {len(matches)}")
            if matches:
                first_num = int(matches[0].group(1))
                last_num = int(matches[-1].group(1))
                print(f"Line numbers: {first_num} to {last_num}")
            # Let's see the raw content around lines 40-70
            for m in matches:
                if int(m.group(1)) in range(40, 75):
                    print(f"  LINE {m.group(1)}: {repr(m.group(2))}")
        except Exception as e:
            print(f"Error: {e}")

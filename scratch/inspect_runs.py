import json

log_path = "/Users/zinwaishine/.gemini/antigravity-ide/brain/da3b78d2-f3d2-4284-b513-8c110485f3c0/.system_generated/logs/transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get('step_index')
            tool_calls = data.get('tool_calls') or []
            for tc in tool_calls:
                if tc.get('name') == 'run_command':
                    cmd = tc.get('args', {}).get('CommandLine', '')
                    print(f"Step {step_idx}: Run {cmd}")
        except Exception as e:
            pass

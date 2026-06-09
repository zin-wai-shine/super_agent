import json
import os

logs = [
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/da3b78d2-f3d2-4284-b513-8c110485f3c0/.system_generated/logs/transcript.jsonl", "da3b78d2"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/ad79d185-c5bd-451d-bd6d-9d99413c94c8/.system_generated/logs/transcript.jsonl", "ad79d185"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/90cdb5c2-ad46-467c-9147-8b779849b224/.system_generated/logs/transcript.jsonl", "90cdb5c2"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/3f7f8c89-83ca-47fe-a8dd-090c6265f047/.system_generated/logs/transcript.jsonl", "3f7f8c89"),
    ("/Users/zinwaishine/.gemini/antigravity-ide/brain/181f1c0a-5f7c-4846-ae3c-15f3c52a624b/.system_generated/logs/transcript.jsonl", "181f1c0a")
]

for log_path, log_name in logs:
    if not os.path.exists(log_path):
        print(f"Log path {log_path} does not exist.")
        continue
    print(f"\n=================== {log_name} ===================")
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                step_idx = data.get('step_index')
                tool_calls = data.get('tool_calls') or []
                for tc in tool_calls:
                    tc_name = tc.get('name')
                    args = tc.get('args') or {}
                    target = args.get('TargetFile') or args.get('Target') or ""
                    target = target.strip('"')
                    if 'AIAssistant.js' in target:
                        code = args.get('CodeContent') or args.get('ReplacementContent') or ""
                        print(f"Step {step_idx}: {tc_name} on {target}, code len: {len(code)}")
                        if tc_name == 'write_to_file' and len(code) > 10000:
                            out_fn = f"/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_{log_name}_step{step_idx}.js"
                            with open(out_fn, 'w', encoding='utf-8') as out_f:
                                out_f.write(code)
                            print(f"  SAVED full write to {out_fn}")
            except Exception as e:
                pass

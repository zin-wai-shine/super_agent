import json
import os

log_path = "/Users/zinwaishine/.gemini/antigravity-ide/brain/da3b78d2-f3d2-4284-b513-8c110485f3c0/.system_generated/logs/transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get('step_index')
            tool_calls = data.get('tool_calls') or []
            for tc in tool_calls:
                args = tc.get('args') or {}
                target = args.get('TargetFile') or args.get('Target') or ""
                target = target.strip('"')
                if 'rebuild_assistant.py' in target or 'restore_complete.py' in target or 'fix_assistant_complete.py' in target:
                    code = args.get('CodeContent') or ""
                    print(f"\n=== Step {step_idx}: {tc.get('name')} on {target} (len: {len(code)}) ===")
                    # Save to scratch folder
                    out_fn = f"/Users/zinwaishine/Desktop/super_real_estate/scratch/{os.path.basename(target)}"
                    with open(out_fn, 'w', encoding='utf-8') as out_f:
                        out_f.write(code)
                    print(f"Saved to {out_fn}")
        except Exception as e:
            pass

import json
import os
import glob

brain_dir = "/Users/zinwaishine/.gemini/antigravity-ide/brain"
logs = glob.glob(os.path.join(brain_dir, "*", ".system_generated", "logs", "transcript.jsonl"))

print(f"Found {len(logs)} transcript files.")

for log_path in logs:
    log_name = os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(log_path))))
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
                        if tc_name == 'write_to_file' and len(code) > 10000:
                            print(f"Found in {log_name} step {step_idx}: {tc_name}, code len: {len(code)}")
                            out_fn = f"/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_{log_name}_step{step_idx}.js"
                            with open(out_fn, 'w', encoding='utf-8') as out_f:
                                out_f.write(code)
                            print(f"  SAVED full write to {out_fn}")
            except Exception as e:
                pass

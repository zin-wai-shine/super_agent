import json

log_path = "/Users/zinwaishine/.gemini/antigravity-ide/brain/da3b78d2-f3d2-4284-b513-8c110485f3c0/.system_generated/logs/transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get('step_index')
            if step_idx in (1196, 1197, 1195, 1194, 1193, 1192, 1191):
                print(f"Step {step_idx}: type={data.get('type')}")
                tool_calls = data.get('tool_calls') or []
                for tc in tool_calls:
                    print(f"  Tool: {tc.get('name')}")
                    args = tc.get('args') or {}
                    if 'CodeContent' in args:
                        print(f"    CodeContent length: {len(args['CodeContent'])}")
                        # Print if it contains python script
                        if 'rebuild_assistant' in str(args.get('TargetFile')):
                            print("=== rebuild_assistant.py script content ===")
                            print(args['CodeContent'])
        except Exception as e:
            pass

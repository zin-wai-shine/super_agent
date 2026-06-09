import json

log_path = "/Users/zinwaishine/.gemini/antigravity-ide/brain/da3b78d2-f3d2-4284-b513-8c110485f3c0/.system_generated/logs/transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 895:
                tc = data.get('tool_calls')[0]
                args = tc.get('args') or {}
                print("Keys in args:", list(args.keys()))
                chunks = args.get('ReplacementChunks')
                print("Chunks type:", type(chunks))
                if isinstance(chunks, str):
                    # Maybe it is a JSON string?
                    chunks = json.loads(chunks)
                    print("Parsed chunks count:", len(chunks))
                if chunks:
                    for i in range(min(5, len(chunks))):
                        c = chunks[i]
                        print(f"Chunk {i}: lines {c.get('StartLine')}-{c.get('EndLine')}")
                        print(f"  Target: {repr(c.get('TargetContent'))}")
                        print(f"  Replacement: {repr(c.get('ReplacementContent'))}")
        except Exception as e:
            print("Error:", e)

with open('/Users/zinwaishine/Desktop/super_real_estate/frontend/src/components/AIAssistant/AIAssistant.js', 'r') as f:
    lines = f.readlines()

non_empty = []
for i, line in enumerate(lines):
    if line.strip():
        non_empty.append((i + 1, line))

print(f"Total non-empty lines: {len(non_empty)}")
print("First 30 non-empty lines:")
for num, line in non_empty[:30]:
    print(f"{num}: {repr(line)}")

print("\nLast 30 non-empty lines:")
for num, line in non_empty[-30:]:
    print(f"{num}: {repr(line)}")

with open('/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_best.js', 'r') as f:
    lines = f.readlines()

# Print around line 75
print("=== Lines 65-90 ===")
for i in range(64, min(90, len(lines))):
    print(f"{i+1}: {repr(lines[i])}")

# Also check around 570-578
print("\n=== Lines 565-585 ===")
for i in range(564, min(585, len(lines))):
    print(f"{i+1}: {repr(lines[i])}")

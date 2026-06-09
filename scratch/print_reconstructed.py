with open('/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_reconstructed_all.js', 'r') as f:
    lines = f.readlines()

print("Lines 1420 to 1510:")
for i in range(1419, min(1510, len(lines))):
    print(f"{i+1}: {repr(lines[i])}")

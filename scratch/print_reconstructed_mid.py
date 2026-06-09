with open('/Users/zinwaishine/Desktop/super_real_estate/scratch/AIAssistant_reconstructed_all.js', 'r') as f:
    lines = f.readlines()

print("Reconstructed file lines 40 to 120:")
for i in range(39, min(120, len(lines))):
    print(f"{i+1}: {repr(lines[i])}")

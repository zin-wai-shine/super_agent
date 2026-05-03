import sys

def find_mismatch(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
    
    total_open = 0
    total_close = 0
    
    for i, line in enumerate(lines):
        o = line.count('(')
        c = line.count(')')
        total_open += o
        total_close += c
        if o != c:
            print(f"Line {i+1}: Open {o}, Close {c} | Diff {o-c} | Total Diff {total_open - total_close}")

if __name__ == "__main__":
    find_mismatch(sys.argv[1])

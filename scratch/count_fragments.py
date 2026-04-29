import re
import sys

def parse_fragments(filepath, start_line, end_line):
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    text = "".join(lines[start_line-1:end_line])
    
    # Remove JSX comments
    text = re.sub(r'\{/\*.*?\*/\}', '', text, flags=re.DOTALL)
    
    # Count opening tags: <>
    open_frags = len(re.findall(r'<>', text))
    
    # Count closing tags: </>
    close_frags = len(re.findall(r'</>', text))
    
    print(f"Open: {open_frags}")
    print(f"Close: {close_frags}")
    print(f"Balance: {open_frags - close_frags}")

if __name__ == "__main__":
    parse_fragments(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))

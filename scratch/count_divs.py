import re
import sys

def parse_divs(filepath, start_line, end_line):
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    text = "".join(lines[start_line-1:end_line])
    
    # Remove JSX comments
    text = re.sub(r'\{/\*.*?\*/\}', '', text, flags=re.DOTALL)
    
    # Count opening tags: <div ...> (excluding <div ... />)
    open_divs = len(re.findall(r'<div[^>]*?(?<!/)>', text))
    
    # Count self-closing tags: <div ... />
    self_closing_divs = len(re.findall(r'<div[^>]*?/>', text))
    
    # Count closing tags: </div>
    close_divs = len(re.findall(r'</div\s*>', text))
    
    print(f"Open: {open_divs}")
    print(f"Close: {close_divs}")
    print(f"Self-closing: {self_closing_divs}")
    print(f"Balance: {open_divs - close_divs}")

if __name__ == "__main__":
    parse_divs(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))

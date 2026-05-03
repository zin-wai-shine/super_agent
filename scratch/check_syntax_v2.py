import re
import sys

def check_syntax(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Simple state machine to ignore strings and comments
    stack = []
    i = 0
    line_num = 1
    char_pos = 0
    
    while i < len(content):
        char = content[i]
        
        if char == '\n':
            line_num += 1
            char_pos = 0
            i += 1
            continue
        
        char_pos += 1
        
        # Skip strings
        if char in ["'", '"', '`']:
            quote = char
            i += 1
            while i < len(content) and (content[i] != quote or (content[i-1] == '\\' and content[i-2] != '\\')):
                if content[i] == '\n':
                    line_num += 1
                    char_pos = 0
                else:
                    char_pos += 1
                i += 1
            i += 1
            continue
            
        # Skip line comments
        if char == '/' and i + 1 < len(content) and content[i+1] == '/':
            while i < len(content) and content[i] != '\n':
                i += 1
            continue
            
        # Skip block comments
        if char == '/' and i + 1 < len(content) and content[i+1] == '*':
            i += 2
            while i + 1 < len(content) and not (content[i] == '*' and content[i+1] == '/'):
                if content[i] == '\n':
                    line_num += 1
                    char_pos = 0
                else:
                    char_pos += 1
                i += 1
            i += 2
            continue
            
        # Track braces, parens, brackets
        if char == '{': stack.append(('{', line_num, char_pos))
        elif char == '(': stack.append(('(', line_num, char_pos))
        elif char == '[': stack.append(('[', line_num, char_pos))
        elif char == '}':
            if not stack:
                print(f"Extra '}}' at line {line_num}, pos {char_pos}")
                return
            last, l, p = stack.pop()
            if last != '{':
                print(f"Mismatched '}}' at line {line_num}, pos {char_pos}. Opened with '{last}' at line {l}, pos {p}")
                return
        elif char == ')':
            if not stack:
                print(f"Extra ')' at line {line_num}, pos {char_pos}")
                return
            last, l, p = stack.pop()
            if last != '(':
                print(f"Mismatched ')' at line {line_num}, pos {char_pos}. Opened with '{last}' at line {l}, pos {p}")
                return
        elif char == ']':
            if not stack:
                print(f"Extra ']' at line {line_num}, pos {char_pos}")
                return
            last, l, p = stack.pop()
            if last != '[':
                print(f"Mismatched ']' at line {line_num}, pos {char_pos}. Opened with '{last}' at line {l}, pos {p}")
                return
        
        i += 1

    if stack:
        print(f"Unclosed tokens: {len(stack)}")
        for op, l, p in stack:
            print(f"Unclosed '{op}' at line {l}, pos {p}")
    else:
        print("All tokens balanced!")

if __name__ == "__main__":
    check_syntax(sys.argv[1])

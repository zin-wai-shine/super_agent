import sys

def check_braces(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    stack = []
    line_num = 1
    char_pos = 0
    
    for i, char in enumerate(content):
        if char == '\n':
            line_num += 1
            char_pos = 0
        else:
            char_pos += 1
            
        if char == '{':
            stack.append(('{', line_num, char_pos))
        elif char == '}':
            if not stack:
                print(f"Extra '}}' at line {line_num}, pos {char_pos}")
                return
            last_op, l, p = stack.pop()
            if last_op != '{':
                print(f"Mismatched '}}' at line {line_num}, pos {char_pos}. Opened with '{last_op}' at line {l}, pos {p}")
                return
        elif char == '(':
            stack.append(('(', line_num, char_pos))
        elif char == ')':
            if not stack:
                print(f"Extra ')' at line {line_num}, pos {char_pos}")
                return
            last_op, l, p = stack.pop()
            if last_op != '(':
                print(f"Mismatched ')' at line {line_num}, pos {char_pos}. Opened with '{last_op}' at line {l}, pos {p}")
                return
        elif char == '[':
            stack.append(('[', line_num, char_pos))
        elif char == ']':
            if not stack:
                print(f"Extra ']' at line {line_num}, pos {char_pos}")
                return
            last_op, l, p = stack.pop()
            if last_op != '[':
                print(f"Mismatched ']' at line {line_num}, pos {char_pos}. Opened with '{last_op}' at line {l}, pos {p}")
                return

    if stack:
        print(f"Total unclosed tokens: {len(stack)}")
        for op, l, p in stack:
            print(f"Unclosed '{op}' at line {l}, pos {p}")
    else:
        print("All tokens are balanced!")

if __name__ == "__main__":
    check_braces(sys.argv[1])

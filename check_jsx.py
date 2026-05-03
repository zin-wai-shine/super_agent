import re
import sys

def check_jsx_balance(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    stack = []
    i = 0
    while i < len(content):
        if content[i:i+2] == '</':
            # Closing tag
            end = content.find('>', i)
            tag_content = content[i+2:end].strip()
            tag_name = tag_content.split()[0] if tag_content else 'Fragment'
            
            if not stack:
                line = content.count('\n', 0, i) + 1
                print(f"Error: Unexpected closing tag </{tag_name}> at line {line}")
                return False
            last_tag, last_line = stack.pop()
            if last_tag != tag_name:
                line = content.count('\n', 0, i) + 1
                print(f"Error: Mismatched tag. Found </{tag_name}> at line {line}, but expected </{last_tag}> from line {last_line}")
                return False
            i = end + 1
        elif content[i] == '<' and not content[i+1].isspace() and content[i+1] not in ['=', '<', '!']:
            # Opening tag
            end = content.find('>', i)
            # Handle cases where > might be inside a string or curly brace (very basic)
            # For now, assume > is the end of the tag
            
            # Check if it's self-closing
            is_self_closing = content[end-1] == '/'
            
            tag_content = content[i+1:end].strip()
            if not tag_content:
                tag_name = 'Fragment'
            else:
                tag_name = tag_content.split()[0].replace('/', '')
            
            if not is_self_closing and tag_name not in ['img', 'br', 'hr', 'input']:
                line = content.count('\n', 0, i) + 1
                stack.append((tag_name, line))
            i = end + 1
        else:
            i += 1
            
    if stack:
        for tag_name, line_num in stack:
            print(f"Error: Unclosed tag <{tag_name}> from line {line_num}")
        return False
        
    print("No obvious tag mismatches found.")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_jsx_balance(sys.argv[1])
    else:
        print("Usage: python3 check_jsx.py <filepath>")

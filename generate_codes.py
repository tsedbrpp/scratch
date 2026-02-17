import sys

# Alphanumeric Luhn Algorithm (Mod 36)
# Character Set: 0-9, A-Z (Case insensitive)
CODE_POINTS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

def get_code_point(char):
    try:
        return CODE_POINTS.index(char.upper())
    except ValueError:
        raise ValueError(f"Invalid character: {char}")

def generate_check_character(input_str):
    factor = 2
    sum_val = 0
    n = len(CODE_POINTS)

    # Process from right to left
    for char in reversed(input_str):
        code_point = get_code_point(char)
        addend = code_point * factor

        # Add digits in base 36
        addend = (addend // n) + (addend % n)

        sum_val += addend
        factor = 1 if factor == 2 else 2

    remainder = sum_val % n
    check_code_point = (n - remainder) % n
    return CODE_POINTS[check_code_point]

def validate_code(code):
    try:
        clean_code = ''.join(c.upper() for c in code if c.isalnum())
        if len(clean_code) < 2:
            return False

        factor = 1
        sum_val = 0
        n = len(CODE_POINTS)

        for char in reversed(clean_code):
            code_point = get_code_point(char)
            addend = code_point * factor

            addend = (addend // n) + (addend % n)

            sum_val += addend
            factor = 1 if factor == 2 else 2

        return sum_val % n == 0
    except ValueError:
        return False

def generate_full_code(prefix):
    clean_prefix = ''.join(c.upper() for c in prefix if c.isalnum())
    check_char = generate_check_character(clean_prefix)
    return f"{prefix}{check_char}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        prefixes = sys.argv[1:]
    else:
        # Default test cases if no arguments provided
        prefixes = ["PYTHON01", "TESTCODE"]
    
    print("Generated Codes:")
    for p in prefixes:
        full_code = generate_full_code(p)
        is_valid = validate_code(full_code)
        print(f"{p} -> {full_code} (Valid: {is_valid})")

import json

# Replace this with the filename of your NEW, generated key
filename = "krytpbytes-firebase-adminsdk-fbsvc-4b59bc592f.json"

try:
    with open(filename, 'r') as f:
        data = json.load(f)
        # This converts the dict to a single-line string
        minified_json = json.dumps(data) 
        print("\n=== COPY THE LINE BELOW FOR RENDER ===\n")
        print(minified_json)
        print("\n======================================\n")
except FileNotFoundError:
    print(f"Could not find file: {filename}")

    
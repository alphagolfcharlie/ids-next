from CsvToJson import csv_to_json

# Input and output file names
input_csv = "ids.fixes.csv"
output_json = "ids.fixes.json"

# Fields to include in the JSON
fields_to_keep = [
    "FIX_ID",
    "LAT_DECIMAL",
    "LONG_DECIMAL",
]

csv_to_json(input_csv, output_json, fields_to_keep)
from CsvToJson import csv_to_json

# Input and output file names
input_csv = "csv/ids.apt.csv"
output_json = "jsons/ids.apt.json"

# Fields to include in the JSON
fields_to_keep = [
    "ARPT_ID",
    "LAT_DECIMAL",
    "LONG_DECIMAL",
]

csv_to_json(input_csv, output_json, fields_to_keep)
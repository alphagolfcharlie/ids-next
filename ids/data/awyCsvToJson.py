from CsvToJson import csv_to_json

# Input and output file names
input_csv = "csv/ids.awy.csv"
output_json = "jsons/ids.awy.json"

# Fields to include in the JSON
fields_to_keep = [
    "AWY_ID",
    "AIRWAY_STRING",
]

csv_to_json(input_csv, output_json, fields_to_keep)
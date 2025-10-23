from CsvToJson import csv_to_json

# Input and output file names
sids_csv = "csv/ids.sids.csv"
sids_json = "jsons/ids.sids.json"

stars_csv = "csv/ids.stars.csv"
stars_json = "jsons/ids.stars.json"

# Fields to include in the JSON
sid_fields_to_keep = [
    "sid_name",
    "served_arpt",
    "fixes",
]

star_fields_to_keep = [
    "star_name",
    "served_arpt",
    "fixes",
]

#csv_to_json(sids_csv, sids_json, sid_fields_to_keep)
csv_to_json(stars_csv, stars_json, star_fields_to_keep)
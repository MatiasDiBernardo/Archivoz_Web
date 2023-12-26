import json
import os
from text_data_segmentation import text_segmentation

filename_txt = "texto_prueba_archivoz.txt"
filename_json = "texto_prueba_archivoz.json"

path_input = os.path.join("text", "raw_data", filename_txt)
path_output = os.path.join("text", "process_data", filename_json)

norm_sentence, _ = text_segmentation(path_input)

with open(path_output, 'w', encoding='utf-8') as json_file:
    json.dump(norm_sentence, json_file, ensure_ascii=False)
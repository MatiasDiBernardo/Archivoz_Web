import json
import os
from text_data_segmentation import text_segmentation

# Campos a completar
author = "Julio Cortázar"
book = "Octaedro"
story_or_chapter = "Liliana LLorando"

# Create folder if necesary
author_folder = os.path.join("text", "process_data", author)
if not os.path.exists(author_folder):
    os.makedirs(author_folder)

# Create the file
name_text = f"{author}_{book}_{story_or_chapter}"
filename_txt = f"{name_text}.txt"
path_input = os.path.join("text", "raw_data", filename_txt)

norm_sentence, _ = text_segmentation(path_input)

filename_json = f"{name_text}_{str(len(norm_sentence))}.json"
path_output = os.path.join("text", "process_data", author, filename_json)

with open(path_output, 'w', encoding='utf-8') as json_file:
    json.dump(norm_sentence, json_file, ensure_ascii=False)
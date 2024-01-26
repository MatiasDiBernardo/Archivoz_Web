import json
import os

def pathToTranscript(path):
    split_path = path.split("_")

    if split_path[1] == "Archivoz":
        name_file = "_".join([split_path[1], split_path[2]]) + ".json"
    else:
        name_file = "_".join([split_path[1], split_path[2], split_path[3], split_path[4]]) + ".json"
    
    path_transcript = os.path.join("text", "process_data", split_path[1], name_file) 

    with open(path_transcript, 'r', encoding="utf-8") as file:
        data = json.load(file)
    
    indice = split_path[-1][:-4]
    
    return data[int(indice)]

ID_target = "6AD0C6"

#audios_path = os.listdir(os.path.join("uploads", ID_target))
audios_path = os.listdir("uploads")
data = []
for path in audios_path:
    audio = "audios/" + path
    transcript = pathToTranscript(path)
    text = audio + "|" + transcript
    data.append(text)

audios_transcript_file="\n".join(data)

with open(f"transcript_{ID_target}.csv", 'w', encoding="utf-8") as file:
     file.write(audios_transcript_file)

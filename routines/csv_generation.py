import json
import os

def pathToTranscript(path):
    """Maps the audio to the transcript. Reads the
    json file with the information and return it as
    string.

    Args:
        path (str): Path to traget audio.

    Returns:
        str: Transcription of the audio.
    """
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

def removeUnknowChar(frase):
    """The IA model has characters that are not recognized. To avoid
    error we change the unknown characters.

    Args:
        frase (str): Frase with potential unknown chars.

    Returns:
        str: Frase without unknown chars.
    """
    
    if "”" in frase:
        frase = frase.replace("”", "")

    if "“" in frase:
        frase = frase.replace("“", "")

    if "—" in frase:
        frase = frase.replace("—", "")
    
    return frase

def main(id_target):
    """Converts the data from the user into the csv format
    expected to train  model.

    Args:
        id_target (int): ID associate with the user.
    """
    audios_path = os.listdir(os.path.join("uploads", id_target))
    data = []
    for path in audios_path:
        audio = "audios/" + path
        transcript = pathToTranscript(path)
        transcript_clean = removeUnknowChar(transcript)
        text = audio + "|" + transcript_clean
        data.append(text)

    audios_transcript_file="\n".join(data)

    with open(f"transcript_{id_target}.csv", 'w', encoding="utf-8") as file:
        file.write(audios_transcript_file)

if __name__ == "__main__":

    ID_target = "8BB2F5"
    main(ID_target)
    
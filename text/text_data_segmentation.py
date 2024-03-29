import os

# By design lonegest sentece could contain up to (UPPER_WPS + UNDER_WPS) words
UPPER_WPS = 40
UNDER_WPS = 15

def words_per_sentece(s):
    return len(s.split(" "))

# By the nature of this problem seems a good fit for recursion or some sort of
# divide and conquer but I leave the lazy brute force solucion for the moment.

def split_by_dots(sentence):
    """Count the words per sentence and add the dots for
    future reconstruction of the text.

    Args:
        sentence (list): List of splitted text by dots.

    Returns:
        list: Integer list of wps.
        list: Sentences separated by dots.
    """

    words_per_sentence_count = []
    sentence_with_dots = []

    for s in sentence:
        words_per_sentence_count.append(words_per_sentece(s))
        sentence_with_dots.append(s)
        sentence_with_dots.append(".")

    return words_per_sentence_count, sentence_with_dots

def split_by_commas(sentence):
    """If the lenght of the sentence is to long it split it 
    by commas separation. It also add the commas for future 
    reconstruction.

    Args:
        s (list): List of sentences separated by dots.

    Returns:
        list: Integer list of wps.
        list: Sentences separated by commas.
    """
    sentence_with_commas = []
    words_per_sentence_count = []

    for s in sentence:
        if s == ".":
            sentence_with_commas.append(".")
            continue

        wps = words_per_sentece(s)
        if wps <= UPPER_WPS:
            words_per_sentence_count.append(words_per_sentece(s))
            sentence_with_commas.append(s)
            continue

        # Split by comma
        comma_separation = s.split(",")
        for sc in comma_separation:
            words_per_sentence_count.append(words_per_sentece(sc))
            sentence_with_commas.append(sc)
            sentence_with_commas.append(",")
        sentence_with_commas.pop()  #Removes last comma added

    return words_per_sentence_count, sentence_with_commas

def combine_micro_sentences(sentence):
    """
    Combine the comma separation sequence to satisfy the
    minimum criteria.

    Args:
        sentence (list): List of sentence divided by dot and comma.

    Returns:
        list(str): List of sentences.
    """

    final_sentence_list = []
    add_sentence = ""

    for i in range(len(sentence) - 1):
        s = sentence[i]
        # Skip if a punctuation
        if s == "," or s == ".":
            continue 

        s = add_sentence + s
        wps = words_per_sentece(s)

        # If is over the criteria adds the punctuation and appends it
        if wps > UNDER_WPS:
            if sentence[i + 1] != ".":
                final_sentence_list.append(s)
                add_sentence = ""
                continue
            else:
                final_sentence_list.append(s + ".")
                add_sentence = ""
                continue

        # If its under the length criteria save it
        if add_sentence == "":
            if wps <= UNDER_WPS:
                add_sentence += s + sentence[i + 1]
        # Accouns for consecutive under wps
        else:
            if wps <= UNDER_WPS:
                add_sentence = s + sentence[i + 1]

    return final_sentence_list 

def clean_white_space(norm_sentences):
    final_norm_sentences = []
    for s in norm_sentences:
        if s[0] == " ":
            final_norm_sentences.append(s[1:])
        else:
            final_norm_sentences.append(s)

    return final_norm_sentences

def show_results(norm_sentences, wps_original):
    print("Words per sentece before norm")
    print(wps_original)
    print("Average: ", sum(wps_original)/len(wps_original))
    print(" -------------- ")

    print("Words per sentece after norm")
    words_per_sentece_norm = []
    for norm in norm_sentences:
        words_per_sentece_norm.append(words_per_sentece(norm))
    print(words_per_sentece_norm)

    print("Average: ", sum(words_per_sentece_norm)/len(words_per_sentece_norm))

    print(" -------------- ")
    print("Cantidad de oraciones", len(norm_sentences))

def text_segmentation(path):
    """Creates an array of text segments based on the root text
    and the upper and lower words per sentence limit.

    Args:
        path (string): Path to txt file.

    Returns:
        array[string]: Segmented version of root txt file.
    """
    with open(path, encoding="utf8") as f:
        content = f.read() # Read the whole file
        content = content.replace("\n", " ")  # Replace the jumps in line
        sentence = content.split('.') # List of all sentences
        sentence.pop()  # En este caso el último estaba vacio, ver si generaliza o no

        words_per_sentence_count, sentence_with_dots = split_by_dots(sentence)
        words_per_sentence_count2, sentence_with_comma = split_by_commas(sentence_with_dots)
        normalize_sentence = combine_micro_sentences(sentence_with_comma)
        normalize_sentence = clean_white_space(normalize_sentence)

        normalize_sentence = [n.replace("......", "...") for n in normalize_sentence] # By desing if ... appears it changes to ......
    
    return normalize_sentence, words_per_sentence_count

def text_clean(file_path):
    with open(file_path, 'r', encoding="utf8") as file:
        content = file.read()

    modified_content = content.replace('\n', ' ')

    with open(file_path, 'w') as file:
        file.write(modified_content)

# Test: Uncomment and change txt path to see words per sentence distribution

# filename_txt = "Adolfo Bioy Casares_La invención de Morel_Capítulo I.txt"
# path = os.path.join("text", "raw_data", filename_txt)

# norm_sentence, wps_count = text_segmentation(path)
# show_results(norm_sentence, wps_count)

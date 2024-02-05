from .models import Usuario, Texto
# from .tts.inference import infer

import os
import json
import random 
# import scipy

def find_match_on_id(userID):
    """Busca si el ID que el usuario ingreso es válido.

    Args:
        userID (int): ID del usuario.
    """
    val = False
    idVal = Usuario.query.filter_by(user_id=userID).first()
    if idVal is not None:
        val = True

    return val

def validate_user_data(nombre, edad, mail, mail_confirmacion, ID):
    """Verifica si los datos que ingreso el usuario son válidos.
    Si algún dato no es válido devuelve False y un mensaje explicando
    cual es el error al ingresar el dato. Si todos los datos son
    correctos devuelve True y un string vacío.

    Args:
        nombre (string): Nombre del usuario.
        edad (string): Edad del usuario. 
        mail (string): Mail del usuario.
        mail_confimación (string): Nuevo entrada para el mail del usuario.
    Return:
        (boolean): Si los datos son validos o no.
        (string): Mensaje que recibe el usuario si puso algún dato mal.
    """

    #Codigo para verificar si el mail que ingreso el usuario ya esta en la base de datos.
    email_en_uso = False  #Asumir falso por ahora.

    validate = True
    mensaje = ""

    if ID is not None:  #Si paso algo como ID
        if (not find_match_on_id(ID)):
            validate = False
            mensaje = "El ID de usuario ingresado no es válido."
        return validate, mensaje

    email_en_uso = Usuario.query.filter_by(mail=mail).first()
    if (email_en_uso is not None):
        validate = False
        mensaje = "El mail ingresado ya tiene un ID asociado. Por favor, ingrese su ID para retomar su sesión."
        return validate, mensaje
    
    if (mail != mail_confirmacion):
        validate = False
        mensaje = "Los mail tienen que ser iguales."
        return validate, mensaje
    
    if ("@" not in mail):
        validate = False
        mensaje = "Ingrese un mail válido."
        return validate, mensaje
    
    if (len(mail) < 3 or len(mail) > 150):
        validate = False
        mensaje = "Ingrese un mail válido."
        return validate, mensaje
    
    if (len(nombre) < 2 or len(nombre) > 120):
        validate = False
        mensaje = "Ingrese un nombre válido."
        return validate, mensaje

    if "." in edad:
        validate = False
        mensaje = "La edad tiene que ser un número entero."
        return validate, mensaje

    if (int(edad) < 0):
        validate = False 
        mensaje = "Poner edad mayor a 0."
        return validate, mensaje

    if (int(edad) > 200):
        validate = False 
        mensaje = "Poner una edad menor a 200."
        return validate, mensaje

    return validate, mensaje

def change_author_by_selection(target_author, list_texts):
    return choose_random_text_by_autor(target_author, list_texts)

def choose_random_author(list_texts):
    """Chooses a random author and makes sure that the choosen author is not 
    already readed by the user.

    Args:
        list_texts (list): ID list with the text that the usar already read.

    Returns:
        string: Next ID to read.
    """
    # Esta magia me tendría que dejar solo los autores que el user yá leyo.
    already_readed_authors = list(set([a.split("_")[0] for a in list_texts]))
    all_authors_avaliable = os.listdir(os.path.join("text", "process_data"))
    all_authors_avaliable.remove("Archivoz")  # Por si acaso, en teoría se borraría igual con el for

    for author in already_readed_authors:
        if author in all_authors_avaliable:
            all_authors_avaliable.remove(author)
    
    # Falta contemplar caso donde ya leyo todos los autores.
    
    return random.choice(all_authors_avaliable)

def choose_random_text_by_autor(author, list_texts):
    """Choose a random text from an specific author.

    Args:
        author (string): Name of a valid author.
        list_texts (list): ID list with the text that the usar already read.

    Returns:
        string: Next ID to read.
    """
    already_readed = []
    for t in list_texts:
        text_splitted = t.split("_")
        if text_splitted[0] == author:
            new_text = f"{text_splitted[0]}_{text_splitted[1]}_{text_splitted[2]}_{text_splitted[3]}.json"
            already_readed.append(new_text)
    
    already_readed = list(set(already_readed))  #Lista de archivos que ya leyo

    all_text_of_the_author = os.listdir(os.path.join("text", "process_data", author))

    for read in already_readed:
        if read in all_text_of_the_author:
            all_text_of_the_author.remove(read)
        
    select_text = random.choice(all_text_of_the_author)
    new_text = f"{select_text.split('.')[0]}_0"  # Delete .json and add cero index
    
    return new_text 

def update_text_on_screen(current_text, target_author, list_texts):
    """ Update the text ID in base of the user choise.

    Args:
        current_text (string): Text ID of the current text diplayed.
        target_author (string): Name of the author election from the user.
        list_texts (list): ID list with the text that the usar already read.

    Returns:
        string: Next ID to read.
    """
    text_splitted = current_text.split("_")
    current_text_index = text_splitted[-1] 
    max_text_index = str(int(text_splitted[-2]) - 1)  #Accounting for 0 index on list

    # Update the index until the user read all the content 
    if current_text_index != max_text_index:
        if text_splitted[0] == "Archivoz":
            add_index = int(text_splitted[-1]) + 1
            new_text = f"{text_splitted[0]}_{text_splitted[1]}_{str(add_index)}"

        else:
            add_index = int(text_splitted[-1]) + 1
            new_text = f"{text_splitted[0]}_{text_splitted[1]}_{text_splitted[2]}_{text_splitted[3]}_{str(add_index)}"

        return new_text
    
    # Choose randomly other book or author.
    else:
        # If not author selected, choose randomly 
        if target_author is None:
            new_author = choose_random_author(list_texts)
            new_text = choose_random_text_by_autor(new_author, list_texts)

            return new_text
        
        # Pick one text from the choosen author randomly
        else:
            new_text = change_author_by_selection(target_author, list_texts)

            return new_text

def text_ID_to_text(text_id):
    """Change the text ID to raw text to display on the screen.

    Args:
        text_id (string): String ID:

    Returns:
        string: Text associate with the string ID:
    """
    text_splitted = text_id.split("_")
    path_to_json = os.path.join("text", "process_data", text_splitted[0], "_".join(text_splitted[:-1]) + ".json")

    with open(path_to_json, 'r', encoding='utf8') as file:
        data = json.load(file)
    
    return data[int(text_splitted[-1])]

def text_ID_to_name(text_id):
    """Shows only the text information from the text ID.

    Args:
        text_id (string): String ID

    Returns:
        string: Text name from the string ID:
    """
    text_splitted = text_id.split("_")
    text_splitted = text_splitted[:-2]  # Removes ID and ID Max
    return " - ".join(text_splitted)

def check_audio_conditions(audio_path):
    # Para levantar el audio tendría que usar soundfile (esto añade una dependencia)
    # y además tengo que analizar cada audio, lo cual añadiria una latencia innecesaria.
    # Probar en local y en prod, pero este es un punto fuerte para optimizar.
    return True

# def text_to_speech(text, model):
#     """Simula el comportamiento del tts donde se especifíca text y modelo
#     y el algorítmo generaría un archivo de audio.

#     Args:
#         text (string): Audio a procesar
#         model (string): Nombre del modelo

#     Returns:
#         string: Path del audio creado
#     """

#     audio_infer = infer(text, model)
#     dirname = os.path.dirname(__file__)

#     save_path = os.path.join(dirname, "tts", "audios", "audio.wav")

#     scipy.io.wavfile.write(save_path, 44100, audio_infer)

#     return save_path
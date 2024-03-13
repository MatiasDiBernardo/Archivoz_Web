import sqlite3
#import pandas as pd
from datetime import date

def process_data(row_users, row_recs):
    data = {
        "ID": [], 
        "Fecha":[],
        "Nombre": [], 
        "Region": [], 
        "Edad": [],
        "Mail": [], 
        "Audios Donados" : [],
        "Minutos Donados": [], 
        "Peticion Custom TTS": [], 
        "Custom TTS Usos": [], 
    }
    
    for info in row_users:
        user_id = info[0]
        data["ID"].append(user_id)
        data["Nombre"].append(info[1])
        data["Edad"].append(info[2])
        data["Region"].append(info[3])
        data["Mail"].append(info[4])
        data["Peticion Custom TTS"].append(0)  # Agregar a la db en users con Boolean, seria info[5]
        data["Custom TTS Usos"].append(0)  # Mismo que arriba
    
        cantidad_audios = 0
        minutos_audio = 0
        date_last_update = date.today()  # To cover case when the user doesn't record anything
        for rec in row_recs:
            if user_id == rec[2]:
                cantidad_audios += 1
                minutos_audio += 2  # Acá sería rec[6] donde agrego la duración de la grabación
                date_last_update = rec[1].split(" ")[0]

        data["Fecha"].append(date_last_update)
        data["Audios Donados"].append(cantidad_audios)
        data["Minutos Donados"].append(minutos_audio)

    return data

# Guardar users registrados
# Info Usuarios registrados: [ID, Nombre, Mail, Región, minutos audio donado, custom TTS on/off, custom TTS uses]

def get_data_from_db():
    # Connect to the database
    conn = sqlite3.connect('instance/data_base.db')
    
    # Create a cursor object
    cursor_user = conn.cursor()
    cursor_rec = conn.cursor()
    
    # Execute SQL query to fetch all fields from the "Usuarios" table
    cursor_user.execute("SELECT * FROM Usuario")
    cursor_rec.execute("SELECT * FROM Grabacion")
    
    # Fetch all rows
    users_data = cursor_user.fetchall()
    rec_data = cursor_rec.fetchall()
    
    display_data = False
    if display_data:
        # Display the field names
        fields_user = [desc[0] for desc in cursor_user.description]
        fields_rec = [desc[0] for desc in cursor_rec.description]
        print(fields_rec)
        print(fields_user)
    
        # Display the data
        for row in users_data:
            print(row)

    # Close the connection
    conn.close()
    
    return users_data, rec_data

def only_new_data(df_old, df_new):
    """ This function compares the old data frame (last week) 
    with the current one and find the differences.
    Args:
        df_old(pd.DataFrame): Old data.
        df_new(pd.DataFrame): New data.
    Returns
        (pd.DataFrame): Information of progress.
    """
    # Este diccionario va a tener
    # Cantidad nuevos usuarios
    # Cantidad audios nuevos donados
    # Cantidad de pet TTS nuevas
    # Cantidad de usos de TTS custom
    
    dicc = {}

    return dicc

users_data, rec_data = get_data_from_db()
excel_file_path = 'Archivoz data general.xlsx'  # File to easy manage all the data

# df_old = pd.read_excel(excel_file_path)   # Older data
# data_new = process_data(users_data, rec_data)
# df_new = pd.DataFrame(data_new)  # Current data
# df_dif = only_new_data(df_old, df_new)

# Falta guardar la data general y la nueva data

# El update se va a subir a una carpeta en drive 
# El excel general se va a subir a el root de esa carpeta y después el excel de incremento y la db van a 
# Una subcarpeta según el mes (tengo que crear las carpetas en el drive y hacer un diccionario que vincule
# las key de esas carpetas con el nombre del mes)

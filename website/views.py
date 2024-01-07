from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from .utils import validate_user_data, change_author_by_selection, find_match_on_id, update_text_on_screen 
from .models import Usuario, Grabacion, Texto, MapaVoces
from . import db

import os
import datetime

views = Blueprint("views", __name__)

#Pagina principal (igual a como está ahora)
@views.route('/')
def home():
    return render_template('index.html')

#Pagina donde el usuario pone sus datos para la grabación
@views.route('/registro_voces', methods=['GET', 'POST'])
def obtener_datos():
    #Cuando el user pone "Confirmar datos" se ejecuta el POST
    if request.method == 'POST':
        #Se guardan los datos que ingreso el usuario
        nombreUsuario = request.form.get("nombre")
        edadUsuario = request.form.get("edad")
        regionUsuario = request.form.get("region")
        mailUsuario = request.form.get("mail1")
        mailUsuarioConfirmacion = request.form.get("mail2")
        print("La región del usuario es: ", regionUsuario)

        #Validación de datos y de ID en caso de existir
        idUsuarioAValidar = request.form.get("userID")
        data_validation, error_msj = validate_user_data(nombreUsuario, edadUsuario, mailUsuario, mailUsuarioConfirmacion, idUsuarioAValidar)
        matchID = find_match_on_id(idUsuarioAValidar)

        if not data_validation and not matchID:
            flash(error_msj, category='error')
        elif (matchID):
            return redirect(url_for("views.grabacion", id_user=idUsuarioAValidar))
        else:
            newUser = Usuario(nombre=nombreUsuario, edad=edadUsuario,
                              region=regionUsuario, mail=mailUsuario)
            
            db.session.add(newUser)
            db.session.commit()

            id_user_for_session = newUser.user_id

            return redirect(url_for("views.grabacion", id_user=id_user_for_session))

    return render_template('form.html')

#Pagina donde se graba los audios
@views.route('/recording/<string:id_user>', methods=['GET', 'POST'])
def grabacion(id_user):

    # Se fija si el usario ya tiene un perfil de grabación.
    user_object = Usuario.query.filter_by(user_id=id_user).first()
    list_recordings = user_object.grabaciones
    list_texts = [g.texto_id for g in list_recordings]  # List of string with texts ids
    num_recordings = len(list_recordings)

    if num_recordings != 0:
        # Acá estaría sobre escribiendo un audio (chequear que no se rompe nada.)
        text_to_read = list_recordings[-1].text_display
    else:
        # If the user doesn't have recordings start with  Archivoz
        text_to_read = "Archivoz_4_0"
    
    print("La cantidad de frasese grabadas es: ", num_recordings)
    print("La frase que se guardo es: ", text_to_read)

    # Cuando el user acceda a esta página que le salga su última grabación y el número de grabaciones
    if request.method == 'GET':
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'num_recordings': num_recordings, 'text_to_read': text_to_read})
        else:
            return render_template('recording.html', id_user=id_user)

    if request.method  == 'POST':

        if 'file' not in request.files:
            return 'No audio file provided', 400

        # Data access with the form
        audio_file = request.files['file']

        # Esta variable va a tener el string de la selección del front
        author_selected = "Julio Cortázar"
        # author_selected = request.form.get('autor')

        if audio_file.filename == '':
            return 'No selected file', 400

        # Save audio file to local storage
        wav_filename = os.path.join('uploads', f'audio_{id_user}_{text_to_read}.mp3')
        with open(wav_filename, 'wb') as wav_name:
            audio_file.save(wav_name)

        # Defines next frase to display
        current_author = text_to_read.split("_")[0]
        if current_author != 'Archivoz' and current_author != author_selected:   
            text_to_display = change_author_by_selection(author_selected, list_texts)
        else:
            text_to_display = update_text_on_screen(text_to_read, author_selected, list_texts)
        
        # Update the db with the current recording
        good_audio_conditons = True # Hacer función que chequee que se grabo bién
        if good_audio_conditons:
            newRecording = Grabacion(usuario_id=id_user, 
                                     texto_id=text_to_read, 
                                     text_display=text_to_display,
                                     audio_path=wav_filename,
                                     fecha=datetime.datetime.now())
            db.session.add(newRecording)
            db.session.commit()

        # Hice una implementación de la parte de texto sin base de datos porque creí que
        # sería mas fácil y si bien fue mas rápido quedo bastante desprolijo a nivel código.
        # Así que dejo esta sección para refactor mas adelante.
        # Otra cosa a arreglar es que si cambias de autor se acualiza después de leer otra 
        # frase del autor viejo.
        data = {'num_recordings': num_recordings,
                'text_to_read': text_to_display}


        return jsonify(data)

    return render_template('recording.html', id_user=id_user)

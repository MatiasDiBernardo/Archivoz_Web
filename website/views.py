from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify, send_file, abort
from flask_mail import Message
from .utils import *
from .models import Usuario, Grabacion, Texto, MapaVoces
from . import db, mail

import os
import datetime
import zipfile

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

        #Validación de datos y de ID en caso de existir
        idUsuarioAValidar = request.form.get("userID")
        data_validation, error_msj = validate_user_data(nombreUsuario, edadUsuario, mailUsuario, mailUsuarioConfirmacion, idUsuarioAValidar)
        matchID = find_match_on_id(idUsuarioAValidar)

        if not data_validation and not matchID:
            flash(error_msj, category='error')
        elif (matchID):
            return redirect(url_for("views.grabacion", id_user=idUsuarioAValidar))
        else:
            # Si se crea un nuevo usuario se guarda en la base de datos.
            newUser = Usuario(nombre=nombreUsuario, edad=edadUsuario,
                              region=regionUsuario, mail=mailUsuario)
            
            db.session.add(newUser)
            db.session.commit()

            id_user_for_session = newUser.user_id
            mail_usuario = newUser.mail

            # Y se le manda un mail con su id
            msg_title = "Registro ArchiVoz"
            sender = "noreply@app.com"
            msg = Message(msg_title, sender=sender, recipients=[mail_usuario])
            msg_body = """ Gracias por registrarte en nuestro arhivo de voces. Con el ID que te asignamos
            podes retomar tu sesión de grabación en cualquier momento desde el punto donde la dejaste.
            Además, con tu ID vas a poder acceder a las funcionalidades de texto a voz personalizado y a ubicar
            tu voz dentro del mapa de voces, ambos proyectos en los que estamos trabajando. Así que no lo pierdas.
            Este es tu ID:
            """
            msg.body = ""
            data = {
                'app_name': "REBWAR AI",
                'title': msg_title,
                'body': msg_body,
                'id':id_user_for_session,
            }

            msg.html = render_template("email.html",data=data)

            try:
                mail.send(msg)
            except Exception as e:
                print(e)

            return redirect(url_for("views.grabacion", id_user=id_user_for_session))

    return render_template('form.html')

#Pagina donde se graba los audios
@views.route('/recording/<string:id_user>', methods=['GET', 'POST'])
def grabacion(id_user):

    # Se fija si el usario ya tiene un perfil de grabación.
    user_object = Usuario.query.filter_by(user_id=id_user).first()
    list_recordings = user_object.grabaciones
    list_texts = [g.text_id for g in list_recordings]  # List of string with texts ids
    num_recordings = len(list_recordings)

    if num_recordings != 0:
        text_id = list_recordings[-1].text_display
    else:
        # If the user doesn't have recordings start with  Archivoz
        text_id = "Archivoz_4_0"
    
    # Cuando el user acceda a esta página que le salga su última grabación y el número de grabaciones
    if request.method == 'GET':
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            name_of_text = text_ID_to_name(text_id) 
            text_to_display_on_front = text_ID_to_text(text_id)

            data = {'num_recordings': num_recordings,
                    'name_of_text': name_of_text,
                    'text_to_display': text_to_display_on_front}

            return jsonify(data)
        else:
            return render_template('recording.html', id_user=id_user)

    if request.method  == 'POST':

        if 'file' not in request.files:
            return 'No audio file provided', 400

        # Data access with the form
        audio_file = request.files['file']

        # Esta variable va a tener el string de la selección del front
        author_selected = request.form.get('author')
        if author_selected == "None":
            author_selected = None

        if audio_file.filename == '':
            return 'No selected file', 400
        
        # Creates the user audio folder if needed
        user_folder_path = os.path.join('uploads', id_user)
        if not os.path.exists(user_folder_path):
            os.makedirs(user_folder_path)

        # Save audio file to local storage
        wav_filename = os.path.join(user_folder_path, f'{id_user}_{text_id}.mp3')
        with open(wav_filename, 'wb') as wav_name:
            audio_file.save(wav_name)

        # Defines next frase to display
            
        # This implementation changes the text based on author at any moment
        # current_author = text_id.split("_")[0]
        # if current_author != 'Archivoz' and current_author != author_selected and author_selected is not None:   
        #     text_to_display = change_author_by_selection(author_selected, list_texts)
        # else:
        #     text_to_display = update_text_on_screen(text_id, author_selected, list_texts)

        # This implementation only changes when the text finish
        text_to_display = update_text_on_screen(text_id, author_selected, list_texts)
        
        # Update the db with the current recording
        good_audio_conditons = check_audio_conditions(wav_filename)
        if good_audio_conditons:
            newRecording = Grabacion(usuario_id=id_user, 
                                     text_id=text_id, 
                                     text_display=text_to_display,
                                     audio_path=wav_filename,
                                     fecha=datetime.datetime.now())
            db.session.add(newRecording)
            db.session.commit()

        # Hice una implementación de la parte de texto sin base de datos porque creí que
        # sería mas fácil y si bien fue mas rápido quedo bastante desprolijo a nivel código.
        # Así que dejo esta sección para refactor mas adelante.

        name_of_text = text_ID_to_name(text_to_display) 
        text_to_display_on_front = text_ID_to_text(text_to_display)

        # Data sended to the front
        data = {'num_recordings': num_recordings + 1,
                'name_of_text': name_of_text,
                'text_to_display': text_to_display_on_front}

        return jsonify(data)

    return render_template('recording.html', id_user=id_user)

#Pagina donde el usuario pone sus datos para la grabación
@views.route('/text-to-speech', methods=['GET', 'POST'])
def interface_tts():
    # Si llega una POST request
    if request.method == 'POST':
        # Guarda los valores enviados en el form
        text_to_tts = request.form.get("textToAudio")
        nombre_modelo = request.form.get("modeloTTS")

        if text_to_tts is None or text_to_tts == "":
            abort(400, description="El texto a procesar es inválido.")

        audio_path = text_to_speech(text_to_tts, nombre_modelo)

        return send_file(audio_path, as_attachment=False, mimetype='audio/wav')

    return render_template('TTS.html')


@views.route('/download-data', methods=['GET', 'POST'])
def get_the_data():

    directory_to_zip = "uploads"
    zip_filename = "data.zip"

    with zipfile.ZipFile(zip_filename, 'w') as zip_file:
        # Walk through all the directories and files in the specified directory
        for foldername, subfolders, filenames in os.walk(directory_to_zip):
            # Add each file to the zip file
            for filename in filenames:
                file_path = os.path.join(foldername, filename)
                arcname = os.path.relpath(file_path, directory_to_zip)  # Relative path to preserve directory structure
                zip_file.write(file_path, arcname=arcname)
    
    return send_file(zip_filename, as_attachment=True)
    


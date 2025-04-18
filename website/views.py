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
        patologiaUsuario = request.form.get("patologia")
        mailUsuario = request.form.get("mail1")
        mailUsuarioConfirmacion = request.form.get("mail2")
        terminosLeidos = request.form.get('terminos')
         
        #Validación de datos y de ID en caso de existir
        idUsuarioAValidar = request.form.get("userID")
        data_validation, error_msj = validate_user_data(nombreUsuario, edadUsuario, regionUsuario, mailUsuario, mailUsuarioConfirmacion, idUsuarioAValidar, terminosLeidos, patologiaUsuario)
        matchID = find_match_on_id(idUsuarioAValidar)

        if not data_validation and not matchID:
            flash(error_msj, category='error')
        elif (matchID):
            return redirect(url_for("views.grabacion", id_user=idUsuarioAValidar))
        else:
            # Si se crea un nuevo usuario se guarda en la base de datos.
            newUser = Usuario(nombre=nombreUsuario, edad=edadUsuario,
                              region=regionUsuario, mail=mailUsuario,
                              custom_TTS=False, custom_TTS_uses=0,
                              patologia=patologiaUsuario)
            
            db.session.add(newUser)
            db.session.commit()

            id_user_for_session = newUser.user_id
            mail_usuario = newUser.mail

            # It sends a mail notifying the user the assigned ID (it doesn't work without the env password_mail key)
            if True:
                msg_title = "Registro ArchiVoz"
                sender = "ArchiVoz Bot"
                msg = Message(msg_title, sender=sender, recipients=[mail_usuario])
                msg_body = """ Gracias por registrarte en nuestro archivo de voces. Con el ID que te asignamos
                podes retomar tu sesión de grabación en cualquier momento desde el punto donde la dejaste.
                Además, con tu ID vas a poder acceder a las funcionalidades de texto a voz personalizado y a ubicar
                tu voz dentro del mapa de voces, ambos proyectos en los que estamos trabajando. Así que no lo pierdas.
                Este es tu ID:
                """
                msg.body = ""
                data = {
                    'app_name': "ArchiVoz",
                    'title': msg_title,
                    'body': msg_body,
                    'id': id_user_for_session,
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
    num_recordings = len(list_recordings)

    # Acá en vez de recorrer las listas podría pedir la última grabación que es lo único que importa but lazy
    list_ids = [g.text_id for g in list_recordings]  # Lista de ints con los ids leído
    list_errors = [e.error_id for e in list_recordings]  # Lista de ints con los ids de los intentos fallidos

    # Incrementa el Text ID (frase a leer)
    if num_recordings != 0:
        # Control para caso inicial. Agarra el id de la ultima grabacion realizada
        if len(list_ids) != 0:
            last_rec_good = list_ids[-1]
        else:
            last_rec_good = 0

        # Control para caso inicial. Aagarra el id del ultimo error que ocurrio
        if len(list_errors) != 0:
            last_rec_error = list_errors[-1]
        else:
            last_rec_error = 0

        # Si la última grabación no es un error se elige la frase que le sigue a esta
        if last_rec_good > last_rec_error:
            text_id = last_rec_good + 1
        # Si la última grabación es un error se elige la frase que le sigue a esta
        else:
            text_id = last_rec_error + 1
    else:
        # Si el usuario no tiene grabaciones (primera vez que entra a la página) que empiece desde el principio
        text_id = 0
    
    # Cuando el user acceda a esta página que le salga su última grabación y el número de grabaciones
    if request.method == 'GET':
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            text_to_display_on_front = text_ID_to_text(text_id)

            data = {'num_recordings': len(set(list_ids)), #Es un conjunto para obtener la cantidad de textos leidos, sin duplicados
                    'text_to_display': text_to_display_on_front}

            return jsonify(data)
        else:
            return render_template('recording.html', id_user=id_user, number_recordings=num_recordings)

    if request.method  == 'POST':

        error_ocurred = request.form.get('errorOcurred') #True si fallo la grabacion, False si no

        # Si el usuario considero que la grabación no tiene errores (se guarda la data en el back)
        if error_ocurred == "False":
            if 'file' not in request.files:
                return 'No audio file provided', 400

            # Data access with the form
            audio_file = request.files['file']
            audio_duration = request.form.get('duration')

            if audio_file.filename == '':
                return 'No selected file', 400

            # Creates the user audio folder if needed
            user_folder_path = os.path.join('uploads', id_user)
            if not os.path.exists(user_folder_path):
                os.makedirs(user_folder_path)
                
            # Save audio file to local storage (es un archivo webm guardado como mp3, después se corrigue con pydub)
            mp3_filename = os.path.join(user_folder_path, f'{id_user}_{text_id}.mp3')
            with open(mp3_filename, 'wb') as mp3_name:
                audio_file.save(mp3_name)
            
            text_to_display_on_front = text_ID_to_text(text_id)
            
            # Control para caso inicial
            if len(list_errors) != 0:
                id_last_error = list_errors[-1]
            else:
                id_last_error = -1
            # Update the db with the current recording
            newRecording = Grabacion(usuario_id=id_user, 
                                    text_id=text_id, 
                                    error_id=id_last_error,
                                    text_display=text_to_display_on_front,
                                    audio_path=mp3_filename,
                                    fecha=datetime.datetime.now(),
                                    audio_duration=audio_duration)

            db.session.add(newRecording)
            db.session.commit()

            # Data sended to the front
            data = {'num_recordings': len(set(list_ids)) + 1,
                    'text_to_display': text_ID_to_text(text_id + 1)}

            return jsonify(data)
        
        # Si se borró la grabación, mandar nuevo texto y guardar en el back que es un grabación fallida
        else:
            # Como la grabación no es válido no guardo el audio
            text_to_display_on_front = text_ID_to_text(text_id)

            # Control para caso inicial
            if len(list_ids) != 0:
                id_last_rec = list_ids[-1]
            else:
                id_last_rec = -1
            
            # Update the db with the current recording
            newRecording = Grabacion(usuario_id=id_user, 
                                    text_id=id_last_rec, 
                                    error_id=text_id,
                                    text_display=text_to_display_on_front,
                                    audio_path="Wrong audio",
                                    fecha=datetime.datetime.now(),
                                    audio_duration=0.0)

            db.session.add(newRecording)
            db.session.commit()

            # Data sended to the front
            data = {'num_recordings': len(set(list_ids)), 
                    'text_to_display': text_ID_to_text(text_id + 1)}

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

        # To test the real TTS install all dependencies on the docker file and
        # uncommend the inference.py file and the text_to_speech function in utils.

        # audio_path = text_to_speech(text_to_tts, nombre_modelo)
        audio_path = ""

        return send_file(audio_path, as_attachment=False, mimetype='audio/wav')

    return render_template('TTS_demo.html')

# To access the data from a remote server without SSH connection to local files
@views.route(os.environ.get("DOWNLOAD"), methods=['GET', 'POST'])
def get_the_data():

    directory_to_zip = "uploads"
    dirname = os.path.dirname(__file__)
    zip_filename = os.path.join(dirname, "data.zip")

    with zipfile.ZipFile(zip_filename, 'w') as zip_file:
        # Walk through all the directories and files in the specified directory
        for foldername, subfolders, filenames in os.walk(directory_to_zip):
            # Add each file to the zip file
            for filename in filenames:
                file_path = os.path.join(foldername, filename)
                arcname = os.path.relpath(file_path, directory_to_zip)  # Relative path to preserve directory structure
                zip_file.write(file_path, arcname=arcname)
        
        zip_file.write("instance/data_base.db")
    
    return send_file(zip_filename, as_attachment=True)
    
@views.route('/terminos')
def terminos():
    return render_template('Terms.html')
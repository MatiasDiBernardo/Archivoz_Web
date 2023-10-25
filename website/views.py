from flask import Blueprint, render_template, request, flash, redirect, url_for
from .utils import validate_user_data, find_selected_text, find_match_on_id 
from .models import Usuario, Grabacion, Texto, MapaVoces
from . import db
import os

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
            newUser = Usuario(nombre=nombreUsuario, edad=edadUsuario,
                              region=regionUsuario, mail=mailUsuario)
            db.session.add(newUser)
            db.session.commit()

            id_user_for_session = newUser.user_id

            #Lugar para crear la db de texto cuando sea necesario.
            # from .text import create_text_db
            # create_text_db()

            return redirect(url_for("views.grabacion", id_user=id_user_for_session))

    return render_template('form.html')

#Pagina donde se graba los audios
@views.route('/recording/<string:id_user>', methods=['GET', 'POST'])
def grabacion(id_user):
    print("Id del usuario creado", id_user)
    dynamic_url =  f"/recording/{id_user}"

    if request.method  == 'POST':
        if 'file' not in request.files:
            return 'No audio file provided', 400

        audio_file = request.files['file']
        # La idea es que la parte de pasar el texto se maneje desde JS
        # info_texto = request.files['title']
        print("La info del title llego bien", request.form.get('texto'))
        info_texto = request.form.get('texto')

        print("Llego bien hasta el post")

        if audio_file.filename == '':
            return 'No selected file', 400

        wav_filename = os.path.join('uploads', f'audio_{id_user}_{info_texto}.mp3')
        with open(wav_filename, 'wb') as wav_name:
            audio_file.save(wav_name)
        
        good_audio_conditons = False # Hacer función que chequee que se grabo bién
        if good_audio_conditons:
            newRecording = Grabacion(usuario_id=id_user, texto_id=2, audio_path=wav_filename)
            db.session.add(newRecording)
            db.session.commit()

    return render_template('rec_old.html', dynamic_url=dynamic_url)

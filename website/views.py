from flask import Blueprint, render_template, request, flash, redirect, url_for
from .utils import validate_user_data
from .models import Usuario, Grabacion, Texto, MapaVoces
from . import db
import os

views = Blueprint("views", __name__)

#Pagina principal (igual a como está ahora)
@views.route('/')
def home():
    return render_template('index.html')

#Pagina donde el usuario pone sus datos para la grabación
@views.route('/get-info', methods=['GET', 'POST'])
def obtener_datos():
    if request.method == 'POST':
        nombreUsuario = request.form.get("nombre")
        edadUsuario = request.form.get("edad")
        regionUsuario = request.form.get("region")
        mailUsuario = request.form.get("mail1")
        mailUsuarioConfirmacion = request.form.get("mail2")

        data_validation, error_msj = validate_user_data(nombreUsuario, edadUsuario, mailUsuario, mailUsuarioConfirmacion)
        print("Error ", error_msj)

        if not data_validation:
            flash(error_msj, category='error')
        else:
            newUser = Usuario(nombre=nombreUsuario, edad=edadUsuario,
                              region=regionUsuario, mail=mailUsuario)
            db.session.add(newUser)
            db.session.commit()

            id_user_for_session = newUser.id

            return redirect(url_for("views.grabacion", id_user=id_user_for_session))

    return render_template('get_info.html')

#Pagina donde se graba los audios
@views.route('/recording/<int:id_user>', methods=['GET', 'POST'])
def grabacion(id_user):
    print("Id del usuario creado", id_user)
    if request.method  == 'POST':
        if 'audioRecording' not in request.files:
            return 'No audio file provided', 400

        audio_file = request.files['audioRecording']

        if audio_file.filename == '':
            return 'No selected file', 400

        wav_filename = os.path.join('uploads', f'audio_{id_user}.wav')
        with open(wav_filename, 'wb') as wav_name:
            audio_file.save(wav_name)
        
        good_audio_conditons = False # Hacer función que chequee que se grabo bién
        if good_audio_conditons:
            newRecording = Grabacion(usuario_id=id_user, texto_id=2, audio_path=wav_name)
            db.session.add(newRecording)
            db.session.commit()

    return render_template('rec_old.html')

from flask import Blueprint, render_template, request
import os
import pickle

views = Blueprint("views", __name__)

#Pagina principal (igual a como está ahora)
@views.route('/')
def home():
    return render_template('index.html')

#Pagina donde el usuario pone sus datos para la grabación
@views.route('/get-info', methods=['GET', 'POST'])
def obtener_datos():
    if request.method == 'POST':
        data = request.form
        data_dic = data.to_dict()
        name_save_dic = 'uploads/info_user.pkl'

        with open(name_save_dic, 'wb') as file:
            pickle.dump(data_dic, file)

    return render_template('get_info.html')

#Pagina donde se graba los audios
@views.route('/recording', methods=['GET', 'POST'])
def grabacion():
    if request.method  == 'POST':
        if 'audioRecording' not in request.files:
            return 'No audio file provided', 400

        audio_file = request.files['audioRecording']

        if audio_file.filename == '':
            return 'No selected file', 400

        file_name_data = 'uploads/info_user.pkl'
        with open(file_name_data, 'rb') as file:
            data_user = pickle.load(file)

        wav_filename = os.path.join('uploads', f'audio_{data_user["nombre"]}.wav')
        with open(wav_filename, 'wb') as wav_name:
            audio_file.save(wav_name)

    return render_template('rec_old.html')

from flask import Blueprint, render_template, request
import os
import wave
import pickle

views = Blueprint("views", __name__)

#El decorador me define la ruta del url de la funcion que va abajo
@views.route('/')
def home():
    return render_template('index.html')

@views.route('/get-info', methods=['GET', 'POST'])
def obtener_datos():
    if request.method == 'POST':
        data = request.form
        data_dic = data.to_dict()
        name_save_dic = 'uploads/info_user.pkl'

        with open(name_save_dic, 'wb') as file:
            pickle.dump(data_dic, file)

    return render_template('get_info.html')

@views.route('/recording', methods=['GET', 'POST'])
def grabacion():
    if request.method  == 'POST':
        if 'audioRecording' not in request.files:
            return 'No audio file provided', 400

        audio_file = request.files['audioRecording']
        print(audio_file)
        if audio_file.filename == '':
            return 'No selected file', 400

        file_name_data = 'uploads/info_user.pkl'
        with open(file_name_data, 'rb') as file:
            data_user = pickle.load(file)

        print("Puede leer la data bien: ", data_user)
        name_file = f'audio_{data_user["nombre"]}.wav'
        wav_filename = os.path.join('uploads', name_file)

        with wave.open(wav_filename, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono audio channel
            wav_file.setsampwidth(2)  # 16-bit sample width
            wav_file.setframerate(22050)  # Sample rate (you can adjust this)
            
            audio_blob = audio_file.read()
            wav_file.writeframes(audio_blob)

    return render_template('rec_old.html')

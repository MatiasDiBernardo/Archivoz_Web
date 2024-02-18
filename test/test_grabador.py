from website.models import Usuario

def create_user(client, app):
    response = client.post("/registro_voces", data = 
        {"nombre": "Nombre Test",
        "edad": 24,
        "region": "Buenos Aires",
        "mail1": "test@mail.com",
        "mail2": "test@mail.com"})

    with app.app_context():
        ID_usuario = Usuario.query.first().user_id
    
    return ID_usuario

def test_new_user_correctly_adds_to_db(client, app):
    id_user = create_user(client, app)
    audio_test_path_1 = "website\\static\\audios\\0.wav"

    # Send audio post to the backend
    with open(audio_test_path_1, 'rb') as audio_file:
        response = client.post(f"/recording/{id_user}", data=
            {"file": audio_file,
            "author": None})
    
    created_audio_path = f"uploads\{id_user}\{id_user}_Archivoz_6_0.mp3"
    with app.app_context():
        rec_object = Usuario.query.first().grabaciones 

        assert rec_object[0].text_id == "Archivoz_6_0"
        assert rec_object[0].usuario_id == id_user
        assert rec_object[0].audio_path == created_audio_path

def test_bad_input_by_the_user(client, app):
    id_user = create_user(client, app)
    response = client.post(f"/recording/{id_user}", data=
        {"file": None,
         "autor": None})
    
    assert response.status_code == 400
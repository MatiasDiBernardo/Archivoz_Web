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
    response = client.post(f"/recording/{id_user}", data=
        {"file": None,
         "autor": None})
    
    print(response)
    
    with app.app_context():
        rec_object = Usuario.query.first().grabaciones 
        print(rec_object)
        #assert rec_object[0].text_id[0] == "Archivoz_4_0"
        assert len(rec_object) == 0

def test_bad_input_by_the_user(client, app):
    id_user = create_user(client, app)
    response = client.post(f"/recording/{id_user}", data=
        {"file": None,
         "autor": None})
    
    assert response.status_code == 400
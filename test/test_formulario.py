from website.models import Usuario

def test_create_valid_user(client, app):
    response = client.post("/registro_voces", data = 
        {"nombre": "Nombre Test",
        "edad": 24,
        "region": "Buenos Aires",
        "mail1": "test@mail.com",
        "mail2": "test@mail.com"})

    with app.app_context():
        assert Usuario.query.count() == 1
        assert Usuario.query.first().nombre == "Nombre Test"
        assert Usuario.query.first().edad == 24
        assert Usuario.query.first().region == "Buenos Aires"
        assert Usuario.query.first().mail == "test@mail.com"

def test_login_by_index(client, app):
    response = client.post("/registro_voces", data = 
        {"nombre": "Nombre Test",
        "edad": 24,
        "region": "Buenos Aires",
        "mail1": "test@mail.com",
        "mail2": "test@mail.com"})

    with app.app_context():
        ID_usuario = Usuario.query.first().user_id

    response = client.post("/registro_voces", data = 
        {"userID": ID_usuario})


    url = f"/recording/{ID_usuario}"
    print(response.history)
    
    #Esta línea se asegura que si el cliente pasa un ID valido
    #ingrese a la sección de Grabación.

    assert client.get(url).status_code == 200

        
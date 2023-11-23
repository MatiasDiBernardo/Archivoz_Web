from website.models import Usuario

def test_create_valid_user(client, app):
    response = client.post("/registro_voces", data = 
        {"nombre": "Nombre Test",
        "edad": 24,
        "region": "Buenos Aires",
        "mail1": "test@mail.com",
        "mail2": "test@mail.com"})
    
    # Checks if triggers the redirect
    assert b"<title>Redirecting...</title>" in response.data
    with app.app_context():
        # Check if the data passed by the user is correctly save in the database
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

    assert b"<title>Redirecting...</title>" in response.data
    with app.app_context():
        ID_usuario = Usuario.query.first().user_id

    response2 = client.post("/registro_voces", data = 
        {"userID": ID_usuario})
    
    assert b"<title>Redirecting...</title>" in response2.data

    url = f"/recording/{ID_usuario}"
    assert client.get(url).status_code == 200

def test_pass_incorrect_ID(client, app):
    response = client.post("/registro_voces", data = 
        {"nombre": "Nombre Test",
        "edad": 24,
        "region": "Buenos Aires",
        "mail1": "test@mail.com",
        "mail2": "test@mail.com"})

    assert b"<title>Redirecting...</title>" in response.data

    response2 = client.post("/registro_voces", data = 
        {"userID": "FH78FDFG"})

    assert b"<title>ArchiVoz Formulario</title>" in response2.data
        
def test_pass_differnt_mails(client, app):
    response = client.post("/registro_voces", data = 
        {"nombre": "Nombre Test",
        "edad": 24,
        "region": "Buenos Aires",
        "mail1": "tes2t@mail.com",
        "mail2": "test@mail.com"})

    assert b"<title>ArchiVoz Formulario</title>" in response.data

def test_pass_negative_age(client, app):
    response = client.post("/registro_voces", data = 
        {"nombre": "Nombre Test",
        "edad": -2,
        "region": "Buenos Aires",
        "mail1": "test@mail.com",
        "mail2": "test@mail.com"})

    assert b"<title>ArchiVoz Formulario</title>" in response.data
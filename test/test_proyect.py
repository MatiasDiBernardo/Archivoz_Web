#Test if the title in home matches the html
def test_home(client):
    response = client.get("/")
    assert b"<title>ArchiVoz</title>" in response.data
#Test if the title in home matched the html
def test_home(client):
    response = client.get("/")
    assert b"<title>ArchiVoz</title>" in response.data
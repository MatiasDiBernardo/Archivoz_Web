import pytest

from website import create_app, db

@pytest.fixture()
def app():
    app_test = create_app("sqlite://")
    app_test.config["TESTING"] = True

    with app_test.app_context():
        db.create_all()

    yield app_test

@pytest.fixture()
def client(app):
    return app.test_client()
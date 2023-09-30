from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from os import path

db = SQLAlchemy()
DB_NAME = "data_base.db"

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev_god'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    db.init_app(app)

    from .views import views
    from .auth import auth

    #Asociamos el template que hago en views a el objeto app
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    from .models import Usuario, Texto, MapaVoces, Grabacion

    with app.app_context():
        db.create_all()
    
        datos_actuales = Usuario.query.all()
        print("Base de datos: ", datos_actuales)

    return app

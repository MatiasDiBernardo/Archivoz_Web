from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
import os

db = SQLAlchemy()
DB_NAME = "data_base.db"

def create_app(database_uri = f'sqlite:///{DB_NAME}'):
    global mail

    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev_god'
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri

    app.config['MAIL_SERVER'] = "smtp.googlemail.com"
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = "your_gmail@gmail.com"
    app.config['MAIL_PASSWORD'] = os.environ.get("PASSWORD_MAIL")

    mail = Mail(app)
    db.init_app(app)

    from .views import views

    #Asociamos el template que hago en views a el objeto app
    app.register_blueprint(views, url_prefix='/')

    from .models import Usuario, Texto, MapaVoces, Grabacion

    with app.app_context():
        db.create_all()
    
        datos_actuales_usuarios = Usuario.query.all()
        #print("Base de datos usuarios: ", datos_actuales_usuarios)
    
    return app

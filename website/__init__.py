from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev_god'

    from .views import views
    from.auth import auth

    #Asociamos el template que hago en views a el objeto app
    #El prefix es el default y después va lo que puse en el decorador
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')
    
    return app
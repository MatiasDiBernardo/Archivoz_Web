import uuid
from . import db
from sqlalchemy.sql import func  

def random_ID():
    #Genero un ID random como string combinación de letras y numeros de 8 caracteres.
    id_ran = str(uuid.uuid4())
    return id_ran[:7]  

class MapaVoces(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.user_id'), primary_key =True)
    pos_x = db.Column(db.Integer)
    pos_y = db.Column(db.Integer)

class Grabacion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime(timezone=True), default=func.now())
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.user_id'))
    texto_id = db.Column(db.Integer, db.ForeignKey('texto.id'))
    audio_path = db.Column(db.String(200))

    def __repr__(self):
        return f'<Grabacion: ID = {self.id} | Usuario asociado ID = {self.usuario_id}>'

class Usuario(db.Model):
    #Tengo que testear si funciona la implementación del ID random. 
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String,  default=lambda: random_ID(), unique=True)
    nombre = db.Column(db.String(50))
    edad = db.Column(db.Integer)
    region = db.Column(db.String(100))
    mail = db.Column(db.String(150), unique=True)
    grabaciones = db.relationship('Grabacion', backref='usuario')

    def __repr__(self):
        return f'<Usuario: ID = {self.id} | Nombre = {self.nombre}> | User ID Real = {self.user_id} | Grabaciónes = {self.grabaciones}'

class Texto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenido = db.Column(db.String(500))
    fuente = db.Column(db.String(100))
    autor = db.Column(db.String(100))

    def __repr__(self):
        return f'<Texto: ID = {self.id} | Contenido = {self.contenido}>'

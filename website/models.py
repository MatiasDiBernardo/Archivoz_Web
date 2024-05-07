import uuid
from . import db
from sqlalchemy.sql import func  

def random_ID():
    #Genero un ID random como string combinación de letras y numeros de 8 caracteres.
    id_ran = str(uuid.uuid4())
    id_ran = id_ran[:6].upper()

    #Compruebo que el string generado sea único.
    while Usuario.query.filter_by(user_id=id_ran).first() is not None:
        id_ran = str(uuid.uuid4())
        id_ran = id_ran[:6].upper()

    return id_ran

class MapaVoces(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.user_id'), primary_key =True)
    pos_x = db.Column(db.Integer)
    pos_y = db.Column(db.Integer)

class Grabacion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime(timezone=True), default=func.now())
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.user_id'))
    text_id = db.Column(db.String(200))
    text_display = db.Column(db.String(200))
    audio_path = db.Column(db.String(200))
    audio_duration = db.Column(db.Float)

    def __repr__(self):
        return f'<Grabacion: ID = {self.id} | Usuario asociado ID = {self.usuario_id}>'

class Usuario(db.Model):
    user_id = db.Column(db.String, default=lambda: random_ID(), unique=True, primary_key=True)
    nombre = db.Column(db.String(50))
    edad = db.Column(db.Integer)
    region = db.Column(db.String(100))
    mail = db.Column(db.String(150), unique=True)
    grabaciones = db.relationship('Grabacion', backref='usuario')
    custom_TTS = db.Column(db.Boolean)
    custom_TTS_uses = db.Column(db.Integer)

    def __repr__(self):
        return f'User ID = {self.user_id} | Nombre = {self.nombre}> | Grabaciónes = {self.grabaciones}'

class Texto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenido = db.Column(db.String(500))
    fuente = db.Column(db.String(100))
    autor = db.Column(db.String(100))

    def __repr__(self):
        return f'<Texto: ID = {self.id} | Contenido = {self.contenido}>'

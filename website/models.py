from . import db
from sqlalchemy.sql import func  

class MapaVoces(db.Model):
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key =True)
    pos_x = db.Column(db.Integer)
    pos_y = db.Column(db.Integer)

class Grabacion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime(timezone=True), default=func.now())
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    texto_id = db.Column(db.Integer, db.ForeignKey('texto.id'))
    audio_path = db.Column(db.String(200))

    def __repr__(self):
        return f'<Grabacion: ID = {self.id} | Usuario asociado ID = {self.usuario_id}>'

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50))
    edad = db.Column(db.Integer)
    region = db.Column(db.String(100))
    mail = db.Column(db.String(150), unique=True)
    grabaciones = db.relationship('Grabacion', backref='usuario')

    def __repr__(self):
        return f'<Usuario: ID = {self.id} | Nombre = {self.nombre}>'

class Texto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenido = db.Column(db.String(500))
    fuente = db.Column(db.String(100))
    autor = db.Column(db.String(100))

    def __repr__(self):
        return f'<Texto: ID = {self.id} | Contenido = {self.contenido}>'

from .models import Texto
from . import db

#Este script es para correr una sola vez y crear la base de datos de textos  para mostrar en pantalla.
#Se ejecuta desde views.py una sola vez para mantener la estructura de imports relativos.

def create_text_db():

    t1 = Texto(contenido="Primera oración de prueba para que el usuario lea.", fuente = "Libro", autor="Cortazar")
    t2 = Texto(contenido="Ahora se pasa a otra frase y puede seguir leyendo placidamente.", fuente = "Libro", autor="Cortazar")
    t3 = Texto(contenido="Frase final para confirmar que la forma de visualizar el texto en pantalla funciona correctamente", fuente = "Libro", autor="Cortazar")

    db.session.add_all([t1, t2, t3])
    db.session.commit()





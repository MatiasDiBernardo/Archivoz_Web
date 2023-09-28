from .models import Usuario

"""
Cosas a validar:
- Que el mail tenga estructura de mail (que halla un arroba)
- Que los dos mails sean iguales
- Que el mail sea mayor a 4 caracteres
- Que el mail no sea mayor a 150 caracteres
- Que la edad sea positiva un número entero. Mayor de cero y menos que 100
- Que el nombre no tenga ningún caracter raro 
- Que el nombre sea mayor a 4 caracteres y menor a 50.
Lo que se te ocurra podes agreagar
"""

def validate_user_data(nombre, edad, mail, mail_confirmacion):
    """Verifica se los datos que ingreso el usuario son válidos.
    Si algún dato no es válido devuelve False y un mensaje explicando
    cual es el error al ingresar el dato. Si todos los datos son
    correctos devuelve True y un string vacío.

    Args:
        nombre (string): Nombre del usuario.
        edad (int): Edad del usuario. 
        mail (_type_): Mail del usuario.
    Return:
        (boolean): Si los datos son validos o no.
        (string): Mensaje que recibe el usuario si puso algún dato mal.
    """

    #Codigo para verificar si el mail que ingreso el usuario ya esta en la base de datos.
    email_en_uso = Usuario.query.filter_by(mail=mail).first()

    validate = True
    mensaje = ""

    if int(edad) < 0:
        mensaje = "Por favor pone una edad mayor a 0 no seas termo"
        validate = False

    return validate, mensaje
from .models import Usuario, Texto

def find_match_on_id(userID):
    """Busca si el ID que el usuario ingreso es válido.

    Args:
        userID (int): ID del usuario.
    """
    val = False
    idVal = Usuario.query.filter_by(user_id=userID).first()
    if idVal is not None:
        val = True

    return val


def find_selected_text(userID, source, autor):
    """Esta función me devuelve un ID de texto según las preferencias del
    usuario entre las opciones que se le dan a elegir de textos a leer.
    Esta función también compara que el texto que se le de para leer al usuario
    no se repita.

    Args:
        userID (int): ID del usuario activo en la sesión.
        source (string): Fuente de origen del texto.
        autor (string): Autor del texto. 
    """
    # Una opción es hacear distintos csv por autor y según lo que el user elija
    # se van a mostrar diferentes textos.

    #Aca tengo que hacer los querys correspondientes y devolver un ID.
    #Averiguar como hacer para poder tener acá el valor del ID que necesito
    Texto.query.filter_by(autor=autor).first()

def validate_user_data(nombre, edad, mail, mail_confirmacion, ID):
    """Verifica si los datos que ingreso el usuario son válidos.
    Si algún dato no es válido devuelve False y un mensaje explicando
    cual es el error al ingresar el dato. Si todos los datos son
    correctos devuelve True y un string vacío.

    Args:
        nombre (string): Nombre del usuario.
        edad (string): Edad del usuario. 
        mail (string): Mail del usuario.
        mail_confimación (string): Nuevo entrada para el mail del usuario.
    Return:
        (boolean): Si los datos son validos o no.
        (string): Mensaje que recibe el usuario si puso algún dato mal.
    """

    #Codigo para verificar si el mail que ingreso el usuario ya esta en la base de datos.
    email_en_uso = False  #Asumir falso por ahora.

    validate = True
    mensaje = ""

    if ID is not None:  #Si paso algo como ID
        if (not find_match_on_id(ID)):
            validate = False
            mensaje = "El ID de usuario ingresado no es válido."
        return validate, mensaje

    email_en_uso = Usuario.query.filter_by(mail=mail).first()
    if (email_en_uso is not None):
        validate = False
        mensaje = "El mail ingresado ya tiene un ID asociado. Por favor, ingrese su ID para retomar su sesión."
        return validate, mensaje
    
    if (mail != mail_confirmacion):
        validate = False
        mensaje = "Los mail tienen que ser iguales."
        return validate, mensaje
    
    if ("@" not in mail):
        validate = False
        mensaje = "Ingrese un mail válido."
        return validate, mensaje
    
    if (len(mail) < 3 or len(mail) > 150):
        validate = False
        mensaje = "Ingrese un mail válido."
        return validate, mensaje
    
    if (len(nombre) < 2 or len(nombre) > 120):
        validate = False
        mensaje = "Ingrese un nombre válido."
        return validate, mensaje

    if "." in edad:
        validate = False
        mensaje = "La edad tiene que ser un número entero."
        return validate, mensaje

    if (int(edad) < 0):
        validate = False 
        mensaje = "Poner edad mayor a 0."
        return validate, mensaje

    if (int(edad) > 200):
        validate = False 
        mensaje = "Poner una edad menor a 200."
        return validate, mensaje

    return validate, mensaje

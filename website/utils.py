#from .models import Usuario

"""
IMPORTANTE: Mirar las funciones de test es trampa. Se espera que el
alumno pueda resolver el problema con  sus conocimientos y creatividad. 
Para que la actividad se considere correcta al ejecutar el script todas las
pruebas tienen que ser válidas. Cuando todas las pruebas fueron superadas
exitosamente, aparecera el mensaje

Cosas a validar:
- Que el mail tenga estructura de mail (que halla un arroba)
- Que los dos mails sean iguales (el mail y el mail_confirmacion)
- Que el mail sea mayor a 4 caracteres
- Que el mail no sea mayor a 150 caracteres
- Que la edad sea positiva un número entero. Mayor de cero y menos que 100
- Que el nombre no tenga ningún caracter raro 
- Que el nombre sea mayor a 4 caracteres y menor a 50.
Si se te ocurre algún caso mas lo podes agregar (suma puntos extra para la nota)
"""

def validate_user_data(nombre, edad, mail, mail_confirmacion):
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
    #email_en_uso = Usuario.query.filter_by(mail=mail).first()
    email_en_uso = False  #Por ahora

    validate = True
    mensaje = ""

    return validate, mensaje

"""
De acá para abajo son funciones de testeo. Con ejecutar el archivo 
automáticamente se realizaran las pruebas. 
"""

def test_caso_correcto():
    nombre = "Matías Di Bernardo"
    edad = "23"
    mail = "matias.di.bernardo@hotmail.com"
    mail2 = "matias.di.bernardo@hotmail.com"

    validate, msj = validate_user_data(nombre, edad, mail, mail2)

    return validate, msj

def test_caso_incorrecto1():
    nombre = ""
    edad = "23"
    mail = "matias.di.bernardo@hotmail.com"
    mail2 = "matias.di.bernardo@hotmail.com"

    validate, msj = validate_user_data(nombre, edad, mail, mail2)
    msj_error = "El nombre quedo vacio y no esta chequeado."

    return validate, msj, msj_error

def test_caso_incorrecto2():
    nombre = "Matías Di Bernardoaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    edad = "23"
    mail = "matias.di.bernardo@hotmail.com"
    mail2 = "matias.di.bernardo@hotmail.com"

    validate, msj = validate_user_data(nombre, edad, mail, mail2)
    msj_error = "El nombre es damasiado lago y no esta chequeado."

    return validate, msj, msj_error

def test_caso_incorrecto3():
    nombre = "Matías Di Bernardo"
    edad = "-2"
    mail = "matias.di.bernardo@hotmail.com"
    mail2 = "matias.di.bernardo@hotmail.com"

    validate, msj = validate_user_data(nombre, edad, mail, mail2)
    msj_error = "La edad es negativa y no esta chequeado."

    return validate, msj, msj_error

def test_caso_incorrecto4():
    nombre = "Matías Di Bernardo"
    edad = "450"
    mail = "matias.di.bernardo@hotmail.com"
    mail2 = "matias.di.bernardo@hotmail.com"

    validate, msj = validate_user_data(nombre, edad, mail, mail2)
    msj_error = "La edad es demasiado grande y no esta chequeado."

    return validate, msj, msj_error

def test_caso_incorrecto5():
    nombre = "Matías Di Bernardo"
    edad = "23"
    mail = ""
    mail2 = "matias.di.bernardo@hotmail.com"

    validate, msj = validate_user_data(nombre, edad, mail, mail2)
    msj_error = "El mail esta vacío y no esta chequeado"

    return validate, msj, msj_error

def test_caso_incorrecto6():
    nombre = "Matías Di Bernardo"
    edad = "23"
    mail = "matias.di.bernrdo@hotmail.com"
    mail2 = "matias.di.bernardo@hotmail.com"

    validate, msj = validate_user_data(nombre, edad, mail, mail2)
    msj_error = "El mail de confirmación no es igual."

    return validate, msj, msj_error

def test_caso_incorrecto7():
    nombre = "Matías Di Bernardo"
    edad = "23"
    mail = "matias.di.bernrdohotmailcom"
    mail2 = "matias.di.bernardo@hotmail.com"

    validate, msj = validate_user_data(nombre, edad, mail, mail2)
    msj_error = "El mail no tiene estructura de mail."

    return validate, msj, msj_error

def eval_test(func, cont):
    val, msj, msj_error = func()
    if val:
        print("Error: " + msj_error)
    else:
        cont += 1
        print(f"Paso Prueba {cont}/7")

def test():
    cont = 0
    eval_test(test_caso_incorrecto1, cont)
    eval_test(test_caso_incorrecto2, cont)
    eval_test(test_caso_incorrecto3, cont)
    eval_test(test_caso_incorrecto4, cont)
    eval_test(test_caso_incorrecto5, cont)
    eval_test(test_caso_incorrecto6, cont)
    eval_test(test_caso_incorrecto7, cont)
    val, msj = test_caso_correcto()
    if cont == 7 and val:
        print("Pasaron todas las pruebas exitosamente.")
    
#test()
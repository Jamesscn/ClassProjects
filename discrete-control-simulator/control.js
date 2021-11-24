// En esta sección se asignan las variables. En el archivo index.js se llenan estos valores con los valores de la interfaz
waitTime = 1000 //El tiempo real de muestreo en milisegundos. En este caso se muestrea cada segundo
as = [] //Un arreglo que contiene todas las constantes de los as. El primer valor es a_1 y el ultimo es a_n
bs = [] //Un arreglo que contiene todas las constantes de los bs. El primer valor es b_0 y el ultimo es b_m
cs = [] //Un arreglo que contiene todas las cs, y que se va expandiendo conforme se corre el programa, empezando con c(0)
cnps = [] //Un arreglo que contiene todas las cs sin las perturbaciones, que solo se usa para gráficar la perturbación
ms = [] //Un arreglo que contiene todas las ms o entradas, empezando de m(0) hasta m(k)
rs = [] //Un arreglo que contiene todas las rs o referencias, empezando de r(0) hasta r(k)
es = [] //Un arreglo que contiene todas las es o errores, empezando de e(0) hasta e(k)
d = 0 //La variable d que corresponde al delay o retraso de las entradas
k = 0 //La variable k de tiempo discreto
mk = 0 //La variable m(k) que guarda el valor actual de la entrada
pk = 0 //La variable p(k) que guarda el valor actual de la salida
rk = 0 //El valor actual de la referencia
ek = 0 //El valor actual del error
mnext = 0 //El valor que se utilizará para mk en el siguiente intervalo, dependiendo del error actual calculado
automaticControl = false //La variable que dice si el control será manual o automatico
betaZero = 0 //El valor de beta_0
betaOne = 0 //El valor de beta_1
betaTwo = 0 //El valor de beta_2

//Esta función corre en cada intervalo de muestreo y se encarga de realizar el calculo de la ecuación de ARX
//Para simular el primer orden, este se convierte a su equivalente en ARX antes de correr esta función
function simulate() {
    ms.push(mk) //Se guarda el valor actual de m(k) en el arreglo de ms
    c = 0
    for(var i = 0; i < as.length; i++) {
        //La siguiente condición asegura que el indice de c no es negativo, ya que no se puede acceder a indices negativos
        if(k - i - 1 >= 0) {
            c += as[i] * cs[k - i - 1] //A la salida c se le suma el producto de cada coeficiente a con su respectivo valor de k
        }
    }
    for(var i = 0; i < bs.length; i++) {
        //La siguiente condición asegura que el indice de c no es negativo, ya que no se puede acceder a indices negativos
        if(k - d - i >= 0) {
            c += bs[i] * ms[k - d - i] //A la salida c se le suma el producto de cada coeficiente b con su respectivo valor de m
        }
    }
    cnps.push(c) //Al arreglo de cnps se le agrega el valor de c sin considerar la perturbación
    c += pk //Se le suma la perturbación p(k) a la salida de c
    cs.push(c) //Al arreglo de cs se le agrega el valor de c considerando la perturbación
    
    ek = 0 //Se inicializa la variable que guarda el error e(k)
    if(automaticControl) { //Si el control es automático se corre el siguiente bloque de código
        ek = rk - c //El error es la diferencia entre la referencia r(k) y el valor de c(k)
        mnext = mk + betaZero * ek //Aqui se aplica la parte de m(k + 1) = m(k) + beta_0 * e(k)
        if(k - 1 >= 0) { //Si existe el intervalo pasado, se le suma beta_1 * e(k - 1) a m(k + 1)
            mnext += betaOne * es[k - 1]
        } //Si existe el intervalo antepasado, se le suma beta_2 * e(k - 2) a m(k + 1)
        if(k - 2 >= 0) {
            mnext += betaTwo * es[k - 2]
        }
    } else {
        rk = c //Si el control es manual, r(k) = c(k)
    }
    rs.push(rk) //Se guarda la referencia actual en el arreglo de rs
    es.push(ek) //Se guarda el error actual en el arreglo de es

    k += 1 //Se le suma uno al valor de tiempo discreto
    if(automaticControl) {
        mk = mnext //Si el control es automatico, m(k) en el siguiente intervalo se reemplazará por mnext
    }
}

//Las siguientes lineas de código corren la función de main cada segundo
function loop() {
    setTimeout(function() {
        simulate()
        loop()
    }, waitTime)
}

loop() //Se inicia el ciclo del programa
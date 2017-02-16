/* jslint browser:true, devel:true */
/* global $:false */
    
//JSON con los barcos
//posteriormente lo almacenamos en localStorage
var barcos = null;
var filas = null;
var columnas = null;

//Variable global para almacenar el tablero
//La matriz del tablero
var tablero = null;
var segundos;
var timer;
var disparos;
//Funcion onReady para saber que la página/aplicación está preparada
$(document).ready(function(){
    //Código para el localstorage que usaremos para guardar la partida
    // ¿Hay localstorage dispobible? (Almacenamos la configuracion alli)
    if (typeof(Storage) !== "undefined") {
        barcos = JSON.parse(localStorage.getItem("barcos"));
        filas = parseInt(localStorage.getItem("filas"));
        columnas = parseInt(localStorage.getItem("columnas"));
        
        if (barcos === null){
            barcos = [
                {tam:2, letra:'f', nombre:'fragata'},
                {tam:3, letra:'b', nombre:'buque'},
                {tam:3, letra:'s', nombre:'submarino'},
                {tam:4, letra:'d', nombre:'destructor'},
                {tam:5, letra:'p', nombre:'portaaviones'},
            ];
            localStorage.setItem("barcos", JSON.stringify(barcos));
        }
        } else { //No hay localstorage
            console.log("No hay localstorage");
        }
        //Hacemos la misma comprobación para las filas y las columnas
        if(isNaN(filas)){
            filas = 8;
            localStorage.setItem("filas", 8);
        }
        if(isNaN(columnas)){
            columnas = 8;
            localStorage.setItem("columnas", 8);
        }
        segundos = parseInt(localStorage.getItem("segundos"));
        if(isNaN(segundos)){
            segundos = 30;
            localStorage.setItem("segundos", 30);
        }
    
        disparos = parseInt(localStorage.getItem("disparos"));
        if(isNaN(disparos)){
            disparos = 34;
            localStorage.setItem("disparos", 34);
        }
    
        console.log("Nº barcos: "+barcos);
        console.log("Nº columnas: "+columnas);
        console.log("Nº filas: "+filas);
        console.log("Nº segundos: "+segundos);
    
});
  
/**
    Esta funcion crea una matriz (en JS es un Array de Arrays).
*/
function crearMatriz (filas, columnas) {
    var matriz;
    
    matriz = new Array(filas);
    
    for(var j = 0; j < columnas; j++){
        matriz[j] = new Array(columnas);
    }
        
    return matriz;
}

/** 
* Rellenamos con datos cada uno de los elementos
* de la matriz que se le pasa como paŕametro
*/

function inicializaMatriz(dato, matriz){
    for (var i = 0; i<matriz.length; i++){
        for(var j = 0; j<matriz[i].length; j++)
            matriz[i][j]=dato;
    }
}

/**
* Vuelca el contenido de la matriz a consola
*/
function matriz2console(matriz){
    var aux;
    for (var i = 0; i<matriz.length; i++){
        aux = "";
        for(var j = 0; j<matriz[i].length; j++){
            aux += matriz[i][j] + '\t';
        }
        console.log(aux);
    }
}
/**
    Devuelve un numero aleatorio desde 0 hasta tamaño - 1.
    Será usado dos veces para el valor de la fila y de la columna
*/
function dado(tamanio){
    var aleatorio;
        aleatorio = Math.floor(Math.random() * (tamanio));        
    return aleatorio;
}

/**
    Devuelve 0 o 1 para horizontal o vertical
*/
function moneda(){    
    return dado(2);
}

/**
* Codificación para el tablero:
* a = agua
* s = submarino (3)
* f = fragata (2)
* p = portaaviones (5)
* d = destructor (4)
* b = buque (3)
*/
function colocarBarcos(tablero){ //Tablero(matriz), barcos(arrays_barcos[tam][letra])
    //Para saber la longitud del arrays de barcos y poner todos los barcos en la matriz
    for(var i = 0; i<barcos.length;i++){
        var barco = barcos[i];
        var libre;
        //do-while para saber la dirección del barco(horizontal/vertical) y saber si la celda
        //se encuentra libre
        do{
            libre = true;
            var direccion = moneda();
            //Para saber la dirección (0 = Horizontal / 1 = Vertical)
            if( direccion === 0){ //Horizontal
                var x = dado(tablero.length-1);
                var y = dado(tablero[x].length - (barco.tam) ); //Para no salirnos del tablero
                //Para saber si la celda está libre
                for(var cont_Y = 0; cont_Y < barco.tam; cont_Y++){
                    if(tablero[x][cont_Y+y] !== 'a'){
                        libre = false;
                    }
                }
                //Para colocar la letra del barco en la celda
                if(libre === true){
                    for(var cont_Y2 = 0; cont_Y2 < barco.tam; cont_Y2++){
                        tablero[x] [(cont_Y2+y)] = barco.letra;
                    }
                }
                        
            } 
            else { //Vertical
                var x2 = dado(tablero.length - (barco.tam));
                var y2 = dado(tablero[x2].length);
                //Para saber si la celda está libre
                for(var cont_X = 0; cont_X < barco.tam ; cont_X++){
                    if(tablero[cont_X+x2][y2] !== 'a'){
                        libre = false;
                    }
                }
                //Y para colocar la letra
                for(var cont_X2 = 0; cont_X2 < barco.tam; cont_X2++){
                    tablero[cont_X2+x2][y2] = barco.letra;
                }
              }
        }                                
        while(libre !== true); //Hacer el do hasta que los barcos estén colocados
    }
        
}

/**
    Creamos una funcion para generar un tablero y dar imagen a los barcos.
*/
function generarTablero(){
    var html = '<table id="tabla">';
    for(var i=0; i<filas; i++){
        html += '<tr>';
            for(var j=0; j<columnas; j++){
                html += '<td id="celda_'+i+'_'+j+'" class="vacio" onclick=disparo("celda_'+i+'_'+j+'",'+i+','+j+');></td>';
            }
        html += "</tr>";
    }
    
    html += "</table>";
    html += '<audio id="audio" src="audio/gotaAgua.mp3" preload="none"></audio>';
    html += '<p id="timer"></p><p id="disparos">Disparos restantes: 30</p>';
    document.getElementById("tablero").innerHTML = html;
    
}
/**
    Creamos una funcion que cada vez que pulse sobre una celda te quite un disparo.
*/
var contador = 30;
function limpiarContador(){
    contador = 30;
}
function contadorDisparos(numero){
    disparos = disparos - numero;
    if(disparos>0){
        document.getElementById("disparos").innerHTML = "Disparos restantes: "+disparos;
    }
    else{
        document.getElementById("disparos").innerHTML = "¡NO TE QUEDAN MÁS DISPAROS!";
    }
}
/** 
    Creamos un timer para la cuenta atrás dentro de las partidas
*/
function callbackTimer(){
    segundos = 30;
    timer = document.getElementById("timer");
    window.setInterval(function(){
      if(segundos>0){
          timer.innerHTML = "Tiempo restante: "+segundos;
          segundos--;
      }else{
          timer.innerHTML = "TIEMPO AGOTADO";
          clearInterval(timer);
      }

    },1000);
}

/**
    Creamos la partida
*/

function crearPartida(filas, columnas){
    //Crear una matriz de filas * columnas.
    tablero = crearMatriz(filas, columnas);
    //Rellenar la matriz con caracter a.
    inicializaMatriz('a', tablero);
    colocarBarcos(tablero);
    //Volcar la matriz a consola.
    matriz2console(tablero);
    generarTablero();
    //Arrancamos el timer------------------->.
    callbackTimer();
    //Limpiamos el contador
    limpiarContador();
    //Actualizamos las cajas del tiempo y disparos
    $("#disparos").html(disparos+"misiles");
    $("#tiempo").html(segundos+"tiempo");
}

/**
    Creamos la funcion disparo
*/
function disparo(celda,i,j){
    disparos--;
    switch(tablero[i][j]){
        case 'a':
            tablero[i][j] = 'A';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('agua');
            document.getElementById('audio').play();
            break;
        case 'b':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('buque');
            break;
        case 'p':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('portaviones');
            break;
        case 'f':
            tablero[i][j] = 'F';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('fragata');
            break;
        case 's':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('submarino');
            break;
        case 'd':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('destructor');
            break;
        default:
            disparos++;
            break;

    }
}

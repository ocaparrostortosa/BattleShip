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
var aciertos = 0;
//Funcion onReady para saber que la página/aplicación está preparada
function cargarConfiguracion(){
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
        console.log("Nº disparos: "+disparos);
    
});
}
  
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
function colocarBarcos(matriz){
    //Compruebo que haya más de ocho filas y que la primera fila(igual a las demás) sean más de 8 columnas.
    var fila, col;
    var direccion;
    for (var i=0; i<barcos.length;i++){
        var barco = barcos[i];
        var libre;
        do { 
            // intento colocar el barco hasta 
            // que encuentro espacio libre para él
            libre=true;
            direccion = moneda();
            if (direccion===0) { // horizontal 
                fila = dado(matriz.length);
                col = dado(matriz[fila].length-barco.tam);
                for (j=0; j<barco.tam;j++){
                    if(matriz[fila][j+col]!='a') {
                        libre=false;
                    }
                }
                if (libre) {
                   for (j=0; j<barco.tam;j++){
                        matriz[fila][j+col]=barco.letra+j+direccion;
                   }
                }
            } else { // vertical
                fila = dado(matriz.length-barco.tam);
                col = dado(matriz[fila].length);
                for (j=0; j<barco.tam;j++){
                    if(matriz[j+fila][col]!='a') {
                        libre=false;
                    }
                }
                if (libre) {
                   for (var j=0; j<barco.tam;j++){
                        matriz[j+fila][col]=barco.letra+j+direccion;
                   }
                }
            }
        } while (!libre);
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
    html += '<audio id="audio" src="aud/oceano.mp3" preload="none"></audio>';
    //Sonido para los barcos
    html += '<audio id="audFragata" src="aud/fragata.mp3" preload="none"></audio>'; //Fragata
    html += '<audio id="audSubmarino" src="aud/submarino.mp3" preload="none"></audio>'; //Submarino
    html += '<audio id="audBuque" src="aud/buque.mp3" preload="none"></audio>'; //Buque
    html += '<audio id="audDestructor" src="aud/destructor.mp3" preload="none"></audio>'; //Destructor
    html += '<audio id="audPortaviones" src="aud/portaviones.mp3" preload="none"></audio>'; //Portaviones
    document.getElementById("tablero").innerHTML = html;
    
}
/** 
    Creamos un timer para la cuenta atrás dentro de las partidas
*/
function callbackTimer(){
    // segundos = 30;
    //timer = document.getElementById("tiempo");
    if(segundos>0){
      $("#tiempo").html("Tiempo restante: "+segundos);
      segundos--;
    }else{
      $("#tiempo").html("¡Tiempo agotado!");
      terminarPartida();  
    }
}

/**
    Creamos la partida
*/

function crearPartida(filas, columnas){
    segundos = 30;
    aciertos = 0;
    cargarConfiguracion();
    //Crear una matriz de filas * columnas.
    tablero = crearMatriz(filas, columnas);
    //Rellenar la matriz con caracter a.
    inicializaMatriz('a', tablero);
    colocarBarcos(tablero);
    //Volcar la matriz a consola.
    matriz2console(tablero);
    generarTablero();
    //Arrancamos el timer------------------->.
    clearInterval(timer);
    timer = setInterval(callbackTimer,1000);
    //Actualizamos las cajas del tiempo y disparos
    $("#disparos").html("Disparos disponibles: "+disparos);
    $("#tiempo").html("Tiempo disponible: "+segundos+" segundos");
}

/**
    Creamos la funcion disparo
*/
function disparo(celda,i,j){
    if(disparos>0 && segundos>0){
        disparos--;
        aciertos++;
    switch(tablero[i][j]){
        case 'a':
            tablero[i][j] = 'A';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('agua');
            document.getElementById('audio').play();
            break;
        //Buque
        case 'b00':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b00');
            document.getElementById('audBuque').play();
            break;
        case 'b10':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b10');
            document.getElementById('audBuque').play();
            break;
        case 'b20':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b20');
            document.getElementById('audBuque').play();
            break;
        case 'b01':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b01');
            document.getElementById('audBuque').play();
            break;
        case 'b11':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b11');
            document.getElementById('audBuque').play();
            break;
        case 'b21':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b21');
            document.getElementById('audBuque').play();
            break;
        //Submarino
        case 's00':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s00');
            document.getElementById('audSubmarino').play();
            break;
        case 's10':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s10');
            document.getElementById('audSubmarino').play();
            break;
        case 's20':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s20');
            document.getElementById('audSubmarino').play();
            break;
        case 's01':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s01');
            document.getElementById('audSubmarino').play();
            break;
        case 's11':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s11');
            document.getElementById('audSubmarino').play();
            break;
        case 's21':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s21');
            document.getElementById('audSubmarino').play();
            break;
        //Portaviones
         case 'p00':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p00');
            document.getElementById('audPortaviones').play();
            break;
        case 'p10':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p10');
            document.getElementById('audPortaviones').play();
            break;
        case 'p20':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p20');
            document.getElementById('audPortaviones').play();
            break;
        case 'p30':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p30');
            document.getElementById('audPortaviones').play();
            break;
        case 'p40':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p40');
            document.getElementById('audPortaviones').play();
            break;
        case 'p01':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p01');
            document.getElementById('audPortaviones').play();
            break;
        case 'p11':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p11');
            document.getElementById('audPortaviones').play();
            break;
        case 'p21':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p21');
            document.getElementById('audPortaviones').play();
            break;
        case 'p31':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p31');
            document.getElementById('audPortaviones').play();
            break;   
        case 'p41':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p41');
            document.getElementById('audPortaviones').play();
            break; 
            //Fragata
        case 'f00':
            tablero[i][j] = 'F';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('f00');
            document.getElementById('audFragata').play();
            break;
        case 'f10':
            tablero[i][j] = 'F';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('f10');
            document.getElementById('audFragata').play();
            break;
        case 'f01':
            tablero[i][j] = 'F';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('f01');
            document.getElementById('audFragata').play();
            break;
        case 'f11':
            tablero[i][j] = 'F';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('f11');
            document.getElementById('audFragata').play();
            break;
            //Destructor
        case 'd00':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d00');
            document.getElementById('audDestructor').play();
            break;
        case 'd10':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d10');
            document.getElementById('audDestructor').play();
            break;
        case 'd20':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d20');
            document.getElementById('audDestructor').play();
            break;
        case 'd30':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d30');
            document.getElementById('audDestructor').play();
            break;
        case 'd01':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d01');
            document.getElementById('audDestructor').play();
            break;
        case 'd11':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d11');
            document.getElementById('audDestructor').play();
            break;
        case 'd21':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d21');
            document.getElementById('audDestructor').play();
            break;
        case 'd31':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d31');
            document.getElementById('audDestructor').play();
            break;
        default:
            disparos++;
            aciertos--;
            break;
    }
    $("#disparos").html(disparos+" disparos restantes.");
    }else{
        if(disparos<=0 || segundos <= 0){
            terminarPartida();    
        }        
        if(disparos<=0){
            $("#disparos").html("¡Disparos agotados!");
        }
        if(segundos<=0){
            $("#tiempo").html("¡Tiempo agotado!");
            
        }
    }
    
}
function terminarPartida(){
    //Calcular los puntos
    $("#puntos").val(aciertos*disparos*1000+segundos*500);
    $("#segundos").val(segundos);
    //Parar el timer (por disparos = 0 o hayamos hundido los barcos)
    clearInterval(timer);
    //Mostrar el diálogo para guardar los puntos
    $.afui.clearHistory();
    $.afui.loadContent("#formulario",false,false,"up");
}

function guardarPuntos(){
    // Cargamos los marcadores de localStorage
    var marcadores = JSON.parse(localStorage.getItem("marcadores"));
    // Si no existe, lo inicializamos.
    if (marcadores === null) {
        marcadores = [];        
    }
    
    // Ejemplo de cómo leer de un formulario a JSON
    var puntuacion = {
        "Nombre": $("#nombre").val(),
        "Puntos": $("#puntos").val(),
        "Tiempo": $("#segundos").val()
    };
    // Introducimos la puntuación en el array.
    marcadores.push(puntuacion);
    
    localStorage.setItem("marcadores",JSON.stringify(marcadores));
    mostrarPuntos();
}

function mostrarPuntos(){
    $("#puntuaciones").empty();
    // Cargamos los marcadores de localStorage
    var marcadores = JSON.parse(localStorage.getItem("marcadores"));
    // Si no existe, no hacemos nada.
    var tabla = $("<table id='tablaPuntuaciones' border='1px solid black' class='tablesorter'/>");
    tabla.append("<thead><th>nombre</th><th>puntos</th><th>tiempo</th></thead>");
    if (marcadores !== null) {
        var tbody = $("<tbody/>");
        for (var jugador in marcadores) {
            var tr = $("<tr />");
            tr.append("<td>"+marcadores[jugador].Nombre+"</td>");
            tr.append("<td>"+marcadores[jugador].Puntos+"</td>");
            tr.append("<td>"+marcadores[jugador].Tiempo+"</td>");
            tbody.append(tr);
        }
        tabla.append(tbody);
    } 
    $("#puntuaciones").append(tabla);
    //cuando la página se cargue convertimos la tabla con id "simple" en una tabla ordenable
    $("#tablaPuntuaciones").tablesorter({ sortList: [[1,1], [0,0]] });
    $.afui.clearHistory();
    $.afui.loadContent("#puntuaciones",false,false,"up");
    
}
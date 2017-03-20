/* jslint browser:true, devel:true */
/* global $:false */
    
//JSON con los barcos
//posteriormente lo almacenamos en localStorage
var barcos = null;


//Variable global para almacenar el tablero
//La matriz del tablero
var tablero = null;

var segundos = 30;
var segundosPorDefecto = segundos;
var timer;
var disparos = 34;
var aciertos = 0;
//Numero de barcos
var numeroFragatas = 1;
var numeroBuques = 1;
var numeroDestructores = 1;
var numeroPortaviones = 1;
var numeroSubmarinos = 1;
var filas = 8;
var columnas = 8;
//Funcion onReady para saber que la página/aplicación está preparada
function cargarConfiguracion(){
    $(document).ready(function(){
    //Código para el localstorage que usaremos para guardar la partida
    // ¿Hay localstorage dispobible? (Almacenamos la configuracion alli)
    if (typeof(Storage) !== "undefined") {
        barcos = JSON.parse(localStorage.getItem("barcos"));
        if (barcos === null){
            barcos = [
                {tam:2, letra:'f', nombre:'fragata'},
                {tam:3, letra:'b', nombre:'buque'},
                {tam:3, letra:'s', nombre:'submarino'},
                {tam:4, letra:'d', nombre:'destructor'},
                {tam:5, letra:'p', nombre:'portaaviones'},
            ];
            //crudBarcos();
            localStorage.setItem("barcos", JSON.stringify(barcos));
        }
        } else { //No hay localstorage
            console.log("No hay localstorage");
        }
        //Hacemos la misma comprobación para las filas y las columnas
        filas = parseInt(localStorage.getItem("filas1"));
        columnas = parseInt(localStorage.getItem("columnas"));
        segundos = parseInt(localStorage.getItem("segundos"));
        disparos = parseInt(localStorage.getItem("disparos"));
        if(isNaN(filas)){
            filas = 8;
            localStorage.setItem("filas", filas);
        }
        
        if(isNaN(columnas)){
            columnas = 8;
            localStorage.setItem("columnas", columnas);
        }
       
        if(isNaN(segundos)){
            segundos = 30;
            localStorage.setItem("segundos", segundos);
        }
        
        if(isNaN(disparos)){
            disparos = 34;
            localStorage.setItem("disparos", disparos);
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
var numeroBarcos = 0;
function colocarBarcos(matriz){
    //Compruebo que haya más de ocho filas y que la primera fila(igual a las demás) sean más de cargar columnas.
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
                        numeroBarcos++;                       
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
                        numeroBarcos++;
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
var tiempoPartida;
function callbackTimer(){
    // segundos = 30;
    //timer = document.getElementById("tiempo");
    if(segundos>0){
      $("#tiempo").html("Tiempo restante: "+segundos);
      segundos--;
      tiempoPartida = segundos;
    }else{
      $("#tiempo").html("¡Tiempo agotado!");
      terminarPartida();  
    }
}

/**
    Creamos la partida
*/

function crearPartida(){
    numeroBarcos = 0;
    aciertosBarcos = 0;
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
var aciertosBarcos = 0;
function disparo(celda,i,j){
    if(disparos>0 && segundos>0){
        disparos--;
        aciertos++;
        console.log(aciertosBarcos);
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
            aciertosBarcos++;
            break;
        case 'b10':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b10');
            document.getElementById('audBuque').play();
            aciertosBarcos++;
            break;
        case 'b20':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b20');
            document.getElementById('audBuque').play();
            aciertosBarcos++;
            break;
        case 'b01':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b01');
            document.getElementById('audBuque').play();
            aciertosBarcos++;
            break;
        case 'b11':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b11');
            document.getElementById('audBuque').play();
            aciertosBarcos++;
            break;
        case 'b21':
            tablero[i][j] = 'B';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('b21');
            document.getElementById('audBuque').play();
            aciertosBarcos++;
            break;
        //Submarino
        case 's00':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s00');
            document.getElementById('audSubmarino').play();
            aciertosBarcos++;
            break;
        case 's10':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s10');
            document.getElementById('audSubmarino').play();
            aciertosBarcos++;
            break;
        case 's20':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s20');
            document.getElementById('audSubmarino').play();
            aciertosBarcos++;
            break;
        case 's01':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s01');
            document.getElementById('audSubmarino').play();
            aciertosBarcos++;
            break;
        case 's11':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s11');
            document.getElementById('audSubmarino').play();
            aciertosBarcos++;
            break;
        case 's21':
            tablero[i][j] = 'S';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('s21');
            document.getElementById('audSubmarino').play();
            aciertosBarcos++;
            break;
        //Portaviones
         case 'p00':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p00');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break;
        case 'p10':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p10');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break;
        case 'p20':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p20');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break;
        case 'p30':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p30');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break;
        case 'p40':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p40');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break;
        case 'p01':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p01');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break;
        case 'p11':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p11');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break;
        case 'p21':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p21');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break;
        case 'p31':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p31');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break;   
        case 'p41':
            tablero[i][j] = 'P';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('p41');
            document.getElementById('audPortaviones').play();
            aciertosBarcos++;
            break; 
            //Fragata
        case 'f00':
            tablero[i][j] = 'F';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('f00');
            document.getElementById('audFragata').play();
            aciertosBarcos++;
            break;
        case 'f10':
            tablero[i][j] = 'F';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('f10');
            document.getElementById('audFragata').play();
            aciertosBarcos++;
            break;
        case 'f01':
            tablero[i][j] = 'F';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('f01');
            document.getElementById('audFragata').play();
            aciertosBarcos++;
            break;
        case 'f11':
            tablero[i][j] = 'F';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('f11');
            document.getElementById('audFragata').play();
            aciertosBarcos++;
            break;
            //Destructor
        case 'd00':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d00');
            document.getElementById('audDestructor').play();
            aciertosBarcos++;
            break;
        case 'd10':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d10');
            document.getElementById('audDestructor').play();
            aciertosBarcos++;
            break;
        case 'd20':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d20');
            document.getElementById('audDestructor').play();
            aciertosBarcos++;
            break;
        case 'd30':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d30');
            document.getElementById('audDestructor').play();
            aciertosBarcos++;
            break;
        case 'd01':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d01');
            document.getElementById('audDestructor').play();
            aciertosBarcos++;
            break;
        case 'd11':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d11');
            document.getElementById('audDestructor').play();
            aciertosBarcos++;
            break;
        case 'd21':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d21');
            document.getElementById('audDestructor').play();
            aciertosBarcos++;
            break;
        case 'd31':
            tablero[i][j] = 'D';
            $("#"+celda).removeClass('vacio');
            $("#"+celda).addClass('d31');
            document.getElementById('audDestructor').play();
            aciertosBarcos++;
            break;
        default:
            disparos++;
            aciertos--;
            break;
    }
    mostrarVictoria();
    $("#disparos").html(disparos+" disparos restantes.");
    }else{
        if(disparos<0 || segundos < 0){
            terminarPartida();    
        }        
        if(disparos<0){
            $("#disparos").html("¡Disparos agotados!");
        }
        if(segundos<0){
            $("#tiempo").html("¡Tiempo agotado!");
            
        }
    }
    
}
/**
    Función que lanza la puntuación y muestra en pantalla el div para guardar tu nombre y tu puntuación.
*/
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
var puntuacion;
/**
    Función que nos permite guardar el arrays de marcadores en el localstorage para guardar las puntuaciones.
*/
function guardarPuntos(){
    // Cargamos los marcadores de localStorage
    var marcadores = JSON.parse(localStorage.getItem("marcadores"));
    // Si no existe, lo inicializamos.
    if (marcadores === null) {
        marcadores = [];        
    }
    
    // Ejemplo de cómo leer de un formulario a JSON
    puntuacion = {
        "Nombre": $("#nombre").val(),
        "Puntos": $("#puntos").val(),
        "Tiempo": $("#segundos").val()
    };
    // Introducimos la puntuación en el array.
    marcadores.push(puntuacion);
    
    localStorage.setItem("marcadores",JSON.stringify(marcadores));
    mostrarPuntos();
}

var tabla;
/**
    Función que nos permitirá mostrar los puntos al usuario mediante la creación e inyeccion en el codigo
    de una tabla.
*/
function mostrarPuntos(){
    $("#puntuaciones").empty();
    // Cargamos los marcadores de localStorage
    var marcadores = JSON.parse(localStorage.getItem("marcadores"));
    // Si no existe, no hacemos nada.
    tabla = $("<table id='tablaPuntuaciones' class='tablesorter table table-bordered'/>");
    tabla.append("<thead><th>Nombre</th><th>Puntuación</th><th>Tiempo</th></thead>");
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
/**
    Funcion que nos permitirá guardar la configuración requerida por el usuario (nº barcos, filas, columnas, étc.) según un formulario.
*/

function guardarConfiguracion(){
    /** Por si quisieramos modificar el tiempo/disparos/etc
    segundosPorDefecto = $("#tiempoJuego").val();
    localStorage.setItem("segundos", segundosPorDefecto); 
    disparos = $("#numeroDisparos").val();
    localStorage.setItem("disparos", disparos);
    filas = $("#numeroFilas").val();
    localStorage.setItem("filas1", filas);
    columnas = $("#numeroColumnas").val();
    localStorage.setItem("columnas", columnas);
        console.log("::::::Modificados valores::::::");
        console.log("Nº columnas: "+columnas);
        console.log("Nº filas: "+filas);
        console.log("Nº segundos: "+segundosPorDefecto);
        console.log("Nº disparos: "+disparos);
    */
    numeroFragatas = $("#numeroFragatas").val();
    numeroBuques = $("#numeroBuques").val();
    numeroDestructores = $("#numeroDestructores").val();
    numeroPortaviones = $("#numeroPortaviones").val();
    numeroSubmarinos = $("#numeroSubmarinos").val();
    var sumaTotal = parseInt(numeroBuques) + parseInt(numeroDestructores) + parseInt(numeroFragatas) + parseInt(numeroPortaviones) + parseInt(numeroSubmarinos);
    if(sumaTotal > 0){
        filas = sumaTotal + 3;
        localStorage.setItem("filas1", filas);
        columnas = sumaTotal + 3;
        localStorage.setItem("columnas", columnas);
        segundosPorDefecto = sumaTotal * 6;
        localStorage.setItem("segundos", segundosPorDefecto); 
        disparos = sumaTotal * 7;
        localStorage.setItem("disparos", disparos);
        
    } else{
        establecerConfiguracionPredeterminada();
    }
    cargarConfiguracionActual();
    crudBarcos();
}
/**
    Función que nos permite coger los valores del formulario y mostrarlos en otro formulario tipo "disabled" al usuario, sólo para información.
*/
function cargarConfiguracionActual(){
    clearInterval(timer);
    //Establecer valores
    $("#tiempoJuego2").val(segundosPorDefecto);
    $("#numeroDisparos2").val(disparos);
    $("#numeroFilas2").val(filas);
    $("#numeroColumnas2").val(columnas);
    $("#numeroFragatas2").val(numeroFragatas);
    $("#numeroBuques2").val(numeroBuques);
    $("#numeroDestructores2").val(numeroDestructores);
    $("#numeroPortaviones2").val(numeroPortaviones);
    $("#numeroSubmarinos2").val(numeroSubmarinos); 
}

/**
    Función que nos agregará a un nuevo arrays el número de barcos que el usuario haya insertado en el formulario
    y dicho contenido del nuevo arrays lo guardaremos en el localstorage de "barcos".
*/
function crudBarcos(){
    var i;
    var barcos2 = [];
    //barcos2 = JSON.parse(localStorage.getItem("barcos"));
    if(numeroBuques > 0){
        for(i = 0;i<numeroBuques;i++){
            barcos2.push({"tam":3, letra:'b', nombre:'buque'}); //barcos2.push
        }
    }
    if(numeroFragatas > 0){
        for(i = 0;i<numeroFragatas;i++){
            barcos2.push({tam:2, letra:'f', nombre:'fragata'});
        }
    }
    if(numeroDestructores > 0){
        for(i = 0;i<numeroDestructores;i++){
            barcos2.push({tam:4, letra:'d', nombre:'destructor'});
        }
    }
    if(numeroSubmarinos > 0){
        for(i = 0;i<numeroSubmarinos;i++){
            barcos2.push({tam:3, letra:'s', nombre:'submarino'});
        }
    }
    if(numeroPortaviones > 0){
        for(i = 0;i<numeroPortaviones;i++){
            barcos2.push({tam:5, letra:'p', nombre:'portaaviones'});
        }
    }
    localStorage.setItem("barcos", JSON.stringify(barcos2));
    console.log(localStorage.getItem("barcos"));    
}

//Funcion que acabará la partida si descubrimos todos los barcos.

function mostrarVictoria(){
    if(aciertosBarcos == numeroBarcos){
        terminarPartida();
        numeroBarcos = 0;
    }
}

/**
    Al cambiar de página tenía los problemas de audio que se seguía reproduciendo y el tiempo no se paraba, con esta función conseguí arreglarlo.
*/
function cambiarDePagina(){
    document.getElementById('audio').pause();
    clearInterval(timer);
    numeroBarcos = 0;
    aciertosBarcos = 0;
}

//Funcion que mediante el callback recoge el valor del tiempo lo para y lo reinicia según el gusto del usuario.
function pararJuegoReiniciarJuego(){
    var añadirHtml = "";
    if($("#botonPausa").hasClass("porDefecto")){
        console.log("Juego pausado");
        clearInterval(timer);
        añadirHtml = "Reanudar tiempo";
        document.getElementById("botonPausa").innerHTML = añadirHtml;
        $("#botonPausa").removeClass('porDefecto');
        $("#botonPausa").addClass('enPausa');
        $("#tabla").addClass('hidden');
    } else{
        console.log("Juego reanudado");
        segundos = tiempoPartida;
        timer = setInterval(callbackTimer,1000);
        añadirHtml = "Parar tiempo";
        document.getElementById("botonPausa").innerHTML = añadirHtml;
        $("#botonPausa").removeClass('enPausa');
        $("#botonPausa").addClass('porDefecto');
        $("#tabla").removeClass('hidden');
    }
}

/**
    Esta función permite al usuario en la pantalla de configuración elegir los valores predeterminados por la aplicación para jugar (tiempo, disparos, barcos, étc.). Se activará mediante un botón en la configuración.
*/
function establecerConfiguracionPredeterminada(){
    var barcos3 = [];
    $("#tiempoJuego2").val("30");
    localStorage.setItem("segundos", 30); 
    $("#numeroDisparos2").val("34");
    localStorage.setItem("disparos", 34);
    $("#numeroFilas2").val("8");
    localStorage.setItem("filas1", 8);
    $("#numeroColumnas2").val("8");
    localStorage.setItem("columnas", 8);
    $("#numeroFragatas2").val("1");
    barcos3.push({tam:2, letra:'f', nombre:'fragata'});
    $("#numeroBuques2").val("1");
    barcos3.push({"tam":3, letra:'b', nombre:'buque'});
    $("#numeroDestructores2").val("1");
    barcos3.push({tam:4, letra:'d', nombre:'destructor'});
    $("#numeroPortaviones2").val("1");
    barcos3.push({tam:5, letra:'p', nombre:'portaaviones'});
    $("#numeroSubmarinos2").val("1"); 
    barcos3.push({tam:3, letra:'s', nombre:'submarino'});
    localStorage.setItem("barcos", JSON.stringify(barcos3));
}
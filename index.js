// Prérequis et constantes
 
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');


var path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Initialisation des variables

var plateaux = [];
var plateauxRegie = [];
var prochain = 000000;

var compteurBouton = 1000; // Pour donner un nouveau numéro séquentiel à chaque bouton :

let regies = require('./regies.json');


var jetonDieu = Math.floor(100000000 + Math.random() * 900000000);




// Générateurs de jetons (bouton)
// Pour avoir toujours un nouveau numéro de plateau :

function nouveauProchain() {
	prochain = Math.floor(100000 + Math.random() * 900000);
	var trouveBouton = plateaux.findIndex(plateau => plateau.numeroBouton === prochain);
	if (trouveBouton > 0) {
		nouveauProchain();
	}
};
nouveauProchain();






// SERVEUR
// C'est le serveur qui s'occupe de diriger les joueurs vers leurs plateaux

var serveur = io
	.of('/')
	.on('connection', function(socket){

	console.log('connexion');


    socket.on('plateauPlein', function(msg){
    	console.log("recu plateau plein");
		global["console_" + msg.noPlateau].estPlein = 1;
	});


	// ACCUEIL D'UN JOUEUR 
	// Réception d'un signal id_joueur
	socket.on('id_joueur', function(msg){

	console.log(msg.cherchePlateau);

	var cherchePlateau = plateaux.findIndex(function(obj) {
		return obj.numeroBouton == msg.cherchePlateau; 
	});

		// Si le plateau existe, et qu'il est encore ouvert aux connexions
		if (plateaux[cherchePlateau] === undefined) {
			socket.emit('non_merci', 'ce plateau n\'existe pas.')
			console.log('non_merci, plateau inexistant:', cherchePlateau);
		} else if (plateaux[cherchePlateau].estPlein == 1) {
			socket.emit('non_merci', 'ce plateau est fermé');
			console.log('non_merci, plateau fermé');
		} else {
			socket.emit('bienvenue',  {numeroPlateau: cherchePlateau, nomJuge: plateaux[cherchePlateau].nomJuge});
			console.log('Bouton ', msg.noSeqBouton, ' attribué à ', msg.nomJoueur, ' qui cherche le plateau ', cherchePlateau);
		};
	});


	// DÉCONNEXION D'UN JOUEUR
	// Quand un joueur se déconnecte
	socket.on('disconnect', function(){
		// si sur un plateau
		
		// sinon
	});
});





// Code de feuilles de pointage, désactivé pour le moment.


// var csvResultats = "'plateau', 'id. du match', 'nom équipe A', 'score équipe A', 'nom équipe B', 'score équipe B', 'heure', 'nom', 'equipe', 'score', 'nom', 'equipe', 'score', 'nom', 'equipe', 'score', 'nom', 'equipe', 'score', 'nom', 'equipe', 'score', 'nom', 'equipe', 'score', 'nom', 'equipe', 'score', 'nom', 'equipe', 'score', 'nom', 'equipe', 'score', 'nom', 'equipe', 'score'";

// function ajoutResultat(aAjouter) {
// 	csvResultats += "\n" + aAjouter;
// 	console.log(csvResultats);
// };








function creerConsole(compteurConsole, numeroBouton, nomJuge, nomRegie) {

	plateaux[compteurConsole] = {};

	plateaux[compteurConsole].numeroBouton = numeroBouton;
	plateaux[compteurConsole].nomJuge = nomJuge;
	plateaux[compteurConsole].nomRegie = nomRegie;
	plateaux[compteurConsole].etatBouton = 0;
	plateaux[compteurConsole].droitReponse = '';
	plateaux[compteurConsole].estPlein = 0;
	plateaux[compteurConsole].numeroConsole = compteurConsole;

	plateaux[compteurConsole].proprio = '';
	plateaux[compteurConsole].messageJuge = '';




	//app.get('/' + numeroConsole, function(req, res) {
   // 	res.render('console', { noPlateau: numeroConsole, nomJuge: nomJuge });    	
	//});



	global["plateau_" + compteurConsole] = io
		.of('/' + compteurConsole)
		.on('connection', function(socket){
			console.log(compteurConsole, "connexion")
    		
    		socket.on('debuzz', function(){
    			socket.broadcast.emit('auJeu');
    			socket.emit('auJeu');
    			
    			console.log(compteurConsole, 'debuzz');
				plateaux[compteurConsole].etatBouton = 0;    			
    		});
    		
    		socket.on('allo', function(msg){
    			console.log(compteurConsole, 'allo de ', msg.nomJoueur);	    							
    			socket.broadcast.emit('allo', msg);	

    		});
    		
    		socket.on('rouvert', function(msg){
    			console.log(compteurConsole, 'rouvert :  ', msg.noPlateau);	    							
    			plateaux[msg.noPlateau].estPlein = 0;

    		});
    		
    		socket.on('ferme', function(msg){
    			console.log(compteurConsole, 'rouvert :  ', msg.noPlateau);	    							
    			plateaux[msg.noPlateau].estPlein = 1;

    		});
    		
    		
    		

    		socket.on('signal', function(msg) {
				console.log(compteurConsole, `signal ${msg.nomJoueur} (${msg.noSeqBouton})`);
				if (plateaux[compteurConsole].etatBouton == 0) {
			  		plateaux[compteurConsole].etatBouton = 1;
			  		plateaux[compteurConsole].droitReponse = msg.nomJoueur;
			  		socket.emit('aToi');
		  			socket.broadcast.emit('bloque');
		  			socket.broadcast.emit('droitReponse', msg.noSeqBouton);
		  			console.log(compteurConsole, 'droitReponse', plateaux[compteurConsole].droitReponse);	
		  			}
  
			});

    		// socket.on('ajoutResultat', function(msg){    			
			// 	ajoutResultat(msg);
			//	console.log(compteurConsole, 'recu resultats');

    		// });
    		
    	
    	    	
	});
	

	
	console.log("Console numéro ", compteurConsole, " créée pour ", nomJuge, "bouton no ", plateaux[compteurConsole].numeroBouton);
prochaineConsole = plateaux.length;

	let data = JSON.stringify(plateaux);
	fs.writeFileSync('plateaux.json', data);

	console.log(plateaux);

	console.log(prochaineConsole);
nouveauProchain();
	
};


function detruireConsole(numeroConsole) {
	// delete plateaux[numeroConsole];
	// causait un bogue de numérotation
	// alors on l'attribue à personne
	
	plateaux[numeroConsole].nomRegie = "personne";
	console.log("Console ", numeroConsole, " détruite");
	
	let data = JSON.stringify(plateaux);
	fs.writeFileSync('plateaux.json', data);
};



// ROUTAGE DU SERVEUR WEB

// Fichiers statiques
	app.get('/chemin.js', function(req, res){
	  res.sendFile(__dirname + '/chemin.js');
	}); 

	app.get('/ding.wav', (req, res) => res.sendFile('/ding.wav', { root : __dirname}));

	app.get('/', (req, res) => res.sendFile('/index.html', { root : __dirname}));


// Boutons
	app.get('/bouton', function(req, res){
		res.render('bouton', { noSeqBouton: compteurBouton });
		console.log('bouton ', compteurBouton);
		compteurBouton += 1;
	});



// pseudo-API de régie
	app.get('/regie/:nomRegie/:jetonRegie', function(req, res) {
		
		// validation de la présence de la régie		
		var trouveRegie = regies.findIndex(function(obj) {
			return obj.nomRegie === req.params.nomRegie; 
		});

		if (regies[trouveRegie].jetonRegie == req.params.jetonRegie) {
			//plateauxRegie = //trouve plateaux pour celle-ci;
			
			
			plateauxRegie = plateaux.filter(function (el) {
			  return el.nomRegie == req.params.nomRegie;
 			});
			
			
		   	res.render('regie', { plateaux: plateauxRegie, nomRegie: req.params.nomRegie, jetonRegie: req.params.jetonRegie })

	} else {
		console.log("404ish")
		
		res.send('oupelaille')		
	}    
		
		
		
		
	});


	app.get('/regie/:nomRegie/:jetonRegie/creer/:nomJuge', function (req, res, next) {

		// validation de la présence de la régie		
		var trouveRegie = regies.findIndex(function(obj) {
			return obj.nomRegie === req.params.nomRegie; 
		});

		if (regies[trouveRegie].jetonRegie == req.params.jetonRegie) {
			//plateauxRegie = //trouve plateaux pour celle-ci;
			
			
			plateauxRegie = plateaux.filter(function (el) {
			  return el.nomRegie == req.params.nomRegie;
 			});
			
			
		creerConsole(prochaineConsole, prochain, req.params.nomJuge, req.params.nomRegie)
		res.redirect('/regie/' + req.params.nomRegie + '/' + req.params.jetonRegie)

	} else {
		console.log("404ish")
		
		res.send('oupelaille')
		
	}    
		



	});

	app.get('/regie/:nomRegie/:jetonRegie/detruire/:numero', function (req, res, next) {
	
	
	
		// validation de la présence de la régie		
		var trouveRegie = regies.findIndex(function(obj) {
			return obj.nomRegie === req.params.nomRegie; 
		});

		if (regies[trouveRegie].jetonRegie == req.params.jetonRegie) {
			//plateauxRegie = //trouve plateaux pour celle-ci;
			
			
			plateauxRegie = plateaux.filter(function (el) {
			  return el.nomRegie == req.params.nomRegie;
 			});
			
			
		detruireConsole(req.params.numero)
		res.redirect('/regie/' + req.params.nomRegie + '/' + req.params.jetonRegie)

	} else {
		console.log("404ish")
		
		res.send('oupelaille')
		
	}    
	
	
	

	});


// app.get('/' + mdpRegie + '/resultats.csv', function (req, res, next) {
//	res.set('Content-Type', 'application/octet-stream');
//	res.send(csvResultats);
// });




	app.get('/dieu/:verifJeton', function(req, res) {
		
		if (req.params.verifJeton == jetonDieu) {
	   	res.render('dieu', { regies: regies, jetonDieu: jetonDieu})

	} else {
		console.log("404ish")
		
		res.send('oupelaille')
		
	}    
		
		
	});
		
	app.get('/dieu/:verifJeton/creerRegie/:nomRegie/:adresseCourriel/:jetonRegie', function(req, res) {
	
	
		if (req.params.verifJeton == jetonDieu) {


		regies.push({nomRegie: req.params.nomRegie, jetonRegie: req.params.jetonRegie, adresseCourriel: req.params.adresseCourriel})
		res.redirect('/dieu/'+jetonDieu)

	} else {
		console.log("404ish")
		
		res.send('oupelaille')
		
	}    	
	
	});		
	
	app.get('/dieu/:verifJeton/detruireRegie/:jetonRegie', function(req, res) {
	
	


		res.redirect('/dieu/'+jetonDieu)
	
	});		
		



	app.get('/tousplateaux', function(req, res) {
		   	res.render('regie', { plateaux: plateaux, nomRegie: 'fmg', jetonRegie: 2984 })
		});
		






app.get('/console/:nomRegie/:nomConsole', function(req, res) {

plateauxRegie = plateaux.filter(function (el) {
			  return el.nomRegie == req.params.nomRegie;
 			});

var trouveConsole = plateauxRegie.findIndex(function(obj) {
	return obj.nomJuge === req.params.nomConsole; 
	});

	if (plateauxRegie[trouveConsole]) {
	   	res.render('console', { noPlateau: plateauxRegie[trouveConsole].numeroConsole, numeroBouton: plateauxRegie[trouveConsole].numeroBouton, nomJuge: plateauxRegie[trouveConsole].nomJuge, nomRegie: plateauxRegie[trouveConsole].nomRegie })
	} else {
		console.log("404ish")
	}    	
});


http.listen(80, function(){
  console.log('serveur, port 80');
 });






let reprisePlateaux = require('./plateaux.json');
let nombrePlateau = 0;

reprisePlateaux.forEach(function(rpPl){
	if (rpPl.nomRegie != "personne") {
		creerConsole(nombrePlateau, rpPl.numeroBouton, rpPl.nomJuge, rpPl.nomRegie);
		console.log(nombrePlateau);
		nombrePlateau += 1;
		console.log(nombrePlateau);
	};
});

// pour la résilience en cas de redémarrage
var prochaineConsole = plateaux.length;


console.log("jeton Dieu :")
console.log(jetonDieu);
describe("Fonctions générique", function() {
    it("calcule du nombre de chiffre dans un nombre", function() {
        expect(nombreDeChiffreDansCeNombre(191097375)).toBe(9);
    });
    it("découpe un nombre en bloc de 3 chiffres en partant des unités", function() {
        nombreDecoupee = decoupeLeNombreParSerieDe_N_Chiffre(91097375, 3);
        expect(nombreDecoupee[0]).toBe('91');
        expect(nombreDecoupee[1]).toBe('097');
        expect(nombreDecoupee[2]).toBe('375');
    });
    it("retroune le dernier élément d'un tableau", function() {
        var monTableau = new Array();
        monTableau.push(5);
        monTableau.push(3);
        monTableau.push(4);
        expect(monTableau.last()).toBe(4);
    });
    it("calcule la somme d'un tableau à contenu numérique", function() {
        var monTableau = new Array();
        monTableau.push(5);
        monTableau.push(3);
        monTableau.push(4);
        expect(monTableau.sum()).toBe(12);
    });

    describe("conversion de nombre", function() {
        it("en tronquant à 3 chiffres significatif", function() {
            expect(tronquerA_N_ChiffresSignificatif(191097375, 3)).toBe(191000000);
        });
        it("en tronquant à 2 chiffres significatif", function() {
            expect(tronquerA_N_ChiffresSignificatif(191097375, 2)).toBe(190000000);
        });
        it("en tronquant à 1 chiffres significatif", function() {
            expect(tronquerA_N_ChiffresSignificatif(191097375, 1)).toBe(100000000);
        });
        it("envoi une exeption à 0 chiffres significatif", function() {
            expect(function(){tronquerA_N_ChiffresSignificatif(191097375, 0)}).toThrow();
        });
    });
    
    describe("Pour normaliser les entrées utilisateur on converti leurs entrées en nombre entier", function() {
        it("en supprimant les espaces", function() {
            expect(supprimeLesEspaces(' 100 000 000')).toBe('100000000');
            expect(supprimeLesEspaces('50 tdc')).toBe('50tdc');
        });
        it("en convertissant les préfixe numérique (k, M, G, T...) en le nombre de 0 adéquoit", function() {
            expect(convertiLesPrefixesNumeriqueEnNombre('10k')).toBe('10000');
            expect(convertiLesPrefixesNumeriqueEnNombre('9M')).toBe('9000000');
            expect(convertiLesPrefixesNumeriqueEnNombre('8G')).toBe('8000000000');
        });
        it("en supprimant tout les caractères non numérique restant", function() {
            expect(str2int('50 tdc')).toBe(50);
            expect(str2int('nombre : 50 tdc')).toBe(50);
        });
        it("en tronquant ce qu'il y a après la virgule", function() {
            expect(str2int('360,9')).toBe(360);
            expect(str2int('1.9')).toBe(1);
        });
    });
});

describe("Dans l'applicatif métier on trouve :", function() {
    describe("Une fourmilière", function() {
        it("existe", function() {
            expect(new Fourmiliere()).toBeDefined();
        });
        it("a du terrain de chasse (tdc)", function() {
            var tdc = 100;
            var maFourmiliere = new Fourmiliere(tdc);
            expect(maFourmiliere.tdc).toBe(100);
        });
        it("peut se cloner", function() {
            var tdc = 100;
            var maFourmiliere = new Fourmiliere(tdc);
            var leClone = maFourmiliere.clone();
            for (var propriete in maFourmiliere){
                if (typeof(maFourmiliere[propriete]) == typeof(function(){}) ) continue;
                expect(maFourmiliere[propriete]).toBe(leClone[propriete]);
            }
            leClone.tdc = 50;
            expect(maFourmiliere.tdc).toBe(100);
            expect(leClone.tdc).toBe(50);
        });
    });
    
    describe("Un flood unique", function() {
        var leFloodeur;
        var laCible;
        beforeEach(function() {
            leFloodeur = new Fourmiliere(100);
            laCible = new Fourmiliere(100);
        });
        
        it("envoi une exeption si la cible est trop petite pour être atteinte (tdc cible <=50% du tdc floodeur)", function() {
            leFloodeur.tdc = 1000;
            laCible.tdc = 500;
            expect(function(){leFloodeur.calculLeProchainFloodSur(laCible);}).toThrow(new RangeError('tdc de la cible <= 50% de celui du flooder'));
        });
        it("envoi une exeption si la cible est trop grande pour être atteinte (tdc cible >300% du tdc floodeur)", function() {
            laCible.tdc = 301;
            expect(function(){leFloodeur.calculLeProchainFloodSur(laCible);}).toThrow(new RangeError('cible trop grande'));
        });
        it("envoi une exeption si la cible a 50 ou moins de tdc", function() {
            leFloodeur.tdc = 80;
            laCible.tdc = 50;
            expect(function(){leFloodeur.calculLeProchainFloodSur(laCible);}).toThrow(new RangeError('tdc de la cible <= 50'));
        });
    
        it("flood toujours d'un nombre entier", function() {
            laCible.tdc = 99;
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(19);
            leFloodeur.tdc = 1000;
            laCible.tdc = 550;
        });
        it("flood 20% du tdc cible", function() {
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(20);
        });
        it("si la cible se retrouve hors porté après un flood, réduire le flood en conséquence", function() {
            leFloodeur.tdc = 999;
            laCible.tdc = 550;
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(33);
            leFloodeur.tdc = 80;
            laCible.tdc = 55;
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(9);
            leFloodeur.tdc = 953154136;
            laCible.tdc = 489209281;
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(8421474);
            
        });
        it("si la cible est déjà presque hors porté, la flooder de 20%", function() {
            leFloodeur.tdc = 999;
            laCible.tdc = 500;
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(100);
            leFloodeur.tdc = 80;
            laCible.tdc = 51;
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(10);
        });
    });
    describe("Un flood unique anti-traçeur", function() {
        var leFloodeur;
        var laCible;
        beforeEach(function() {
            leFloodeur = new Fourmiliere(486876541, 5);
            laCible = new Fourmiliere(955486876);
        });
        it("arrondi le résultat du flood pour ne pas être repéré", function() {
            leFloodeur.niveauDeDiscretion=5
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(100000000); // précision global 1
            
            leFloodeur.niveauDeDiscretion=4
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(190000000); // précision global 1
            
            leFloodeur.niveauDeDiscretion=3
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(191097375); // précision global 1
            
            leFloodeur.niveauDeDiscretion=2
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(190000000); // précision global 2
            
            leFloodeur.niveauDeDiscretion=1
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(191097375); // précision global 2
            
            leFloodeur.niveauDeDiscretion=0
            expect(leFloodeur.calculLeProchainFloodSur(laCible)).toBe(191097375);
            
        });
    });
    describe("Un optimisateur de flood complet", function() {
        var leFloodeur;
        var laCible;
        beforeEach(function() {
            leFloodeur = new Fourmiliere(486876541, 0);
            laCible = new Fourmiliere(955486876);
        });
        it("qui retourne un objet Floods", function() {
            expect(typeof(leFloodeur.calculLesFloodSur(laCible))).toBe(typeof(new Floods()));
        });
        /*
        it("qui flood tant que la cible est à portée", function() {
            expect(leFloodeur.calculLesFloodSur(laCible)).toBe(new Flood());
        });
        it("qui arrondissant chaque flood selon le niveau de discretion", function() {
        });
        it("qui arrondissant le total de la série de flood", function() {
        });
        */
        it("qui laisse leFloodeur et laCible au tdc final", function() {
            leFloodeur.calculLesFloodSur(laCible);
            expect(leFloodeur.tdc).toBe(1057733171);
            expect(laCible.tdc).toBe(384630246);
        });
    });
    describe("Un gestionnaire de floods", function() {
        var leFloodeur;
        var laCible;
        var serieDeFloods;
        beforeEach(function() {
            leFloodeur = new Fourmiliere(486876541, 0);
            laCible = new Fourmiliere(955486876);
            serieDeFloods = new Floods(leFloodeur, laCible);
        });
        it("qu'on peu initialiser en lui fournissant une fourmilière d'origine et une fourmilière d'arrivée des floods", function() {
            expect(function () {new Floods(leFloodeur, laCible)}).not.toThrow();
        });
        it("qui peut calculer un flood", function() {
            expect(serieDeFloods.flood()).toBe(191097375);
        });
        it("qui peut mémoriser le niveau de tdc du floodeur après chaque flood", function() {
            serieDeFloods.flood();
            serieDeFloods.flood();
            expect(serieDeFloods.etatsDufloodeur[0].tdc).toBe(486876541);
            expect(serieDeFloods.etatsDufloodeur[1].tdc).toBe(677973916);
            expect(serieDeFloods.etatsDufloodeur[2].tdc).toBe(830851816);
        });
        it("qui peut mémoriser le niveau de tdc de la cible après chaque flood", function() {
            serieDeFloods.flood();
            serieDeFloods.flood();
            expect(serieDeFloods.etatsDeLaCible[0].tdc).toBe(955486876);
            expect(serieDeFloods.etatsDeLaCible[1].tdc).toBe(764389501);
            expect(serieDeFloods.etatsDeLaCible[2].tdc).toBe(611511601);
        });
        it("qui peut mémoriser plusieurs floods successif", function() {
            serieDeFloods.flood();
            serieDeFloods.flood();
            expect(serieDeFloods.getFlood(1)).toBe(191097375);
            expect(serieDeFloods.getFlood(2)).toBe(152877900);
        });
        it("qui peut enchainer les flood tant que possible", function() {
            serieDeFloods.enchainerLesFloods();
            expect(serieDeFloods.etatsDufloodeur.last().tdc).toBe(1057733171);
            expect(serieDeFloods.etatsDeLaCible.last().tdc).toBe(384630246);
        });
        it("qui peut indiquer combien de Flood il à calculé", function() {
            serieDeFloods.enchainerLesFloods();
            expect(serieDeFloods.nombreDeFlood()).toBe(5);
        });
        it("qui peut calculer le ratio de tdc entre cible et floodeur", function() {
            leFloodeur = new Fourmiliere(1000, 0);
            laCible = new Fourmiliere(2000);
            serieDeFloods = new Floods(leFloodeur, laCible);
            expect(serieDeFloods.ratio()).toBe(2);
        });
        
        it("(vérification de la précision de l'algo de flood optimisé sur des gros flood)", function() {
            serieDeFloods.enchainerLesFloods();
            expect(serieDeFloods.ratio(0)).toBeGreaterThan(1.9);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-2)).toBeGreaterThan(0.5);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-2)).toBeLessThan(0.505);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-1)).toBeLessThan(0.38);
        });
        it("(vérification de la précision de l'algo de flood optimisé sur des petit flood)", function() {
            leFloodeur = new Fourmiliere(50, 0);
            laCible = new Fourmiliere(123);
            serieDeFloods = new Floods(leFloodeur, laCible);
            serieDeFloods.enchainerLesFloods();
            expect(serieDeFloods.ratio(0)).toBeGreaterThan(1.9);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-2)).toBeGreaterThan(0.5);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-2)).toBeLessThan(0.515);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-1)).toBeLessThan(0.38);
        });
        /*
        it("(vérification de la précision de l'algo de flood optimisé sur un pannel de nombre aléatoire)", function() {
            
            var echelleDeNombre = 100;
            var tdcCible = 51 + Math.round(Math.random()*echelleDeNombre);
            laCible = new Fourmiliere(tdcCible);
            tdcFloodeur = Math.round(Math.random()*(tdcCible*2-tdcCible/3) + tdcCible/3);
            leFloodeur = new Fourmiliere(tdcFloodeur, 0);
            serieDeFloods = new Floods(leFloodeur, laCible);
            serieDeFloods.enchainerLesFloods();
            console.log(tdcFloodeur+'->'+tdcCible+'('+serieDeFloods.ratio().toFixed(4)+') ... '
            +'Seuil : '+serieDeFloods.etatsDufloodeur[serieDeFloods.floods.length-2].tdc+'->'+serieDeFloods.etatsDeLaCible[serieDeFloods.floods.length-2].tdc+'('+serieDeFloods.ratio(serieDeFloods.floods.length-2).toFixed(4)+') ... '
            +'Final : '+serieDeFloods.etatsDufloodeur[serieDeFloods.floods.length-1].tdc+'->'+serieDeFloods.etatsDeLaCible[serieDeFloods.floods.length-1].tdc+'('+serieDeFloods.ratio(serieDeFloods.floods.length-1).toFixed(4)+')')
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-2)).toBeGreaterThan(0.5);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-2)).toBeLessThan(0.505);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-1)).toBeLessThan(0.38);

            echelleDeNombre = echelleDeNombre * 10;
            var tdcCible = 51 + Math.round(Math.random()*echelleDeNombre);
            laCible = new Fourmiliere(tdcCible);
            tdcFloodeur = Math.round(Math.random()*(tdcCible*2-tdcCible/3) + tdcCible/3);
            leFloodeur = new Fourmiliere(tdcFloodeur, 0);
            serieDeFloods = new Floods(leFloodeur, laCible);
            serieDeFloods.enchainerLesFloods();
            console.log(tdcFloodeur+'->'+tdcCible+'('+serieDeFloods.ratio().toFixed(4)+') ... '
            +'Seuil : '+serieDeFloods.etatsDufloodeur[serieDeFloods.floods.length-2].tdc+'->'+serieDeFloods.etatsDeLaCible[serieDeFloods.floods.length-2].tdc+'('+serieDeFloods.ratio(serieDeFloods.floods.length-2).toFixed(4)+') ... '
            +'Final : '+serieDeFloods.etatsDufloodeur[serieDeFloods.floods.length-1].tdc+'->'+serieDeFloods.etatsDeLaCible[serieDeFloods.floods.length-1].tdc+'('+serieDeFloods.ratio(serieDeFloods.floods.length-1).toFixed(4)+')')
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-2)).toBeGreaterThan(0.5);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-2)).toBeLessThan(0.505);
            expect(serieDeFloods.ratio(serieDeFloods.floods.length-1)).toBeLessThan(0.38);
        });
        
        */
        it("qui peut calculer le pourcentage du tdc de la cible floodé", function() {
            serieDeFloods.enchainerLesFloods();
            expect(serieDeFloods.pourcentageDeFlood(1)).toBeGreaterThan(19.99);
            expect(serieDeFloods.pourcentageDeFlood(2)).toBeGreaterThan(19.99);
            expect(serieDeFloods.pourcentageDeFlood(3)).toBeGreaterThan(19.99);
            expect(serieDeFloods.pourcentageDeFlood(4)).toBeLessThan(19);//seuil
            expect(serieDeFloods.pourcentageDeFlood(5)).toBeGreaterThan(19.99);
        });

        /*
        it("qui affiche son contenu en tableau html", function() {
        });        
        */
    });
});


describe("Dans l'interface", function() {
    describe("Les champs de saisie de la page html normalisent les données fournies par l'utilisateur", function() {
        beforeEach(function(){
            //jasmine.getFixtures().fixturesPath = '.';
            //loadFixtures('../index.html');
            setFixtures('<input id="tdcFloodeur" value="50 000 000 cm²" /><input id="tdcCible" value="120 000 000 cm²" />');
        });
        it("puis mettent à jour le champ", function() {
            normaliseLaValeurDuChampNumerique('tdcFloodeur');
            expect($('#tdcFloodeur').attr('value')).toBe('50000000');
        });
        it("puis retroune le resultat normalisé", function() {
            expect(normaliseLaValeurDuChampNumerique('tdcFloodeur')).toBe(50000000);
            expect(normaliseLaValeurDuChampNumerique('tdcCible')).toBe(120000000);
            //??expect('keyup').toHaveBeenTriggeredOn("#calculateurDeFlood [required]");
        });
        it("ou lance une exeption si aucun nombre valide n'est fourni", function() {
            $('#tdcFloodeur').attr('value', 'je raconte ma vie !');
            expect(function(){normaliseLaValeurDuChampNumerique('tdcFloodeur');}).toThrow("tdc incorrect, merci d'entrer un nombre entier strictement positif");
        });
    });
/*
    describe("L'envoi du formulaire", function() {
        it("s'activent au clic sur les boutons", function() {
        });
        it("lancent les calculs adapté", function() {
        });
        it("déclenchent l'affichage des résultats", function() {
        });
    });
*/
    describe("Le générateur de html", function() {
        var leFloodeur;
        var laCible;
        var serieDeFloods;
        var generateurDeHtml;
        beforeEach(function() {
            leFloodeur = new Fourmiliere(486876541, 0);
            laCible = new Fourmiliere(955486876);
            serieDeFloods = new Floods(leFloodeur, laCible);
            serieDeFloods.enchainerLesFloods();
            generateurDeHtml = new GenerateurHtml(serieDeFloods);
        });
        it("doit être créé en lui fournissant un objet Floods en parametre", function() {    
            expect( typeof(new GenerateurHtml(serieDeFloods)) ).toBe( typeof(new Object()) );
        });
        it("présente le tdc de façon lisible", function() {
            expect(generateurDeHtml.formatageTdc(6575198765)).toBe( '<span class="tdc">6<input disabled value="." class="no-select espace"/>575<input disabled value="." class="no-select espace"/>198<input disabled value="." class="no-select espace"/>765<input disabled value="cm2" class="no-select cm2"/></span>' );
        });
        it("présente le ratio de façon lisible", function() {
            expect(generateurDeHtml.formatageRatio(2.01006001005)).toBe( '<span class="ratio">2.0101</span>' );
        });
        it("ajoute une ligne d'étape", function() {    
            expect(generateurDeHtml.etape(0) ).toBe( '<tr><th>Départ</th><td><span class="tdc">486<input disabled value="." class="no-select espace"/>876<input disabled value="." class="no-select espace"/>541<input disabled value="cm2" class="no-select cm2"/></span></td><td><span class="ratio">1.9625</span></td><td><span class="tdc">955<input disabled value="." class="no-select espace"/>486<input disabled value="." class="no-select espace"/>876<input disabled value="cm2" class="no-select cm2"/></span></td></tr>' );
            
            expect(generateurDeHtml.etape(1) ).toBe( '<tr><th>Après le flood 1</th><td><span class="tdc">677<input disabled value="." class="no-select espace"/>973<input disabled value="." class="no-select espace"/>916<input disabled value="cm2" class="no-select cm2"/></span></td><td><span class="ratio">1.1275</span></td><td><span class="tdc">764<input disabled value="." class="no-select espace"/>389<input disabled value="." class="no-select espace"/>501<input disabled value="cm2" class="no-select cm2"/></span></td></tr>' );
        });
        it("ajoute les entêtes du tableau de floods", function() {    
            expect(generateurDeHtml.entete() ).toBe( '<table><thead><tr><th class="colonne1">Etapes</th><th class="colonne2">TdC Floodeur</th><th class="colonne3" title="cible atteingable entre 3 et 0,5 de ratio">Ratio</th><th class="colonne4">TdC cible</th></tr></thead><tr><th>Départ</th><td><span class="tdc">486<input disabled value="." class="no-select espace"/>876<input disabled value="." class="no-select espace"/>541<input disabled value="cm2" class="no-select cm2"/></span></td><td><span class="ratio">1.9625</span></td><td><span class="tdc">955<input disabled value="." class="no-select espace"/>486<input disabled value="." class="no-select espace"/>876<input disabled value="cm2" class="no-select cm2"/></span></td></tr>' );
        });
        
/*        it("ajoute les entêtes du tableau de floods", function() {    
            expect( typeof(new Afficheur(serieDeFloods)) ).toBe( typeof(new Object()) );
        });
*//*        it("peut afficher le tableau de flood complet d'un coup", function() {    
            expect( generateurDeHtml.print() ).toBe(  );
        });
*/        
    });
    describe("La zone d'affichage", function() {
        it("affiche les exeptions quand il y en a", function() {
            setFixtures('<div id="espaceResultat"></div>');
            actualiserLeTableauDeFlood();
            expect($('#espaceResultat span.error').length).toBe(1);
        });
        /*
        it("affiche un tableau", function() {
        });
        describe("ce tableau contient", function() {
            it("un ligne de titre", function() {
            });
            it("une ligne par flood à faire", function() {
            });
            it("une ligne pour le total de chaque colonne", function() {
            });
            it("une colonne pour l'évolution du tdc du floodeur", function() {
            });
            it("une colonne pour la quantité de tdc floodé", function() {
            });
            it("une colonne pour l'évolution du tdc de la cible", function() {
            });
        });
        */
    });
});

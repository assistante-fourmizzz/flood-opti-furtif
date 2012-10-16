Array.prototype.last = function(){return this[this.length-1];}
Array.prototype.sum = function(){return eval(this.join('+'));}

function Floods(leFloodeur, laCible){
    this.etatsDufloodeur = new Array();
    this.etatsDufloodeur.push(leFloodeur);
    this.etatsDeLaCible = new Array();
    this.etatsDeLaCible.push(laCible);
    this.floods = new Array(1);
    
    this.enchainerLesFloods = function (){
        try {
            while(1){
                this.flood();
            }
        } catch(exception){
            switch (exception.message) {
                case 'tdc de la cible <= 50% de celui du flooder':
                case 'tdc de la cible <= 50':
                    break;
                default: throw exception;
            }
        }
    }
    this.flood = function (){
        var tdcAFlooder = this.etatsDufloodeur.last().calculLeProchainFloodSur(this.etatsDeLaCible.last());
        this.floods.push(tdcAFlooder);
        var numeroEtat = this.floods.length -1;

        this.mettreAJourFloodeur(numeroEtat);
        this.mettreAJourCible(numeroEtat);
        
        return this.floods[numeroEtat];
    }
    this.getFlood = function (numeroDuFlood){
        return this.floods[numeroDuFlood];
    }
    this.mettreAJourFloodeur = function(numeroEtat){
        var floodeurApresFlood = this.etatsDufloodeur[numeroEtat-1].clone();
        floodeurApresFlood.tdc += this.floods[numeroEtat];
        this.etatsDufloodeur[numeroEtat] = floodeurApresFlood;
    }
    this.mettreAJourCible = function(numeroEtat){
        var cibleApresFlood = this.etatsDeLaCible[numeroEtat-1].clone();
        cibleApresFlood.tdc -= this.floods[numeroEtat];
        this.etatsDeLaCible[numeroEtat] = cibleApresFlood;
    }
    this.ratio = function(numeroEtat){
        if(!numeroEtat) numeroEtat=0;
        return this.etatsDeLaCible[numeroEtat].tdc / this.etatsDufloodeur[numeroEtat].tdc;
    }
    this.pourcentageDeFlood = function(numeroEtat){
        return 100 * this.floods[numeroEtat] / this.etatsDeLaCible[numeroEtat-1].tdc;
    }
    this.nombreDeFlood = function(){
        return this.floods.length -1;
    }
}
function Fourmiliere(tdc,niveauDeDiscretion) {
    this.tdc = tdc;
    this.niveauDeDiscretion = niveauDeDiscretion;
    
    this.clone = function (){
        return new Fourmiliere(this.tdc,this.niveauDeDiscretion);
    }
    
    this.calculLeProchainFloodSur = function (fourmiliereCible){
        
        this.verifieSiLaCibleEstAtteignable(fourmiliereCible);
        
        var tdcAFlooder = this.calculLeProchainFloodSommaireSur(fourmiliereCible);
        tdcAFlooder = this.optimiseLesFloodProcheDuSeuilDePortee(fourmiliereCible, tdcAFlooder);
        tdcAFlooder = this.arrondiLeFloodSelonLeNiveauDeDiscretion(tdcAFlooder);
        return tdcAFlooder;
    };
    this.calculLeProchainFloodSommaireSur = function (fourmiliereCible){
        return Math.floor(fourmiliereCible.tdc * 0.2);
    };
    this.verifieSiLaCibleEstAtteignable = function (fourmiliereCible){
        if(fourmiliereCible.tdc <= 0.5 * this.tdc) throw RangeError('tdc de la cible <= 50% de celui du flooder');
        if(fourmiliereCible.tdc <= 50) throw RangeError('tdc de la cible <= 50');
        if(fourmiliereCible.tdc > 3 * this.tdc) throw RangeError('cible trop grande');
    };
    this.optimiseLesFloodProcheDuSeuilDePortee = function (fourmiliereCible, tdcAFlooder){
        var fourmiliereCibleLimiteHorsPorte = new Fourmiliere(fourmiliereCible.tdc - 2);
        try{
            this.verifieSiLaCibleEstAtteignable(fourmiliereCibleLimiteHorsPorte);
        } catch (exception){
            if(exception.message == 'tdc de la cible <= 50% de celui du flooder' || exception.message == 'tdc de la cible <= 50') return tdcAFlooder;
            else throw exception;
        }
        var fourmiliereCibleApresFlood = new Fourmiliere(fourmiliereCible.tdc - tdcAFlooder);
        var fourmiliereDuFloodeurApresFlood = new Fourmiliere(this.tdc + tdcAFlooder);
        try{
            fourmiliereDuFloodeurApresFlood.verifieSiLaCibleEstAtteignable(fourmiliereCibleApresFlood);
        } catch (exception){
            if(exception.message == 'tdc de la cible <= 50% de celui du flooder') tdcAFlooder = Math.floor( ( fourmiliereCible.tdc - Math.floor(0.5 * this.tdc + 1) )*2/3);
            else if(exception.message == 'tdc de la cible <= 50') tdcAFlooder = fourmiliereCible.tdc - 51;
            else throw exception;
        }
        return tdcAFlooder;
    };
    this.arrondiLeFloodSelonLeNiveauDeDiscretion = function (tdcAFlooder){
        if (this.niveauDeDiscretion>=5) return tronquerA_N_ChiffresSignificatif(tdcAFlooder, 1);
        if (this.niveauDeDiscretion==4) return tronquerA_N_ChiffresSignificatif(tdcAFlooder, 2);
        if (this.niveauDeDiscretion==2) return tronquerA_N_ChiffresSignificatif(tdcAFlooder, 2);
        return tdcAFlooder;
    };
    this.calculLesFloodSur = function (fourmiliereCible){
        try {
            var listeDeFloods = new Floods();
            $('#espaceResultat').html('');
            while(1){
                var tdcAFlooder = this.calculLeProchainFloodSur(fourmiliereCible);
                this.tdc += tdcAFlooder;
                var pourcentageDeFlood = 100 * tdcAFlooder / fourmiliereCible.tdc ;
                fourmiliereCible.tdc -= tdcAFlooder;
                $('#espaceResultat').append('<br/>' + this.tdc + ' <-- ' + tdcAFlooder + ' <-- ' + fourmiliereCible.tdc + ' flood de ' + pourcentageDeFlood.toFixed(2) + '%, ratio tdcCible / tdcFloodeur : ' + (Math.floor(1000*(fourmiliereCible.tdc-1)/this.tdc)/1000));
                //console.log( );
            }
        } catch(exception){
            switch (exception.message) {
                case 'tdc de la cible <= 50% de celui du flooder':
                case 'tdc de la cible <= 50':
                    return listeDeFloods;
                default: throw exception;
            }
        }
    };
}
function tronquerA_N_ChiffresSignificatif(nombreATronquer, chiffreSignificatif){
    if( chiffreSignificatif<=0 || !parseInt(chiffreSignificatif,10) ) throw new Error('le nombre de chiffres significatifs doit être un entier strictement superieur à 0');
    var diviseur = nombreDeChiffreDansCeNombre(nombreATronquer)-chiffreSignificatif;
    return Math.floor(nombreATronquer/Math.pow(10,diviseur))*Math.pow(10,diviseur);
}
function nombreDeChiffreDansCeNombre(nombre){
    return nombre.toString().length;
}
function decoupeLeNombreParSerieDe_N_Chiffre(nombre, n){
    if(!n) n=3;
    var texteADecouper = nombre.toString();
    var debut = -2*n; //DeLaFenetreDeDecoupe
    var fin = -n; //DeLaFenetreDeDecoupe
    var tableauResultat = [];
    var extrait = texteADecouper.slice(-n);
    tableauResultat.unshift(extrait);
    while(1){
        extrait = texteADecouper.slice(debut, fin);
        if (extrait==='') break;
        tableauResultat.unshift(extrait);
        debut-=n;
        fin-=n;
    }
    return tableauResultat;
    
}
function supprimeLesEspaces(texte){
    return texte.replace(/ /g,'');
}
function convertiLesPrefixesNumeriqueEnNombre(texte){
    return texte.replace(/k/g,'000').replace(/M/g,'000000').replace(/G/g,'000000000').replace(/T/g,'000000000000')
    .replace(/P/g,'000000000000000').replace(/E/g,'000000000000000000').replace(/Z/g,'000000000000000000000').replace(/Y/g,'000000000000000000000000');
}
function str2int(str){
    str = supprimeLesEspaces(str);
    str = convertiLesPrefixesNumeriqueEnNombre(str);
    return parseInt( str.replace(/[^0-9.,]/g,''), 10);
}


/* fonctions avec interaction dom html */
function normaliseLaValeurDuChampNumerique(idDuChamp){
    var nombreConverti = str2int($('#'+idDuChamp).attr('value'));
    if(nombreConverti>0){
        $('#'+idDuChamp).attr('value',nombreConverti);
        return nombreConverti;
    } else throw new RangeError("tdc incorrect, merci d'entrer un nombre entier strictement positif");
}
function actualiserLeTableauDeFlood(){
    try {
        var leFloodeur = new Fourmiliere(normaliseLaValeurDuChampNumerique('tdcFloodeur'));
        var laCible = new Fourmiliere(normaliseLaValeurDuChampNumerique('tdcCible'));
        leFloodeur.niveauDeDiscretion = $('#niveauDeDiscretion').attr('value');
        var serieDeFloods = new Floods(leFloodeur, laCible);
        serieDeFloods.enchainerLesFloods();
        var prepareLeHtml = new GenerateurHtml(serieDeFloods);
        $('#espaceResultat').html(prepareLeHtml.print());
    } catch (exeption) {
        $('#espaceResultat').html('<span class="error">'+exeption.message+'</span>');
    }
}


function GenerateurHtml(serieDeFloods){
    this.lesFloods = serieDeFloods;
    
    this.formatageTdc = function(tdcNumerique){
        var tdcDecoupeeParMillier = decoupeLeNombreParSerieDe_N_Chiffre(tdcNumerique,3);
        return '<span class="tdc">' + tdcDecoupeeParMillier.join('<input disabled value="." class="no-select espace"/>') + '<input disabled value="cm2" class="no-select cm2"/></span>' ;
    }
    this.formatageRatio = function(ratio){
        return '<span class="ratio">' + ratio.toFixed(4) + '</span>' ;
    }
    this.formatagePourcentage = function(pourcentage){
        return '<span class="pourcentage">' + pourcentage.toFixed(2) + '%</span>' ;
    }
    this.formatagePourcentageGain = function(pourcentage){
        return '<span class="pourcentage">+' + pourcentage.toFixed(0) + '%</span>' ;
    }
    this.formatagePourcentagePerte = function(pourcentage){
        return '<span class="pourcentage">-' + pourcentage.toFixed(0) + '%</span>' ;
    }
    this.entete = function(){
        return '<table><thead><tr><th class="colonne1">Etapes</th><th class="colonne2">TdC Floodeur</th><th class="colonne3" title="cible atteingable entre 3 et 0,5 de ratio">Ratio</th><th class="colonne4">TdC cible</th></tr></thead><tbody>'+this.etape(0);
    }
    this.etape = function(numeroEtat){
        var nomEtape;
        if(!numeroEtat) nomEtape = 'Départ';
        else nomEtape = 'Après le flood ' + numeroEtat;
        var nombreDEtape = this.lesFloods.nombreDeFlood();
        var couleur1 = 100 - 20*numeroEtat/nombreDEtape;
        var couleur2 = 80 + 20*numeroEtat/nombreDEtape;
        return '<tr><th>' + nomEtape + '</th><td style="background-color:rgb('+couleur1+'%,'+couleur2+'%,80%);">' + this.formatageTdc(this.lesFloods.etatsDufloodeur[numeroEtat].tdc) + '</td><td>' + this.formatageRatio(this.lesFloods.ratio(numeroEtat)) + '</td><td style="background-color:rgb('+couleur2+'%,'+couleur1+'%,80%);">' + this.formatageTdc(this.lesFloods.etatsDeLaCible[numeroEtat].tdc) + '</td></tr>';
    }
    this.flood = function(numeroEtat){
        return '<tr><th>Flood ' + numeroEtat + '</th><td colspan="3"><img class="fleche gaucheBas" src="flecheGaucheBas.png" alt="&lt;--"/><strong>' + this.formatageTdc(this.lesFloods.floods[numeroEtat]) + '</strong><img class="fleche basGauche" src="flecheBasGauche.png" alt="&lt;--"/>' + this.formatagePourcentage(this.lesFloods.pourcentageDeFlood(numeroEtat)) + '</td></tr>';
    }
    this.total = function(){
        var pourcentageDeGainFloodeur = 100 * this.lesFloods.etatsDufloodeur[this.lesFloods.etatsDufloodeur.length-1].tdc/this.lesFloods.etatsDufloodeur[0].tdc - 100;
        var pourcentageDePertCible =  100 - 100 * this.lesFloods.etatsDeLaCible[this.lesFloods.etatsDeLaCible.length-1].tdc/this.lesFloods.etatsDeLaCible[0].tdc;
        return '</tbody><tfoot><tr><th>TdC flood&eacute; au total</th><td colspan="3">' + this.formatagePourcentageGain(pourcentageDeGainFloodeur) + this.formatageTdc(this.lesFloods.floods.sum()) + this.formatagePourcentagePerte(pourcentageDePertCible) + '</td>';
    }
    this.fermeture = function(){
        return this.total() + '</table>';
    }
    
    this.print = function(){
        
        var html = this.entete();
        for (var etape = 1; etape < this.lesFloods.floods.length; etape++) {
            html += this.flood(etape) + this.etape(etape);
        }
        return html + this.fermeture();
    }
}
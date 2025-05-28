

// Variabili globali
var prodotti = [];
var carrello = [];
var prodottoSelezionato = null;

// Carica i dati di esempio

// Carica i dati di esempio
function caricaDatiEsempio() {
  console.log('Caricamento dati dal database...');

  fetch('prodotti.php')  // Modificato da 'prodotti.php' a '/prodotti.php'
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore nella risposta del server: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.length > 0) {
        prodotti = data;
        mostraProdotti();
        console.log('Prodotti caricati:', prodotti);
      } else {
        throw new Error('Nessun prodotto trovato nel database');
      }
    })
    .catch(error => {
      console.error('Errore nel caricamento dei prodotti:', error);
      // Carica dati di esempio come fallback
      caricaDatiDiBackup();
    });
}
function caricaDatiDiBackup() {
  console.log('Caricamento dati di backup...');

  prodotti = [
    { codice: 1, descrizione: "Mele Fuji", prezzo: 0.35, tipo: "fresco", categoria: "alimentari", calorie: 200 },
    { codice: 2, descrizione: "Pasta De Cecco", prezzo: 1.20, tipo: "conservato", categoria: "alimentari", calorie: 350 },
    { codice: 3, descrizione: "T-shirt Cotone", prezzo: 15.99, tipo: "uomo", categoria: "abbigliamento", calorie: null }
    // Aggiungi altri prodotti se necessario
  ];

  mostraProdotti();
}


// Calcola il prezzo in base al tipo di prodotto
function calcolaPrezzo(prodotto) {
  // Assicurati che prezzo sia un numero
  var prezzoBase = parseFloat(prodotto.prezzo);

  // Controlla se prezzoBase è un numero valido
  if (isNaN(prezzoBase)) {
    console.error("Prezzo non valido per il prodotto:", prodotto);
    return 0; // Valore di default
  }

  if (prodotto.tipo === 'fresco') {
    return prezzoBase + 0.02;
  } else if (prodotto.tipo === 'conservato') {
    return prezzoBase;
  } else if (prodotto.tipo === 'donna') {
    return prezzoBase * 0.6;
  } else if (prodotto.tipo === 'uomo') {
    return prezzoBase * 0.8;
  } else {
    return prezzoBase;
  }
}

// Mostra i prodotti nella griglia
function mostraProdotti(prodottiFiltrati) {
  var prodottiDaMostrare = prodottiFiltrati || prodotti;
  var griglia = document.getElementById('grigliaProdotti');

  if (prodottiDaMostrare.length === 0) {
    griglia.innerHTML = '<div class="stato-vuoto"><p>Nessun prodotto trovato</p></div>';
    return;
  }

  var html = '';
  for (var i = 0; i < prodottiDaMostrare.length; i++) {
    var prodotto = prodottiDaMostrare[i];
    var prezzoCalcolato = calcolaPrezzo(prodotto);

    // Assicurati che prezzoCalcolato sia un numero
    prezzoCalcolato = typeof prezzoCalcolato === 'number' ? prezzoCalcolato : 0;

    html += '<div class="scheda-prodotto" onclick="selezionaProdotto(' + prodotto.codice + ')" data-id="' + prodotto.codice + '">';
    html += '<div class="codice-prodotto">#' + prodotto.codice + '</div>';
    html += '<div class="nome-prodotto">' + prodotto.descrizione + '</div>';
    html += '<div class="prezzo-prodotto">€' + prezzoCalcolato.toFixed(2) + '</div>';
    html += '<div class="tipo-prodotto">' + prodotto.tipo + '</div>';
    if (prodotto.calorie) {
      html += '<div class="calorie-prodotto">' + prodotto.calorie + ' kcal</div>';
    }
    html += '</div>';
  }

  griglia.innerHTML = html;
}

// Seleziona un prodotto
function selezionaProdotto(codice) {
  var schede = document.querySelectorAll('.scheda-prodotto');
  for (var i = 0; i < schede.length; i++) {
    schede[i].classList.remove('selezionato');
  }

  var scheda = document.querySelector('[data-id="' + codice + '"]');
  if (scheda) {
    scheda.classList.add('selezionato');
  }

  for (var i = 0; i < prodotti.length; i++) {
    if (prodotti[i].codice === codice) {
      prodottoSelezionato = prodotti[i];
      break;
    }
  }
}

// Aggiungi il prodotto selezionato al carrello
function aggiungiSelezionatoAlCarrello() {
  if (!prodottoSelezionato) {
    alert('Seleziona prima un prodotto!');
    return;
  }

  var quantita = parseInt(document.getElementById('inputQuantita').value);
  if (quantita < 1) quantita = 1;

  aggiungiAlCarrello(prodottoSelezionato, quantita);
}

// Aggiungi prodotto al carrello
function aggiungiAlCarrello(prodotto, quantita) {
  for (var i = 0; i < quantita; i++) {
    var copiaProdotto = {
      codice: prodotto.codice,
      descrizione: prodotto.descrizione,
      prezzo: prodotto.prezzo,
      tipo: prodotto.tipo,
      categoria: prodotto.categoria,
      calorie: prodotto.calorie
    };
    carrello.push(copiaProdotto);
  }

  aggiornaVisualizzazioneCarrello();
  aggiornaTotale();
}

// Aggiorna la visualizzazione del carrello
function aggiornaVisualizzazioneCarrello() {
  var elementiCarrello = document.getElementById('elementiCarrello');
  var conteggioCarrello = document.getElementById('conteggioCarrello');

  conteggioCarrello.textContent = carrello.length;

  if (carrello.length === 0) {
    elementiCarrello.innerHTML = '<div class="stato-vuoto"><p>Il carrello è vuoto</p></div>';
    return;
  }

  var elementiRaggruppati = {};
  for (var i = 0; i < carrello.length; i++) {
    var elemento = carrello[i];
    if (elementiRaggruppati[elemento.codice]) {
      elementiRaggruppati[elemento.codice].quantita++;
    } else {
      elementiRaggruppati[elemento.codice] = {
        codice: elemento.codice,
        descrizione: elemento.descrizione,
        prezzo: elemento.prezzo,
        tipo: elemento.tipo,
        categoria: elemento.categoria,
        calorie: elemento.calorie,
        quantita: 1
      };
    }
  }

  var html = '';
  for (var codice in elementiRaggruppati) {
    var elemento = elementiRaggruppati[codice];
    var prezzo = calcolaPrezzo(elemento);
    var prezzoTotale = prezzo * elemento.quantita;

    html += '<div class="elemento-carrello">';
    html += '<div class="info-elemento-carrello">';
    html += '<div class="nome-elemento-carrello">' + elemento.descrizione + '</div>';
    html += '<div class="prezzo-elemento-carrello">€' + prezzoTotale.toFixed(2) + '</div>';
    html += '</div>';
    html += '<div class="controlli-elemento-carrello">';
    html += '<input type="number" class="input-quantita-carrello" value="' + elemento.quantita + '" min="1" onchange="aggiornaQuantita(' + elemento.codice + ', this.value)">';
    html += '<button class="pulsante-piccolo pulsante-rimuovi" onclick="rimuoviDalCarrello(' + elemento.codice + ')">×1</button>';
    html += '<button class="pulsante-piccolo pulsante-rimuovi-tutto" onclick="rimuoviTuttoDalCarrello(' + elemento.codice + ')">×Tutto</button>';
    html += '</div>';
    html += '</div>';
  }

  elementiCarrello.innerHTML = html;
}

// Aggiorna la quantità di un prodotto nel carrello
function aggiornaQuantita(codice, nuovaQuantita) {
  var quantita = parseInt(nuovaQuantita);
  if (quantita < 1) quantita = 1;

  carrello = carrello.filter(function(elemento) {
    return elemento.codice !== codice;
  });

  var prodotto = null;
  for (var i = 0; i < prodotti.length; i++) {
    if (prodotti[i].codice === codice) {
      prodotto = prodotti[i];
      break;
    }
  }

  if (prodotto) {
    aggiungiAlCarrello(prodotto, quantita);
  }
}

// Rimuovi un singolo elemento dal carrello
function rimuoviDalCarrello(codice) {
  for (var i = 0; i < carrello.length; i++) {
    if (carrello[i].codice === codice) {
      carrello.splice(i, 1);
      break;
    }
  }
  aggiornaVisualizzazioneCarrello();
  aggiornaTotale();
}

// Rimuovi tutti gli elementi di un prodotto dal carrello
function rimuoviTuttoDalCarrello(codice) {
  carrello = carrello.filter(function(elemento) {
    return elemento.codice !== codice;
  });
  aggiornaVisualizzazioneCarrello();
  aggiornaTotale();
}

// Svuota il carrello
function svuotaCarrello() {
  carrello = [];
  aggiornaVisualizzazioneCarrello();
  aggiornaTotale();
  document.getElementById('sezioneScontrino').style.display = 'none';
}

// Aggiorna il totale
function aggiornaTotale() {
  var totale = 0;
  for (var i = 0; i < carrello.length; i++) {
    totale += calcolaPrezzo(carrello[i]);
  }
  document.getElementById('importoTotale').textContent = '€' + totale.toFixed(2);
}

// Genera lo scontrino
function generaScontrino() {
  if (carrello.length === 0) {
    alert('Il carrello è vuoto!');
    return;
  }

  var scontrino = '========== SCONTRINO ==========\n';
  scontrino += 'Supermercato: MegaMart\n';
  scontrino += 'Data: ' + new Date().toLocaleDateString('it-IT') + '\n';
  scontrino += 'Ora: ' + new Date().toLocaleTimeString('it-IT') + '\n';
  scontrino += '==============================\n\n';

  var elementiRaggruppati = {};
  for (var i = 0; i < carrello.length; i++) {
    var elemento = carrello[i];
    if (elementiRaggruppati[elemento.codice]) {
      elementiRaggruppati[elemento.codice].quantita++;
    } else {
      elementiRaggruppati[elemento.codice] = {
        codice: elemento.codice,
        descrizione: elemento.descrizione,
        prezzo: elemento.prezzo,
        tipo: elemento.tipo,
        categoria: elemento.categoria,
        calorie: elemento.calorie,
        quantita: 1
      };
    }
  }

  for (var codice in elementiRaggruppati) {
    var elemento = elementiRaggruppati[codice];
    var prezzo = calcolaPrezzo(elemento);
    var prezzoTotaleElemento = prezzo * elemento.quantita;

    var codicePadded = ('000' + elemento.codice).slice(-3);
    var nomePadded = (elemento.descrizione + '                         ').slice(0, 25);
    var prezzoPadded = ('      ' + prezzoTotaleElemento.toFixed(2)).slice(-6);

    scontrino += codicePadded + ' ' + nomePadded + ' €' + prezzoPadded + '\n';

    if (elemento.quantita > 1) {
      scontrino += '    ' + elemento.quantita + 'x €' + prezzo.toFixed(2) + '\n';
    }
  }

  var totale = 0;
  for (var i = 0; i < carrello.length; i++) {
    totale += calcolaPrezzo(carrello[i]);
  }

  scontrino += '\n==============================\n';
  scontrino += 'TOTALE: €' + totale.toFixed(2) + '\n';
  scontrino += '==============================\n';
  scontrino += 'Grazie per la visita!';

  document.getElementById('contenutoScontrino').textContent = scontrino;
  document.getElementById('sezioneScontrino').style.display = 'block';
}

// Cerca prodotti
function cercaProdotti() {
  var termineRicerca = document.getElementById('inputRicerca').value.toLowerCase();
  var categoria = document.getElementById('filtroCategoria').value;

  var filtrati = [];
  for (var i = 0; i < prodotti.length; i++) {
    var prodotto = prodotti[i];
    var corrispondeRicerca = prodotto.descrizione.toLowerCase().indexOf(termineRicerca) !== -1;
    var corrispondeCategoria = categoria === 'tutte' || prodotto.categoria === categoria;

    if (corrispondeRicerca && corrispondeCategoria) {
      filtrati.push(prodotto);
    }
  }

  mostraProdotti(filtrati);
}

// Event listeners
document.getElementById('inputRicerca').addEventListener('input', cercaProdotti);
document.getElementById('filtroCategoria').addEventListener('change', cercaProdotti);

// Carica i dati all'avvio
document.addEventListener('DOMContentLoaded', function() {
  caricaDatiEsempio();
});

<?php
// Configurazione specifica per XAMPP
$servername = "localhost";
$username = "root";
$password = "";  // Password vuota per XAMPP di default
$dbname = "supermercato";

// Crea connessione
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");  // Imposta charset UTF-8 per i caratteri speciali

// Verifica connessione
if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

// Imposta l'header per JSON
header('Content-Type: application/json; charset=utf-8');

// Query SQL
$sql = "SELECT * FROM prodotti";
$result = $conn->query($sql);

// Crea array dei risultati
$prodotti = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Converti esplicitamente i valori numerici
        $row['codice'] = (int)$row['codice'];
        $row['prezzo'] = (float)$row['prezzo'];
        if (isset($row['calorie'])) {
            $row['calorie'] = (int)$row['calorie'];
        }
        $prodotti[] = $row;
    }
}

// Restituisci i dati come JSON
echo json_encode($prodotti, JSON_UNESCAPED_UNICODE);

// Chiudi la connessione
$conn->close();
?>

// =====================================================
//  HIER ANPASSEN: ein Eintrag pro Kapitel
//  datei = MP3 im Ordner "audio", bild = Bild im Ordner "bilder"
// =====================================================
var TITEL_DER_GESCHICHTE = "Der Hobbit";

var kapitel = [
  { titel: "Intro",     datei: "audio/kapitel1.mp3", bild: "bilder/kapitel1.jpg" },
  { titel: "Erstes Kapitel - Ein unterwartetes Fest",      datei: "audio/kapitel2.mp3", bild: "bilder/kapitel2.jpg" },
];
// =====================================================


var audio = document.getElementById("audio");
var liste = document.getElementById("liste");
var anzeige = document.getElementById("aktuell");
var bgA = document.getElementById("bgA");
var bgB = document.getElementById("bgB");
var vorne = bgA;   // welche Hintergrund-Ebene gerade sichtbar ist
var nr = -1;       // aktuelles Kapitel

// Kapitelliste aufbauen
kapitel.forEach(function (k, i) {
  var li = document.createElement("li");
  var b = document.createElement("button");
  b.textContent = k.titel;
  b.onclick = function () { spiele(i, 0); };
  li.appendChild(b);
  liste.appendChild(li);
});

// Hintergrund sanft wechseln
function setzeHintergrund(bild) {
  var hinten = (vorne === bgA) ? bgB : bgA;
  hinten.style.backgroundImage = "url('" + bild + "')";
  hinten.classList.remove("unsichtbar");
  vorne.classList.add("unsichtbar");
  vorne = hinten;
}

// Kapitel laden (und abspielen)
function lade(i, startzeit, abspielen) {
  if (i < 0 || i >= kapitel.length) return;
  nr = i;
  var k = kapitel[i];

  audio.src = k.datei;
  if (startzeit) {
    audio.addEventListener("loadedmetadata", function f() {
      audio.currentTime = startzeit;
      audio.removeEventListener("loadedmetadata", f);
    });
  }
  if (abspielen) audio.play();

  anzeige.textContent = k.titel;
  setzeHintergrund(k.bild);
  document.title = k.titel + " – " + TITEL_DER_GESCHICHTE;

  var knoepfe = liste.querySelectorAll("button");
  for (var j = 0; j < knoepfe.length; j++) {
    knoepfe[j].classList.toggle("aktiv", j === i);
  }

  // Anzeige & Tasten auf dem Sperrbildschirm
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: k.titel,
      artist: TITEL_DER_GESCHICHTE,
      artwork: [{ src: k.bild, sizes: "512x512" }]
    });
  }
}

function spiele(i, startzeit) { lade(i, startzeit, true); }

// Nach Kapitelende automatisch weiter (funktioniert auch bei gesperrtem Bildschirm)
audio.addEventListener("ended", function () {
  if (nr + 1 < kapitel.length) spiele(nr + 1, 0);
});

// Sperrbildschirm-Tasten: vor / zurück
if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("nexttrack", function () { spiele(nr + 1, 0); });
  navigator.mediaSession.setActionHandler("previoustrack", function () { spiele(nr - 1, 0); });
}

// Hörposition merken, damit man später weiterhören kann
audio.addEventListener("timeupdate", function () {
  try { localStorage.setItem("hoerstand", JSON.stringify({ nr: nr, zeit: audio.currentTime })); } catch (e) {}
});

// Beim Öffnen: letzten Stand laden (ohne automatisch zu starten)
var stand = null;
try { stand = JSON.parse(localStorage.getItem("hoerstand")); } catch (e) {}
if (stand && stand.nr >= 0 && stand.nr < kapitel.length) {
  lade(stand.nr, stand.zeit, false);
} else {
  setzeHintergrund(kapitel[0].bild);
}

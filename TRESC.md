# Treści strony do przeglądu

> Kopia wszystkich tekstów z landingu (stan z 2026-10-27), wygenerowana z kodu.
> Jak pracować: popraw tekst bezpośrednio w tym pliku albo dopisz pod zdaniem linię zaczynającą się od `>>` z uwagą,
> np. `>> za ogólnie, napisz konkretnie o przenośnikach`. Potem napisz w czacie: „wprowadź zmiany z TRESC.md”.
> Wprowadzę je do strony, sprawdzę spójność całości i odświeżę ten plik oraz artefakt.


## Otwarcie i arkusze 01–06 (karty przy przewijanej scenie)

**Nad nagłówkiem:** Szukasz możliwości zautomatyzowania procesów transportu logistycznego?
**H1:** Twoja linia transportowa, którą policzymy warstwa po warstwie.
Synergy Engineering projektuje, buduje i uruchamia systemy transportu wewnętrznego od A do Z. Kompleksowo zajmiemy się mechaniką, elektryką, automatyką, integracją z WMS, a nawet zabezpieczymy sieć OT Twojej linii. Wykonamy ocenę ryzyka i oddamy Ci w pełni zwalidowany system, w którym ryzyko zmniejszyliśmy do akceptowalnego poziomu.
[Przycisk] Oszacuj koszt swojej linii →
[Przycisk] Zobacz, jak powstaje linia ↓
Szacunek niewiążący · to nie jest oferta

### Arkusz 01 / 06 · Hala
**Nagłówek:** Najpierw pusta hala i kilka liczb.
Jaka ma być wydajność linii? Samodzielnie, a przede wszystkim z naszą pomocą, dobierasz maszyny do realizacji swojego celu.
W tym przykładzie paleta z kartonami zostaje wprowadzona do systemu wózkiem widłowym i przetransportowana do strefy robota paletyzującego, a stamtąd trafia do magazynu wysyłkowego.
**Zapytamy Cię o:** rodzaj jednostki logistycznej, jej wymiary, masę ładunku, rodzaj wejścia i wyjścia z systemu, a także łączną długość linii.

### Arkusz 02 / 06 · Mechanika
**Nagłówek:** Linia z modułów dobranych do ładunku.
Przepaletyzowanie kartonów z palety dostawczej na paletę wysyłkową z przekładkami kartonowymi oraz zabezpieczeniem krawędzi kartonów. Antresola prowadzi linię nad drogą dla wózków i pieszych.
- 1 | Przenośnik rolkowy
- 2 | Winda z przenośnikiem
- 3 | Obrotnica na antresoli
- 4 | Krzyżówka
- 5 | Przenośnik łańcuchowy
- 6 | Robot paletyzujący z magazynkiem przekładek
- 7 | Destacker palet ze stołem nożycowym
- 8 | Owijarka (obrotnica z modułem owijania palety folią stretch i aplikatorem narożników)
- 9 | Brama szybkobieżna
- 10 | Wózek jazdy poziomej
- 11 | Stół nożycowy unoszący
Numeracja jak na rysunku złożeniowym: jedna pozycja na typ elementu.
**Zapytamy Cię o:** nośnik logistyczny, wydajność, funkcje maszyn, zakres dostawy itp.

### Arkusz 03 / 06 · Automatyka
**Nagłówek:** Linia musi wiedzieć, gdzie jest każda paleta.
Bramka kontroli konturu nie wpuści palety, z której ładunek wystaje poza obrys. Czujniki przesyłają na wejścia sterownika PLC informację o położeniu palet i maszyn, a skaner odczytuje kod QR owiniętej folią palety. Przy wszystkich stanowiskach są wyłączniki awaryjne.
**Zapytamy Cię o:** identyfikację i śledzenie ładunku, standard sterowników w zakładzie i czas pracy (liczbę zmian).

### Arkusz 03 / 06 · Szafa sterownicza
**Nagłówek:** Sterowanie to osobna część projektu.
W szafie pracują sterownik PLC z modułami wejść i wyjść, sterownik bezpieczeństwa, falowniki i wyłączniki silnikowe napędów, styczniki, przekaźniki, zabezpieczenia, zasilacze 24 V i przełącznik sieciowy.
Na froncie szafy głównej: wyłącznik główny, panel HMI, lampki sygnalizacyjne, przycisk reset oraz wyłącznik awaryjny.
W zapytaniach tę część łatwo pominąć, a ona też posiada swój koszt.

### Arkusz 04 / 06 · Bezpieczeństwo
**Nagłówek:** Ryzyko zmniejszamy do akceptowalnego poziomu.
W ocenie ryzyka (EN ISO 12100) szacujemy ryzyko, określamy wymagany Performance Level (PLr) dla funkcji bezpieczeństwa (EN ISO 13849-1) i dobieramy odpowiednie środki techniczne, m.in. wygrodzenie celi z drzwiami z ryglem, radar bezpieczeństwa w celi zrobotyzowanej, skaner laserowy z polem ostrzegawczym i ochronnym na wózku jazdy poziomej oraz kurtyny bezpieczeństwa.
Warto zapamiętać: od 20 stycznia 2027 r. rozporządzenie (UE) 2023/1230 zastępuje dyrektywę maszynową 2006/42/WE.
**Zapytamy Cię o:** miejsca przebywania ludzi w pobliżu maszyn, środowisko, w którym mają pracować maszyny (np. mroźnia, ATEX), i ograniczenia hali.

### Arkusz 04 / 06 · Muting krzyżowy
**Nagłówek:** Paletę kurtyna przepuści.
Przed bramą szybkobieżną stoją czujniki, których wiązki krzyżują się nad przenośnikiem. Paleta przecina obie wiązki w określonym oknie czasowym, więc sterownik na chwilę wycisza kurtynę (muting). Brama się podnosi, paleta przejeżdża, kurtyna wraca do pracy.

### Arkusz 04 / 06 · Zatrzymanie
**Nagłówek:** Człowieka nie przepuści.
Człowiek nie uruchomi mutingu tak jak paleta, więc kurtyna pozostaje aktywna. Gdy wejdzie w jej pole, linia natychmiast się zatrzyma. Ponowny start wymaga potwierdzenia przez operatora.

### Arkusz 05 / 06 · Sieć OT
**Nagłówek:** Sieć linii jest odrębna i chroniona przed siecią zewnętrzną.
Sterowniki, robot, panel HMI i skaner pracują w osobnej, lokalnej sieci OT. Od sieci biurowej i internetu oddziela ją zapora, która przepuszcza tylko zdefiniowany ruch, na przykład dane palety do WMS. Próba dostępu z zewnątrz kończy się na zaporze.
Rozporządzenie 2023/1230 (zał. III, pkt 1.1.9, ang. protection against corruption) wymaga, by podłączenie do maszyny innego urządzenia, także zdalnego, nie prowadziło do sytuacji niebezpiecznej. Sieć dzielimy na strefy i kanały według IEC 62443.
**Zapytamy Cię o:** połączenie z WMS / ERP, potrzebę zdalnego serwisu i politykę IT zakładu.

### Arkusz 06 / 06 · Gotowa linia
**Nagłówek:** Jedna hala, cztery warstwy.
Mechanika, automatyka, bezpieczeństwo i sieć OT. Każda z nich zmienia koszt, dlatego zanim podamy liczbę, pytamy o wszystkie warstwy.
Przełączaj warstwy w panelu, żeby zobaczyć, z czego składa się linia.
[Przycisk] Oszacuj koszt swojej linii →

## Zakres (wykaz pozycji A–G)

### Wykaz pozycji · zakres Synergy
**Nagłówek:** Od koncepcji po uruchomienie. Jeden wykonawca.
Projektujemy, budujemy i uruchamiamy całą linię lub tylko wybrane przez Ciebie zakresy, np. budujemy tylko maszyny, a Ty integrujesz je z automatyką i zapewniasz bezpieczeństwo.
- Poz. | Nazwa | Zakres | Arkusz
- A | Koncepcja i layout | Przepływ, wydajność, miejsce w hali, układ linii. | 01
- B | Konstrukcja mechaniczna | Maszyny i moduły projektowane pod Twój ładunek. | 02
- C | Produkcja | Maszyny budujemy od zera. | 02
- D | Elektryka i automatyka | Szafy sterownicze, PLC, HMI, napędy, czujniki, oprogramowanie. | 03
- E | Bezpieczeństwo maszyn i CE | Ocena ryzyka, techniczne środki bezpieczeństwa, dokumentacja, deklaracja zgodności dla całej linii. | 04
- F | Sieć OT i integracja IT | Odrębna sieć linii, zapora, wymiana danych z WMS / ERP. | 05
- G | Montaż i uruchomienie | W Twojej hali, do pracy linii. | 06

## Przykładowe zapytanie

### Wynik kwestionariusza
**Nagłówek:** To dostaniesz na końcu.
Na końcu dostaniesz specyfikację wstępną, która trafi również do naszego zespołu inżynierów. Pola, których nie wypełnisz, oznaczymy jako „do ustalenia”. Przy polach obowiązkowych wystarczy nam szacunek. Formularz przepuści Cię dalej nawet bez nich, ale wtedy nie policzy kosztu orientacyjnego. Skontaktujemy się z Tobą i pomożemy Ci zbudować system szyty na Twoją miarę.
Koszt orientacyjny zobaczysz po podaniu danych kontaktowych.
[Przycisk] Oszacuj koszt swojej linii →
- Rodzaj ładunku: Kartony zbiorcze, zamknięte
- Wymiary ładunku: 400 × 300 × 250 mm
- Nośnik: Paleta EUR 1200 × 800 (dostawcza i wysyłkowa)
- Masa: do 12 kg / karton, paleta do 600 kg
- Wydajność: średnio 8, szczytowo 12 palet / h
- Wejście → wyjście: wózek widłowy → odbiór wózkiem paletowym w magazynie; trasa przez antresolę nad drogą pojazdów
- Funkcje: podnoszenie (2 windy), obracanie, przepaletyzowanie z przekładkami, owijanie z zabezpieczeniem krawędzi, identyfikacja QR
- Zakres dostawy: pełna integracja: 1–11 + automatyka, bezpieczeństwo, sieć OT
- Styk z ludźmi: droga pieszych i pojazdów pod antresolą
- Czas pracy: 2 zmiany
- Połączenie z WMS / ERP: do ustalenia na pierwszej rozmowie
- Termin i okno montażowe: do ustalenia na pierwszej rozmowie

## Jak pracujemy

### Od pytania do oferty
**Nagłówek:** Co dzieje się po wysłaniu zapytania.
- 1 | Odpowiadasz na pytania | Około 20 pytań. Przy części z nich możesz wpisać „nie wiem”. Uszczegółowimy to razem z zespołem inżynierów z Synergy Engineering.
- 2 | Widzisz koszt orientacyjny | Po podaniu danych kontaktowych, razem ze specyfikacją.
- 3 | Czyta je zespół pierwszego kontaktu | Inżynierowie sprzedaży oraz inżynierowie aplikacji.
- 4 | Rozmowa i oferta | Ustalamy pola „do ustalenia” i przygotowujemy ofertę.
- Szacunek jest niewiążący.
- To nie jest oferta.
- Dane kontaktowe trafiają tylko do zespołu pierwszego kontaktu.

## Finał

**Nagłówek:** Twoja hala jest jeszcze pusta.
Opisz, co ma w niej jeździć. Resztę policzymy warstwa po warstwie.
[Przycisk] Oszacuj koszt swojej linii →

## Stopka

SYNERGY ENGINEERING
Projekt koncepcyjny: firma Synergy Engineering i przykłady na tej stronie są fikcyjne.
Materiał stanowi jedynie informację i nie zawiera porad prawnych.

## Podstrona „Oszacuj koszt” (oszacuj-koszt.html)

### Kwestionariusz kosztu linii · status: w przygotowaniu
**H1:** Kwestionariusz kosztu linii jest w przygotowaniu.
Uruchomimy go wkrótce. Poniżej znajdziesz pytania, które zadamy, żebyś mógł przygotować dane. Na końcu kwestionariusza, po podaniu danych kontaktowych, zobaczysz niewiążący koszt orientacyjny i specyfikację wstępną.
[Przycisk] Kopiuj listę pytań
Na tej stronie nie zbieramy żadnych danych.

**Nagłówek:** Obowiązkowe
Bez nich nie policzymy kosztu orientacyjnego. Wystarczy odpowiedź szacunkowa. Formularz przepuści Cię dalej nawet bez nich, a koszt ustalimy wtedy na rozmowie.

- Rodzaj ładunku | Kartony, worki, pojemniki, palety. Od tego zależy typ przenośnika i sposób chwytania.
- Wymiary ładunku | Szerokość i rozstaw rolek, wielkość windy, gabaryty celi.
- Nośnik logistyczny | Paleta EUR, przemysłowa, pojemnik albo bez nośnika. Decyduje o wyborze przenośnika rolkowego lub łańcuchowego.
- Masa | Napędy, konstrukcja nośna, udźwig windy i robota.
- Wydajność średnia i szczytowa | Prędkości, liczba torów i buforów, czasem drugi robot.
- Wejście, wyjście i długość trasy | Liczba modułów, zakręty, antresole, przejścia przez ściany.
- Funkcje | Podnoszenie, obracanie, sortowanie, paletyzacja, owijanie. Każda funkcja to osobna maszyna.
- Zakres dostawy | Sama mechanika czy pełna integracja z automatyką, bezpieczeństwem i siecią.

**Nagłówek:** „Nie wiem” wystarczy
Jeśli nie wiesz, pole trafi do zapytania jako „do ustalenia na pierwszej rozmowie”.

- Stabilność i opakowanie | Czy ładunek wymaga prowadnic, owijania, łagodnego startu.
- Identyfikacja i śledzenie | Kody, RFID, skanery i wymiana danych.
- Środowisko | Mroźnia, wilgoć, pył, strefa ATEX: inne komponenty i obudowy.
- Ograniczenia hali | Wysokość, nośność posadzki, słupy, drogi pożarowe.
- Greenfield czy brownfield | Nowa hala czy praca obok istniejących maszyn.
- Styk z ludźmi | Gdzie ludzie wchodzą w strefę linii. Od tego zależą środki bezpieczeństwa.
- Czas pracy | Liczba zmian, obciążenie napędów, serwis.
- Połączenie z IT | WMS, ERP, zakres wymiany danych i zasady sieci.
- Termin i okno montażowe | Czy montaż w trakcie produkcji, praca w weekendy.

**Nagłówek:** Opcjonalne
Pomagają dobrać wariant i policzyć zwrot z inwestycji.

- Standardy klienta | Na przykład preferowany producent sterowników lub komponentów bezpieczeństwa.
- Budżet orientacyjny | Pomaga dobrać wariant rozwiązania.
- Obecny koszt czynności | Pozwala policzyć zwrot z inwestycji przed zarządem.

Szacunek z kwestionariusza jest niewiążący i nie jest ofertą. Projekt koncepcyjny: firma Synergy Engineering jest fikcyjna.

## Opisy na rysunku 3D (etykiety w scenie)

- **Arkusz 01 · strefy na posadzce:** WEJŚCIE · WÓZEK WIDŁOWY · DROGA WÓZKÓW I PIESZYCH · CELA PRZEPALETYZOWANIA · MAGAZYN WYSYŁKOWY · TRASA ŁADUNKU
- **Otwarcie · wymiary hali:** 50 000 · 28 000
- **Arkusz 03 · automatyka:** KONTROLA KONTURU · CZUJNIKI FOTOELEKTRYCZNE · CZUJNIKI INDUKCYJNE · SKANER KODÓW QR · WYŁĄCZNIKI AWARYJNE · TRASY KABLOWE · SZAFA STEROWNICZA
- **Arkusz 03 · szafa sterownicza:** ZABEZPIECZENIA · STEROWNIK PLC · PANEL HMI · FALOWNIKI · E-STOP · RESET · WYŁĄCZNIKI SILNIKOWE · ZŁĄCZKI NA SZYNACH DIN · ZASILACZE 24 V · PRZEŁĄCZNIK · STEROWNIK BEZPIECZEŃSTWA · WYŁĄCZNIK GŁÓWNY · PRZEKAŹNIKI · STYCZNIKI
- **Arkusz 04 · bezpieczeństwo:** WYGRODZENIE CELI · DRZWI Z RYGLEM · RADAR BEZPIECZEŃSTWA · SKANER LASEROWY · POLA OCHRONNE · KURTYNA + MUTING KRZYŻOWY · CZUJNIKI MUTINGU · KURTYNA BEZPIECZEŃSTWA · BRAMA SZYBKOBIEŻNA
- **Arkusz 05 · sieć OT:** SIEĆ OT · LOKALNA · PRZEŁĄCZNIK · ZAPORA SIECI OT · SIEĆ BIUROWA · WMS / ERP · INTERNET · DOSTĘP Z ZEWNĄTRZ ZABLOKOWANY
- **Arkusz 02 · numery pozycji:** 1–11 jak na liście w karcie arkusza 02
- **Tabliczka rysunkowa:** Arkusz NN / 06 · Warstwa · Status (Projekt, Montaż, Uruchamianie, Praca, STOP) · „Przykładowa linia · dane fikcyjne”
- **Panel warstw:** Hala · Mechanika · Automatyka · Bezpieczeństwo · Sieć OT (w finale: „Warstwy · przełącz”)

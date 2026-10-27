# DESIGN: Synergy Engineering, landing „Oszacuj koszt swojej linii”

> Specyfikacja projektowa. Decyzje i ich źródła: `LANDING_BRIEF.md`. Prompt wykonawczy: `LANDING_PROMPT.md`.
> Status: plan przeczytany i poprawiony przez Rafała (2026-10-26): nowy przebieg linii, kontrola konturu, skaner QR, HMI, styczniki i złączki DIN, sekcja „Zakres” A–G, animacja izolacji sieci OT. Budowa w toku.

## 1. Koncepcja

### Rozważone interpretacje (te same wybory)

- **A. Przestrzeń modelu (wybrana).** Czarna przestrzeń modelu CAD, w której hala i linia rysują się złotymi i kostnymi krawędziami. Przewijanie obraca kamerę i włącza kolejne warstwy jak w menedżerze warstw CAD. Numery pozycji łączą model z tekstem.
- **B. Widok rozstrzelony.** Kompletna linia na starcie, przewijanie rozsuwa ją pionowo na warstwy (mechanika, automatyka, bezpieczeństwo, sieć), a na końcu składa z powrotem. Mocny obraz, ale odwraca narrację Rafała („pusta hala → dokładamy”).
- **C. Jedna zmiana robocza.** Hala od świtu do końca zmiany: ruch kartonów, człowiek, zatrzymanie linii. Dużo życia, ale słabo tłumaczy warstwy kosztu, a to jest sedno obietnicy.

**Wybór: A**, z dwoma zapożyczeniami: z B krótki „rozstrzał” wnętrza szafy sterowniczej, a z C ruch ładunków na gotowej linii i człowiek, który uruchamia funkcję bezpieczeństwa. A jako jedyna niesie wprost obietnicę „policzymy linię warstwa po warstwie” i jest w języku, którym mówi odbiorca (inżynier) i nadawca (konstruktor).

### Teza

**Scena 3D hali narysowana jak rysunek złożeniowy pokazuje klientowi, że koszt linii to suma warstw (mechaniki, automatyki, bezpieczeństwa i sieci), a nie cena przenośnika. Jedna przypięta scena z obracającą się kamerą ortograficzną włącza warstwy po kolei. Każda warstwa kończy się pytaniem, które zadamy w kwestionariuszu. Spójność trzymają: jedna kamera, jeden system numerów pozycji i czerń jako przestrzeń modelu, w której złoto jest głosem Synergy, a czerwień i żółć pojawiają się tylko tam, gdzie wymaga ich norma.**

Hierarchia materiałów: **3D (prowadzi)** → **język rysunku technicznego** (sposób rysowania: krawędzie, kreskowanie przekroju, numery pozycji, tabliczka rysunkowa) → **ilustracyjne ciepło** (uproszczone sylwetki ludzi, spójne z rysunkiem, nie komiks).

### Czerń i złoto: interpretacja

Rafał wybrał czerń ze złotymi akcentami jako jedyny „marketingowy” sygnał. Ryzyko: odbiorca, który musi wykazać oszczędność, może odczytać „luksus” jako „drogo”. Dlatego czerń i złoto czytamy jako **przyrząd precyzyjny, nie towar luksusowy**: czerń to przestrzeń modelu (ciemne tło znane z programów CAD), a złoto to grawer na tarczy przyrządu. Złota jest mało i zawsze coś znaczy: głos marki, aktywna warstwa, numery pozycji, główne CTA. Żadnych złotych gradientów, połysków ani ornamentów.

## 2. Otwarcie (pierwszy ekran = screenshot do zaliczenia)

- **Tło i dominanta:** pierwsza klatka przypiętej sceny. Pusta hala w rzucie izometrycznym (azymut 45°, kamera ortograficzna), ściany przecięte na wysokości ok. 2/3 z kreskowaniem przekroju. Po lewej strefa produkcji z antresolą, po prawej magazyn za ścianą z zamkniętą bramą szybkobieżną. W pustej hali stoi jedna sylwetka człowieka (skala; „to Ty, z pustą halą i zadaniem od zarządu”). Hala zajmuje prawe ~60% kadru.
- **Tekst (lewa kolumna, ~520 px):**
  - wers nad nagłówkiem (mono, złoto): `DLA OSÓB, KTÓRYM POWIERZONO AUTOMATYZACJĘ TRANSPORTU WEWNĘTRZNEGO`
  - H1: **„Twoja linia transportowa, policzona warstwa po warstwie.”**
  - Lead: „Synergy Engineering projektuje, buduje i uruchamia systemy transportu wewnętrznego: mechanikę, automatykę, zabezpieczenia i sieć OT. Odpowiedz na około 20 pytań o ładunek, wydajność i trasę, a dostaniesz niewiążący koszt orientacyjny i specyfikację, z którą pójdziesz do zarządu.”
  - CTA główne (złote wypełnienie): **„Oszacuj koszt swojej linii →”** → `oszacuj-koszt.html`
  - CTA pomocnicze (tekstowe): „Zobacz, jak powstaje linia ↓” → kotwica do pierwszego rozdziału sceny
  - pod CTA (mono, popiel): `Szacunek niewiążący · to nie jest oferta`
- **Górny pasek:** znak słowny „SYNERGY” (Archivo, szeroki, 800) + „ENGINEERING” (mono, rozstrzelony), linki: Jak powstaje linia · Przykładowe zapytanie · Jak pracujemy, małe CTA „Oszacuj koszt”.
- **Mobile:** tekst u góry (H1 w 2–3 wierszach, lead skrócony do 2 zdań, CTA na pełną szerokość), scena pod spodem w kadrze ~45% wysokości ekranu. CTA widoczne bez przewijania na 390×844.
- **Zasada:** tekst i CTA nie czekają na scenę. Jeśli WebGL ładuje się wolno lub nie działa, pierwszy ekran jest kompletny (tło + obraz zastępczy).

## 3. Storyboard

Jedna sekcja `#linia` z przypiętą sceną (sticky, naturalne przewijanie, bez przechwytywania kółka/dotyku). Postęp `p` od 0 do 1. Karty tekstu po lewej stronie (desktop) albo pod sceną (mobile).

**Synchronizacja tekstu z animacją (poprawka po przeglądzie Rafała, 2026-10-27).** Wcześniej karta dochodziła do środka ekranu dopiero w punkcie spoczynku arkusza (`data-p`), czyli na końcu jego animacji, więc animacja wyprzedzała tekst. Teraz każda karta ma `data-s`: początek animacji, którą opisuje. Animacja rusza dopiero, gdy górna krawędź karty dochodzi do linii czytania (komputer: 64% wysokości ekranu, telefon: 24 px pod sceną), więc nagłówek karty jest widoczny przed animacją. Przewijanie mapujemy na postęp sceny odcinkami liniowymi: odcinek karty ma długość max(dotychczasowe tempo sceny × długość jej animacji, wysokość karty + odstęp + postój). Karta jedzie we własnym torze i w nim przykleja się do ekranu (`position: sticky`): na komputerze na środku pola pod paskiem, na telefonie przy dolnej krawędzi. Następna karta wypycha poprzednią. Linki do arkuszy lądują na przypiętej karcie (telefon: na nagłówku karty pod sceną). Sekcja jest przez to dłuższa: ok. 11,3 ekranu przy 1366×768 (wcześniej 10), 12,3 przy 390×844.

| # | Arkusz | Zakres p | Czego odwiedzający się dowiaduje | Co dzieje się w scenie | Tekst / dowód | „Zapytamy Cię o” |
|---|---|---|---|---|---|---|
| 0 | 00 Otwarcie | 0–0.06 | Kto, dla kogo, co obiecujemy, co kliknąć | Pusta hala, azymut 45°. Delikatny „oddech” siatki posadzki przy pierwszym ruchu przewijania | H1, lead, CTA | — |
| 1 | 01 Hala | 0.06–0.16 | Projekt zaczyna się od danych, nie od katalogu | Kamera obraca się do ~25°. Pojawiają się strefy na posadzce (produkcja, wysyłka) i linie wymiarowe trasy | „Każdy projekt zaczyna się od pustej hali i kilku liczb: co wozimy, ile, skąd i dokąd.” | rodzaj i wymiary ładunku, masa, wejście i wyjście, długość trasy |
| 2 | 02 Mechanika | 0.16–0.36 | Z jakich modułów składa się linia i że dobiera się je do ładunku i wydajności | Moduły „opuszczane” kolejno z góry (jak z suwnicy), każdy z numerem pozycji ①–⑧. Kamera dalej obraca się (~−10°) | Lista ①–⑧ z jednym zdaniem o funkcji. „Ten sam karton przy innej wydajności to inna linia.” | nośnik, wydajność średnia i szczytowa, funkcje (podnoszenie, obracanie, paletyzacja), zakres dostawy |
| 3 | 03 Automatyka | 0.36–0.54 | Linia musi wiedzieć, gdzie jest ładunek; sterowanie to osobna część projektu | Złote trasy kablowe „rysują się” wzdłuż linii. Pojawiają się czujniki fotoelektryczne (wiązki w poprzek przenośnika) i indukcyjne (przy wózku poprzecznym i obrotnicy). Wyłączniki awaryjne na stanowiskach. Kamera obraca się frontem do szafy sterowniczej: drzwi się otwierają, wnętrze lekko wysuwa się do przodu (PLC, sterownik bezpieczeństwa, falowniki, zabezpieczenia, zasilacz, listwy, korytka). Przy szafie serwisant | Krótko, czym jest każdy element i po co jest | standard sterowników w zakładzie, identyfikacja i śledzenie ładunku, czas pracy (zmiany) |
| 4 | 04 Bezpieczeństwo | 0.54–0.76 | Jak linia chroni ludzi; ryzyko zmniejszamy do akceptowalnego poziomu | **Sekwencja kulminacyjna** (opis w §8). Wygrodzenia celi paletyzatora i drzwi z ryglem, skaner laserowy przy wózku poprzecznym (pole ostrzegawcze żółte, ochronne czerwone, półprzezroczyste na posadzce), radar w celi, kurtyna z mutingiem krzyżowym przed bramą szybkobieżną. Paleta przejeżdża, a człowiek zatrzymuje linię. Kamera nisko (elewacja ~20°), zbliżenie na bramę | „Kurtyna przepuści paletę, bo czujniki mutingu krzyżowego rozpoznają jej ruch. Człowieka nie przepuści: linia się zatrzyma.” + ocena ryzyka EN ISO 12100 + data 2023/1230 (źródło) | styk z ludźmi, środowisko (np. mroźnia, ATEX), ograniczenia hali |
| 5 | 05 Sieć OT | 0.76–0.90 | Sieć linii to odrębna sieć lokalna; z zewnątrz nikt do niej nie wejdzie | Kamera wysoko (elewacja ~55°), oddalenie. Granica „SIEĆ OT · LOKALNA”, przełącznik, zapora na granicy hali, za nią sieć biurowa (WMS/ERP) i „INTERNET”. Złote pakiety z QR przechodzą do WMS, czerwone z internetu gasną na zaporze (opis wyżej) | Zał. III pkt 1.1.9 rozporządzenia 2023/1230 (parafraza + źródło), podział na strefy i kanały (IEC 62443) | połączenie z WMS/ERP, czy potrzebny zdalny serwis, polityka IT zakładu |
| 6 | 06 Gotowa linia | 0.90–1 | Jedna hala, cztery warstwy, i każda zmienia koszt | Wszystkie warstwy włączone, linia pracuje (kartony płyną, robot układa, paleta wyjeżdża przez bramę). Kamera domyka obrót do 45°, czyli kadru z otwarcia | „Jedna hala, cztery warstwy. Każda zmienia koszt, dlatego zanim podamy liczbę, pytamy o wszystkie.” + CTA | — |

Po scenie (bez przypięcia):

| # | Scena | Znaczenie | Kompozycja | Ciągłość |
|---|---|---|---|---|
| 7 | Przykładowe zapytanie (`#zapytanie`) | „To dostaniesz na końcu”: specyfikacja dla zarządu, która trafia do zespołu pierwszego kontaktu | Jedyna duża jasna powierzchnia na stronie: arkusz w kolorze kości na czerni, lekko obrócony (−1.5°), z pieczątką `PRZYKŁAD · DANE FIKCYJNE`. Pola z tabeli briefu wypełnione dla przykładowej linii; pola nieznane jako „do ustalenia na pierwszej rozmowie”. Pole „Koszt orientacyjny” zamaskowane paskiem: „pojawi się po podaniu danych kontaktowych”. Obok krótki tekst i drugie CTA | „Zakres dostawy” wymienia moduły z tymi samymi numerami ①–⑧ co w scenie |
| 8 | Jak pracujemy (`#proces`) | Co się dzieje po wysłaniu, kto czyta, czego nie obiecujemy | Oś procesu jako **linia wymiarowa** (strzałki i znaczniki) z 4 odcinkami: odpowiadasz na pytania → widzisz koszt orientacyjny po podaniu danych → zespół pierwszego kontaktu (inżynierowie sprzedaży i inżynierowie aplikacji) czyta zapytanie → rozmowa o polach „do ustalenia” i oferta. Pod osią trzy warunki: niewiążący szacunek, to nie oferta, dane tylko dla zespołu pierwszego kontaktu | Złota linia wymiarowa = ta sama, która w arkuszu 01 mierzyła trasę |
| 9 | Finał | Twoja hala, nie przykład | Mała, wyśrodkowana pusta hala (ta sama bryła, statyczny rzut SVG lub mały canvas) z jedną sylwetką. Nagłówek: „Twoja hala jest jeszcze pusta.” Lead: „Opisz, co ma w niej jeździć. Resztę policzymy warstwa po warstwie.” CTA główne | Powrót do kadru otwarcia: domknięcie pętli |
| 10 | Stopka | Uczciwość; na końcu strony zostaje w pamięci nazwa firmy | „Projekt koncepcyjny: firma Synergy Engineering i przykłady są fikcyjne”, „Materiał stanowi jedynie informację i nie zawiera porad prawnych.” Lista źródeł usunięta na prośbę Rafała (2026-10-27); źródło przepisu zostaje jako link w nazwie rozporządzenia w kartach 04 i 05. Od 2026-10-27 (zadanie 21st.dev): pod tekstem cienka linia z łączem „Do góry ↑”, a pod nią duży napis SYNERGY z kropek rastra w `--gold-lo`, na całą szerokość i ucięty dolną krawędzią strony (komponent Halftone Wordmark Footer, §8 S7) | Ten sam krój i szerokość co znak w górnym pasku (Archivo 800, szerokość 125%) |

### Przykładowa linia (zaakceptowana przez Rafała 2026-10-26)

Przepaletyzowanie kartonów z palety dostawczej na paletę wysyłkową z przekładkami kartonowymi oraz zabezpieczeniem krawędzi kartonów. Numeracja jak na rysunku złożeniowym: jedna pozycja na typ elementu. Nazwy pozycji na karcie od 2026-10-27 w brzmieniu Rafała (`TRESC.md`); niżej opis działania w scenie.

1. **Przenośnik rolkowy** (wszystkie odcinki). Na wejściu wózek widłowy odkłada zafoliowaną paletę EUR z kartonami.
2. **Winda z przenośnikiem** (2 szt.): wciąga paletę na antresolę i sprowadza ją w dół.
3. **Obrotnica** na antresoli: zakręt linii rolkowej o 90°. Antresola prowadzi linię nad drogą dla wózków widłowych i pieszych.
4. **Krzyżówka:** przekazuje paletę na przenośnik łańcuchowy.
5. **Przenośnik łańcuchowy:** paleta jedzie szerszym bokiem (1200 mm) do celi robota.
6. **Robot paletyzujący** z magazynkiem przekładek: przekłada kartony na nową paletę, między warstwy kładzie kartonowe przekładki.
7. **Destacker palet ze stołem nożycowym:** osobną nitką podaje puste palety do robota.
8. **Owijarka** (obrotnica z modułem owijania folią stretch i aplikatorem narożników): owija gotową paletę folią i zakłada narożniki ochronne na krawędzie (magazynek aplikatora przy maszcie).
9. **Brama szybkobieżna:** przejście do magazynu wysyłkowego.
10. **Wózek jazdy poziomej:** przenosi paletę między torami w magazynie.
11. **Stół nożycowy unoszący** (w wykopie): opuszcza paletę do poziomu posadzki, operator odbiera ją wózkiem paletowym.

Warstwa automatyki dodaje: bramkę kontroli konturu przed pierwszą windą, skaner kodów QR za owijarką, czujniki fotoelektryczne i indukcyjne, wyłączniki awaryjne, szafę sterowniczą z panelem HMI na drzwiach (wnętrze: PLC, sterownik bezpieczeństwa, falowniki, styczniki, zabezpieczenia, zasilacz, złączki na szynach DIN, korytka). Wyłączniki awaryjne pojawiają się już w arkuszu 03, więc czerwień i żółć wchodzą na stronę razem z nimi (tylko na E-stopach), a pełny zestaw kolorów sygnałowych w arkuszu 04.

### Sekcja „Zakres” (nowa, po scenie, przed przykładowym zapytaniem)

Wykaz pozycji jak tabelka wykazu części na rysunku złożeniowym: `POZ. | NAZWA | ZAKRES | ARKUSZ` (kolumna „Arkusz” to link przewijający do odpowiedniej warstwy w scenie). Nagłówek: „Od koncepcji po uruchomienie. Jeden wykonawca.” Lead: „Projektujemy, budujemy i uruchamiamy całą linię albo tylko jej mechanikę, jeśli resztę masz w zakładzie.”

- **A Koncepcja i layout:** przepływ, wydajność, miejsce w hali, układ linii.
- **B Konstrukcja mechaniczna:** maszyny i moduły projektowane pod Twój ładunek.
- **C Produkcja:** maszyny budujemy od zera.
- **D Elektryka i automatyka:** szafy sterownicze, PLC, HMI, napędy, czujniki, oprogramowanie.
- **E Bezpieczeństwo maszyn i CE:** ocena ryzyka, techniczne środki bezpieczeństwa, dokumentacja, deklaracja zgodności dla całej linii.
- **F Sieć OT i integracja IT:** odrębna sieć linii, zapora, wymiana danych z WMS/ERP.
- **G Montaż i uruchomienie:** w Twojej hali.

### Arkusz 05: izolacja sieci OT (zastępuje wcześniejszy opis)

Kamera unosi się i oddala. Wokół linii pojawia się złota przerywana granica „SIEĆ OT · LOKALNA”. Urządzenia (QR, robot, HMI, PLC) łączą się z przełącznikiem. Na granicy hali stoi zapora, za nią blok „SIEĆ BIUROWA · WMS / ERP”, a dalej szkieletowa bryła „INTERNET” za zaporą brzegową organizacji. Przy przewijaniu złote pakiety (dane palety ze skanera QR) przechodzą przez zaporę do WMS. Trzy czerwone pakiety z internetu docierają do zapory sieci OT i gasną z czerwonym impulsem. Do sieci linii nie wchodzą. Bez zdalnego serwisu w scenie.

## 4. Typografia

- **Archivo** (Google Fonts, OFL, zmienna oś szerokości 62–125 i grubości; pełne polskie znaki). Nagłówki: szerokość 112–125, grubość 750–800, światło −0.01 em. Ma charakter tabliczki znamionowej maszyny. Tekst: szerokość 100, grubość 400/500, 17–18 px, interlinia 1.55, długość wiersza ≤ 64 znaki.
- **JetBrains Mono** (Google Fonts, OFL, polskie znaki): numery pozycji, nazwy arkuszy i warstw, bloki „ZAPYTAMY CIĘ O”, przypisy. 12–13 px, wersaliki, rozstrzelenie +0.08 em.
- Skala: H1 clamp(40px, 5.2vw, 76px); H2 clamp(30px, 3.4vw, 48px); H3 22–24 px.
- Zapasowo: system-ui / ui-monospace. Fonty z `display=swap`, a wymiary bloków tekstu ustalone tak, żeby podmiana nie przesuwała CTA.

## 5. Kolor (tokeny)

| Token | Wartość | Rola |
|---|---|---|
| `--void` | `#0A0A0B` | tło strony = przestrzeń modelu |
| `--carbon` | `#121214` | panele kart, wypełnienia brył maszyn |
| `--graphite` | `#232327` | krawędzie hali, siatka posadzki, linie podziału |
| `--ash` | `#8A8780` | tekst pomocniczy, podpisy (kontrast 5.5:1 na `--void`) |
| `--bone` | `#EDE8DD` | tekst główny, krawędzie maszyn (warstwa mechaniki), arkusz zapytania |
| `--gold` | `#C9A45C` | głos Synergy: CTA, aktywna warstwa, numery pozycji, trasy kablowe (8.4:1 na `--void`) |
| `--gold-hi` | `#E2C17E` | hover/aktywny stan, wiązki czujników |
| `--gold-lo` | `#7E6532` | złote linie drugiego planu, przerywane połączenia sieci |
| `--signal-red` | `#D7362B` | tylko funkcje bezpieczeństwa: grzybek E-stop, pole ochronne skanera, przerwana kurtyna, status STOP |
| `--signal-yellow` | `#E8B720` | tylko obudowy E-stop, pasy ostrzegawcze przy bramie, pole ostrzegawcze skanera |
| `--ink` | `#16130E` | tekst na arkuszu zapytania i na złotym CTA |

Rozkład: arkusze 00–03 bez czerwieni i żółci. Kolory sygnałowe wchodzą dopiero w arkuszu 04 i znaczą wyłącznie funkcję bezpieczeństwa (zgodnie z ich rolą w normach: E-stop czerwony na żółtym tle). Jedyna duża jasna powierzchnia to arkusz przykładowego zapytania. CTA zawsze złote z tekstem `--ink`. Żadnych innych odcieni (niebieskich, zielonych), żadnych gradientów poza przyciemnieniem sceny pod tekstem (`--void` → przezroczysty).

## 6. Geometria i rytm

- Siatka 12 kolumn, max 1320 px, margines 24 px (mobile 16 px). Karty rozdziałów: 5 kolumn po lewej, scena pełnoekranowa za nimi, hala skadrowana w prawej części (przesunięcie kamery `view offset`).
- Karty rozdziałów: tło `--carbon` z 88% kryciem, cienka ramka `--graphite`, promień 2 px (rysunek, nie aplikacja), padding 28–32 px. Każda karta ma nagłówek arkusza (mono), H2, 2–4 zdania, listę i blok „ZAPYTAMY CIĘ O”.
- Rytm: scena (gęsta, przestrzenna, długa) → arkusz zapytania (płaski, jasny, gęsty) → proces (rzadki, poziomy, dużo czerni) → finał (pusty, wyśrodkowany, jeden obiekt).

## 7. Język detali

| Rodzina | Skąd | Rola | Gdzie i ile razy |
|---|---|---|---|
| Numery pozycji w kółkach z odnośnikami | rysunek złożeniowy | łączą element w 3D z opisem w karcie | tylko w scenie (aktywna warstwa) + lista „Zakres dostawy” w arkuszu zapytania |
| Tabliczka rysunkowa | arkusz rysunku technicznego | orientacja: `ARKUSZ 04/06 · WARSTWA: BEZPIECZEŃSTWO · PRZYKŁADOWA LINIA` + status linii `PRACA / STOP` | jedna, w prawym dolnym rogu przypiętej sceny |
| Menedżer warstw | menedżer warstw w CAD | wskaźnik postępu i nawigacja (klik przewija do rozdziału); w arkuszu 06 przełączniki stają się interaktywne (włącz/wyłącz warstwę) | jeden, prawy górny róg sceny (desktop, bo lewą stronę zajmują karty) / poziomy pasek nad sceną (mobile) |
| Kreskowanie przekroju | rysunek przekroju | mówi „to przekrój hali” | tylko na ciętych ścianach hali |
| Linia wymiarowa | wymiarowanie | mierzy trasę (arkusz 01) i oś procesu (scena 8) | dwa miejsca, celowo powiązane |
| Blok „ZAPYTAMY CIĘ O” | argument strony | łączy warstwę z kwestionariuszem i CTA | raz w każdej karcie arkuszy 01–05 |
| Pieczątka „PRZYKŁAD” | uczciwość | oznacza dane fikcyjne | arkusz zapytania + podpis sceny „przykładowa linia” |

Bez poświat, cząsteczek, „cyfrowych” siatek w tle, logotypów producentów i ikon zębatek. Wyjątek (decyzja Rafała, 2026-10-27): kropki rastra w napisie stopki, które reagują na kursor. To druk znaku firmy, a nie ozdobne cząsteczki w tle: w spoczynku stoją i ruszają się tylko pod ręką użytkownika.

## 8. Ruch: partytura

Wspólny język: ruch to zachowanie modelu, a nie filtr. Kamera obraca się płynnie (interpolacja między klatkami kluczowymi rozdziałów z wygładzeniem), elementy wchodzą tak, jak montuje się je w hali: z góry, z osiadaniem; trasy kablowe rysują się wzdłuż przebiegu, drzwi obracają się na zawiasach. Wszystko jest powiązane z przewijaniem (odwracalne). Wyjątki: ciągła praca linii w arkuszu 06 (pętla, pauza poza ekranem) oraz stopka S7, która reaguje na kursor i kliknięcie, a nie na przewijanie.

| Sekwencja | Wyzwalacz | Wejście | Rozwój | Punkt znaczenia | Wyjście | Cofanie | Mobile | Ograniczony ruch / brak WebGL |
|---|---|---|---|---|---|---|---|---|
| S1 Obrót kamery | p 0→1 | azymut 45°, elewacja 35° | 45° → 25° → −10° → −40° (szafa) → −135° (brama, elewacja 20°, zbliżenie 1.6×) → −200° (sieć, elewacja 55°, oddalenie 0.85×) → 45° + 360° = kadr startowy | każda warstwa ogląda się z kąta, który ją najlepiej tłumaczy | kadr startowy na końcu (domknięcie) | symetryczne | ten sam przebieg, kadr dopasowany do pionu | kamera przeskakuje na klatkę kluczową rozdziału (bez interpolacji) |
| S2 Montaż mechaniki | p 0.16→0.36 | moduły ukryte 2 m nad posadzką, przezroczyste | moduły ①–⑧ kolejno opadają z osiadaniem, krawędzie najpierw złote, po osadzeniu kostne | linia powstaje w kolejności przepływu ładunku | numer pozycji gaśnie do `--gold-lo` | moduły unoszą się i znikają | jak desktop | moduły widoczne od razu w stanie końcowym rozdziału |
| S3 Automatyka | p 0.36→0.54 | brak tras i czujników | trasy kablowe rysują się (długość linii 0→100%), czujniki „zapalają się” z krótkim impulsem, szafa: drzwi 0→110°, wnętrze wysuwa się o 0.3 m i wraca | sterowanie to fizyczna, duża część linii | drzwi zostają otwarte do końca rozdziału, zamykają się na wejściu w 04 | odwrotnie | etykiety tylko szafy i czujników | stan końcowy rozdziału |
| S4 **Muting i człowiek** (kulminacja) | p 0.58→0.74 | linia w stanie PRACA, brama zamknięta, kurtyna aktywna (cienkie złote wiązki) | (a) paleta jedzie po przenośniku do bramy; (b) przecina dwie krzyżujące się wiązki czujników mutingu, które zapalają się `--gold-hi`, lampka mutingu świeci; (c) wiązki kurtyny przygasają (muting), brama zwija się w górę, paleta przejeżdża, brama opada, kurtyna znów aktywna; (d) od strony hali podchodzi człowiek; (e) przerywa wiązki kurtyny, które robią się `--signal-red`; wszystkie ruchome elementy stają, tabliczka pokazuje `STOP`, karta tekstu: „Człowieka nie przepuści.” | różnica między paletą a człowiekiem: tego nie pokaże jeden screenshot | człowiek cofa się, status wraca do `PRACA` przy wyjściu z rozdziału | cała sekwencja odwracalna (scrub) | kadr zbliżony na bramę; karta tekstu dzieli się na 3 kroki | trzy statyczne stany (paleta w mutingu / brama otwarta / człowiek → STOP) z podpisami |
| S5 Warstwa sieci | p 0.76→0.90 | hala w normalnym widoku | kamera unosi się; pod posadzką pojawiają się 3 płaszczyzny stref, połączenia rysują się przerywaną złotą linią od PLC do WMS/ERP; zapora przemysłowa jako „bramka” na granicy stref | każde połączenie przechodzi przez kontrolowany punkt | płaszczyzny zostają przyciemnione w 06 | odwrotnie | jak desktop, mniej etykiet | stan końcowy |
| S6 Praca linii | p ≥ 0.90 | wszystkie warstwy | kartony płyną, robot wykonuje cykl, paleta wyjeżdża przez bramę z mutingiem (pętla ok. 12 s) | linia działa jako całość | zatrzymanie renderu, gdy scena znika z ekranu | — | pętla z mniejszą liczbą kartonów | brak pętli, stan statyczny |
| S7 Stopka: napis z kropek (komponent z 21st.dev) | kursor nad stopką, klik; na telefonie stuknięcie | napis SYNERGY z kropek rastra w `--gold-lo`, nieruchomy | kropki w promieniu 80 px (telefon: 48 px) odsuwają się od kursora i wracają na sprężynach; im dalej od swojego miejsca, tym jaśniejsze, aż do `--gold-hi`; klik puszcza przez litery pierścień fali (0,9 px/ms, 900 ms) | na końcu strony zostaje w pamięci nazwa firmy | kropki wracają na miejsce, pętla zasypia | — | fala po stuknięciu; przewijanie palcem po napisie nie puszcza fali | napis stoi i nie reaguje |
| Mikrointerakcje | hover/focus/klik | — | CTA: strzałka przesuwa się o 3 px, tło `--gold-hi`; łącze „Do góry ↑” w stopce: podkreślenie rośnie od lewej; menedżer warstw: klik przewija do rozdziału; w 06 przełączniki włączają i wyłączają warstwy | — | — | — | dotyk zamiast hover | bez zmian (to nie animacja) |

Technika (po partyturze): three.js r149 (wersja UMD, plik lokalny w `vendor/`, działa z `file://`), kamera ortograficzna, `EdgesGeometry` + `LineBasicMaterial` dla krawędzi, `MeshBasicMaterial` w odcieniach `--carbon` dla wypełnień, `InstancedMesh` dla rolek. Render na żądanie (tylko przy zmianie postępu albo w pętli S6), `devicePixelRatio` ≤ 2. Postęp z położenia sekcji przeliczany odcinkami liniowymi na `p` (odcinki liczone z wysokości kart, patrz §3), wygładzany (lerp ~0.12/klatkę). Etykiety opisowe omijają panel warstw, tabliczkę, kolumnę kart i siebie nawzajem: próbują kolejno kierunku domyślnego, lustrzanego i przesunięć w pionie, a poprzedni wybór ma pierwszeństwo (bez skakania). Etykiety (numery pozycji) jako elementy HTML rzutowane z 3D.

Technika stopki (S7): komponent [Halftone Wordmark Footer](https://21st.dev/@kedhareswer/components/halftone-wordmark-footer) (Kedhareswer Naidu, licencja MIT) przeniesiony z Reacta do zwykłego JS w `js/footer.js`, z notą licencji w nagłówku pliku. Canvas 2D: napis składany raz na masce 1:1, każda komórka siatki dostaje kropkę o polu proporcjonalnym do pokrycia literą; fizyka sprężyn i fali bez zmian względem oryginału. Dopasowania: kolory z tokenów (`--void`, `--gold-lo` → `--gold-hi` zamiast pomarańczu z oryginału, którego nie ma w palecie), krój jak w logo, odstęp kropek = szerokość / 240 w granicach 4–8 px (6 px przy 1440, jak w oryginale), bez kolumn linków (nie ma adresu, telefonu ani social mediów), bez ukrytej kopii napisu dla czytników ekranu (nazwa firmy jest w tekście nad napisem), „Do góry” jako łącze do `#top` zamiast przycisku ze skryptem. Każda kropka rysowana osobno, jak w oryginale: wspólna ścieżka z tysięcy kół wyszła w pomiarze ok. 2,5× wolniejsza. Ziarno druku nakładane tylko w klatce spoczynkowej (w ruchu niewidoczne, a bez karty graficznej kosztuje tyle co kropki). Render tylko w ruchu i tylko wtedy, gdy stopka jest na ekranie albo bliżej niż 200 px od niego (napis jest gotowy, zanim wjedzie); scena 3D jest wtedy poza ekranem i nie rysuje. Po jawnym wczytaniu odmiany Archivo z logo (`document.fonts.load`) napis składa się jeszcze raz, bo samo `fonts.ready` z oryginału bywa spełnione, zanim przeglądarka zacznie ładować font (raz w testach napis złożył się wtedy fontem zapasowym).

## 9. Podstrona `oszacuj-koszt.html`

- Ta sama identyfikacja. Nagłówek: „Kwestionariusz kosztu linii jest w przygotowaniu.” Lead: „Uruchomimy go wkrótce. Poniżej znajdziesz pytania, które zadamy, żebyś mógł przygotować dane.”
- Trzy grupy z briefu: **Obowiązkowe** (8), **„Nie wiem” wystarczy** (9), **Opcjonalne** (3). Przy każdym polu jedno zdanie „dlaczego pytamy / co to zmienia w koszcie”. Przy polu „Standardy klienta”: przykład „np. preferowany producent sterowników lub komponentów bezpieczeństwa”.
- Działający przycisk „Kopiuj listę pytań” (schowek, a gdy przeglądarka odmówi: zaznaczenie listy). Wydruk przez Ctrl+P ma własny styl: czarno na białym.
- Powrót do strony głównej. Brak formularza, bo nie ma dokąd wysłać danych.

## 10. Responsywność i dostępność

- Mobile (390×844), od 2026-10-27: ekran dzielony. Scena przypięta w górnej połowie (50% wysokości, nad kartami), karty przewijają się pod nią na pełną szerokość, więc tekst nie zasłania animacji (wcześniej karta Mechaniki zakrywała ~90% ekranu). Karta otwarcia jako jedyna leży na scenie, a animacja arkusza 01 rusza, gdy z niej zjedzie. Menedżer warstw jako pasek 01–05. Etykiety opisowe 9,5 px, kolumny opisów szafy ukryte. 320 px: H1 ≤ 4 wiersze, bez poziomego przewijania.
- Semantyka: `header`, `main`, sekcje z nagłówkami, `nav` z linkami kotwic, `footer`. Canvas `aria-hidden="true"`, a cała treść sceny jest w kartach tekstu (nic nie istnieje tylko w obrazie). Widoczny focus (złota obwódka 2 px). Kontrast sprawdzany na rzeczywistych parach.
- Stopka: canvas z napisem `aria-hidden`, nazwa firmy jest w tekście nad nim. „Do góry ↑” to zwykłe łącze do `#top` (klawiatura, fokus). Na ekranie dotykowym przewijanie palcem po napisie działa normalnie, a fala rusza tylko po stuknięciu.
- `prefers-reduced-motion`: kamera skokowo na klatki kluczowe, sekwencja S4 jako trzy stany, brak pętli S6, napis w stopce stoi. Brak WebGL: obrazy zastępcze PNG (rendery stanów 0, 2, 3, 4, 5, 6 wykonane z tej samej sceny).

## 11. Technologia

- Statyczne HTML + CSS + JS, bez bundlera. Pliki: `index.html`, `oszacuj-koszt.html`, `css/styles.css`, `js/scene.js` (geometria i materiały), `js/main.js` (przewijanie, partytura, etykiety, UI), `js/footer.js` (stopka z napisem z kropek, komponent z 21st.dev, licencja MIT), `vendor/three.min.js` (r149, licencja MIT), `assets/fallback/*.jpg`.
- Otwieranie: dwuklik `index.html` (działa z `file://`) albo `uruchom.cmd` (lokalny serwer `python -m http.server` + otwarcie przeglądarki).
- Fonty z Google Fonts (wymagają internetu; bez niego fonty systemowe).
- Bez backendu, analityki i formularzy wysyłających dane.
- Parametr testowy `?p=0.65` ustawia postęp sceny po załadowaniu (do QA i renderów zastępczych).

## 12. Matryca wymagań

Wyniki z 2026-10-26, aktualizacja 2026-10-27. Narzędzie: Chrome bez okna (headless) sterowany przez DevTools Protocol z Pythona, renderowanie WebGL programowe (SwiftShader). Zrzuty robione w punktach postępu sceny ustawianych parametrem `?p=` (oraz `&t=` dla pętli czasowej).

| Wymaganie | Źródło / status | Realizacja | Weryfikacja | Wynik |
|---|---|---|---|---|
| Jedna grupa odbiorców, jedno główne CTA | quest | wers „Dla osób, którym powierzono…”, jedno CTA „Oszacuj koszt swojej linii” | przegląd treści + test: 5 złotych przycisków, wszystkie → `oszacuj-koszt.html` | spełnione |
| Nagłówek + propozycja wartości + CTA na pierwszym ekranie | quest | §2 | zrzuty 1440×900 i 1366×768 | spełnione (oba rozmiary) |
| Przycisk działa i prowadzi tam, gdzie powinien | quest, etap 4a | link do `oszacuj-koszt.html` | test: podstrona się ładuje, 20 pytań, przycisk „Kopiuj listę pytań” podpięty | spełnione |
| Obracana izometryczna hala przy przewijaniu | Rafał, etap 4 | S1 | klatki p = 0, .11, .25, .39, .48, .57, .635, .735, .84, .945, 1 | spełnione: azymut 45° → −315° (pełny obrót, powrót do kadru otwarcia) |
| Maszyny dokładane kolejno | Rafał, etap 4 | S2, kamera śledzi montaż | klatki p = .25, .34 | spełnione |
| Elektryka, czujniki indukcyjne i foto, szafa z widokiem wnętrza, E-stopy, HMI, styczniki, złączki DIN, kontrola konturu, skaner QR | Rafał, etap 4 + poprawki | S3 + zbliżenie na szafę (zoom 10×) | klatki p = .39, .48 | spełnione |
| Skanery, radar, kurtyna z mutingiem krzyżowym, brama szybkobieżna animowana | Rafał, etap 5 | S4 | klatki p = .57, .635 (paleta w bramie, muting, brama otwarta), .735 (STOP) | spełnione |
| Sieć OT odrębna, za zaporą; dostęp z internetu blokowany | Rafał, poprawki planu | S5 | klatka p = .84 (złote i czerwone pakiety, etykieta „Dostęp z zewnątrz zablokowany”) | spełnione |
| Jasna informacja, czym zajmuje się firma (od A do Z) | Rafał, poprawki planu | lead + sekcja „Zakres” A–G | zrzuty desktop i telefon | spełnione |
| Ludzie przy maszynach | Rafał, etap 6 | 7 sylwetek (hala, wózek widłowy, pieszy, operator, serwisant, człowiek przy kurtynie, odbiór palet) | klatki | spełnione |
| Czerń + złote akcenty | Rafał, etap 7 | §5 | porównanie zrzutów z tokenami | spełnione: brak obcych barw; czerwień i żółć tylko na E-stopach, polach skanera i radaru, kurtynach i statusie STOP |
| Bez kosztów na landingu | Rafał, etap 4 | pole kosztu zamaskowane | przegląd treści | spełnione |
| Przykład oznaczony jako przykład | CLAUDE.md | pieczątka, tabliczka „Przykładowa linia · dane fikcyjne”, stopka | przegląd | spełnione |
| Bez opinii, logotypów, liczb i certyfikatów firmy | CLAUDE.md, etap 5 | brak sekcji | przegląd | spełnione |
| Przepisy ze źródłem + „nie porada prawna” | rules.md; Rafał 2026-10-27: usunąć listę źródeł | karty 04 i 05: nazwa rozporządzenia jest linkiem do EUR-Lex; zastrzeżenie w stopce | przegląd linków | spełnione (źródło jako link w tekście; konflikt z rules.md zgłoszony Rafałowi) |
| „Ryzyko zmniejszane do akceptowalnego poziomu” | rules.md | karta 04 | przegląd | spełnione |
| Mobile bez rozjeżdżania | quest | §10 | zrzuty 390×844 i 320×640: `scrollWidth = innerWidth` | spełnione |
| Ograniczony ruch | skill | kwantyzacja do stanów arkuszy | emulacja `prefers-reduced-motion`, p = .70 → stan STOP | spełnione |
| Brak WebGL | skill | obrazy zastępcze JPEG (9 stanów, odświeżone 2026-10-27) | Chrome z `--disable-webgl`: obraz zastępczy, status „—” | spełnione |
| Nawigacja i interakcje | skill | linki do arkuszy, przyciski warstw, przełączniki w finale | test 1440×900, 1366×768, 390×844: każdy link i przycisk warstwy ląduje na właściwej karcie (komputer: cała karta widoczna; telefon: nagłówek pod sceną), tabliczka pokazuje właściwy arkusz; przełączniki chowają i przywracają warstwy; kolejność Tab logiczna; konsola bez błędów | spełnione |
| Tekst przed animacją (synchronizacja) | Rafał, przegląd 2026-10-27 | §3: `data-s`, mapowanie przewijania, karty sticky | diagnostyka przewijaniem co 8 px przy 1366×768, 1920×1080, 390×844, 320×568: dla każdej karty postęp, przy którym widać jej nagłówek, jest mniejszy niż początek jej animacji; karty nigdzie na siebie nie nachodzą | spełnione |
| Co najmniej jedna poprawka po świeżym przeglądzie | quest | przegląd Rafała w `TRESC.md` + uwaga o rozjeździe animacji z tekstem | treści wprowadzone, synchronizacja poprawiona (§13) | spełnione (2026-10-27) |
| Animowany komponent z 21st.dev, z zapisanym celem | quest 21st.dev; wybór Rafała 2026-10-27 | stopka: Halftone Wordmark Footer (§8 S7). Cel: „Duży napis SYNERGY z kropek w stopce, który odsuwa się od kursora, żeby na końcu strony nazwa firmy zapadła w pamięć.” | zrzuty 1440×900, 1366×768, 1920×1080, 390×844, 320×568; ruch kursora, kliknięcie, stuknięcie | spełnione |
| Animacja nie zasłania treści i nie przeszkadza w kliknięciu głównego przycisku | quest 21st.dev, kryteria akceptacji | napis pod tekstem stopki, w osobnym pasie; płótno bez zdarzeń wskaźnika (`pointer-events: none`) | `elementFromPoint` w środku CTA finału trafia w przycisk (1440, 1366, 1920, 390, 320); `scrollWidth = innerWidth`; przewijanie palcem zaczęte na napisie przewija stronę (przeglądarka zgłasza `pointercancel`, fala nie rusza) | spełnione |
| Animacja wyłącza się przy ograniczeniu ruchu | Rafał (dopisek do promptu) | `prefers-reduced-motion`: napis stoi, kursor i kliknięcie nic nie robią, „Do góry” bez płynnego przewijania | emulacja: obraz płótna bez zmian po ruchu kursora i kliknięciu | spełnione |

## 13. Weryfikacja: przebieg i ograniczenia

**Poprawki wprowadzone w trakcie budowy (z obserwacji zrzutów):**

- Zbliżenia kamery uciekały w bok: przesunięcie kadru nie było dzielone przez zoom (three.js nie skaluje środka kadru). Poprawione, kadr szafy i bramy siedzi w prawej części ekranu.
- Otwarcie było za płaskie: dodane linie wymiarowe hali (50 000 × 28 000, dane przykładowe) i złota linia cięcia na koronie ścian, H1 zmniejszony z 5 do 4 wierszy.
- Montaż (arkusz 02): kamera śledzi teraz kolejne moduły zamiast stać w miejscu.
- Szafa: wyższy kąt kamery (19°), żeby przenośnik z pierwszego planu nie zasłaniał dołu szafy; serwisant przeniesiony, etykiety rozsunięte.
- Brama: kąt kamery zmieniony tak, by estakada nie wchodziła w kadr.
- Telefon: etykiety przycinane do krawędzi ekranu, kompaktowe otwarcie (CTA widoczne przy 320×640), pieczątka i tabela zakresu poprawione.
- Finał: obiekty spoza hali (sieć biurowa, internet) gasną, żeby nie wchodziły pod panel warstw; palety w ruchu chowają się razem z warstwą mechaniki.
- Sylwetki ludzi: z kapsuł na postacie z nogami, tułowiem i rękami.

**Poprawki po przeglądzie Rafała (2026-10-27):**

- Treść: teksty Rafała z `TRESC.md` wprowadzone 1:1 tam, gdzie nie było błędu; poprawki inżynierskie i językowe opisane w `LANDING_BRIEF.md`.
- Synchronizacja tekstu z animacją (§3): nagłówek karty widoczny przed jej animacją na każdym rozmiarze.
- Telefon: ekran dzielony, scena nad kartami (§10).
- Etykiety: omijają panel warstw, tabliczkę i kolumnę kart; kolumna opisów szafy zaczyna się pod panelem warstw; na telefonie nie nachodzą na siebie.
- Rysunek: narożniki ochronne na paletach wysyłkowych (pojawiają się razem z folią) i magazynek aplikatora narożników przy maszcie owijarki; etykiety „WYŁĄCZNIK GŁÓWNY”, „ZASILACZE 24 V · PRZEŁĄCZNIK”.
- Obrazy zastępcze odświeżone (9 stanów, nowy p57 dla przeglądu bezpieczeństwa).
- Niskie telefony (wysokość ≤ 700 px, np. 375×667, 320×640): w otwarciu chowamy ostatnie zdanie (ocena ryzyka), żeby H1, propozycja wartości i CTA zmieściły się na pierwszym ekranie. Przy szerokości ≤ 380 px w górnym pasku zostaje sam znak „SYNERGY” (wcześniej przycisk „Oszacuj koszt” wychodził za krawędź przy 320 i 360 px).

**Zadanie 21st.dev: stopka z napisem z kropek (2026-10-27):**

- Plan zaakceptowany przez Rafała przed zmianami; komponent wybrał Rafał (moja propozycja, Shimmer Button na przycisku CTA, odpadła). Wdrożenie i dopasowania: §8 (technika stopki).
- Sprawdzone w Chrome bez okna: zrzuty na 5 rozmiarach; kursor rozsuwa kropki, a po jego zejściu obraz wraca bit w bit do stanu spoczynku i pętla zasypia; kliknięcie i stuknięcie puszczają falę; palec przesuwany po napisie przewija stronę bez fali; CTA finału klikalne; „Do góry” z fokusem klawiatury wraca na początek; przy ograniczonym ruchu napis stoi; po wolnym wczytaniu fontu (opóźnienie sieci 1,5–2,5 s) napis jest złożony Archivo; konsola bez błędów.
- Poprawki po testach: (1) wspólna ścieżka dla wszystkich kropek, którą dodałem jako „przyspieszenie”, okazała się wolniejsza (pomiar: ok. 375 vs 151 ms na klatkę na programowym GPU), więc wróciłem do rysowania jak w oryginale; (2) ziarno tylko w klatce spoczynkowej; (3) jawne wczytanie fontu (raz napis złożył się fontem zapasowym); (4) rysowanie z wyprzedzeniem 200 px (przy szybkim skoku na koniec strony pas napisu był przez chwilę pusty); (5) 8 px więcej odstępu nad napisem na telefonie.
- Liczba kropek (pomiar tym samym algorytmem): 3124 przy 1440 px, 2989 przy 1920 px, 609 przy 390 px. Domyślne demo oryginału (1440×560, policzone z Arialem zamiast Inter Tight) ma 4980, czyli więcej niż u nas.
- Niesprawdzone: płynność na prawdziwej karcie graficznej i telefonie. W tej sesji Chrome miał tylko renderowanie programowe (mediana klatki w ruchu 33–50 ms, czyli ok. 20–30 kl./s; to mówi o koszcie, nie o tym, co zobaczy użytkownik z kartą graficzną).

**Czego nie sprawdziłem:**

- Płynności przewijania na prawdziwej karcie graficznej i telefonie. Testy szły na programowym renderowaniu (SwiftShader), które nie mówi nic o liczbie klatek na sekundę. Pierwszym testem u Rafała jest przewinięcie strony w zwykłej przeglądarce.
- Ruch w czasie (pętla w arkuszu 06, robot) sprawdziłem na pojedynczych klatkach dla różnych czasów `t`, nie na nagraniu.
- Czytnika ekranu nie testowałem; semantyka i kolejność fokusu są sprawdzone w kodzie i testem klawiatury.

**Uruchomienie:** dwuklik `index.html` (działa z `file://`, three.js jest lokalnie w `vendor/`) albo `uruchom.cmd` (serwer `python -m http.server 8080` i otwarcie przeglądarki). Fonty z Google Fonts wymagają internetu; bez niego strona użyje fontów systemowych.

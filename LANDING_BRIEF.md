# Landing brief: Synergy Engineering (integrator intralogistyki)

> Status (2026-10-27): wywiad zakończony, plan poprawiony przez Rafała, strona zbudowana i sprawdzona. Przegląd treści przez Rafała (`TRESC.md`) wprowadzony, rozjazd animacji z tekstem poprawiony (krok questu „poprawka po przeglądzie” spełniony; wyniki w `DESIGN.md` §12–13). Zadanie 21st.dev (2026-10-27): stopka z komponentem Halftone Wordmark Footer, sprawdzona (`DESIGN.md` §12–13). Otwarte: screenshoty do Circle (pierwszy ekran; stopka z komponentem).
> Źródła: `brief.md`, `rules.md`, `context/firma.md`, `8-System/about.md` (Super Brain, tylko do odczytu), treść questu z kursu AI Product Builder (wklejona przez Rafała 2026-10-26).

## Po co ta strona

Zadanie domowe na kursie AI Product Builder (quest „landing page”), ścieżka **„Własny produkt od zera”**: jeden pomysł dla jednej konkretnej grupy odbiorców. Korzyści na stronie to obietnica do sprawdzenia, a nie potwierdzony fakt. Strona nie jest docelową stroną firmy.

## Fakty (supplied)

- Firma: **Synergy Engineering**, fikcyjny integrator systemów intralogistycznych. Rafał występuje w roli prezesa (rola tylko na potrzeby projektu).
- Zakres: przenośniki rolkowe i łańcuchowe, krzyżownice, obrotnice, stackery i destackery, windy z przenośnikami, wózki poprzeczne, paletyzatory i depaletyzatory. Klient sam określa, czy potrzebuje samej mechaniki, czy pełnej integracji.
- Odbiorca (brief): osoba, której firma powierzyła automatyzację transportu wewnętrznego i która musi wykazać oszczędność (dyrektor techniczny, kierownik produkcji, logistyki lub utrzymania ruchu). Zna proces i liczby, nie zna kosztotwórczych szczegółów systemu ani wymagań CE. Musi uzasadnić inwestycję przed zarządem.
- Rdzeń produktu: rozmowa z AI ze wskaźnikiem postępu, która składa kompletne zapytanie dla zespołu pierwszego kontaktu (prezes, inżynier sprzedaży, inżynier aplikacji). Widełki kosztów i asystent wiedzy o 2023/1230 to kolejny etap.
- Język: polski (pierwsza wersja na Polskę).

## Hipotezy (niepotwierdzone)

- Zapytania klientów są niepełne i wymagają wielu rund pytań (brief, open question 1).
- Konkurencja nie oferuje orientacyjnej kalkulacji ani pilnowania kompletu danych (brief, open question 2).

## Rejestr decyzji

| Etap | Odpowiedź Rafała | Decyzja | Uzasadnienie | Status |
|---|---|---|---|---|
| 1 | „raczej opcja 1” | Nowa strona dla prawdziwego pomysłu produktowego Rafała; nadawca (Synergy Engineering) fikcyjny | Quest: ścieżka „własny produkt od zera”. Oferty nie wymyślamy, identyfikację wizualną projektuje agent, bo firma jej nie ma | chosen |
| 2 | „są to usługi i produkcja budowy maszyn od zera” + kwestionariusz z ceną | Typ główny: usługa (projekt i budowa systemu od zera). Pomocniczo: narzędzie na stronie, czyli kwestionariusz krok po kroku, który kończy się orientacyjnym kosztem systemu | Klient kupuje system od integratora. Kwestionariusz z kosztem to wyróżnik wobec stron z pustym polem „zapytanie” | chosen |
| 2a | „przerobisz zdjęcia innych integratorów albo makieta” | Bez zdjęć innych firm. Maszyny pokazujemy jako makiety i ilustracje rysowane w kodzie | Prawa autorskie i zakaz zmyślonych realizacji (CLAUDE.md). Rafał sam wskazał makietę, a w etapie 4 opisał animowaną halę w przekroju | chosen |
| 3 | „masz rację… może dużo wiedzieć, ale też może mało wiedzieć” | Odbiorca zna problem i szuka rozwiązania (2), z potrzebą konkretu technicznego (5). Kwestionariusz obsługuje obie skrajności: przy każdym pytaniu „nie wiem / do ustalenia” i krótkie „dlaczego pytamy, co to zmienia w koszcie” | Tak wygląda praktyka u Rafała: przychodzą klienci, którzy wiedzą dużo, i tacy, którzy wiedzą mało | chosen |
| 3a | portret odbiorcy | Kierownik logistyki lub produkcji z zadaniem od zarządu: zautomatyzować transport wewnętrzny i pokazać oszczędność. Potrzebuje rzędu wielkości kosztu, zanim ogłosi zapytanie ofertowe | Hipoteza robocza z briefu, niepotwierdzona badaniem | chosen (hipoteza) |
| 3b | „wstępnie przekalkulowany zamiar klienta, niewiążący” | Wynik kwestionariusza nazywamy niewiążącym, wstępnym szacunkiem. Odbiera go zespół pierwszego kontaktu (m.in. inżynier aplikacji), który nie jest odbiorcą landingu | Landing ma jedną grupę odbiorców: klienta | chosen |
| 4 | „na landing page musi znaleźć się demo… nie podajemy kosztów… koszty klient pozna po kliknięciu w stronę oszacuj koszt swojej linii” | Główne CTA: „Oszacuj koszt swojej linii”. Na landingu nie ma kalkulatora ani kosztów. Kwestionariusz z kosztem to osobna strona (przyszły prototyp) | Landing pokazuje, co produkt potrafi. Kalkulator to kolejny etap | chosen |
| 4a | „wybieram rekomendację numer 1” | CTA prowadzi na podstronę `oszacuj-koszt.html`: uczciwa informacja, że kwestionariusz jest w przygotowaniu, oraz lista danych, o które zapytamy (pola obowiązkowe i „nie wiem” z briefu). W przyszłym tygodniu w tym miejscu stanie prototyp | Przycisk działa i prowadzi tam, gdzie powinien (quest), bez udawania kalkulatora | chosen |
| 4b | „obracać pustą halę w widoku izometrycznym podczas przewijania… elektryka, czujniki indukcyjne, foto, szafa elektryczna z widokiem środka, e-stopy… środki techniczne bezpieczeństwa… IT i cyberbezpieczeństwo OT” | Scena: izometryczna hala obraca się przy przewijaniu. Warstwy w kolejności: mechanika → elektryka i automatyka (czujniki indukcyjne, fotoelektryczne, szafa sterownicza z widokiem wnętrza, wyłączniki awaryjne) → techniczne środki bezpieczeństwa → IT i cyberbezpieczeństwo sieci OT | Pokazuje pełny zakres integracji, nie tylko mechanikę | chosen |
| 5 | „bierz to, co zarekomendowałeś” | Dowody: metoda, proces i zakres (warstwy demo, proces po wysłaniu zapytania, przepisy ze źródłami) + przykładowe zapytanie oznaczone jako przykład + jasne warunki (szacunek niewiążący, to nie oferta, co dzieje się z danymi). Bez sekcji opinii i bez „lat doświadczenia” firmy | Fikcyjna firma nie ma realizacji. Techniczny odbiorca ufa precyzji. Puste ramki na opinie przyciągają uwagę do braków | chosen |
| 5a | „skanery, radary, kurtyny bezpieczeństwa z mutingiem krzyżowym, e-stopy np. Pilz, Banner, SICK… przenośnik kończący się przed bramą szybkobieżną… przed bramą kurtyna + czujniki krzyżowe mutingu” | Te komponenty w scenie. Brama szybkobieżna animowana. Komponenty rysowane generycznie, bez logotypów i bez sugerowania partnerstwa z producentami | Nazwy producentów jako „nasi partnerzy” byłyby zmyśloną relacją (CLAUDE.md); logotypy to cudze znaki towarowe | chosen (forma nazw producentów: propozycja agenta) |
| 5b | „własne materiały są poufne… budujemy na tym, co jest dostępne w internecie” | Żadnych materiałów Rafała ani pracodawcy. Wiedza z publicznych źródeł, ze wskazaniem źródła | Poufność | supplied |
| 6/8/10B (z opisu w etapie 4) | „pusta w przekroju hala… dokładamy maszyny… potem środki bezpieczeństwa… opisujemy krok po kroku… wraz ze schodzeniem z góry na dół” | Prowadzi animowana ilustracja hali w przekroju. Przy przewijaniu dochodzą kolejne maszyny linii, potem techniczne środki bezpieczeństwa. Każdy krok ma opis | Pokazuje kompetencję i działanie produktu bez zdjęć i bez kosztów | chosen (styl rysunku otwarty: etap 6) |
| 6 | „może być 10 i 7, ale też np. 6 i człowiek przy tych maszynach” | Hierarchia: 10 (scena 3D w rzucie ortograficznym/izometrycznym) prowadzi; 7 (język rysunku złożeniowego: krawędzie, warstwy w kolorach, numery pozycji) to sposób rysowania; 6 (ilustracyjne ciepło) wnoszą postacie ludzi, uproszczone i spójne z rysunkiem technicznym. Człowiek daje skalę i jest bohaterem warstwy bezpieczeństwa | Rafał wskazał trzy materiały; skill wymaga jednej dominanty | chosen (hierarchia: propozycja agenta) |
| 7 | „numer 1 i 4… czarny ze złotymi dodatkami… nie chcę uścisków dłoni ani haseł »kompleksowe rozwiązania«… ma być niesztampowo” | Osobowość: bezpośrednia i precyzyjna (1), ludzka (4). Rzeczowo, po inżyniersku, jak człowiek z człowiekiem. Paleta: czerń i złoto | Słowa Rafała | chosen |
| 9 (z opisu w etapie 4) | „najpierw wow, efekt twórczy, piękny, a dopiero potem konkrety” | Kolejność: obraz, który robi wrażenie → przykład animowany przy przewijaniu → konkrety → akcja | Słowa Rafała | chosen |
| 10A (z opisu w etapie 4) | animowanie i dokładanie maszyn przy przewijaniu | Ruch co najmniej ekspresyjny: choreografia przewijania buduje scenę | Słowa Rafała | chosen (poziom do potwierdzenia w etapie 10) |
| 8 | z opisu w etapie 4 („schodzenie z góry na dół”) | Sekwencja rozdziałów (arkusze) z jedną przypiętą sceną; po scenie: przykładowe zapytanie, proces, finał | Wynika z opisu Rafała | chosen (wynika z opisu) |
| 10A | z opisu w etapach 4–6 | Kinowy / przestrzenny: obracana kamera 3D, sekwencje i przejścia powiązane z przewijaniem | Obrót hali i dokładanie warstw to ruch przestrzenny | chosen (wynika z opisu) |
| 10B | z opisu w etapach 4–5 | Sekwencja przewijania; kulminacja: kurtyna z mutingiem krzyżowym przepuszcza paletę, a człowiek ją przerywa i linia staje | Brama i kurtyna wskazane przez Rafała; człowiek z etapu 6 | chosen (kulminacja: propozycja agenta) |
| 11 | z etapów 2a, 5b, 6 | Grafika rysowana w kodzie (three.js) + typografia; bez zdjęć i materiałów poufnych | Prawa autorskie, poufność, obrót 3D | chosen |
| 12 | z treści questu | Działająca strona lokalna w tym folderze, otwarta w przeglądarce | Quest wymaga zbudowania i otwarcia strony w przeglądarce oraz screenshotu | supplied |
| 21st.dev (2026-10-27) | „Może byśmy urozmaicili tylko to logo Synergy Engineering” → Rafał wskazał Halftone Wordmark Footer i po opisie planu wkleił jego prompt | Animowany komponent z 21st.dev: stopka z dużym napisem SYNERGY z kropek, które reagują na kursor. Propozycja agenta (Shimmer Button na przycisku CTA, mocniejszy cel w rozumieniu zadania) odpadła | Cel do checklisty: „Duży napis SYNERGY z kropek w stopce, który odsuwa się od kursora, żeby na końcu strony nazwa firmy zapadła w pamięć.” Cel słabszy niż przy CTA (zgłoszone Rafałowi), ale komponent jest niesztampowy, w spoczynku nieruchomy i stoi pod ostatnim CTA | chosen |

## Życzenia Rafała do produktu (2026-10-26)

- Klient przechodzi kwestionariusz krok po kroku, bardziej szczegółowy niż puste pole „zapytanie”, i wybiera zespoły maszyn.
- Orientacyjny koszt systemu widzi dopiero po podaniu e-maila i danych kontaktowych. Cel: zespół wie, kto pyta, rozpoznaje rzeczywiste intencje i nie gubi klienta. Zgodne z briefem (kierunek 2), ale tam oznaczone jako „kolejny etap”, a nie prototyp kursowy.
- Ceny orientacyjne dla poszczególnych zespołów maszyn zależą od wyborów klienta.

## Referencja

Strona innego kursanta (https://claude.ai/artifact/PjShABudi9eqHiHtNjXxvr, aplikacja dla osób budujących dom). Przejmujemy mechanizmy, nie kompozycję, paletę, fonty ani teksty:

- izometryczny świat rysowany w kodzie (SVG), który rozbudowuje się w odpowiedzi na działania użytkownika; u nas: linia intralogistyczna składa się z modułów wybranych w kwestionariuszu,
- uczciwe oznaczanie treści przykładowych i pustych miejsc na opinie,
- demo produktu bezpośrednio na stronie.

Nie przejmujemy: ciepłej „papierowej” palety, zestawu fontów (Bricolage Grotesque, Figtree, IBM Plex Mono) ani układu sekcji.

## Wymagania wiążące

| Wymaganie | Źródło |
|---|---|
| Jedna grupa odbiorców i jedno główne CTA | quest, kryteria akceptacji |
| Nagłówek, propozycja wartości i główne CTA widoczne na jednym screenshocie | quest, kryteria akceptacji |
| Plan pokazany Rafałowi przed budową; budowa dopiero po jego poprawkach | quest, checklista |
| Główny przycisk działa i prowadzi tam, gdzie powinien | quest, „Sprawdź stronę” |
| Sprawdzenie na komputerze i w widoku telefonu; nic się nie rozjeżdża | quest |
| Co najmniej jedna poprawka po świeżym przeglądzie strony | quest, checklista |
| Język polski | brief |
| Bez zmyślonych opinii, logotypów klientów, liczb, certyfikatów i realizacji; braki jako wyraźnie oznaczone placeholdery | CLAUDE.md, rules.md |
| Korzyści formułowane jako obietnica, nie fakt | CLAUDE.md, quest |
| Przepisy (2006/42/WE, 2023/1230, EN ISO 12100) zawsze ze źródłem i zastrzeżeniem, że to nie porada prawna. Od 2026-10-27 źródło jako link w nazwie aktu, bez osobnej listy źródeł (Rafał) | rules.md; Rafał |
| Ryzyko „zmniejszane do akceptowalnego poziomu”, nie „eliminowane” | rules.md |
| Strona nie podaje kosztów wyliczonych przez LLM | rules.md |
| Pliki strony tylko w tym folderze; nic nie zapisujemy w `super-brain-main` | CLAUDE.md |
| Demo na landingu: pusta hala w przekroju; przy przewijaniu dochodzą kolejne maszyny linii, potem techniczne środki bezpieczeństwa; każdy krok opisany | Rafał, etap 4 |
| Na landingu nie ma kosztów ani działającego kalkulatora | Rafał, etap 4 |
| Hala w widoku izometrycznym obraca się podczas przewijania | Rafał, etap 4 |
| Warstwy demo: mechanika → elektryka i automatyka (czujniki indukcyjne, fotoelektryczne, szafa sterownicza z widokiem wnętrza, wyłączniki awaryjne) → techniczne środki bezpieczeństwa → IT i cyberbezpieczeństwo sieci OT | Rafał, etap 4 |
| Główne CTA prowadzi na działającą podstronę `oszacuj-koszt.html` (uczciwa zapowiedź + lista danych do przygotowania) | Rafał, etap 4 |
| Treści o cyberbezpieczeństwie OT i przepisach ze źródłami i zastrzeżeniem, że to nie porada prawna | rules.md |
| Komponenty w scenie: skanery laserowe bezpieczeństwa, radary bezpieczeństwa, kurtyny bezpieczeństwa z mutingiem krzyżowym, wyłączniki awaryjne; przenośnik kończy się przed animowaną bramą szybkobieżną, przed nią kurtyna i czujniki mutingu | Rafał, etap 5 |
| Bez logotypów producentów i bez sugerowania partnerstw | CLAUDE.md (zmyślone relacje), etap 5 |
| Bez materiałów poufnych; tylko wiedza publiczna ze źródłami | Rafał, etap 5 |
| Bez sekcji opinii | Rafał, etap 5 |
| Ludzie przy maszynach w scenie | Rafał, etap 6 |
| Paleta: czerń ze złotymi akcentami (jedyny „marketingowy” sygnał poza treścią) | Rafał, etap 7 |
| Ton: rzeczowo, po inżyniersku, jak człowiek z człowiekiem; bez nadęcia | Rafał, etap 7 |
| Zakazane klisze: zdjęcia uścisku dłoni, „kompleksowe rozwiązania”, sztampa | Rafał, etap 7 |
| Scena 3D (obrót przy przewijaniu) z wersją zapasową dla słabszych urządzeń i ograniczonego ruchu | Rafał, etap 6 + skill |
| Linia w demo to wyraźnie oznaczony przykład, nie realizacja Synergy | CLAUDE.md |
| Pierwszy ekran: obraz, który robi wrażenie, oraz nagłówek, propozycja wartości i CTA (screenshot do zaliczenia) | Rafał, etap 4 + quest |
| Tekst karty widoczny, zanim ruszy animacja jej arkusza (tekst i animacja zsynchronizowane) | Rafał, przegląd 2026-10-27 |
| Teksty strony: wersja Rafała z `TRESC.md`; agent poprawia tylko błędy inżynierskie i językowe i je zgłasza | Rafał, 2026-10-27 |
| Jeden animowany komponent z 21st.dev, z celem zapisanym w jednym zdaniu; nie zasłania treści i nie przeszkadza w kliknięciu głównego przycisku; wyłącza się przy ograniczeniu ruchu; sprawdzony na komputerze i telefonie | quest 21st.dev (kryteria akceptacji, checklista) |
| Zmiany na stronie dopiero po akceptacji planu przez Rafała | Rafał, 2026-10-27 |

## Przykładowa linia: uwagi Rafała do planu (2026-10-26)

- **Scenariusz Rafała:** wózek widłowy podaje zafoliowaną paletę EUR z kartonami na przenośnik rolkowy → kolejny rolkowy → winda z przenośnikiem wciąga paletę na antresolę → obrotnica → rolkowy → druga winda zjeżdża w dół → krzyżownica → przenośnik łańcuchowy (paleta szerszym bokiem 1200) do celi robota → robot przekłada kartony na nową paletę i pobiera kartonowe przekładki z sąsiedniej palety; destacker podaje puste palety osobną nitką przez hydrauliczny stół nożycowy → gotowa paleta: rolkowy → obrotnica z owijaniem folią stretch → rolkowy → brama szybkobieżna → rolkowy → wózek poprzeczny → rolkowy → stół podnośny hydrauliczny w wykopie w posadzce. Rafał dopuszcza uproszczenie przez agenta.
- **Zabezpieczenia (pkt 2 planu):** akceptacja + czujniki kontroli konturu + skaner kodów QR (produkty i paleta owinięta na obrotnicy).
- **Szafa (pkt 3 planu):** akceptacja + styczniki, złączki na szynach DIN, panel HMI na drzwiach.
- Rafał prosi o przypomnienie pytań z etapów 8–12 (zapisanych jako „wynika z opisu”). Przypomniane; brak zmian.
- **Akceptacja:** estakada nad drogą dla wózków widłowych i pieszych; proces „przepaletyzowanie kartonów z palety dostawczej na paletę wysyłkową z przekładkami”; numeracja pozycji jak na rysunku złożeniowym (11 pozycji).
- **Nowe wymaganie:** strona ma jasno mówić, czym zajmuje się firma: budowa systemów intralogistycznych od A do Z ze wszystkimi aspektami (mechanika, produkcja, automatyka, bezpieczeństwo i CE, sieć OT i IT, montaż). Realizacja: sekcja „Zakres” jako wykaz pozycji A–G, bez frazy „kompleksowe rozwiązania”.
- **Nowe wymaganie:** animacja, że sieć OT jest odrębną siecią lokalną, oddzieloną zaporą od sieci organizacji i internetu; dostęp z zewnątrz jest blokowany. Zdalny serwis przez internet usunięty ze sceny (zostaje jako pytanie).

## Przegląd treści przez Rafała (2026-10-27)

Rafał poprawił teksty w `TRESC.md` (kopia jego wersji z uwagami `>>`: w scratchpadzie sesji, `TRESC_rafal_2026-10-27.md`) i zgłosił, że animacja wyprzedza tekst. Jego słowa weszły na stronę. Agent zmienił tylko to, co było błędne lub niespójne:

| Miejsce | Wersja Rafała | Na stronie | Powód |
|---|---|---|---|
| Otwarcie | „oddamy Tobie w pełni zwalidowany i bezpieczny system” | „oddamy Ci w pełni zwalidowany system, w którym ryzyko zmniejszyliśmy do akceptowalnego poziomu” | Ryzyko resztkowe zawsze zostaje (EN ISO 12100); rules.md: „zmniejszane do akceptowalnego poziomu”; karta 04 mówi to samo |
| Otwarcie | „zabezpieczymy Twoją sieć OT” | „zabezpieczymy sieć OT Twojej linii” | Zakres F to sieć linii i zapora, nie cała sieć OT zakładu |
| Arkusz 03 | „wystającym ze światła palety ładunkiem” | „z której ładunek wystaje poza obrys” | Utarty termin to obrys palety; „światło” kojarzy się z otworami na widły |
| Arkusz 03 | „Czujniki przesyłają informacje do sterownika PLC informację wejścia” | „Czujniki przesyłają na wejścia sterownika PLC informację o położeniu palet i maszyn” | Zdanie było urwane; sens zachowany |
| Arkusz 04 | „Na podstawie oceny ryzyka (EN ISO 12100) szacujemy ryzyko oraz określamy Performance Level…” | „W ocenie ryzyka (EN ISO 12100) szacujemy ryzyko, określamy wymagany Performance Level (PLr) … (EN ISO 13849-1)” | Szacowanie ryzyka jest częścią oceny, nie jej wynikiem; PLr wyznacza się według EN ISO 13849-1; radar i skaner to nie alternatywy (oba są w scenie) |
| Muting | „Paleta przecina je w określonej kolejności” (tekst agenta) | „Paleta przecina obie wiązki w określonym oknie czasowym” | Przy mutingu krzyżowym (2 czujniki) liczy się okno czasowe, kolejność dotyczy mutingu sekwencyjnego (4 czujniki) |
| Zatrzymanie | „Kurtyna rozpozna człowieka” | „Człowiek nie uruchomi mutingu tak jak paleta, więc kurtyna pozostaje aktywna” | Kurtyna nie rozpoznaje ludzi, wykrywa każde przerwanie wiązek; paletę od człowieka odróżnia układ mutingu. Pierwsze zdanie powtarzało nagłówek |
| Arkusz 02 + rysunek | „zabezpieczeniem krawędzi kartonów” | pozycja 8 „…i aplikatorem narożników”, narożniki na paletach wysyłkowych w scenie, w przykładowym zapytaniu „owijanie z zabezpieczeniem krawędzi” | Żadna maszyna na liście nie zakładała narożników |
| Zapytanie | „Formularz nawet bez pól obowiązkowych przepuści Ciebie dalej” | „…przepuści Cię dalej nawet bez nich, ale wtedy nie policzy kosztu orientacyjnego”; podstrona: to samo przy grupie „Obowiązkowe” | Bez tych pól deterministyczny model nie ma z czego liczyć (rules.md: LLM nie liczy kosztów) |
| Wszystkie karty | „Zapytamy Ciebie o:” (3 z 5 kart) | „Zapytamy Cię o:” we wszystkich 5 kartach | Forma nieakcentowana i jednolitość kart |
| Etykiety 3D | — | „WYŁĄCZNIK GŁÓWNY” (było „ROZŁĄCZNIK GŁÓWNY”), „ZASILACZE 24 V · PRZEŁĄCZNIK” (było „SWITCH”) | Zgodność z tekstem karty |

Drobne: literówki (Antresla, Perfrmance, rozpzna, Sięc), przecinki, „m. in.” → „m.in.”, „funkcje dla maszyn” → „funkcje maszyn”, „W poniższym przykładzie” → „W tym przykładzie” (scena jest obok karty, nie pod nią), „estakada” → „antresola” wszędzie (także na podstronie), prezes usunięty także ze stopki przykładowego zapytania.

**Konflikty z `rules.md` (Super Brain, do decyzji Rafała, agent tam nie pisze):**

- Źródła: rules.md każe podawać przepisy zawsze ze źródłem, a Rafał usunął listę źródeł. Kompromis na stronie: nazwa rozporządzenia jest linkiem do EUR-Lex, bez dopisku „Źródło”. Jeśli Rafał chce całkiem bez linków, warto zmienić regułę w rules.md.
- Zespół pierwszego kontaktu: rules.md (słownik) wymienia prezesa, inżyniera sprzedaży i inżyniera aplikacji, a Rafał na stronie zostawił inżynierów sprzedaży i aplikacji. Na stronie obowiązuje wersja Rafała; słownik do ujednolicenia.

Zostawione jak w wersji Rafała, choć agent by je zmienił (do jego decyzji): „Kompleksowo zajmiemy się…” (blisko zakazanej kliszy „kompleksowe rozwiązania”), „system szyty na Twoją miarę”, „posiada swój koszt” (naturalniej „ma swój koszt”), nagłówek „To dostaniesz na końcu.” i zaraz „Na końcu dostaniesz…”. Z otwarcia zniknęło zdanie o około 20 pytaniach i koszcie orientacyjnym; obietnicę niosą teraz H1, przycisk i dopisek „Szacunek niewiążący”.

## Status dowodów

| Typ | Status |
|---|---|
| Metoda / proces / zakres | dostępne: warstwy w scenie, proces, przepisy ze źródłem (link do EUR-Lex w tekście kart 04 i 05) |
| Przykładowe zapytanie | uczciwy zamiennik: pola z briefu, wartości fikcyjne, oznaczone „PRZYKŁAD” |
| Warunki | dostępne: szacunek niewiążący, to nie oferta, dane tylko dla zespołu pierwszego kontaktu |
| Opinie, realizacje, logotypy, certyfikaty | świadomie pominięte (brak; firma fikcyjna) |

## Otwarte zależności

- **Dokąd prowadzi główne CTA:** rozmowa z AI powstaje jako prototyp w kolejnym tygodniu kursu. Do rozstrzygnięcia w etapie 4.
- **Ile kwestionariusza działa na landingu:** pełny kalkulator czy próbka pierwszych kroków. Etap 4 i 10B.
- **Ceny modułów:** muszą pochodzić od Rafała jako fikcyjne założenia (nie dane pracodawcy) albo zostać wyraźnie oznaczonymi placeholderami. Agent ich nie wymyśla.
- **Bramka kontaktowa:** strona lokalna niczego nie wysyła. Formularz waliduje dane i mówi wprost, że to prototyp. Klauzula RODO jako oznaczona atrapa (brief, open question 6).
- Brak danych firmy: wielkość, lokalizacja, zespół, realizacje, ton komunikacji (firma.md: agent ich nie wymyśla).

## Nowe ustalenia o firmie do dopisania w `firma.md`

Zbierane w trakcie sesji, przekazane Rafałowi na koniec.

- Synergy Engineering świadczy usługi i sama produkuje maszyny: projektuje i buduje od zera m.in. przenośniki i windy (Rafał, 2026-10-26).
- Ton komunikacji: bezpośredni i precyzyjny, ludzki; rzeczowo, po inżyniersku, jak człowiek z człowiekiem. Bez klisz typu „kompleksowe rozwiązania” i zdjęć uścisku dłoni (Rafał, 2026-10-26).
- Identyfikacja wizualna: czerń ze złotymi akcentami (Rafał, 2026-10-26).
- Komponenty bezpieczeństwa, które Synergy stosuje w projektach (w roli): skanery laserowe, radary bezpieczeństwa, kurtyny bezpieczeństwa z mutingiem krzyżowym, wyłączniki awaryjne; bramy szybkobieżne na styku przenośnika z inną strefą (Rafał, 2026-10-26).
- Pierwszy kontakt: klient dostaje niewiążący, wstępny szacunek; koszt systemu widzi po podaniu danych kontaktowych (Rafał, 2026-10-26; zgodne z briefem, kierunek 2).
- Zakres „od A do Z”: koncepcja i layout, konstrukcja, produkcja, elektryka i automatyka, bezpieczeństwo maszyn i CE, sieć OT i integracja IT, montaż i uruchomienie. Klient może zamówić samą mechanikę (Rafał, 2026-10-26; pozycja „montaż i uruchomienie” to wniosek agenta z „od A do Z”, do potwierdzenia).
- Sieć OT linii projektowana jako odrębna sieć lokalna, oddzielona zaporą od sieci biurowej i internetu (Rafał, 2026-10-26).
- Oferta obejmuje także integrację z WMS oraz ocenę ryzyka z określeniem wymaganego poziomu PLr i walidacją funkcji bezpieczeństwa; klient dostaje zwalidowany system (Rafał, 2026-10-27).
- Zakres częściowy: klient może zamówić tylko wybrane zakresy, np. same maszyny, a automatykę i bezpieczeństwo zapewnić sam (Rafał, 2026-10-27; rozszerza „samą mechanikę”). Uwaga agenta: maszyny bez sterowania to zwykle maszyny nieukończone z deklaracją włączenia (słownik rules.md).
- Zespół pierwszego kontaktu na stronie: inżynierowie sprzedaży i inżynierowie aplikacji, bez prezesa (Rafał, 2026-10-27; rules.md wymienia prezesa, do ujednolicenia).
- Formularz kwestionariusza przepuszcza klienta dalej także bez pól obowiązkowych; wtedy zamiast kosztu orientacyjnego kontaktuje się inżynier (Rafał, 2026-10-27).
- Słownictwo Rafała: antresola (nie estakada), krzyżówka, wózek jazdy poziomej, owijarka, robot paletyzujący, stół nożycowy unoszący, wyłącznik główny (Rafał, 2026-10-27).
- „Projektuje, buduje i uruchamia … od A do Z” w otwarciu (słowa Rafała) potwierdza pozycję G „Montaż i uruchomienie” w części dotyczącej uruchomienia (2026-10-27).

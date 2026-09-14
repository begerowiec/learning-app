/** Polish translations — Python lessons. */
export const python = {
  'python-variables': {
    title: 'Zmienne i typy danych',
    description: 'Jak Python nazywa wartości i co robią cztery typy wbudowane, których używasz codziennie.',
    content: [
      {
        title: 'Definicja',
        body: 'Zmienna to nazwa związana z wartością. Python nie ma słowa kluczowego deklaracji ani wymogu adnotacji typu — przypisanie do nazwy tworzy ją, a później ta sama nazwa może wskazywać na wartość innego typu.',
      },
      {
        title: 'Cztery, których używasz codziennie',
        body: 'int, float, str i bool pokrywają prawie cały kod na początku. type() mówi, co właściwie trzymasz.',
      },
      {
        title: 'Uwaga',
        body: 'Odczyt nazwy, do której nic nie przypisano, rzuca NameError, a nie ciche None. I "3" to str, nie int — input() zawsze zwraca tekst.',
      },
    ],
    exercises: {
      'python-variables-001': {
        topic: 'Typowanie dynamiczne',
        question: 'Co się dzieje, gdy przypiszesz string do nazwy, która trzyma już int?',
        answers: {
          a: 'Nazwa zostaje przepięta na string; stary int po prostu przepada',
          b: 'Python rzuca TypeError',
          c: 'String zostaje przekonwertowany na int',
          d: 'Nic — pierwsze przypisanie ustala typ na stałe',
        },
        explanation:
          'Nazwy w Pythonie to etykiety, a nie typowane pudełka. Przepięcie nazwy jest zawsze dozwolone, a stara wartość zostaje zebrana, gdy nic już jej nie wskazuje.',
      },
      'python-variables-002': {
        topic: 'Dzielenie całkowite',
        question: 'Co wypisze ten kod?',
        explanation:
          '/ to dzielenie prawdziwe i zawsze zwraca float. // to dzielenie podłogowe i zwraca int, gdy oba argumenty są całkowite.',
      },
      'python-variables-003': {
        topic: 'Zasady nazewnictwa',
        question: 'Nazwa zmiennej w Pythonie może zaczynać się od cyfry, na przykład 2nd_place.',
        explanation: 'Identyfikator musi zaczynać się od litery lub podkreślnika. 2nd_place to SyntaxError; second_place jest w porządku.',
      },
      'python-variables-004': {
        topic: 'Konwersja tekstu',
        question: 'input() zwraca tekst. Uzupełnij linię, żeby porównanie działało na liczbach.',
        answers: { a: 'int', b: 'str', c: 'bool', d: 'len' },
        explanation: 'int() parsuje tekst na liczbę całkowitą. Porównanie str z int rzuca w Pythonie 3 TypeError.',
      },
      'python-variables-005': {
        topic: 'NameError',
        question: 'Która linia rzuca błąd?',
        answers: {
          a: 'Linia 2 — price jest użyte, zanim cokolwiek mu przypisano',
          b: 'Linia 1 — total musi być zadeklarowane z typem',
          c: 'Linia 3 — price nie może być przypisane po użyciu',
          d: 'Linia 4 — print potrzebuje stringa',
        },
        explanation: 'Python wykonuje kod z góry na dół, więc w linii 2 nazwa price jeszcze nie istnieje i leci NameError.',
      },
      'python-variables-006': {
        topic: 'f-stringi',
        question: 'Które wyrażenie buduje tekst "Anna is 30" z name = "Anna" i age = 30?',
        explanation:
          'f-string wstawia wyrażenia z klamer. Bez prefiksu f klamry zostają dosłowne, a sklejanie str z int rzuca TypeError.',
      },
      'python-variables-007': {
        topic: 'Prawdziwościowość',
        question: 'Uzupełnij zdanie.',
        sentence: 'Pusty string jest ___ w kontekście logicznym.',
        answers: { a: 'fałszywy (falsy)', b: 'prawdziwy (truthy)', c: 'błędem', d: 'None' },
        explanation: 'Puste kontenery i wartości zerowe są falsy: "", 0, 0.0, [], {} i None nie przechodzą testu w if.',
      },
      'python-variables-008': {
        topic: 'Przypisanie wielokrotne',
        question: 'Składnia',
        back: 'Zamienia dwie nazwy miejscami w jednej instrukcji — prawa strona powstaje najpierw jako krotka',
        explanation: 'Python oblicza całą prawą stronę przed przypisaniem, więc zmienna tymczasowa nie jest potrzebna.',
      },
      'python-variables-009': {
        topic: 'Typ wyniku dzielenia',
        question: 'Co zostanie wypisane?',
        explanation: 'Dzielenie prawdziwe zawsze daje float, nawet gdy wynik nie ma części ułamkowej: 4 / 2 to 2.0.',
      },
    },
  },

  'python-conditions': {
    title: 'Warunki',
    description: 'if / elif / else, operatory porównania i logiczne oraz pułapki wokół prawdziwościowości.',
    content: [
      {
        title: 'Definicja',
        body: 'Warunek wybiera, który blok się wykona. Python sprawdza gałęzie po kolei i wykonuje pierwszą, której wyrażenie jest prawdziwe; gałęzie elif są sprawdzane tylko wtedy, gdy wszystkie powyżej były fałszywe.',
      },
      {
        title: 'Kształt',
        body: 'Dwukropek i wcięcie są częścią składni, a nie kwestią stylu.',
      },
      {
        title: 'Dobra praktyka',
        body: 'Porównuj przez ==, przypisuj przez =. Łańcuchowe porównania w stylu 0 <= x <= 10 czytają się lepiej niż dwa testy połączone przez and.',
      },
    ],
    exercises: {
      'python-conditions-001': {
        topic: 'Kolejność gałęzi',
        question: 'Co wypisze ten kod?',
        explanation:
          'Wygrywa pierwsza prawdziwa gałąź, reszta jest pomijana. Najszerszy warunek dawaj na końcu, inaczej gałąź A nigdy nie zostanie osiągnięta.',
      },
      'python-conditions-002': {
        topic: 'Przypisanie kontra porównanie',
        question: 'Która linia psuje ten fragment?',
        answers: {
          a: 'Linia 2 — warunek potrzebuje ==, nie =',
          b: 'Linia 1 — stringi wymagają pojedynczych cudzysłowów',
          c: 'Linia 3 — print musi mieć wcięcie dwóch spacji',
          d: 'Żadna linia go nie psuje',
        },
        explanation: '= przypisuje, == porównuje. Python odrzuca przypisanie w nagłówku if błędem składni.',
      },
      'python-conditions-003': {
        topic: 'elif kontra osobne if',
        question: 'Zamiana elif na drugie if może zmienić to, które gałęzie się wykonają.',
        explanation: 'Osobne if są sprawdzane niezależnie, więc dwa mogą się wykonać. Gałęzie elif wykluczają się wzajemnie.',
      },
      'python-conditions-004': {
        topic: 'Operatory logiczne',
        question: 'Uzupełnij warunek tak, żeby pasował do wieku wewnątrz przedziału.',
        answers: { a: 'and', b: 'or', c: '&&', d: 'not' },
        explanation: 'Obie części muszą zachodzić, więc operatorem jest and. Python zapisuje operatory logiczne słowami: and, or, not.',
      },
      'python-conditions-005': {
        topic: 'Sprawdzanie None',
        question: 'Dlaczego `if value is None` jest lepsze niż `if value == None`?',
        answers: {
          a: 'is porównuje tożsamość, a None jest singletonem — własne __eq__ tego nie oszuka',
          b: '== w ogóle nie działa z None',
          c: 'is jest szybsze, ale poza tym identyczne',
          d: 'Nie ma różnicy; oba są równie idiomatyczne',
        },
        explanation:
          'Istnieje dokładnie jeden obiekt None, więc tożsamość jest dokładnym testem. Klasa nadpisująca __eq__ mogłaby przypadkiem sprawić, że == None zwróci True.',
      },
      'python-conditions-006': {
        topic: 'Negacja',
        question: 'Uzupełnij warunek tak, żeby ciało wykonywało się tylko dla pustych list.',
        answers: { a: 'not', b: 'no', c: '!', d: 'is' },
        explanation: 'Pusta lista jest falsy, więc `if not items` to idiomatyczny wczesny return. Python nie ma operatora !.',
      },
      'python-conditions-007': {
        topic: 'Porównanie łańcuchowe',
        question: 'Jaka jest wartość tego wyrażenia?',
        answers: { a: 'False', b: 'True', c: 'SyntaxError', d: 'TypeError' },
        explanation: 'Porównanie łańcuchowe znaczy 1 < x and x < 4. Druga część jest fałszywa dla x = 5, więc całość to False.',
      },
      'python-conditions-008': {
        topic: 'Wyrażenie warunkowe',
        question: 'Składnia',
        back: 'Forma trójargumentowa — jedno wyrażenie, oblicza tylko potrzebną gałąź',
        explanation: 'Przydatne do krótkich przypisań albo/albo. Trzymaj w jednej linii; zagnieżdżone szybko przestaje być czytelne.',
      },
    },
  },

  'python-loops': {
    title: 'Pętle',
    description: 'for i while, range(), enumerate() oraz jak zachowują się break, continue i else.',
    content: [
      {
        title: 'Definicja',
        body: 'Pętla for przechodzi po iterowalnym obiekcie — liście, stringu, range, pliku. Pętla while powtarza się, dopóki warunek zachodzi. W Pythonie prawie zawsze chcesz for: nie potrafi wyjść poza koniec danych.',
      },
      {
        title: 'Indeks i wartość razem',
        body: 'Sięgaj po enumerate() zamiast budować indeks ręcznie; pętla zostaje czytelna, a błędy o jeden nie mają jak wejść.',
      },
      {
        title: 'Uwaga',
        body: 'range(1, 5) daje 1, 2, 3, 4 — wartość końcowa jest wykluczona. A modyfikowanie listy w trakcie iterowania po niej po cichu pomija elementy; iteruj po kopii.',
      },
    ],
    exercises: {
      'python-loops-001': {
        topic: 'Zakres range',
        question: 'Co wypisze ten kod?',
        explanation: 'range(start, stop) zawiera start i wyklucza stop, więc range(1, 4) daje 1, 2, 3.',
      },
      'python-loops-002': {
        topic: 'break kontra continue',
        question: 'Co robi continue w pętli?',
        answers: {
          a: 'Pomija resztę bieżącej iteracji i przechodzi do następnej',
          b: 'Wychodzi z pętli całkowicie',
          c: 'Zaczyna pętlę od pierwszego elementu',
          d: 'Powtarza bieżącą iterację',
        },
        explanation: 'continue przeskakuje do następnej iteracji; break wychodzi z pętli. Żadne z nich jej nie restartuje.',
      },
      'python-loops-003': {
        topic: 'Nieskończone while',
        question: 'Która linia sprawia, że ta pętla nigdy się nie kończy?',
        answers: {
          a: 'Linia 4 — n nigdy nie maleje, więc warunek pozostaje prawdziwy',
          b: 'Linia 2 — while potrzebuje range()',
          c: 'Linia 3 — print w while jest niedozwolony',
          d: 'Linia 5 — powinna mieć wcięcie',
        },
        explanation: 'Pętla while wymaga, żeby warunek się zmieniał. Ciału brakuje n = n - 1 (albo n -= 1).',
      },
      'python-loops-004': {
        topic: 'enumerate',
        question: 'Uzupełnij pętlę tak, żeby wypisywała pozycję i wartość.',
        answers: { a: 'enumerate', b: 'range', c: 'zip', d: 'items.index' },
        explanation: 'enumerate() zwraca pary (indeks, wartość). zip() sparowałby dwa osobne iterowalne obiekty.',
      },
      'python-loops-005': {
        topic: 'for/else',
        question: 'Co wypisze ten kod?',
        answers: { a: 'not found', b: 'nic', c: 'SyntaxError', d: 'found' },
        explanation:
          'Blok else pętli wykonuje się, gdy pętla skończyła się bez break — czyli dokładnie jako wynik wyszukiwania "nic nie pasuje".',
      },
      'python-loops-006': {
        topic: 'Iterowanie po stringu',
        question: 'Iterowanie po stringu zwraca kolejne znaki.',
        explanation: 'str jest iterowalny po jednoznakowych stringach, więc for ch in "abc" daje "a", "b", "c".',
      },
      'python-loops-007': {
        topic: 'Wyrażenie listowe',
        question: 'Uzupełnij wyrażenie listowe, które podnosi każdą liczbę do kwadratu.',
        answers: { a: 'for', b: 'in', c: 'while', d: 'each' },
        explanation:
          'Wyrażenie listowe czyta się jako wyrażenie + for + zmienna + in + iterowalne, z opcjonalnym if na końcu.',
      },
      'python-loops-008': {
        topic: 'zip',
        question: 'Funkcja wbudowana',
        back: 'Paruje dwa iterowalne element po elemencie i kończy na krótszym',
        explanation: 'for name, score in zip(names, scores) idzie po obu listach równolegle. Nadmiar z dłuższej znika po cichu.',
      },
      'python-loops-009': {
        topic: 'Akumulator',
        question: 'Jaka jest końcowa wartość total?',
        explanation: 'range(4) to 0, 1, 2, 3, co sumuje się do 6. range(5) dałoby 10.',
      },
    },
  },

  'python-functions': {
    title: 'Funkcje i zasięg',
    description: 'Definiowanie funkcji, wartości zwracane, argumenty domyślne, *args/**kwargs i zasięg lokalny.',
    content: [
      {
        title: 'Definicja',
        body: 'Funkcja grupuje fragment zachowania pod nazwą. Wykonuje się tylko wtedy, gdy ją wywołasz, i oddaje wartość przez return.',
      },
      {
        title: 'Zasięg',
        body: 'Nazwy utworzone wewnątrz funkcji są lokalne: istnieją w czasie wywołania i są niewidoczne na zewnątrz.',
      },
      {
        title: 'Dobra praktyka',
        body: 'Zwracaj wartości zamiast je wypisywać i trzymaj jedną funkcję przy jednym zadaniu. To sprawia, że kod da się testować i czytać po miesiącach.',
      },
    ],
    exercises: {
      'python-functions-001': {
        topic: 'Niejawny return',
        question: 'Co zwraca funkcja Pythona, która nie ma instrukcji return?',
        answers: { a: 'None', b: '0', c: 'Pusty string', d: 'Rzuca błąd' },
        explanation: 'Każda funkcja w Pythonie zwraca wartość. Bez jawnego return tą wartością jest None.',
      },
      'python-functions-002': {
        topic: 'Argumenty domyślne',
        question: 'Co wypisze ten kod?',
        explanation: 'Domyślne factor=2 jest użyte w pierwszym wywołaniu, a przekazane 3 nadpisuje je w drugim.',
      },
      'python-functions-003': {
        topic: 'Składnia funkcji',
        question: 'Która linia psuje tę funkcję?',
        answers: {
          a: 'Linia 1 — brak dwukropka po liście parametrów',
          b: 'Linia 2 — stringów nie da się sklejać',
          c: 'Linia 3 — return wymaga nawiasów',
          d: 'Linia 5 — greet musi być wywołane przez argument nazwany',
        },
        explanation: 'Nagłówek def zawsze kończy się dwukropkiem: def greet(name):',
      },
      'python-functions-004': {
        topic: 'return kontra print',
        question: 'Uzupełnij funkcję tak, żeby oddawała sumę wywołującemu.',
        answers: { a: 'return', b: 'yield', c: 'print', d: 'pass' },
        explanation: 'return odsyła wartość do wywołującego. print tylko pisze na konsolę i zwraca None.',
      },
      'python-functions-005': {
        topic: 'Zasięg lokalny',
        question: 'Uzupełnij zdanie.',
        sentence: 'Zmienne przypisane wewnątrz funkcji mają zasięg ___.',
        answers: { a: 'lokalny', b: 'globalny', c: 'modułu', d: 'statyczny' },
        explanation: 'Przypisanie wewnątrz funkcji tworzy nazwę lokalną, chyba że zadeklarujesz ją jako global albo nonlocal.',
      },
      'python-functions-006': {
        topic: 'Domknięcia',
        question: 'Jaka jest wartość counter() przy drugim wywołaniu?',
        explanation: 'Funkcja wewnętrzna domyka się nad n, więc wartość przeżywa między wywołaniami. Dwa wywołania dają 2.',
      },
      'python-functions-007': {
        topic: 'args i kwargs',
        question: '*args zbiera nadmiarowe argumenty pozycyjne do krotki.',
        explanation: '*args zbiera pozostałe argumenty pozycyjne jako krotkę; **kwargs zbiera argumenty nazwane jako słownik.',
      },
      'python-functions-008': {
        topic: 'global kontra nonlocal',
        question: 'Które słowo kluczowe pozwala funkcji przepiąć nazwę zdefiniowaną na poziomie modułu?',
        answers: { a: 'global', b: 'nonlocal', c: 'extern', d: 'static' },
        explanation: 'global celuje w nazwy z poziomu modułu; nonlocal w nazwę z najbliższej funkcji otaczającej.',
      },
      'python-functions-009': {
        topic: 'Mutowalny argument domyślny',
        question: 'Pułapka',
        back: 'Lista powstaje raz, przy definicji, i jest współdzielona przez każde wywołanie',
        explanation:
          'Użyj bucket=None i zbuduj świeżą listę w ciele. To jeden z najczęstszych błędów Pythona wyłapywanych na review.',
      },
    },
  },

  'python-lists-tuples': {
    title: 'Listy i krotki',
    description: 'Wycinki, mutowalność, różnica lista/krotka i pułapka aliasowania.',
    content: [
      {
        title: 'Definicja',
        body: 'Lista to uporządkowana, mutowalna sekwencja. Krotka ma ten sam kształt, ale jest niemutowalna, dzięki czemu może być kluczem słownika i można ją bezpiecznie przekazywać bez kopiowania.',
      },
      {
        title: 'Wycinki',
        body: 'Wycinek zawsze tworzy nową listę. Indeks końcowy jest wykluczony, a indeks ujemny liczy od końca.',
      },
      {
        title: 'Uwaga',
        body: 'b = a nie kopiuje listy — obie nazwy wskazują ten sam obiekt, więc dopisanie przez jedną widać przez drugą. Użyj a.copy() albo list(a).',
      },
    ],
    exercises: {
      'python-lists-001': {
        topic: 'Granice wycinka',
        question: 'Co wypisze ten kod?',
        explanation: 'Wycinek zaczyna się na pierwszym indeksie i kończy przed drugim, więc [1:3] daje pozycje 1 i 2.',
      },
      'python-lists-002': {
        topic: 'Lista kontra krotka',
        question: 'Które zdanie o krotkach jest prawdziwe?',
        answers: {
          a: 'Krotki nie da się zmodyfikować po utworzeniu, więc może być kluczem słownika',
          b: 'Krotka to po prostu lista z inną składnią',
          c: 'Krotka może trzymać tylko jeden typ wartości',
          d: 'Iterowanie po krotce jest zawsze szybsze niż po liście',
        },
        explanation:
          'Niemutowalność to cała różnica i to ona czyni krotkę hashowalną — o ile wszystko w środku też jest hashowalne.',
      },
      'python-lists-003': {
        topic: 'Aliasowanie',
        question: 'Co wypisze ten kod?',
        explanation: 'b = a wiąże drugą nazwę z tym samym obiektem listy. Modyfikacja przez którąkolwiek jest widoczna przez obie.',
      },
      'python-lists-004': {
        topic: 'Niemutowalność krotki',
        question: 'Która linia rzuca TypeError?',
        answers: {
          a: 'Linia 3 — krotka nie wspiera przypisania do elementu',
          b: 'Linia 1 — krotka wymaga nawiasów kwadratowych',
          c: 'Linia 2 — krotek nie da się indeksować',
          d: 'Linia 4 — krotki nie da się wypisać',
        },
        explanation: 'Krotki są tylko do odczytu. Zbuduj nową: point = (9, point[1]).',
      },
      'python-lists-005': {
        topic: 'Filtrowanie w wyrażeniu listowym',
        question: 'Uzupełnij wyrażenie tak, żeby zostawiało tylko liczby parzyste.',
        answers: { a: 'if', b: 'where', c: 'when', d: 'and' },
        explanation: 'Opcjonalny filtr w wyrażeniu listowym to klauzula if umieszczona po klauzuli for.',
      },
      'python-lists-006': {
        topic: 'append kontra extend',
        question: 'a.append([1, 2]) dodaje do a dwa elementy.',
        explanation:
          'append dodaje swój argument jako jeden element, więc lista rośnie o jedną pozycję, która akurat jest listą. extend dodaje każdy element osobno.',
      },
      'python-lists-007': {
        topic: 'Sortowanie w miejscu',
        question: 'Uzupełnij zdanie.',
        sentence: 'nums.sort() sortuje w miejscu i zwraca ___.',
        answers: { a: 'None', b: 'posortowaną listę', c: 'kopię', d: 'pierwszy element' },
        explanation:
          'sort() modyfikuje i zwraca None; sorted(nums) zostawia oryginał i zwraca nową listę. Łańcuchowanie po sort() to klasyczny błąd.',
      },
      'python-lists-008': {
        topic: 'Rozpakowanie',
        question: 'Składnia',
        back: 'Wiąże pierwszy element i zbiera resztę do listy',
        explanation: 'Gwiazdka działa w dowolnym miejscu wzorca: *head, last = items bierze zamiast tego ostatni element.',
      },
      'python-lists-009': {
        topic: 'Mnożenie listy',
        question: 'Co wypisze ten kod?',
        explanation:
          'Mnożenie listy powiela jej elementy. Uwaga przy listach zagnieżdżonych: [[0] * 3] * 2 współdzieli tę samą listę wewnętrzną dwa razy.',
      },
    },
  },

  'python-dictionaries': {
    title: 'Słowniki',
    description: 'Wyszukiwanie po kluczu, bezpieczny dostęp przez get(), iterowanie i wyrażenia słownikowe.',
    content: [
      {
        title: 'Definicja',
        body: 'Słownik mapuje hashowalne klucze na wartości i znajduje klucz w mniej więcej stałym czasie niezależnie od rozmiaru. Od Pythona 3.7 zachowuje też kolejność wstawiania.',
      },
      {
        title: 'Bezpieczny dostęp',
        body: 'Indeksowanie brakującego klucza rzuca KeyError. get() zwraca zamiast tego wartość domyślną, czego zwykle chcesz przy czytaniu danych z zewnątrz.',
      },
      {
        title: 'Dobra praktyka',
        body: 'Iteruj przez .items(), gdy potrzebujesz obu połówek. Zwykłe `for k in d` daje same klucze i to jest najczęstsze źródło nieporozumień.',
      },
    ],
    exercises: {
      'python-dicts-001': {
        topic: 'Brakujący klucz',
        question: 'Co się stanie w ostatniej linii?',
        answers: { a: 'KeyError', b: 'None', c: 'Pusty string', d: 'IndexError' },
        explanation: 'Dostęp przez nawiasy kwadratowe do brakującego klucza rzuca KeyError. Użyj .get("age"), żeby dostać None.',
      },
      'python-dicts-002': {
        topic: 'Iterowanie po parach',
        question: 'Uzupełnij pętlę tak, żeby szła po kluczach i wartościach jednocześnie.',
        answers: { a: 'items', b: 'keys', c: 'values', d: 'pairs' },
        explanation: '.items() zwraca krotki (klucz, wartość). .keys() i .values() dają po jednej połówce.',
      },
      'python-dicts-003': {
        topic: 'Poprawne klucze',
        question: 'Której wartości nie można użyć jako klucza słownika?',
        answers: { a: 'Listy', b: 'Krotki stringów', c: 'Liczby całkowitej', d: 'Stringa' },
        explanation:
          'Klucze muszą być hashowalne, a hashowalność wymaga niemutowalności. Lista jest mutowalna, więc leci TypeError: unhashable type.',
      },
      'python-dicts-004': {
        topic: 'Nadpisywanie kluczy',
        question: 'Co wypisze ten kod?',
        answers: { a: '2 3', b: '3 1', c: '2 1', d: 'SyntaxError' },
        explanation: 'Powtórzony klucz to nie błąd — po prostu wygrywa późniejsza wartość, a słownik ma dwa wpisy.',
      },
      'python-dicts-005': {
        topic: 'Kolejność wstawiania',
        question: 'We współczesnym Pythonie słownik pamięta kolejność wstawiania kluczy.',
        explanation: 'Kolejność stała się szczegółem implementacji w 3.6, a gwarancją języka w 3.7.',
      },
      'python-dicts-006': {
        topic: 'Modyfikacja w trakcie iteracji',
        question: 'Która linia rzuca RuntimeError?',
        answers: {
          a: 'Linia 4 — słownik zmienił rozmiar w trakcie iteracji',
          b: 'Linia 2 — po słowniku nie da się iterować wprost',
          c: 'Linia 3 — porównanie z 0 jest niedozwolone',
          d: 'Żadna linia nic nie rzuca',
        },
        explanation: 'Usuwanie w trakcie iteracji unieważnia iterator. Iteruj po list(d) albo zbuduj nowy słownik.',
      },
      'python-dicts-007': {
        topic: 'Wyrażenie słownikowe',
        question: 'Uzupełnij wyrażenie, które odwraca słownik.',
        answers: { a: 'in', b: 'of', c: 'from', d: 'at' },
        explanation:
          'Wyrażenie słownikowe używa tej samej klauzuli for ... in ... co listowe, z wyrażeniem klucz: wartość z przodu.',
      },
      'python-dicts-008': {
        topic: 'setdefault',
        question: 'Metoda',
        back: 'Zwraca istniejącą wartość albo wstawia domyślną i zwraca ją',
        explanation:
          'Przydatne do grupowania: d.setdefault(k, []).append(v). collections.defaultdict(list) robi to samo bardziej wprost.',
      },
      'python-dicts-009': {
        topic: 'Łączenie słowników',
        question: 'Które wyrażenie łączy dwa słowniki tak, żeby przy konflikcie wygrywał prawy?',
        explanation:
          'Rozpakowanie podwójną gwiazdką tworzy nowy słownik; od Pythona 3.9 a | b robi to samo. Słowniki nie wspierają +.',
      },
    },
  },
};

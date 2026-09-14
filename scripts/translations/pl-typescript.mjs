/** Polish translations — TypeScript lessons. */
export const typescript = {
  'typescript-types': {
    title: 'Typy',
    description: 'Adnotacje, wnioskowanie, typy literalne i unie oraz dlaczego any przekreśla cały sens.',
    content: [
      {
        title: 'Definicja',
        body: 'Typ opisuje zbiór wartości, jakie wyrażenie może przyjąć. TypeScript sprawdza te opisy w czasie kompilacji, a potem je usuwa — nic z typów nie trafia do wygenerowanego JavaScriptu.',
      },
      {
        title: 'Wnioskowanie bije adnotacje',
        body: 'Adnotuj parametry funkcji i publiczne granice; resztę zostaw wnioskowaniu. Nadmiarowe adnotacje szybko się rozjeżdżają z kodem.',
      },
      {
        title: 'Uwaga',
        body: 'any wyłącza sprawdzanie dla wszystkiego, czego dotknie. unknown to bezpieczny odpowiednik: przed użyciem musisz go zawęzić.',
      },
    ],
    exercises: {
      'typescript-types-001': {
        topic: 'Wnioskowanie przy const',
        question: 'Jaki typ TypeScript wywnioskuje dla name?',
        answers: { a: '"Anna" — typ literalny', b: 'string', c: 'any', d: 'String' },
        explanation:
          'Wiązania const nie da się przepiąć, więc najwęższym użytecznym typem jest literał. let name = "Anna" rozszerzyłoby go do string.',
      },
      'typescript-types-002': {
        topic: 'any kontra unknown',
        question: 'Jaka jest praktyczna różnica między any a unknown?',
        answers: {
          a: 'unknown trzeba zawęzić przed użyciem; any pozwala na dowolną operację bez kontroli',
          b: 'To aliasy tego samego typu',
          c: 'unknown przyjmuje tylko wartości obiektowe',
          d: 'any działa w czasie wykonania, unknown w czasie kompilacji',
        },
        explanation:
          'Oba przyjmują dowolną wartość na wejściu. Tylko unknown zmusza cię do udowodnienia, czym jest, zanim z niego odczytasz — dlatego pasuje na granicach API.',
      },
      'typescript-types-003': {
        topic: 'Typ unii',
        question: 'Uzupełnij adnotację tak, żeby parametr przyjmował i string, i number.',
        explanation: '| tworzy unię (jedno albo drugie). & tworzy przecięcie, które wymagałoby wartości będącej jednym i drugim naraz.',
      },
      'typescript-types-004': {
        topic: 'Typy elementów tablicy',
        question: 'Którą linię kompilator odrzuci?',
        answers: {
          a: 'Linia 3 — string nie jest przypisywalny do number',
          b: 'Linia 1 — adnotacja tablicy musi używać Array<number>',
          c: 'Linia 2 — push jest niedozwolony na typowanej tablicy',
          d: 'Linia 4 — length wymaga asercji typu',
        },
        explanation:
          'number[] ogranicza każdy element, a push jest odpowiednio otypowany. Zwróć uwagę, że const zamraża tylko wiązanie, nie zawartość.',
      },
      'typescript-types-005': {
        topic: 'Wymazywanie typów',
        question: 'Typy TypeScriptu są dostępne w czasie wykonania i można je sprawdzić przez typeof.',
        explanation:
          'Typy znikają przy kompilacji. typeof to operator JavaScriptu działający w czasie wykonania i nic nie wie o twoich interfejsach ani uniach.',
      },
      'typescript-types-006': {
        topic: 'Unia literałów',
        question: 'Która adnotacja ogranicza wartość do dokładnie trzech nazwanych stanów?',
        explanation:
          'Unia literałów stringowych to idiomatyczny sposób modelowania zamkniętego zbioru stanów i ładnie się zawęża w switchu.',
      },
      'typescript-types-007': {
        topic: 'Wnioskowanie dla pustej tablicy',
        question: 'Uzupełnij zdanie.',
        sentence: 'Bez adnotacji const ids = [] jest wnioskowane jako ___[].',
        answers: { a: 'any', b: 'never', c: 'unknown', d: 'object' },
        explanation:
          'Pusty literał tablicy zaczyna jako any[] i TypeScript rozszerza go na podstawie kolejnych push. W pozycji nieewoluującej przy noImplicitAny jest to błąd.',
      },
      'typescript-types-008': {
        topic: 'Asercja typu',
        question: 'Składnia',
        back: 'Mówi kompilatorowi, żeby ci zaufał — żadna kontrola w czasie wykonania się nie dzieje',
        explanation: 'Asercja ucisza kontrolę, niczego nie sprawdzając. Jeśli się mylisz, awaria wypłynie później i dalej od przyczyny.',
      },
      'typescript-types-009': {
        topic: 'Dostęp do składowych unii',
        question: 'Dlaczego kompilator odrzuca linię 2?',
        answers: {
          a: 'toUpperCase nie istnieje na number, więc jest niedostępne dopóki x nie zostanie zawężone',
          b: 'Typ unii nie może być parametrem',
          c: 'Brakuje typu zwracanego',
          d: 'toUpperCase wymaga argumentu',
        },
        explanation: 'Na unii wolno używać tylko składowych wspólnych dla wszystkich wariantów. Strażnik typeof czyni gałąź string bezpieczną.',
      },
      'typescript-types-010': {
        topic: 'Rozszerzanie przy let',
        question: 'Jakie typy zostaną wywnioskowane dla a i b?',
        answers: { a: 'a: string, b: "draft"', b: 'oba string', c: 'oba "draft"', d: 'a: "draft", b: string' },
        explanation:
          'Wiązanie let da się przepiąć, więc TypeScript rozszerza literał do typu bazowego. const nie da się, więc literał zostaje — dlatego const lepiej sprawdza się przy dyskryminantach unii.',
      },
      'typescript-types-011': {
        topic: 'strictNullChecks',
        question: 'Co zmienia włączenie strictNullChecks?',
        answers: {
          a: 'null i undefined przestają być przypisywalne do każdego typu i muszą być jawnie w unii',
          b: 'Każda zmienna musi być zainicjalizowana przy deklaracji',
          c: 'Właściwości opcjonalne przestają być dozwolone',
          d: 'Sprawdzenia null są wstawiane w czasie wykonania',
        },
        explanation:
          'Bez tego string po cichu zawiera null. Z tym string | null to inny typ, a kompilator wymusza sprawdzenie przed odczytem.',
      },
      'typescript-types-012': {
        topic: 'Asercja const',
        question: 'Uzupełnij asercję tak, żeby LEVELS stało się readonly krotką literałów zamiast string[].',
        answers: { a: 'satisfies', b: 'as', c: 'is', d: ':' },
        explanation: 'as const zamraża literały — tak wyprowadza się unię z tablicy: type Level = (typeof LEVELS)[number].',
      },
      'typescript-types-013': {
        topic: 'satisfies',
        question: 'Operator satisfies sprawdza wartość względem typu, nie rozszerzając wywnioskowanego typu samej wartości.',
        explanation:
          'O to dokładnie chodzi: obiekt konfiguracji można zweryfikować względem Record<string, string>, zachowując jego dokładne klucze do podpowiedzi.',
      },
      'typescript-types-014': {
        topic: 'Asercja ukrywająca błąd',
        question: 'To się kompiluje i wywala w czasie wykonania. Która linia za to odpowiada?',
        answers: {
          a: 'Linia 3 — toUpperCase nie istnieje na string',
          b: 'Linia 1 — json() powinno być otypowane',
          c: 'Linia 2 — asercja każe kompilatorowi zaufać niezweryfikowanym danym',
          d: 'Nic — to jest bezpieczne',
        },
        explanation:
          'json() zwraca any (albo unknown). Asercja to obietnica złożona kompilatorowi; prawdziwą czyni ją dopiero walidacja danych.',
      },
      'typescript-types-015': {
        topic: 'Przecięcie kontra unia',
        question: 'Co dla dwóch typów obiektowych opisuje `A & B`?',
        answers: {
          a: 'Wartość mającą składowe obu',
          b: 'Wartość będącą albo A, albo B',
          c: 'Tylko składowe wspólne dla A i B',
          d: 'Błąd, bo obiektów nie da się przecinać',
        },
        explanation:
          'Unie ograniczają to, co wolno odczytać; przecięcia łączą to, co jest obecne. Przecięcie sprzecznych składowych prymitywnych daje never.',
      },
    },
  },

  'typescript-interfaces': {
    title: 'Interfejsy',
    description: 'Opis kształtu obiektu, składowe opcjonalne i readonly, extends oraz interface kontra type.',
    content: [
      {
        title: 'Definicja',
        body: 'Interfejs opisuje kształt obiektu: jakie właściwości istnieją i jakiego są typu. To wyłącznie kontrakt czasu kompilacji — nie powstaje dla niego żaden kod.',
      },
      {
        title: 'Opcjonalne i readonly',
        body: 'Znak ? oznacza właściwość, która może nie istnieć; readonly blokuje przepięcie po utworzeniu.',
      },
      {
        title: 'Dobra praktyka',
        body: 'Sięgaj po interfejs przy kształtach obiektów, które rozszerzasz, a po alias typu przy uniach, krotkach i typach mapowanych. Interfejsy dodatkowo się łączą między deklaracjami, co bywa przydatne przy rozszerzaniu typów bibliotek i zaskakujące wszędzie indziej.',
      },
    ],
    exercises: {
      'typescript-interfaces-001': {
        topic: 'Kształty obiektów',
        question: 'Która konstrukcja TypeScriptu opisuje kształt obiektu i może być rozszerzana?',
        explanation: 'Interfejs opisuje kształt obiektu i wspiera extends; aliasy typów używają zamiast tego przecięć.',
      },
      'typescript-interfaces-002': {
        topic: 'Właściwości opcjonalne',
        question: 'Jaki jest typ u.email wewnątrz funkcji?',
        answers: { a: 'string | undefined', b: 'string', c: 'undefined', d: 'any' },
        explanation: 'Znak ? dodaje undefined do typu właściwości. Czytaj ją po sprawdzeniu, inaczej ścisły kompilator upomni się dalej.',
      },
      'typescript-interfaces-003': {
        topic: 'Kontrola nadmiarowych właściwości',
        question: 'Którą linię kompilator odrzuci?',
        answers: {
          a: 'Linia 3 — z to nadmiarowa właściwość literału obiektu',
          b: 'Linia 1 — interfejs nie może mieć dwóch składowych tego samego typu',
          c: 'Linia 2 — Point wymaga konstruktora',
          d: 'Linia 4 — obiektów nie da się logować wprost',
        },
        explanation:
          'Literały obiektów przypisywane wprost do adnotowanego celu przechodzą kontrolę nadmiarowych właściwości. Przypisanie przez zmienną przeszłoby, bo typowanie strukturalne wymaga tylko obecności składowych.',
      },
      'typescript-interfaces-004': {
        topic: 'Rozszerzanie interfejsu',
        question: 'Uzupełnij deklarację tak, żeby Admin miał wszystkie składowe User plus własną.',
        answers: { a: 'extends', b: 'implements', c: 'from', d: '&' },
        explanation: 'Interfejsy dziedziczą przez extends. implements dotyczy klas; & to operator przecięcia używany z aliasami typów.',
      },
      'typescript-interfaces-005': {
        topic: 'Głębokość readonly',
        question: 'Oznaczenie właściwości jako readonly blokuje też modyfikację obiektu, który w niej siedzi.',
        explanation:
          'readonly jest płytkie: nie przepniesz właściwości, ale nadal możesz zrobić push do readonly tablicy albo zmienić zagnieżdżony obiekt.',
      },
      'typescript-interfaces-006': {
        topic: 'Typowanie strukturalne',
        question: 'Obiekt z nadmiarowymi właściwościami trafia do zmiennej, a potem do funkcji oczekującej Point. Co się stanie?',
        answers: {
          a: 'Zostanie przyjęty — TypeScript wymaga tylko obecności oczekiwanych składowych',
          b: 'Zostanie odrzucony, bo kształty nie są identyczne',
          c: 'Zostanie przyjęty, ale nadmiarowe właściwości znikną',
          d: 'Zadziała tylko, jeśli Point jest klasą',
        },
        explanation:
          'TypeScript jest typowany strukturalnie: zgodność dotyczy wymaganych składowych, a nie nazw czy miejsca deklaracji.',
      },
      'typescript-interfaces-007': {
        topic: 'Sygnatura indeksu',
        question: 'Uzupełnij sygnaturę indeksu dla mapy string → number.',
        answers: { a: 'string', b: 'any', c: 'object', d: 'String' },
        explanation:
          'Kluczem sygnatury indeksu może być string, number albo symbol. Record<string, number> wyraża to samo zwięźlej.',
      },
      'typescript-interfaces-008': {
        topic: 'Łączenie deklaracji',
        question: 'TypeScript · interfejsy',
        back: 'Łączą się w jeden — ich składowe są sumowane, a nie zgłaszane jako konflikt',
        explanation:
          'Tylko interfejsy tak działają. Zadeklarowanie tego samego aliasu dwa razy to błąd, co zwykle jest tym, czego chcesz.',
      },
      'typescript-interfaces-009': {
        topic: 'Sygnatury metod',
        question: 'Które wywołanie spełnia ten interfejs?',
        answers: {
          a: 'await repo.find("u1") — zwracające string albo null',
          b: 'repo.find() — id jest opcjonalne',
          c: 'repo.find(1) — liczby są konwertowane',
          d: 'repo.find("u1") — zwracające zwykły string synchronicznie',
        },
        explanation: 'Sygnatura wymaga jednego argumentu string i zwraca obietnicę, więc wywołanie ją awaituje i obsługuje null.',
      },
      'typescript-interfaces-010': {
        topic: 'interface kontra alias typu',
        question: 'Które zdanie jest prawdziwe dla aliasu typu, ale nie dla interfejsu?',
        answers: {
          a: 'Może opisać unię, krotkę albo typ mapowany',
          b: 'Może być rozszerzany',
          c: 'Może opisać kształt obiektu',
          d: 'Może być implementowany przez klasę',
        },
        explanation:
          'Interfejsy opisują wyłącznie kształty obiektowe. Aliasy obejmują wszystko, ale nie łączą się między deklaracjami — co zwykle jest zaletą.',
      },
      'typescript-interfaces-011': {
        topic: 'Opcjonalne kontra undefined',
        question: 'Przy exactOptionalPropertyTypes które przypisanie zostanie odrzucone?',
        answers: {
          a: 'b — jawne undefined to nie to samo co brak właściwości',
          b: 'a — właściwość jest wymagana',
          c: 'Oba',
          d: 'Żadne',
        },
        explanation:
          'Flaga rozdziela "nie podano" od "podano jako undefined", co ma znaczenie wszędzie tam, gdzie obiekty opcji się rozprasza albo scala.',
      },
      'typescript-interfaces-012': {
        topic: 'Implementowanie interfejsu',
        question: 'Uzupełnij deklarację klasy tak, żeby kompilator sprawdzał ją względem interfejsu.',
        answers: { a: 'implements', b: 'extends', c: 'satisfies', d: 'as' },
        explanation: 'implements sprawdza kształt, niczego nie dziedzicząc. extends służy do dziedziczenia po klasie bazowej.',
      },
      'typescript-interfaces-013': {
        topic: 'Zgodność strukturalna funkcji',
        question: 'Funkcja typu (a: string) => void jest przypisywalna do właściwości typu (a: string, b: number) => void.',
        explanation:
          'Pomijanie końcowych parametrów jest zawsze bezpieczne. Dlatego callbacki tablicowe mogą brać sam element i pomijać indeks.',
      },
      'typescript-interfaces-014': {
        topic: 'Modyfikacja readonly tablicy',
        question: 'Którą linię kompilator odrzuci?',
        answers: {
          a: 'Linia 3 — push modyfikuje właściwość readonly',
          b: 'Linia 4 — właściwości nie da się przepiąć',
          c: 'Linia 2 — literał tablicy nie jest readonly',
          d: 'Linia 1 — readonly nie działa na tablicy',
        },
        explanation: 'readonly jest płytkie: blokuje przepięcie, nie modyfikację. readonly string[] odrzuciłoby także linię 3.',
      },
      'typescript-interfaces-015': {
        topic: 'Kształty z dyskryminantem',
        question: 'Po co dodawać literalne pole `kind` do każdego wariantu unii interfejsów?',
        answers: {
          a: 'Pozwala switchowi zawęzić unię i zamienia nieobsłużony wariant w błąd kompilacji',
          b: 'Jest wymagane, żeby interfejsy dało się połączyć w unię',
          c: 'Poprawia wydajność w czasie wykonania',
          d: 'Umożliwia łączenie deklaracji',
        },
        explanation:
          'Bez dyskryminanta kompilator udostępnia tylko składowe wspólne dla wszystkich gałęzi, a dodanie wariantu przechodzi bez śladu w każdym miejscu użycia.',
      },
    },
  },

  'typescript-functions': {
    title: 'Funkcje',
    description: 'Adnotacje parametrów i typu zwracanego, parametry opcjonalne i domyślne, void kontra never.',
    content: [
      {
        title: 'Definicja',
        body: 'Typ funkcji opisuje, co wchodzi i co wychodzi. Parametry są sprawdzane po pozycji, a typ zwracany zwykle lepiej zostawić wnioskowaniu — poza eksportowanym API, gdzie jawna adnotacja powstrzymuje refaktor przed cichym rozszerzeniem kontraktu.',
      },
      {
        title: 'Opcjonalny kontra domyślny',
        body: 'Parametr opcjonalny można pominąć i jest wtedy undefined. Parametr z wartością domyślną też można pominąć, ale w ciele nigdy nie jest undefined.',
      },
      {
        title: 'Uwaga',
        body: 'void znaczy "zignoruj to, co zwrócone", a nie "nic nie zwraca". never znaczy, że funkcja w ogóle nie może wrócić — rzuca wyjątek albo kręci się w nieskończoność.',
      },
    ],
    exercises: {
      'typescript-functions-001': {
        topic: 'Wnioskowanie typu zwracanego',
        question: 'Jaki typ zwracany zostanie wywnioskowany?',
        explanation: 'Mnożenie dwóch liczb daje number, więc TypeScript wnioskuje go bez adnotacji.',
      },
      'typescript-functions-002': {
        topic: 'void kontra never',
        question: 'Kiedy never jest właściwym typem zwracanym?',
        answers: {
          a: 'Gdy funkcja nie może wrócić normalnie — zawsze rzuca albo nigdy się nie kończy',
          b: 'Gdy funkcja zwraca undefined',
          c: 'Gdy funkcja nie zwraca nic użytecznego',
          d: 'Gdy wartość zwracana ma być ignorowana',
        },
        explanation:
          'void pokrywa "nie zwraca nic użytecznego". never to typ pusty: nie zamieszkuje go żadna wartość, więc funkcja nie ma normalnego wyjścia.',
      },
      'typescript-functions-003': {
        topic: 'Kolejność parametrów',
        question: 'Którą linię kompilator odrzuci?',
        answers: {
          a: 'Linia 1 — parametr wymagany nie może występować po opcjonalnym',
          b: 'Linia 2 — szablony wymagają String()',
          c: 'Linia 4 — wywołanie przekazuje za dużo argumentów',
          d: 'Żadna linia nie jest odrzucana',
        },
        explanation:
          'Parametry opcjonalne muszą być na końcu, inaczej wywołujący nie mógłby ich pominąć. Zamień kolejność albo daj value wartość domyślną.',
      },
      'typescript-functions-004': {
        topic: 'Alias typu funkcyjnego',
        question: 'Uzupełnij alias opisujący funkcję biorącą number i zwracającą string.',
        explanation:
          'Typ funkcyjny używa => dla typu zwracanego. Dwukropek stosuje się wewnątrz interfejsów i literałów typów obiektowych w skróconym zapisie metody.',
      },
      'typescript-functions-005': {
        topic: 'Parametry domyślne',
        question: 'Parametr z wartością domyślną wciąż ma undefined w swoim typie wewnątrz ciała funkcji.',
        explanation:
          'Wartość domyślna jest stosowana przed wykonaniem ciała, więc typ parametru w środku nie zawiera undefined — inaczej niż przy parametrze opcjonalnym.',
      },
      'typescript-functions-006': {
        topic: 'Parametry reszty',
        question: 'Jaki jest typ values?',
        explanation: 'Parametr reszty zbiera pozostałe argumenty do prawdziwej tablicy, więc adnotuje się go typem tablicowym.',
      },
      'typescript-functions-007': {
        topic: 'Typ zwracany funkcji async',
        question: 'Uzupełnij adnotację funkcji async rozwiązującej się do User.',
        answers: { a: 'Promise', b: 'Awaited', c: 'Async', d: 'Future' },
        explanation: 'Funkcja async zawsze zwraca obietnicę, więc jej adnotowany typ zwracany musi być Promise<T>.',
      },
      'typescript-functions-008': {
        topic: 'Sygnatury przeciążeń',
        question: 'TypeScript · funkcje',
        back: 'Przeciążenia funkcji — wywołujący widzą tylko sygnatury, nigdy tej implementacyjnej',
        explanation: 'Sygnatura implementacji musi być zgodna z każdym przeciążeniem, ale sama nie jest wywoływalna z zewnątrz.',
      },
      'typescript-functions-009': {
        topic: 'Liczba parametrów callbacku',
        question: 'Dlaczego callback typu (a: number) => void można przekazać tam, gdzie oczekiwany jest (a: number, b: number) => void?',
        answers: {
          a: 'Funkcję ignorującą końcowe parametry zawsze bezpiecznie jest wywołać z większą liczbą argumentów',
          b: 'TypeScript uzupełnia brakujący parametr wartością undefined',
          c: 'Nie można — liczby parametrów muszą się zgadzać',
          d: 'Bo typ zwracany void wyłącza kontrolę parametrów',
        },
        explanation:
          'Mniej parametrów jest zawsze zgodne: nadmiarowe argumenty po prostu nie są używane. Dlatego arr.map(n => n * 2) przechodzi kontrolę mimo że map przekazuje trzy argumenty.',
      },
      'typescript-functions-010': {
        topic: 'this w funkcjach strzałkowych',
        question: 'Dlaczego wersja strzałkowa działa, a druga nie?',
        answers: {
          a: 'Funkcja strzałkowa przejmuje this z instancji klasy; oderwana metoda je traci',
          b: 'Metod nie da się destrukturyzować w TypeScripcie',
          c: 'Właściwości strzałkowe są statyczne',
          d: 'Nie ma różnicy',
        },
        explanation:
          'Przekazywanie metody jako callbacku to typowa droga do tego błędu. Właściwości strzałkowe kosztują jedno domknięcie na instancję — to jest kompromis.',
      },
      'typescript-functions-011': {
        topic: 'Jawne typy zwracane w eksportach',
        question: 'Po co adnotować typ zwracany eksportowanej funkcji, skoro wnioskowanie działa?',
        answers: {
          a: 'Powstrzymuje refaktor przed cichym rozszerzeniem publicznego kontraktu i trzyma błąd przy definicji',
          b: 'Wnioskowanie nie działa między modułami',
          c: 'Wymaga tego tryb ścisły',
          d: 'Przyspiesza build w czasie wykonania',
        },
        explanation:
          'Bez tego zwrócenie null w nowej gałęzi zmienia typ u każdego konsumenta zamiast wysypać się tam, gdzie nastąpiła zmiana.',
      },
      'typescript-functions-012': {
        topic: 'Predykat typu',
        question: 'Uzupełnij sygnaturę tak, żeby wywołujący zawężali typ po sprawdzeniu.',
        answers: { a: 'as', b: 'extends', c: 'is', d: 'satisfies' },
        explanation: 'Predykat typu to obietnica, którą kompilator bierze na wiarę, więc ciało musi naprawdę sprawdzać to, co deklaruje.',
      },
      'typescript-functions-013': {
        topic: 'Opcjonalne wywołanie',
        question: '`callback?.()` wywołuje funkcję tylko wtedy, gdy callback nie jest null ani undefined.',
        explanation:
          'W przeciwnym razie wyrażenie zwraca undefined. Nie chroni to przed sytuacją, w której callback jest niewywoływalną wartością innego typu.',
      },
      'typescript-functions-014': {
        topic: 'async bez await',
        question: 'Która linia sprawia, że błąd znika po cichu?',
        answers: {
          a: 'Linia 2 — await jest tam niedozwolony',
          b: 'Linia 1 — Promise<void> to niepoprawny typ zwracany',
          c: 'Linia 6 — obietnica nie jest awaitowana, więc odrzucenie staje się nieobsłużone',
          d: 'Linia 5 — handler musi być async',
        },
        explanation:
          'Kompilator na to pozwala; wyłapuje to reguła lintu no-floating-promises. Albo zrób await, albo zaznacz intencję przez void save().',
      },
      'typescript-functions-015': {
        topic: 'never w wyczerpujących switchach',
        question: 'Co daje pomocnik o sygnaturze `(value: never) => never` w gałęzi default switcha?',
        answers: {
          a: 'Błąd kompilacji w chwili, gdy nowy wariant unii nie zostanie obsłużony',
          b: 'Wyjątek w czasie wykonania dla nieznanych wartości',
          c: 'Szybsze wykonanie switcha',
          d: 'Automatyczną obsługę nowego przypadku',
        },
        explanation:
          'Gdy wszystkie przypadki są obsłużone, wartość zawęża się do never i wywołanie przechodzi kontrolę. Dodaj wariant, a kod przestaje się kompilować — o to chodzi.',
      },
    },
  },

  'typescript-generics': {
    title: 'Generyki',
    description: 'Parametry typu, wnioskowanie z argumentów, ograniczenia przez extends i domyślne argumenty typu.',
    content: [
      {
        title: 'Definicja',
        body: 'Generyk to parametr typu: miejsce, które wypełnia wywołujący. Pozwala jednej funkcji albo typowi zachować dokładną zależność między wejściem a wyjściem zamiast schodzić do any.',
      },
      {
        title: 'Wnioskowanie z miejsca wywołania',
        body: 'Rzadko podajesz argumenty typu ręcznie — TypeScript odczytuje je z argumentów.',
      },
      {
        title: 'Dobra praktyka',
        body: 'Ogranicz parametr typu, gdy musisz z niego czytać: <T extends { id: string }> pozwala sięgnąć po .id, zachowując dokładny typ wywołującego w wyniku.',
      },
    ],
    exercises: {
      'typescript-generics-001': {
        topic: 'Wnioskowanie typu generycznego',
        question: 'Jaki jest wywnioskowany typ x?',
        explanation: 'T jest wnioskowane jako number z argumentu, więc items[0] to number.',
      },
      'typescript-generics-002': {
        topic: 'Ograniczenia',
        question: 'Uzupełnij ograniczenie tak, żeby ciało mogło czytać entity.id.',
        answers: { a: 'extends', b: 'implements', c: 'is', d: 'of' },
        explanation: 'extends ogranicza parametr typu. Bez tego T mogłoby być czymkolwiek i .id nie byłoby znane.',
      },
      'typescript-generics-003': {
        topic: 'Generyki kontra any',
        question: 'Co daje generyk, czego nie daje any?',
        answers: {
          a: 'Zachowuje zależność między argumentem a typem zwracanym, więc wywołujący nie traci informacji o typie',
          b: 'Przyspiesza funkcję w czasie wykonania',
          c: 'Waliduje wartości w czasie wykonania',
          d: 'Pozwala przekazać więcej typów wartości',
        },
        explanation: 'any przyjmuje wszystko i zwraca wszystko, gubiąc powiązanie. Parametr typu przenosi typ wywołującego przez całą funkcję.',
      },
      'typescript-generics-004': {
        topic: 'Nieograniczony parametr',
        question: 'Którą linię kompilator odrzuci?',
        answers: {
          a: 'Linia 2 — length nie istnieje na nieograniczonym T',
          b: 'Linia 1 — generyk wymaga domyślnego argumentu typu',
          c: 'Linia 4 — argument typu trzeba podać jawnie',
          d: 'Żadna linia nie jest odrzucana',
        },
        explanation: 'T jest nieznane w ciele, dopóki go nie ograniczysz. <T extends { length: number }> czyni linię 2 legalną.',
      },
      'typescript-generics-005': {
        topic: 'Koszt w czasie wykonania',
        question: 'Generyki są usuwane przy kompilacji i nie dokładają żadnego kodu w czasie wykonania.',
        explanation: 'Jak każdy inny typ w TypeScripcie, parametr typu znika w wygenerowanym JavaScripcie.',
      },
      'typescript-generics-006': {
        topic: 'Interfejsy generyczne',
        question: 'Jaki jest typ result?',
        explanation: 'T to string[], więc b.value jest tablicą, a .length liczbą.',
      },
      'typescript-generics-007': {
        topic: 'Domyślny argument typu',
        question: 'Uzupełnij deklarację tak, żeby Box domyślnie trzymał string.',
        answers: { a: '=', b: 'extends', c: 'as', d: ':' },
        explanation: 'Domyślny argument typu zapisuje się przez =. Można go łączyć z ograniczeniem: <T extends object = {}>.',
      },
      'typescript-generics-008': {
        topic: 'keyof z generykami',
        question: 'TypeScript · generyki',
        back: 'Typowany getter właściwości — typ zwracany podąża za przekazanym kluczem',
        explanation:
          'To kanoniczna para generyków: K ograniczone do kluczy obiektu, a T[K] to typ dostępu indeksowanego.',
      },
      'typescript-generics-009': {
        topic: 'Kiedy nie używać generyka',
        question: 'Parametr typu pojawia się dokładnie raz, w jednej pozycji parametru, i nigdzie w typie zwracanym. Co to sugeruje?',
        answers: {
          a: 'Generyk na nic nie pracuje — wystarczyłoby samo ograniczenie',
          b: 'Powinien dostać domyślny argument typu',
          c: 'Powinien być ograniczony ściślej',
          d: 'Nic — to normalny kształt generyka',
        },
        explanation: 'Parametr typu wiąże dwie pozycje. Użyty raz dokłada tylko szumu: weź ograniczenie wprost jako typ parametru.',
      },
      'typescript-generics-010': {
        topic: 'Wnioskowanie z callbacku',
        question: 'Jaki jest typ result?',
        explanation: 'T pochodzi z tablicy, U z typu zwracanego callbacku. Dwa parametry wywnioskowane z dwóch pozycji to esencja generyków.',
      },
      'typescript-generics-011': {
        topic: 'Typy warunkowe',
        question: 'Co znaczy `T extends string ? A : B` w pozycji typu?',
        answers: {
          a: 'Typ warunkowy: daje A, gdy T jest przypisywalne do string, w przeciwnym razie B',
          b: 'Ograniczenie wymagające, żeby T było stringiem',
          c: 'Sprawdzenie w czasie wykonania wkompilowane w wynik',
          d: 'Deklarację, że T dziedziczy po string',
        },
        explanation:
          'To if na poziomie typów. Nad unią rozdziela się wariant po wariancie — tak zbudowane są Exclude i NonNullable.',
      },
      'typescript-generics-012': {
        topic: 'infer',
        question: 'Uzupełnij typ warunkowy wyciągający typ elementu z tablicy.',
        answers: { a: 'infer', b: 'extract', c: 'keyof', d: 'typeof' },
        explanation:
          'infer wprowadza zmienną typową wewnątrz warunku i wiąże ją z tym, co dopasowano. ReturnType i Awaited napisane są tak samo.',
      },
      'typescript-generics-013': {
        topic: 'Jawne argumenty typu',
        question: 'Podanie argumentu typu wprost, jak w first<string>(items), wyłącza dla tego wywołania wnioskowanie.',
        explanation:
          'Wyłącza też błąd, który dostałbyś przy niezgodności, więc na review warto się takim wywołaniom przyjrzeć, gdy typ dało się wywnioskować.',
      },
      'typescript-generics-014': {
        topic: 'Zbyt luźne ograniczenie',
        question: 'Dlaczego linia 2 się nie kompiluje?',
        answers: {
          a: 'Rozpraszanie generyków jest niedozwolone',
          b: 'T to dokładny typ wywołującego, a dodatkowa właściwość sprawia, że wynik nie jest do niego przypisywalny',
          c: 'Date.now() zwraca string',
          d: 'Ograniczeniem powinno być unknown',
        },
        explanation:
          'Zwracanie T to obietnica oddania dokładnie typu wywołującego. Zadeklaruj zamiast tego typ zwracany jako T & { mergedAt: number }.',
      },
      'typescript-generics-015': {
        topic: 'Domyślne z ograniczeniem',
        question: 'Co deklaruje `<T extends object = Record<string, unknown>>`?',
        answers: {
          a: 'Parametr ograniczony do typów obiektowych, domyślnie string-kluczowany rekord, gdy pominięty',
          b: 'Parametr, który musi być dokładnie Record<string, unknown>',
          c: 'Błąd składni — ograniczenia i domyślnej nie da się łączyć',
          d: 'Parametr, którego wartość domyślna jest sprawdzana w czasie wykonania',
        },
        explanation: 'Ograniczenie i wartość domyślna są niezależne, a domyślna musi sama spełniać ograniczenie.',
      },
    },
  },

  'typescript-narrowing': {
    title: 'Zawężanie typów',
    description: 'Strażniki typeof i in, unie z dyskryminantem, zawężanie po prawdziwościowości i wyczerpujące switche.',
    content: [
      {
        title: 'Definicja',
        body: 'Zawężanie to sposób, w jaki TypeScript podąża za twoim przepływem sterowania. Wewnątrz gałęzi, w której sprawdzenie przeszło, unia kurczy się do wariantów, które mogą tam jeszcze być, a ich składowe stają się dostępne.',
      },
      {
        title: 'Unia z dyskryminantem',
        body: 'Daj każdemu wariantowi literalny znacznik, a switch zawęzi typ za ciebie — to ten sam wzorzec, na którym stoi typ Exercise w tej aplikacji.',
      },
      {
        title: 'Dobra praktyka',
        body: 'Dodaj gałąź default, która przypisuje wartość do never. Gdy pojawi się nowy wariant unii, ta linia przestaje się kompilować i wskazuje każde miejsce, które trzeba obsłużyć.',
      },
    ],
    exercises: {
      'typescript-narrowing-001': {
        topic: 'Strażnik typeof',
        question: 'TypeScript · zawężanie',
        back: 'Zawęża x do string wewnątrz gałęzi',
        explanation: 'Strażnik typeof zawęża unię tak, że składowe dostępne tylko dla string stają się widoczne.',
      },
      'typescript-narrowing-002': {
        topic: 'Zawężanie przez typeof',
        question: 'Jaki jest typ x w zaznaczonej linii?',
        explanation: 'Wewnątrz strażnika zostaje tylko wariant number, dlatego toFixed jest dostępne. Po if x ma typ string.',
      },
      'typescript-narrowing-003': {
        topic: 'Wyczerpywalność',
        question: 'Co daje przypisanie wartości switcha do zmiennej typu never w gałęzi default?',
        answers: {
          a: 'Zamienia nowo dodany wariant unii w błąd kompilacji w każdym nieobsłużonym switchu',
          b: 'Rzuca pomocny wyjątek w czasie wykonania',
          c: 'Ucisza ostrzeżenie o braku typu zwracanego',
          d: 'Przyspiesza switch',
        },
        explanation:
          'Gdy wszystkie warianty są obsłużone, wartość zawęża się do never i przypisanie przechodzi. Dodaj wariant, a przestaje się kompilować.',
      },
      'typescript-narrowing-004': {
        topic: 'Operator in',
        question: 'Uzupełnij strażnik rozróżniający dwa kształty po obecności właściwości.',
        answers: { a: 'in', b: 'of', c: 'hasOwnProperty', d: 'typeof' },
        explanation: 'Operator in zawęża unię do wariantów, które deklarują tę właściwość. hasOwnProperty nie zawęża.',
      },
      'typescript-narrowing-005': {
        topic: 'Prawdziwościowość i zero',
        question: 'Która linia ukrywa błąd, gdy count wynosi 0?',
        answers: {
          a: 'Linia 2 — 0 jest falsy, więc realne zero raportuje "unknown"',
          b: 'Linia 3 — szablony wymagają String()',
          c: 'Linia 1 — opcjonalny parametr number jest niedozwolony',
          d: 'Linia 5 — typy zwracane muszą się zgadzać',
        },
        explanation:
          'Zawężanie po prawdziwościowości usuwa 0 razem z undefined. Testuj count !== undefined, gdy zero jest poprawną wartością.',
      },
      'typescript-narrowing-006': {
        topic: 'Predykaty typu',
        question: 'Funkcja zwracająca `x is Cat` pozwala kompilatorowi zawęzić typ w miejscu wywołania.',
        explanation:
          'To strażnik typu zdefiniowany przez użytkownika. Kompilator ufa predykatowi, więc ciało musi naprawdę sprawdzać to, co deklaruje.',
      },
      'typescript-narrowing-007': {
        topic: 'Dyskryminant',
        question: 'Uzupełnij zdanie.',
        sentence: 'Unia z dyskryminantem wymaga, żeby każdy wariant miał ___ właściwość o typie literalnym.',
        answers: { a: 'wspólną', b: 'unikalną', c: 'opcjonalną', d: 'readonly' },
        explanation:
          'Dyskryminant to jedna właściwość obecna w każdym wariancie, której typ literalny je rozróżnia — kind, type, status.',
      },
      'typescript-narrowing-008': {
        topic: 'Zawężanie nie przeżywa callbacku',
        question: 'Dlaczego kompilator protestuje w zaznaczonej linii?',
        answers: {
          a: 'Przy parametrze nie protestuje — ale zawężanie znika dla zmiennej mutowalnej przechwyconej w domknięciu',
          b: 'Callbacki setTimeout nie mogą czytać zmiennych zewnętrznych',
          c: 'Zawężanie nigdy nie działa w funkcjach strzałkowych',
          d: 'x trzeba adnotować ponownie w callbacku',
        },
        explanation:
          'Analiza przepływu nie wie, kiedy odroczony callback się wykona, więc zawężanie czegokolwiek przepinalnego jest odrzucane. Skopiuj najpierw do const.',
      },
      'typescript-narrowing-009': {
        topic: 'Array.isArray',
        question: 'Które sprawdzenie zawęża `string | string[]` do gałęzi tablicowej?',
        answers: {
          a: 'Array.isArray(value)',
          b: 'typeof value === "array"',
          c: 'value instanceof String',
          d: 'value.length > 0',
        },
        explanation:
          'Array.isArray jest otypowane jako strażnik typu. typeof nigdy nie zwraca "array", a length istnieje w obu wariantach, więc nic nie zawęża.',
      },
      'typescript-narrowing-010': {
        topic: 'typeof null',
        question: 'Dlaczego ten strażnik nie wyklucza null?',
        answers: {
          a: 'typeof null to "object", więc null nadal jest w zawężonym typie',
          b: 'typeof nie działa na typach obiektowych',
          c: 'Unia potrzebuje dyskryminanta',
          d: 'Wyklucza null',
        },
        explanation: 'Dziwactwo JavaScriptu, które system typów wiernie modeluje. Sprawdź `if (x)` albo x !== null.',
      },
      'typescript-narrowing-011': {
        topic: 'Funkcje asercji',
        question: 'Co robi funkcja zadeklarowana jako `asserts value is string`?',
        answers: {
          a: 'Zawęża argument dla reszty zasięgu, na obietnicę, że w przeciwnym razie rzuci wyjątek',
          b: 'Zwraca wartość logiczną, którą wywołujący musi sprawdzić',
          c: 'Automatycznie dodaje sprawdzenie typu w czasie wykonania',
          d: 'Rzutuje wartość bez żadnego efektu',
        },
        explanation:
          'W odróżnieniu od predykatu nic nie zwraca: sam fakt, że wykonanie poszło dalej, oznacza, że asercja zaszła. Musi być wywołana na zmiennej z jawną adnotacją typu.',
      },
      'typescript-narrowing-012': {
        topic: 'instanceof',
        question: 'Uzupełnij strażnik zawężający nieznany błąd do Error.',
        answers: { a: 'instanceof', b: 'typeof', c: 'is', d: 'in' },
        explanation:
          'catch wiąże unknown przy useUnknownInCatchVariables, więc dopiero ten strażnik udostępnia .message. Błędy przekraczające granicę realmu potrafią instanceof pokonać.',
      },
      'typescript-narrowing-013': {
        topic: 'Zawężanie właściwości',
        question: 'Zawężenie obj.value strażnikiem typeof przeżywa wywołanie funkcji w międzyczasie.',
        explanation: 'Każde wywołanie mogło przepiąć właściwość, więc analiza przepływu odrzuca zawężenie. Skopiuj najpierw do const.',
      },
      'typescript-narrowing-014': {
        topic: 'Array.filter i null',
        question: 'Dlaczego items w linii 2 nadal ma typ (string | null)[]?',
        answers: {
          a: 'filter jest otypowane tak, że zwraca ten sam typ elementu, chyba że callback jest predykatem typu',
          b: 'filter nie przyjmuje funkcji strzałkowych',
          c: 'Porównanie powinno być != null',
          d: 'Zawężenie jest poprawne',
        },
        explanation:
          'Napisz `(x): x is string => x !== null` — albo, od TypeScriptu 5.5, wnioskowanie zrobi to za ciebie dla prostych predykatów.',
      },
      'typescript-narrowing-015': {
        topic: 'Zawężanie przez równość',
        question: 'Dla `a: string | number` i `b: string | boolean` jaki jest typ a wewnątrz `if (a === b)`?',
        answers: { a: 'string — jedyny typ wspólny dla obu unii', b: 'string | number', c: 'never', d: 'string | boolean' },
        explanation: 'Równość zawęża oba operandy do wspólnych wariantów, bo tylko one mogą być sobie równe przy ścisłym porównaniu.',
      },
    },
  },

  'typescript-utility-types': {
    title: 'Typy narzędziowe',
    description: 'Partial, Required, Pick, Omit, Record i ReturnType — wyprowadzanie typów zamiast ich powtarzania.',
    content: [
      {
        title: 'Definicja',
        body: 'Typy narzędziowe przekształcają istniejący typ w pokrewny. Wyprowadzanie bije duplikowanie: gdy typ źródłowy się zmieni, wszystko, co z niego zbudowano, idzie za nim automatycznie.',
      },
      {
        title: 'Cztery używane najczęściej',
        body: 'Partial przy payloadach częściowej aktualizacji, Pick i Omit przy przyciętych widokach, Record przy mapach.',
      },
      {
        title: 'Uwaga',
        body: 'Partial jest płytkie, a Omit bez protestu przyjmuje klucze, które nie istnieją. Pick jest ostrzejszym wyborem, gdy chcesz, żeby literówka się wysypała.',
      },
    ],
    exercises: {
      'typescript-utility-001': {
        topic: 'Partial',
        question: 'Co daje Partial<User> dla `interface User { id: string; name: string }`?',
        explanation:
          'Partial zamienia każdą właściwość na opcjonalną. Zwróć uwagę, że opcjonalna i `| undefined` to nie to samo przy exactOptionalPropertyTypes.',
      },
      'typescript-utility-002': {
        topic: 'Pick kontra Omit',
        question: 'Który argument przemawia za Pick zamiast Omit?',
        answers: {
          a: 'Pick wymienia to, co zostaje, więc zmiana nazwy właściwości źródłowej psuje typ pochodny zamiast go po cichu rozszerzać',
          b: 'Pick kompiluje się szybciej',
          c: 'Omit nie działa z interfejsami',
          d: 'Omit usuwa tylko jeden klucz naraz',
        },
        explanation:
          'Parametr kluczy Omit nie jest ograniczony do keyof T, więc nieaktualny klucz przechodzi bez słowa. Parametr Pick jest ograniczony i wysypuje się głośno.',
      },
      'typescript-utility-003': {
        topic: 'Record',
        question: 'Uzupełnij typ mapy z nazwy poziomu na listę lekcji.',
        answers: { a: 'Record', b: 'Map', c: 'Index', d: 'Dict' },
        explanation: 'Record<K, V> buduje typ obiektowy o podanej unii kluczy i typie wartości. Map to klasa czasu wykonania, nie typ narzędziowy.',
      },
      'typescript-utility-004': {
        topic: 'ReturnType',
        question: 'Jaki jest typ R?',
        explanation:
          'typeof makeUser to typ funkcji; ReturnType wyciąga to, do czego się rozwiązuje. Tak unika się pisania tego kształtu dwa razy.',
      },
      'typescript-utility-005': {
        topic: 'Głębokość Partial',
        question: 'Partial<T> czyni opcjonalnymi także właściwości zagnieżdżonych obiektów.',
        explanation: 'Partial działa na jeden poziom. Rekurencyjne DeepPartial trzeba napisać ręcznie — albo, lepiej, go unikać.',
      },
      'typescript-utility-006': {
        topic: 'keyof',
        question: 'Uzupełnij typ będący unią nazw właściwości typu.',
        answers: { a: 'keyof', b: 'typeof', c: 'valueof', d: 'in' },
        explanation: 'keyof User daje "id" | "name" | "email". typeof działa na wartościach, nie na typach.',
      },
      'typescript-utility-007': {
        topic: 'Omit z nieaktualnym kluczem',
        question: 'Dlaczego to się kompiluje, mimo że jest błędne?',
        answers: {
          a: 'Parametr kluczy Omit nie jest ograniczony do keyof User, więc literówka przechodzi i nic nie zostaje usunięte',
          b: 'Omit zupełnie ignoruje drugi argument',
          c: 'To się nie kompiluje',
          d: 'Omit tworzy zamiast tego brakującą właściwość',
        },
        explanation:
          'To znana ostra krawędź. Pick<User, "id" | "name"> albo własny ograniczony pomocnik wyłapuje literówkę.',
      },
      'typescript-utility-008': {
        topic: 'NonNullable',
        question: 'TypeScript · typy narzędziowe',
        back: 'Usuwa null i undefined z unii',
        explanation: 'We współczesnym TypeScripcie równoważne T & {}. Przydatne po filtrze, za którym kompilator nie nadąża.',
      },
      'typescript-utility-009': {
        topic: 'Readonly',
        question: 'Co robi Readonly<T>?',
        answers: {
          a: 'Oznacza każdą właściwość jako readonly, na jeden poziom w głąb',
          b: 'Zamraża obiekt w czasie wykonania',
          c: 'Czyni typ niemutowalnym aż do samego dna',
          d: 'Usuwa wszystkie settery',
        },
        explanation: 'Jak Partial, działa płytko i wyłącznie w czasie kompilacji — Object.freeze to odpowiednik czasu wykonania.',
      },
      'typescript-utility-010': {
        topic: 'Awaited',
        question: 'Jaki jest typ R?',
        explanation:
          'Awaited rozpakowuje obietnicę, rekurencyjnie. Połączenie z ReturnType to standardowy sposób nazwania tego, do czego rozwiązuje się funkcja async.',
      },
      'typescript-utility-011': {
        topic: 'Exclude i Extract',
        question: 'Co daje Exclude<"a" | "b" | "c", "b">?',
        explanation: 'Exclude usuwa z unii przypisywalne warianty; Extract je zostawia. Oba to typy warunkowe rozdzielające się nad unią.',
      },
      'typescript-utility-012': {
        topic: 'Typ mapowany',
        question: 'Uzupełnij typ mapowany czyniący każdą właściwość nullowalną.',
        answers: { a: 'in', b: 'of', c: 'extends', d: 'from' },
        explanation:
          '`in keyof T` iteruje po kluczach. Partial, Required i Readonly są napisane tak samo, z modyfikatorem +/- na fladze optional albo readonly.',
      },
      'typescript-utility-013': {
        topic: 'Parameters',
        question: 'Parameters<typeof fn> daje krotkę typów parametrów funkcji.',
        explanation:
          'Krotkę, nie unię — więc Parameters<typeof fn>[0] to pierwszy parametr. Przydatne przy opakowywaniu funkcji bez powtarzania sygnatury.',
      },
      'typescript-utility-014': {
        topic: 'Record z wąskim kluczem',
        question: 'Dlaczego linia 2 się nie kompiluje?',
        answers: {
          a: 'Record wymaga sygnatury indeksu string',
          b: 'Każdy klucz unii jest wymagany — brakuje advanced',
          c: 'Typ wartości powinien być unią',
          d: 'Record nie przyjmuje unii literałów jako klucza',
        },
        explanation:
          'Record nad skończoną unią jest z założenia wyczerpujący, co czyni go dobrym do tablic wyszukiwania. Partial<ByLevel>, jeśli luki są zamierzone.',
      },
      'typescript-utility-015': {
        topic: 'Typy szablonowe',
        question: 'Co daje `type Event = `on${Capitalize<"click" | "focus">}``?',
        explanation:
          'Typy szablonowe rozdzielają się nad uniami i komponują z wbudowanymi pomocnikami wielkości liter — podstawa typowanych map zdarzeń i mapowania nazw propsów.',
      },
    },
  },
};

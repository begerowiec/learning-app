/** Polish translations — Playwright lessons. */
export const playwright = {
  'playwright-locator-strategy': {
    title: 'Strategia lokatorów',
    description: 'Dlaczego getByRole bije łańcuch CSS, przed czym naprawdę chroni tryb strict i jak zawężać zamiast indeksować.',
    content: [
      {
        title: 'Lokatory są leniwe',
        body: 'Lokator to nie element, tylko opis tego, jak go znaleźć — rozwiązywany od nowa przy każdej akcji. Dlatego lokator utworzony przed przerysowaniem strony nadal działa i dlatego w Playwrighcie nie istnieje błąd nieaktualnej referencji do elementu.',
      },
      {
        title: 'Kolejność, po którą sięgać',
        body: 'Najpierw rola, potem etykieta albo tekst, potem test id. Łańcuch CSS to ostateczność: koduje kształt DOM-u, czyli tę część, która najczęściej się zmienia.',
      },
      {
        title: 'Tryb strict',
        body: 'Każda akcja na lokatorze pasującym do więcej niż jednego elementu rzuca wyjątek zamiast po cichu brać pierwszy. Ten błąd to realna niejednoznaczność na stronie, a nie złośliwość Playwrighta — .first() ją ukrywa, zawężenie naprawia.',
      },
    ],
    exercises: {
      'playwright-locator-001': {
        topic: 'Dlaczego lokatory po roli',
        question: 'Dlaczego getByRole jest zwykle lepsze niż selektor CSS?',
        answers: {
          a: 'Szybciej się wylicza w przeglądarce',
          b: 'Celuje w to, co widzi użytkownik i technologie asystujące, więc przeżywa refaktory znaczników',
          c: 'To jedyny lokator wspierający auto-waiting',
          d: 'Selektory CSS nie działają w Playwrighcie',
        },
        explanation:
          'Rola i dostępna nazwa są częścią kontraktu z użytkownikiem; nazwy klas i głębokość DOM-u to szczegóły implementacji. Lokator po roli dodatkowo wysypuje się głośno, gdy dostępność się psuje.',
      },
      'playwright-locator-002': {
        topic: 'Naruszenie trybu strict',
        question: 'Strona ma trzy przyciski "Delete", po jednym w wierszu. Która linia rzuca wyjątek?',
        answers: {
          a: 'Linia 2 — toHaveCount wymaga pojedynczego elementu',
          b: 'Linia 4 — getByText dopasowuje fragmenty tekstu',
          c: 'Linia 3 — lokator wskazuje trzy elementy, a tryb strict nie zgaduje',
          d: 'Linia 1 — getByRole("row") to niepoprawna rola',
        },
        explanation:
          'Asercje na kolekcji są w porządku, akcje nie. Zawęź: page.getByRole("row", { name: "Invoice 12" }).getByRole("button", { name: "Delete" }).',
      },
      'playwright-locator-003': {
        topic: 'Zawężanie zamiast indeksowania',
        question: 'Która wersja przeżyje dodanie nowego wiersza na górze tabeli?',
        answers: {
          a: 'B — identyfikuje wiersz po jego treści, więc pozycja nie ma znaczenia',
          b: 'A — nth() jest przeliczane przy każdej akcji',
          c: 'Obie, bo Playwright rozwiązuje lokatory od nowa',
          d: 'Żadna — trzeba użyć test id',
        },
        explanation:
          'Ponowne rozwiązanie nie pomaga, gdy to sam indeks jest złym pomysłem. nth() nadaje się do rzeczy faktycznie pozycyjnych ("pierwszy element"), a nie do identyfikowania rekordu.',
      },
      'playwright-locator-004': {
        topic: 'Lenistwo lokatorów',
        question: 'Lokator zapisany w zmiennej przed przerysowaniem strony staje się nieaktualny i trzeba go utworzyć od nowa.',
        explanation:
          'Lokator trzyma zapytanie, a nie element. Jest rozwiązywany ponownie w momencie każdej akcji i asercji — dlatego Playwright nie ma błędów stale element.',
      },
      'playwright-locator-005': {
        topic: 'Dokładne dopasowanie tekstu',
        question: 'getByText("Save") pasuje też do "Save and close". Uzupełnij wywołanie tak, żeby pasowała tylko dokładna etykieta.',
        answers: { a: 'strict', b: 'exact', c: 'full', d: 'whole' },
        explanation:
          'Dopasowanie tekstu domyślnie działa na fragmentach i bez rozróżniania wielkości liter. exact: true wymusza pełny ciąg z wielkością liter — a getByRole z nazwą i tak jest zwykle lepsze.',
      },
      'playwright-locator-006': {
        topic: 'filter kontra and',
        question: 'Potrzebujesz elementu listy, który zawiera tekst "Overdue" i ma widoczny przycisk "Pay". Co czyta się najlepiej?',
        explanation:
          'filter() składa czytelne warunki i zachowuje gwarancję trybu strict. Wspinanie się przez ".." działa, ale wiąże test z kształtem DOM-u.',
      },
      'playwright-locator-007': {
        topic: 'Test id',
        question: 'Uzupełnij zdanie.',
        sentence: 'data-testid jest właściwym wyborem, gdy element ___, co identyfikowałoby go dla użytkownika.',
        answers: {
          a: 'nie ma dostępnej roli ani nazwy',
          b: 'ma więcej niż jedną rolę',
          c: 'ma dynamiczną nazwę klasy',
          d: 'nie ma atrybutu id',
        },
        explanation:
          'Test id to wyjście awaryjne dla elementów naprawdę nieopisanych — canvasu wykresu, dekoracyjnego wrappera. Sięganie po nie w pierwszej kolejności sprawia, że problemy z dostępnością nigdy nie wypływają w testach.',
      },
      'playwright-locator-008': {
        topic: 'Shadow DOM i ramki',
        question: 'Widget renderuje się wewnątrz iframe. Co zrobi ten kod?',
        answers: {
          a: 'Przekroczy limit czasu — lokatory strony nie wchodzą do iframe, potrzebny jest frameLocator()',
          b: 'Zadziała — Playwright domyślnie przeszukuje każdą ramkę',
          c: 'Rzuci naruszenie trybu strict',
          d: 'Zadziała tylko, jeśli iframe jest z tego samego origin',
        },
        explanation:
          'page.frameLocator("#checkout").getByRole("button", { name: "Pay" }) przekracza granicę. Shadow DOM działa inaczej — lokatory wchodzą do otwartych shadow rootów automatycznie.',
      },
      'playwright-locator-009': {
        topic: 'Dopasowanie nazwy w getByRole',
        question: 'Playwright · lokatory',
        back: 'Dopasowuje dostępną nazwę — fragment, bez rozróżniania wielkości liter, z normalizacją spacji',
        explanation:
          'Dodaj exact: true, gdy "Save" nie może pasować do "Save draft". Dostępna nazwa bierze się z tekstu, aria-label albo powiązanej etykiety.',
      },
      'playwright-locator-010': {
        topic: 'first() jako zapach',
        question: 'Kolega naprawia błąd trybu strict, dopisując .first(). Kiedy to jest naprawdę poprawne?',
        answers: {
          a: 'Zawsze, gdy pojawi się błąd — to udokumentowana naprawa',
          b: 'Tylko gdy strona faktycznie renderuje listę i każdy jej element by pasował',
          c: 'Nigdy — .first() jest przestarzałe',
          d: 'Tylko w testach oznaczonych jako flaky',
        },
        explanation:
          'Tryb strict wychwycił realną niejednoznaczność. Jeśli dopasowanie miało być jedno, .first() zamienia czytelną porażkę w test przechodzący na złym elemencie.',
      },
      'playwright-locator-011': {
        topic: 'Łańcuchowanie',
        question: 'Łańcuchowanie lokatorów (parent.getByRole(...)) zawęża wyszukiwanie do poddrzewa tego rodzica.',
        explanation:
          'To główne narzędzie przeciwko naruszeniom trybu strict: zawęź do karty, wiersza albo dialogu, który masz na myśli, a potem szukaj kontrolki w środku.',
      },
      'playwright-locator-012': {
        topic: 'Sprzężenie z CSS',
        question: 'Ten selektor przestał działać po refaktorze samego CSS. Która część za to odpowiada?',
        answers: {
          a: 'Klasa .btn-primary — klasy nigdy się nie zmieniają',
          b: 'nth-child i kombinator dziecka bezpośredniego, które kodują strukturę DOM-u',
          c: 'Samo locator() — powinno być getByTestId',
          d: 'Nic — refaktor CSS nie może wpłynąć na selektory',
        },
        explanation:
          'Wszystko, co pozycyjne albo strukturalne, pęka po dodaniu jednego diva. Rola plus dostępna nazwa opisują rzecz, którą widzi użytkownik — czyli to, co refaktor zostawił bez zmian.',
      },
    },
  },

  'playwright-auto-waiting': {
    title: 'Automatyczne czekanie',
    description: 'Co naprawdę sprawdza actionability, dlaczego waitForTimeout to złe narzędzie i które dwa czekania nadal są potrzebne.',
    content: [
      {
        title: 'Actionability',
        body: 'Przed każdą akcją Playwright czeka, aż element będzie dołączony do DOM-u, widoczny, stabilny (bez animacji), zdolny odbierać zdarzenia (nic go nie zasłania) i — dla pól — włączony. Dopiero gdy wszystko zachodzi, następuje kliknięcie, a jeśli nigdy nie zajdzie, błąd nazywa warunek, który zawiódł.',
      },
      {
        title: 'Co zastępuje sleep',
        body: 'Stały timeout to zgadywanie: za krótki na CI, zmarnowane sekundy lokalnie. Asercja web-first czeka na warunek, na którym naprawdę ci zależy.',
      },
      {
        title: 'Uwaga',
        body: 'Automatyczne czekanie obejmuje element, a nie stan twojej aplikacji. Zniknięcie spinnera nie znaczy, że lista skończyła się renderować — asertuj dane, których oczekujesz, a nie brak loadera.',
      },
    ],
    exercises: {
      'playwright-waiting-001': {
        topic: 'Warunki actionability',
        question: 'Na co Playwright NIE czeka przed kliknięciem?',
        answers: {
          a: 'Na widoczność elementu',
          b: 'Na stabilność elementu — brak trwającej animacji',
          c: 'Na zakończenie wszystkich trwających żądań sieciowych',
          d: 'Na to, że element odbiera zdarzenia wskaźnika',
        },
        explanation:
          'Bezczynność sieci nie jest częścią actionability, a czekanie na nią zwykle jest błędem — aplikacja z pollingiem albo analityką nigdy nie przechodzi w stan idle.',
      },
      'playwright-waiting-002': {
        topic: 'Sleep jako naprawa',
        question: 'Ten test jest flaky na CI, a lokalnie przechodzi. Na czym polega prawdziwy problem?',
        answers: {
          a: 'Linia 1 — click trzeba awaitować dwa razy',
          b: 'Linie 2–4 — stały sleep plus nieponawiana asercja na migawce licznika',
          c: 'Linia 3 — count() nie jest wspierane',
          d: 'Linia 4 — toBe powinno być toEqual',
        },
        explanation:
          'count() czyta raz, więc expect(number) nie może ponawiać. await expect(page.getByRole("row")).toHaveCount(4) odpytuje aż wiersz się pojawi i żadnego sleepa nie potrzebuje.',
      },
      'playwright-waiting-003': {
        topic: 'Uchwyty kontra wartości',
        question: 'Dlaczego druga linia nigdy nie może ponowić próby?',
        answers: {
          a: 'textContent() rozwiązuje się raz, więc asercja porównuje zwykły string',
          b: 'toBe z założenia nie ponawia, ale toEqual by ponawiało',
          c: 'getByTestId nie wspiera textContent',
          d: 'Ponawia — expect zawsze jest web-first',
        },
        explanation:
          'Ponawianie to cecha asercji na *lokatorze*: await expect(page.getByTestId("total")).toHaveText("120.00 PLN") czyta ponownie, aż się zgodzi albo minie limit czasu.',
      },
      'playwright-waiting-004': {
        topic: 'networkidle',
        question: 'waitForLoadState("networkidle") to zalecany sposób czekania, aż aplikacja SPA się ustabilizuje.',
        explanation:
          'Dokumentacja Playwrighta tego odradza. Polling, websockety albo analityka trzymają sieć zajętą w nieskończoność; asertuj coś, co widzi użytkownik.',
      },
      'playwright-waiting-005': {
        topic: 'Czekanie na odpowiedź',
        question: 'Kliknięcie i wywołane nim żądanie muszą być awaitowane razem, bez wyścigu. Uzupełnij wywołanie.',
        answers: { a: 'await', b: 'return', c: 'yield', d: 'expect' },
        explanation:
          'Zacznij czekanie przed akcją, a awaituj po niej — ta kolejność chroni przed przegapieniem szybkiej odpowiedzi. Awaitowanie waitForResponse przed kliknięciem zakleszczyłoby test.',
      },
      'playwright-waiting-006': {
        topic: 'Element zasłonięty nakładką',
        question: 'Kliknięcie kończy się limitem czasu z komunikatem "element intercepts pointer events". Co to znaczy?',
        answers: {
          a: 'Element jest czymś zasłonięty — toastem, tłem modala, przyklejonym nagłówkiem',
          b: 'Element jest wyłączony',
          c: 'Selektor dopasował dwa elementy',
          d: 'Strona nawigowała w trakcie kliknięcia',
        },
        explanation:
          'Playwright testuje trafienie w punkt, w który zaraz kliknie. force: true pomija sprawdzenie i zwykle tylko przenosi awarię w mniej oczywiste miejsce — poczekaj raczej, aż nakładka zniknie.',
      },
      'playwright-waiting-007': {
        topic: 'Kliknięcia force',
        question: 'Uzupełnij zdanie.',
        sentence: 'Przekazanie force: true do click() pomija sprawdzenia ___.',
        answers: { a: 'actionability', b: 'nawigacji', c: 'trybu strict', d: 'asercji' },
        explanation:
          'Klika we współrzędne niezależnie od widoczności czy przesłonięcia. Przydatne przy testowaniu celowo zablokowanej kontrolki; wszędzie indziej to obciążenie.',
      },
      'playwright-waiting-008': {
        topic: 'Znikający loader',
        question: 'Która asercja faktycznie dowodzi, że lista się załadowała?',
        answers: {
          a: 'B — asertuje dane, a nie brak loadera',
          b: 'A — spinner znika dokładnie w chwili zakończenia ładowania',
          c: 'Obie są równoważne',
          d: 'Żadna — potrzebny jest waitForTimeout',
        },
        explanation:
          'A przechodzi, zanim spinner się pojawi, i ponownie w luce między rozwiązaniem fetcha a wyrenderowaniem wierszy. Asertuj stan końcowy, na którym ci zależy.',
      },
      'playwright-waiting-009': {
        topic: 'Domyślne limity czasu',
        question: 'Playwright · konfiguracja',
        back: 'Limit expect kontra limit testu — 5 s na asercję web-first, 30 s na cały test, strojone osobno',
        explanation:
          'Podnieś expect.timeout w konfiguracji przy naprawdę wolnym warunku; podnoszenie limitu testu tylko zaciera to, gdzie poszedł czas.',
      },
      'playwright-waiting-010': {
        topic: 'Kiedy jawne czekanie jest słuszne',
        question: 'Który przypadek naprawdę wymaga jawnego czekania zamiast asercji?',
        answers: {
          a: 'Czekanie, aż przycisk stanie się aktywny',
          b: 'Przechwycenie odpowiedzi sieciowej albo pobrania wywołanego akcją',
          c: 'Czekanie, aż pojawi się tekst',
          d: 'Czekanie, aż liczba wierszy się ustabilizuje',
        },
        explanation:
          'Wszystko widoczne pokrywa ponawiana asercja. Zdarzenia spoza DOM-u — odpowiedzi, pobrania, popupy, komunikaty konsoli — wymagają waitFor* uruchomionego przed akcją.',
      },
      'playwright-waiting-011': {
        topic: 'Stabilność animacji',
        question: 'Playwright kliknie element, który wciąż wjeżdża na swoje miejsce.',
        explanation:
          'Stabilność to jeden z warunków actionability: czeka, aż prostokąt elementu przestanie się przesuwać przez dwie kolejne klatki animacji — to właśnie chroni przed kliknięciem obok toastu.',
      },
      'playwright-waiting-012': {
        topic: 'Wyścig przy nawigacji',
        question: 'To sporadycznie kończy się błędem "execution context was destroyed". Dlaczego?',
        answers: {
          a: 'Linia 1 — linków nie da się klikać',
          b: 'Linia 3 — toContain nie działa na stringach',
          c: 'Linia 2 — czyta tytuł w trakcie nawigacji, zanim istnieje nowy dokument',
          d: 'Nic — to błąd Playwrighta',
        },
        explanation:
          'await expect(page).toHaveTitle(/Reports/) ponawia przez całą nawigację. Jednorazowe odczyty tuż po kliknięciu to klasyczne źródło flaków widocznych tylko na CI.',
      },
    },
  },

  'playwright-assertions': {
    title: 'Asercje',
    description: 'Asercje web-first, które ponawiają, ogólne, które nie, asercje miękkie i co naprawdę znaczy toBeVisible.',
    content: [
      {
        title: 'Dwa rodzaje expect',
        body: 'expect(locator) jest web-first: odpytuje, aż warunek zajdzie albo minie limit czasu, i musi być awaitowane. expect(value) to zwykła asercja w stylu Jest na czymś, co już odczytałeś — sprawdza raz i nie wybroni się z luki czasowej.',
      },
      {
        title: 'Forma z await',
        body: 'Zapomniany await to najczęstszy błąd na review kodu Playwrighta: asercja staje się wiszącą obietnicą i test przechodzi bez względu na wszystko.',
      },
      {
        title: 'Dobra praktyka',
        body: 'expect.soft() zapisuje porażkę i idzie dalej, dzięki czemu jeden przebieg raportuje każdą zepsutą asercję na stronie zamiast tylko pierwszej. Test i tak kończy się porażką.',
      },
    ],
    exercises: {
      'playwright-assert-001': {
        topic: 'Brakujący await',
        question: 'Ten test przechodzi, nawet gdy alert nigdy się nie pojawi. Dlaczego?',
        answers: {
          a: 'Linia 2 nie jest awaitowana, więc asercja to wisząca obietnica, której nikt nie sprawdza',
          b: 'toHaveText tylko ostrzega, nigdy nie zawodzi',
          c: 'Linia 1 powinna używać force: true',
          d: 'getByRole("alert") pasuje do wszystkiego',
        },
        explanation:
          'Każda asercja web-first zwraca obietnicę. Bez await test kończy się pierwszy, a odrzucenie wypływa — o ile w ogóle — jako ostrzeżenie o nieobsłużonej obietnicy.',
      },
      'playwright-assert-002': {
        topic: 'Semantyka toBeVisible',
        question: 'Czego wymaga toBeVisible()?',
        answers: {
          a: 'Element jest w DOM-ie i ma niepusty prostokąt',
          b: 'Element jest przewinięty do widocznego obszaru',
          c: 'Elementu nie zasłania żaden inny element',
          d: 'Element ma przezroczystość większą od zera',
        },
        explanation:
          'Widoczność dotyczy układu, nie viewportu: element poniżej zagięcia jest widoczny. Przesłonięcie sprawdza się w momencie akcji, a opacity: 0 nadal liczy się jako widoczne.',
      },
      'playwright-assert-003': {
        topic: 'toHaveText na kolekcji',
        question: 'Lokator pasuje do trzech wierszy. Co asertuje ten kod?',
        answers: {
          a: 'Że trzy elementy mają dokładnie te teksty, w tej kolejności',
          b: 'Że przynajmniej jeden element pasuje do jednego ze stringów',
          c: 'Rzuca naruszenie trybu strict',
          d: 'Że sklejony tekst równa się połączonej tablicy',
        },
        explanation:
          'Przekazanie tablicy asertuje całą kolekcję, łącznie z liczbą elementów. Tryb strict dotyczy akcji, nie asercji — dlatego jest to dozwolone.',
      },
      'playwright-assert-004': {
        topic: 'Asercje miękkie',
        question: 'Test zawierający wyłącznie niespełnione expect.soft() i tak kończy się porażką.',
        explanation:
          'Asercje miękkie odsuwają porażkę na koniec testu, zamiast go przerywać. Służą do zebrania kilku problemów w jednym przebiegu, a nie do ich ignorowania.',
      },
      'playwright-assert-005': {
        topic: 'Negowanie asercji web-first',
        question: 'Uzupełnij asercję, która czeka, aż dialog zniknie.',
        answers: { a: 'not', b: 'never', c: 'no', d: 'without' },
        explanation:
          'not zachowuje ponawianie: odpytuje, aż dialogu nie będzie. toBeHidden() mówi to samo i czyta się lepiej, gdy element zostaje w DOM-ie.',
      },
      'playwright-assert-006': {
        topic: 'toHaveCount(0) kontra toBeHidden',
        question: 'Wiersz ma zniknąć z DOM-u całkowicie. Która asercja to wyraża?',
        explanation:
          'toBeHidden i not.toBeVisible przechodzą także dla elementu tylko niewidocznego. Jedynie toHaveCount(0) odróżnia "nie ma go" od "display: none".',
      },
      'playwright-assert-007': {
        topic: 'Asercje zrzutów ekranu',
        question: 'Uzupełnij asercję wizualną.',
        answers: { a: 'toHaveScreenshot', b: 'toMatchImage', c: 'toLookLike', d: 'toBeScreenshot' },
        explanation:
          'toHaveScreenshot też ponawia — robi zrzut ponownie, aż dwa kolejne będą identyczne, co powstrzymuje animacje przed generowaniem fałszywych różnic.',
      },
      'playwright-assert-008': {
        topic: 'Asercja na zmieniającej się wartości',
        question: 'Która wersja toleruje to, że suma zaktualizuje się chwilę po kliknięciu?',
        answers: {
          a: 'B — asercja na lokatorze odpytuje, aż tekst się zgodzi',
          b: 'A — innerText czeka na element automatycznie',
          c: 'Obie, bo innerText czeka automatycznie',
          d: 'Żadna bez jawnego limitu czasu',
        },
        explanation:
          'innerText() faktycznie czeka na element, ale czyta raz — zwrócona wartość to migawka, a otaczająca ją asercja nie może ponowić.',
      },
      'playwright-assert-009': {
        topic: 'Własny komunikat błędu',
        question: 'Playwright · asercje',
        back: 'Drugi argument staje się komunikatem porażki w raporcie',
        explanation: 'Tanie i bardzo wartościowe na CI: reporter pokazuje twoje zdanie zamiast samego lokatora i różnicy.',
      },
      'playwright-assert-010': {
        topic: 'Limit asercji kontra limit testu',
        question: 'Asercja web-first zawodzi po 5 sekundach, choć limit testu to 30. Dlaczego?',
        answers: {
          a: 'Każda asercja ma własny limit czasu, domyślnie 5 s',
          b: 'Limit testu dotyczy tylko hooków',
          c: 'Asercje dziedziczą jedną czwartą limitu testu',
          d: 'Przeglądarka zamknęła stronę',
        },
        explanation:
          'expect.timeout konfiguruje się osobno od limitu testu. Nadpisz przy wywołaniu — toBeVisible({ timeout: 15_000 }) — albo globalnie w konfiguracji.',
      },
      'playwright-assert-011': {
        topic: 'Normalizacja w toHaveText',
        question: 'toHaveText normalizuje białe znaki, więc nadmiarowe spacje i łamania linii w znacznikach nie psują asercji.',
        explanation:
          'Początkowe, końcowe i powtórzone białe znaki są zwijane. Użyj toHaveText(/regex/), gdy potrzebujesz większej ścisłości, albo toContainText dla fragmentu.',
      },
      'playwright-assert-012': {
        topic: 'Asertowanie, że nic się nie stało',
        question: 'Co jest nie tak z tą próbą udowodnienia, że baner błędu nigdy się nie pokazuje?',
        answers: {
          a: 'Nic — to poprawny wzorzec',
          b: 'Przechodzi natychmiast, zanim baner zdążyłby się pojawić',
          c: 'not nie łączy się z toBeVisible',
          d: 'getByRole("alert") potrzebuje nazwy',
        },
        explanation:
          'Asercja negatywna jest spełniona w chwili, w której jest prawdziwa, czyli tuż po kliknięciu. Asertuj najpierw pozytywny skutek — toast sukcesu, nowy wiersz — a dopiero potem brak.',
      },
    },
  },

  'playwright-test-isolation': {
    title: 'Izolacja testów',
    description: 'Konteksty przeglądarki, fixtures, storageState, zasięg workera — i stan współdzielony, który uzależnia suite od kolejności.',
    content: [
      {
        title: 'Jeden kontekst na test',
        body: 'Każdy test dostaje świeży BrowserContext: własne ciasteczka, localStorage, sessionStorage i uprawnienia, w procesie przeglądarki dzielonym z innymi testami. To właśnie czyni testy domyślnie niezależnymi i to właśnie tracisz w chwili, gdy sięgasz po stan na poziomie modułu.',
      },
      {
        title: 'Logowanie raz',
        body: 'Logowanie przez UI w każdym teście to największa strata czasu w większości suitów. Zrób to raz w global setup, zapisz storage state i używaj go ponownie.',
      },
      {
        title: 'Uwaga',
        body: 'Izolacja kończy się na przeglądarce. Testy piszące do tego samego wiersza bazy, tego samego konta albo tej samej flagi funkcyjnej nadal są sprzężone — a przy równoległych workerach dodatkowo się ścigają.',
      },
    ],
    exercises: {
      'playwright-isolation-001': {
        topic: 'Co izoluje kontekst',
        question: 'Dwa testy działają w tym samym pliku. Co domyślnie współdzielą?',
        answers: {
          a: 'Nic — każdy dostaje własny kontekst, ciasteczka i storage',
          b: 'Ciasteczka, bo przeglądarka to ten sam proces',
          c: 'localStorage, ale nie ciasteczka',
          d: 'Wszystko, o ile nie użyje się test.describe.configure',
        },
        explanation:
          'Proces przeglądarki jest współdzielony dla szybkości; kontekst nie. Cokolwiek te testy dzielą, wzięło się z twojego kodu albo z backendu.',
      },
      'playwright-isolation-002': {
        topic: 'Stan współdzielony w module',
        question: 'Drugi test zawodzi uruchomiony samodzielnie, a przechodzi w całym pliku. Co jest nie tak?',
        answers: {
          a: 'Linia 8 — szablony są niedozwolone w goto',
          b: 'Nic — testy zawsze idą po kolei',
          c: 'Linia 1 — zmienna modułowa sprzęga oba testy, więc drugi nie może działać sam ani na innym workerze',
          d: 'Linia 4 — createOrder trzeba awaitować dwa razy',
        },
        explanation:
          'Playwright może uruchomić je na różnych workerach, w innej kolejności albo jeden samotnie przy retry. Twórz to, czego test potrzebuje, w teście albo w fixture.',
      },
      'playwright-isolation-003': {
        topic: 'Zasięg fixture',
        question: 'Co zmienia `{ scope: "worker" }` w tym fixture?',
        answers: {
          a: 'Powstaje raz na proces workera i jest dzielony przez każdy test, który ten worker uruchomi',
          b: 'Powstaje raz na cały przebieg, ponad wszystkimi workerami',
          c: 'Powstaje na każdy test, ale jest sprzątany później',
          d: 'Wyłącza równoległość dla tego fixture',
        },
        explanation:
          'Zasięg workera jest dla drogiego setupu tylko do odczytu — tokenu, zaseedowanego tenanta. Wszystko, co test modyfikuje, należy do zasięgu testu, inaczej izolacja znów znika.',
      },
      'playwright-isolation-004': {
        topic: 'Retry a stan',
        question: 'Przy ponowieniu testu dostaje on zupełnie nowy kontekst przeglądarki.',
        explanation:
          'Retry uruchamia test od nowa, razem z fixture\'ami. Dlatego test przechodzący dopiero przy ponowieniu zwykle zależy od stanu zostawionego przez inny test.',
      },
      'playwright-isolation-005': {
        topic: 'Wykonanie szeregowe',
        question: 'Ten blok describe naprawdę wymaga kolejności na jednym workerze. Uzupełnij konfigurację.',
        answers: { a: 'serial', b: 'ordered', c: 'sequential', d: 'single' },
        explanation:
          'W trybie serial porażka pomija resztę bloku. To uzasadnione narzędzie przy prawdziwym wieloetapowym kreatorze — i częsty sposób na zamiatanie przypadkowego sprzężenia pod dywan.',
      },
      'playwright-isolation-006': {
        topic: 'storageState',
        question: 'Co zapisuje storageState?',
        answers: {
          a: 'Ciasteczka i localStorage dla odwiedzonych originów',
          b: 'Tylko ciasteczka',
          c: 'Ciasteczka, localStorage i sessionStorage',
          d: 'Cały profil przeglądarki razem z cache',
        },
        explanation:
          'sessionStorage celowo nie jest uwzględniony — z definicji dotyczy jednej karty. Aplikacje trzymające tam token muszą go wstrzykiwać skryptem inicjalizującym.',
      },
      'playwright-isolation-007': {
        topic: 'Własne fixture',
        question: 'Uzupełnij linię, która przekazuje wartość do testu i wznawia się potem, żeby posprzątać.',
        answers: { a: 'use', b: 'provide', c: 'yield', d: 'inject' },
        explanation:
          'Wszystko przed use() to setup, wszystko po nim to teardown, który wykonuje się nawet gdy test zawiedzie. To najczystsze miejsce na usunięcie danych utworzonych przez test.',
      },
      'playwright-isolation-008': {
        topic: 'Fixtures kontra beforeEach',
        question: 'Co daje fixture, czego nie daje hook beforeEach?',
        answers: {
          a: 'Jest otypowany, komponowalny i wykonuje się tylko dla testów, które o niego poproszą',
          b: 'Działa szybciej',
          c: 'Może być asynchroniczny',
          d: 'Wykonuje się po teście zamiast przed',
        },
        explanation:
          'beforeEach wykonuje się dla każdego testu w zasięgu, czy tego potrzebuje, czy nie, i komunikuje się przez zmienne współdzielone. Fixtures są leniwe, a ich wartości przychodzą jako otypowane argumenty.',
      },
      'playwright-isolation-009': {
        topic: 'fullyParallel',
        question: 'Playwright · konfiguracja',
        back: 'Testy w jednym pliku też idą równolegle, nie tylko między plikami',
        explanation:
          'Zamienia przypadkowe sprzężenie w pliku w natychmiastową porażkę zamiast w niespodziankę za pół roku. Warto włączyć wcześnie, póki suite jest mały.',
      },
      'playwright-isolation-010': {
        topic: 'Seedowanie przez API',
        question: 'Dlaczego druga wersja jest pewniejsza w teście o liście zamówień?',
        answers: {
          a: 'B — setup przestaje zależeć od formularza tworzenia, o którym ten test nie jest',
          b: 'B — wywołania API są zawsze szybsze niż przez UI',
          c: 'A — testowanie przez UI jest zawsze bardziej realistyczne',
          d: 'Są równoważne',
        },
        explanation:
          'Szybkość to bonus; chodzi o promień rażenia. Przy A zmiana formularza tworzenia wywala każdy test, któremu wystarczyło, żeby zamówienie istniało.',
      },
      'playwright-isolation-011': {
        topic: 'Równoległe workery a dane',
        question: 'Uruchomienie z czterema workerami jest bezpieczne, o ile każdy test tworzy własne dane.',
        explanation:
          'Nie, jeśli te dane kolidują — stały e-mail, jedno konto testowe, globalna flaga funkcyjna. Unikalne identyfikatory na test albo tenant na workera to jest to, co czyni to bezpiecznym.',
      },
      'playwright-isolation-012': {
        topic: 'Wyciek autoryzacji między projektami',
        question: 'Nagle każdy test w suite jest zalogowany jako admin. Która linia to wyjaśnia?',
        answers: {
          a: 'Linia 4 — projekt nie może nadpisać storageState',
          b: 'Linia 5 — projekt anonymous dziedziczy stan admina z poziomu głównego',
          c: 'Linia 2 — use na poziomie głównym jest ignorowane',
          d: 'Linia 3 — wszystkie projekty muszą definiować storageState',
        },
        explanation:
          'use projektu scala się na wierzchu tego z poziomu głównego, więc projekt, który nic nie mówi, dziedziczy. Daj projektowi anonymous storageState: { cookies: [], origins: [] }.',
      },
    },
  },

  'playwright-network-mocking': {
    title: 'Mockowanie sieci',
    description: 'route() i fulfill(), dopasowanie glob kontra regex, odtwarzanie HAR i kiedy mockowanie przestaje cokolwiek testować.',
    content: [
      {
        title: 'Przechwyć, potem zdecyduj',
        body: 'page.route() daje ci każde pasujące żądanie, zanim opuści przeglądarkę. Stamtąd możesz je spełnić własną odpowiedzią, przepuścić dalej (opcjonalnie ze zmianami) albo przerwać — tak testuje się stany błędu, których backend na żądanie nie wyprodukuje.',
      },
      {
        title: 'Deterministyczna awaria',
        body: 'Zarejestruj route przed nawigacją, która wywołuje żądanie, bo inaczej już poszło.',
      },
      {
        title: 'Uwaga',
        body: 'Zamockowana odpowiedź to kopia kontraktu, a kopie się rozjeżdżają. Mockuj przypadki brzegowe i ścieżki błędów; zostaw przynajmniej jeden test chodzący po prawdziwym API, żeby rozjazd wyszedł na jaw.',
      },
    ],
    exercises: {
      'playwright-network-001': {
        topic: 'Kolejność rejestracji route',
        question: 'Dlaczego ten test nadal uderza w prawdziwe API?',
        answers: {
          a: 'Żądanie poleciało w trakcie goto, zanim route został zarejestrowany',
          b: 'fulfill wymaga kodu statusu',
          c: 'Glob powinien zaczynać się od ukośnika',
          d: 'route() dotyczy tylko XHR, nie fetch',
        },
        explanation:
          'Route dotyczy żądań wykonanych po jego zainstalowaniu. Rejestruj przed nawigacją albo w fixture, który wykonuje się przed ciałem testu.',
      },
      'playwright-network-002': {
        topic: 'fulfill kontra continue kontra abort',
        question: 'Chcesz, żeby żądanie doszło do serwera, ale z dodatkowym nagłówkiem. Co jest właściwe?',
        explanation:
          'fulfill odpowiada za ciebie i nic nie dociera do serwera; abort je zabija. continue przepuszcza dalej, z opcjonalnymi nadpisaniami — rozprosz istniejące nagłówki, inaczej resztę zgubisz.',
      },
      'playwright-network-003': {
        topic: 'Dopasowanie glob',
        question: 'Glob "**/api/orders" pasuje też do "/api/orders?page=2".',
        explanation:
          'Playwright ignoruje query string przy dopasowaniu globa, który go nie zawiera. Dopasuj query jawnie albo użyj regexa, gdy różne parametry mają dawać różne odpowiedzi.',
      },
      'playwright-network-004': {
        topic: 'Odcinanie szumu third-party',
        question: 'Zablokuj analitykę, żeby nie spowalniała ani nie destabilizowała przebiegu. Uzupełnij handler.',
        answers: { a: 'abort', b: 'cancel', c: 'reject', d: 'drop' },
        explanation:
          'Blokowanie beaconów i fontów third-party to jedna z najtańszych wygranych stabilnościowych w suicie i usuwa całą klasę problemów z network idle.',
      },
      'playwright-network-005': {
        topic: 'Pierwszeństwo route',
        question: 'Dwa route pasują do tego samego URL-a. Który handler się wykona?',
        answers: {
          a: 'Ten zarejestrowany jako ostatni',
          b: 'Ten zarejestrowany jako pierwszy',
          c: 'Oba, w kolejności rejestracji',
          d: 'Bardziej szczegółowy wzorzec',
        },
        explanation:
          'Późniejsze route mają pierwszeństwo, co pozwala testowi nadpisać szeroki route zainstalowany przez fixture. route.fallback() oddaje sterowanie wcześniejszemu handlerowi.',
      },
      'playwright-network-006': {
        topic: 'Zamockowanie tego, co się testuje',
        question: 'To jest test przepływu checkoutu. Co poszło nie tak?',
        answers: {
          a: 'Linia 2 — fulfill nie przyjmuje opcji json',
          b: 'Linia 1 — zamockowanie każdego wywołania API sprawia, że test dowodzi renderowania fixture\'ów, a nie działania checkoutu',
          c: 'Linia 5 — kliknięcie wymaga force: true',
          d: 'Linia 6 — toBeVisible powinno być toHaveText',
        },
        explanation:
          'Wywołanie płatności to zachowanie będące przedmiotem testu. Mockuj otaczający szum, jeśli musisz, ale zostaw w spokoju endpoint, od którego test bierze nazwę.',
      },
      'playwright-network-007': {
        topic: 'Odtwarzanie HAR',
        question: 'Uzupełnij wywołanie odtwarzające nagraną sesję zamiast ręcznie pisanych fixture\'ów.',
        answers: { a: 'routeFromHAR', b: 'replayHAR', c: 'loadHAR', d: 'routeHAR' },
        explanation:
          'Z update: true nagrywa względem żywego API i nadpisuje plik; z false odtwarza. Odświeżenie mocków staje się jedną komendą zamiast ręcznej edycji JSON-a.',
      },
      'playwright-network-008': {
        topic: 'Asercja na żądaniu',
        question: 'Co weryfikuje ten kod?',
        answers: {
          a: 'Że pisanie wywołało GET na endpoint wyszukiwania z wpisaną frazą',
          b: 'Że wyszukiwanie zwróciło wyniki',
          c: 'Że żądanie zostało zamockowane',
          d: 'Że endpoint odpowiedział w limicie czasu',
        },
        explanation:
          'waitForRequest bada, co aplikacja wysłała — to właściwy poziom dla błędów debounce i budowania query; żadna asercja o odpowiedzi nie jest tu zaangażowana.',
      },
      'playwright-network-009': {
        topic: 'Routing na poziomie kontekstu',
        question: 'Playwright · sieć',
        back: 'Route kontekstu obejmują każdą stronę i popup w tym kontekście',
        explanation:
          'Wspólne blokowanie — analityka, fonty, widgety third-party — dawaj na kontekst w fixture, a nadpisania per test trzymaj na stronie.',
      },
      'playwright-network-010': {
        topic: 'Testowanie stanu ładowania',
        question: 'Jak pewnie zaasertować, że szkielet pokazuje się podczas ładowania danych?',
        answers: {
          a: 'Opóźnij handler route, zaasertuj szkielet, potem spełnij żądanie',
          b: 'Użyj waitForTimeout(50) zaraz po nawigacji',
          c: 'Zdławij całą przeglądarkę przez CDP',
          d: 'Nie da się tego testować deterministycznie',
        },
        explanation:
          'Przytrzymanie odpowiedzi w handlerze oddaje sterowanie czasem testowi: stan ładowania trwa dokładnie tyle, ile test potrzebuje.',
      },
      'playwright-network-011': {
        topic: 'Route a service worker',
        question: 'Handler route przechwytuje też żądania wykonywane przez service workera.',
        explanation:
          'Ruch service workera domyślnie omija route strony. Ustaw serviceWorkers: "block" w kontekście, gdy worker przechwytuje wywołania, które chciałeś zamockować.',
      },
      'playwright-network-012': {
        topic: 'unroute po asercji',
        question: 'Dlaczego ten fixture wywołuje unroute na końcu?',
        answers: {
          a: 'Żeby mock nie wyciekł do późniejszych nawigacji ani kroków sprzątania w tym samym kontekście',
          b: 'Bo route jest ograniczone do dziesięciu na stronę',
          c: 'Żeby zwolnić pamięć w przeglądarce',
          d: 'Jest wymagane przed zamknięciem strony',
        },
        explanation:
          'Konteksty są per test, więc wyciek jest ograniczony — ale teardown rozmawiający z aplikacją nadal widziałby mock, a jawne unroute dokumentuje intencję.',
      },
    },
  },

  'playwright-debugging': {
    title: 'Debugowanie flaky testów',
    description: 'Czytanie trace\'a, co naprawdę mówią retry i różnica między flaky testem a flaky aplikacją.',
    content: [
      {
        title: 'Trace to dowód',
        body: 'Trace nagrywa każdą akcję z migawką DOM-u przed i po, log sieci, konsolę i nagranie ekranu. Przy awarii widocznej tylko na CI to różnica między popołudniem prób odtworzenia a trzydziestoma sekundami, po których widzisz, że kliknięcie trafiło w baner cookie.',
      },
      {
        title: 'Nagrywaj tam, gdzie ma to znaczenie',
        body: 'on-first-retry to domyślna wartość warta zachowania: zero kosztu na zielonych przebiegach, pełny trace w chwili, gdy coś padnie.',
      },
      {
        title: 'Uwaga',
        body: 'Test przechodzący dopiero przy ponowieniu nie jest naprawiony. Retry kupuje zielony pipeline i ukrywa albo realny wyścig w produkcie, albo realne założenie w teście — liczba flaky w raporcie to ta, która się liczy.',
      },
    ],
    exercises: {
      'playwright-debug-001': {
        topic: 'Co zawiera trace',
        question: 'Czego NIE ma w trace Playwrighta?',
        answers: {
          a: 'Migawki DOM-u przed i po każdej akcji',
          b: 'Żądań sieciowych wykonanych przez stronę',
          c: 'Żywej, interaktywnej kopii aplikacji, którą można wyklikać',
          d: 'Komunikatów konsoli i miejsca w źródle testu',
        },
        explanation:
          'Migawki da się przeglądać devtoolsami, ale są zamrożone — nic się nie wykonuje ponownie. Dlatego właśnie są wiarygodnym dowodem tego, jak strona wyglądała w tamtej chwili.',
      },
      'playwright-debug-002': {
        topic: 'Otwieranie trace\'a',
        question: 'Uzupełnij komendę otwierającą trace pobrany z artefaktu CI.',
        answers: { a: 'show-trace', b: 'open-trace', c: 'trace', d: 'view' },
        explanation:
          'Działa całkowicie lokalnie — bez serwera i bez ponownego uruchamiania testu. trace.playwright.dev robi to samo w karcie przeglądarki, jeśli wolisz nie pobierać CLI.',
      },
      'playwright-debug-003': {
        topic: 'Klasyfikacja flaky',
        question: 'Test zaraportowany jako "flaky" zawiódł przynajmniej raz, a potem przeszedł przy ponowieniu.',
        explanation: 'Reporter rozdziela flaky od failed właśnie dlatego. Traktuj kolumnę flaky jak backlog, nie jak szum.',
      },
      'playwright-debug-004': {
        topic: 'Zapomniany kod debugowy',
        question: 'Która linia sprawi, że ten test zawiesi się na CI na zawsze?',
        answers: {
          a: 'Linia 1 — goto potrzebuje waitUntil',
          b: 'Linia 3 — toHaveCount nie istnieje',
          c: 'Linia 2 — page.pause() czeka na człowieka w Inspectorze',
          d: 'Nic — pause jest pustą operacją w trybie headless',
        },
        explanation: 'To narzędzie do debugowania, a nie czekanie. Wyłapuj je lintem, bo w końcu kosztuje kogoś cały timeout pipeline\'u.',
      },
      'playwright-debug-005': {
        topic: 'Odtwarzanie awarii z CI',
        question: 'Test zawodzi tylko na CI, nigdy lokalnie. Którą różnicę warto sprawdzić najpierw?',
        answers: {
          a: 'Rozmiar viewportu, strefę czasową, locale i szybkość maszyny — domyślne wartości CI różnią się od twoich',
          b: 'Wersję Playwrighta, która i tak jest przypięta',
          c: 'System operacyjny, który nigdy nie wpływa na DOM',
          d: 'Nic — awarie tylko na CI to zawsze infrastruktura',
        },
        explanation:
          'Węższy viewport chowa menu pod hamburgerem; inna strefa czasowa przesuwa etykietę daty. Przypnij viewport, locale i timezoneId w konfiguracji, żeby oba środowiska się zgadzały.',
      },
      'playwright-debug-006': {
        topic: 'Krokowanie testu',
        question: 'Uzupełnij zmienną środowiskową otwierającą Inspectora i krokującą przebieg.',
        answers: { a: 'PWDEBUG', b: 'DEBUG', c: 'PLAYWRIGHT_DEBUG', d: 'PW_INSPECT' },
        explanation:
          'PWDEBUG=1 otwiera Inspectora, wyłącza limity czasu i uruchamia headed. Druga warta znajomości to DEBUG=pw:api — loguje każde wywołanie API do terminala.',
      },
      'playwright-debug-007': {
        topic: 'Grupowanie kroków w raporcie',
        question: 'Co dodaje test.step?',
        answers: {
          a: 'Nazwaną, zwijaną grupę w raporcie i trace, z własnym czasem trwania',
          b: 'Granicę retry — ponawiany jest tylko krok',
          c: 'Osobny kontekst przeglądarki dla tych akcji',
          d: 'Nic w czasie wykonania; to tylko komentarz',
        },
        explanation: 'Kroki czynią długi trace czytelnym i mówią, która faza zwolniła. Nie zmieniają wykonania ani semantyki ponawiania.',
      },
      'playwright-debug-008': {
        topic: 'Flaky test czy flaky aplikacja',
        question: 'Test sporadycznie klika przycisk chwilę przed podpięciem handlera. Jaka jest uczciwa diagnoza?',
        answers: {
          a: 'Realny problem produktu — kontrolka wygląda na interaktywną, zanim nią jest',
          b: 'Problem testu; dodaj krótki waitForTimeout',
          c: 'Problem Playwrighta z actionability',
          d: 'Problem CI; zwiększ liczbę workerów',
        },
        explanation:
          'Playwright odtworzył wyścig, w który mógłby trafić też szybki użytkownik. Naprawa należy do aplikacji — wyłącz przycisk, dopóki nie jest podpięty — a test wtedy to dokumentuje.',
      },
      'playwright-debug-009': {
        topic: 'Powtarzanie testu',
        question: 'Playwright · CLI',
        back: 'Uruchamia ten sam test dwadzieścia razy równolegle — najszybszy sposób potwierdzenia flaka',
        explanation:
          'Połącz z --grep, żeby zawęzić do jednego testu. Jeśli dwadzieścia przebiegów jest zielonych, flak jest raczej środowiskowy niż w teście.',
      },
      'playwright-debug-010': {
        topic: 'Koszt trace\'a',
        question: 'trace: "on" to dobra wartość domyślna dla dużego suite\'u na CI.',
        explanation:
          'Nagrywa każdy test, co spowalnia przebieg i produkuje artefakty liczone w gigabajtach. on-first-retry daje trace dokładnie dla tych przebiegów, na które chcesz popatrzeć.',
      },
      'playwright-debug-011': {
        topic: 'Retry ukrywające zależność',
        question: 'Ten suite jest zielony przy retries: 2 i czerwony przy retries: 0. Co ci to mówi?',
        answers: {
          a: 'Limit czasu przy ponowieniu jest za krótki',
          b: 'Nic — po to właśnie są retry',
          c: 'Test zależy od danych tworzonych przez inny test i przechodzi dopiero, gdy tamten się wykona',
          d: 'toBeVisible potrzebuje dłuższego limitu',
        },
        explanation:
          'Retry uruchamia test później, a wtedy tamten test wyprodukował już fakturę. Suite jest zależny od kolejności; retry tylko to przykrywa.',
      },
      'playwright-debug-012': {
        topic: 'Załączanie dowodów',
        question: 'Co robi ten kod?',
        answers: {
          a: 'Dodaje payload do raportu HTML i trace\'a dla tego testu',
          b: 'Wysyła go do zdalnego endpointu reportera',
          c: 'Wypisuje go na konsolę przy porażce',
          d: 'Zapisuje go do porównania przy następnym przebiegu',
        },
        explanation:
          'Załączniki to najtańszy sposób, żeby awaria na CI dała się zdiagnozować: dokładna odpowiedź, id albo seed, którego użył przebieg, leżą obok trace\'a.',
      },
    },
  },
};

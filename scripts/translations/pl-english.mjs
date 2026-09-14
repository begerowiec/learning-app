/**
 * Polish translations — English lessons.
 *
 * Only the scaffolding is translated: lesson titles, theory, instructions,
 * topics and explanations. The English sentences and answer options are the
 * material being studied and stay in English — which is exactly what the
 * "field omitted ⇒ keep the original" rule in build-translations.mjs is for.
 */
export const english = {
  'english-present-simple': {
    title: 'Present Simple',
    description: 'Nawyki, fakty i rozkłady jazdy — plus końcówka -s w trzeciej osobie, o której wszyscy zapominają.',
    content: [
      {
        title: 'Kiedy go używać',
        body: 'Present Simple opisuje nawyki, prawdy ogólne i zdarzenia z rozkładu: I work in Wrocław. Water boils at 100 degrees. The train leaves at seven.',
      },
      {
        title: 'Forma',
        body: 'Czasownik w formie podstawowej, poza trzecią osobą liczby pojedynczej, która bierze -s: I work / she works. Pytania i przeczenia tworzy się przez do albo does, a czasownik główny wraca do formy podstawowej: Does she work? She does not work.',
      },
      {
        title: 'Uwaga',
        body: 'Nigdy nie podwajaj wykładnika. "Does she works?" jest błędne — does już niesie osobę, więc czasownik zostaje jako work.',
      },
    ],
    exercises: {
      'english-ps-001': {
        topic: 'Końcówka -s w trzeciej osobie',
        question: 'Uzupełnij zdanie.',
        explanation:
          'Trzecia osoba liczby pojedynczej bierze -s w Present Simple. Stała praca to nawyk, a nie coś, co dzieje się właśnie teraz.',
      },
      'english-ps-002': {
        topic: 'Forma pytająca',
        question: 'Które pytanie jest poprawne?',
        explanation: 'Does niesie wykładnik trzeciej osoby, więc czasownik główny wraca do formy podstawowej: work.',
      },
      'english-ps-003': {
        topic: 'Rozkłady jazdy',
        question: 'Present Simple może opisywać przyszłe zdarzenie z rozkładu, jak w "The train leaves at six".',
        explanation: 'Zdarzenia z rozkładu biorą Present Simple nawet wtedy, gdy są w przyszłości — rozkłady jazdy, programy, plany podróży.',
      },
      'english-ps-004': {
        topic: 'Nawyki',
        question: 'Przetłumacz zdanie.',
        explanation: 'Codziennie sygnalizuje nawyk, więc angielski używa Present Simple, a nie formy ciągłej.',
      },
      'english-ps-005': {
        topic: 'Przeczenia',
        question: 'Uzupełnij zdanie przeczące.',
        explanation: 'Przeczenia w trzeciej osobie liczby pojedynczej tworzy się przez doesn\'t plus czasownik w formie podstawowej.',
      },
      'english-ps-006': {
        topic: 'Przysłówki częstotliwości',
        question: 'Gdzie zwykle stoi przysłówek częstotliwości taki jak "usually"?',
        answers: {
          a: 'Przed czasownikiem głównym, ale po czasowniku to be',
          b: 'Zawsze na końcu zdania',
          c: 'Zawsze na samym początku',
          d: 'Bezpośrednio po czasowniku głównym',
        },
        explanation:
          'I usually start at nine. She is usually late. Przy to be reguła się odwraca i to jest ta część, którą większość uczących się pomija.',
      },
      'english-ps-007': {
        topic: 'Pisownia końcówki -s',
        question: 'Jaka jest forma trzeciej osoby liczby pojedynczej od "study"?',
        explanation: 'Spółgłoska + y daje -ies. Samogłoska + y bierze samo -s: plays, buys.',
      },
      'english-ps-008': {
        topic: 'Czasowniki statyczne',
        question: 'Słownictwo',
        explanation:
          '"I am knowing the answer" jest błędne. Czasowniki statyczne opisują stan, a nie czynność w toku.',
      },
      'english-ps-009': {
        topic: 'Fakty',
        question: 'Uzupełnij zdanie.',
        explanation: 'Prawdy ogólne biorą Present Simple, niezależnie od tego, co dzieje się w chwili mówienia.',
      },
      'english-ps-010': {
        topic: 'Do kontra does',
        question: 'Które pytanie jest poprawne?',
        explanation: 'Podmiot w trzeciej osobie liczby pojedynczej bierze does, a czasownik główny zostaje w formie podstawowej.',
      },
      'english-ps-011': {
        topic: 'Rutyna',
        question: 'Przetłumacz zdanie.',
        explanation: 'Rutyna bierze Present Simple, trzecia osoba bierze -s, a usually stoi przed czasownikiem głównym.',
      },
      'english-ps-012': {
        topic: 'Have kontra has',
        question: 'Uzupełnij zdanie.',
        explanation:
          'Team traktuje się jako liczbę pojedynczą w angielszczyźnie amerykańskiej i zwykle także w brytyjskim języku biznesu, więc has jest bezpiecznym wyborem.',
      },
      'english-ps-013': {
        topic: 'Okres zerowy',
        question: 'Obie połowy zdania "If you push this button, the test runs" są w Present Simple.',
        explanation:
          'Zero conditional opisuje coś zawsze prawdziwego i używa Present Simple w obu zdaniach składowych — to standardowy kształt w dokumentacji.',
      },
      'english-ps-014': {
        topic: 'Czasowniki statyczne w pracy',
        question: 'Dlaczego "I am thinking it is a good idea" jest błędne?',
        answers: {
          a: 'Think w znaczeniu "mieć opinię" jest statyczne, więc bierze formę prostą',
          b: 'Think nigdy nie może być użyte w formie ciągłej',
          c: 'Zdanie potrzebuje przecinka',
          d: 'Idea nie może stać po it is',
        },
        explanation: '"I\'m thinking about it" jest w porządku — to znaczenie czynnościowe. Znaczenie opinii to stan: I think it\'s a good idea.',
      },
      'english-ps-015': {
        topic: 'Pisownia trzeciej osoby',
        question: 'Słownictwo',
        back: 'goes · does · watches · fixes — -es po o, ch, sh, s, x, z',
        explanation: 'Reszta bierze samo -s. To najczęstsza wpadka pisemna na poziomie B2.',
      },
    },
  },

  'english-present-continuous': {
    title: 'Present Continuous',
    description: 'Czynności w toku, sytuacje tymczasowe i czasowniki, które nie przyjmują formy -ing.',
    content: [
      {
        title: 'Kiedy go używać',
        body: 'Present Continuous obejmuje to, co dzieje się teraz, co jest tymczasowe i jakie ustalenia są już umówione na bliską przyszłość: I\'m working from home this week. We\'re meeting the client on Thursday.',
      },
      {
        title: 'Forma',
        body: 'am / is / are + czasownik z -ing. Czasownik posiłkowy zgadza się z podmiotem i niesie przeczenie oraz pytanie: Is she working? She isn\'t working.',
      },
      {
        title: 'Uwaga',
        body: 'Czasowniki statyczne (know, understand, own, prefer) zwykle nie mają formy ciągłej. "I\'m loving it" to celowy zabieg marketingowy, a nie wzorcowe zdanie.',
      },
    ],
    exercises: {
      'english-pc-001': {
        topic: 'Czynność teraz',
        question: 'Uzupełnij zdanie.',
        explanation: 'Czynność trwa w chwili mówienia, co jest podstawowym zastosowaniem Present Continuous.',
      },
      'english-pc-002': {
        topic: 'Simple kontra continuous',
        question: 'Które zdanie jest poprawne?',
        explanation:
          'Nawyk bierze Present Simple, a tymczasowa zmiana Present Continuous. Ten kontrast jest dokładnie tym, po co te dwa czasy istnieją.',
      },
      'english-pc-003': {
        topic: 'Czasowniki statyczne',
        question: '"I am knowing the answer" to poprawna angielszczyzna.',
        explanation: 'Know jest czasownikiem statycznym i bierze formę prostą: I know the answer.',
      },
      'english-pc-004': {
        topic: 'Sytuacje tymczasowe',
        question: 'Przetłumacz zdanie.',
        explanation: '"W tym tygodniu" sygnalizuje tymczasowe ustalenie, więc angielski woli formę ciągłą.',
      },
      'english-pc-005': {
        topic: 'Pisownia końcówki -ing',
        question: 'Uzupełnij zdanie.',
        explanation: 'Spółgłoskę podwaja się tylko wtedy, gdy ostatnia sylaba jest akcentowana: run → running, ale open → opening.',
      },
      'english-pc-006': {
        topic: 'Ustalenia na przyszłość',
        question: 'Dlaczego "We\'re meeting the client on Thursday" jest dopuszczalne dla zdarzenia przyszłego?',
        answers: {
          a: 'Present Continuous wyraża ustalenia, które są już umówione',
          b: 'Bo czwartek jest blisko teraźniejszości',
          c: 'Bo meet nie ma formy przyszłej',
          d: 'Nie jest dopuszczalne — potrzeba will',
        },
        explanation:
          'Konkretne ustalenie, zwykle z drugą osobą i godziną, bierze formę ciągłą. Przewidywania i propozycje biorą will.',
      },
      'english-pc-007': {
        topic: 'Przeczenie',
        question: 'Które przeczenie jest poprawne?',
        explanation: 'W czasach ciągłych przeczenie niesie czasownik to be; do i does należą do form prostych.',
      },
      'english-pc-008': {
        topic: 'always + forma ciągła',
        question: 'Słownictwo',
        explanation: 'Forma prosta byłaby neutralna. Z formą ciągłą mówiący się skarży.',
      },
      'english-pc-009': {
        topic: 'Sytuacje zmienne',
        question: 'Uzupełnij zdanie.',
        explanation: 'Trendy i zmieniające się sytuacje biorą formę ciągłą: prices are rising, the climate is warming.',
      },
      'english-pc-010': {
        topic: 'Pytania',
        question: 'Uzupełnij pytanie.',
        explanation: 'Pytania w formie ciągłej tworzy się czasownikiem to be, który wychodzi przed podmiot.',
      },
      'english-pc-011': {
        topic: 'Ustalenia na bliską przyszłość',
        question: 'Które zdanie opisuje ustalony plan, a nie przewidywanie?',
        explanation:
          'Present Continuous z określeniem czasu sygnalizuje coś już umówionego z kimś innym. will służy decyzjom podejmowanym w chwili mówienia.',
      },
      'english-pc-012': {
        topic: 'Właśnie teraz',
        question: 'Przetłumacz zdanie.',
        explanation: 'Czynność w toku w chwili mówienia to podstawowe zastosowanie Present Continuous.',
      },
      'english-pc-013': {
        topic: 'Pisownia z końcowym e',
        question: 'Forma -ing od "make" to "makeing".',
        explanation: 'Nieme końcowe e wypada: make → making, write → writing. Zostaje w see → seeing i agree → agreeing.',
      },
      'english-pc-014': {
        topic: 'Dwa znaczenia jednego czasownika',
        question: '"I\'m seeing the doctor at four" jest poprawne, a "I\'m seeing what you mean" nie. Dlaczego?',
        answers: {
          a: 'Pierwsze to ustalenie (czynność), drugie to percepcja, czyli stan',
          b: 'See nigdy nie przyjmuje określenia czasu',
          c: 'Drugie wymaga czasu przeszłego',
          d: 'Oba są w rzeczywistości poprawne',
        },
        explanation:
          'Kilka czasowników ma znaczenie czynnościowe i stanowe, a formę ciągłą bierze tylko to czynnościowe. I see what you mean.',
      },
      'english-pc-015': {
        topic: 'Podwajanie spółgłoski',
        question: 'Słownictwo',
        back: 'running · sitting · beginning · preferring — podwojona, gdy ostatnia sylaba jest akcentowana',
        explanation: 'Porównaj open → opening i offer → offering, gdzie akcent pada na pierwszą sylabę.',
      },
    },
  },

  'english-present-perfect': {
    title: 'Present Perfect',
    description: 'Czynności przeszłe z obecnym skutkiem, doświadczenie i określenia czasu, które decydują o wyborze czasu.',
    content: [
      {
        title: 'Kiedy go używać',
        body: 'Używaj Present Perfect, gdy czynność wydarzyła się w przeszłości, ale jest związana z teraźniejszością — przez skutek, doświadczenie albo to, że wciąż trwa.',
      },
      {
        title: 'Forma',
        body: 'have / has + imiesłów bierny. "I have lived here since 2020." "She has just finished work."',
      },
      {
        title: 'Uwaga',
        body: 'Present Perfect nigdy nie łączy się z zamkniętym określeniem czasu w rodzaju yesterday czy in 2019. Te należą do Past Simple.',
      },
    ],
    exercises: {
      'english-pp-001': {
        topic: 'Present Perfect z since',
        question: 'Uzupełnij zdanie.',
        explanation: 'since 2020 wyznacza czynność, która zaczęła się w przeszłości i trwa nadal, więc Present Perfect jest konieczny.',
      },
      'english-pp-002': {
        topic: 'Present Perfect kontra Past Simple',
        question: 'Które zdanie jest poprawne?',
        explanation: 'just łączy się z Present Perfect. yesterday to czas zamknięty, więc bierze Past Simple.',
      },
      'english-pp-003': {
        topic: 'ever + Present Perfect',
        question: 'Przetłumacz zdanie.',
        explanation: 'ever + Present Perfect pyta o doświadczenie w dowolnym momencie życia.',
      },
      'english-pp-004': {
        topic: 'Zamknięte określenia czasu',
        question: 'Present Perfect może być użyty z "yesterday".',
        explanation: 'yesterday to zamknięty czas przeszły, który wymaga Past Simple: I saw her yesterday.',
      },
      'english-pp-005': {
        topic: 'Pytania w Present Perfect',
        question: 'Uzupełnij pytanie.',
        explanation: 'yet łączy się z pytaniami w Present Perfect, tworzonymi przez have / has + imiesłów bierny.',
      },
      'english-pp-006': {
        topic: 'since kontra for',
        question: 'Jaka jest różnica między since a for?',
        answers: {
          a: 'since wprowadza punkt początkowy, for wprowadza długość trwania',
          b: 'Są wymienne',
          c: 'since dotyczy przyszłości, for przeszłości',
          d: 'for używa się tylko w pytaniach',
        },
        explanation: 'since 2020, since Monday, since I moved — punkt w czasie. for two years, for ten minutes — odcinek czasu.',
      },
      'english-pp-007': {
        topic: 'been kontra gone',
        question: 'Które zdanie znaczy, że wciąż jest poza domem?',
        explanation: 'has gone znaczy, że wyjechała i nie wróciła. has been znaczy, że kiedyś była i już wróciła.',
      },
      'english-pp-008': {
        topic: 'Nieregularne imiesłowy',
        question: 'Słownictwo',
        back: 'Present Perfect bierze trzecią formę: I have written',
        explanation: 'Imiesłów bierny, nie past simple. "I have wrote" to najczęstszy błąd w tym czasie.',
      },
      'english-pp-009': {
        topic: 'Obecny skutek',
        question: 'Uzupełnij zdanie.',
        explanation: 'Czynność przeszła jest istotna przez swój obecny skutek — kluczy nadal nie ma — więc pasuje Present Perfect.',
      },
      'english-pp-010': {
        topic: 'Present Perfect Continuous',
        question: 'Które zdanie podkreśla, jak długo trwa czynność?',
        explanation: 'Forma ciągła podkreśla trwanie i samą czynność; forma prosta podkreśla ukończony rezultat.',
      },
      'english-pp-011': {
        topic: 'already kontra yet',
        question: 'Uzupełnij zdanie.',
        explanation: 'already łączy się ze zdaniami twierdzącymi, yet z pytaniami i przeczeniami: we haven\'t deployed it yet.',
      },
      'english-pp-012': {
        topic: 'Doświadczenie',
        question: 'Przetłumacz zdanie.',
        explanation: 'Doświadczenie życiowe do teraz bierze Present Perfect, a never samo niesie przeczenie.',
      },
      'english-pp-013': {
        topic: 'Użycie amerykańskie',
        question: 'W amerykańskiej angielszczyźnie Past Simple bywa używany tam, gdzie brytyjska woli Present Perfect, jak w "Did you eat yet?".',
        explanation:
          'W praktyce obie formy są akceptowane. W pisanym angielskim biznesowym forma Present Perfect jest bezpieczniejsza przy just, already i yet.',
      },
      'english-pp-014': {
        topic: 'Okres nieukończony',
        question: 'Dlaczego "I have had three meetings today" używa Present Perfect?',
        answers: {
          a: 'Dzisiaj jeszcze się nie skończyło, więc okres wciąż obejmuje teraźniejszość',
          b: 'Spotkania zawsze biorą Present Perfect',
          c: 'Bo w zdaniu jest liczba',
          d: 'Powinien być Past Simple',
        },
        explanation:
          'Okresy nieukończone — today, this week, this year — biorą Present Perfect. Gdy dzień się skończy, staje się to "I had three meetings yesterday".',
      },
      'english-pp-015': {
        topic: 'Trzy formy nieregularne',
        question: 'Słownictwo',
        back: 'Present Perfect zawsze bierze trzecią formę: I have gone',
        explanation: 'Porównaj been: I have been to Berlin (i wróciłem) kontra I have gone to Berlin (wciąż tam jestem).',
      },
    },
  },

  'english-connectors': {
    title: 'Konektory',
    description: 'although, despite, however, therefore — łączenie myśli bez gubienia gramatyki.',
    content: [
      {
        title: 'Po co one są',
        body: 'Konektory sygnalizują relację między dwiema myślami: kontrast, przyczynę, skutek, dodanie. Wybór właściwego to połowa roboty; druga połowa to wiedzieć, co gramatycznie musi po nim nastąpić.',
      },
      {
        title: 'Wzorzec, na którym wszyscy się potykają',
        body: 'although + zdanie (podmiot + orzeczenie). despite / in spite of + rzeczownik albo forma -ing. However otwiera nowe zdanie i bierze przecinek. Opanuj te trzy, a twoje pisanie od razu brzmi jak C1.',
      },
      {
        title: 'Dobra praktyka',
        body: '"Despite of" nie istnieje. Jest albo despite, albo in spite of — nigdy hybryda.',
      },
    ],
    exercises: {
      'english-conn-001': {
        topic: 'although',
        question: 'Słownictwo',
        explanation: 'Konektor wprowadzający kontrast: Although it was late, she kept studying.',
      },
      'english-conn-002': {
        topic: 'despite + rzeczownik',
        question: 'Uzupełnij zdanie.',
        explanation:
          'To, co następuje, jest frazą rzeczownikową, więc poprawne jest despite. Although wymagałoby pełnego zdania: Although it was delayed, ...',
      },
      'english-conn-003': {
        topic: 'however',
        question: 'Które zdanie używa however poprawnie?',
        explanation: 'However jest przysłówkiem, nie spójnikiem: otwiera nowe zdanie (albo stoi po średniku) i bierze przecinek.',
      },
      'english-conn-004': {
        topic: 'therefore',
        question: 'Przetłumacz zdanie.',
        explanation: 'therefore sygnalizuje skutek, więc po polsku używamy dlatego / w związku z tym.',
      },
      'english-conn-005': {
        topic: 'despite of',
        question: '"Despite of the rain, we went out" jest poprawne.',
        explanation: 'Poprawnie jest despite the rain albo in spite of the rain. "Despite of" miesza obie formy.',
      },
      'english-conn-006': {
        topic: 'although kontra despite',
        question: 'Co musi nastąpić po "although"?',
        answers: {
          a: 'Zdanie z własnym podmiotem i orzeczeniem',
          b: 'Fraza rzeczownikowa',
          c: 'Forma z -ing',
          d: 'Nic — może kończyć zdanie',
        },
        explanation: 'Although jest spójnikiem i łączy dwa zdania. despite i in spite of są przyimkami i biorą rzeczownik albo -ing.',
      },
      'english-conn-007': {
        topic: 'in order to',
        question: 'Uzupełnij zdanie wyrażające cel.',
        explanation: 'in order to + bezokolicznik wyraża cel. so that wymagałoby pełnego zdania: so that the suite is less flaky.',
      },
      'english-conn-008': {
        topic: 'whereas',
        question: 'Co sygnalizuje whereas?',
        explanation:
          'Unit tests are fast, whereas end-to-end tests are slow. Zestawia dwie rzeczy, nie sugerując, że któraś jest zaskakująca.',
      },
      'english-conn-009': {
        topic: 'nevertheless',
        question: 'Słownictwo',
        explanation: 'Ta sama robota co however, jeden rejestr wyżej. Częste w pisanych raportach, rzadkie w mowie.',
      },
      'english-conn-010': {
        topic: 'due to kontra because',
        question: 'Uzupełnij zdanie.',
        explanation: 'due to i because of biorą frazę rzeczownikową; because bierze pełne zdanie: because an integration test failed.',
      },
      'english-conn-011': {
        topic: 'in addition',
        question: 'Które zdanie poprawnie dodaje informację?',
        explanation: 'in addition to + rzeczownik. Samodzielnie "In addition," otwiera zdanie z przecinkiem.',
      },
      'english-conn-012': {
        topic: 'as a result',
        question: 'Przetłumacz zdanie.',
        explanation: 'Utartą frazą jest "as a result", z rodzajnikiem, a po niej przecinek, gdy otwiera zdanie.',
      },
      'english-conn-013': {
        topic: 'Zaczynanie od and',
        question: 'Rozpoczynanie zdania od "And" albo "But" to błąd gramatyczny.',
        explanation:
          'To preferencja stylistyczna, nie reguła, i występuje w dobrym pisaniu. W formalnym raporcie However albo In addition po prostu czyta się lepiej.',
      },
      'english-conn-014': {
        topic: 'Moreover kontra also',
        question: 'Co odróżnia moreover od also?',
        answers: {
          a: 'Rejestr — moreover jest formalne i dokłada mocniejszy argument; also jest neutralne i stoi w środku zdania',
          b: 'Moreover można użyć tylko w pytaniach',
          c: 'Also nie może zaczynać zdania',
          d: 'Są wymienne w każdym kontekście',
        },
        explanation: 'Moreover sygnalizuje, że to, co następuje, wzmacnia argument. Nadużywane w mowie brzmi sztucznie.',
      },
      'english-conn-015': {
        topic: 'regardless of',
        question: 'Słownictwo',
        explanation: 'Regardless of the result, we ship on Friday. "Irregardless" nie jest słowem w standardowej angielszczyźnie.',
      },
    },
  },

  'english-work-office': {
    title: 'Praca i biuro',
    description: 'Język spotkań, terminów i statusów — słownictwo zwykłego dnia pracy.',
    content: [
      {
        title: 'Po co ten zestaw',
        body: 'Większość zawodowego angielskiego to małe, powtarzalne słownictwo: umawianie, raportowanie statusu, sygnalizowanie ryzyka, proszenie o czas. Znać czterdzieści fraz dobrze jest więcej warte niż czterysta mgliście.',
      },
      {
        title: 'Kolokacje, nie pojedyncze słowa',
        body: 'Ucz się całych fraz: meet a deadline, raise a concern, follow up on an email, take minutes, be on annual leave. Czasownik jest tą częścią, której nie da się zgadnąć.',
      },
      {
        title: 'Dobra praktyka',
        body: '"I will revert to you" jest częste w niektórych regionach, ale większości native speakerów brzmi dziwnie — "I\'ll get back to you" to bezpieczny wybór.',
      },
    ],
    exercises: {
      'english-work-001': {
        topic: 'Kolokacja z deadline',
        question: 'Uzupełnij zdanie.',
        explanation: 'Kolokacją jest meet a deadline. Można też miss albo extend, ale nigdy reach ani catch.',
      },
      'english-work-002': {
        topic: 'Umawianie terminów',
        question: 'Która fraza proponuje przesunięcie spotkania na później?',
        explanation: 'push back znaczy opóźnić; push up (albo bring forward) znaczy przyspieszyć.',
      },
      'english-work-003': {
        topic: 'Status prac',
        question: 'Przetłumacz zdanie.',
        explanation: 'in progress, a przy terminie by Thursday. until Thursday znaczyłoby, że praca trwa aż do tego momentu.',
      },
      'english-work-004': {
        topic: 'to follow up',
        question: 'Słownictwo',
        explanation: 'I\'ll follow up on that email tomorrow. Przyimek on nie jest opcjonalny.',
      },
      'english-work-005': {
        topic: 'Urlop',
        question: '"I\'m on annual leave next week" znaczy, że jesteś na urlopie.',
        explanation: 'annual leave to formalny brytyjski termin na płatny urlop; PTO to częsty odpowiednik amerykański.',
      },
      'english-work-006': {
        topic: 'Zgłaszanie problemu',
        question: 'Uzupełnij zdanie.',
        explanation: 'raise a concern / raise an issue / raise a ticket. To standardowy czasownik do położenia sprawy na stole.',
      },
      'english-work-007': {
        topic: 'Łagodzenie po angielsku',
        question: 'Dlaczego native speakerzy piszą "Could you possibly send it today?" zamiast "Send it today"?',
        answers: {
          a: 'Formy pośrednie sygnalizują uprzejmość; goły tryb rozkazujący brzmi jak polecenie',
          b: 'Tryb rozkazujący jest gramatycznie niepoprawny w mailu',
          c: 'Dłuższa forma jest precyzyjniejsza co do terminu',
          d: 'Nie ma różnicy w tonie',
        },
        explanation:
          'Angielski niesie uprzejmość przez pośredniość i czasowniki modalne. Polski często niesie ją przez samo "proszę", dlatego dosłowne tłumaczenia bywają szorstkie.',
      },
      'english-work-008': {
        topic: 'Słownictwo spotkań',
        question: 'Czym są "minutes" w kontekście spotkania?',
        explanation: 'Minutes się spisuje w trakcie spotkania i rozsyła po nim. Agenda to plan tego, co ma zostać omówione.',
      },
      'english-work-009': {
        topic: 'to be swamped',
        question: 'Słownictwo',
        explanation: 'Nieformalne, ale bardzo częste. "I\'m at capacity" to rejestr neutralny, "I have a lot on" to brytyjskie niedopowiedzenie.',
      },
      'english-work-010': {
        topic: 'Uprzejme przypominanie',
        question: 'Uzupełnij zdanie.',
        explanation: '"A gentle reminder" to standardowe uprzejme przypomnienie. Remind jest czasownikiem: may I remind you.',
      },
      'english-work-011': {
        topic: 'Odmawianie udziału',
        question: 'Która odpowiedź odmawia najbardziej profesjonalnie?',
        explanation:
          'Powód plus alternatywa to oczekiwany kształt. Samo przeczenie brzmi w angielskim szorstko, nawet gdy po polsku jest zupełnie uprzejme.',
      },
      'english-work-012': {
        topic: 'Zablokowana praca',
        question: 'Przetłumacz zdanie.',
        explanation:
          '"I\'m blocked" to standardowa fraza ze stand-upu, a waiting bierze for. "Waiting on" jest amerykańskie i częstsze o ludziach niż o rzeczach.',
      },
      'english-work-013': {
        topic: 'Please find attached',
        question: '"Please find attached the report" jest dopuszczalne, ale przestarzałe; "I\'ve attached the report" brzmi dziś naturalniej.',
        explanation: 'Obie formy są zrozumiałe. Współczesny angielski biznesowy woli bezpośrednią stronę czynną.',
      },
      'english-work-014': {
        topic: 'Action items',
        question: 'Co w notatkach ze spotkania znaczy "AI: Anna to confirm scope by Friday"?',
        answers: {
          a: 'Action item — zadanie z właścicielem i terminem',
          b: 'Dodatkowa informacja',
          c: 'Notatkę wygenerowała sztuczna inteligencja',
          d: 'Jak wskazano powyżej',
        },
        explanation: 'Minutes zwykle łączą AI (action item) z właścicielem i datą. TBC znaczy to be confirmed; TBD — to be decided.',
      },
      'english-work-015': {
        topic: 'to loop someone in',
        question: 'Słownictwo',
        explanation: 'I\'ll loop in the platform team. Odwrotność to take someone off the thread.',
      },
    },
  },

  'english-phrasal-verbs': {
    title: 'Phrasal verbs',
    description: 'Te najczęstsze — sort out, carry on, come up with — i to, gdzie stoi dopełnienie.',
    content: [
      {
        title: 'Dlaczego są trudne',
        body: 'Znaczenie phrasal verb rzadko wynika z jego części: give up nie ma nic wspólnego z dawaniem. Trzeba się ich uczyć jako pojedynczych jednostek słownikowych, w zdaniu.',
      },
      {
        title: 'Rozdzielne czy nie',
        body: 'Wiele z nich przyjmuje dopełnienie albo po partykule, albo między częściami: turn off the light / turn the light off. Dopełnienie zaimkowe musi stać w środku: turn it off, nigdy turn off it.',
      },
      {
        title: 'Dobra praktyka',
        body: 'W formalnym piśmie jednowyrazowy odpowiednik często czyta się lepiej: resolve zamiast sort out, postpone zamiast put off. W mowie phrasal verb jest naturalnym wyborem.',
      },
    ],
    exercises: {
      'english-phrasal-001': {
        topic: 'to come up with',
        question: 'Słownictwo',
        explanation: 'She came up with a workaround. Trzy części i żadnej nie da się pominąć.',
      },
      'english-phrasal-002': {
        topic: 'to sort out',
        question: 'Uzupełnij zdanie.',
        explanation: 'sort something out znaczy naprawić albo rozwiązać. Jest rozdzielne: sort it out, sort out the test.',
      },
      'english-phrasal-003': {
        topic: 'Pozycja zaimka',
        question: 'Które zdanie jest poprawne?',
        explanation: 'Przy rozdzielnym phrasal verb dopełnienie zaimkowe zawsze stoi między czasownikiem a partykułą.',
      },
      'english-phrasal-004': {
        topic: 'to put off',
        question: 'Przetłumacz zdanie.',
        explanation: 'put something off znaczy przełożyć, a until wyznacza nowy moment w czasie.',
      },
      'english-phrasal-005': {
        topic: 'Czasowniki nierozdzielne',
        question: '"I ran my old manager into at the conference" jest poprawne.',
        explanation: 'run into jest nierozdzielne, więc dopełnienie stoi po całej frazie: I ran into my old manager.',
      },
      'english-phrasal-006': {
        topic: 'Rejestr',
        question: 'Dlaczego phrasal verbs bywają zastępowane w formalnych raportach?',
        answers: {
          a: 'Jednowyrazowe odpowiedniki pochodzenia łacińskiego czytają się bardziej formalnie',
          b: 'Phrasal verbs są gramatycznie niepoprawne w piśmie',
          c: 'Są z definicji wieloznaczne',
          d: 'Nie da się ich użyć w czasie przeszłym',
        },
        explanation: 'find out → determine, put up with → tolerate, go up → increase. Obie formy są poprawne; różnica to rejestr.',
      },
      'english-phrasal-007': {
        topic: 'to carry on',
        question: 'Uzupełnij zdanie.',
        explanation: 'carry on znaczy kontynuować. carry out znaczy wykonać — carry out a test.',
      },
      'english-phrasal-008': {
        topic: 'to look into',
        question: 'Co znaczy "I\'ll look into it"?',
        explanation: 'look into znaczy zbadać. look after znaczy zaopiekować się, look up — sprawdzić w źródle.',
      },
      'english-phrasal-009': {
        topic: 'to roll back',
        question: 'Słownictwo',
        explanation: 'Praktycznie uniwersalne w angielskim softwarowym. Rzeczownik to rollback, pisany łącznie.',
      },
      'english-phrasal-010': {
        topic: 'to figure out',
        question: 'Uzupełnij zdanie.',
        explanation: 'figure something out znaczy rozgryźć albo zrozumieć po wysiłku. Jest rozdzielne: figure it out.',
      },
      'english-phrasal-011': {
        topic: 'to end up',
        question: 'Co znaczy "We ended up rewriting the whole suite"?',
        explanation: 'end up + -ing opisuje niezamierzony efekt końcowy. Polski odpowiednik to "skończyło się na tym, że...".',
      },
      'english-phrasal-012': {
        topic: 'to back up',
        question: 'Przetłumacz zdanie.',
        explanation: 'back something up znaczy poprzeć dowodami, a dopełnienie zaimkowe idzie w środek. "Backup" pisane łącznie to rzeczownik.',
      },
      'english-phrasal-013': {
        topic: 'Czasowniki trzyczęściowe',
        question: 'Trzyczęściowe phrasal verbs, takie jak "put up with", są nierozdzielne.',
        explanation: 'Dopełnienie zawsze stoi po całej frazie: I can\'t put up with it — nigdy "put it up with".',
      },
      'english-phrasal-014': {
        topic: 'to get around to',
        question: 'Co wyraża "I haven\'t got around to it yet"?',
        answers: {
          a: 'Nie znalazłem na to czasu, choć zamierzam',
          b: 'Odmówiłem zrobienia tego',
          c: 'Już to skończyłem',
          d: 'Nie rozumiem tego',
        },
        explanation:
          'Łagodny, częsty sposób powiedzenia "jeszcze nie zrobione". To jest tu przyimkiem, więc bierze rzeczownik albo -ing: got around to writing it.',
      },
      'english-phrasal-015': {
        topic: 'to narrow down',
        question: 'Słownictwo',
        explanation: 'We narrowed it down to two suspects. Bardzo częste przy opisywaniu debugowania po angielsku.',
      },
    },
  },
};

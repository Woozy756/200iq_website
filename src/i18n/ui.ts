export const locales = ["en", "lv", "ru", "et"] as const;

export type Lang = (typeof locales)[number];

export const defaultLang: Lang = "lv";

export const localeEndonyms: Record<Lang, string> = {
  en: "English",
  lv: "Latviešu",
  ru: "Русский",
  et: "Eesti",
};

export const ui = {
  en: {
    metadata: {
      title: "200IQ | Elite Web Engineering",
      description:
        "200IQ builds high-performance websites with elite design, modern architecture, and reliable launch workflows.",
      contactTitle: "Contact | 200IQ Elite Web Engineering",
      contactDescription:
        "Get in touch with 200IQ to start building your dream website.",
    },
    navigation: {
      brand: "200IQ",
      links: {
        vision: "Vision",
        process: "Process",
        tech: "Tech",
        network: "Network",
      },
      cta: "Get started",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      languageLabel: "Language",
      localeNames: {
        en: "English",
        lv: "Latvian",
        ru: "Russian",
        et: "Estonian",
      },
    },
    intro: {
      titleStart: "Get your",
      titleHighlight: "dream website",
      titleEnd: "done with us.",
      kicker: "Precision Engineering  |  Elite Design  |  Absolute Performance",
      lead: "You share your vision, goals, and ambitions. We create elite-level websites - defined by precision, experience, and refined, high-end animations. The result is a digital presence that not only looks exceptional, but maximizes your visibility and leaves a lasting impression on every client.",
      readyPrompt: "Ready to get started?",
      primaryCta: "Yes, lets go",
      secondaryCta: "No",
    },
    process: {
      eyebrow: "How We Build",
      title: "Steps to launch",
      description:
        "A direct four-step workflow from first call to production launch.",
      steps: [
        {
          title: "Contact",
          desc: "You share your story, goals, constraints and vision.",
        },
        {
          title: "Offer",
          desc: "We come up with visual ideas, page architecture and provide an offer.",
        },
        {
          title: "Contract",
          desc: "Scope, timeline, and deliverables are locked clearly.",
        },
        {
          title: "Launch",
          desc: "We deliver a valuable digital asset and provide technical support.",
        },
      ],
    },
    vision: {
      eyebrow: "Our Vision",
      title: "World-Class Mind",
      body1:
        "Elite engineering is not limited by geography. We build websites that meet international standards in design and delivery.",
      body2:
        "Your website is your most visible business asset. Modern architecture keeps it fast, stable, and ready for growth.",
      bullets: ["Global Engineering", "Elite Aesthetics", "Latvian Precision"],
    },
    services: {
      eyebrow: "Core Services",
      title: "High-Performance Delivery",
      cards: [
        {
          title: "Elite Level Design",
          desc: "Bespoke visual experiences tailored for the most demanding brands. We don't just build websites; we craft digital masterpieces.",
        },
        {
          title: "SEO Optimization",
          desc: "Dominating search rankings with precision-engineered structure and high-performance architecture that Google loves.",
        },
        {
          title: "Payment Integration",
          desc: "Seamless, secure, and lightning-fast transaction systems integrated directly into your digital ecosystem.",
        },
        {
          title: "Individual Requests",
          desc: "Custom-built features and unique functionalities designed specifically for your business's unique digital needs.",
        },
      ],
    },
    tech: {
      eyebrow: "200iq.eu",
      title: "Digital Evolution",
      body: "We deliver modern front and back-end architecture for businesses that need to stand out, creating visually striking, interactive experiences with graphic effects that push beyond what typical websites feel like.",
      metrics: [
        {
          value: "100%",
          label: "Custom Built",
        },
        {
          value: "< 30 days",
          label: "Delivery Time",
        },
      ],
    },
    stats: {
      items: [
        { label: "Uptime", value: "99.99%" },
        { label: "Latency", value: "< 2 ms" },
        { label: "Client Reviews", value: "5/5" },
        { label: "Security", value: "Maximum" },
      ],
    },
    network: {
      titleStart: "Join the",
      titleEnd: "Elite",
      body: "Elevate your digital presence with a modern website that sets a new standard for your brand.",
      cta: "Apply now",
    },
    footer: {
      titleStart: "Let's build",
      titleHighlight: "together.",
      cta: "Get Started",
      socialTitle: "Social",
      contactTitle: "Contact Us",
      companyTitle: "Company Details",
      companyAriaLabel: "Company details",
      facebookLabel: "Facebook",
      facebookAriaLabel: "Facebook",
      facebookHref: "https://www.facebook.com/people/200iq/61581955227968/",
      email: "oto@200iq.eu",
      emailAriaLabel: "Email oto@200iq.eu",
      phone: "+371 26 678 242",
      phoneHref: "tel:+37126678242",
      phoneAriaLabel: "Call +371 26 678 242",
      companyName: 'SIA "OG Capital"',
      registrationNo: "Registration No. 50203318251",
      companyAddress: "Gaileņu iela 22, Riga, LV-1023, Latvia",
      legalTitle: "Legal",
      socialLinks: ["Twitter", "Discord", "Github"],
      legalLinks: ["Privacy", "Terms", "Cookies"],
      builtFor: "Built for the elite",
      copyright: "Copyright 2026 200IQ.eu. All rights reserved.",
    },
    contact: {
      eyebrow: "Start the Process",
      titleStart: "Let's build",
      titleHighlight: "together",
      lead: "You share your goals, constraints, and target outcomes. We engineer the digital solution to get you there.",
      form: {
        nameLabel: "Full Name",
        namePlaceholder: "John Doe",
        emailLabel: "Email Address",
        emailPlaceholder: "john@example.com",
        projectTypeLabel: "Project Type",
        projectTypePlaceholder: "Select an option",
        types: {
          content: "Content Site / Blog (No E-commerce)",
          ecommerce: "High-Performance E-commerce",
          animated: "High-Fidelity Animated Experience",
          custom: "Custom Enterprise Architecture",
        },
        detailsLabel: "Project Details",
        detailsPlaceholder:
          "Share your goals, restraints, and target outcomes...",
        submitBtn: "Apply For Access",
        submittingBtn: "Transmitting...",
        errorMsg:
          "Transmission failed. Please try again or contact us directly.",
        successTitle: "Message Received",
        successDesc:
          "Access granted. Our elite engineering team will review your project details and contact you shortly.",
        validation: {
          nameReq: "Name is required",
          emailReq: "Valid email is required",
          typeReq: "Please select a project type",
          detailsReq: "Please provide some project details",
        },
      },
    },
  },
  lv: {
    metadata: {
      title: "200IQ | Elites līmeņa mājaslapu izstrāde",
      description:
        "200IQ izstrādā augstas veiktspējas mājaslapas ar izcilu dizainu, modernu arhitektūru un drošu palaišanas procesu.",
      contactTitle: "Kontakti | 200IQ Elites līmeņa mājaslapu izstrāde",
      contactDescription:
        "Sazinieties ar 200IQ, lai sāktu sava nākamā mājaslapas projekta izstrādi.",
    },
    navigation: {
      brand: "200IQ",
      links: {
        vision: "Vīzija",
        process: "Process",
        tech: "Tehnoloģijas",
        network: "Tīkls",
      },
      cta: "Sākt",
      openMenu: "Atvērt izvēlni",
      closeMenu: "Aizvērt izvēlni",
      languageLabel: "Valoda",
      localeNames: {
        en: "English",
        lv: "Latviešu",
        ru: "Русский",
        et: "Eesti",
      },
    },
    intro: {
      titleStart: "Izveidojiet savu",
      titleHighlight: "sapņu mājaslapu",
      titleEnd: "ar mums.",
      kicker: "Precīza izstrāde  |  Elites dizains  |  Absolūta veiktspēja",
      lead: "Jūs izstāstat savu vīziju, mērķus un ambīcijas. Mēs izstrādājam elites līmeņa mājaslapas ar precīzu arhitektūru, izcilu lietotāja pieredzi un izsmalcinātām animācijām. Rezultātā jūs iegūstat digitālo klātbūtni, kas ne tikai izskatās izcili, bet arī palielina jūsu redzamību un atstāj paliekošu iespaidu uz ikvienu klientu.",
      readyPrompt: "Vai esat gatavi sākt?",
      primaryCta: "Jā, sākam",
      secondaryCta: "Nē",
    },
    process: {
      eyebrow: "Kā mēs strādājam",
      title: "Soļi līdz palaišanai",
      description:
        "Tieša četru soļu pieeja no pirmās sarunas līdz projekta palaišanai.",
      steps: [
        {
          title: "Sazināšanās",
          desc: "Jūs izstāstāt savu stāstu, mērķus, ierobežojumus un vīziju.",
        },
        {
          title: "Piedāvājums",
          desc: "Mēs izstrādājam vizuālo virzienu, lapu arhitektūru un sagatavojam piedāvājumu.",
        },
        {
          title: "Līgums",
          desc: "Darba apjoms, termiņš un piegādes saturs tiek skaidri nostiprināti.",
        },
        {
          title: "Palaišana",
          desc: "Mēs piegādājam vērtīgu digitālo aktīvu un nodrošinām tehnisko atbalstu.",
        },
      ],
    },
    vision: {
      eyebrow: "Mūsu vīzija",
      title: "Pasaules līmeņa domāšana",
      body1:
        "Elites līmeņa inženierija nav ierobežota ar ģeogrāfiju. Mēs izstrādājam mājaslapas, kas atbilst starptautiskiem dizaina un piegādes standartiem.",
      body2:
        "Jūsu mājaslapa ir jūsu redzamākais biznesa aktīvs. Moderna arhitektūra nodrošina ātrumu, stabilitāti un gatavību izaugsmei.",
      bullets: [
        "Globāla inženierija",
        "Elites estētika",
        "Latvijas precizitāte",
      ],
    },
    services: {
      eyebrow: "Pamatpakalpojumi",
      title: "Augstas veiktspējas izpilde",
      cards: [
        {
          title: "Elites līmeņa dizains",
          desc: "Individuāli veidota vizuālā pieredze zīmoliem ar visaugstākajām prasībām. Mēs neveidojam vienkārši mājaslapas, mēs radām digitālus meistardarbus.",
        },
        {
          title: "SEO optimizācija",
          desc: "Redzamība meklēšanas rezultātos ar precīzi izstrādātu struktūru un augstas veiktspējas arhitektūru, ko novērtē arī Google.",
        },
        {
          title: "Maksājumu integrācija",
          desc: "Nevainojamas, drošas un ātras transakciju sistēmas, kas ir integrētas jūsu digitālajā ekosistēmā.",
        },
        {
          title: "Individuāli risinājumi",
          desc: "Pēc pasūtījuma veidotas funkcijas un risinājumi, kas atbilst jūsu biznesa unikālajām digitālajām vajadzībām.",
        },
      ],
    },
    tech: {
      eyebrow: "200iq.eu",
      title: "Digitālā evolūcija",
      body: "Mēs piegādājam modernu front-end un back-end arhitektūru uzņēmumiem, kuriem ir svarīgi izcelties, radot vizuāli izteiksmīgu un interaktīvu pieredzi ar efektiem, kas pārsniedz ierasto mājaslapu līmeni.",
      metrics: [
        {
          value: "100%",
          label: "Pilnībā pielāgots",
        },
        {
          value: "< 30 dienās",
          label: "Piegādes laiks",
        },
      ],
    },
    stats: {
      items: [
        { label: "Pieejamība", value: "99.99%" },
        { label: "Aizture", value: "< 2 ms" },
        { label: "Klientu vērtējums", value: "5/5" },
        { label: "Drošība", value: "Maksimāla" },
      ],
    },
    network: {
      titleStart: "Pievienojieties",
      titleEnd: "Elitei",
      body: "Paceliet savu digitālo klātbūtni jaunā līmenī ar modernu mājaslapu, kas nosaka jaunu standartu jūsu zīmolam.",
      cta: "Pieteikties",
    },
    footer: {
      titleStart: "Veidosim",
      titleHighlight: "kopā.",
      cta: "Sākt",
      socialTitle: "Sociālie tīkli",
      contactTitle: "Sazinies ar mums",
      companyTitle: "Uzņēmuma rekvizīti",
      companyAriaLabel: "Uzņēmuma rekvizīti",
      facebookLabel: "Facebook",
      facebookAriaLabel: "Facebook",
      facebookHref: "https://www.facebook.com/people/200iq/61581955227968/",
      email: "oto@200iq.eu",
      emailAriaLabel: "E-pasts oto@200iq.eu",
      phone: "+371 26 678 242",
      phoneHref: "tel:+37126678242",
      phoneAriaLabel: "Zvanīt uz +371 26 678 242",
      companyName: 'SIA "OG Capital"',
      registrationNo: "Reģistrācijas Nr. 50203318251",
      companyAddress: "Gaileņu iela 22, Rīga, LV-1023, Latvija",
      legalTitle: "Juridiskā informācija",
      socialLinks: ["Twitter", "Discord", "Github"],
      legalLinks: ["Privātums", "Noteikumi", "Sīkdatnes"],
      builtFor: "Radīts elitei",
      copyright: "Autortiesības 2026 200IQ.eu. Visas tiesības aizsargātas.",
    },
    contact: {
      eyebrow: "Sāksim procesu",
      titleStart: "Veidosim",
      titleHighlight: "kopā",
      lead: "Jūs izstāstāt savus mērķus, ierobežojumus un vēlamo rezultātu. Mēs izstrādājam digitālo risinājumu, kas palīdz tos sasniegt.",
      form: {
        nameLabel: "Pilns vārds",
        namePlaceholder: "Jānis Bērziņš",
        emailLabel: "E-pasta adrese",
        emailPlaceholder: "janis@example.com",
        projectTypeLabel: "Projekta veids",
        projectTypePlaceholder: "Izvēlieties variantu",
        types: {
          content: "Satura vietne / blogs (bez e-komercijas)",
          ecommerce: "Augstas veiktspējas e-komercija",
          animated: "Augstas detalizācijas animēta pieredze",
          custom: "Pielāgota uzņēmuma arhitektūra",
        },
        detailsLabel: "Projekta detaļas",
        detailsPlaceholder:
          "Aprakstiet savus mērķus, ierobežojumus un vēlamo rezultātu...",
        submitBtn: "Pieteikties",
        submittingBtn: "Sūta...",
        errorMsg:
          "Nosūtīšana neizdevās. Lūdzu, mēģiniet vēlreiz vai sazinieties ar mums tieši.",
        successTitle: "Ziņa saņemta",
        successDesc:
          "Piekļuve piešķirta. Mūsu komanda izskatīs jūsu projekta informāciju un drīzumā ar jums sazināsies.",
        validation: {
          nameReq: "Vārds ir obligāts",
          emailReq: "Nepieciešama derīga e-pasta adrese",
          typeReq: "Lūdzu, izvēlieties projekta veidu",
          detailsReq: "Lūdzu, norādiet projekta detaļas",
        },
      },
    },
  },
  ru: {
    metadata: {
      title: "200IQ | Элитная веб-разработка",
      description:
        "200IQ создает высокопроизводительные сайты с элитным дизайном, современной архитектурой и надежными процессами запуска.",
      contactTitle: "Контакты | 200IQ Элитная веб-разработка",
      contactDescription:
        "Свяжитесь с 200IQ, чтобы начать создание сайта вашей мечты.",
    },
    navigation: {
      brand: "200IQ",
      links: {
        vision: "Видение",
        process: "Процесс",
        tech: "Технологии",
        network: "Сообщество",
      },
      cta: "Начать",
      openMenu: "Открыть меню",
      closeMenu: "Закрыть меню",
      languageLabel: "Язык",
      localeNames: {
        en: "Английский",
        lv: "Латышский",
        ru: "Русский",
        et: "Эстонский",
      },
    },
    intro: {
      titleStart: "Создайте",
      titleHighlight: "сайт мечты",
      titleEnd: "вместе с нами.",
      kicker:
        "Точная инженерия  |  Элитный дизайн  |  Абсолютная производительность",
      lead: "Вы делитесь своим видением, целями и амбициями. Мы создаем сайты премиального уровня — с инженерной точностью, продуманным пользовательским опытом и выверенной high-end анимацией. Результат — цифровое присутствие, которое не только выглядит безупречно, но и усиливает вашу узнаваемость и оставляет сильное впечатление у каждого клиента.",
      readyPrompt: "Готовы начать?",
      primaryCta: "Да, поехали",
      secondaryCta: "Нет",
    },
    process: {
      eyebrow: "Как мы работаем",
      title: "Этапы запуска",
      description:
        "Прямой четырехэтапный процесс — от первого звонка до запуска в production.",
      steps: [
        {
          title: "Контакт",
          desc: "Вы делитесь своей историей, целями, ограничениями и видением.",
        },
        {
          title: "Предложение",
          desc: "Мы разрабатываем визуальные идеи, архитектуру страниц и готовим предложение.",
        },
        {
          title: "Договор",
          desc: "Объем работ, сроки и результаты четко фиксируются.",
        },
        {
          title: "Запуск",
          desc: "Мы передаем ценный цифровой актив и обеспечиваем техническую поддержку.",
        },
      ],
    },
    vision: {
      eyebrow: "Наше видение",
      title: "Мышление мирового уровня",
      body1:
        "Элитная инженерия не ограничивается географией. Мы создаем сайты, соответствующие международным стандартам в дизайне и реализации.",
      body2:
        "Ваш сайт — это самый заметный актив вашего бизнеса. Современная архитектура делает его быстрым, стабильным и готовым к масштабированию.",
      bullets: [
        "Глобальная инженерия",
        "Элитная эстетика",
        "Латвийская точность",
      ],
    },
    services: {
      eyebrow: "Ключевые услуги",
      title: "Высокопроизводительная реализация",
      cards: [
        {
          title: "Дизайн элитного уровня",
          desc: "Индивидуальные визуальные решения для самых требовательных брендов. Мы не просто создаем сайты — мы разрабатываем цифровые шедевры.",
        },
        {
          title: "SEO-оптимизация",
          desc: "Доминирование в поисковой выдаче за счет точно выстроенной структуры и высокопроизводительной архитектуры, которую ценит Google.",
        },
        {
          title: "Интеграция платежей",
          desc: "Бесшовные, безопасные и молниеносные транзакционные системы, интегрированные напрямую в вашу цифровую экосистему.",
        },
        {
          title: "Индивидуальные запросы",
          desc: "Кастомные функции и уникальные возможности, разработанные специально под цифровые задачи вашего бизнеса.",
        },
      ],
    },
    tech: {
      eyebrow: "200iq.eu",
      title: "Цифровая эволюция",
      body: "Мы создаем современную Frontend- и Backend-архитектуру для бизнеса, которому важно выделяться, формируя визуально выразительные, интерактивные решения с графическими эффектами, выходящими далеко за рамки привычного веб-опыта.",
      metrics: [
        {
          value: "100%",
          label: "Индивидуальная разработка",
        },
        {
          value: "< 30 дней",
          label: "Срок реализации",
        },
      ],
    },
    stats: {
      items: [
        { label: "Аптайм", value: "99.99%" },
        { label: "Задержка", value: "< 2 ms" },
        { label: "Отзывы клиентов", value: "5/5" },
        { label: "Безопасность", value: "Максимальная" },
      ],
    },
    network: {
      titleStart: "Присоединяйтесь к",
      titleEnd: "элите",
      body: "Выведите свое цифровое присутствие на новый уровень с современным сайтом, который задаст новый стандарт для вашего бренда.",
      cta: "Подать заявку",
    },
    footer: {
      titleStart: "Давайте создавать",
      titleHighlight: "вместе.",
      cta: "Начать",
      socialTitle: "Соцсети",
      contactTitle: "Связаться с нами",
      companyTitle: "Реквизиты компании",
      companyAriaLabel: "Реквизиты компании",
      facebookLabel: "Facebook",
      facebookAriaLabel: "Facebook",
      facebookHref: "https://www.facebook.com/people/200iq/61581955227968/",
      email: "oto@200iq.eu",
      emailAriaLabel: "Email oto@200iq.eu",
      phone: "+371 26 678 242",
      phoneHref: "tel:+37126678242",
      phoneAriaLabel: "Позвонить +371 26 678 242",
      companyName: 'SIA "OG Capital"',
      registrationNo: "Регистрационный номер 50203318251",
      companyAddress: "Gaileņu iela 22, Рига, LV-1023, Латвия",
      legalTitle: "Правовая информация",
      socialLinks: ["Twitter", "Discord", "Github"],
      legalLinks: ["Конфиденциальность", "Условия", "Cookies"],
      builtFor: "Создано для элиты",
      copyright: "Copyright 2026 200IQ.eu. Все права защищены.",
    },
    contact: {
      eyebrow: "Начать процесс",
      titleStart: "Давайте создавать",
      titleHighlight: "вместе",
      lead: "Вы делитесь своими целями, ограничениями и ожидаемыми результатами. Мы проектируем цифровое решение, которое приведет вас к ним.",
      form: {
        nameLabel: "Полное имя",
        namePlaceholder: "John Doe",
        emailLabel: "Email-адрес",
        emailPlaceholder: "john@example.com",
        projectTypeLabel: "Тип проекта",
        projectTypePlaceholder: "Выберите вариант",
        types: {
          content: "Контентный сайт / блог (без E-commerce)",
          ecommerce: "Высокопроизводительный E-commerce",
          animated: "Анимированный опыт высокого уровня",
          custom: "Индивидуальная enterprise-архитектура",
        },
        detailsLabel: "Детали проекта",
        detailsPlaceholder:
          "Расскажите о своих целях, ограничениях и ожидаемых результатах...",
        submitBtn: "Подать заявку на доступ",
        submittingBtn: "Передача...",
        errorMsg:
          "Сбой передачи. Пожалуйста, попробуйте еще раз или свяжитесь с нами напрямую.",
        successTitle: "Сообщение получено",
        successDesc:
          "Доступ предоставлен. Наша элитная инженерная команда изучит детали вашего проекта и вскоре свяжется с вами.",
        validation: {
          nameReq: "Имя обязательно",
          emailReq: "Требуется корректный email",
          typeReq: "Пожалуйста, выберите тип проекта",
          detailsReq: "Пожалуйста, укажите детали проекта",
        },
      },
    },
  },
  et: {
    metadata: {
      title: "200IQ | Eliitne veebiarendus",
      description:
        "200IQ loob suure jõudlusega veebisaite eliittasemel disaini, kaasaegse arhitektuuri ja usaldusväärsete lansseerimisprotsessidega.",
      contactTitle: "Kontakt | 200IQ Eliitne veebiarendus",
      contactDescription:
        "Võta 200IQ-ga ühendust, et alustada oma unistuste veebisaidi loomist.",
    },
    navigation: {
      brand: "200IQ",
      links: {
        vision: "Visioon",
        process: "Protsess",
        tech: "Tehnoloogia",
        network: "Võrgustik",
      },
      cta: "Alusta",
      openMenu: "Ava menüü",
      closeMenu: "Sulge menüü",
      languageLabel: "Keel",
      localeNames: {
        en: "Inglise",
        lv: "Läti",
        ru: "Vene",
        et: "Eesti",
      },
    },
    intro: {
      titleStart: "Loo oma",
      titleHighlight: "unistuste veebisait",
      titleEnd: "koos meiega.",
      kicker: "Täppisinseneeria  |  Eliitdisain  |  Maksimaalne jõudlus",
      lead: "Sina jagad oma visiooni, eesmärke ja ambitsioone. Meie loome eliittasemel veebisaite – mida iseloomustavad täpsus, kogemus ja viimistletud, kõrgetasemelised animatsioonid. Tulemuseks on digitaalne kohalolu, mis mitte ainult ei näe erakordne välja, vaid maksimeerib sinu nähtavust ja jätab igale kliendile püsiva mulje.",
      readyPrompt: "Kas oled valmis alustama?",
      primaryCta: "Jah, lähme",
      secondaryCta: "Ei",
    },
    process: {
      eyebrow: "Kuidas me loome",
      title: "Sammud lansseerimiseni",
      description:
        "Selge neljaastmeline töövoog esimesest kõnest kuni tootmiskeskkonda lansseerimiseni.",
      steps: [
        {
          title: "Kontakt",
          desc: "Jagad meiega oma lugu, eesmärke, piiranguid ja visiooni.",
        },
        {
          title: "Pakkumine",
          desc: "Loome visuaalsed ideed, lehearhitektuuri ja esitame pakkumise.",
        },
        {
          title: "Leping",
          desc: "Ulatus, ajakava ja tarnitavad tulemused fikseeritakse selgelt.",
        },
        {
          title: "Lansseerimine",
          desc: "Anname üle väärtusliku digitaalse vara ja pakume tehnilist tuge.",
        },
      ],
    },
    vision: {
      eyebrow: "Meie visioon",
      title: "Maailmatasemel mõtteviis",
      body1:
        "Eliittasemel inseneeria ei ole piiratud geograafiaga. Loome veebisaite, mis vastavad rahvusvahelistele disaini- ja teostusstandarditele.",
      body2:
        "Sinu veebisait on sinu ettevõtte kõige nähtavam vara. Kaasaegne arhitektuur hoiab selle kiire, stabiilse ja kasvuks valmis.",
      bullets: ["Globaalne inseneeria", "Eliitne esteetika", "Lätilik täpsus"],
    },
    services: {
      eyebrow: "Põhiteenused",
      title: "Suure jõudlusega teostus",
      cards: [
        {
          title: "Eliittasemel disain",
          desc: "Rätseplahendusena loodud visuaalsed kogemused kõige nõudlikumatele brändidele. Me ei loo lihtsalt veebisaite; me kujundame digitaalseid meistriteoseid.",
        },
        {
          title: "SEO optimeerimine",
          desc: "Valitse otsingutulemusi täppisinseneeria abil loodud struktuuri ja suure jõudlusega arhitektuuriga, mida Google hindab.",
        },
        {
          title: "Makseintegratsioon",
          desc: "Sujuvad, turvalised ja välkkiired tehingusüsteemid, mis on integreeritud otse sinu digitaalsesse ökosüsteemi.",
        },
        {
          title: "Individuaalsed lahendused",
          desc: "Rätseplahendusena loodud funktsioonid ja unikaalsed võimalused, mis on kavandatud just sinu ettevõtte digivajaduste jaoks.",
        },
      ],
    },
    tech: {
      eyebrow: "200iq.eu",
      title: "Digitaalne evolutsioon",
      body: "Pakume kaasaegset Frontend- ja Backend-arhitektuuri ettevõtetele, kes peavad silma paistma, luues visuaalselt mõjuvaid ja interaktiivseid kogemusi koos graafiliste efektidega, mis lähevad kaugemale sellest, mida tüüpilised veebisaidid pakuvad.",
      metrics: [
        {
          value: "100%",
          label: "Rätseplahendus",
        },
        {
          value: "< 30 päeva",
          label: "Tarneaeg",
        },
      ],
    },
    stats: {
      items: [
        { label: "Töökindlus", value: "99.99%" },
        { label: "Latentsus", value: "< 2 ms" },
        { label: "Kliendihinnangud", value: "5/5" },
        { label: "Turvalisus", value: "Maksimaalne" },
      ],
    },
    network: {
      titleStart: "Liitu",
      titleEnd: "eliidiga",
      body: "Tõsta oma digitaalne kohalolu uuele tasemele kaasaegse veebisaidiga, mis seab sinu brändile uue standardi.",
      cta: "Kandideeri kohe",
    },
    footer: {
      titleStart: "Loome",
      titleHighlight: "koos.",
      cta: "Alusta",
      socialTitle: "Sotsiaalmeedia",
      contactTitle: "Võta ühendust",
      companyTitle: "Ettevõtte andmed",
      companyAriaLabel: "Ettevõtte andmed",
      facebookLabel: "Facebook",
      facebookAriaLabel: "Facebook",
      facebookHref: "https://www.facebook.com/people/200iq/61581955227968/",
      email: "oto@200iq.eu",
      emailAriaLabel: "E-post oto@200iq.eu",
      phone: "+371 26 678 242",
      phoneHref: "tel:+37126678242",
      phoneAriaLabel: "Helista +371 26 678 242",
      companyName: 'SIA "OG Capital"',
      registrationNo: "Registrikood 50203318251",
      companyAddress: "Gaileņu iela 22, Riia, LV-1023, Läti",
      legalTitle: "Juriidiline",
      socialLinks: ["Twitter", "Discord", "Github"],
      legalLinks: ["Privaatsus", "Tingimused", "Küpsised"],
      builtFor: "Loodud eliidile",
      copyright: "Autoriõigus 2026 200IQ.eu. Kõik õigused kaitstud.",
    },
    contact: {
      eyebrow: "Alusta protsessi",
      titleStart: "Loome",
      titleHighlight: "koos",
      lead: "Sina jagad oma eesmärke, piiranguid ja soovitud tulemusi. Meie loome digitaalse lahenduse, mis viib sind nendeni.",
      form: {
        nameLabel: "Täisnimi",
        namePlaceholder: "John Doe",
        emailLabel: "E-posti aadress",
        emailPlaceholder: "john@example.com",
        projectTypeLabel: "Projekti tüüp",
        projectTypePlaceholder: "Vali sobiv variant",
        types: {
          content: "Sisuleht / blogi (ilma e-poeta)",
          ecommerce: "Suure jõudlusega e-kaubandus",
          animated: "Kõrge detailsusega animeeritud kogemus",
          custom: "Rätseplahendusena loodud ettevõtte arhitektuur",
        },
        detailsLabel: "Projekti üksikasjad",
        detailsPlaceholder:
          "Jaga oma eesmärke, piiranguid ja soovitud tulemusi...",
        submitBtn: "Taotle ligipääsu",
        submittingBtn: "Edastamine...",
        errorMsg:
          "Edastamine ebaõnnestus. Palun proovi uuesti või võta meiega otse ühendust.",
        successTitle: "Sõnum vastu võetud",
        successDesc:
          "Ligipääs antud. Meie eliitne inseneritiim vaatab sinu projekti üksikasjad üle ja võtab peagi ühendust.",
        validation: {
          nameReq: "Nimi on kohustuslik",
          emailReq: "Kehtiv e-posti aadress on kohustuslik",
          typeReq: "Palun vali projekti tüüp",
          detailsReq: "Palun lisa projekti kohta veidi infot",
        },
      },
    },
  },
} as const;

export type LocaleDictionary = (typeof ui)[Lang];

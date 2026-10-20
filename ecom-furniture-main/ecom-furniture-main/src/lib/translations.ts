import type { Language } from "@/store/languageStore";

export const translations = {
  ar: {
    // Brand
    brandName: "AMAZON",
    est: "تأسس عام 1994",
    manager: "خدمة العملاء والمبيعات",
    managerTitle: "فريق المبيعات والدعم الفني",

    // Nav
    home: "الرئيسية",
    shop: "المتجر",
    about: "من نحن",
    contact: "تواصل معنا",
    searchPlaceholder: "ابحث عن الأثاث، الصالونات، الطاولات...",
    cart: "سلة المشتريات",
    wishlist: "المفضلة",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    myAccount: "حسابي",
    cartCount: "عنصر",
    searchAllCategories: "كل الأقسام",
    searchBtn: "بحث",
    searchPlaceholderNavbar: "بحث عن منتجات (ركنة، سرير، مكتب...)",
    noSearchResults: "لا توجد نتائج مطابقة لـ",
    customOrderLink: "تفصيل حسب مقاسك 📐",
    saleOffersLink: "عروض أمازون",
    meshChairsLink: "كراسي شبك",
    medicalChairsLink: "كراسي طبية",
    tvTablesLink: "ترابيزة تليفزيون",
    officeCurtainsLink: "ستائر مكتبية",
    desksLink: "مكاتب",
    livingSetsLink: "انتريهات",
    leatherChairsLink: "كراسي جلد",
    trackOrderLink: "تتبع طلبك والضمان",
    allFurnitureLink: "جميع الأثاث",
    customBadge: "تفصيل",
    newBadgeText: "جديد",
    trackBadge: "تتبع",

    // Hero
    heroBadge: "تشكيلة 2026 الحصرية والمميزة",
    heroTitle1: "أقوى عروض وتخفيضات أمازون للأثاث",
    heroTitle2: "ليناسب ذوق منزلك ومكتبك الراقي",
    heroSubtitle: "خصومات كبرى وتصاميم عصرية فاخرة لغرف النوم والركنات والمطابخ مع استشارة هندسية وضمان 10 سنوات.",
    shopNow: "تسوق العروض الآن",
    exploreCollection: "اكتشف الكتالوج",
    ratingText: "تقييم 4.9 من أكثر من 2,500 عميل",
    freeShippingBadge: "شحن وتوصيل آمن لباب البيت",
    freeShippingDesc: "معاينة واستلام بكل سهولة",
    handcraftedBadge: "خشب طبيعي 100%",
    handcraftedDesc: "أخشاب زان وبلوط وأرو فاخرة",
    beechWood100: "خشب زان روماني 100%",
    freeAssembly: "تركيب مجاني لباب البيت",
    warranty10Years: "ضمان معتمد 10 سنوات",
    bookFreeConsultation: "احجز استشارة مجانية",

    // Hero Slides
    slide1Title: "أقوى عروض وتخفيضات أمازون للأثاث",
    slide1Subtitle: "خصومات كبرى وتصاميم عصرية فاخرة لغرف النوم والركنات والمطابخ مع استشارة هندسية وضمان 10 سنوات..",
    slide1Cta1: "تسوق العروض الآن",
    slide1Cta2: "احجز استشارة مجانية",

    slide2Title: "أثاث مكتبي ومنزلي يلهم الإبداع والكفاءة",
    slide2Subtitle: "مجموعة متميزة من الأثاث المكتبي والحلول العملية بأسعار حصرية لمساحة عمل متكاملة..",
    slide2Cta1: "تواصل معنا",
    slide2Cta2: "صمم الآن",

    slide3Title: "فخامة التنفيذ لأرقى المساحات",
    slide3Subtitle: "تصاميم تنفيذية راقية وتشطيبات خشب زان روماني طبيعي تمنح مكانك هيبة استثنائية وأداء يدوم طويلاً..",
    slide3Cta1: "تواصل معنا",
    slide3Cta2: "صمم الآن",

    // Choose Category
    chooseCategoryTitle: "اختر من تشكيلاتنا الحصرية",
    chooseCategorySubtitle: "تصاميم معمارية تناسب كل أركان بيتك ومكتبك بأعلى دقة تصنيع",
    tabMeshChairs: "كراسي شبك",
    tabMedicalChairs: "كراسي طبية",
    tabTv: "ترابيزة تليفزيون",
    tabCurtains: "ستائر مكتبية",
    tabDesks: "مكاتب",
    tabLivingSets: "انتريهات",
    tabLeatherChairs: "كراسي جلد",
    orderWhatsApp: "اطلب واتساب",
    quickView: "معاينة سريعة",
    viewAllCategory: "عرض جميع المنتجات",

    // Save 26% Section
    saveTitle: "وفّر ربع التكلفة بخصومات 26%",
    saveSubtitle: "عروض حصرية محدودة على أحدث الموديلات لهذا الأسبوع",
    saveBadge: "خصم 26%",

    // Dual Services Banner
    service3DTitle: "استشارة تصميم 3D مجانية",
    service3DDesc: "فريقنا الهندسي يصمم مساحتك بالكامل ثلاثي الأبعاد قبل البدء في التصنيع لترى غرفتك واقعياً.",
    service3DBtn: "احجز جلستك المجانية",
    serviceB2BTitle: "توريدات كبرى للشركات والفنادق",
    serviceB2BDesc: "عقود توريد مباشرة من المصنع بأسعار الجملة وضمان شامل ومطابقة لأعلى المواصفات القياسية.",
    serviceB2BBtn: "طلب عرض سعر للمشاريع",

    // Custom Furniture Promo
    customPromoTag: "تفصيل حسب الطلب",
    customPromoTitle: "صمم أثاثك الخاص بمقاسات مساحتك تماماً",
    customPromoDesc: "اختر نوع الخشب، لون الأقمشة، والمقاسات بالمليمتر.. ومصنعنا ينفذها لك باحترافية تامة.",
    customPromoBtn: "ابدأ طلب التفصيل الآن",

    // Seating Style Section
    seatingTitle: "جلسات على ذوقك",
    seatingSubtitle: "تناغم مثالي بين الراحة الفائقة والتصميم الهندسي الراقي",
    modernTitle: "الطراز العصري (Modern)",
    classicTitle: "الطراز الكلاسيكي الفاخر",
    minimalTitle: "المينيماليزم الهادئ (Minimalist)",

    // Summer Promo Banner
    summerTag: "تخفيضات الصيف الكبرى",
    summerTitle: "بصمة مكانك تبدأ من أمازون للأثاث",
    summerSubtitle: "اسبق الكل والحق أقوى العروض والتخفيضات الحصرية لهذا الموسم",
    summerBtn: "تسوق تشكيلة الصيف",

    // Free Consultation Section
    consultationTag: "استشارة ومعاينة مجانية 100%",
    consultationTitle: "احجز استشارتك الهندسية الآن",
    consultationDesc: "نوفر لك مهندس ديكور متخصص لرفع المقاسات وتقديم حلول معمارية عصرية متكاملة مجاناً",
    formName: "الاسم الكريم",
    formPhone: "رقم الهاتف / واتساب",
    formAddress: "المدينة / المحافظة",
    formType: "نوع الاستشارة",
    formTypeShowroom: "زيارة للمعرض والمصنع بالمنصورة",
    formTypeOnline: "استشارة أونلاين عبر مكالمة فيديو",
    formDate: "الموعد المناسب",
    formNotes: "ملاحظات أو تفاصيل إضافية",
    formSubmit: "تأكيد حجز الاستشارة مجاناً",

    // Mobile Bottom Nav
    navHome: "الرئيسية",
    navShop: "المتجر",
    navConsult: "استشارة مجانية",
    navWishlist: "المفضلة",
    navCart: "السلة",

    // Theme Toggle
    darkMode: "الوضع الليلي",
    lightMode: "الوضع النهاري",

    // Why Choose Us
    whyTag: "لماذا تختار AMAZON؟",
    whyTitle: "جودة استثنائية وتفاصيل لا تُضاهى",
    featSustainable: "خشب طبيعي مستدام",
    featSustainableDesc: "أخشاب طبيعية عالية الجودة تم اختيارها بعناية لضمان أطول عمر افتراضي.",
    featDelivery: "توصيل ومعاينة لباب البيت",
    featDeliveryDesc: "خدمة شحن سريعة مع التوصيل والتركيب الاحترافي حتى داخل منزلك.",
    featHandmade: "صناعة يدوية دقيقة",
    featHandmadeDesc: "أيادي فنيين مهرة يمتلكون خبرة تمتد لأكثر من 30 عاماً في صناعة الأثاث.",
    featWarranty: "ضمان حقيقي معتمد",
    featWarrantyDesc: "ضمان شامل على جودة الأخشاب والدهانات والتنجيد لراحة بالك التامة.",

    // Categories
    categoriesTitle: "تصفح حسب القسم",
    categoriesSubtitle: "اختر ما يناسب كل زاوية في بيتك من تشكيلاتنا المتنوعة",
    allCategories: "جميع الأقسام",
    catSofas: "الصالونات والركنات",
    catTables: "طاولات وسفرة",
    catChairs: "كراسي وبف",
    catBeds: "غرف النوم والأسرة",
    catStorage: "دواليب ووحدات تخزين",

    // Products
    featuredTitle: "أحدث وأرقى القطع المختارة",
    featuredSubtitle: "مجموعة منتقاة بعناية تمنح مساحتك لمسة من الفخامة العصرية",
    addToCart: "إضافة للسلة",
    addedToCart: "تمت الإضافة بنجاح ✓",
    viewDetails: "عرض التفاصيل",
    saleBadge: "خصم خاص",
    newBadge: "جديد",
    allProducts: "كافة المنتجات",
    price: "السعر",
    reviews: "تقييمات",
    inStock: "متوفر بالمخزن",
    outOfStock: "نفذت الكمية",

    // Brand Ticker
    tickerTitle: "موثوق من آلاف المنازل والفنادق والشركات",

    // Testimonials
    testimonialsTag: "آراء عملائنا",
    testimonialsTitle: "تجارب حقيقية تعكس ثقة عملائنا",

    // Newsletter
    newsletterTitle: "اشترك في نشرتنا البريدية",
    newsletterSubtitle: "احصل على خصم 10% على أول طلب لك وكن أول من يعلم بالعروض الحصرية.",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    subscribe: "اشتراك الآن",
    subscribedMsg: "شكراً لاشتراكك! تم تسجيل بريدك بنجاح.",

    // Footer & Contact
    footerDesc: "أثاث منزلي ومكتبي فاخر مصنوع بحرفية ليناسب متطلبات الحياة العصرية، بأعلى معايير الجودة والتصاميم الراقية وضمان 10 سنوات.",
    quickLinks: "روابط سريعة",
    company: "عن الشركة",
    support: "الدعم والخدمات",
    showroomFactory: "المعرض والمصنع: المنصورة، محافظة الدقهلية (خرائط Google Maps)",
    verifiedBuyer: "عميل موثق",
    followOurJourney: "شاهد أعمالنا وتجهيزاتنا",
    tagUs: "تابع أعمالنا الحصرية وتجهيزات المكاتب على مدار الساعة",
    contactInfo: "بيانات التواصل",
    showroomLocation: "موقع المعرض على الخريطة",
    openInMaps: "فتح في خرائط Google",
    callUs: "اتصل بنا هاتفياً",
    chatWhatsApp: "تواصل عبر واتساب",
    facebookPage: "صفحتنا على فيسبوك",
    followUs: "تابعنا على منصات التواصل",
    rightsReserved: "جميع الحقوق محفوظة لـ AMAZON – Premium Living Solutions.",
    directContact: "تواصل مباشر مع الإدارة",

    // Contact page
    contactHeaderTitle: "تواصل معنا مباشرة",
    contactHeaderSubtitle: "نحن هنا لمساعدتك في اختيار وتصميم وتأثيث منزلك، يسعدنا تواصلك دائماً.",
    sendMessage: "أرسل لنا رسالة",
    fullName: "الاسم بالكامل",
    emailAddr: "البريد الإلكتروني",
    phoneNum: "رقم الهاتف / الواتساب",
    messageContent: "نص الرسالة أو الاستفسار",
    sendBtn: "إرسال الرسالة",
    sending: "جاري الإرسال...",
    sentSuccess: "تم استلام رسالتك بنجاح! سيتواصل معك فريقنا في أقرب وقت.",

    // WhatsApp Floating
    whatsappHelp: "تواصل معنا عبر واتساب",
    whatsappDefaultMsg: "مرحباً، أود الاستفسار عن منتجات وتفاصيل أثاث AMAZON.",
  },

  sa: {
    // Brand
    brandName: "AMAZON",
    est: "تأسست عام 1994",
    manager: "خدمة العملاء والمبيعات",
    managerTitle: "فريق المبيعات والدعم الفني",

    // Nav
    home: "الرئيسية",
    shop: "المتجر",
    about: "عن البراند",
    contact: "تواصل معنا",
    searchPlaceholder: "ابحث عن أثاثك المفضل، كنب، طاولات...",
    cart: "سلة المشتريات",
    wishlist: "المفضلة",
    login: "تسجيل الدخول",
    register: "تسجيل جديد",
    myAccount: "حسابي",
    cartCount: "منتج",
    searchAllCategories: "كل الأقسام",
    searchBtn: "بحث",
    searchPlaceholderNavbar: "ابحث عن منتجات (مجالس، كنب، مكاتب...)",
    noSearchResults: "لا توجد نتائج مطابقة لـ",
    customOrderLink: "تفصيل حسب مقاسك 📐",
    saleOffersLink: "عروض أمازون",
    meshChairsLink: "كراسي شبك",
    medicalChairsLink: "كراسي طبية",
    tvTablesLink: "ترابيزة تليفزيون",
    officeCurtainsLink: "ستائر مكتبية",
    desksLink: "مكاتب",
    livingSetsLink: "انتريهات",
    leatherChairsLink: "كراسي جلد",
    trackOrderLink: "تتبع طلبك والضمان",
    allFurnitureLink: "جميع الأثاث",
    customBadge: "تفصيل",
    newBadgeText: "جديد",
    trackBadge: "تتبع",

    // Hero
    heroBadge: "كولكشن 2026 الحصري بالمملكة",
    heroTitle1: "أثاث فاخر بجودة ملكية",
    heroTitle2: "يجمّل مجلسك وبيتك بأرقى طراز",
    heroSubtitle: "أثاث بتفاصيل فخمة وخشب طبيعي أصيل، صُمم خصيصاً ليناسب المجالس والبيوت العصرية الباحثة عن التميز والرفاهية.",
    shopNow: "تسوّق الحين",
    exploreCollection: "تصفح الكتالوج",
    ratingText: "تقييم 4.9 من أكثر من 2,500 عميل راضٍ",
    freeShippingBadge: "شحن وتوصيل لباب بيتك",
    freeShippingDesc: "توصيل سريع ومريح لكل مدن المملكة",
    handcraftedBadge: "خشب طبيعي 100%",
    handcraftedDesc: "متانة وجودة فائقة تدوم سنين",
    beechWood100: "خشب زان روماني أصيل 100%",
    freeAssembly: "توصيل وتركيب مجاني",
    warranty10Years: "ضمان ذهبي معتمد 10 سنوات",
    bookFreeConsultation: "احجز استشارتك المجانية",

    // Hero Slides
    slide1Title: "أقوى عروض وتخفيضات أمازون للأثاث",
    slide1Subtitle: "خصومات كبرى وتصاميم عصرية فاخرة للمجالس وغرف النوم والمطابخ مع استشارة هندسية وضمان 10 سنوات..",
    slide1Cta1: "تسوّق العروض الحين",
    slide1Cta2: "احجز استشارة مجانية",

    slide2Title: "أثاث مكتبي ومنزلي يلهم الإبداع والكفاءة",
    slide2Subtitle: "مجموعة متميزة من الأثاث المكتبي والحلول العملية بأسعار حصرية لمساحة عمل متكاملة..",
    slide2Cta1: "تواصل معنا",
    slide2Cta2: "صمم الحين",

    slide3Title: "فخامة التنفيذ لأرقى المساحات",
    slide3Subtitle: "تصاميم تنفيذية راقية وتشطيبات خشب زان روماني طبيعي تمنح مكانك هيبة استثنائية وأداء يدوم طويلاً..",
    slide3Cta1: "تواصل معنا",
    slide3Cta2: "صمم الحين",

    // Choose Category
    chooseCategoryTitle: "اختر من تشكيلاتنا الحصرية",
    chooseCategorySubtitle: "تصاميم فخمة تناسب كل زاوية في مجلسك وبيتك ومكتبك",
    tabMeshChairs: "كراسي شبك",
    tabMedicalChairs: "كراسي طبية",
    tabTv: "طاولات تليفزيون",
    tabCurtains: "ستائر مكتبية",
    tabDesks: "مكاتب",
    tabLivingSets: "انتريهات",
    tabLeatherChairs: "كراسي جلد",
    orderWhatsApp: "طلب سريع عبر الواتساب",
    quickView: "معاينة سريعة",
    viewAllCategory: "عرض كل المنتجات",

    // Save 26% Section
    saveTitle: "وفّر ربع التكلفة بخصومات 26%",
    saveSubtitle: "عروض حصرية محدودة على أحدث الموديلات لهذا الأسبوع",
    saveBadge: "خصم 26%",

    // Dual Services Banner
    service3DTitle: "استشارة تصميم 3D مجانية",
    service3DDesc: "فريقنا الهندسي يصمم مساحتك بالكامل ثلاثي الأبعاد قبل التنفيذ لتشوف بيتك على الواقع.",
    service3DBtn: "احجز جلستك المجانية",
    serviceB2BTitle: "توريدات كبرى للشركات والفنادق",
    serviceB2BDesc: "عقود توريد مباشرة من المصنع بأسعار الجملة وضمان شامل للمشاريع الراقية.",
    serviceB2BBtn: "طلب عرض سعر للمشاريع",

    // Custom Furniture Promo
    customPromoTag: "تفصيل حسب طلبك",
    customPromoTitle: "فصّل أثاثك الخاص بمقاسات مساحتك تماماً",
    customPromoDesc: "اختر نوع الخشب، ولون القماش، والمقاسات بالمليمتر.. ومصنعنا ينفذها لك بدقة وجودة لا تضاهى.",
    customPromoBtn: "ابدأ طلب التفصيل الحين",

    // Seating Style Section
    seatingTitle: "جلسات على ذوقك",
    seatingSubtitle: "تناغم مثالي بين الراحة الفائقة والتصميم الهندسي الراقي",
    modernTitle: "الطراز العصري (Modern)",
    classicTitle: "الطراز الكلاسيكي الفاخر",
    minimalTitle: "المينيماليزم الهادئ (Minimalist)",

    // Summer Promo Banner
    summerTag: "تخفيضات الصيف الكبرى",
    summerTitle: "بصمة مكانك تبدأ من أمازون للأثاث",
    summerSubtitle: "اسبق الكل والحق أقوى العروض والتخفيضات الحصرية لهذا الموسم",
    summerBtn: "تسوّق تشكيلة الصيف",

    // Free Consultation Section
    consultationTag: "استشارة ومعاينة مجانية 100%",
    consultationTitle: "احجز استشارتك الهندسية الحين",
    consultationDesc: "نوفر لك مهندس ديكور متخصص لرفع المقاسات وتقديم حلول معمارية عصرية متكاملة مجاناً",
    formName: "الاسم الكريم",
    formPhone: "رقم الجوال / الواتساب",
    formAddress: "المدينة / الحي",
    formType: "نوع الاستشارة",
    formTypeShowroom: "زيارة المعرض والمصنع بالمنصورة",
    formTypeOnline: "استشارة أونلاين عبر مكالمة فيديو",
    formDate: "الموعد المناسب",
    formNotes: "ملاحظات أو تفاصيل إضافية",
    formSubmit: "تأكيد حجز الاستشارة مجاناً",

    // Mobile Bottom Nav
    navHome: "الرئيسية",
    navShop: "المتجر",
    navConsult: "استشارة مجانية",
    navWishlist: "المفضلة",
    navCart: "السلة",

    // Theme Toggle
    darkMode: "الوضع الليلي",
    lightMode: "الوضع النهاري",

    // Why Choose Us
    whyTag: "ليه تختار AMAZON؟",
    whyTitle: "جودة نفتخر فيها وخدمة تليق بك",
    featSustainable: "أخشاب طبيعية فاخرة",
    featSustainableDesc: "ننتقي أجود أنواع الأخشاب الصلبة لضمان متانة وفخامة تدوم طويلاً.",
    featDelivery: "توصيل سريع لباب بيتك",
    featDeliveryDesc: "شحن آمن وفريق متخصص للتوصيل والتركيب بكل عناية واحترافية.",
    featHandmade: "شغل يدوي متقن",
    featHandmadeDesc: "صناعة بحرفية عالية وتفاصيل دقيقة يدوية على أيدي أمهر الحرفيين.",
    featWarranty: "ضمان ذهبي معتمد",
    featWarrantyDesc: "ضمان شامل يضمن لك حقك وراحة بالك التامة على كل قطعة تقتنيها.",

    // Categories
    categoriesTitle: "أقسام الأثاث",
    categoriesSubtitle: "تصفح تشكيلاتنا المتنوعة المصممة لكل ركن في بيتك",
    allCategories: "الكل",
    catSofas: "كنب ومجالس",
    catTables: "طاولات وسفرة",
    catChairs: "كراسي وجلسات",
    catBeds: "غرف نوم وأسرة",
    catStorage: "دواليب ووحدات تخزين",

    // Products
    featuredTitle: "مختارات حصرية ومميزة",
    featuredSubtitle: "قطع فريدة تضيف لمجلسك وبيتك لمسة فخامة وأناقة",
    addToCart: "أضف للسلة",
    addedToCart: "تمت الإضافة بنجاح ✓",
    viewDetails: "تفاصيل القطعة",
    saleBadge: "عرض خاص",
    newBadge: "وصل حديثاً",
    allProducts: "كل المنتجات",
    price: "السعر",
    reviews: "تقييمات العملاء",
    inStock: "متوفر للطلب الفوري",
    outOfStock: "نفذت الكمية حالياً",

    // Brand Ticker
    tickerTitle: "اختيار كبرى البيوت والمشاريع الراقية",

    // Testimonials
    testimonialsTag: "تجارب عملائنا",
    testimonialsTitle: "ثقة نعتز فيها من أهل الذوق الرفيع",

    // Newsletter
    newsletterTitle: "انضم للنشرة الحصرية",
    newsletterSubtitle: "احصل على خصم خاص على أول طلب وتعرّف على أحدث العروض والتشكيلات أولاً بأول.",
    emailPlaceholder: "اكتب إيميلك هنا",
    subscribe: "اشترك الحين",
    subscribedMsg: "يا هلا بك! تم تسجيل إيميلك بنجاح.",

    // Footer & Contact
    footerDesc: "أثاث منزلي فاخر مصنوع يدوياً بجودة لا تقارن، يجمع بين الفخامة والراحة لخدمة بيوتكم منذ 1994.",
    quickLinks: "روابط سريعة",
    company: "عن الشركة",
    support: "الدعم والخدمات",
    showroomFactory: "المعرض والمصنع: المنصورة، محافظة الدقهلية (خرائط Google Maps)",
    verifiedBuyer: "عميل موثق",
    followOurJourney: "شاهد أعمالنا وتجهيزاتنا",
    tagUs: "تابع أعمالنا الحصرية وتجهيزات المكاتب على مدار الساعة",
    contactInfo: "تواصل معنا مباشرة",
    showroomLocation: "موقع المعرض على الخريطة",
    openInMaps: "افتح في قوقل ماب",
    callUs: "اتصال هاتفي مباشر",
    chatWhatsApp: "محادثة واتساب فورية",
    facebookPage: "صفحتنا على فيسبوك",
    followUs: "تابعنا على المنصات",
    rightsReserved: "كافة الحقوق محفوظة لـ AMAZON – Premium Living Solutions.",
    directContact: "تواصل مباشر مع الإدارة",

    // Contact page
    contactHeaderTitle: "حيّاك الله.. كيف نقدر نخدمك؟",
    contactHeaderSubtitle: "فريقنا جاهز لمساعدتك في تصميم وتأثيث منزلك على أعلى مستوى، تواصل معنا في أي وقت.",
    sendMessage: "ارسل لنا استفسارك",
    fullName: "الاسم الكريم",
    emailAddr: "البريد الإلكتروني",
    phoneNum: "رقم الجوال / الواتساب",
    messageContent: "تفاصيل طلبك أو استفسارك",
    sendBtn: "إرسال الاستفسار",
    sending: "جاري الإرسال...",
    sentSuccess: "تم استلام رسالتك بنجاح وبنتواصل معك في أسرع وقت بإذن الله.",

    // WhatsApp Floating
    whatsappHelp: "تواصل معنا عبر واتساب",
    whatsappDefaultMsg: "السلام عليكم، حابب أستفسر عن تشكيلة أثاث AMAZON والأسعار المتاحة.",
  },

  en: {
    // Brand
    brandName: "AMAZON",
    est: "Est. 1994",
    manager: "Customer Service & Sales",
    managerTitle: "Support & Sales Team",

    // Nav
    home: "Home",
    shop: "Shop",
    about: "About Us",
    contact: "Contact",
    searchPlaceholder: "Search furniture, sofas, tables...",
    cart: "Cart",
    wishlist: "Wishlist",
    login: "Login",
    register: "Register",
    myAccount: "My Account",
    cartCount: "items",
    searchAllCategories: "All Categories",
    searchBtn: "Search",
    searchPlaceholderNavbar: "Search products (sofas, beds, desks...)",
    noSearchResults: "No matching results for",
    customOrderLink: "Custom Sizing 📐",
    saleOffersLink: "Amazon Offers",
    meshChairsLink: "Mesh Chairs",
    medicalChairsLink: "Ergonomic Chairs",
    tvTablesLink: "TV Tables",
    officeCurtainsLink: "Office Blinds",
    desksLink: "Office Desks",
    livingSetsLink: "Living Sets",
    leatherChairsLink: "Leather Chairs",
    trackOrderLink: "Track Order & Warranty",
    allFurnitureLink: "All Furniture",
    customBadge: "Custom",
    newBadgeText: "New",
    trackBadge: "Track",

    // Hero
    heroBadge: "Exclusive 2026 Signature Collection",
    heroTitle1: "Best Amazon Furniture Offers & Deals",
    heroTitle2: "Crafted for Your Sophisticated Taste",
    heroSubtitle: "Massive seasonal discounts and modern luxury designs for bedrooms, lounges, and kitchens with engineering consultation and 10-year warranty.",
    shopNow: "Shop Deals Now",
    exploreCollection: "Explore Catalog",
    ratingText: "4.9 Rating from 2,500+ Happy Clients",
    freeShippingBadge: "Doorstep White-Glove Delivery",
    freeShippingDesc: "Safe packaging & verified on-site inspection",
    handcraftedBadge: "100% Solid Natural Wood",
    handcraftedDesc: "Premium Romanian Beech, Oak & Walnut",
    beechWood100: "100% Solid Beech Wood",
    freeAssembly: "Free White-Glove Assembly",
    warranty10Years: "10-Year Certified Warranty",
    bookFreeConsultation: "Book Free Consultation",

    // Hero Slides
    slide1Title: "Best Amazon Furniture Offers & Deals",
    slide1Subtitle: "Massive seasonal discounts and modern luxury designs for bedrooms, lounges, and kitchens with engineering consultation and 10-year warranty.",
    slide1Cta1: "Shop Deals Now",
    slide1Cta2: "Book Free Consultation",

    slide2Title: "Office & Home Furniture Inspiring Creativity & Productivity",
    slide2Subtitle: "An elite collection of ergonomic office furniture and practical solutions for an inspiring workspace.",
    slide2Cta1: "Contact Us",
    slide2Cta2: "Design Now",

    slide3Title: "Executive Elegance for Prestigious Spaces",
    slide3Subtitle: "High-end executive designs crafted from natural Romanian beech wood, providing enduring grandeur and lasting performance.",
    slide3Cta1: "Contact Us",
    slide3Cta2: "Design Now",

    // Choose Category
    chooseCategoryTitle: "Explore Our Exclusive Collections",
    chooseCategorySubtitle: "Architectural designs tailored for every corner of your home and office with master precision",
    tabMeshChairs: "Mesh Chairs",
    tabMedicalChairs: "Ergonomic Chairs",
    tabTv: "TV Units",
    tabCurtains: "Office Blinds",
    tabDesks: "Office Desks",
    tabLivingSets: "Living Sets",
    tabLeatherChairs: "Leather Chairs",
    orderWhatsApp: "Order via WhatsApp",
    quickView: "Quick View",
    viewAllCategory: "View All Products",

    // Save 26% Section
    saveTitle: "Save a Quarter of Your Budget with 26% Off",
    saveSubtitle: "Exclusive limited-time weekly deals on our newest signature arrivals",
    saveBadge: "26% OFF",

    // Dual Services Banner
    service3DTitle: "Free 3D Interior Design Consultation",
    service3DDesc: "Our interior engineering team creates full 3D mockups of your space before production begins so you can preview every detail.",
    service3DBtn: "Book Free 3D Session",
    serviceB2BTitle: "Corporate & B2B Hotel Furnishing",
    serviceB2BDesc: "Direct factory supply contracts at wholesale rates with full warranty for commercial ventures and corporations.",
    serviceB2BBtn: "Request Corporate Quotation",

    // Custom Furniture Promo
    customPromoTag: "Custom Tailoring",
    customPromoTitle: "Customize Your Furniture to Your Exact Dimensions",
    customPromoDesc: "Choose wood type, fabric colors, and dimensions down to the millimeter—crafted to perfection in our factory.",
    customPromoBtn: "Start Custom Order Now",

    // Seating Style Section
    seatingTitle: "Seating Tailored to Your Taste",
    seatingSubtitle: "The perfect harmony of ergonomic comfort and timeless luxury",
    modernTitle: "Modern Style",
    classicTitle: "Luxury Classic Style",
    minimalTitle: "Serene Minimalist Style",

    // Summer Promo Banner
    summerTag: "Mega Summer Sale",
    summerTitle: "Your Space's Identity Begins with Amazon Furniture",
    summerSubtitle: "Beat the rush and secure the finest limited-edition pieces this season",
    summerBtn: "Shop Summer Collection",

    // Free Consultation Section
    consultationTag: "100% Free Consultation & Site Visit",
    consultationTitle: "Book Your Free Engineering Consultation Now",
    consultationDesc: "We provide a dedicated interior specialist to measure your space and offer tailored modern solutions at zero cost.",
    formName: "Full Name",
    formPhone: "Phone Number / WhatsApp",
    formAddress: "City / Governorate",
    formType: "Consultation Type",
    formTypeShowroom: "Visit Mansoura Showroom & Factory",
    formTypeOnline: "Online Video Meeting Consultation",
    formDate: "Preferred Date",
    formNotes: "Additional Details or Notes",
    formSubmit: "Confirm Free Consultation",

    // Mobile Bottom Nav
    navHome: "Home",
    navShop: "Shop",
    navConsult: "Free Consult",
    navWishlist: "Wishlist",
    navCart: "Cart",

    // Theme Toggle
    darkMode: "Dark Mode",
    lightMode: "Light Mode",

    // Why Choose Us
    whyTag: "Why AMAZON?",
    whyTitle: "Uncompromising Quality & Craftsmanship",
    featSustainable: "Sustainable Hardwoods",
    featSustainableDesc: "Ethically harvested, kiln-dried hardwoods designed to endure generations.",
    featDelivery: "White Glove Delivery",
    featDeliveryDesc: "Prompt and insured home delivery with on-site assembly.",
    featHandmade: "Master Handcrafting",
    featHandmadeDesc: "Meticulously built by seasoned craftsmen with over 30 years of expertise.",
    featWarranty: "Comprehensive Warranty",
    featWarrantyDesc: "Guaranteed structural durability, hardware integrity, and premium finish.",

    // Categories
    categoriesTitle: "Browse by Category",
    categoriesSubtitle: "Curated collections tailored for every corner of your modern sanctuary",
    allCategories: "All Categories",
    catSofas: "Sofas & Lounges",
    catTables: "Dining & Tables",
    catChairs: "Chairs & Seating",
    catBeds: "Beds & Bedroom",
    catStorage: "Cabinets & Storage",

    // Products
    featuredTitle: "Featured Masterpieces",
    featuredSubtitle: "Handpicked selections designed to elevate your living spaces",
    addToCart: "Add to Cart",
    addedToCart: "Added to Cart ✓",
    viewDetails: "View Details",
    saleBadge: "Special Offer",
    newBadge: "New Arrival",
    allProducts: "All Products",
    price: "Price",
    reviews: "Reviews",
    inStock: "In Stock",
    outOfStock: "Sold Out",

    // Brand Ticker
    tickerTitle: "Trusted by thousands of luxury residences, hotels & designers",

    // Testimonials
    testimonialsTag: "Customer Reviews",
    testimonialsTitle: "What Our Clients Say About Us",

    // Newsletter
    newsletterTitle: "Join Our Private Newsletter",
    newsletterSubtitle: "Get 10% off your first order and receive early access to new collections and private sales.",
    emailPlaceholder: "Enter your email address",
    subscribe: "Subscribe",
    subscribedMsg: "Thank you for subscribing! Your email has been registered.",

    // Footer & Contact
    footerDesc: "Handcrafted luxury home & office furniture designed for modern living. Uncompromising quality, 10-year warranty, and timeless beauty since 1994.",
    quickLinks: "Quick Links",
    company: "Company",
    support: "Support & Services",
    showroomFactory: "Showroom & Factory: Mansoura, Dakahlia (Google Maps)",
    verifiedBuyer: "Verified Buyer",
    followOurJourney: "Follow Our Journey",
    tagUs: "See our latest architectural installations and custom setups 24/7",
    contactInfo: "Contact Information",
    showroomLocation: "Showroom Location on Map",
    openInMaps: "Open in Google Maps",
    callUs: "Call Direct",
    chatWhatsApp: "Chat on WhatsApp",
    facebookPage: "Official Facebook Page",
    followUs: "Follow Us",
    rightsReserved: "All rights reserved. AMAZON – Premium Living Solutions.",
    directContact: "Direct Executive Contact",

    // Contact page
    contactHeaderTitle: "Get in Touch With Us",
    contactHeaderSubtitle: "We are here to assist you in designing and furnishing your home. We look forward to hearing from you.",
    sendMessage: "Send us a Message",
    fullName: "Full Name",
    emailAddr: "Email Address",
    phoneNum: "Phone Number / WhatsApp",
    messageContent: "Your Message or Inquiry",
    sendBtn: "Send Message",
    sending: "Sending...",
    sentSuccess: "Thank you! Your message has been received. Our team will contact you shortly.",

    // WhatsApp Floating
    whatsappHelp: "Chat with Mohamed Esmaeil",
    whatsappDefaultMsg: "Hello Mr. Mohamed Esmaeil, I would like to inquire about AMAZON products.",
  },
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.ar;
}

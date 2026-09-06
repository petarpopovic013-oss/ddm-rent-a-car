alter table public.rc_vehicles
  add column if not exists category_en text,
  add column if not exists description_en text,
  add column if not exists category_de text,
  add column if not exists description_de text,
  add column if not exists category_ru text,
  add column if not exists description_ru text;

update public.rc_vehicles as vehicle
set
  category_en = translation.category_en,
  description_en = translation.description_en,
  category_de = translation.category_de,
  description_de = translation.description_de,
  category_ru = translation.category_ru,
  description_ru = translation.description_ru
from (
  values
    (
      'dacia-sandero',
      'City car',
      'The Sandero is a practical hatchback with an economical 1.5 diesel engine and air conditioning, ideal for everyday city driving for up to four people.',
      'Stadtauto',
      'Der Sandero ist ein praktischer Schrägheckwagen mit sparsamem 1,5-Liter-Dieselmotor und Klimaanlage – ideal für den Stadtalltag mit bis zu vier Personen.',
      'Городской автомобиль',
      'Sandero — практичный хэтчбек с экономичным дизельным двигателем 1,5 л и кондиционером, подходящий для ежедневных поездок по городу вчетвером.'
    ),
    (
      'fiat-ducato',
      'Cargo van',
      'The Ducato is a dependable cargo van with a powerful 2.8 diesel engine, air conditioning and three seats, ideal for transporting goods and everyday work.',
      'Transporter',
      'Der Ducato ist ein zuverlässiger Transporter mit kräftigem 2,8-Liter-Dieselmotor, Klimaanlage und drei Sitzplätzen – ideal für Warentransporte und den Arbeitsalltag.',
      'Грузовой фургон',
      'Ducato — надёжный грузовой фургон с мощным дизельным двигателем 2,8 л, кондиционером и тремя местами, подходящий для перевозки грузов и повседневной работы.'
    ),
    (
      'fiat-panda',
      'City car',
      'The compact, easy-to-see-out-of Panda is effortless around town and needs little parking space. It is a good choice for short journeys and everyday errands.',
      'Stadtauto',
      'Der kleine und übersichtliche Panda ist in der Stadt besonders wendig und benötigt wenig Platz beim Parken. Eine gute Wahl für kurze Strecken und tägliche Erledigungen.',
      'Городской автомобиль',
      'Компактная Panda с хорошей обзорностью легко чувствует себя в городе и не требует много места для парковки. Отличный выбор для коротких поездок и повседневных дел.'
    ),
    (
      'mitsubishi-space-star',
      'City car',
      'The Space Star is a light and economical city car, well suited to urban driving, short trips and drivers who value simplicity.',
      'Stadtauto',
      'Der Space Star ist ein leichter und sparsamer Stadtwagen. Er eignet sich für den Stadtverkehr, kurze Fahrten und alle, die unkompliziert unterwegs sein möchten.',
      'Городской автомобиль',
      'Space Star — лёгкий и экономичный городской автомобиль. Он подходит для поездок по городу, коротких путешествий и водителей, которые ценят простоту.'
    ),
    (
      'peugeot-207',
      'City car',
      'The Peugeot 207 is a compact car for the city and shorter journeys. Its small dimensions make it practical for everyday driving.',
      'Stadtauto',
      'Der Peugeot 207 ist ein kompakter Wagen für die Stadt und kürzere Strecken. Seine handlichen Abmessungen machen ihn besonders praktisch im Alltag.',
      'Городской автомобиль',
      'Peugeot 207 — компактный автомобиль для города и коротких поездок. Небольшие размеры делают его удобным для повседневного использования.'
    ),
    (
      'lada-vesta',
      'Compact saloon',
      'The Vesta offers more room than a typical city car while remaining easy to drive every day. It is equally at home in town and on the open road.',
      'Kompaktlimousine',
      'Der Vesta bietet mehr Platz als ein klassischer Stadtwagen und bleibt dennoch unkompliziert im Alltag. Er eignet sich sowohl für die Stadt als auch für längere Strecken.',
      'Компактный седан',
      'Vesta просторнее обычного городского автомобиля, но остаётся удобной для ежедневных поездок. Она подходит как для города, так и для загородных маршрутов.'
    ),
    (
      'skoda-rapid',
      'Compact saloon',
      'The Rapid is a spacious saloon that performs well both in everyday traffic and on longer journeys.',
      'Kompaktlimousine',
      'Der Rapid ist eine geräumige Limousine, die sich sowohl im Alltag als auch auf längeren Strecken bewährt.',
      'Компактный седан',
      'Rapid — просторный седан, который хорошо подходит и для повседневных поездок, и для дальних маршрутов.'
    ),
    (
      'citroen-xsara-picasso',
      'Family MPV',
      'The Xsara Picasso has a tall, spacious cabin with plenty of room for passengers, making it practical for families and longer journeys.',
      'Familienvan',
      'Der Xsara Picasso bietet einen hohen, geräumigen Innenraum mit viel Platz für die Mitreisenden. Damit ist er praktisch für Familien und längere Fahrten.',
      'Семейный минивэн',
      'Xsara Picasso отличается высоким просторным салоном с большим запасом места для пассажиров. Он удобен для семей и дальних поездок.'
    ),
    (
      'volkswagen-golf-6',
      'Estate car',
      'The Golf 6 Estate offers more room than a standard hatchback and is comfortable on longer journeys. It suits families and trips with extra luggage.',
      'Kombi',
      'Der Golf 6 Variant bietet mehr Platz als ein klassisches Schrägheck und ist auch auf längeren Strecken angenehm. Er eignet sich für Familien und Reisen mit mehr Gepäck.',
      'Универсал',
      'Golf 6 в кузове универсал просторнее обычного хэтчбека и удобен на дальних маршрутах. Он подходит для семей и поездок с большим количеством багажа.'
    ),
    (
      'volkswagen-golf-7',
      'Compact class',
      'The Golf 7 is easy to drive in town and comfortable enough for longer journeys. It is a versatile choice for almost any trip.',
      'Kompaktklasse',
      'Der Golf 7 ist unkompliziert in der Stadt und komfortabel genug für längere Strecken. Eine vielseitige Wahl für nahezu jede Fahrt.',
      'Компакт-класс',
      'Golf 7 удобен в городе и достаточно комфортен для дальних поездок. Это универсальный выбор практически для любого маршрута.'
    ),
    (
      'skoda-octavia-a7',
      'Family saloon',
      'The Octavia A7 is a spacious, comfortable saloon for everyday use and longer journeys, well suited to families and business travellers.',
      'Familienlimousine',
      'Die Octavia A7 ist eine geräumige und komfortable Limousine für den Alltag und längere Reisen. Sie eignet sich für Familien ebenso wie für Geschäftsreisende.',
      'Семейный седан',
      'Octavia A7 — просторный и комфортный седан для повседневных и дальних поездок. Он подходит семьям и деловым клиентам.'
    ),
    (
      'opel-astra',
      'Estate car',
      'The Astra Estate is a practical choice for families, longer journeys and any situation where you need extra room.',
      'Kombi',
      'Der Astra Kombi ist eine praktische Wahl für Familien, längere Fahrten und alle Situationen, in denen zusätzlicher Platz gefragt ist.',
      'Универсал',
      'Astra в кузове универсал удобна для семей, дальних поездок и любых ситуаций, когда требуется больше пространства.'
    ),
    (
      'opel-insignia',
      'Executive saloon',
      'The Insignia is a larger, more comfortable saloon for longer journeys and drivers who place particular value on comfort.',
      'Businesslimousine',
      'Der Insignia ist eine größere, komfortable Limousine für längere Strecken und alle, die besonderen Wert auf Fahrkomfort legen.',
      'Бизнес-седан',
      'Insignia — большой и комфортабельный седан для дальних поездок и водителей, которым особенно важен комфорт.'
    ),
    (
      'hyundai-h1',
      'Passenger van',
      'The Hyundai H1 has eight seats and is designed for larger families, groups and shared journeys.',
      'Kleinbus',
      'Der Hyundai H1 bietet acht Sitzplätze und ist ideal für größere Familien, Gruppen und gemeinsame Reisen.',
      'Пассажирский микроавтобус',
      'Hyundai H1 рассчитан на восемь мест и подходит большим семьям, группам и совместным поездкам.'
    )
) as translation(
  slug,
  category_en,
  description_en,
  category_de,
  description_de,
  category_ru,
  description_ru
)
where vehicle.slug = translation.slug;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rc_vehicles_active_translations_check'
      and conrelid = 'public.rc_vehicles'::regclass
  ) then
    alter table public.rc_vehicles
      add constraint rc_vehicles_active_translations_check
      check (
        status <> 'active'
        or (
          nullif(btrim(description), '') is not null
          and nullif(btrim(category_en), '') is not null
          and nullif(btrim(description_en), '') is not null
          and nullif(btrim(category_de), '') is not null
          and nullif(btrim(description_de), '') is not null
          and nullif(btrim(category_ru), '') is not null
          and nullif(btrim(description_ru), '') is not null
        )
      );
  end if;
end $$;

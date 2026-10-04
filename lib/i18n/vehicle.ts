import type { BodyType, Vehicle } from "@/lib/admin/types";
import type { Locale } from "./config";
import type { Dictionary, TranslationKey } from "./translations";

const fuelKeys: Record<Vehicle["fuel_type"], TranslationKey> = {
  petrol: "vehicle.petrol",
  diesel: "vehicle.diesel",
  hybrid: "vehicle.hybrid",
  electric: "vehicle.electric",
  lpg: "vehicle.lpg",
};

const bodyKeys: Record<BodyType, TranslationKey> = {
  hatchback: "vehicle.body.hatchback",
  sedan: "vehicle.body.sedan",
  wagon: "vehicle.body.wagon",
  suv: "vehicle.body.suv",
  minivan: "vehicle.body.minivan",
  van: "vehicle.body.van",
  coupe: "vehicle.body.coupe",
  convertible: "vehicle.body.convertible",
  pickup: "vehicle.body.pickup",
  other: "vehicle.body.other",
};

type VehicleTranslation = { category: string; description: string };

const vehicleTranslationFallbacks: Record<string, Partial<Record<Exclude<Locale, "sr">, VehicleTranslation>>> = {
  "dacia-sandero": {
    en: { category: "City car", description: "The Sandero is a practical hatchback with an economical 1.5 diesel engine and air conditioning, ideal for everyday city driving for up to four people." },
    de: { category: "Stadtauto", description: "Der Sandero ist ein praktischer Schrägheckwagen mit sparsamem 1,5-Liter-Dieselmotor und Klimaanlage – ideal für den Stadtalltag mit bis zu vier Personen." },
    ru: { category: "Городской автомобиль", description: "Sandero — практичный хэтчбек с экономичным дизельным двигателем 1,5 л и кондиционером, подходящий для ежедневных поездок по городу вчетвером." },
  },
  "fiat-ducato": {
    en: { category: "Cargo van", description: "The Ducato is a dependable cargo van with a powerful 2.8 diesel engine, air conditioning and three seats, ideal for transporting goods and everyday work." },
    de: { category: "Transporter", description: "Der Ducato ist ein zuverlässiger Transporter mit kräftigem 2,8-Liter-Dieselmotor, Klimaanlage und drei Sitzplätzen – ideal für Warentransporte und den Arbeitsalltag." },
    ru: { category: "Грузовой фургон", description: "Ducato — надёжный грузовой фургон с мощным дизельным двигателем 2,8 л, кондиционером и тремя местами, подходящий для перевозки грузов и повседневной работы." },
  },
  "fiat-panda": {
    en: { category: "City car", description: "The compact, easy-to-see-out-of Panda is effortless around town and needs little parking space. It is a good choice for short journeys and everyday errands." },
    de: { category: "Stadtauto", description: "Der kleine und übersichtliche Panda ist in der Stadt besonders wendig und benötigt wenig Platz beim Parken. Eine gute Wahl für kurze Strecken und tägliche Erledigungen." },
    ru: { category: "Городской автомобиль", description: "Компактная Panda с хорошей обзорностью легко чувствует себя в городе и не требует много места для парковки. Отличный выбор для коротких поездок и повседневных дел." },
  },
  "mitsubishi-space-star": {
    en: { category: "City car", description: "The Space Star is a light and economical city car, well suited to urban driving, short trips and drivers who value simplicity." },
    de: { category: "Stadtauto", description: "Der Space Star ist ein leichter und sparsamer Stadtwagen. Er eignet sich für den Stadtverkehr, kurze Fahrten und alle, die unkompliziert unterwegs sein möchten." },
    ru: { category: "Городской автомобиль", description: "Space Star — лёгкий и экономичный городской автомобиль. Он подходит для поездок по городу, коротких путешествий и водителей, которые ценят простоту." },
  },
  "peugeot-207": {
    en: { category: "City car", description: "The Peugeot 207 is a compact car for the city and shorter journeys. Its small dimensions make it practical for everyday driving." },
    de: { category: "Stadtauto", description: "Der Peugeot 207 ist ein kompakter Wagen für die Stadt und kürzere Strecken. Seine handlichen Abmessungen machen ihn besonders praktisch im Alltag." },
    ru: { category: "Городской автомобиль", description: "Peugeot 207 — компактный автомобиль для города и коротких поездок. Небольшие размеры делают его удобным для повседневного использования." },
  },
  "lada-vesta": {
    en: { category: "Compact saloon", description: "The Vesta offers more room than a typical city car while remaining easy to drive every day. It is equally at home in town and on the open road." },
    de: { category: "Kompaktlimousine", description: "Der Vesta bietet mehr Platz als ein klassischer Stadtwagen und bleibt dennoch unkompliziert im Alltag. Er eignet sich sowohl für die Stadt als auch für längere Strecken." },
    ru: { category: "Компактный седан", description: "Vesta просторнее обычного городского автомобиля, но остаётся удобной для ежедневных поездок. Она подходит как для города, так и для загородных маршрутов." },
  },
  "skoda-rapid": {
    en: { category: "Compact saloon", description: "The Rapid is a spacious saloon that performs well both in everyday traffic and on longer journeys." },
    de: { category: "Kompaktlimousine", description: "Der Rapid ist eine geräumige Limousine, die sich sowohl im Alltag als auch auf längeren Strecken bewährt." },
    ru: { category: "Компактный седан", description: "Rapid — просторный седан, который хорошо подходит и для повседневных поездок, и для дальних маршрутов." },
  },
  "citroen-xsara-picasso": {
    en: { category: "Family MPV", description: "The Xsara Picasso has a tall, spacious cabin with plenty of room for passengers, making it practical for families and longer journeys." },
    de: { category: "Familienvan", description: "Der Xsara Picasso bietet einen hohen, geräumigen Innenraum mit viel Platz für die Mitreisenden. Damit ist er praktisch für Familien und längere Fahrten." },
    ru: { category: "Семейный минивэн", description: "Xsara Picasso отличается высоким просторным салоном с большим запасом места для пассажиров. Он удобен для семей и дальних поездок." },
  },
  "volkswagen-golf-6": {
    en: { category: "Estate car", description: "The Golf 6 Estate offers more room than a standard hatchback and is comfortable on longer journeys. It suits families and trips with extra luggage." },
    de: { category: "Kombi", description: "Der Golf 6 Variant bietet mehr Platz als ein klassisches Schrägheck und ist auch auf längeren Strecken angenehm. Er eignet sich für Familien und Reisen mit mehr Gepäck." },
    ru: { category: "Универсал", description: "Golf 6 в кузове универсал просторнее обычного хэтчбека и удобен на дальних маршрутах. Он подходит для семей и поездок с большим количеством багажа." },
  },
  "volkswagen-golf-7": {
    en: { category: "Compact class", description: "The Golf 7 is easy to drive in town and comfortable enough for longer journeys. It is a versatile choice for almost any trip." },
    de: { category: "Kompaktklasse", description: "Der Golf 7 ist unkompliziert in der Stadt und komfortabel genug für längere Strecken. Eine vielseitige Wahl für nahezu jede Fahrt." },
    ru: { category: "Компакт-класс", description: "Golf 7 удобен в городе и достаточно комфортен для дальних поездок. Это универсальный выбор практически для любого маршрута." },
  },
  "skoda-octavia-a7": {
    en: { category: "Family saloon", description: "The Octavia A7 is a spacious, comfortable saloon for everyday use and longer journeys, well suited to families and business travellers." },
    de: { category: "Familienlimousine", description: "Die Octavia A7 ist eine geräumige und komfortable Limousine für den Alltag und längere Reisen. Sie eignet sich für Familien ebenso wie für Geschäftsreisende." },
    ru: { category: "Семейный седан", description: "Octavia A7 — просторный и комфортный седан для повседневных и дальних поездок. Он подходит семьям и деловым клиентам." },
  },
  "opel-astra": {
    en: { category: "Estate car", description: "The Astra Estate is a practical choice for families, longer journeys and any situation where you need extra room." },
    de: { category: "Kombi", description: "Der Astra Kombi ist eine praktische Wahl für Familien, längere Fahrten und alle Situationen, in denen zusätzlicher Platz gefragt ist." },
    ru: { category: "Универсал", description: "Astra в кузове универсал удобна для семей, дальних поездок и любых ситуаций, когда требуется больше пространства." },
  },
  "opel-insignia": {
    en: { category: "Executive saloon", description: "The Insignia is a larger, more comfortable saloon for longer journeys and drivers who place particular value on comfort." },
    de: { category: "Businesslimousine", description: "Der Insignia ist eine größere, komfortable Limousine für längere Strecken und alle, die besonderen Wert auf Fahrkomfort legen." },
    ru: { category: "Бизнес-седан", description: "Insignia — большой и комфортабельный седан для дальних поездок и водителей, которым особенно важен комфорт." },
  },
  "hyundai-h1": {
    en: { category: "Passenger van", description: "The Hyundai H1 has eight seats and is designed for larger families, groups and shared journeys." },
    de: { category: "Kleinbus", description: "Der Hyundai H1 bietet acht Sitzplätze und ist ideal für größere Familien, Gruppen und gemeinsame Reisen." },
    ru: { category: "Пассажирский микроавтобус", description: "Hyundai H1 рассчитан на восемь мест и подходит большим семьям, группам и совместным поездкам." },
  },
};

export function localizedVehicleCopy(vehicle: Vehicle, locale: Locale, dictionary: Dictionary) {
  if (locale === "sr") {
    return {
      category: vehicle.category,
      description: vehicle.description ?? dictionary["vehicle.genericDescription"],
    };
  }

  const category = vehicle[`category_${locale}`];
  const description = vehicle[`description_${locale}`];
  const fallback = vehicleTranslationFallbacks[vehicle.slug]?.[locale];
  return {
    category: category?.trim() || fallback?.category || dictionary["vehicle.genericCategory"],
    description: description?.trim() || fallback?.description || dictionary["vehicle.genericDescription"],
  };
}

export function localizedFuel(vehicle: Vehicle, dictionary: Dictionary) {
  return dictionary[fuelKeys[vehicle.fuel_type]];
}

export function localizedBodyType(bodyType: BodyType, dictionary: Dictionary) {
  return dictionary[bodyKeys[bodyType]];
}

export function localizedTransmission(vehicle: Vehicle, dictionary: Dictionary) {
  return dictionary[vehicle.transmission === "manual" ? "vehicle.manual" : "vehicle.automatic"];
}

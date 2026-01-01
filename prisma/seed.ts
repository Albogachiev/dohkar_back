import "dotenv/config";
import { PrismaClient, UserRole, AuthProvider } from "@prisma/client";
import * as argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";

// Используем ту же конфигурацию, что и в Nest PrismaService (adapter + pg Pool)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Для хостов вроде db.prisma.io с ?sslmode=require явно включаем SSL
const useSsl = connectionString.includes("sslmode=require");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  hashLength: 32,
  timeCost: 3,
  parallelism: 1,
};

// Описания для объявлений
const descriptions = [
  "Срочная продажа! В связи с переездом. Торг уместен.",
  "Отличное состояние, свежий ремонт, заезжай и живи!",
  "Собственник. Без комиссии. Все документы готовы.",
  "Рядом школа, детский сад, мечеть и супермаркет.",
  "Вид на горы/город. Тихий район. Чистый подъезд.",
  "Полностью меблирована. Техника остаётся.",
  "Подходит под ипотеку. Материнский капитал.",
  "Элитный дом. Охрана 24/7. Закрытая территория.",
  "Панорамные окна, прекрасная инсоляция.",
  "Развитая инфраструктура, рядом остановка.",
  "Уютный двор, чистый подъезд, хорошие соседи.",
  "Возможен обмен на машину с вашей доплатой.",
];

const featuresPool = [
  "Евроремонт",
  "Тёплый пол",
  "Кондиционер",
  "Мебель",
  "Кухонный гарнитур",
  "Балкон/лоджия",
  "Гардеробная",
  "Вид на город",
  "Подземный паркинг",
  "Детская площадка",
  "Видеонаблюдение",
  "Консьерж",
  "Санузел раздельный",
  "Гостевой домик",
  "Баня",
  "Гараж",
  "Сад",
  "Огород",
  "Камин",
  "Терраса",
  "Система «умный дом»",
  "Гидромассажная ванна",
];

const apartmentImages = [
  "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg", // квартира, интерьер
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
  "https://images.pexels.com/photos/37347/pexels-photo.jpg",
  "https://images.pexels.com/photos/206172/pexels-photo-206172.jpeg",
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
  "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg",
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
  "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg",
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
  "https://images.pexels.com/photos/263503/pexels-photo-263503.jpeg",
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
  "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
  "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg",
  "https://images.pexels.com/photos/37347/pexels-photo.jpg",
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
  "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
];

const houseImages = [
  "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg", // дом, фасад
  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
  "https://images.pexels.com/photos/1644921/pexels-photo-1644921.jpeg",
  "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
  "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg",
  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
  "https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg",
  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
  "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
  "https://images.pexels.com/photos/1644921/pexels-photo-1644921.jpeg",
  "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg",
  "https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg",
];

const commercialImages = [
  "https://images.pexels.com/photos/374710/pexels-photo-374710.jpeg", // офис, здание
  "https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg",
  "https://images.pexels.com/photos/374710/pexels-photo-374710.jpeg",
  "https://images.pexels.com/photos/54414/pexels-photo-54414.jpeg",
  "https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg",
  "https://images.pexels.com/photos/3862139/pexels-photo-3862139.jpeg",
  "https://images.pexels.com/photos/374710/pexels-photo-374710.jpeg",
  "https://images.pexels.com/photos/54414/pexels-photo-54414.jpeg",
];

const landImages = [
  "https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg",
  "https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg",
  "https://images.pexels.com/photos/289994/pexels-photo-289994.jpeg",
  "https://images.pexels.com/photos/335393/pexels-photo-335393.jpeg",
  "https://images.pexels.com/photos/158607/pexels-photo-158607.jpeg",
  "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg",
  "https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg",
];

// Типы регионов и недвижимости: используем строки (т.к. это seed)
const templates = [
  // Грозный — квартиры
  {
    title: "3-комн. квартира в ЖК Ахмат Тауэр",
    basePrice: 17_000_000,
    location: "Грозный, пр-т А. Кадырова",
    region: "CHECHNYA",
    type: "APARTMENT",
    rooms: 3,
    area: 90,
  },
  {
    title: "2-комн. в новом доме, центр",
    basePrice: 9_500_000,
    location: "Грозный, ул. Мира",
    region: "CHECHNYA",
    type: "APARTMENT",
    rooms: 2,
    area: 65,
  },
  {
    title: "Элитная 4-комн. с террасой",
    basePrice: 31_000_000,
    location: "Грозный, ул. Грибоедова",
    region: "CHECHNYA",
    type: "APARTMENT",
    rooms: 4,
    area: 160,
  },
  {
    title: "1-комн. студия в новостройке",
    basePrice: 6_200_000,
    location: "Грозный, Старопромысловский р-н",
    region: "CHECHNYA",
    type: "APARTMENT",
    rooms: 1,
    area: 42,
  },

  // Дома в Чечне
  {
    title: "Коттедж 250 м² с бассейном",
    basePrice: 28_000_000,
    location: "Грозный, пос. Альхан-Чурт",
    region: "CHECHNYA",
    type: "HOUSE",
    rooms: 7,
    area: 250,
  },
  {
    title: "Дом в Гудермесе с участком 10 соток",
    basePrice: 16_500_000,
    location: "Гудермес",
    region: "CHECHNYA",
    type: "HOUSE",
    rooms: 6,
    area: 200,
  },
  {
    title: "Новый дом в Шали",
    basePrice: 23_000_000,
    location: "Шали",
    region: "CHECHNYA",
    type: "HOUSE",
    rooms: 8,
    area: 300,
  },

  // Ингушетия
  {
    title: "Дом 300 м² в Назрани",
    basePrice: 21_000_000,
    location: "Назрань, Гамурзиевский округ",
    region: "INGUSHETIA",
    type: "HOUSE",
    rooms: 9,
    area: 300,
  },
  {
    title: "2-комн. квартира в Магасе",
    basePrice: 7_800_000,
    location: "Магас",
    region: "INGUSHETIA",
    type: "APARTMENT",
    rooms: 2,
    area: 72,
  },
  {
    title: "Участок ИЖС 12 соток",
    basePrice: 5_500_000,
    location: "с. Кантышево",
    region: "INGUSHETIA",
    type: "LAND",
    area: 1200,
    rooms: null,
  },

  // Коммерция
  {
    title: "Торговое помещение 200 м²",
    basePrice: 48_000_000,
    location: "Грозный, пр-т Путина",
    region: "CHECHNYA",
    type: "COMMERCIAL",
    area: 200,
    rooms: null,
  },
  {
    title: "Офис в бизнес-центре 350 м²",
    basePrice: 65_000_000,
    location: "Грозный, центр",
    region: "CHECHNYA",
    type: "COMMERCIAL",
    area: 350,
    rooms: null,
  },
];

// Возвращает случайный российский мобильный телефон
function getRandomPhone() {
  const code = [
    "900",
    "903",
    "904",
    "905",
    "906",
    "909",
    "977",
    "963",
    "965",
    "967",
    "968",
  ];
  return `+7${code[Math.floor(Math.random() * code.length)]}${String(
    Math.floor(1000000 + Math.random() * 9000000)
  ).padStart(7, "0")}`;
}

// Случайное имя пользователя
function getRandomName() {
  const names = [
    "Али",
    "Умар",
    "Фатима",
    "Заур",
    "Марем",
    "Лейла",
    "Тимур",
    "Малика",
    "Ислам",
    "Милана",
    "Зелимхан",
    "Имран",
    "Адам",
    "Рамзан",
    "Дина",
    "Рагим",
    "Седа",
    "Рауф",
    "Саид",
    "Арслан",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// Получить случайный аватар пользователя
function getRandomAvatar(i?: number) {
  return `https://randomuser.me/api/portraits/${
    Math.random() > 0.5 ? "men" : "women"
  }/${i !== undefined ? i : Math.floor(Math.random() * 90)}.jpg`;
}

// Создаёт массив случайных пользователей для seeds
async function createDummyUsers(count = 10) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      email: `user${i + 1}@example.com`,
      password: await argon2.hash(`pass${i + 1}word`, ARGON2_OPTIONS),
      name: getRandomName(),
      phone: getRandomPhone(),
      avatar: getRandomAvatar(i),
      isPremium: Math.random() > 0.7,
      role: Math.random() > 0.9 ? UserRole.PREMIUM : UserRole.USER,
      provider: AuthProvider.LOCAL,
    });
  }
  return users;
}

// OAuth-премиум пользователи для seeds
async function createAdditionalPremiums() {
  return [
    {
      email: "google.user@example.com",
      password: null,
      name: "Google User",
      phone: getRandomPhone(),
      avatar: getRandomAvatar(),
      isPremium: true,
      role: UserRole.PREMIUM,
      provider: AuthProvider.GOOGLE,
      providerId: "google-12345",
    },
    {
      email: "vk.user@example.com",
      password: null,
      name: "VK User",
      phone: getRandomPhone(),
      avatar: getRandomAvatar(),
      isPremium: true,
      role: UserRole.PREMIUM,
      provider: AuthProvider.VK,
      providerId: "vk-54321",
    },
  ];
}

// Выбирать фото для недвижимости — берёт с freepik (см. источники выше)
function getImagesForProperty(type: string, imgCount = 4) {
  let pool: string[] = [];
  if (type === "APARTMENT") pool = apartmentImages;
  else if (type === "HOUSE") pool = houseImages;
  else if (type === "COMMERCIAL") pool = commercialImages;
  else if (type === "LAND") pool = landImages;
  else pool = [];

  return pool.slice(0, imgCount);
}

async function main() {
  console.log("Запуск сидирования данных...");

  await prisma.favorite.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const hashPass = (p: string) => argon2.hash(p, ARGON2_OPTIONS);

  await prisma.user.create({
    data: {
      phone: "+79998887766",
      role: UserRole.ADMIN,
      isPremium: true,
      provider: AuthProvider.LOCAL,
    },
  });

  await prisma.user.createMany({
    data: [
      {
        phone: "+79451234567",
        isPremium: true,
        role: UserRole.PREMIUM,
        provider: AuthProvider.LOCAL,
      },
      {
        phone: "+79381230001",
        isPremium: true,
        provider: AuthProvider.LOCAL,
      },
      {
        phone: "+79280009988",
        role: UserRole.USER,
        provider: AuthProvider.LOCAL,
      },
      {
        phone: "+79408887766",
        isPremium: true,
        provider: AuthProvider.LOCAL,
      },
      {
        phone: "+79381112233",
        role: UserRole.USER,
        provider: AuthProvider.LOCAL,
      },
      {
        phone: "+79451112233",
        isPremium: true,
        provider: AuthProvider.LOCAL,
      },
    ],
    skipDuplicates: true,
  });

  const dummyUsers = await createDummyUsers(12);
  await prisma.user.createMany({
    data: dummyUsers,
    skipDuplicates: true,
  });

  const oauthPremiums = await createAdditionalPremiums();
  await prisma.user.createMany({
    data: oauthPremiums,
    skipDuplicates: true,
  });

  const allUsers = await prisma.user.findMany();

  // Генерация объявлений для недвижимости
  const propertiesToCreate: any[] = [];
  const now = Date.now();

  for (const template of templates) {
    let count = 5;
    if (template.type === "APARTMENT" || template.type === "HOUSE") count = 8;
    if (template.type === "COMMERCIAL") count = 3;

    for (let i = 0; i < count; i++) {
      const owner = allUsers[Math.floor(Math.random() * allUsers.length)];
      const priceVariation = Math.floor(Math.random() * 2_000_000) - 1_000_000;
      const areaVariation = Math.floor(Math.random() * 25) - 10;
      const imgCount = 4 + Math.floor(Math.random() * 4);
      const images = getImagesForProperty(template.type, imgCount);

      propertiesToCreate.push({
        title: `${template.title}${i > 0 ? ` #${i + 1}` : ""}`,
        price: Math.max(1_000_000, template.basePrice + priceVariation),
        currency: "RUB",
        location: template.location,
        region: template.region,
        type: template.type,
        rooms: template.rooms === null ? undefined : template.rooms,
        area: Math.max(30, (template.area || 100) + areaVariation),
        description:
          descriptions[Math.floor(Math.random() * descriptions.length)],
        images: images,
        features: featuresPool
          .sort(() => 0.5 - Math.random())
          .slice(0, 4 + Math.floor(Math.random() * 4)),
        status:
          Math.random() > 0.7
            ? "PENDING"
            : Math.random() > 0.05
              ? "ACTIVE"
              : "ARCHIVED",
        userId: owner.id,
        createdAt: new Date(
          now - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)
        ),
      });
    }
  }

  // Еще объявления-земельные участки для других регионов
  for (let x = 0; x < 6; x++) {
    const landOwner = allUsers[Math.floor(Math.random() * allUsers.length)];
    const imgCount = 3 + Math.floor(Math.random() * 3);
    const images = getImagesForProperty("LAND", imgCount);

    propertiesToCreate.push({
      title: `Участок под строительство в районе #${x + 1}`,
      price: 2_200_000 + Math.floor(Math.random() * 1_000_000),
      currency: "RUB",
      location: "Республика Дагестан, с. Коркмаскала",
      region: "OTHER",
      type: "LAND",
      area: 900 + Math.floor(Math.random() * 400),
      rooms: null,
      description:
        descriptions[Math.floor(Math.random() * descriptions.length)],
      images: images,
      features: featuresPool.sort(() => 0.5 - Math.random()).slice(0, 4),
      status: "ACTIVE",
      userId: landOwner.id,
      createdAt: new Date(
        now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
      ),
    });
  }

  // Сохраняем все объявления в БД; получаем их обратно (с id)
  const createdProperties = (await prisma.property.createManyAndReturn)
    ? await prisma.property.createManyAndReturn({
        data: propertiesToCreate,
      })
    : await (async () => {
        await prisma.property.createMany({ data: propertiesToCreate });
        return await prisma.property.findMany();
      })();

  // Избранное: каждый юзер лайкает 7-17 объявлений
  const favoriteData: { userId: string; propertyId: string }[] = [];
  for (const user of allUsers) {
    const shuffled = createdProperties.slice().sort(() => 0.5 - Math.random());
    const favCount = 7 + Math.floor(Math.random() * 11);
    const hisFavs = shuffled.slice(0, favCount);
    for (const prop of hisFavs) {
      favoriteData.push({ userId: user.id, propertyId: prop.id });
    }
  }

  await prisma.favorite.createMany({
    data: favoriteData,
    skipDuplicates: true,
  });

  // Лог отчёта
  console.log("Сид прошёл успешно!");
  console.log(`Пользователей: ${allUsers.length}`);
  console.log(`Объявлений: ${createdProperties.length}`);
  console.log(`Избранного: ${favoriteData.length}`);

  // Премиум пользователи: отчёт
  const premiumCount = allUsers.filter((u) => u.isPremium).length;
  console.log(`Премиум пользователей: ${premiumCount}`);

  // Статистика по регионам
  const regStats: Record<string, number> = {};
  for (const prop of createdProperties) {
    regStats[prop.region] = (regStats[prop.region] || 0) + 1;
  }
  Object.keys(regStats).forEach((region) => {
    console.log(`Объявлений в регионе ${region}: ${regStats[region]}`);
  });
}

main()
  .catch((e) => {
    console.error("Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a default business for testing
  const business = await prisma.business.upsert({
    where: { slug: "admin-shop" },
    update: {},
    create: {
      name: "Admin Shop",
      slug: "admin-shop",
      type: "barber",
      phone: "+37412345678",
      isVerified: true,
      services: {
        create: [
          {
            name: "Haircut",
            duration: 30,
            price: 3000,
          },
          {
            name: "Beard Trim",
            duration: 20,
            price: 2000,
          },
        ],
      },
    },
  });

  console.log({ business });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

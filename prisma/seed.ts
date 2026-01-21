import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.business.deleteMany();

  // Create business
  const business = await prisma.business.create({
    data: {
      name: "Armen's Barbershop",
      slug: "armen",
      type: "barber",
      phone: "+37491123456",
      address: "Tumanyan 15, Yerevan",
      city: "Yerevan",
      email: "armen@bookam.am",
      password: "hashed_password_placeholder",
    },
  });

  console.log("Created business:", business.name);

  // Create owner/staff
  const staff = await prisma.staff.create({
    data: {
      businessId: business.id,
      name: "Armen",
      phone: "+37491123456",
    },
  });

  console.log("Created staff:", staff.name);

  // Create services
  const services = await prisma.service.createMany({
    data: [
      {
        businessId: business.id,
        name: "Haircut",
        duration: 30,
        price: 3000,
      },
      {
        businessId: business.id,
        name: "Beard Trim",
        duration: 15,
        price: 1500,
      },
      {
        businessId: business.id,
        name: "Haircut + Beard",
        duration: 45,
        price: 4000,
      },
    ],
  });

  console.log("Created services:", services.count);

  // Connect services to staff
  const allServices = await prisma.service.findMany({
    where: { businessId: business.id },
  });

  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      services: {
        connect: allServices.map((s) => ({ id: s.id })),
      },
    },
  });

  // Create weekly schedule (Mon-Sat 10:00-19:00, Sunday off)
  const scheduleData = [];
  for (let day = 1; day <= 6; day++) {
    // 1 = Monday, 6 = Saturday
    scheduleData.push({
      staffId: staff.id,
      dayOfWeek: day,
      startTime: "10:00",
      endTime: "19:00",
      isActive: true,
    });
  }

  await prisma.schedule.createMany({
    data: scheduleData,
  });

  console.log("Created schedule for Mon-Sat");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

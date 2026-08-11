import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding real estate advertisement banners...");

  // Clear existing ads
  await prisma.advertisement.deleteMany({});

  const sampleAds = [
    {
      name: "HDFC Home Loans - Special 8.35% Annual Rate",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://www.hdfc.com",
      placement: "BOTH" as const,
      format: "FULL_WIDTH" as const,
      isExclusive: false,
      isActive: true,
      displayOrder: 1,
      clickCount: 142,
    },
    {
      name: "Godrej Waterfront Ultra Luxury Villas",
      imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://godrejproperties.com",
      placement: "HOME_ONLY" as const,
      format: "FULL_WIDTH" as const,
      isExclusive: false,
      isActive: true,
      displayOrder: 2,
      clickCount: 98,
    },
    {
      name: "Asian Paints - Complimentary Home Interior Consultation",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://asianpaints.com",
      placement: "INNER_ONLY" as const,
      format: "HALF_WIDTH" as const,
      isExclusive: false,
      isActive: true,
      displayOrder: 3,
      clickCount: 65,
    },
    {
      name: "Agarwal Packers & Movers - 15% Off Relocation Services",
      imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://drsagarwalpackers.com",
      placement: "PROPERTIES_ONLY" as const,
      format: "QUAD_GRID" as const,
      isExclusive: false,
      isActive: true,
      displayOrder: 4,
      clickCount: 41,
    },
  ];

  for (const ad of sampleAds) {
    await prisma.advertisement.create({ data: ad });
  }

  console.log(`Successfully seeded ${sampleAds.length} real estate ad banners!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

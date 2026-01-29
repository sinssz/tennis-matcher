import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  console.log('Cleaning up existing data...');
  await prisma.matchPlayer.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.eventParticipant.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.player.deleteMany({});

  // Sample players - 12 total (6 male, 6 female)
  const players = [
    // Male players
    { name: '김민준', gender: 'MALE' as const, level: 'A' as const },
    { name: '이준호', gender: 'MALE' as const, level: 'A' as const },
    { name: '박수진', gender: 'MALE' as const, level: 'B' as const },
    { name: '최동욱', gender: 'MALE' as const, level: 'B' as const },
    { name: '윤기철', gender: 'MALE' as const, level: 'C' as const },
    { name: '정현우', gender: 'MALE' as const, level: 'D' as const },

    // Female players
    { name: '김나연', gender: 'FEMALE' as const, level: 'A' as const },
    { name: '이지은', gender: 'FEMALE' as const, level: 'A' as const },
    { name: '박예린', gender: 'FEMALE' as const, level: 'B' as const },
    { name: '최하나', gender: 'FEMALE' as const, level: 'B' as const },
    { name: '윤소영', gender: 'FEMALE' as const, level: 'C' as const },
    { name: '정유나', gender: 'FEMALE' as const, level: 'D' as const },
  ];

  console.log('Creating sample players...');
  const createdPlayers = await Promise.all(
    players.map((player) =>
      prisma.player.create({
        data: player,
      })
    )
  );

  console.log(`Created ${createdPlayers.length} players`);

  // Create sample event
  console.log('Creating sample event...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const event = await prisma.event.create({
    data: {
      name: '주말 정기 모임',
      date: today,
      status: 'DRAFT',
    },
  });

  console.log(`Created event: ${event.name}`);

  // Add 10 participants
  console.log('Adding 10 participants to event...');
  const participantCount = 10;
  const participantsToAdd = createdPlayers.slice(0, participantCount);

  await Promise.all(
    participantsToAdd.map((player) =>
      prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          playerId: player.id,
        },
      })
    )
  );

  console.log(`Added ${participantCount} participants to event`);

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create a new module
  const newModule = await prisma.module.create({
    data: {
      name: 'Module 1',
    },
  });

  const topics = [
    'values, data types, and operators',
    'variables',
    'functions',
    'conditionals',
    'arrays',
    'loops',
    'building command line applications',
    'strings',
    'objects',
    'array methods and callbacks',
  ];

  const newTopics = await Promise.all(
    topics.map((topic, i) => {
      return prisma.topic.create({
        data: {
          name: topic,
          module: { connect: { id: newModule.id } }
        }
      })
    })
  );


  console.log(`Created module with ID: ${newModule.id}`);
  console.log(`Created topics with IDs: ${newTopics.map(topic => topic.id).join(', ')}`);
}

main()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });

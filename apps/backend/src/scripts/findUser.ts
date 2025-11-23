
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const post = await prisma.post.findFirst();
    if (post) {
        console.log(`Found User ID: ${post.userId}`);
    } else {
        console.log('No posts found in database.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

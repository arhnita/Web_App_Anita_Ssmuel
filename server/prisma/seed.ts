import { PrismaClient, Role, Priority, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await prisma.statusLog.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.serviceRequest.deleteMany();
    await prisma.user.deleteMany();
    await prisma.requestCategory.deleteMany();
    console.log('✓ Existing data cleared\n');

    // Create categories
    console.log('📁 Creating request categories...');
    const categories = await Promise.all([
        prisma.requestCategory.create({
            data: {
                name: 'Electricity',
                description: 'Power outages, faulty sockets, lighting issues, electrical repairs',
                icon: '⚡'
            }
        }),
        prisma.requestCategory.create({
            data: {
                name: 'Plumbing',
                description: 'Leaking pipes, blocked drains, water supply issues, toilet repairs',
                icon: '🚿'
            }
        }),
        prisma.requestCategory.create({
            data: {
                name: 'Furniture',
                description: 'Broken chairs, desks, cabinets, door repairs',
                icon: '🪑'
            }
        }),
        prisma.requestCategory.create({
            data: {
                name: 'Internet/Network',
                description: 'WiFi connectivity issues, network problems, ethernet ports',
                icon: '📶'
            }
        }),
        prisma.requestCategory.create({
            data: {
                name: 'Classroom Equipment',
                description: 'Projectors, whiteboards, AC units, audio systems',
                icon: '🖥️'
            }
        }),
        prisma.requestCategory.create({
            data: {
                name: 'Hostel Maintenance',
                description: 'Room repairs, common area issues, hostel facility maintenance',
                icon: '🏠'
            }
        })
    ]);
    console.log(`✓ Created ${categories.length} categories\n`);

    // Hash password for all demo users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create demo users
    console.log('👥 Creating demo users...');

    // Admin user
    const admin = await prisma.user.create({
        data: {
            email: 'admin@university.edu',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: Role.ADMIN,
            department: 'IT Department',
            phone: '+234 800 000 0001'
        }
    });
    console.log('  ✓ Admin: admin@university.edu');

    // Maintenance Officers
    const officer1 = await prisma.user.create({
        data: {
            email: 'john.maintenance@university.edu',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Okafor',
            role: Role.MAINTENANCE_OFFICER,
            department: 'Facilities Management',
            phone: '+234 800 000 0002'
        }
    });
    console.log('  ✓ Officer: john.maintenance@university.edu');

    const officer2 = await prisma.user.create({
        data: {
            email: 'mary.maintenance@university.edu',
            password: hashedPassword,
            firstName: 'Mary',
            lastName: 'Adeyemi',
            role: Role.MAINTENANCE_OFFICER,
            department: 'Facilities Management',
            phone: '+234 800 000 0003'
        }
    });
    console.log('  ✓ Officer: mary.maintenance@university.edu');

    // Staff user
    const staff = await prisma.user.create({
        data: {
            email: 'lecturer@university.edu',
            password: hashedPassword,
            firstName: 'Dr. James',
            lastName: 'Ibrahim',
            role: Role.STAFF,
            department: 'Computer Science',
            phone: '+234 800 000 0004'
        }
    });
    console.log('  ✓ Staff: lecturer@university.edu');

    // Student users
    const student1 = await prisma.user.create({
        data: {
            email: 'student@university.edu',
            password: hashedPassword,
            firstName: 'Anita',
            lastName: 'Samuel',
            role: Role.STUDENT,
            department: 'Computer Science',
            phone: '+234 800 000 0005'
        }
    });
    console.log('  ✓ Student: student@university.edu');

    const student2 = await prisma.user.create({
        data: {
            email: 'student2@university.edu',
            password: hashedPassword,
            firstName: 'Chidi',
            lastName: 'Nnamdi',
            role: Role.STUDENT,
            department: 'Business Administration',
            phone: '+234 800 000 0006'
        }
    });
    console.log('  ✓ Student: student2@university.edu\n');

    // Create sample service requests
    console.log('📋 Creating sample service requests...');

    // Request 1: Pending (no assignment)
    const request1 = await prisma.serviceRequest.create({
        data: {
            title: 'Broken AC in Lecture Hall A',
            description: 'The air conditioning unit in Lecture Hall A is not cooling properly. It makes a loud noise when turned on and barely produces cold air. This is affecting classes as the room gets very hot.',
            location: 'Main Building, Lecture Hall A',
            priority: Priority.HIGH,
            status: RequestStatus.PENDING,
            userId: staff.id,
            categoryId: categories[4].id // Classroom Equipment
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request1.id,
            previousStatus: RequestStatus.PENDING,
            newStatus: RequestStatus.PENDING,
            changedById: staff.id,
            comments: 'Request submitted'
        }
    });
    console.log('  ✓ Request 1: Broken AC (PENDING)');

    // Request 2: Assigned
    const request2 = await prisma.serviceRequest.create({
        data: {
            title: 'Leaking faucet in hostel bathroom',
            description: 'The faucet in the shared bathroom on the second floor has been leaking continuously for two days. Water is wasting and the floor is always wet.',
            location: 'Hostel Block B, Floor 2, Bathroom',
            priority: Priority.MEDIUM,
            status: RequestStatus.ASSIGNED,
            userId: student1.id,
            categoryId: categories[1].id // Plumbing
        }
    });

    await prisma.assignment.create({
        data: {
            requestId: request2.id,
            officerId: officer1.id,
            assignedById: admin.id,
            notes: 'Please fix as soon as possible - water wastage concern'
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request2.id,
            previousStatus: RequestStatus.PENDING,
            newStatus: RequestStatus.PENDING,
            changedById: student1.id,
            comments: 'Request submitted'
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request2.id,
            previousStatus: RequestStatus.PENDING,
            newStatus: RequestStatus.ASSIGNED,
            changedById: admin.id,
            comments: 'Assigned to John Okafor for immediate attention'
        }
    });
    console.log('  ✓ Request 2: Leaking faucet (ASSIGNED)');

    // Request 3: In Progress
    const request3 = await prisma.serviceRequest.create({
        data: {
            title: 'No power in Computer Lab 2',
            description: 'All power outlets in Computer Lab 2 are not working. Students cannot charge laptops or use desktop computers for practical sessions.',
            location: 'ICT Building, Computer Lab 2',
            priority: Priority.URGENT,
            status: RequestStatus.IN_PROGRESS,
            userId: staff.id,
            categoryId: categories[0].id // Electricity
        }
    });

    await prisma.assignment.create({
        data: {
            requestId: request3.id,
            officerId: officer2.id,
            assignedById: admin.id,
            notes: 'Urgent - affecting multiple classes'
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request3.id,
            previousStatus: RequestStatus.PENDING,
            newStatus: RequestStatus.PENDING,
            changedById: staff.id,
            comments: 'Request submitted'
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request3.id,
            previousStatus: RequestStatus.PENDING,
            newStatus: RequestStatus.ASSIGNED,
            changedById: admin.id,
            comments: 'Assigned to Mary Adeyemi'
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request3.id,
            previousStatus: RequestStatus.ASSIGNED,
            newStatus: RequestStatus.IN_PROGRESS,
            changedById: officer2.id,
            comments: 'Investigating the issue. Appears to be a tripped circuit breaker.'
        }
    });
    console.log('  ✓ Request 3: No power in lab (IN_PROGRESS)');

    // Request 4: Completed
    const request4 = await prisma.serviceRequest.create({
        data: {
            title: 'WiFi not working in Library',
            description: 'Students are unable to connect to the university WiFi in the main library. The network appears but connection keeps failing.',
            location: 'University Library, Ground Floor',
            priority: Priority.HIGH,
            status: RequestStatus.COMPLETED,
            userId: student2.id,
            categoryId: categories[3].id // Internet/Network
        }
    });

    await prisma.assignment.create({
        data: {
            requestId: request4.id,
            officerId: officer1.id,
            assignedById: admin.id,
            notes: 'Check router and access points'
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request4.id,
            previousStatus: RequestStatus.PENDING,
            newStatus: RequestStatus.PENDING,
            changedById: student2.id,
            comments: 'Request submitted'
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request4.id,
            previousStatus: RequestStatus.PENDING,
            newStatus: RequestStatus.ASSIGNED,
            changedById: admin.id,
            comments: 'Assigned to John Okafor'
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request4.id,
            previousStatus: RequestStatus.ASSIGNED,
            newStatus: RequestStatus.IN_PROGRESS,
            changedById: officer1.id,
            comments: 'Checking network equipment'
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request4.id,
            previousStatus: RequestStatus.IN_PROGRESS,
            newStatus: RequestStatus.COMPLETED,
            changedById: officer1.id,
            comments: 'Fixed! The access point needed a restart. WiFi is now working properly.'
        }
    });
    console.log('  ✓ Request 4: WiFi issue (COMPLETED)');

    // Request 5: Low priority pending
    const request5 = await prisma.serviceRequest.create({
        data: {
            title: 'Broken chair in classroom',
            description: 'One of the chairs in classroom 205 has a broken leg and is unstable. Should be repaired or replaced.',
            location: 'Academic Block, Room 205',
            priority: Priority.LOW,
            status: RequestStatus.PENDING,
            userId: student1.id,
            categoryId: categories[2].id // Furniture
        }
    });

    await prisma.statusLog.create({
        data: {
            requestId: request5.id,
            previousStatus: RequestStatus.PENDING,
            newStatus: RequestStatus.PENDING,
            changedById: student1.id,
            comments: 'Request submitted'
        }
    });
    console.log('  ✓ Request 5: Broken chair (PENDING)\n');

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📧 Demo Accounts (all passwords: password123):');
    console.log('');
    console.log('  👤 Admin:');
    console.log('     Email: admin@university.edu');
    console.log('');
    console.log('  🔧 Maintenance Officers:');
    console.log('     Email: john.maintenance@university.edu');
    console.log('     Email: mary.maintenance@university.edu');
    console.log('');
    console.log('  👨‍🏫 Staff:');
    console.log('     Email: lecturer@university.edu');
    console.log('');
    console.log('  👨‍🎓 Students:');
    console.log('     Email: student@university.edu');
    console.log('     Email: student2@university.edu');
    console.log('');
    console.log('═══════════════════════════════════════════════════════\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

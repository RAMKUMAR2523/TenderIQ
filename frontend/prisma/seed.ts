import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding the database...')

  // 1. Create a Company
  const company = await prisma.company.upsert({
    where: { id: 'comp-1' },
    update: {},
    create: {
      id: 'comp-1',
      name: 'TechSolutions India Pvt Ltd',
      gst: '07AABCU9603R1ZM',
      pan: 'ABCDE1234F',
      cin: 'U72900DL2021PTC123456',
      annualTurnover: '5.2 Cr',
      experience: '5 Years',
      employees: 45,
      industries: 'IT, Software, Networking',
      products: 'Custom Software, Web Apps',
      services: 'Cloud Hosting, IT Consulting',
      officeLocations: 'New Delhi, Bangalore',
      subscriptionPlan: 'PRO'
    }
  })

  // 2. Create Users
  const user = await prisma.user.upsert({
    where: { email: 'admin@techsolutions.com' },
    update: {},
    create: {
      email: 'admin@techsolutions.com',
      name: 'Rahul Sharma',
      role: 'ADMIN',
      companyId: company.id,
      password: 'hashedpassword' // In reality, hashed with bcrypt
    }
  })

  // 3. Create Tenders
  const tender1 = await prisma.tender.upsert({
    where: { id: 'tender-1' },
    update: {},
    create: {
      id: 'tender-1',
      title: 'Development of Web Portal for Ministry of Education',
      department: 'Ministry of Education',
      state: 'Delhi',
      tenderValue: 15000000,
      closingDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      referenceNumber: 'MOE/IT/2026/04',
      description: 'Design, development, and maintenance of a comprehensive web portal for educational resources.',
      executiveSummary: 'This tender aims to build a centralized portal for students and teachers across India.',
      eligibilityReqs: 'Min turnover 5Cr, CMMI Level 3, 5 years experience in Govt projects.',
      budgetSummary: 'Total estimated cost is ₹1.5 Cr.',
      techSummary: 'Requires Next.js, Node.js, and PostgreSQL.',
      importantClauses: 'Penalty of 1% per week for delay. Source code must be handed over.',
      riskAnalysis: 'High timeline risk due to immediate rollout requirement.',
      timeline: '6 months for development, 3 years for maintenance.'
    }
  })

  const tender2 = await prisma.tender.upsert({
    where: { id: 'tender-2' },
    update: {},
    create: {
      id: 'tender-2',
      title: 'Supply and Installation of Smart City IoT Sensors',
      department: 'Smart City Mission',
      state: 'Karnataka',
      tenderValue: 50000000,
      closingDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      referenceNumber: 'SCM/KA/2026/IoT-99',
      description: 'Deployment of IoT sensors for traffic and weather monitoring.',
      executiveSummary: 'Smart City initiative for real-time monitoring.',
      eligibilityReqs: 'Min turnover 15Cr, ISO 9001, Hardware manufacturing capability.',
      budgetSummary: '₹5 Cr budget allocated.',
      techSummary: 'LoRaWAN, MQTT, embedded C.',
    }
  })

  // 4. Create Company-Tender Association (Interested)
  await prisma.companyTender.upsert({
    where: { companyId_tenderId: { companyId: company.id, tenderId: tender1.id } },
    update: {},
    create: {
      companyId: company.id,
      tenderId: tender1.id,
      status: 'EVALUATING',
      readinessScore: 85.5
    }
  })

  // 5. Create Analytics for Dashboard
  await prisma.analytics.create({
    data: {
      date: new Date(),
      totalTenders: 120,
      tendersWon: 5,
      tendersLost: 2,
      totalRevenue: 25000000
    }
  })

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Simple seed runner — no TypeScript, no ESM complications
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const MEMBERS = [
  { slug: 'bharatha01', name: 'Bharath M', role: 'Executive Producer', team: 'leadership', oneLiner: 'Steering TEDxGCEM vision, strategic execution, and grand stage production.', bio: 'Bharath M is the Executive Producer of TEDxGCEM 2026, overseeing overall conference direction, institutional partnerships, and stage excellence.', contribution: 'Directing overarching event strategy, venue execution, and cross-functional leadership teams.', interests: ['Event Production', 'Leadership', 'Strategic Vision'], photoUrl: '/members/placeholder.png' },
  { slug: 'bhargav-bhat', name: 'Bhargav Bhat', role: 'Production Director', team: 'leadership', oneLiner: 'Orchestrating technical stage design, audio-visual excellence, and live stream engineering.', bio: 'As Production Director, I handle the design and production work of the team.', contribution: 'Supervising stage construction, lighting design, and live broadcast engineering.', interests: ['Stage Production', 'Lighting Engineering', 'Live Streaming'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/bhargavbhat18', email: 'bhargavbhathosmane321@gmail.com' },
  { slug: 'manoj-v', name: 'Manoj V', role: 'Event Director', team: 'leadership', oneLiner: 'Ensuring seamless event flow, attendee experience, and operational precision.', bio: 'Manoj V coordinates event day execution, attendee hosting, and timeline management.', contribution: 'Managing master event schedule, stage protocol, and attendee experience teams.', interests: ['Event Management', 'Operations', 'Experience Design'], photoUrl: '/members/placeholder.png' },
  { slug: 'vinay-s', name: 'Vinay S', role: 'Operations Director', team: 'leadership', oneLiner: 'Building infrastructure, logistics framework, and venue security protocols.', bio: 'Vinay S manages venue logistics, security clearance, supplier coordination, and crowd movement.', contribution: 'Lead operational strategist for venue logistics, badge control, and emergency planning.', interests: ['Logistics', 'Operations Engineering', 'Security Control'], photoUrl: '/members/placeholder.png' },
  { slug: 'akhila-g', name: 'Akhila G', role: 'Design Director', team: 'creative', oneLiner: 'Crafting expressive brand identity, spatial design, and visual aesthetics.', bio: 'As the Design Director at TEDx, I lead the creative vision and design direction.', contribution: 'Lead designer for the 2026 theme identity, digital branding, and stage backdrops.', interests: ['Brand Design', 'Typography', 'Environmental Graphics'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/akhilaakhi30', email: 'akhilakunnu2005@gmail.com' },
  { slug: 'thanisashri-ss', name: 'Thanisashri S S', role: 'Creative Director', team: 'creative', oneLiner: 'Blending artistic vision with immersive multi-sensory audience touchpoints.', bio: 'Thanisashri S S directs creative direction, campaign artwork, and thematic storytelling assets.', contribution: 'Directing visual narrative, motion design direction, and promo campaign aesthetics.', interests: ['Creative Direction', 'Visual Arts', 'Motion Design'], photoUrl: '/members/placeholder.png' },
  { slug: 'shruti-sujatha-francis', name: 'Shruti Sujatha Francis', role: 'Concept Artist', team: 'creative', oneLiner: 'Translating abstract conference themes into stunning visual artwork.', bio: 'Shruti Sujatha Francis creates custom illustrations, stage visual concepts, and promotional artwork.', contribution: 'Illustrated core theme assets, social graphics, and badge visual elements.', interests: ['Illustration', 'Concept Art', 'Digital Painting'], photoUrl: '/members/placeholder.png' },
  { slug: 'taruni-sri-reddy', name: 'K. Taruni Sri Reddy', role: 'Concept Artist', team: 'creative', oneLiner: 'Designing vibrant visual assets and interactive stage projections.', bio: "I'm a creative and enthusiastic CSE student with a passion for design and innovation.", contribution: 'Created event collateral artwork, speaker intro cards, and badge graphics.', interests: ['Digital Art', 'Graphic Design', 'Visual Storytelling'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/k-taruni-sri-reddy-096415367/', email: 'ktarunisrireddy6@gmail.com' },
  { slug: 'bushra-m', name: 'Bushra M Makandar', role: 'Creative Manager', team: 'creative', oneLiner: 'Synchronizing creative deliverables, design assets, and production timelines.', bio: "As the Creative Manager, I aim to bring ideas to life through creativity and impactful visuals.", contribution: 'Coordinating graphic design sprint schedules and print production quality control.', interests: ['Design Operations', 'Project Management', 'UI/UX Design'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/bushra-makandar-a010a3364/', email: 'bushramakandar9@gmail.com' },
  { slug: 'divyashree-rm', name: 'Divyashree RM', role: 'Curation Director', team: 'curation', oneLiner: 'Unearthing ideas worth spreading and mentoring visionary keynotes.', bio: 'Divyashree RM leads the TEDxGCEM curation committee.', contribution: 'Curated 12 keynote talks, directing speaker curation standards and talk rehearsal cycles.', interests: ['Speaker Curation', 'Idea Discovery', 'Storytelling'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/divyashree-rm', email: 'divyashree.kjm@gmail.com' },
  { slug: 'challa-himasree', name: 'Challa Himasree', role: 'Curator', team: 'curation', oneLiner: 'Distilling complex research into crisp, powerful 18-minute talks.', bio: "I'm Challa Himasree, a member of the TEDxGCEM Curation Team.", contribution: 'Coached speakers through script drafting, slides preparation, and stage delivery.', interests: ['Script Editing', 'Keynote Coaching', 'Research'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/challa-himasree-935b51335', email: 'himasree2795@gmail.com' },
  { slug: 'vyshnavi-d', name: 'Vyshnavi D', role: 'Curator', team: 'curation', oneLiner: 'Fostering intellectual diversity and compelling narrative arcs.', bio: "As a Curator at TEDxGCEM, I aim to discover and shape ideas that spark curiosity.", contribution: 'Speaker alignment, content editing, and keynote sequence design.', interests: ['Public Speaking', 'Interdisciplinary Studies', 'Content Development'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/vyshnavid110623/', email: 'vyshnavid232006@gmail.com' },
  { slug: 'charan-kumar-reddy', name: 'C Charan Kumar Reddy', role: 'Curator', team: 'curation', oneLiner: 'Connecting ground-breaking local ideas with global TED audiences.', bio: 'As a Curator in the TEDx GCEM Curation Team.', contribution: 'Researched regional innovators, coordinated talk rehearsals, and curated session themes.', interests: ['Innovation', 'Speaker Mentorship', 'Cultural History'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/chintaparthi-charan-kumar-reddy-255b57295', email: 'charankumaraiml28@gmail.com' },
  { slug: 'bhuvana-m', name: 'Bhuvana M', role: 'Curator', team: 'curation', oneLiner: 'Structuring memorable talk trajectories and audience engagement beats.', bio: 'As a Curator, I work with speakers to understand their ideas, experiences, and perspectives.', contribution: 'Curatorial research, speaker hospitality, and talk delivery coaching.', interests: ['Communication', 'Presentation Design', 'Audience Psychology'], photoUrl: '/members/placeholder.png', linkedin: 'https://in.linkedin.com/in/bhuvanamwork', email: 'bhuvanamwork@gmail.com' },
  { slug: 'spoorthi-n', name: 'Spoorthi N', role: 'Speaker Scout', team: 'curation', oneLiner: 'Scouting undiscovered thinkers, pioneers, and changemakers.', bio: 'As a Speaker Scout, I will contribute to identifying and connecting with inspiring individuals.', contribution: 'Identified breakthrough local talent and managed speaker nominations.', interests: ['Talent Discovery', 'Community Outreach', 'Research'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/spoorthi-n-367465332', email: 'nspoorthi1326@gmail.com' },
  { slug: 'meghana-mallarapu', name: 'Meghana Mallarapu', role: 'Speaker Scout', team: 'curation', oneLiner: 'Tracking emerging trends and recruiting impactful TEDx presenters.', bio: 'As a Speaker Scout, I am thrilled to dive deep into our community.', contribution: 'Vetted 50+ speaker applications and coordinated preliminary interviews.', interests: ['Research', 'Social Impact', 'Scouting'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/meghana-mallarapu-9211b2400', email: 'meghanambng@gmail.com' },
  { slug: 'divya-c', name: 'Divya S Chachadi', role: 'Partnership Director', team: 'partnerships', oneLiner: 'Cultivating strategic corporate alliances and sponsor ecosystems.', bio: 'As the Partnership Director at TEDxGCEM, I focus on building strong collaborations.', contribution: 'Secured primary event sponsors and managed brand integration deliverables.', interests: ['Corporate Partnerships', 'Business Development', 'Sponsorship Strategy'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/divyachachadi-ise', email: 'chachadidivya@gmail.com' },
  { slug: 'vinayaka', name: 'Vinayaka V', role: 'Partnership Director', team: 'partnerships', oneLiner: 'Aligning corporate visionaries with the TEDx mission.', bio: 'As Partnership Director, I focus on building strategic alliances.', contribution: 'Established key corporate partnerships and sponsor booth installations.', interests: ['Partnerships', 'Financial Strategy', 'Negotiation'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/vinayaka464', email: 'vinayakavini464@gmail.com' },
  { slug: 'sagar-singh', name: 'Sagar Singh', role: 'Partnership Lead', team: 'partnerships', oneLiner: 'Driving sponsor onboarding, fulfillment, and brand placement.', bio: 'As part of the Sponsorship Team, I aim to build meaningful connections.', contribution: 'Managed partner relations, contract fulfillment, and sponsor lounge setup.', interests: ['Client Relations', 'Event Sponsorship', 'Marketing'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/sagar-singh-a60884359', email: 'sagarsingh.webdev@gmail.com' },
  { slug: 'shivaprasad-patil', name: 'Shivaprasad V Patil', role: 'Partnership Lead', team: 'partnerships', oneLiner: 'Building sustainable brand collaborations and community support.', bio: 'As the Partnership Lead at TEDx, I focus on building meaningful partnerships.', contribution: 'Oversaw local merchant partnerships, food/beverage sponsors, and partner kits.', interests: ['Community Partnerships', 'Business Outreach', 'Networking'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/shivaprasad-v-patil-629259326', email: 'shivuprasad193@gmail.com' },
  { slug: 'kruthin-h', name: 'Kruthin H', role: 'Campaign Director', team: 'media', oneLiner: 'Igniting viral digital campaigns and high-octane video trailers.', bio: 'Kruthin H directs digital media marketing, campaign rollouts, and promotional video releases.', contribution: 'Spearheaded the 2026 ticket launch teaser campaign generating 50k+ views.', interests: ['Campaign Strategy', 'Video Production', 'Growth Marketing'], photoUrl: '/members/placeholder.png' },
  { slug: 'anusha', name: 'Anusha', role: 'Digital Media Manager', team: 'media', oneLiner: 'Managing social channels, audience engagement, and real-time event updates.', bio: 'As a member of the PR and Design Team, I contribute to promoting initiatives.', contribution: 'Executing daily social content calendar, live tweeting, and audience interactions.', interests: ['Social Media Management', 'Content Creation', 'Digital PR'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/anusha-royals-422989335', email: 'royalsanusha786@gmail.com' },
  { slug: 'riktriti', name: 'Ritkriti J', role: 'Digital Media Manager', team: 'media', oneLiner: 'Curating dynamic visual stories and social reel campaigns.', bio: 'As the Digital Media Manager for TEDx, I aim to build a strong digital presence.', contribution: 'Produced 20+ short video reels and live event day social highlights.', interests: ['Short-Form Video', 'Reels Strategy', 'Digital Marketing'], photoUrl: '/members/placeholder.png', linkedin: 'https://www.linkedin.com/in/ritkriti-j-sharma-1670a9322', email: 'onlyritkriti11@gmail.com' },
  { slug: 'mallikarjuna-l', name: 'Mallikarjuna L', role: 'Content Creator', team: 'media', oneLiner: 'Writing magnetic copy, speaker spotlights, and event articles.', bio: 'Mallikarjuna L writes editorial copy, press releases, and social media captions.', contribution: 'Authored speaker announcement copy, press notes, and website stories.', interests: ['Copywriting', 'Content Writing', 'Journalism'], photoUrl: '/members/placeholder.png' },
  { slug: 'nived-shaji', name: 'Nived Shaji', role: 'Technical Lead', team: 'technology', oneLiner: 'Architecting digital identity platforms, badge QR systems, and web apps.', bio: 'Nived Shaji leads web architecture, full-stack development, and digital experience engineering.', contribution: 'Built the TEDxGCEM Digital Identity System, badge QR engine, scan tracking APIs, and admin platform.', interests: ['Full-Stack Engineering', 'Next.js', 'Prisma', 'System Architecture'], photoUrl: '/members/placeholder.png', instagram: 'https://www.instagram.com/nivet.2006', github: 'https://github.com/Nivet2006' },
  { slug: 'yeshwanth', name: 'Yeshwanth', role: 'Technical Lead', team: 'technology', oneLiner: 'Engineering cloud infrastructure, database systems, and interactive UI.', bio: 'Yeshwanth develops backend systems, database schemas, and interactive web elements.', contribution: 'Engineered cloud database migrations, scan analytics tracking, and frontend components.', interests: ['Cloud Infrastructure', 'Database Systems', 'React', 'DevOps'], photoUrl: '/members/placeholder.png' },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Seeding 26 TEDxGCEM team members...');

  for (const m of MEMBERS) {
    await prisma.member.upsert({
      where: { slug: m.slug },
      update: {
        name: m.name, role: m.role, team: m.team,
        oneLiner: m.oneLiner, bio: m.bio, contribution: m.contribution,
        interests: JSON.stringify(m.interests),
        photoUrl: m.photoUrl,
        linkedin: m.linkedin || null, instagram: m.instagram || null,
        github: m.github || null, portfolio: null, email: m.email || null,
      },
      create: {
        slug: m.slug, name: m.name, role: m.role, team: m.team,
        oneLiner: m.oneLiner, bio: m.bio, contribution: m.contribution,
        interests: JSON.stringify(m.interests),
        photoUrl: m.photoUrl, scanCount: 0,
        linkedin: m.linkedin || null, instagram: m.instagram || null,
        github: m.github || null, portfolio: null, email: m.email || null,
      },
    });
    process.stdout.write('.');
  }

  const count = await prisma.member.count();
  console.log(`\n✅ Done! ${count} members in Neon DB.`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });

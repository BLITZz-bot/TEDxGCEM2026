import { NextResponse } from 'next/server';
import { checkTeamAdminSession } from '@/lib/team-admin-auth';
import { getAllMembers, createMember } from '@/lib/team-store';

export async function GET() {
  const isAuth = await checkTeamAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const members = await getAllMembers();
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  const isAuth = await checkTeamAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, role, team, oneLiner, bio, contribution, interests, photoUrl, linkedin, instagram, github, portfolio, email } = body;

    if (!name || !role || !team) {
      return NextResponse.json({ error: 'Name, role, and team are required' }, { status: 400 });
    }

    const newMember = await createMember({
      slug: body.slug,
      name,
      role,
      team,
      oneLiner: oneLiner || '',
      bio: bio || '',
      contribution: contribution || '',
      interests: typeof interests === 'string' ? interests : JSON.stringify(interests || []),
      photoUrl: photoUrl || '/members/placeholder.png',
      linkedin: linkedin || null,
      instagram: instagram || null,
      github: github || null,
      portfolio: portfolio || null,
      email: email || null,
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}

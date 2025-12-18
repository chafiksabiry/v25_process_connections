import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for now
  return NextResponse.json({
    data: [
      { _id: '1', name: 'Salesforce', description: 'CRM software', category: 'professional' },
      { _id: '2', name: 'Zendesk', description: 'Customer service software', category: 'professional' },
      { _id: '3', name: 'Jira', description: 'Help desk software', category: 'professional' },
    ]
  });
}


export const dummyAttendeeWithResponse = [
    {
      attendee: {
        id: 'attendee-1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        contactNo: 9876543210,
      },
      response: {
        id: 'response-1',
        startTime: new Date('2025-06-14T10:00:00Z'),
        endTime: new Date('2025-06-14T10:30:00Z'),
        summary: 'Discussed product roadmap and feature priorities.',
        recordingUrl: 'https://example.com/recording/response-1',
        fullTranscript: 'John: Hello everyone. Today we are going to discuss the roadmap...',
        endReason: 'user-hung-up',
      },
    },
    {
      attendee: {
        id: 'attendee-2',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        contactNo: 9123456780,
      },
      response: {
        id: 'response-2',
        startTime: new Date('2025-06-14T11:00:00Z'),
        endTime: new Date('2025-06-14T11:45:00Z'),
        summary: 'Q&A session on marketing strategies.',
        recordingUrl: 'https://example.com/recording/response-2',
        fullTranscript: 'Jane: My first question is about customer segmentation...',
        endReason: 'completed',
      },
    },
    {
      attendee: {
        id: 'attendee-3',
        email: 'sam.wilson@example.com',
        name: 'Sam Wilson',
        contactNo: null,
      },
      response: {
        id: 'response-3',
        startTime: new Date('2025-06-14T13:00:00Z'),
        endTime: new Date('2025-06-14T13:20:00Z'),
        summary: 'Feedback on onboarding process.',
        recordingUrl: 'https://example.com/recording/response-3',
        fullTranscript: 'Sam: I think the onboarding could be made simpler by adding...',
        endReason: 'connection-lost',
      },
    },
  ]



  export const dummyCalls = [
    {
      id: 'call-1',
      createdAt: new Date('2025-06-10T09:00:00Z'),
      updatedAt: new Date('2025-06-10T09:30:00Z'),
      description: 'Quarterly performance review and OKRs discussion.',
      aiAgentId: 'agent-1',
      agenda: 'Review Q2 performance and plan Q3 goals.',
      vapiCallId: 'vapi-123',
    },
    {
      id: 'call-2',
      createdAt: new Date('2025-06-12T14:15:00Z'),
      updatedAt: new Date('2025-06-12T14:50:00Z'),
      description: 'Introductory call with the new product manager.',
      aiAgentId: null,
      agenda: 'Team introduction and role expectations.',
      vapiCallId: 'vapi-456',
    },
    {
      id: 'call-3',
      createdAt: new Date('2025-06-14T17:00:00Z'),
      updatedAt: new Date('2025-06-14T17:40:00Z'),
      description: null,
      aiAgentId: 'agent-2',
      agenda: 'Demo of the new AI transcription system.',
      vapiCallId: 'vapi-789',
    },
  ];
  
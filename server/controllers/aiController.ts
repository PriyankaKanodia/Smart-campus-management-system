import { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Chatbot
export async function handleAiChat(req: Request, res: Response): Promise<void> {
  const { message, history } = req.body;
  if (!message) {
    res.status(400).json({ message: 'Message prompt is required.' });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    // Graceful fallback if no key set
    res.json({
      reply: `[Smart Campus AI Fallback]: Hello! I am Nova, your Smart Campus Assistant. I am currently operating in offline mode. For full AI reasoning, please ensure GEMINI_API_KEY is configured in server environment secrets. Regarding "${message}": You can check fees, timetable, library books, and course catalogs directly from the left navigation panel.`,
    });
    return;
  }

  try {
    const formattedHistory = Array.isArray(history)
      ? history.map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
      : '';

    const prompt = `Context of past conversation:\n${formattedHistory}\n\nUser Question: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Nova, an expert AI Campus Assistant for a university Smart Campus Management System. Provide concise, helpful, friendly, and structured responses regarding academics, fee structures, library access, attendance rules, hostel services, and campus events.',
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || 'I apologize, I could not generate a response.' });
  } catch (error: any) {
    res.status(500).json({ message: 'AI processing error.', error: error.message });
  }
}

// 2. AI Notice Summarizer
export async function handleSummarizeNotice(req: Request, res: Response): Promise<void> {
  const { noticeTitle, noticeContent } = req.body;
  if (!noticeTitle || !noticeContent) {
    res.status(400).json({ message: 'noticeTitle and noticeContent are required.' });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    res.json({
      summary: `Notice titled "${noticeTitle}" addresses important campus announcements. Please review deadlines and instructions provided in the full announcement text.`,
      keyTakeaways: [
        `Title: ${noticeTitle}`,
        'Important campus updates require student/faculty attention',
        'Check deadlines and compliance requirements'
      ],
      urgencyLevel: 'medium',
      targetAction: 'Read full notice and complete any required forms'
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Notice Title: ${noticeTitle}\n\nNotice Body:\n${noticeContent}`,
      config: {
        systemInstruction:
          'Summarize the university notice into a concise JSON object with summary text, key takeaways array, urgency level (high/medium/low), and target action.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            urgencyLevel: { type: Type.STRING },
            targetAction: { type: Type.STRING },
          },
          required: ['summary', 'keyTakeaways', 'urgencyLevel', 'targetAction'],
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    res.json(json);
  } catch (error: any) {
    res.status(500).json({ message: 'Notice summarization failed.', error: error.message });
  }
}

// 3. AI Timetable Generator
export async function handleGenerateTimetable(req: Request, res: Response): Promise<void> {
  const { courses, preferences } = req.body;

  const ai = getAiClient();
  if (!ai) {
    // Smart fallback timetable array
    res.json({
      schedule: [
        { day: 'Monday', timeSlot: '09:00 AM - 10:30 AM', courseCode: 'CS101', courseName: 'Data Structures', facultyName: 'Dr. Alan Turing', room: 'Lab 201', type: 'lecture' },
        { day: 'Monday', timeSlot: '11:00 AM - 12:30 PM', courseCode: 'CS102', courseName: 'Database Systems', facultyName: 'Prof. Grace Hopper', room: 'Hall B', type: 'lecture' },
        { day: 'Tuesday', timeSlot: '09:00 AM - 11:00 AM', courseCode: 'CS101L', courseName: 'Data Structures Lab', facultyName: 'Dr. Alan Turing', room: 'Lab 105', type: 'lab' },
        { day: 'Wednesday', timeSlot: '02:00 PM - 03:30 PM', courseCode: 'MATH201', courseName: 'Discrete Mathematics', facultyName: 'Dr. Katherine Johnson', room: 'Room 304', type: 'tutorial' }
      ]
    });
    return;
  }

  try {
    const prompt = `Generate an optimized 5-day academic timetable for the following courses: ${JSON.stringify(courses || ['CS101', 'CS102', 'MATH201', 'ENG101'])}. Preferences: ${preferences || 'Balanced morning and afternoon slots with 1-hour lunch break'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an AI Timetable Scheduler for a modern university. Create an optimized weekly timetable avoiding room conflicts and balancing workload.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  timeSlot: { type: Type.STRING },
                  courseCode: { type: Type.STRING },
                  courseName: { type: Type.STRING },
                  facultyName: { type: Type.STRING },
                  room: { type: Type.STRING },
                  type: { type: Type.STRING },
                },
                required: ['day', 'timeSlot', 'courseCode', 'courseName', 'facultyName', 'room', 'type'],
              },
            },
          },
          required: ['schedule'],
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    res.json(json);
  } catch (error: any) {
    res.status(500).json({ message: 'Timetable generation failed.', error: error.message });
  }
}

// 4. AI Course Recommendation
export async function handleRecommendCourses(req: Request, res: Response): Promise<void> {
  const { studentName, department, gpa, interests } = req.body;

  const ai = getAiClient();
  if (!ai) {
    res.json({
      recommendations: [
        {
          courseCode: 'AI301',
          courseName: 'Applied Machine Learning',
          relevanceScore: 96,
          matchReason: 'Aligns strongly with computational interests and prior high mathematics performance.',
          careerImpact: 'High demand for Data Scientist & AI Engineer positions',
          prerequisiteCheck: 'Satisfied (CS101, MATH201)'
        },
        {
          courseCode: 'CS402',
          courseName: 'Cloud Architecture & DevOps',
          relevanceScore: 91,
          matchReason: 'Complements core software engineering fundamentals.',
          careerImpact: 'Prepares for AWS/GCP Cloud Architect certifications',
          prerequisiteCheck: 'Satisfied (CS102)'
        }
      ]
    });
    return;
  }

  try {
    const prompt = `Student Name: ${studentName || 'Student'}\nDepartment: ${department || 'Computer Science'}\nCurrent GPA: ${gpa || 3.7}\nDeclared Interests: ${interests || 'Artificial Intelligence, Web Development, Cybersecurity'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an Academic Career Advisory AI. Recommend 3 ideal elective courses based on the student profile with relevance score (0-100), detailed match reason, career impact, and prerequisite check.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  courseCode: { type: Type.STRING },
                  courseName: { type: Type.STRING },
                  relevanceScore: { type: Type.NUMBER },
                  matchReason: { type: Type.STRING },
                  careerImpact: { type: Type.STRING },
                  prerequisiteCheck: { type: Type.STRING },
                },
                required: ['courseCode', 'courseName', 'relevanceScore', 'matchReason', 'careerImpact', 'prerequisiteCheck'],
              },
            },
          },
          required: ['recommendations'],
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    res.json(json);
  } catch (error: any) {
    res.status(500).json({ message: 'Course recommendation failed.', error: error.message });
  }
}

// 5. AI Student Performance Analysis
export async function handleAnalyzePerformance(req: Request, res: Response): Promise<void> {
  const { studentName, gpa, attendancePct, assignmentAvg, examScores } = req.body;

  const ai = getAiClient();
  if (!ai) {
    const gpaVal = Number(gpa) || 3.5;
    res.json({
      riskStatus: gpaVal < 2.5 ? 'High Risk' : gpaVal < 3.2 ? 'Moderate Risk' : 'Honors Track',
      gpaTrend: 'Upward positive trajectory across last 2 semesters',
      keyStrengths: ['Consistent assignment turn-in rate', 'Strong logical problem solving'],
      weakAreas: ['Timed mid-term examination preparation'],
      actionPlan: [
        'Join weekly peer study circle for Algorithms',
        'Utilize faculty office hours before finals',
        'Review past semester test papers'
      ],
      predictedSemesterGPA: Math.min(4.0, Number((gpaVal + 0.15).toFixed(2)))
    });
    return;
  }

  try {
    const prompt = `Student: ${studentName}\nGPA: ${gpa}\nAttendance: ${attendancePct}%\nAssignment Avg: ${assignmentAvg}%\nExam Scores: ${JSON.stringify(examScores || [88, 79, 92])}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an AI Academic Analytics Engine. Analyze the student performance data and output a structured diagnostic JSON report containing riskStatus (High Risk/Moderate Risk/On Track/Honors Track), gpaTrend, keyStrengths, weakAreas, actionPlan array, and predictedSemesterGPA.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskStatus: { type: Type.STRING },
            gpaTrend: { type: Type.STRING },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictedSemesterGPA: { type: Type.NUMBER },
          },
          required: ['riskStatus', 'gpaTrend', 'keyStrengths', 'weakAreas', 'actionPlan', 'predictedSemesterGPA'],
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    res.json(json);
  } catch (error: any) {
    res.status(500).json({ message: 'Performance analysis failed.', error: error.message });
  }
}

// 6. AI Attendance Prediction
export async function handlePredictAttendance(req: Request, res: Response): Promise<void> {
  const { currentPct, classesAttended, totalClasses, totalUpcoming } = req.body;

  const ai = getAiClient();
  if (!ai) {
    const pct = Number(currentPct) || 82;
    res.json({
      currentPct: pct,
      predictedEndPct: Math.round(pct * 0.98),
      status: pct < 75 ? 'Critical' : pct < 80 ? 'At Risk' : 'Safe',
      minClassesToAttendToReach75: pct < 75 ? 4 : 0,
      guidance: pct < 75
        ? 'WARNING: Attendance is below 75% threshold. You must attend the next 4 consecutive lectures without absenting to maintain exam eligibility.'
        : 'Good attendance record. Keep attending regularly to remain above 80% honors threshold.'
    });
    return;
  }

  try {
    const prompt = `Current Attendance: ${currentPct}%\nClasses Attended: ${classesAttended}\nTotal Classes Held: ${totalClasses}\nUpcoming Remaining Classes: ${totalUpcoming || 15}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an AI Predictive Attendance Guardian. Predict final semester attendance, assess risk vs 75% mandatory threshold, calculate minimum required future classes, and give actionable advice in JSON format.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentPct: { type: Type.NUMBER },
            predictedEndPct: { type: Type.NUMBER },
            status: { type: Type.STRING },
            minClassesToAttendToReach75: { type: Type.NUMBER },
            guidance: { type: Type.STRING },
          },
          required: ['currentPct', 'predictedEndPct', 'status', 'minClassesToAttendToReach75', 'guidance'],
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    res.json(json);
  } catch (error: any) {
    res.status(500).json({ message: 'Attendance prediction failed.', error: error.message });
  }
}

// 7. AI FAQ Assistant
export async function handleFaqAssistant(req: Request, res: Response): Promise<void> {
  const { question, category } = req.body;
  if (!question) {
    res.status(400).json({ message: 'Question parameter is required.' });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    res.json({
      answer: `Regarding "${question}": University regulations mandate that all requests in category '${category || 'general'}' should be submitted via the student portal or cleared with the departmental office.`,
      confidence: 90,
      relatedTopics: ['Fee Installments', 'Exam Schedule', 'Library Card Renewal'],
      actionableStep: 'Visit Admin block Room 102 or use portal online forms.'
    });
    return;
  }

  try {
    const prompt = `Category: ${category || 'General Campus Queries'}\nUser Question: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an AI FAQ Assistant for campus inquiries. Answer accurately with confidence score (0-100), related topics array, and actionable step.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            relatedTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableStep: { type: Type.STRING },
          },
          required: ['answer', 'confidence', 'relatedTopics', 'actionableStep'],
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    res.json(json);
  } catch (error: any) {
    res.status(500).json({ message: 'FAQ search failed.', error: error.message });
  }
}

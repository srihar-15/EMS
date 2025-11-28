import { GoogleGenAI } from "@google/genai";
import { Employee, LeaveRequest } from '../types';

const getClient = () => {
  // Assuming environment variable availability as per instructions
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.warn("API_KEY is missing. Gemini features will likely fail.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeWorkforceData = async (employees: Employee[], leaves: LeaveRequest[]) => {
  const ai = getClient();
  
  const dataContext = JSON.stringify({
    totalEmployees: employees.length,
    departments: employees.map(e => e.department),
    salaries: employees.map(e => e.salary),
    pendingLeaves: leaves.filter(l => l.status === 'PENDING').length,
    recentLeaves: leaves.slice(0, 5)
  });

  const prompt = `
    You are a Senior HR Data Analyst. Analyze the following workforce data JSON.
    Provide 3 concise, actionable strategic insights regarding:
    1. Salary distribution equity.
    2. Departmental balance.
    3. Potential burnout risks based on leave patterns.
    
    Data: ${dataContext}
    
    Format the response as simple HTML unordered list <ul><li>...</li></ul> string. Do not use Markdown formatting (backticks). Keep it professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "<ul><li>Unable to generate AI insights at this moment. Please check API configuration.</li></ul>";
  }
};
// LLM Prompt Template Management

export const PROMPTS = {
  explainSQL: (question: string, answer?: string) => `You are a helpful SQL tutor. A student is practicing SQL questions.

Question:
${question}

${answer ? `Correct Answer:\n${answer}\n\n` : ''}

Please provide:
1. A clear explanation of how to approach this SQL problem
2. Step-by-step breakdown of the solution
3. Key SQL concepts used
4. Common mistakes to avoid

Format your response in clear, easy-to-understand language. Use markdown for formatting if needed.`,

  checkSQL: (userSQL: string, correctSQL: string, question: string) => `You are a SQL code reviewer. A student has submitted their SQL solution for review.

Question:
${question}

Student's SQL:
\`\`\`sql
${userSQL}
\`\`\`

Correct SQL:
\`\`\`sql
${correctSQL}
\`\`\`

Please analyze the student's SQL and provide:
1. **Correctness**: Is the SQL correct? (Yes/No)
2. **Score**: Rate from 0-100 based on correctness and best practices
3. **Feedback**: Detailed explanation of what's right or wrong
4. **Errors**: List any syntax errors, logical errors, or incorrect results (if any)
5. **Suggestions**: How to improve the SQL (even if correct)
6. **Performance Tips**: Optimization suggestions if applicable

Format your response in markdown. Be encouraging but accurate.`,

  systemMessages: {
    sqlTutor: 'You are a helpful SQL tutor. Explain SQL concepts clearly and provide step-by-step guidance.',
    sqlReviewer: 'You are a SQL code reviewer. Provide constructive feedback on SQL code, focusing on correctness, best practices, and performance.',
  },
};


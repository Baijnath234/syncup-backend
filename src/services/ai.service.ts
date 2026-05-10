import axios from "axios";
import { azureOpenAiConfig, isAzureOpenAiConfigured } from "../config/azure";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ");

const fallbackMatch = (resumeText: string, job: { title: string; description: string; skills: string[] }) => {
  const resume = normalize(resumeText);
  const terms = [...job.skills, job.title]
    .flatMap((term) => term.split(/[,\s/]+/))
    .map((term) => normalize(term).trim())
    .filter((term) => term.length > 1);

  const uniqueTerms = Array.from(new Set(terms));
  const matched = uniqueTerms.filter((term) => resume.includes(term));
  const score = uniqueTerms.length ? Math.round((matched.length / uniqueTerms.length) * 100) : 50;

  return {
    score: Math.max(10, Math.min(100, score)),
    summary: matched.length
      ? `Matched skills: ${matched.slice(0, 8).join(", ")}.`
      : "No strong keyword match found; review manually.",
  };
};

export const aiService = {
  scoreCandidate: async (
    resumeText: string,
    job: { title: string; description: string; skills: string[] },
  ) => {
    if (!resumeText) {
      return { score: 0, summary: "No resume text available for scoring." };
    }

    if (!isAzureOpenAiConfigured()) {
      return fallbackMatch(resumeText, job);
    }

    try {
      const response = await axios.post(
        `${azureOpenAiConfig.endpoint}/openai/deployments/${azureOpenAiConfig.deployment}/chat/completions?api-version=${azureOpenAiConfig.apiVersion}`,
        {
          messages: [
            {
              role: "system",
              content:
                "Score the candidate for the job. Return compact JSON only: {\"score\": number, \"summary\": string}.",
            },
            {
              role: "user",
              content: JSON.stringify({
                job,
                resumeText: resumeText.slice(0, 12000),
              }),
            },
          ],
          temperature: 0.2,
        },
        {
          headers: {
            "api-key": azureOpenAiConfig.apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      const content = response.data?.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content);
      return {
        score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
        summary: String(parsed.summary || "AI score generated."),
      };
    } catch {
      return fallbackMatch(resumeText, job);
    }
  },
};

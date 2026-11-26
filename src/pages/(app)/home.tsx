import { useState, type FormEvent } from "react";
import { useMutations, useQuery } from "deepspace";

type PrepSession = {
  companyName: string;
  jobRole: string;
  jobDescription: string;
  questions: string[];
};

function TitleComponent() {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Interview Questions Generator
      </h1>
      <p className="mt-2 text-muted-foreground">
        Create practice questions tailored to a role.
      </p>
    </header>
  );
}

const questionTemplates = [
  {
    keywords: ["react", "javascript", "typescript"],
    question: "How have you used a front-end tool to build a feature?",
  },
  {
    keywords: ["playwright", "testing", "unit test", "xunit"],
    question: "Tell me about a test you wrote and what it helped you verify.",
  },
  {
    keywords: ["rest", "api", "json", "graphql"],
    question: "Describe how you have worked with an API or structured data.",
  },
  {
    keywords: ["accessibility", "wcag", "responsive"],
    question:
      "How do you check that a web page works for different users and devices?",
  },
  {
    keywords: ["debugging", "production", "logs", "troubleshoot"],
    question: "How would you investigate a bug reported by a user?",
  },
  {
    keywords: ["sitecore", "cms", "content model"],
    question:
      "How would you approach learning a new content management system?",
  },
];

function QuestionsGeneratorForm() {
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { records: sessions, status: sessionsStatus } = useQuery<PrepSession>(
    "prep-sessions",
    {
      orderBy: "createdAt",
      orderDir: "desc",
    },
  );

  const { createConfirmed } = useMutations<PrepSession>("prep-sessions");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!companyName.trim() || !jobRole.trim() || !jobDescription.trim()) {
      setError("Please fill in all three fields.");
      setQuestions([]);
      return;
    }

    setError("");
    setSaveMessage("");

    const description = jobDescription.toLowerCase();

    const matchedQuestions = questionTemplates
      .filter((template) =>
        template.keywords.some((keyword) => description.includes(keyword)),
      )
      .slice(0, 3)
      .map((template) => template.question);

    const generatedQuestions = [
      `What interests you about the ${jobRole} role at ${companyName}?`,
      ...(matchedQuestions.length > 0
        ? matchedQuestions
        : [
            "Which requirement in this job description would you most like to discuss?",
          ]),
      "Tell me about a time you learned something new to complete a task.",
    ].slice(0, 5);

    setQuestions(generatedQuestions);
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage("");

    try {
      await createConfirmed({
        companyName,
        jobRole,
        jobDescription,
        questions,
      });
      setSaveMessage("Prep session saved.");
    } catch {
      setSaveMessage("Could not save the prep session. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function reopenSession(session: PrepSession) {
    setCompanyName(session.companyName);
    setJobRole(session.jobRole);
    setJobDescription(session.jobDescription);
    setQuestions(session.questions);
    setError("");
    setSaveMessage("");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="companyName">Company name</label>
            <input
              id="companyName"
              name="companyName"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="block w-full rounded-md border border-input bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="jobRole">Job role</label>
            <input
              id="jobRole"
              name="jobRole"
              value={jobRole}
              onChange={(event) => setJobRole(event.target.value)}
              className="block w-full rounded-md border border-input bg-card px-3 py-2 text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="jobDescription">Job description</label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            className="block min-h-40 w-full rounded-md border border-input bg-card px-3 py-2 text-foreground"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
        >
          Generate questions
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}

      {questions.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">Practice questions</h2>
          <ul className="list-disc space-y-2 pl-5">
            {questions.map((question, index) => (
              <li key={`${index}-${question}`}>{question}</li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="mt-4 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save session"}
          </button>

          {saveMessage && (
            <p role="status" className="mt-2">
              {saveMessage}
            </p>
          )}
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Saved sessions</h2>

        {sessionsStatus === "loading" && <p>Loading saved sessions…</p>}

        {sessionsStatus === "error" && (
          <p role="alert">Could not load saved sessions.</p>
        )}

        {sessionsStatus !== "loading" &&
          sessionsStatus !== "error" &&
          sessions.length === 0 && <p>No saved sessions yet.</p>}

        <ul className="space-y-2">
          {sessions.map((session) => (
            <li key={session.recordId}>
              <button
                type="button"
                onClick={() => reopenSession(session.data)}
                className="text-primary underline"
              >
                {session.data.jobRole} at {session.data.companyName}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <TitleComponent />
      <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <QuestionsGeneratorForm />
      </section>
    </main>
  );
}

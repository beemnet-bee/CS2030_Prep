import Icon from "./Icons.jsx";
import { DataTable, Callout, CodeBlock } from "./ui.jsx";
import CodeRunner, { Expected } from "./CodeRunner.jsx";
import QuizCard from "./QuizCard.jsx";

// Renders one content section from a lecture data file.
export default function SectionRenderer({ section }) {
  if (section.kind === "note") {
    return (
      <div className="note-card">
        <h3>
          {section.icon && (
            <span className="h-icon">
              <Icon name={section.icon} size={19} />
            </span>
          )}
          {section.title}
        </h3>
        {(section.paragraphs || []).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {section.table && <div className="card-inner"><DataTable {...section.table} /></div>}
        {section.table2 && <div className="card-inner"><DataTable {...section.table2} /></div>}
        {section.code && <div className="card-inner"><CodeBlock lang={section.code.lang} code={section.code.code} /></div>}
        {section.callout && (
          <div className="card-inner">
            <Callout tone={section.callout.tone} title={section.callout.title}>
              {section.callout.text}
            </Callout>
          </div>
        )}
      </div>
    );
  }
  if (section.kind === "example") {
    return (
      <>
        <CodeRunner
          title={section.title}
          lang={section.lang}
          initialCode={section.code}
          minHeight={section.minHeight}
        />
        {section.expected && <Expected>{section.expected}</Expected>}
      </>
    );
  }
  if (section.kind === "quiz") {
    return (
      <QuizCard
        question={section.question}
        options={section.options}
        answer={section.answer}
        why={section.why}
        tag="Quick check"
      />
    );
  }
  return null;
}

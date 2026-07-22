"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `faq-panel-${index}`;
        return (
          <article className={isOpen ? "faq-item faq-item--open" : "faq-item"} key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span><small>{String(index + 1).padStart(2, "0")}</small>{item.question}</span>
                <b aria-hidden="true">{isOpen ? "−" : "+"}</b>
              </button>
            </h3>
            {isOpen && <div className="faq-item__answer" id={panelId}><p>{item.answer}</p></div>}
          </article>
        );
      })}
    </div>
  );
}

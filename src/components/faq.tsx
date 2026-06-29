"use client";

import { Plus } from "lucide-react";
import { faqCategories } from "@/content/faq";

export function FAQ() {
  return (
    <div className="faq-list">
      {faqCategories.map((category) => (
        <section className="faq-category" key={category.label}>
          <div className="faq-category-title"><span>{category.label}</span><span>{category.items.length}</span></div>
          <div className="faq-group">
            {category.items.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<Plus size={18} /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

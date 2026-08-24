export interface CategoryTopic {
  readonly id: string;
  readonly label: string;
}

interface CategoryTopicsProps {
  readonly tags: readonly CategoryTopic[];
}

export function CategoryTopics({ tags }: CategoryTopicsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="category-topics">
      <h2 id="category-topics">관련 주제</h2>
      <ul>
        {tags.map((tag) => (
          <li key={tag.id}>{tag.label}</li>
        ))}
      </ul>
    </section>
  );
}

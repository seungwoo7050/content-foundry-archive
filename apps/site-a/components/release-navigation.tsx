import type { NavigationItem } from "@content-foundry/content-contract";

interface ReleaseNavigationProps {
  readonly items: readonly NavigationItem[];
}

function NavigationItems({ items }: ReleaseNavigationProps) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <a href={item.path}>{item.label}</a>
          {item.children.length > 0 ? (
            <NavigationItems items={item.children} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ReleaseNavigation({ items }: ReleaseNavigationProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="주요 메뉴">
      <NavigationItems items={items} />
    </nav>
  );
}

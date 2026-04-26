type TabKey = 'shelf' | 'me';

export function TabBar({ cur }: { cur: TabKey }) {
  return (
    <nav className="uk-phone__tabbar" aria-label="底部导航">
      <Tab k="shelf" cur={cur} ico="☰" label="书架" />
      <Tab k="me" cur={cur} ico="⊙" label="我的" />
    </nav>
  );
}

function Tab({ k, cur, ico, label }: { k: TabKey; cur: TabKey; ico: string; label: string }) {
  return (
    <div className={`uk-phone__tab ${cur === k ? 'uk-phone__tab--cur' : ''}`}>
      <span className="uk-phone__tab__ico">{ico}</span>
      {label}
    </div>
  );
}

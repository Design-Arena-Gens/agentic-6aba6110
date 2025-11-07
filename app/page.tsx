import Diagram from '../components/Diagram';

export default function Page() {
  return (
    <main>
      <header className="header">
        <div className="h1">Microsoft Entra ID SSO & MFA: One Picture</div>
        <div className="sub">
          A comprehensive, color-coded diagram of sign-in, federation, Conditional Access, and strong authentication across SaaS, custom apps, APIs, and on-premises resources.
        </div>
      </header>
      <Diagram />
      <footer className="footer">
        Tip: Toggle layers to focus on specific integration paths. All flows and methods are represented conceptually and not exhaustive of every product nuance.
      </footer>
    </main>
  );
}

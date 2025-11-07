"use client";

import React, { useMemo, useState } from 'react';

type Node = {
  id: string;
  label: string;
  group: GroupKey;
  col: number;
  row: number;
  width?: number;
};

type Link = {
  from: string;
  to: string;
  label?: string;
  style?: 'dashed' | 'solid';
  color?: string;
};

type GroupKey =
  | 'Identities'
  | 'Trust & Sync'
  | 'Entra ID Core'
  | 'Policies & CA'
  | 'MFA Methods'
  | 'Apps & Resources';

const groupColors: Record<GroupKey, string> = {
  Identities: '#00d4ff',
  'Trust & Sync': '#26e07f',
  'Entra ID Core': '#6c7cff',
  'Policies & CA': '#ffb84d',
  'MFA Methods': '#ff5ea7',
  'Apps & Resources': '#7ce7ff',
};

const categoryDescriptions: Record<GroupKey, string> = {
  Identities: 'Users, devices, guests, and external identities',
  'Trust & Sync': 'Hybrid identity connectors and federation bridges',
  'Entra ID Core': 'Tenant, tokens, protocols, and identity platform',
  'Policies & CA': 'Conditional Access, risk, and session controls',
  'MFA Methods': 'Strong auth methods available to users',
  'Apps & Resources': 'SaaS, custom apps, APIs, and on-prem resources',
};

const allNodes: Node[] = [
  // Column 0: Identities
  { id: 'users', label: 'Users', group: 'Identities', col: 0, row: 0 },
  { id: 'guests', label: 'B2B Guests', group: 'Identities', col: 0, row: 1 },
  { id: 'consumers', label: 'B2C Consumers', group: 'Identities', col: 0, row: 2 },
  { id: 'devices', label: 'Devices (Compliant/Hybrid/Azure AD Joined)', group: 'Identities', col: 0, row: 3 },

  // Column 1: Trust & Sync (hybrid)
  { id: 'ad', label: 'On-Prem AD DS', group: 'Trust & Sync', col: 1, row: 0 },
  { id: 'ptah', label: 'PTA / PHS / Seamless SSO', group: 'Trust & Sync', col: 1, row: 1 },
  { id: 'adfs', label: 'AD FS (WS-Fed/SAML Bridge)', group: 'Trust & Sync', col: 1, row: 2 },
  { id: 'app-proxy', label: 'Azure AD App Proxy', group: 'Trust & Sync', col: 1, row: 3 },

  // Column 2: Entra ID Core
  { id: 'entra', label: 'Microsoft Entra ID Tenant', group: 'Entra ID Core', col: 2, row: 0 },
  { id: 'protocols', label: 'OIDC / OAuth2 / SAML / WS-Fed', group: 'Entra ID Core', col: 2, row: 1 },
  { id: 'tokens', label: 'ID/Access Tokens + Claims', group: 'Entra ID Core', col: 2, row: 2 },

  // Column 3: Policies & CA
  { id: 'ca', label: 'Conditional Access', group: 'Policies & CA', col: 3, row: 0 },
  { id: 'risk', label: 'Identity Protection (Risk-Based)', group: 'Policies & CA', col: 3, row: 1 },
  { id: 'sspr', label: 'SSPR / TAP / Lifecycle', group: 'Policies & CA', col: 3, row: 2 },
  { id: 'session', label: 'Session Controls (PAM, Token Lifetime)', group: 'Policies & CA', col: 3, row: 3 },

  // Column 4: MFA Methods
  { id: 'auth-app', label: 'Microsoft Authenticator (Push/Number)', group: 'MFA Methods', col: 4, row: 0 },
  { id: 'fido2', label: 'FIDO2 / Passkeys / WHfB', group: 'MFA Methods', col: 4, row: 1 },
  { id: 'sms', label: 'SMS / Voice', group: 'MFA Methods', col: 4, row: 2 },
  { id: 'totp', label: 'TOTP (OATH)', group: 'MFA Methods', col: 4, row: 3 },

  // Column 5: Apps & Resources
  { id: 'saas', label: 'SaaS Apps (Gallery)', group: 'Apps & Resources', col: 5, row: 0 },
  { id: 'web', label: 'Custom Web Apps', group: 'Apps & Resources', col: 5, row: 1 },
  { id: 'mobile', label: 'Mobile / SPA', group: 'Apps & Resources', col: 5, row: 2 },
  { id: 'api', label: 'APIs (App Roles/Scopes)', group: 'Apps & Resources', col: 5, row: 3 },
  { id: 'onprem', label: 'On-Prem Apps via App Proxy', group: 'Apps & Resources', col: 5, row: 4 },
];

const allLinks: Link[] = [
  // Identity to Entra
  { from: 'users', to: 'entra', label: 'Sign-in', color: groupColors['Entra ID Core'] },
  { from: 'guests', to: 'entra', label: 'B2B', color: groupColors['Entra ID Core'] },
  { from: 'consumers', to: 'entra', label: 'B2C (External Identities)', color: groupColors['Entra ID Core'] },
  { from: 'devices', to: 'entra', label: 'Device compliance', color: groupColors['Policies & CA'] },

  // Hybrid trust
  { from: 'ad', to: 'ptah', label: 'Sync/Trust', color: groupColors['Trust & Sync'] },
  { from: 'ptah', to: 'entra', label: 'Auth (PTA/PHS/Seamless SSO)', color: groupColors['Trust & Sync'] },
  { from: 'adfs', to: 'entra', label: 'Federation', style: 'dashed', color: groupColors['Trust & Sync'] },
  { from: 'app-proxy', to: 'entra', label: 'Publish', color: groupColors['Trust & Sync'] },
  { from: 'app-proxy', to: 'onprem', label: 'Reverse proxy', color: groupColors['Trust & Sync'] },

  // Protocols and tokens
  { from: 'entra', to: 'protocols', label: 'Protocols', color: groupColors['Entra ID Core'] },
  { from: 'protocols', to: 'tokens', label: 'Token issuance', color: groupColors['Entra ID Core'] },

  // Policies
  { from: 'ca', to: 'protocols', label: 'Enforce', color: groupColors['Policies & CA'] },
  { from: 'risk', to: 'ca', label: 'Risk signal', color: groupColors['Policies & CA'] },
  { from: 'session', to: 'tokens', label: 'Policies', color: groupColors['Policies & CA'] },

  // MFA requirement flows
  { from: 'ca', to: 'auth-app', label: 'Require', color: groupColors['MFA Methods'] },
  { from: 'ca', to: 'fido2', label: 'Require', color: groupColors['MFA Methods'] },
  { from: 'ca', to: 'sms', label: 'Require', color: groupColors['MFA Methods'] },
  { from: 'ca', to: 'totp', label: 'Require', color: groupColors['MFA Methods'] },

  // App SSO flows
  { from: 'tokens', to: 'saas', label: 'SAML/OIDC/WS-Fed', color: groupColors['Apps & Resources'] },
  { from: 'tokens', to: 'web', label: 'OIDC/OAuth2', color: groupColors['Apps & Resources'] },
  { from: 'tokens', to: 'mobile', label: 'PKCE + OIDC', color: groupColors['Apps & Resources'] },
  { from: 'tokens', to: 'api', label: 'Access tokens', color: groupColors['Apps & Resources'] },
  { from: 'protocols', to: 'onprem', label: 'SAML/WS-Fed via Proxy', style: 'dashed', color: groupColors['Apps & Resources'] },
];

const cols = 6;
const colWidth = 280;
const rowHeight = 120;
const margin = { top: 60, left: 40, right: 40, bottom: 60 };

type NodeWithLayout = Node & { x: number; y: number; width: number; height: number };

function layout(nodes: Node[]): NodeWithLayout[] {
  return nodes.map((n): NodeWithLayout => {
    const width = n.width ?? 220;
    const x = margin.left + n.col * colWidth;
    const y = margin.top + n.row * rowHeight;
    return { ...n, x, y, width, height: 56 };
  });
}

function Arrow({ x1, y1, x2, y2, color = '#9aa0d8', dashed = false, label }: { x1: number; y1: number; x2: number; y2: number; color?: string; dashed?: boolean; label?: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const endX = x2 - ux * 14;
  const endY = y2 - uy * 14;
  const midX = (x1 + endX) / 2;
  const midY = (y1 + endY) / 2;
  return (
    <g>
      <line className="link" x1={x1} y1={y1} x2={endX} y2={endY} stroke={color} strokeDasharray={dashed ? '6,6' : undefined} />
      <polygon points={`${x2},${y2} ${x2 - ux * 14 - uy * 6},${y2 - uy * 14 + ux * 6} ${x2 - ux * 14 + uy * 6},${y2 - uy * 14 - ux * 6}`} fill={color} />
      {label && (
        <g>
          <rect x={midX - 40} y={midY - 10} width={80} height={18} fill="#cfd3ff" opacity={0.15} rx={6} />
          <text x={midX} y={midY + 3} textAnchor="middle" className="badge" fill="#cfd3ff">
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

function NodeCard({ x, y, width, height, color, label, subtitle }: { x: number; y: number; width: number; height: number; color: string; label: string; subtitle?: string }) {
  return (
    <g className="node">
      <rect x={x} y={y} width={width} height={height} fill="#14183a" stroke={color} />
      <rect x={x} y={y} width={6} height={height} fill={color} />
      <text x={x + 16} y={y + 22} fontWeight={700} style={{ fontSize: 13 }}>
        {label}
      </text>
      {subtitle && (
        <text x={x + 16} y={y + 40} style={{ fill: '#b8bdf0' }}>
          {subtitle}
        </text>
      )}
    </g>
  );
}

export default function Diagram() {
  const [enabledGroups, setEnabledGroups] = useState<Record<GroupKey, boolean>>({
    Identities: true,
    'Trust & Sync': true,
    'Entra ID Core': true,
    'Policies & CA': true,
    'MFA Methods': true,
    'Apps & Resources': true,
  });

  const nodes = useMemo<NodeWithLayout[]>(() => layout(allNodes), []);

  const nodeById = useMemo(() => {
    const map = new Map<string, NodeWithLayout>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const filteredNodes: NodeWithLayout[] = nodes.filter((n) => enabledGroups[n.group]);
  const filteredIds = new Set(filteredNodes.map((n) => n.id));
  const links = allLinks.filter((l) => filteredIds.has(l.from) && filteredIds.has(l.to));

  const width = margin.left + margin.right + (cols - 1) * colWidth + 260;
  const maxRow = Math.max(...nodes.map((n) => n.row));
  const height = margin.top + margin.bottom + (maxRow + 2) * rowHeight;

  return (
    <div className="container">
      <aside className="panel sidebar">
        <div className="legendTitle">Layers</div>
        <div className="legendGrid">
          {(Object.keys(groupColors) as GroupKey[]).map((g) => (
            <button
              key={g}
              className="legendBtn"
              onClick={() => setEnabledGroups((s) => ({ ...s, [g]: !s[g] }))}
              aria-pressed={enabledGroups[g]}
              title={categoryDescriptions[g]}
            >
              <span className="legendDot" style={{ background: groupColors[g], opacity: enabledGroups[g] ? 1 : 0.35 }} />
              <span className="legendLabel">{g}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 16 }} className="legendTitle">
          Scenarios covered
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, color: '#c7ccff', lineHeight: 1.5 }}>
          <li>SSO to SaaS (SAML, OIDC, WS-Fed)</li>
          <li>Custom web, SPA, mobile with PKCE</li>
          <li>API access with scopes/roles</li>
          <li>Hybrid identity (PTA/PHS/Seamless SSO)</li>
          <li>Federation via AD FS</li>
          <li>On-prem apps via App Proxy</li>
          <li>Conditional Access & Risk-based MFA</li>
          <li>MFA methods: Auth App, FIDO2/Passkeys, SMS/Voice, TOTP</li>
        </ul>
      </aside>

      <section className="panel canvas">
        <svg width={width} height={height} role="img" aria-label="Microsoft Entra ID SSO and MFA integration diagram">
          {/* Column titles */}
          {(Object.keys(groupColors) as GroupKey[]).map((g, i) => (
            <text key={g} className="groupTitle" x={margin.left + i * colWidth} y={28}>
              {g}
            </text>
          ))}

          {/* Links */}
          {links.map((l, idx) => {
            const a = nodeById.get(l.from)!;
            const b = nodeById.get(l.to)!;
            const x1 = a.x + (a.width ?? 220);
            const y1 = a.y + (a.height ?? 56) / 2;
            const x2 = b.x;
            const y2 = b.y + (b.height ?? 56) / 2;
            return (
              <Arrow key={idx} x1={x1} y1={y1} x2={x2} y2={y2} color={l.color} dashed={l.style === 'dashed'} label={l.label} />
            );
          })}

          {/* Nodes */}
          {filteredNodes.map((n) => (
            <NodeCard key={n.id} x={n.x} y={n.y} width={n.width} height={n.height} color={groupColors[n.group]} label={n.label} />
          ))}
        </svg>
      </section>
    </div>
  );
}

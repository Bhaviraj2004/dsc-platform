'use client';

import { useEffect, useState } from 'react';
import { Users, Key, FileText, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/lib/store/auth.store';

type Stats = {
  total: number;
  pending: number;
  completed: number;
  inProgress: number;
};

type ExpiringToken = {
  id: number;
  tokenBrand: string;
  expiryDate: string;
  client: { fullName: string; pan: string; phone: string };
};

type Client = {
  id: number;
  fullName: string;
  pan: string;
  phone: string;
  dscTokens: any[];
  filings: any[];
};

export default function CADashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [expiringTokens, setExpiringTokens] = useState<ExpiringToken[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, tokensRes, clientsRes] = await Promise.all([
          api.get('/filings/stats').catch((e) => {
            if (e.response?.status === 404) setProfileMissing(true);
            return { data: null };
          }),
          api.get('/dsc-tokens/expiring-soon').catch(() => ({ data: [] })),
          api.get('/clients').catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setExpiringTokens(tokensRes.data);
        setClients(clientsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const daysUntil = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ fontSize: 13, color: '#aaa' }}>Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Clients',
      value: clients.length,
      sub: 'Active clients',
      color: '#111',
    },
    {
      icon: FileText,
      label: 'Total Filings',
      value: stats?.total ?? 0,
      sub: `${stats?.inProgress ?? 0} in progress`,
      color: '#111',
    },
    {
      icon: TrendingUp,
      label: 'Completed',
      value: stats?.completed ?? 0,
      sub: 'Filings done',
      color: '#111',
    },
    {
      icon: Clock,
      label: 'Pending',
      value: stats?.pending ?? 0,
      sub: 'Awaiting action',
      color: '#111',
    },
  ];

  return (
    <div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', letterSpacing: '-0.6px', marginBottom: 6 }}>
          Good morning, {user?.email?.split('@')[0]} 👋
        </h1>
        <p style={{ fontSize: 14, color: '#999' }}>
          Here's what's happening with your clients today.
        </p>
      </div>

      {/* CA Profile Missing Banner */}
      {profileMissing && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
              ⚠️ Complete your CA profile to get started
            </p>
            <p style={{ fontSize: 13, color: '#b45309' }}>
              You need to set up your firm profile before you can manage clients, filings, and DSC tokens.
            </p>
          </div>
          <a
            href="/ca/profile"
            style={{
              fontSize: 13, fontWeight: 600,
              color: '#fff', background: '#d97706',
              borderRadius: 8, padding: '8px 16px',
              textDecoration: 'none', whiteSpace: 'nowrap',
              marginLeft: 16,
            }}
          >
            Set up profile →
          </a>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: '#fff',
            border: '1px solid #ececec',
            borderRadius: 14,
            padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#999' }}>{card.label}</span>
              <div style={{
                width: 32, height: 32,
                background: '#f4f4f4',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <card.icon size={15} color="#666" />
              </div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#111', letterSpacing: '-1px', marginBottom: 4 }}>
              {card.value}
            </p>
            <p style={{ fontSize: 12, color: '#bbb' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Expiring Tokens */}
        <div style={{
          background: '#fff',
          border: '1px solid #ececec',
          borderRadius: 14,
          padding: '22px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 3 }}>
                DSC Expiring Soon
              </h3>
              <p style={{ fontSize: 12, color: '#aaa' }}>Tokens expiring in 30 days</p>
            </div>
            <div style={{
              width: 32, height: 32, background: '#fff8f0',
              border: '1px solid #fed7aa',
              borderRadius: 8, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={15} color="#f97316" />
            </div>
          </div>

          {expiringTokens.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 0',
              fontSize: 13, color: '#bbb',
            }}>
              ✅ No tokens expiring soon
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {expiringTokens.map((token) => {
                const days = daysUntil(token.expiryDate);
                return (
                  <div key={token.id} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: '#fafafa',
                    border: '1px solid #f0f0f0',
                    borderRadius: 10,
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>
                        {token.client.fullName}
                      </p>
                      <p style={{ fontSize: 11, color: '#aaa' }}>{token.tokenBrand}</p>
                    </div>
                    <div style={{
                      background: days <= 7 ? '#fff0f0' : '#fff8f0',
                      border: `1px solid ${days <= 7 ? '#fecaca' : '#fed7aa'}`,
                      borderRadius: 8, padding: '4px 10px',
                      fontSize: 11, fontWeight: 600,
                      color: days <= 7 ? '#dc2626' : '#f97316',
                    }}>
                      {days}d left
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div style={{
          background: '#fff',
          border: '1px solid #ececec',
          borderRadius: 14,
          padding: '22px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 3 }}>
                Recent Clients
              </h3>
              <p style={{ fontSize: 12, color: '#aaa' }}>Latest added clients</p>
            </div>
            <a href="/ca/clients" style={{
              fontSize: 12, fontWeight: 500, color: '#888',
              textDecoration: 'none', padding: '5px 10px',
              border: '1px solid #ececec', borderRadius: 7,
            }}>
              View all
            </a>
          </div>

          {clients.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 0',
              fontSize: 13, color: '#bbb',
            }}>
              No clients added yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 34, height: 34,
                      background: '#f0f0f0',
                      borderRadius: 50,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#666',
                    }}>
                      {client.fullName[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>
                        {client.fullName}
                      </p>
                      <p style={{ fontSize: 11, color: '#aaa' }}>{client.pan}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{
                      fontSize: 11, color: '#888',
                      background: '#f4f4f4', borderRadius: 6,
                      padding: '3px 8px', fontWeight: 500,
                    }}>
                      {client.filings.length} filings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
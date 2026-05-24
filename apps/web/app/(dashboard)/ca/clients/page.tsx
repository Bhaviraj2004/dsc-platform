'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Phone, FileText, Key, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api/axios';

const clientSchema = z.object({
  fullName: z.string().min(2, 'Name required'),
  pan: z.string().regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, 'Invalid PAN format eg. ABCDE1234F').transform(v => v.toUpperCase()),
  aadhaar: z.string().regex(/^[0-9]{12}$/, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
  gst: z.string().optional().or(z.literal('')),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().min(10, 'Address required'),
});

type ClientForm = z.infer<typeof clientSchema>;

type Client = {
  id: number;
  fullName: string;
  pan: string;
  phone: string;
  gst: string | null;
  aadhaar: string | null;
  address: string;
  filings: any[];
  dscTokens: any[];
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const onSubmit = async (data: ClientForm) => {
    try {
      setAdding(true);
      setError('');
      await api.post('/clients', data);
      await fetchClients();
      setShowModal(false);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add client');
    } finally {
      setAdding(false);
    }
  };

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.pan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.5px', marginBottom: 4 }}>
            Clients
          </h1>
          <p style={{ fontSize: 13, color: '#999' }}>{clients.length} total clients</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          style={{ height: 38, background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 9, gap: 6 }}
        >
          <Plus size={15} /> Add Client
        </Button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <Search size={14} color="#bbb" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <Input
          placeholder="Search by name or PAN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 34, height: 38, fontSize: 13, borderColor: '#e4e4e4', borderRadius: 9 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 14, overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
          padding: '12px 20px', borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
        }}>
          {['Client', 'PAN', 'Phone', 'Filings', 'DSC Tokens'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: '#bbb' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#bbb', marginBottom: 8 }}>No clients found</p>
            <p style={{ fontSize: 12, color: '#ddd' }}>Add your first client to get started</p>
          </div>
        ) : (
          filtered.map((client, i) => (
            <div key={client.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid #f8f8f8' : 'none',
              alignItems: 'center',
              transition: 'background 0.1s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#fafafa'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              {/* Client name + avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, background: '#f0f0f0',
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#666', flexShrink: 0,
                }}>
                  {client.fullName[0]}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{client.fullName}</p>
                  <p style={{ fontSize: 11, color: '#bbb' }}>{client.gst || 'No GST'}</p>
                </div>
              </div>

              {/* PAN */}
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#555', fontWeight: 600 }}>
                {client.pan}
              </span>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Phone size={12} color="#bbb" />
                <span style={{ fontSize: 12, color: '#666' }}>{client.phone}</span>
              </div>

              {/* Filings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <FileText size={12} color="#bbb" />
                <span style={{ fontSize: 12, color: '#666' }}>{client.filings.length}</span>
              </div>

              {/* DSC Tokens */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Key size={12} color="#bbb" />
                <span style={{ fontSize: 12, color: '#666' }}>{client.dscTokens.length}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 18,
            padding: '32px', width: '100%', maxWidth: 480,
            boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: '-0.4px' }}>Add Client</h2>
                <p style={{ fontSize: 13, color: '#aaa', marginTop: 3 }}>Fill in client details</p>
              </div>
              <button
                onClick={() => { setShowModal(false); reset(); setError(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{
                background: '#fff5f5', border: '1px solid #fecaca',
                borderRadius: 9, padding: '10px 14px',
                fontSize: 13, color: '#dc2626', marginBottom: 18,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { id: 'fullName', label: 'Full Name', placeholder: 'Ramesh Gupta', type: 'text' },
                { id: 'pan', label: 'PAN Number', placeholder: 'ABCDE1234F', type: 'text' },
                { id: 'phone', label: 'Phone', placeholder: '9876543210', type: 'text' },
                { id: 'aadhaar', label: 'Aadhaar (optional)', placeholder: '123456789012', type: 'text' },
                { id: 'gst', label: 'GST Number (optional)', placeholder: '29ABCDE1234F1Z5', type: 'text' },
                { id: 'address', label: 'Address', placeholder: '123 MG Road, Jaipur', type: 'text' },
              ].map((field) => (
                <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Label htmlFor={field.id} style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    style={{ height: 40, fontSize: 13, borderColor: '#e4e4e4', borderRadius: 9 }}
                    {...register(field.id as keyof ClientForm)}
                  />
                  {errors[field.id as keyof ClientForm] && (
                    <p style={{ fontSize: 11, color: '#dc2626' }}>
                      {errors[field.id as keyof ClientForm]?.message}
                    </p>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Button
                  type="button"
                  onClick={() => { setShowModal(false); reset(); setError(''); }}
                  style={{ flex: 1, height: 40, background: '#f4f4f4', color: '#666', fontSize: 13, borderRadius: 9, border: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adding}
                  style={{ flex: 1, height: 40, background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 9 }}
                >
                  {adding ? 'Adding...' : 'Add Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
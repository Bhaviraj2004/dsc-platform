'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api/axios';

const profileSchema = z.object({
  firmName: z.string().min(2, 'Firm name must be at least 2 characters'),
  licenseNumber: z.string().min(3, 'License number must be at least 3 characters'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function CaProfilePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      setLoading(true);
      setError('');
      await api.post('/ca/profile', data);
      router.push('/ca');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.5px', marginBottom: 4 }}>
          Set up your CA Profile
        </h1>
        <p style={{ fontSize: 13, color: '#999' }}>
          This information is required to start managing your clients.
        </p>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #ececec',
        borderRadius: 16,
        padding: '32px',
        maxWidth: 480,
      }}>
        {error && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fecaca',
            borderRadius: 9,
            padding: '10px 14px',
            fontSize: 13,
            color: '#dc2626',
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { id: 'firmName', label: 'Firm Name', placeholder: 'Sharma & Associates' },
            { id: 'licenseNumber', label: 'License / Membership Number', placeholder: 'ICA123456' },
            { id: 'phone', label: 'Phone', placeholder: '9876543210' },
            { id: 'address', label: 'Office Address', placeholder: '123 MG Road, Jaipur, Rajasthan' },
          ].map((field) => (
            <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label
                htmlFor={field.id}
                style={{ fontSize: 12, fontWeight: 500, color: '#555' }}
              >
                {field.label}
              </Label>
              <Input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                style={{ height: 40, fontSize: 13, borderColor: '#e4e4e4', borderRadius: 9 }}
                {...register(field.id as keyof ProfileForm)}
              />
              {errors[field.id as keyof ProfileForm] && (
                <p style={{ fontSize: 11, color: '#dc2626' }}>
                  {errors[field.id as keyof ProfileForm]?.message}
                </p>
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={loading}
            style={{
              height: 42,
              background: '#111',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              marginTop: 8,
            }}
          >
            {loading ? 'Creating profile...' : 'Create Profile →'}
          </Button>
        </form>
      </div>
    </div>
  );
}

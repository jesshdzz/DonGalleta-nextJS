import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = {
  title: 'Nueva contraseña – DonGalleta',
  description: 'Establece una nueva contraseña para tu cuenta de DonGalleta.',
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ResetTokenPage({ params }: Props) {
  const { token } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}

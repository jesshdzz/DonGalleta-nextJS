import { ResetRequestForm } from '@/components/auth/reset-request-form';

export const metadata = {
  title: 'Olvidé mi contraseña – DonGalleta',
  description: 'Restablece tu contraseña ingresando tu correo electrónico.',
};

export default function ResetPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <ResetRequestForm />
      </div>
    </div>
  );
}

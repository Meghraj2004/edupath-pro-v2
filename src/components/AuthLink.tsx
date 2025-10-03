'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface AuthLinkProps {
  href: string;
  children: ReactNode;
  requireAuth?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function AuthLink({ 
  href, 
  children, 
  requireAuth = false, 
  className = '',
  onClick 
}: AuthLinkProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }

    if (requireAuth && !user) {
      e.preventDefault();
      // Simple redirect to login without complex redirect logic
      router.push('/auth/login');
      return;
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
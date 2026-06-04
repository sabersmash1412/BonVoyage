'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoginButton from './LoginLogoutButton';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Prevent SSR mismatches

  const hideAuthButtons = ['/login', '/signup', '/logout', '/reset-password', '/forgot-password', '/check-email', '/error'].includes(pathname || '');

  const paths = [
    { name: 'My itineraries', url: '/trips' },
    { name: 'Plan', url: '/plan' },
    { name: 'Community', url: '/community' },
  ];

  return (
    <>
      {!hideAuthButtons && (
        <header className="flex flex-row flex-center justify-between items-center px-4
                          h-[5vh] sm:h-[6vh] md:h-[7vh] lg:h-[7vh]
        ">
          <div className="flex flex-row items-center gap-10">
            <Link href="/trips">
              <Image
                src="/BonVoyage_logo.svg"
                alt="BonVoyage Logo"
                width={100}
                height={100}
              />
            </Link>
            <div className="flex gap-4">
              {paths.map((p, index) => (
                <Link key={index} href={p.url}>
                  <h2 className="font-medium text-xl">{p.name}</h2>
                </Link>
              ))}
            </div>
          </div>
          <LoginButton />
        </header>
      )}
    </>
  );
}

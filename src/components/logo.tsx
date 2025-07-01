import React from 'react';
import Image from 'next/image';
import finlogo from '../assets/finlogo.svg';

export function Logo() {
  return (
    <div className="flex h-14 items-center justify-center gap-3">
        <Image src={finlogo} alt="Logo" height={40} />
    </div>
  );
}

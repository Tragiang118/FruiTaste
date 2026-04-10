'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
}

export default function BackButton({ className, variant = "ghost" }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      onClick={() => router.back()}
      className={cn("flex items-center text-gray-500 hover:text-gray-900", className)}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Quay lại
    </Button>
  );
}
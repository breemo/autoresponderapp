import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login'); // يرسل المستخدم مباشرة لصفحة تسجيل الدخول
}


//'use client';
//import { useEffect } from 'react';
//import { useRouter } from 'next/navigation';

//export default function Home() {
//  const router = useRouter();
//  useEffect(() => { router.replace('/login'); }, [router]);
//  return null;
//}

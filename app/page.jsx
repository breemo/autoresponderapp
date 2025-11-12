import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login'); // يرسل المستخدم مباشرة لصفحة تسجيل الدخول
}

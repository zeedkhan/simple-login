import { auth } from '@/auth';
import Banner from '@/components/banner';
import Header from '@/components/header';


export default async function Home() {
  const session = await auth();

  return (
    <>
      <Header />
      <Banner />
      <section className='bg-ct-blue-600 min-h-screen pt-20'>
        <div className='max-w-4xl mx-auto bg-ct-dark-100 rounded-md h-[20rem] flex justify-center items-center'>
          <p className='text-3xl font-semibold'>
            Welcome {session?.user?.name || 'to the app'}
          </p>
        </div>
      </section>
    </>
  );
}
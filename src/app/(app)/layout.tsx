import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Banner } from '@/components/ui/banner'
import { BottomTabsWrapper } from '@/components/ui/bottom-tabs-wrapper'
import { BannerProviderClient } from '@/components/ui/banner-provider'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <BannerProviderClient>
      <div className="mx-auto min-h-screen max-w-[430px] bg-white">
        <Banner />
        <main className="pb-16">{children}</main>
        <BottomTabsWrapper />
      </div>
    </BannerProviderClient>
  )
}

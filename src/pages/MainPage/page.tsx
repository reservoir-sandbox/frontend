import banner from '@/assets/banner.jpg'
import FileUpload from '@/components/FileUpload/component'
import {
  Card,
  CardContent
} from "@/components/ui/card"

export default function MainPage() {
  return (
    <div className='flex flex-col min-h-[calc(100vh-70px)] gap-3'>
      <div className='bg-white rounded-2xl w-full shrink-0 h-32 sm:h-40 md:h-48 lg:h-40 2xl:h-100'>
        <img
          src={banner}
          className='w-full h-full object-contain'
          alt="banner"
        />
      </div>
      <Card className='flex-1 min-h-0 justify-center'>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-10 lg:flex-row lg:items-center min-w-0 h-full min-h-0'>
            <div className='w-full text-center md:max-w-max lg:max-w-89 2xl:max-w-120 flex items-center justify-center shrink-0'>
              <div>
                <div className='text-6xl font-bold'>
                  Welcome to Reservoir Sandbox
                </div>
                <div className='pt-4 text-sm'>
                  Get started by uploading your Linux binaries for analysis. Our sandbox environment will securely process and evaluate your files, providing detailed insights and results.
                </div>
              </div>
            </div>

            <div className='flex-1 flex flex-col min-h-0 min-w-0 items-center justify-center h-full'>
              <FileUpload className='w-full h-full min-w-0' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
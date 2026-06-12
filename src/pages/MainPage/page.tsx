import banner from '@/assets/banner.jpg'
import FileUpload from '@/components/FileUpload/component'
import {
  Card,
  CardContent
} from "@/components/ui/card"

export default function MainPage() {
  return (
    <>
      <div className='bg-white rounded-2xl mb-3 w-full h-48 sm:h-56 md:h-64 lg:h-60 2xl:h-112'>
        <img
          src={banner}
          className='w-full h-full object-contain'
          alt="banner"
        />
      </div>
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-10 lg:flex-row lg:items-center'>
            <div className='w-full text-center md:max-w-max lg:max-w-89 2xl:max-w-120 flex items-center justify-center'>
              <div>
                <div className='text-6xl font-bold'>
                  Welcome to Reservoir Sandbox
                </div>
                <div className='pt-4 text-sm'>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry...
                </div>
              </div>
            </div>

            <div className='flex-1 flex flex-col min-h-96 items-center justify-center'>
              <FileUpload className='w-full' />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
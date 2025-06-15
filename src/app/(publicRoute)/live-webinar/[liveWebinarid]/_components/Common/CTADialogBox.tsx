import { createCheckoutLink } from '@/actions/stripe'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { WebinarWithPresenter } from '@/lib/type'
import { ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
  trigger?: React.ReactNode,
  webinar: WebinarWithPresenter
  userId: string,
}

const CTADialogBox = ({ open, onOpenChange, trigger, webinar, userId }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  const handleClick = async () => {
    setLoading(true)
    try {
      if (webinar.ctaType === 'BOOK_A_CALL') {
        router.push(`/live-webinar/${webinar.id}/call?attendeeId=${userId}`)

      } else {
        if (!webinar.priceId || !webinar.presenter.stripeConnectId) {
          return toast.error('No priceId or stripeConnectId found')
        }
        const session = await createCheckoutLink(
          webinar.priceId,
          webinar.presenter.stripeConnectId,
          userId,
          webinar.id,
          true
        )
        if (!session.sessionUrl) {
          return toast.error('No sessionId found')

        }
        window.open(session.sessionUrl, '_blank')
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }

  }
  return <Dialog
    open={open}
    onOpenChange={onOpenChange}
  >
    {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
    <DialogContent className='sm:max-w-md bg-card text-card-foreground border-border'>
      <DialogHeader>
        <DialogTitle className='text-lg font-medium'>
          {webinar.ctaType === 'BOOK_A_CALL' ? 'Book a call' : 'Buy Now'}
        </DialogTitle>

        <p className='text-sm text-muted-foreground mt-1'>
          {webinar.ctaType === 'BOOK_A_CALL' ? "You'll be redirected to a another call on another page" : 'You will be redirected to the checkout'}
        </p>
      </DialogHeader>

      <div className="flex mt-4 space-x-4">
        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-backgournd flex items-center justify-center">
            <Play />
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h3 className='text-sm font-medium '>{webinar.title}</h3>
        <p className='text-xs text-muted-foreground mt-1'>
          {webinar.description}
        </p>
      </div>


      <DialogFooter className='flex w-full justify-between items-center mt-4 sm:mt-0'>
        <DialogClose>
          <Button variant={'outline'}>
            Close
          </Button>
        </DialogClose>
        <Button
          onClick={handleClick}
          disabled={loading}
          className='flex items-center'
        >
          {loading ? (
            <>
              <Loader2 className='animate-spin mr-2 h-4 w-4' />
              Loading...
            </>
          ) : webinar.ctaType === 'BOOK_A_CALL' ? (
            'Join Break-room'
          ) : (
            'Buy Now'
          )}{' '}
          <ChevronRight className='h-4 w-4' />
        </Button>
      </DialogFooter>

    </DialogContent>
  </Dialog>

}

export default CTADialogBox




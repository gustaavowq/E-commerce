import { CheckoutFlow } from './CheckoutFlow'

export const metadata = { title: 'Checkout' }
export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  return (
    <div className="container-app py-6 sm:py-10">
      <CheckoutFlow />
    </div>
  )
}

import { OrderView } from './OrderView'

export const metadata = { title: 'Pedido' }
export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

export default function OrderPage({ params }: Props) {
  return (
    <div className="container-app py-6 sm:py-10">
      <OrderView id={params.id} />
    </div>
  )
}

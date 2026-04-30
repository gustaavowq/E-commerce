interface PdpMapProps {
  lat: number
  lng: number
  titulo: string
}

export function PdpMap({ lat, lng, titulo }: PdpMapProps) {
  // Embed do Google Maps sem API key (público). Lat/lng aproximados (área verde)
  // por privacidade, alinhado com decisão do projeto.
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=14&output=embed`

  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-hero md:aspect-cinemascope w-full border border-bone bg-bone">
        <iframe
          src={src}
          title={`Mapa de ${titulo}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0"
        />
      </div>
      <p className="text-caption text-ash">
        Localização aproximada por privacidade. Endereço completo é compartilhado com
        interessados qualificados pelo corretor.
      </p>
    </div>
  )
}

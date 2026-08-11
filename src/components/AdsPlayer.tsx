import React from 'react'

export default function AdsPlayer({ src }: { src: string }) {
  if (!src) return null
  return (
    <div className="my-4">
      <video src={src} muted autoPlay playsInline width="100%" />
    </div>
  )
}

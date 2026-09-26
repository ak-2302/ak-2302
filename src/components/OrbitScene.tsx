import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls } from '@react-three/drei'
import type { Mesh } from 'three'

function Probe() {
  const mesh = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.x += delta * 0.16
    mesh.current.rotation.y += delta * 0.28
  })

  return (
    <Float speed={1.25} rotationIntensity={0.35} floatIntensity={0.5}>
      <mesh ref={mesh} rotation={[0.3, 0.4, 0.2]}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial color="#ef7358" roughness={0.32} metalness={0.15} wireframe />
      </mesh>
    </Float>
  )
}

export default function OrbitScene() {
  return (
    <Canvas
      className="orbit-canvas"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.2], fov: 36 }}
      fallback={<div className="orbit-canvas-fallback" aria-hidden="true" />}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      aria-label="ゆっくり回転する観測オブジェクト"
    >
      <ambientLight intensity={1.3} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <Suspense fallback={null}>
        <Probe />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} enableDamping dampingFactor={0.08} />
    </Canvas>
  )
}

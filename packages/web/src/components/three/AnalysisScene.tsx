'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import {
  AWAY_PLAYERS,
  COLORS,
  HOME_PLAYERS,
  PASS_EDGES,
  PASS_SEQUENCE,
  PITCH,
  PLAYERS,
  XG_EVENTS,
  ballState,
  playerPosition,
  type Player,
} from '@/lib/match-data'
import { createPitchTexture } from './pitch'

type NumRef = { current: number }

interface SceneProps {
  lite?: boolean
  scrollRef?: NumRef
}

const scratch = new THREE.Vector3()
const scratchTarget = new THREE.Vector3(0, 2.2, 6)
const PLAYER_BY_ID = new Map<number, Player>(PLAYERS.map((p) => [p.id, p]))

function Pitch() {
  const texture = useMemo(() => createPitchTexture(), [])
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texture, roughness: 0.94, metalness: 0.0 }),
    [texture],
  )
  useEffect(
    () => () => {
      texture.dispose()
      material.dispose()
    },
    [texture, material],
  )
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={material} receiveShadow>
      <planeGeometry args={[PITCH.width, PITCH.length]} />
    </mesh>
  )
}

function TeamInstances({ players, color }: { players: Player[]; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => new THREE.CapsuleGeometry(0.45, 1.0, 6, 12), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color).multiplyScalar(0.35),
        roughness: 0.35,
        metalness: 0.15,
      }),
    [color],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
    },
    [geo, mat],
  )

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    const t = clock.elapsedTime
    for (let i = 0; i < players.length; i++) {
      const p = players[i]
      const [x, y, z] = playerPosition(p, t)
      dummy.position.set(x, y, z)
      dummy.rotation.set(0, Math.sin(t * 0.5 + p.id) * 0.5, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[geo, mat, players.length]} />
}

function PassNetwork({ lite }: { lite: boolean }) {
  const { geometry, material, activeLine, activeGeometry, activeMaterial } = useMemo(() => {
    const n = PASS_EDGES.length
    const pos = new Float32Array(n * 6)
    const col = new Float32Array(n * 6)
    PASS_EDGES.forEach((e, i) => {
      const c = 0.2 + e.weight * 0.8
      col.set([c, c, c], i * 6)
      col.set([c, c, c], i * 6 + 3)
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))

    const m = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const ag = new THREE.BufferGeometry()
    ag.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    const am = new THREE.LineBasicMaterial({
      color: new THREE.Color(COLORS.accent),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const al = new THREE.Line(ag, am)
    al.frustumCulled = false

    return { geometry: g, material: m, activeLine: al, activeGeometry: ag, activeMaterial: am }
  }, [])

  const segments = useMemo(() => {
    const s = new THREE.LineSegments(geometry, material)
    s.frustumCulled = false
    return s
  }, [geometry, material])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      activeGeometry.dispose()
      activeMaterial.dispose()
    },
    [geometry, material, activeGeometry, activeMaterial],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const arr = geometry.attributes.position.array as Float32Array
    for (let i = 0; i < PASS_EDGES.length; i++) {
      const e = PASS_EDGES[i]
      const a = playerPosition(PLAYER_BY_ID.get(e.a)!, t)
      const b = playerPosition(PLAYER_BY_ID.get(e.b)!, t)
      arr.set([a[0], 1.0, a[2], b[0], 1.0, b[2]], i * 6)
    }
    geometry.attributes.position.needsUpdate = true

    const state = ballState(t)
    const step = state.step
    const from = playerPosition(PLAYER_BY_ID.get(step.from)!, t)
    const to = playerPosition(PLAYER_BY_ID.get(step.to)!, t)
    const aa = activeGeometry.attributes.position.array as Float32Array
    aa.set([from[0], 1.05, from[2], to[0], 1.05, to[2]])
    activeGeometry.attributes.position.needsUpdate = true
    activeLine.visible = !lite
  })

  return (
    <>
      <primitive object={segments} />
      <primitive object={activeLine} />
    </>
  )
}

function Ball({ trail = true }: { trail?: boolean }) {
  const ballRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const trailRef = useRef<THREE.Line>(null)
  const COUNT = 42

  const { trailGeo, trailMat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3))
    const m = new THREE.LineBasicMaterial({
      color: new THREE.Color(COLORS.accent),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { trailGeo: g, trailMat: m }
  }, [])

  const history = useMemo(() => new Float32Array(COUNT * 3), [])
  const cursor = useRef(0)
  const ballMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLORS.ball, emissive: new THREE.Color(COLORS.ball).multiplyScalar(0.4), roughness: 0.3, metalness: 0.1 }),
    [],
  )

  useEffect(
    () => () => {
      trailGeo.dispose()
      trailMat.dispose()
      ballMat.dispose()
    },
    [trailGeo, trailMat, ballMat],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const s = ballState(t)
    if (ballRef.current) ballRef.current.position.set(s.x, s.y, s.z)
    if (lightRef.current) lightRef.current.position.set(s.x, s.y + 0.4, s.z)

    const c = cursor.current
    history[c * 3] = s.x
    history[c * 3 + 1] = s.y
    history[c * 3 + 2] = s.z
    cursor.current = (c + 1) % COUNT

    if (trail) {
      const arr = trailGeo.attributes.position.array as Float32Array
      for (let i = 0; i < COUNT; i++) {
        const idx = (cursor.current + i) % COUNT
        arr[i * 3] = history[idx * 3]
        arr[i * 3 + 1] = history[idx * 3 + 1]
        arr[i * 3 + 2] = history[idx * 3 + 2]
      }
      trailGeo.attributes.position.needsUpdate = true
      if (trailRef.current) trailRef.current.visible = true
    }
  })

  return (
    <>
      <mesh ref={ballRef} material={ballMat}>
        <sphereGeometry args={[0.36, 20, 20]} />
      </mesh>
      <pointLight ref={lightRef} color="#FFE3B0" intensity={18} distance={22} decay={2} />
      {trail && <primitive ref={trailRef} object={new THREE.Line(trailGeo, trailMat)} />}
    </>
  )
}

function Crowd({ lite }: { lite: boolean }) {
  const count = lite ? 900 : 2600
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const phase = new Float32Array(count)
    const team = new Float32Array(count)
    const halfW = PITCH.halfWidth + 8
    const halfL = PITCH.halfLength + 8
    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4)
      const t = Math.random()
      const ring = 0.55 + Math.random() * 0.45
      const rx = (halfW + ring * 13) * (1 + ring * 0.25)
      const rz = (halfL + ring * 13) * (1 + ring * 0.25)
      let x = 0
      let z = 0
      if (side === 0) {
        x = -rx
        z = (t * 2 - 1) * rz
      } else if (side === 1) {
        x = rx
        z = (t * 2 - 1) * rz
      } else if (side === 2) {
        x = (t * 2 - 1) * rx
        z = -rz
      } else {
        x = (t * 2 - 1) * rx
        z = rz
      }
      const y = 3 + ring * 17 + Math.random() * 1.6
      pos[i * 3] = x + (Math.random() - 0.5) * 2.4
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * 2.4
      phase[i] = Math.random()
      const r = Math.random()
      team[i] = r < 0.42 ? 0 : r < 0.84 ? 1 : 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aTeam', new THREE.BufferAttribute(team, 1))

    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uHome: { value: new THREE.Color(COLORS.home) },
        uAway: { value: new THREE.Color(COLORS.away) },
        uAccent: { value: new THREE.Color(COLORS.accent) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float aPhase;
        attribute float aTeam;
        varying float vTwinkle;
        varying float vTeam;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vTwinkle = 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * 2.0 + aPhase * 6.2831), 2.0);
          vTeam = aTeam;
          gl_PointSize = (5.0 + 6.0 * vTwinkle) * uPixelRatio * (26.0 / max(1.0, -mv.z));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uHome;
        uniform vec3 uAway;
        uniform vec3 uAccent;
        varying float vTwinkle;
        varying float vTeam;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float alpha = smoothstep(0.5, 0.05, d) * vTwinkle;
          vec3 col = vTeam < 0.5 ? uHome : (vTeam < 1.5 ? uAway : uAccent);
          gl_FragColor = vec4(col, alpha * 0.9);
        }
      `,
    })
    return { geometry: g, material: m }
  }, [count])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime
  })

  const points = useMemo(() => {
    const p = new THREE.Points(geometry, material)
    p.frustumCulled = false
    return p
  }, [geometry, material])

  return <primitive object={points} />
}

function Floodlights({ lite }: { lite: boolean }) {
  const rigs = useMemo(
    () => [
      [-44, -62],
      [44, -62],
      [-44, 62],
      [44, 62],
    ] as Array<[number, number]>,
    [],
  )

  const mastGeo = useMemo(() => new THREE.CylinderGeometry(0.35, 0.5, 30, 8), [])
  const headGeo = useMemo(() => new THREE.BoxGeometry(6, 2.4, 1.4), [])
  const mastMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#161A22', roughness: 0.7, metalness: 0.5 }), [])
  const headMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#FFF2D0', emissive: new THREE.Color('#FFF2D0'), emissiveIntensity: 2.2, roughness: 0.4 }),
    [],
  )
  const coneGeo = useMemo(() => new THREE.ConeGeometry(17, 30, 24, 1, true), [])
  const coneMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#FFF0C8',
        transparent: true,
        opacity: 0.03,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  )

  useEffect(
    () => () => {
      mastGeo.dispose()
      headGeo.dispose()
      mastMat.dispose()
      headMat.dispose()
      coneGeo.dispose()
      coneMat.dispose()
    },
    [mastGeo, headGeo, mastMat, headMat, coneGeo, coneMat],
  )

  return (
    <>
      <ambientLight intensity={0.22} color="#8FA6C4" />
      <hemisphereLight args={['#24405f', '#07120c', 0.5]} />
      {rigs.map(([x, z], i) => {
        const dirX = -x
        const dirZ = -z
        return (
          <group key={i}>
            <mesh position={[x, 15, z]} geometry={mastGeo} material={mastMat} />
            <mesh position={[x, 29, z]} geometry={headGeo} material={headMat} />
            <directionalLight position={[x, 30, z]} intensity={lite ? 0.7 : 0.85} color="#FFF3D6" />
            {!lite && <mesh position={[x * 0.55, 14.6, z * 0.55]} geometry={coneGeo} material={coneMat} rotation={[0, 0, 0]} />}
            <mesh position={[x, 29, z]} rotation={[0, Math.atan2(dirX, dirZ), 0]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

function Vitrine() {
  const group = useRef<THREE.Group>(null)
  const boxGeo = useMemo(() => new THREE.BoxGeometry(7, 4.4, 4.4), [])
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo])
  const edgeMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(COLORS.glass),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )
  const glassMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uDeep: { value: new THREE.Color(COLORS.deep) },
          uGlass: { value: new THREE.Color(COLORS.glass) },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uDeep;
          uniform vec3 uGlass;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float fres = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
            vec3 col = mix(uDeep, uGlass, fres);
            float alpha = 0.04 + fres * 0.55;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      }),
    [],
  )

  const bars = useMemo(() => {
    const bw = 0.42
    const gap = 0.28
    const total = XG_EVENTS.length * (bw + gap) - gap
    return XG_EVENTS.map((e, i) => ({
      x: -total / 2 + i * (bw + gap) + bw / 2,
      h: 0.35 + e.xg * 4.2,
      xg: e.xg,
    }))
  }, [])

  useEffect(
    () => () => {
      boxGeo.dispose()
      edgesGeo.dispose()
      edgeMat.dispose()
      glassMat.dispose()
    },
    [boxGeo, edgesGeo, edgeMat, glassMat],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!group.current) return
    group.current.position.y = 6.4 + Math.sin(t * 0.5) * 0.35
    group.current.rotation.y = Math.sin(t * 0.18) * 0.42
  })

  return (
    <group ref={group} position={[0, 6.4, 22]}>
      <mesh geometry={boxGeo} material={glassMat} />
      <primitive object={new THREE.LineSegments(edgesGeo, edgeMat)} />
      <group position={[0, -1.1, 0]}>
        {bars.map((b, i) => (
          <mesh key={i} position={[b.x, b.h / 2, 0]}>
            <boxGeometry args={[0.42, b.h, 0.42]} />
            <meshStandardMaterial
              color={COLORS.accent}
              emissive={new THREE.Color(COLORS.accent).lerp(new THREE.Color(COLORS.home), b.xg)}
              emissiveIntensity={1.6}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Rig({ scrollRef }: { scrollRef?: NumRef }) {
  const { camera, pointer } = useThree()
  const smoothing = scrollRef?.current ?? 0

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const scroll = scrollRef ? scrollRef.current : 0
    const r = 44 + Math.sin(t * 0.07) * 8 + scroll * 14
    const ang = t * 0.055
    scratch.set(
      Math.sin(ang) * r + pointer.x * 7,
      23 + Math.sin(t * 0.12) * 4 - scroll * 9 + pointer.y * -3,
      Math.cos(ang) * r * 0.9 + 10,
    )
    camera.position.lerp(scratch, 0.028)
    camera.lookAt(scratchTarget)
  })

  void smoothing
  return null
}

function Effects({ lite }: { lite: boolean }) {
  const caOffset = useMemo(() => new THREE.Vector2(0.00055, 0.0006), [])
  if (lite) return null
  return (
    <EffectComposer>
      <Bloom intensity={0.75} luminanceThreshold={0.22} luminanceSmoothing={0.9} mipmapBlur />
      <ChromaticAberration offset={caOffset} />
      <Vignette offset={0.28} darkness={0.86} />
      <Noise premultiply opacity={0.22} />
    </EffectComposer>
  )
}

export default function AnalysisScene({ lite = false, scrollRef }: SceneProps) {
  return (
    <Canvas
      dpr={[1, lite ? 1.25 : 1.8]}
      shadows={false}
      gl={{ antialias: !lite, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 23, 48], fov: 36, near: 0.5, far: 320 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.12
      }}
    >
      <color attach="background" args={['#05070A']} />
      <fog attach="fog" args={['#05070A', 46, 175]} />
      <Floodlights lite={lite} />
      <Pitch />
      <PassNetwork lite={lite} />
      <TeamInstances players={HOME_PLAYERS} color={COLORS.home} />
      <TeamInstances players={AWAY_PLAYERS} color={COLORS.away} />
      <Ball trail={!lite} />
      <Crowd lite={lite} />
      <Vitrine />
      <Rig scrollRef={scrollRef} />
      <Effects lite={lite} />
    </Canvas>
  )
}

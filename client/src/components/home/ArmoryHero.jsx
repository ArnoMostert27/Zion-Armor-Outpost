import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { ARMOR } from '../../data/armor.js';
import { ArmorIcon } from '../ui/Sigils.jsx';

/* -------------------------------------------------------------------------
   One armor piece. Built from primitives so nothing has to be downloaded.
   ------------------------------------------------------------------------- */
function Piece({ piece, radius, onHover, onLeave, onSelect }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const angle = (piece.angle * Math.PI) / 180;

  const position = useMemo(
    () => [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.52, Math.sin(angle) * 0.9],
    [angle, radius]
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * (hovered ? 1.1 : 0.35);
    const target = hovered ? 1.35 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
  });

  const color = piece.color;
  const material = (
    <meshStandardMaterial
      color={color}
      metalness={0.85}
      roughness={hovered ? 0.15 : 0.32}
      emissive={color}
      emissiveIntensity={hovered ? 0.65 : 0.12}
    />
  );

  const geometry = {
    helmet: (
      <>
        <mesh>
          <sphereGeometry args={[0.5, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          {material}
        </mesh>
        <mesh position={[0, -0.16, 0.44]}>
          <boxGeometry args={[0.1, 0.5, 0.16]} />
          {material}
        </mesh>
      </>
    ),
    breastplate: (
      <>
        <mesh>
          <boxGeometry args={[0.86, 1.05, 0.34]} />
          {material}
        </mesh>
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[1.02, 0.16, 0.4]} />
          {material}
        </mesh>
      </>
    ),
    belt: (
      <>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.52, 0.13, 16, 40]} />
          {material}
        </mesh>
        <mesh position={[0, 0, 0.5]}>
          <boxGeometry args={[0.3, 0.3, 0.12]} />
          {material}
        </mesh>
      </>
    ),
    shield: (
      <>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.1, 6]} />
          {material}
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <boxGeometry args={[0.1, 0.9, 0.06]} />
          {material}
        </mesh>
      </>
    ),
    sword: (
      <>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.13, 1.3, 0.05]} />
          {material}
        </mesh>
        <mesh position={[0, -0.34, 0]}>
          <boxGeometry args={[0.7, 0.1, 0.1]} />
          {material}
        </mesh>
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.44, 12]} />
          {material}
        </mesh>
      </>
    ),
    boots: (
      <>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.36, 0.78, 0.32]} />
          {material}
        </mesh>
        <mesh position={[0, -0.3, 0.16]}>
          <boxGeometry args={[0.36, 0.2, 0.66]} />
          {material}
        </mesh>
      </>
    ),
  };

  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.9}>
      <group
        ref={ref}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(piece);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          onLeave();
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(piece);
        }}
      >
        {geometry[piece.key]}
      </group>
    </Float>
  );
}

/* -------------------------------------------------------------------------
   The rig: slow orbit plus pointer parallax.
   ------------------------------------------------------------------------- */
function Rig({ children }) {
  const group = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.07;
    const { x, y } = state.pointer;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.18, 0.05);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, x * 0.35, 0.05);
  });

  return <group ref={group}>{children}</group>;
}

/* -------------------------------------------------------------------------
   Hero
   ------------------------------------------------------------------------- */
export default function ArmoryHero() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const canRender3d = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      const canvas = document.createElement('canvas');
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }, []);

  return (
    <section className="armory">
      {canRender3d && (
        <div className="armory__canvas">
          <Canvas camera={{ position: [0, 0, 6.4], fov: 46 }} dpr={[1, 1.8]}>
            <color attach="background" args={['#07090f']} />
            <fog attach="fog" args={['#07090f', 7, 15]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 6, 5]} intensity={1.6} color="#fff2cc" />
            <pointLight position={[-5, -2, 3]} intensity={40} color="#ff5a2b" distance={18} />
            <pointLight position={[5, 3, -2]} intensity={30} color="#35e7dc" distance={18} />
            <Suspense fallback={null}>
              <Rig>
                {ARMOR.map((piece) => (
                  <Piece
                    key={piece.key}
                    piece={piece}
                    radius={2.9}
                    onHover={setActive}
                    onLeave={() => setActive(null)}
                    onSelect={(p) => navigate(`/racks?category=${p.category}`)}
                  />
                ))}
              </Rig>
            </Suspense>
          </Canvas>
        </div>
      )}

      <div className="armory__content">
        <span className="armory__eyebrow">Ephesians Six &middot; The Armoury</span>
        <h1 className="armory__title">
          Zion Armor
          <em>Outpost</em>
        </h1>
        <p className="armory__lede">
          A comic Bible armoury on the edge of the wilderness. Six racks, one story, and the whole
          thing drawn in full colour. Resupply, then go back out.
        </p>
        <div className="armory__cta">
          <Link to="/racks" className="btn btn--primary btn--lg">
            Enter the racks
          </Link>
          <Link to="/forge" className="btn btn--lg">
            Build your armor
          </Link>
        </div>
      </div>

      {canRender3d ? (
        <>
          <div className="armory__readout">
            {active ? (
              <>
                <div className="armory__readout-name">{active.name}</div>
                <p className="armory__readout-verse">
                  &ldquo;{active.verse}&rdquo; &mdash; {active.verseRef}
                </p>
              </>
            ) : (
              <p className="armory__readout-verse">Hover a piece of the armor to open its rack.</p>
            )}
          </div>
          <span className="armory__hint">Scroll into the story</span>
        </>
      ) : (
        <nav className="armory__fallback" aria-label="The six racks">
          {ARMOR.map((piece) => (
            <Link key={piece.key} to={`/racks?category=${piece.category}`}>
              <ArmorIcon piece={piece.key} className="brand__mark" />
              <span className="satchel-item__slot">{piece.short}</span>
              <span className="card__title" style={{ fontSize: 'var(--step--1)' }}>
                {piece.rack}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </section>
  );
}

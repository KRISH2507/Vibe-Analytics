import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function DataStream({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  const curve = useMemo(() => {
    const midPoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(1.8);
    return new THREE.QuadraticBezierCurve3(start, midPoint, end);
  }, [start, end]);

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * 0.3) % 1;
    if (ref.current) {
      const point = curve.getPoint(progress.current);
      ref.current.position.copy(point);
    }
  });

  return (
    <group>
      {/* Stream line */}
      <mesh>
        <tubeGeometry args={[curve, 32, 0.008, 8, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {/* Moving particle */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function GlobeScene({ scrollProgress }: { scrollProgress: number }) {
  const globeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Generate connection points on globe surface
  const connections = useMemo(() => {
    const points: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];
    const colors = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fbbf24'];

    // Major city-like positions on a unit sphere
    const positions = [
      new THREE.Vector3(0.8, 0.4, 0.4),   // NA East
      new THREE.Vector3(-0.3, 0.6, 0.7),   // Europe
      new THREE.Vector3(0.9, 0.2, -0.4),   // Asia
      new THREE.Vector3(-0.7, -0.5, 0.5),  // SA
      new THREE.Vector3(0.3, 0.8, 0.5),    // NA West
      new THREE.Vector3(-0.5, 0.3, -0.8),  // East Asia
      new THREE.Vector3(0.6, -0.6, 0.5),   // Australia
      new THREE.Vector3(-0.8, 0.5, -0.3),  // Middle East
    ].map((v) => v.normalize().multiplyScalar(1.02));

    // Create connections between random pairs
    for (let i = 0; i < 12; i++) {
      const startIdx = Math.floor(Math.random() * positions.length);
      let endIdx = Math.floor(Math.random() * positions.length);
      while (endIdx === startIdx) {
        endIdx = Math.floor(Math.random() * positions.length);
      }
      points.push({
        start: positions[startIdx].clone(),
        end: positions[endIdx].clone(),
        color: colors[i % colors.length],
      });
    }

    return points;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Base rotation + scroll-influenced rotation
      groupRef.current.rotation.y += delta * 0.1 + scrollProgress * 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main globe */}
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#1e1b4b"
          roughness={0.8}
          metalness={0.2}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Globe wireframe overlay */}
      <Sphere args={[1.01, 32, 32]}>
        <meshBasicMaterial
          color="#a78bfa"
          wireframe
          transparent
          opacity={0.1}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[1.15, 32, 32]}>
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Data streams */}
      {connections.map((conn, i) => (
        <DataStream key={i} start={conn.start} end={conn.end} color={conn.color} />
      ))}

      {/* Node points on globe */}
      {connections.slice(0, 8).map((conn, i) => (
        <mesh key={`node-${i}`} position={conn.start}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial color="#a78bfa" />
        </mesh>
      ))}
    </group>
  );
}

interface Globe3DProps {
  scrollProgress?: number;
  className?: string;
}

export function Globe3D({ scrollProgress = 0, className = '' }: Globe3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a78bfa" />
        <GlobeScene scrollProgress={scrollProgress} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}

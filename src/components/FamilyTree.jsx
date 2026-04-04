import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, PerspectiveCamera, Stars, Billboard, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

const NODE_RADIUS = 0.5;
const LEVEL_HEIGHT = 5;
const SPREAD_WIDTH = 12;

const familyData = {
  name: "Blood Roots",
  children: [
    {
      name: "GROOM'S FAMILY",
      children: [
        { name: "Muthukrishnan\n(Father)" },
        { name: "Chellamani\n(Mother)" },
        { name: "Sowmiya\n(Sister)" }
      ]
    },
    {
      name: "BRIDE'S FAMILY",
      children: [
        { name: "Kumaravenkatasan\n(Father)" },
        { name: "Nagavalli\n(Mother)" },
        { name: "Nagarohitha\n(Sister)" }
      ]
    }
  ]
};

function Connection({ start, end }) {
  const ref = useRef();
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={lineGeometry} ref={ref}>
      <lineBasicMaterial attach="material" color="#ff69b4" linewidth={2} transparent opacity={0.3} />
    </line>
  );
}

function TreeNode({ node, position, level = 0 }) {
  const [expanded, setExpanded] = useState(level === 0);
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const groupRef = useRef();
  const childrenRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.4 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      meshRef.current.rotation.y += delta * 0.5;
    }

    if (childrenRef.current) {
      // Toggle children visibility based on expanded state
      childrenRef.current.visible = expanded;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const childrenPositions = useMemo(() => {
    const count = node.children?.length || 0;
    if (count === 0) return [];

    // Root level gets a much larger spread
    const spreadFactor = level === 0 ? SPREAD_WIDTH : SPREAD_WIDTH * 0.4 / (level + 0.5);
    const totalWidth = (count - 1) * spreadFactor;
    const offset = totalWidth / 2;

    return (node.children || []).map((_, i) => [
      position[0] - offset + i * spreadFactor,
      position[1] - LEVEL_HEIGHT,
      position[2]
    ]);
  }, [node.children, position, level]);

  return (
    <group ref={groupRef}>
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <group position={position}>
          {/* Outer Glow / Halo */}
          <mesh visible={hovered || expanded} scale={[1.5, 1.5, 1.5]}>
            <sphereGeometry args={[NODE_RADIUS, 32, 32]} />
            <meshBasicMaterial
              color={expanded ? "#ff1493" : "#ffb6c1"}
              transparent
              opacity={hovered ? 0.3 : 0.1}
            />
          </mesh>

          <mesh
            ref={meshRef}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
          >
            <sphereGeometry args={[NODE_RADIUS, 32, 32]} />
            <meshStandardMaterial
              color={expanded ? "#ff1493" : "#ffb6c1"}
              emissive={expanded ? "#ff1493" : "#ffb6c1"}
              emissiveIntensity={0.5}
            />
          </mesh>

          <Billboard position={[0, NODE_RADIUS + 1.2, 0]}>
            <Text
              fontSize={0.45}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={4}
              textAlign="center"
            >
              {node.name}
              <meshBasicMaterial color={hovered ? "#ff69b4" : "white"} />
            </Text>
          </Billboard>
        </group>
      </Float>

      <group ref={childrenRef} visible={expanded}>
        {node.children && node.children.map((child, i) => (
          <group key={i}>
            <Connection
              start={position}
              end={childrenPositions[i]}
            />
            <TreeNode
              node={child}
              position={childrenPositions[i]}
              level={level + 1}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

export default function FamilyTree() {
  return (
    <section className="family-tree-section reveal" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '3rem', color: '#ff1493', fontFamily: 'serif' }}>Family Heritage</h2>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>Discover the roots that brought us together</p>
      </div>

      <div style={{ width: '100%', height: '700px', background: 'radial-gradient(circle, #2c1624 0%, #000000 100%)', borderRadius: '40px', overflow: 'hidden', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', border: '1px solid rgba(255,105,180,0.2)' }}>
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 20]} />
          <OrbitControls
            enablePan={true}
            minDistance={8}
            maxDistance={30}
            makeDefault
          />

          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#ff69b4" />
          <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={3} color="#ffffff" castShadow />

          <TreeNode node={familyData} position={[0, 5, 0]} />

          <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
        </Canvas>

        <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: 'white', pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '15px 25px', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>Interactive Legacy</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '1.1rem', color: '#ffb6c1' }}>Tap spheres to expand branches</p>
        </div>
      </div>
    </section>
  );
}

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, PerspectiveCamera, Stars, Billboard } from '@react-three/drei';
import * as THREE from 'three';

const familyData = {
  name: "Blood Roots",
  children: [
    {
      name: "BRIDE'S FAMILY",
      children: [
        { name: "Kumaravenkatasan\n(Father)" },
        { name: "Nagavalli\n(Mother)" },
        { name: "Nagarohitha\n(Sister)" }
      ]
    },
    {
      name: "GROOM'S FAMILY",
      children: [
        { name: "Muthukrishnan\n(Father)" },
        { name: "Chellamani\n(Mother)" },
        { 
          name: "Sowmiya\n(Sister)",
          children: [{ name: "Vishagan\n(Son)" }]
        }
      ]
    }
  ]
};

const getEmoji = (name) => {
  const n = name.toUpperCase();
  if (n.includes("GROOM") && n.includes("FAMILY")) return "👑";
  if (n.includes("BRIDE") && n.includes("FAMILY")) return "👸";
  if (n.includes("FATHER")) return "👨";
  if (n.includes("MOTHER")) return "👩";
  if (n.includes("SISTER")) return "👧";
  if (n.includes("SON")) return "👦";
  if (n.includes("ROOTS")) return "🌳";
  return "👤";
};

// Hook for responsive design
function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}

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

function TreeNode({ node, position, level = 0, isGlobalExpanded = false, layoutProps }) {
  const { spreadWidth, levelHeight, isMobile } = layoutProps;
  const [expanded, setExpanded] = useState(level === 0);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  const childrenRef = useRef();
  const emojiRef = useRef();

  useEffect(() => {
    if (isGlobalExpanded) {
      setExpanded(true);
    } else if (level !== 0) {
      setExpanded(false);
    }
  }, [isGlobalExpanded, level]);

  const glowColor = useMemo(() => {
    const n = node.name.toUpperCase();
    if (n.includes("GROOM") && n.includes("FAMILY")) return "#FFD700";
    if (n.includes("BRIDE") && n.includes("FAMILY")) return "#FF69B4";
    if (expanded) return "#00FFFF";
    return "#ffb6c1";
  }, [node.name, expanded]);

  useFrame((state, delta) => {
    if (emojiRef.current) {
      const targetScale = hovered ? 1.5 : 1;
      emojiRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    if (childrenRef.current) {
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

    // More generous spread on mobile to prevent label overlap, 
    // but restricted for level 1 to avoid crossing the center line.
    const spreadFactor = level === 0 ? spreadWidth : (spreadWidth * (isMobile ? 0.35 : 0.4)) / (level);
    const totalWidth = (count - 1) * spreadFactor;
    const offset = totalWidth / 2;

    return (node.children || []).map((_, i) => [
      position[0] - offset + i * spreadFactor,
      position[1] - levelHeight,
      position[2]
    ]);
  }, [node.children, position, level, spreadWidth, levelHeight]);

  return (
    <group ref={groupRef}>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
        <group position={position}>
          <Billboard
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
          >
            <Text
              ref={emojiRef}
              fontSize={1.2}
              anchorX="center"
              anchorY="middle"
            >
              {getEmoji(node.name)}
            </Text>
            <mesh scale={[2.5, 2.5, 2.5]} position={[0, 0, -0.1]}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial 
                color={glowColor} 
                transparent 
                opacity={hovered ? 0.4 : 0.2} 
              />
            </mesh>
          </Billboard>

          <Billboard position={[0, -1.4, 0]}>
            <Text
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={3}
              textAlign="center"
              lineHeight={1.2}
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
            <Connection start={position} end={childrenPositions[i]} />
            <TreeNode
              node={child}
              position={childrenPositions[i]}
              level={level + 1}
              isGlobalExpanded={isGlobalExpanded}
              layoutProps={layoutProps}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

export default function FamilyTree() {
  const [isGlobalExpanded, setIsGlobalExpanded] = useState(false);
  const [width] = useWindowSize();
  const isMobile = width < 768;

  const layoutProps = useMemo(() => ({
    isMobile,
    spreadWidth: isMobile ? 18 : 12,
    levelHeight: isMobile ? 4.5 : 5,
    cameraZ: isMobile ? 38 : 20,
    rootY: isMobile ? 8 : 5
  }), [isMobile]);

  return (
    <section className="family-tree-section reveal" style={{ padding: isMobile ? '20px 10px' : '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header reveal">
        <h2 className="gold-text">Family Heritage</h2>
        <div className="divider"></div>
        <p className="subtitle">Discover the roots that brought us together</p>
      </div>

      <div style={{ 
        width: '100%', 
        height: isMobile ? '550px' : '700px', 
        background: 'radial-gradient(circle, #2c1624 0%, #000000 100%)', 
        borderRadius: isMobile ? '20px' : '40px', 
        overflow: 'hidden', 
        position: 'relative', 
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)', 
        border: '1px solid rgba(255,105,180,0.2)' 
      }}>
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, layoutProps.cameraZ]} />
          <OrbitControls 
            enablePan={true} 
            minDistance={8} 
            maxDistance={50} 
            makeDefault 
            target={[0, isMobile ? 1 : 0, 0]}
          />

          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#ff69b4" />
          <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={3} color="#ffffff" castShadow />

          <TreeNode 
            node={familyData} 
            position={[0, layoutProps.rootY, 0]} 
            isGlobalExpanded={isGlobalExpanded} 
            layoutProps={layoutProps}
          />

          <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
        </Canvas>

        {/* Overlay UI - Moved/Resized for Mobile */}
        {!isMobile && (
          <div style={{ 
            position: 'absolute', 
            bottom: '30px', 
            left: '30px', 
            color: 'white', 
            pointerEvents: 'none', 
            background: 'rgba(0,0,0,0.5)', 
            padding: '15px 25px', 
            borderRadius: '20px', 
            backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>Interactive Legacy</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '1.1rem', color: '#ffb6c1' }}>Tap emojis to expand branches</p>
          </div>
        )}

        <button 
          onClick={() => setIsGlobalExpanded(!isGlobalExpanded)}
          className="btn-gold"
          style={{ 
            position: 'absolute', 
            top: isMobile ? '20px' : 'auto',
            bottom: isMobile ? 'auto' : '30px', 
            right: '20px', 
            padding: '8px 15px', 
            fontSize: '0.75rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            zIndex: 10
          }}
        >
          {isGlobalExpanded ? 'Collapse All' : 'View All'}
        </button>
        
        {isMobile && (
          <div style={{ 
            position: 'absolute', 
            bottom: '15px', 
            left: '0',
            right: '0',
            textAlign: 'center',
            color: '#ffb6c1',
            fontSize: '0.8rem',
            pointerEvents: 'none',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            Tap emojis to explore 
          </div>
        )}
      </div>
    </section>
  );
}


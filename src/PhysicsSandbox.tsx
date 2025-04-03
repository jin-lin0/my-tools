import { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { Physics, useBox, usePlane, useSphere } from "@react-three/cannon";
import * as THREE from "three";
import "./PhysicsSandbox.css";
import BackButton from "./components/BackButton";
import Loading from "./components/Loading";

const PARTICLE_COUNT = 1000;
const PARTICLE_SIZE = 0.1;

type PhysicsSandboxProps = {
  onBack: () => void;
};

function useDraggable(api: any) {
  const isDragging = useRef(false);
  const { camera, raycaster, pointer, scene } = useThree();

  const updatePosition = () => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const { point } = intersects[0];
      api.position.set(point.x, point.y, point.z);
    }
  };

  const handlePointerDown = () => {
    isDragging.current = true;
    updatePosition();
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  useFrame(() => {
    if (isDragging.current) {
      updatePosition();
    }
  });

  return { handlePointerDown, handlePointerUp };
}

function DraggableBox(props: any) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 5, 0],
    ...props,
    onCollide: (e) => {
      if (e.body.userData?.isSphere) {
        const sphere = e.body;
        const box = ref.current;
        if (box && sphere && box.parent && sphere.parent) {
          // 移除碰撞的立方体和小球
          box.parent.remove(box);
          sphere.parent.remove(sphere);
        }
      }
    },
  }));
  const { handlePointerDown, handlePointerUp } = useDraggable(api);

  return (
    <mesh
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function SnowParticleSystem() {
  const particlesRef = useRef<THREE.Points>(null);
  const particlesGeometry = useRef<THREE.BufferGeometry>(null);
  const particlesMaterial = useRef<THREE.PointsMaterial>(null);
  const positionsArray = useRef<Float32Array>(
    new Float32Array(PARTICLE_COUNT * 3)
  );

  const { width: screenWidth } = useThree().size;

  useEffect(() => {
    // 初始化粒子位置
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positionsArray.current[i3] =
        (Math.random() - 0.5) * (screenWidth / 100) * 9;
      positionsArray.current[i3 + 1] = Math.random() * 10;
      positionsArray.current[i3 + 2] =
        (Math.random() - 0.5) * (screenWidth / 100) * 9;
    }
    if (particlesGeometry.current) {
      particlesGeometry.current.setAttribute(
        "position",
        new THREE.BufferAttribute(positionsArray.current, 3)
      );
    }
  }, [screenWidth]);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;

      // 更新粒子位置模拟下落
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const y = positionsArray.current[i3 + 1];
        const newY = y > -1 ? y - 0.1 : 10 + Math.random() * 5;
        positionsArray.current[i3 + 1] = newY;
      }

      if (particlesGeometry.current) {
        particlesGeometry.current.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry ref={particlesGeometry}>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positionsArray.current}
          itemSize={3}
          args={[positionsArray.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={particlesMaterial}
        color="#00aaff"
        size={PARTICLE_SIZE}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function DraggableSphere(props: any) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [2, 5, 0],
    ...props,
    userData: { isSphere: true },
  }));
  const { handlePointerDown, handlePointerUp } = useDraggable(api);

  return (
    <mesh
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

function Plane(props: any) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }));
  const texture = useTexture("./assets/imgs/wood_floor_4k.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

export default function PhysicsSandbox({ onBack }: PhysicsSandboxProps) {
  const [spheres, setSpheres] = useState<
    Array<{ id: number; position: [number, number, number] }>
  >([]);
  const [boxes, setBoxes] = useState<
    Array<{ id: number; position: [number, number, number] }>
  >([]);
  const [isPouring, setIsPouring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const addSphere = () => {
    const newSphere = {
      id: Date.now(),
      position: [Math.random() * 10 - 5, 10, Math.random() * 10 - 5] as [
        number,
        number,
        number
      ],
    };
    setSpheres([...spheres, newSphere]);
  };

  const addBox = () => {
    const newBox = {
      id: Date.now(),
      position: [Math.random() * 10 - 5, 10, Math.random() * 10 - 5] as [
        number,
        number,
        number
      ],
    };
    setBoxes([...boxes, newBox]);
  };

  const resetScene = () => {
    setSpheres([]);
    setBoxes([]);
  };

  return (
    <div className="physics-sandbox">
      {isLoading && <Loading />}
      <BackButton onBack={onBack} />
      <div className="button-group">
        <div className="add-shape" onClick={addSphere}>
          添加球体
        </div>
        <div className="add-shape" onClick={addBox}>
          添加立方体
        </div>
        <div className="add-shape" onClick={() => setIsPouring(!isPouring)}>
          下雪
        </div>
        <div className="reset-button" onClick={resetScene}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 6V3L8 7L12 11V8C15.31 8 18 10.69 18 14C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14H4C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 9.58 16.42 6 12 6Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
      <Canvas
        shadows
        camera={{ position: [0, 15, 30], fov: 50 }}
        onCreated={() => setIsLoading(false)}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048} // 适当降低，提高性能
          shadow-mapSize-height={2048}
          shadow-bias={-0.00005} // 调整 bias，减少阴影条纹
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <Physics
          gravity={[0, -9.81, 0]}
          defaultContactMaterial={{ restitution: 0.7 }}
        >
          <Plane />
          {boxes.map((box) => (
            <DraggableBox key={box.id} position={box.position} />
          ))}
          {spheres.map((sphere) => (
            <DraggableSphere key={sphere.id} position={sphere.position} />
          ))}
          {isPouring && <SnowParticleSystem />}
        </Physics>
        <OrbitControls makeDefault enabled={false} />
      </Canvas>
    </div>
  );
}

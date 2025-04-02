import { useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics, useBox, usePlane, useSphere } from "@react-three/cannon";
import "./PhysicsSandbox.css";
import BackButton from "./components/BackButton";

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
      api.velocity.set(0, 0, 0);
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
  const [ref, api] = useBox(() => ({ mass: 1, position: [0, 5, 0], ...props }));
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

function DraggableSphere(props: any) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [2, 5, 0],
    ...props,
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
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="lightblue" />
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
      <BackButton onBack={onBack} />
      <div className="button-group">
        <div className="add-shape" onClick={addSphere}>
          添加球体
        </div>
        <div className="add-shape" onClick={addBox}>
          添加立方体
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
      <Canvas shadows camera={{ position: [0, 15, 30], fov: 50 }}>
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
          <DraggableBox />
          {boxes.map((box) => (
            <DraggableBox key={box.id} position={box.position} />
          ))}
          <DraggableSphere />
          {spheres.map((sphere) => (
            <DraggableSphere key={sphere.id} position={sphere.position} />
          ))}
        </Physics>
        <OrbitControls makeDefault enabled={false} />
      </Canvas>
    </div>
  );
}

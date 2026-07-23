import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";


export function NeonPiano() {
    const { scene } = useGLTF("/Piano.glb");
    const ref = useRef();

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.0015;
        }
    });

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: "#000000",
                    roughness: 0.6,
                    metalness: 1,
                });

                const wire = new THREE.LineSegments(
                    new THREE.EdgesGeometry(child.geometry),
                    new THREE.LineBasicMaterial({ color: "#00ff88" }) // Green for register/piano
                );

                child.add(wire);
            }
        });
    }, [scene]);

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={0.6}
            position={[-7, -2.5, 0]}
        />
    );
}

export function NeonViolin() {
    const { scene } = useGLTF("/Violin.glb");
    const ref = useRef();

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.0015;
        }
    });

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: "#000000",
                    roughness: 0.6,
                    metalness: 1,
                });

                const wire = new THREE.LineSegments(
                    new THREE.EdgesGeometry(child.geometry),
                    new THREE.LineBasicMaterial({ color: "#ffcc00" }) // Yellow for login/violin
                );

                child.add(wire);
            }
        });
    }, [scene]);

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={1.5}
            position={[-6, -2, 0]}
            rotation={[0, Math.PI / 4, Math.PI / 6]}
        />
    );
}

useGLTF.preload("/Piano.glb");
useGLTF.preload("/Violin.glb");


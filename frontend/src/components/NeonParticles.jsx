import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function NeonParticles() {
    const ref = useRef();

    const positions = useMemo(() => {
        const arr = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 20;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return arr;
    }, []);

    useFrame(({ clock }) => {
        ref.current.rotation.y = clock.getElapsedTime() * 0.05;
    });

    return (
        <Points ref={ref} positions={positions} stride={3}>
            <PointMaterial
                transparent
                color="#22ff88"
                size={0.03}
                sizeAttenuation
                depthWrite={false}
            />
        </Points>
    );
}
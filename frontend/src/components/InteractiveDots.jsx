import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function InteractiveDots({ color1 = "#C0C0C0", color2 = "#00e5ff" }) {
    const { mouse, viewport } = useThree();
    const meshRef = useRef();

    const count = 2000;
    const [positions, initialPositions, colors] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const initial = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);

        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 45;
            const y = (Math.random() - 0.5) * 45;
            const z = (Math.random() - 0.5) * 15;
            pos[i * 3] = initial[i * 3] = x;
            pos[i * 3 + 1] = initial[i * 3 + 1] = y;
            pos[i * 3 + 2] = initial[i * 3 + 2] = z;

            // 20% color2, 80% color1
            const mixedColor = Math.random() > 0.8 ? c2 : c1;
            cols[i * 3] = mixedColor.r;
            cols[i * 3 + 1] = mixedColor.g;
            cols[i * 3 + 2] = mixedColor.b;
        }
        return [pos, initial, cols];
    }, [color1, color2]);


    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const positionsAttr = meshRef.current.geometry.attributes.position;

        // Detect if mouse has moved from initial (0,0)
        const isMouseActive = mouse.x !== 0 || mouse.y !== 0;
        const mouseX = (mouse.x * viewport.width) / 2;
        const mouseY = (mouse.y * viewport.height) / 2;

        for (let i = 0; i < count; i++) {

            const i3 = i * 3;
            const x = initialPositions[i3];
            const y = initialPositions[i3 + 1];

            const dx = mouseX - x;
            const dy = mouseY - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Interactive repulsion - only if mouse is active and close
            if (isMouseActive && dist < 7) {
                const force = (7 - dist) / 7;
                positionsAttr.array[i3] -= dx * force * 0.4;
                positionsAttr.array[i3 + 1] -= dy * force * 0.4;
            }

            // Constant return to base position (very strong return for smoothness)
            positionsAttr.array[i3] += (x - positionsAttr.array[i3]) * 0.08;
            positionsAttr.array[i3 + 1] += (y - positionsAttr.array[i3 + 1]) * 0.08;

            // Float effect (adds life even when mouse is still)
            positionsAttr.array[i3 + 2] = initialPositions[i3 + 2] + Math.sin(time * 0.5 + i) * 0.5;
        }

        positionsAttr.needsUpdate = true;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}


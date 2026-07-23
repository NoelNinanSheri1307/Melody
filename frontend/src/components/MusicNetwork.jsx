import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const DEFAULT_COLORS = ["#00ff88"];
const NOTES = ["♪", "♫", "♩", "♬", "♭", "♯", "♮", "𝄞", "𝄢", "𝅘𝅥𝅮", "𝅘𝅥𝅯"];

export default function MusicNetwork({ colors = DEFAULT_COLORS, count = 80 }) {
    const groupRef = useRef();
    const RANGE = 25;

    const notes = useMemo(() => {
        return new Array(count).fill().map(() => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * RANGE,
                (Math.random() - 0.5) * RANGE,
                (Math.random() - 0.5) * RANGE
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.03,
                (Math.random() - 0.5) * 0.03,
                (Math.random() - 0.5) * 0.03
            ),
            char: NOTES[Math.floor(Math.random() * NOTES.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
        }));
    }, [count, colors]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();

        groupRef.current.children.forEach((child, i) => {
            const note = notes[i];
            if (!note) return;

            note.position.add(note.velocity);

            if (Math.abs(note.position.x) > RANGE / 2) note.velocity.x *= -1;
            if (Math.abs(note.position.y) > RANGE / 2) note.velocity.y *= -1;
            if (Math.abs(note.position.z) > RANGE / 2) note.velocity.z *= -1;

            child.position.copy(note.position);
            // Adding a swirl/bobbing effect
            child.position.y += Math.sin(time + i) * 0.005;
            child.rotation.y += 0.01;
            child.rotation.z += 0.005;
        });
    });

    return (
        <group ref={groupRef}>
            {notes.map((note, i) => (
                <Text
                    key={i}
                    fontSize={1.2}
                    color={note.color}
                    anchorX="center"
                    anchorY="middle"
                    material-toneMapped={false}
                >
                    {note.char}
                </Text>
            ))}
        </group>
    );
}

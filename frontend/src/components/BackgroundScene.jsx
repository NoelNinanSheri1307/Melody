import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import MusicNetwork from "./MusicNetwork";

export default function BackgroundScene({ children }) {
    return (
        <div className="fixed inset-0 -z-10">
            <Canvas camera={{ position: [0, 3, 12], fov: 50 }}>
                <color attach="background" args={["#000000"]} />
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />

                <Suspense fallback={null}>
                    <MusicNetwork />
                    {children}
                </Suspense>

                <EffectComposer>
                    <Bloom intensity={0.4} luminanceThreshold={0.2} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import MusicNetwork from "../components/MusicNetwork";

export default function MainLayout({ children, scene, musicColors, musicCount, showNotes = true }) {
    return (
        <div className="relative min-h-screen bg-black text-white">

            {/* ONE single Canvas for everything */}
            <Canvas
                camera={{ position: [0, 0, 15], fov: 60 }}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 0,
                }}
            >
                <color attach="background" args={["#000000"]} />
                <ambientLight intensity={0.5} />

                <Suspense fallback={null}>
                    {showNotes && <MusicNetwork colors={musicColors} count={musicCount} />}
                    {scene}
                </Suspense>

                <EffectComposer>
                    <Bloom intensity={0.2} luminanceThreshold={0.1} />
                </EffectComposer>
            </Canvas>

            {/* Foreground content */}
            <div className="relative z-10">
                {children}
            </div>

        </div>
    );
}


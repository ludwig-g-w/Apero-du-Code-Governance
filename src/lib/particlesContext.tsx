import { particlesOptions } from "@/lib/utils";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.

import { createContext, useContext, useEffect, useState } from "react";

const particlesContext = createContext<{
  particlesLoaded: boolean;
  setParticlesLoaded: (value: boolean) => void;
}>({ particlesLoaded: false, setParticlesLoaded: () => {} });

export function useParticles() {
  return useContext(particlesContext);
}

export function ParticlesProvider({ children }: { children: React.ReactNode }) {
  const [particlesLoaded, setParticlesLoaded] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (particlesLoaded) {
      timeout = setTimeout(() => {
        setParticlesLoaded(false);
      }, 10000);
    }
    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [particlesLoaded]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    });
  }, []);

  return (
    <particlesContext.Provider value={{ particlesLoaded, setParticlesLoaded }}>
      {children}
      {particlesLoaded && (
        <Particles
          id="tsparticles"
          particlesLoaded={async (c) => {
            console.log("particles loaded", c.started);
          }}
          options={particlesOptions}
        />
      )}
    </particlesContext.Provider>
  );
}

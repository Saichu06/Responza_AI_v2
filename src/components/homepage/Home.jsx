// src/components/homepage/Home.jsx
import { useEffect } from "react";
import Hero from "./Hero";
import MapHero from "./MapHero";
import VideoSection from "./VideoSection";
import Capabilities from "./Capabilities";

export default function Home({ scrollToSection, setPage }) {
  useEffect(() => {
    if (scrollToSection) {
      const element = document.getElementById(scrollToSection);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [scrollToSection]);

  return (
    <>
      <Hero setPage={setPage} />
      <div id="map">
        <MapHero />
      </div>
      <VideoSection />
      <div id="capabilities">
        <Capabilities />
      </div>
    </>
  );
}
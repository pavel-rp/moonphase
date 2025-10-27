"use client";

import React from "react";
import { Holo } from "@/components/charts/pie";
import { Datum } from "@/components/charts/core/types";

const sampleData = [
  { label: "BTC", value: 42, color: "#7ee787" },
  { label: "ETH", value: 25, color: "#3fb0ff" },
  { label: "SOL", value: 14, color: "#ffb86b" },
  { label: "ARB", value: 9, color: "#ff7eb6" },
  { label: "OP", value: 6, color: "#b892ff" },
  { label: "ALTS", value: 4, color: "#5be9d0" },
];

const cryptoData = [
  { label: "Bitcoin", value: 35, color: "#f7931a" },
  { label: "Ethereum", value: 28, color: "#627eea" },
  { label: "Cardano", value: 12, color: "#0033ad" },
  { label: "Polkadot", value: 8, color: "#e6007a" },
  { label: "Chainlink", value: 7, color: "#2a5ada" },
  { label: "Others", value: 10, color: "#6c757d" },
];

const portfolioData = [
  { label: "Stocks", value: 45, color: "#00d4aa" },
  { label: "Bonds", value: 30, color: "#ff6b6b" },
  { label: "Real Estate", value: 15, color: "#4ecdc4" },
  { label: "Commodities", value: 10, color: "#45b7d1" },
];

const minimalData = [
  { label: "A", value: 60, color: "#ff9ff3" },
  { label: "B", value: 40, color: "#54a0ff" },
];

export default function FullscreenTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Chart Library Proto - Fullscreen Test
        </h1>
        
        {/* Grid of different chart configurations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Default Configuration */}
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">Default Config</h3>
            <div className="h-full">
              <Holo data={sampleData} totalLabel="Holdings" />
            </div>
          </div>

          {/* Large Size */}
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">Large Size (300px)</h3>
            <div className="h-full">
              <Holo 
                data={cryptoData} 
                totalLabel="Crypto Portfolio" 
                size={300}
              />
            </div>
          </div>

          {/* Small Size */}
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">Small Size (150px)</h3>
            <div className="h-full">
              <Holo 
                data={portfolioData} 
                totalLabel="Assets" 
                size={150}
              />
            </div>
          </div>

          {/* No Animation */}
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">No Animation</h3>
            <div className="h-full">
              <Holo 
                data={sampleData} 
                totalLabel="Static" 
                animate={false}
              />
            </div>
          </div>

          {/* Custom Inner Radius */}
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">Thin Ring</h3>
            <div className="h-full">
              <Holo 
                data={cryptoData} 
                totalLabel="Thin" 
                innerRadius={90}
              />
            </div>
          </div>

          {/* No Legend */}
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">No Legend</h3>
            <div className="h-full">
              <Holo 
                data={portfolioData} 
                totalLabel="Clean" 
                showLegend={false}
              />
            </div>
          </div>

          {/* Unstyled */}
          <div className="h-80 bg-transparent">
            <h3 className="text-white/80 text-sm mb-3">Unstyled</h3>
            <div className="h-full">
              <Holo 
                data={minimalData} 
                totalLabel="Minimal" 
                unstyled={true}
                size={200}
              />
            </div>
          </div>

          {/* Custom Theme */}
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">Custom Theme</h3>
            <div className="h-full">
              <Holo 
                data={sampleData} 
                totalLabel="Themed" 
                theme={{
                  palette: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"],
                  baseRingOpacity: 0.4,
                  innerRingOpacity: 0.6,
                  strokeOpacity: 0.5,
                }}
              />
            </div>
          </div>

          {/* Extra Large */}
          <div className="h-96 bg-white/5 rounded-3xl p-6 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">Extra Large (400px)</h3>
            <div className="h-full">
              <Holo 
                data={cryptoData} 
                totalLabel="Large Portfolio" 
                size={400}
              />
            </div>
          </div>

          {/* Wide Container */}
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md col-span-1 md:col-span-2">
            <h3 className="text-white/80 text-sm mb-3">Wide Container</h3>
            <div className="h-full">
              <Holo 
                data={portfolioData} 
                totalLabel="Wide View" 
                size={250}
              />
            </div>
          </div>

          {/* Tall Container */}
          <div className="h-96 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">Tall Container</h3>
            <div className="h-full">
              <Holo 
                data={sampleData} 
                totalLabel="Tall" 
                size={300}
              />
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <h3 className="text-white/80 text-sm mb-3">Interactive Demo</h3>
            <div className="h-full">
              <Holo 
                data={cryptoData} 
                totalLabel="Interactive" 
                onSliceHover={(d: Datum, i: number) => console.log(`Hovered ${d.label} (${i})`)}
                onSliceClick={(d: Datum, i: number) => console.log(`Clicked ${d.label} (${i})`)}
              />
            </div>
          </div>

        </div>

        {/* Full Width Showcase */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Full Width Showcase
          </h2>
          <div className="h-96 bg-white/5 rounded-3xl p-6 ring-1 ring-white/10 backdrop-blur-md">
            <div className="h-full">
              <Holo 
                data={sampleData} 
                totalLabel="Full Width Demo" 
                size={350}
              />
            </div>
          </div>
        </div>

        {/* Responsive Test */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Responsive Test - Resize Your Browser
          </h2>
          <div className="h-80 bg-white/5 rounded-3xl p-4 ring-1 ring-white/10 backdrop-blur-md">
            <div className="h-full">
              <Holo 
                data={portfolioData} 
                totalLabel="Responsive" 
                size={280}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

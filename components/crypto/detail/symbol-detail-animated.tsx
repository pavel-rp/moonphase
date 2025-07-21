"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Asset } from "@/lib/data/assets";
import { CryptoIcon } from "../crypto-icon";
import { CryptoSparkline } from "../crypto-sparkline";
import { formatNumber, formatPercent, prettifyNumber } from "@/lib/utils/numbers";
import { getPriceMovementTextColorClass } from "@/lib/utils/ui-helpers";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { getSharedLayoutId, elementTransitionVariants, springConfig } from "@/components/ui/animation/page-transition.client";

interface SymbolDetailAnimatedProps {
  asset: Asset;
}

export default function SymbolDetailAnimated({ asset }: SymbolDetailAnimatedProps) {
  const textColorClass = getPriceMovementTextColorClass(asset.changePercent24Hr, 700);
  const glowClass = "text-shadow-[0_0_20px_var(--tw-glow-color)]";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Section with Shared Elements */}
      <motion.div 
        layoutId={getSharedLayoutId(asset.symbol, "card")}
        className="glassmorphic rounded-xl p-6"
        transition={springConfig}
      >
        <div className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <motion.div 
              layoutId={getSharedLayoutId(asset.symbol, "icon")}
              animate="large"
              variants={elementTransitionVariants.icon}
            >
              <CryptoIcon symbol={asset.symbol} size={48} name={asset.name} />
            </motion.div>
            <div>
              <motion.div
                layoutId={getSharedLayoutId(asset.symbol, "title")}
                animate="page"
                variants={elementTransitionVariants.title}
              >
                <CardTitle className="text-3xl font-bold">{asset.name}</CardTitle>
              </motion.div>
              <motion.div 
                layoutId={getSharedLayoutId(asset.symbol, "symbol")}
                className="mt-1"
              >
                <CardDescription className="text-lg">{asset.symbol}</CardDescription>
              </motion.div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Rank</div>
            <div className="text-2xl font-bold">#{asset.rank}</div>
          </div>
        </div>
      </motion.div>

      {/* Price Section with Shared Elements */}
      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Price Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex items-center justify-between ${textColorClass}`}>
            <motion.span 
              layoutId={getSharedLayoutId(asset.symbol, "price")}
              animate="page"
              variants={elementTransitionVariants.price}
              className={`font-bold ${glowClass}`}
            >
              ${formatNumber(asset.priceUsd)}
            </motion.span>
            <motion.span 
              layoutId={getSharedLayoutId(asset.symbol, "change")}
              animate="page"
              variants={elementTransitionVariants.change}
              className={`${glowClass}`}
            >
              {formatPercent(asset.changePercent24Hr)}
            </motion.span>
          </div>
          <motion.div 
            layoutId={getSharedLayoutId(asset.symbol, "sparkline")}
            className="w-full"
          >
            <CryptoSparkline symbol={asset.symbol} />
          </motion.div>
        </CardContent>
      </Card>

      {/* Market Data Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...springConfig }}
      >
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Market Data</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="text-xl font-semibold">
                  ${prettifyNumber(asset.marketCapUsd)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">24h Volume</div>
                <div className="text-xl font-semibold">
                  ${prettifyNumber(asset.volumeUsd24Hr)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">VWAP (24h)</div>
                <div className="text-xl font-semibold">
                  ${formatNumber(asset.vwap24Hr)}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Circulating Supply</div>
                <div className="text-xl font-semibold">
                  {prettifyNumber(asset.supply)} {asset.symbol}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Max Supply</div>
                <div className="text-xl font-semibold">
                  {asset.maxSupply ? `${prettifyNumber(asset.maxSupply)} ${asset.symbol}` : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Explorer</div>
                <div className="text-xl font-semibold">
                  <a 
                    href={asset.explorer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Analysis Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...springConfig }}
      >
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>
              Get AI-powered insights and analysis for {asset.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full md:w-auto"
              variant="default"
              size="lg"
            >
              Generate AI Analysis
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
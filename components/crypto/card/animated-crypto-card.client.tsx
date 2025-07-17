"use client";

import { withHover3DAnimation } from "@/components/ui/gsap/hover-3d-animation.client";
import { CryptoCard } from "./crypto-card";

export const AnimatedCryptoCard = withHover3DAnimation(CryptoCard);
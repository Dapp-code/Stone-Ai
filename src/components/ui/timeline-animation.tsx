import React from "react";
import { motion } from "framer-motion";

interface TimelineContentProps {
  children?: React.ReactNode;
  animationNum?: number;
  timelineRef?: React.RefObject<any>;
  customVariants?: any;
  className?: string;
  as?: any;
  [key: string]: any;
}

export function TimelineContent({
  children,
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  as = "div",
  ...props
}: TimelineContentProps) {
  const Comp = motion[as] || motion.div;
  
  // Basic layout animation variants that fall back smoothly
  const defaultVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const activeVariants = customVariants || defaultVariants;

  return (
    <Comp
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={activeVariants}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}

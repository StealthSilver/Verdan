"use client";
import React from "react";
import { motion, SVGMotionProps } from "framer-motion";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// Only pass SVGMotionProps to motion.svg
export const Icon: React.FC<IconProps & SVGMotionProps<SVGSVGElement>> = ({
  className,
  size = 24,
  ...rest
}) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      width={size}
      height={size}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      {...(rest as SVGMotionProps<SVGSVGElement>)}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </motion.svg>
  );
};

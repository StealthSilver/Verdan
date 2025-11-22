import { motion } from "framer-motion";

// Premium growing tree SVG animation
const GrowingTreeAnimation = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 200 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-[300px]"
      >
        {/* Pot */}
        <motion.path
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          d="M60 220 L70 260 L130 260 L140 220 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        <motion.ellipse
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          cx="100"
          cy="220"
          rx="40"
          ry="8"
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Trunk - grows from bottom to top */}
        <motion.rect
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          x="92"
          y="120"
          width="16"
          height="100"
          rx="2"
          fill="hsl(var(--primary))"
          style={{ transformOrigin: "bottom" }}
        />

        {/* Bottom leaves - grow outward */}
        <motion.ellipse
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          cx="70"
          cy="180"
          rx="30"
          ry="25"
          fill="hsl(var(--primary))"
          opacity="0.8"
        />
        <motion.ellipse
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          cx="130"
          cy="180"
          rx="30"
          ry="25"
          fill="hsl(var(--primary))"
          opacity="0.8"
        />

        {/* Middle leaves */}
        <motion.ellipse
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          cx="60"
          cy="150"
          rx="28"
          ry="23"
          fill="hsl(var(--primary-glow))"
          opacity="0.9"
        />
        <motion.ellipse
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          cx="140"
          cy="150"
          rx="28"
          ry="23"
          fill="hsl(var(--primary-glow))"
          opacity="0.9"
        />

        {/* Top leaves */}
        <motion.ellipse
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          cx="75"
          cy="120"
          rx="26"
          ry="22"
          fill="hsl(var(--primary))"
        />
        <motion.ellipse
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.9 }}
          cx="125"
          cy="120"
          rx="26"
          ry="22"
          fill="hsl(var(--primary))"
        />

        {/* Crown - central top leaf */}
        <motion.ellipse
          initial={{ scale: 0, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 2.1,
            type: "spring",
            stiffness: 200,
          }}
          cx="100"
          cy="90"
          rx="35"
          ry="30"
          fill="hsl(var(--primary-glow))"
        />

        {/* Decorative yellow accents - small circles appear last */}
        <motion.circle
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.5 }}
          cx="85"
          cy="95"
          r="4"
          fill="hsl(var(--accent))"
        />
        <motion.circle
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.6 }}
          cx="115"
          cy="100"
          r="4"
          fill="hsl(var(--accent))"
        />
        <motion.circle
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.7 }}
          cx="100"
          cy="130"
          r="5"
          fill="hsl(var(--accent))"
        />
      </svg>
    </div>
  );
};

export default GrowingTreeAnimation;

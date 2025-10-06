"use client";

import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.2, repeatType: "reverse" }}
        className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100"
      >
        Loading...
      </motion.h1>
    </div>
  );
}

"use client"

import { IconRobot } from "@tabler/icons-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export const ChatButton = () => { 
  const pathname = usePathname()

  if (pathname === "/chatbot") {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.5 }}>

    <Link href={"/chatbot"}>
      <Button className="fixed cursor-pointer bottom-4 right-4 z-50 bg-primary text-white rounded-full p-4 shadow-lg size-12">
        <IconRobot className="size-8" />
      </Button>
    </Link>
      </motion.div>
    </AnimatePresence>
  )
}
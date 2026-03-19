"use client"

import { useState } from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui"
import { SignInForm } from "./SignInForm"
import { SignUpForm } from "./SignUpForm"

interface AuthModalProps {
  children: React.ReactElement
}

export function AuthModal({ children }: AuthModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  // Função que passaremos para os filhos poderem fechar o modal ao terminar o processo
  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full text-left" render={children}>
        {children}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="border border-white/20 bg-background/90 p-6 shadow-2xl backdrop-blur-md sm:max-w-[425px] sm:rounded-2xl"
      >
        <DialogClose className="absolute top-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
          <X size={18} />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="signin">Acessar Conta</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>
            </div>

            {/* TAB: SIGN IN */}
            <TabsContent value="signin" className="m-0 border-0 outline-none">
              <SignInForm onSuccess={handleSuccess} />
            </TabsContent>

            {/* TAB: SIGN UP */}
            <TabsContent value="signup" className="m-0 border-0 outline-none">
              <SignUpForm onSuccess={handleSuccess} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

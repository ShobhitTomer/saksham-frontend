import {  Menu, Shield } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
//import { Label } from "@/components/ui/label"

const DashboardLayout = () => {
  return (
    <div>
        <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Shield className="h-6 w-6" />
            <span className="sr-only">Saksham</span>
          </Link>
          <Link
            to="/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Saksham
          </Link>
          <Link
            to="/dashboard/users"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Users
          </Link>
          <Link
            to="/dashboard/fir"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            FIR
          </Link>
        
          <Link
            to="analysis"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Analysis
          </Link>
          
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Shield className="h-6 w-6" />
                <span className="sr-only">Saksham</span>
              </Link>
              <Link
                to="/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                to="/fir"
                className="text-muted-foreground hover:text-foreground"
              >
                FIR
              </Link>
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Users
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
   
      </header>
      <main className="flex items-center min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          
            <Outlet/>
         
      </main>
    </div>
    </div>
  )
}

export default DashboardLayout
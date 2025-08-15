
import React from "react"
import { cn } from "@/lib/utils"
import Header from "./header"
import Sidebar from "./sidebar"

interface LayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  sidebar?: boolean
  className?: string
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  sidebar = true,
  className
}) => {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header />
      
      <div className="flex">
        {sidebar && <Sidebar />}
        
        <main 
          className={cn(
            "flex-1 p-6 overflow-y-auto",
            !sidebar && "ml-0",
            className
          )}
          data-testid="main-content"
        >
          {(title || subtitle || actions) && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  {title && (
                    <h2 className="text-2xl font-bold text-white" data-testid="page-title">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-slate-400 mt-1" data-testid="page-subtitle">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center space-x-3">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  )
}

// Grid system for consistent layouts
interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: number
  className?: string
}

const Grid: React.FC<GridProps> = ({ 
  children, 
  cols = 1, 
  gap = 6, 
  className 
}) => {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
  }

  return (
    <div 
      className={cn(
        "grid",
        colsClass[cols],
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  )
}

const Section: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <section className={cn("space-y-6", className)}>
    {children}
  </section>
)

export { Layout, Grid, Section }

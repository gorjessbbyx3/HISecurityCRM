
import React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "bordered" | "ghost"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-slate-800 border border-slate-700",
    elevated: "bg-slate-800 border border-slate-700 shadow-lg",
    bordered: "bg-slate-800 border-2 border-slate-600",
    ghost: "bg-slate-800/50 border border-slate-700/50"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg text-card-foreground transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6
  }
>(({ className, level = 3, ...props }, ref) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <Component
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight text-white",
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Enhanced Card Variants
interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  loading?: boolean
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  loading,
  className
}) => (
  <Card variant="elevated" className={className}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? '...' : value}
          </p>
          {trend && (
            <div className={cn(
              "flex items-center mt-2 text-xs",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}>
              <span>{trend.isPositive ? '↗' : '↘'} {trend.value}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
)

interface ActionCardProps {
  title: string
  description?: string
  actions: Array<{
    label: string
    onClick: () => void
    variant?: "default" | "destructive" | "outline" | "secondary"
    icon?: React.ReactNode
  }>
  className?: string
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  actions,
  className
}) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle level={4}>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardFooter className="flex-wrap gap-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "default"}
          onClick={action.onClick}
          className="flex items-center gap-2"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </CardFooter>
  </Card>
)

interface ListCardProps {
  title: string
  items: Array<{
    id: string
    title: string
    description?: string
    badge?: {
      text: string
      variant?: string
    }
    action?: () => void
  }>
  onViewAll?: () => void
  loading?: boolean
  emptyMessage?: string
  className?: string
}

const ListCard: React.FC<ListCardProps> = ({
  title,
  items,
  onViewAll,
  loading,
  emptyMessage = "No items found",
  className
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle level={4}>{title}</CardTitle>
      {onViewAll && (
        <Button size="sm" onClick={onViewAll} variant="outline">
          View All
        </Button>
      )}
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-slate-700 h-16 rounded"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "bg-slate-700 p-4 rounded-lg transition-colors",
                item.action && "hover:bg-slate-600 cursor-pointer"
              )}
              onClick={item.action}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-white font-medium">{item.title}</h5>
                {item.badge && (
                  <Badge className={item.badge.variant}>
                    {item.badge.text}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-slate-300 text-sm">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatsCard,
  ActionCard,
  ListCard,
}

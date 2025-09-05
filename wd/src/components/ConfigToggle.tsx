"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Activity, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ConfigToggleProps {
  configKey: string
  title: string
  description: string
  defaultValue?: boolean
}

interface Configuration {
  id: string
  key: string
  value: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ConfigToggle({ configKey, title, description, defaultValue = true }: ConfigToggleProps) {
  const { toast } = useToast()
  const [config, setConfig] = useState<Configuration | null>(null)
  const [isEnabled, setIsEnabled] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch(`/api/admin/config?key=${configKey}`)
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setConfig(data.config)
          setIsEnabled(data.config.value === 'true')
        } else {
          // Create default configuration if it doesn't exist
          await createDefaultConfig()
        }
      }
    } catch (error) {
      console.error('Error fetching configuration:', error)
    }
  }

  const createDefaultConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: configKey,
          value: defaultValue.toString(),
          description
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
        setIsEnabled(defaultValue)
        toast({
          title: "Configuration Created",
          description: "Default configuration has been created.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create configuration.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleChange = async (checked: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: configKey,
          value: checked.toString(),
          description
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
        setIsEnabled(checked)
        toast({
          title: "Configuration Updated",
          description: `${title} has been ${checked ? 'enabled' : 'disabled'}.`,
        })
      } else {
        // Revert the toggle on failure
        setIsEnabled(!checked)
        toast({
          title: "Error",
          description: "Failed to update configuration.",
          variant: "destructive"
        })
      }
    } catch (error) {
      // Revert the toggle on failure
      setIsEnabled(!checked)
      toast({
        title: "Error",
        description: "Failed to update configuration.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {title}
          {config && (
            <Badge variant="secondary" className="ml-auto">
              <Activity className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={isEnabled ? "default" : "secondary"}>
                {isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {config && (
              <p className="text-xs text-gray-500">
                Last updated: {new Date(config.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleChange}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConfig}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
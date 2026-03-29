"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw, Settings, CheckCircle2, Plus, Trash2 } from "lucide-react"
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TimerPreset {
  id: string
  name: string
  focusMinutes: number
  breakMinutes: number
}

const defaultPresets: TimerPreset[] = [
  { id: "1", name: "Classic Pomodoro", focusMinutes: 25, breakMinutes: 5 },
  { id: "2", name: "Deep Work", focusMinutes: 50, breakMinutes: 10 },
  { id: "3", name: "Quick Sprint", focusMinutes: 15, breakMinutes: 3 },
]

export function ProductivityDashboard() {
  const [presets, setPresets] = useState<TimerPreset[]>(defaultPresets)
  const [activePreset, setActivePreset] = useState<TimerPreset>(defaultPresets[0])
  const [totalSeconds, setTotalSeconds] = useState(activePreset.focusMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  // New preset form state
  const [newPresetName, setNewPresetName] = useState("")
  const [newFocusMinutes, setNewFocusMinutes] = useState(25)
  const [newBreakMinutes, setNewBreakMinutes] = useState(5)

  const maxSeconds = isBreak ? activePreset.breakMinutes * 60 : activePreset.focusMinutes * 60
  const progress = ((maxSeconds - totalSeconds) / maxSeconds) * 100
  
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Chart data for Recharts RadialBarChart
  const chartData = [
    {
      name: "progress",
      value: progress,
      fill: isBreak ? "#FFCFCF" : "#86A788",
    },
  ]

  useEffect(() => {
    if (!isRunning) return
    
    const interval = setInterval(() => {
      setTotalSeconds(prev => {
        if (prev <= 0) {
          setIsRunning(false)
          // Auto switch to break or focus
          if (!isBreak) {
            setIsBreak(true)
            return activePreset.breakMinutes * 60
          } else {
            setIsBreak(false)
            return activePreset.focusMinutes * 60
          }
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isRunning, isBreak, activePreset])

  const handlePlayPause = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setIsBreak(false)
    setTotalSeconds(activePreset.focusMinutes * 60)
  }, [activePreset])

  const handlePresetSelect = useCallback((preset: TimerPreset) => {
    setActivePreset(preset)
    setIsRunning(false)
    setIsBreak(false)
    setTotalSeconds(preset.focusMinutes * 60)
  }, [])

  const handleAddPreset = useCallback(() => {
    if (!newPresetName.trim()) return
    
    const newPreset: TimerPreset = {
      id: Date.now().toString(),
      name: newPresetName,
      focusMinutes: newFocusMinutes,
      breakMinutes: newBreakMinutes,
    }
    
    setPresets(prev => [...prev, newPreset])
    setNewPresetName("")
    setNewFocusMinutes(25)
    setNewBreakMinutes(5)
  }, [newPresetName, newFocusMinutes, newBreakMinutes])

  const handleDeletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id))
    if (activePreset.id === id) {
      setActivePreset(defaultPresets[0])
      setTotalSeconds(defaultPresets[0].focusMinutes * 60)
    }
  }, [activePreset.id])

  return (
    <div className="rounded-2xl border border-strawberry-light/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {isBreak ? "Break Time" : "Focus Session"}
          </p>
          <h3 className="text-lg font-semibold text-foreground">{activePreset.name}</h3>
        </div>
        
        {/* Settings Button */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <button className="rounded-lg p-2 transition-colors hover:bg-strawberry-light">
              <Settings className="size-5 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Timer Settings</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Preset Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Presets</Label>
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div 
                      key={preset.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                        activePreset.id === preset.id 
                          ? "border-matcha bg-matcha-light/30" 
                          : "border-border hover:border-matcha/50"
                      }`}
                    >
                      <button
                        onClick={() => handlePresetSelect(preset)}
                        className="flex flex-1 flex-col items-start text-left"
                      >
                        <span className="font-medium text-foreground">{preset.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {preset.focusMinutes}min focus / {preset.breakMinutes}min break
                        </span>
                      </button>
                      {!defaultPresets.find(p => p.id === preset.id) && (
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="ml-2 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Preset */}
              <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
                <Label className="text-sm font-medium">Create New Preset</Label>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="preset-name" className="text-xs text-muted-foreground">
                      Preset Name
                    </Label>
                    <Input
                      id="preset-name"
                      placeholder="My Custom Timer"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      className="border-border"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="focus-minutes" className="text-xs text-muted-foreground">
                        Focus (minutes)
                      </Label>
                      <Input
                        id="focus-minutes"
                        type="number"
                        min={1}
                        max={120}
                        value={newFocusMinutes}
                        onChange={(e) => setNewFocusMinutes(Number(e.target.value))}
                        className="border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="break-minutes" className="text-xs text-muted-foreground">
                        Break (minutes)
                      </Label>
                      <Input
                        id="break-minutes"
                        type="number"
                        min={1}
                        max={30}
                        value={newBreakMinutes}
                        onChange={(e) => setNewBreakMinutes(Number(e.target.value))}
                        className="border-border"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAddPreset}
                    disabled={!newPresetName.trim()}
                    className="w-full bg-matcha text-white hover:bg-matcha/90"
                  >
                    <Plus className="mr-2 size-4" />
                    Add Preset
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timer Circle with Recharts */}
      <div className="mb-6 flex justify-center">
        <div className="relative flex size-40 items-center justify-center">
          <RadialBarChart
            width={160}
            height={160}
            cx={80}
            cy={80}
            innerRadius={60}
            outerRadius={75}
            barSize={12}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "#FFE2E2" }}
              dataKey="value"
              cornerRadius={10}
              angleAxisId={0}
            />
          </RadialBarChart>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold text-foreground">{formattedTime}</span>
            <span className="text-xs text-muted-foreground">
              {isBreak ? "break" : "remaining"}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mb-6 flex items-center justify-center gap-3">
        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="flex size-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-all hover:border-matcha hover:text-matcha"
          aria-label="Reset timer"
        >
          <RotateCcw className="size-4" />
        </button>
        
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="flex size-14 items-center justify-center rounded-full bg-matcha text-white shadow-lg transition-all hover:bg-matcha/90 hover:shadow-xl"
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? (
            <Pause className="size-6 fill-current" />
          ) : (
            <Play className="size-6 translate-x-0.5 fill-current" />
          )}
        </button>
        
        {/* Settings Button (Mobile) */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <button
              className="flex size-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-all hover:border-matcha hover:text-matcha"
              aria-label="Timer settings"
            >
              <Settings className="size-4" />
            </button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Tasks Preview */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Up Next
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg bg-strawberry-light/50 p-3">
            <CheckCircle2 className="size-5 text-matcha" />
            <span className="text-sm font-medium text-foreground">Review design mockups</span>
            <span className="ml-auto rounded bg-strawberry px-2 py-0.5 text-xs font-medium">25m</span>
          </div>
          
          <div className="flex items-center gap-3 rounded-lg border border-strawberry-light/50 bg-white/50 p-3">
            <div className="size-5 rounded-full border-2 border-matcha/30" />
            <span className="text-sm text-muted-foreground">Write weekly report</span>
            <span className="ml-auto rounded bg-muted px-2 py-0.5 text-xs">45m</span>
          </div>
        </div>
      </div>
    </div>
  )
}

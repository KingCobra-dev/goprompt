import { useState } from 'react'
import supabase from '../lib/supabaseClient'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess?: () => void
}
export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setSuccessMessage('')
    setErrorMessage('')
    setIsSigningIn(false)
    setIsSigningUp(false)
  }
  const handleClose = () => {
    resetForm()
    onClose()
  }
  const handleSignIn = async () => {
     try {
      setErrorMessage('')
      setSuccessMessage('')
      setIsSigningIn(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setSuccessMessage('Signed in successfully!')
      onAuthSuccess?.()
      setTimeout(() => handleClose(), 800)
    } catch (err: any) {
      setSuccessMessage('')
      setErrorMessage(err?.message || 'Sign in failed')
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignUp = async () => {
     try {
      setErrorMessage('')
      setSuccessMessage('')
      setIsSigningUp(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      })
      if (error) throw error
      setSuccessMessage('Check your email to confirm your account.')
      onAuthSuccess?.()
    } catch (err: any) {
      setSuccessMessage('')
      setErrorMessage(err?.message || 'Sign up failed')
    } finally {
      setIsSigningUp(false)
    }
  }

  // GitHub OAuth intentionally disabled for now

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to PromptsGo</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSigningIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Input
                   id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSigningIn}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSigningIn}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
               </div>
            <Button onClick={handleSignIn} className="w-full" disabled={isSigningIn || !email || !password}>
              {isSigningIn ? (
                <span className="inline-flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </TabsContent>
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input
                id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSigningUp}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSigningUp}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              </div>
            <Button onClick={handleSignUp} className="w-full" disabled={isSigningUp || !email || !password}>
              {isSigningUp ? (
                <span className="inline-flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  )
}
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"

const LoginUser = () => {
  const navigate = useNavigate();
  const handleNavigate =()=>{
    navigate('/dashboard')
  }
  return (
    <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">User Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleNavigate} className="w-full">Sign in</Button>
      </CardFooter>
    </Card>
    </div>
  )
}

export default LoginUser
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
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const SignUp = () => {
  const [email,setEmail] =useState<string>("");
  const [password, setPassowrd]=useState<string>("");
  const [role, setRole]= useState<string>("");

  const navigate = useNavigate();

  const handleSubmit =async()=>{
    try{
      const response = await fetch("http://localhost:5001/api/v1/admin/signup",{
        method:"POST",
        headers:
        {"Content-Type":"application/json"},
        body:JSON.stringify({email,password,role})
      })
      if(response.ok){
        const data = await response.json();
        const token = data.token;
        localStorage.setItem("token",token);
        console.log("Token",token)
        toast.success("Signup Successfully");
        navigate("/dashboard");
      }

    }catch(error){
      toast.error("Signup Failed");
      console.log("Failed to SignUp",error)
    }
  }
  return (
    <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Signup</CardTitle>
        <CardDescription>
          Enter your email below to create a new account .
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" onChange={(e)=>setEmail(e.target.value)} placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" onChange={(e)=>setPassowrd(e.target.value)} type="password" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="text"> Role</Label>
          <Input id ="role" onChange={(e)=>setRole(e.target.value)} type="Role" required />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">Sign Up</Button>
      </CardFooter>
    </Card>
    </div>
  )
}

export default SignUp
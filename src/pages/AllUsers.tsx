// AllUsers.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"

interface User {
  id: number
  email: string
  role: string
}

const AllUsers = () => {
  const [showUserList, setShowUserList] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const navigate = useNavigate()

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/v1/admin/getAllUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setUsers(data)
      setShowUserList(true)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">User Management Dashboard</h1>
      
      <Card className="mb-8 max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">Only Admins can delete and add users!</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Button onClick={fetchUsers}>List Users</Button>
          <Button onClick={() => navigate("adduser")}>Add User</Button>
          <Button onClick={() => navigate("/dashboard/users/deleteuser")} variant="destructive">
            Delete User
          </Button>
        </CardContent>
      </Card>

      {showUserList && (
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardTitle>Currently Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Sr. No.</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AllUsers
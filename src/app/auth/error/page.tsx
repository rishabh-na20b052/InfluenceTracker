import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Authentication Error
          </CardTitle>
          <CardDescription>
            There was an error with the authentication process. This could be
            due to an expired or invalid link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Please try the following:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Check if the link has expired</li>
              <li>• Request a new verification email</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>
        </CardContent>
        <CardContent className="flex flex-col space-y-2">
          <Link href="/auth/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" className="w-full">
              Create New Account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

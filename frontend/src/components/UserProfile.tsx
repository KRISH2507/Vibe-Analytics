import { useMe } from "@/hooks/useMe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function UserProfile() {
  const { data, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading user data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : "Unauthorized - please login again"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No user data available</AlertDescription>
      </Alert>
    );
  }

  const user = data.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Name</p>
          <p className="text-lg font-semibold">{user.name || "Not set"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Email</p>
          <p className="text-lg">{user.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Plan</p>
          <p className="text-lg font-semibold capitalize text-blue-600">{user.plan}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Auth Provider</p>
          <p className="text-lg capitalize">{user.auth_provider}</p>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-navy-700 rounded-lg flex items-center justify-center mb-6 mx-auto">
          <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">404 - Page Not Found</h1>
        <p className="text-slate-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/dashboard">
          <Button className="bg-gold-500 hover:bg-gold-600 text-black">
            <i className="fas fa-home mr-2"></i>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

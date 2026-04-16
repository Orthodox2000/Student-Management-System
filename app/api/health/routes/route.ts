export async function GET() {
  return Response.json({
    service: "student-management-system",
    routes: [
      "POST /api/auth/admin-login",
      "POST /api/auth/logout",
      "GET /api/auth/me",
      "GET /api/health",
      "GET /api/health/live",
      "GET /api/health/ready",
      "GET /api/health/routes",
      "GET /api/health/self-test",
      "GET /api/students",
      "GET /api/students/:id",
      "POST /api/students",
      "POST /api/students/seed",
      "PUT /api/students/:id",
      "DELETE /api/students/:id",
    ],
  });
}
